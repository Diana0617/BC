const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/AppointmentController');
const { authenticateToken } = require('../middleware/auth');
const { Appointment, Service, ConsentSignature, ConsentTemplate, Client, Business } = require('../models');
const { generateConsentPDF } = require('../utils/consentPdfGenerator');
const path = require('path');
const fs = require('fs').promises;
// const tenancyMiddleware = require('../middleware/tenancy');
// const { allStaffRoles } = require('../middleware/roleCheck');

// Todas las rutas de citas requieren autenticación
router.use(authenticateToken);
// router.use(tenancyMiddleware);
// router.use(allStaffRoles);

// Obtener lista de citas
router.get('/', AppointmentController.getAppointments);

// Obtener resumen de turnos del día
router.get('/summary/today', AppointmentController.getTodaySummary);

// Obtener citas por rango de fechas (debe ir ANTES de '/:id' para evitar conflictos)
router.get('/date-range', AppointmentController.getAppointmentsByDateRange);

// Crear nueva cita
router.post('/', AppointmentController.createAppointment);

// Obtener cita por ID
router.get('/:id', AppointmentController.getAppointmentDetail);

// Actualizar cita
router.put('/:id', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de actualizar cita aún no implementada'
  });
});

// Cancelar cita
router.patch('/:id/cancel', AppointmentController.updateAppointmentStatus);

// Iniciar cita (cambiar a IN_PROGRESS)
router.post('/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    // Obtener businessId del query o del usuario autenticado
    const businessId = req.query.businessId || req.user?.businessId;
    
    if (!businessId) {
      return res.status(400).json({
        success: false,
        error: 'businessId es requerido'
      });
    }

    const where = { id, businessId };

    // Aplicar filtros de acceso según el rol
    if (req.specialist) {
      where.specialistId = req.specialist.id;
    }

    const appointment = await Appointment.findOne({ where });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Cita no encontrada'
      });
    }

    // Validar que esté en estado PENDING o CONFIRMED
    if (!['PENDING', 'CONFIRMED'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        error: `No se puede iniciar una cita en estado ${appointment.status}`
      });
    }

    // Actualizar a IN_PROGRESS
    await appointment.update({
      status: 'IN_PROGRESS',
      startedAt: new Date()
    });

    return res.json({
      success: true,
      message: 'Cita iniciada exitosamente',
      data: appointment
    });

  } catch (error) {
    console.error('Error al iniciar cita:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Completar cita con pago
router.post('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    // Obtener businessId del query o del usuario autenticado
    const businessId = req.query.businessId || req.user?.businessId;
    
    if (!businessId) {
      return res.status(400).json({
        success: false,
        error: 'businessId es requerido'
      });
    }
    const { payment, notes } = req.body;

    console.log('🔵 POST /appointments/:id/complete - Iniciando...');
    console.log('🔵 Appointment ID:', id);
    console.log('🔵 Business ID:', businessId);

    const where = { id, businessId };

    // Aplicar filtros de acceso según el rol
    if (req.specialist) {
      where.specialistId = req.specialist.id;
      console.log('🔵 Specialist ID:', req.specialist.id);
    }

    const appointment = await Appointment.findOne({ 
      where,
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'requiresConsent', 'consentTemplateId']
        }
      ]
    });

    if (!appointment) {
      console.log('❌ Cita no encontrada');
      return res.status(404).json({
        success: false,
        error: 'Cita no encontrada'
      });
    }

    console.log('🔍 Appointment encontrado:', {
      id: appointment.id,
      status: appointment.status,
      hasConsent: appointment.hasConsent,
      service: appointment.service ? {
        id: appointment.service.id,
        name: appointment.service.name,
        requiresConsent: appointment.service.requiresConsent
      } : null
    });

    // Validar que esté en estado IN_PROGRESS
    if (appointment.status !== 'IN_PROGRESS') {
      console.log('❌ Estado inválido:', appointment.status);
      return res.status(400).json({
        success: false,
        error: `No se puede completar una cita en estado ${appointment.status}. Debe estar en progreso.`
      });
    }

    // VALIDACIÓN OBLIGATORIA: Consentimiento
    if (appointment.service?.requiresConsent && !appointment.hasConsent) {
      console.log('❌ FALTA CONSENTIMIENTO OBLIGATORIO');
      console.log('❌ Service requiresConsent:', appointment.service.requiresConsent);
      console.log('❌ Appointment hasConsent:', appointment.hasConsent);
      return res.status(400).json({
        success: false,
        error: `El servicio "${appointment.service.name}" requiere consentimiento firmado antes de completar la cita.`,
        requiresConsent: true
      });
    }

    console.log('✅ Validación de consentimiento pasada');

    // Actualizar a COMPLETED
    const updateData = {
      status: 'COMPLETED',
      completedAt: new Date()
    };

    if (notes) {
      updateData.specialistNotes = notes;
    }

    // Si se proporciona información de pago, actualizar el estado de pago
    if (payment) {
      console.log('💳 Procesando pago:', payment);
      updateData.paymentStatus = 'PAID';
      updateData.paidAt = new Date();
    }

    console.log('📝 Actualizando appointment con:', updateData);

    await appointment.update(updateData);

    console.log('✅ Cita completada exitosamente');

    return res.json({
      success: true,
      message: 'Cita completada exitosamente',
      data: appointment
    });

  } catch (error) {
    console.error('❌ Error al completar cita:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Procesar pago de cita
router.post('/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { businessId, paymentMethodId, amount, discount, notes } = req.body;
    
    if (!businessId) {
      return res.status(400).json({
        success: false,
        error: 'businessId es requerido'
      });
    }

    if (!paymentMethodId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Método de pago y monto son requeridos'
      });
    }

    const where = { id, businessId };

    // Aplicar filtros de acceso según el rol
    if (req.specialist) {
      where.specialistId = req.specialist.id;
    }

    const appointment = await Appointment.findOne({ where });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Cita no encontrada'
      });
    }

    // Validar que esté en estado IN_PROGRESS o COMPLETED
    if (!['IN_PROGRESS', 'COMPLETED'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        error: `No se puede procesar el pago de una cita en estado ${appointment.status}`
      });
    }

    // Calcular el monto total con descuento
    const totalDiscount = (appointment.discountAmount || 0) + (discount || 0);
    const finalAmount = Math.max(0, amount - (discount || 0));

    // Actualizar appointment con información de pago
    await appointment.update({
      paymentStatus: 'PAID',
      paidAmount: finalAmount,
      discountAmount: totalDiscount,
      paymentMethodId,
      paidAt: new Date(),
      specialistNotes: notes || appointment.specialistNotes
    });

    console.log('✅ Pago procesado exitosamente:', {
      appointmentId: id,
      amount: finalAmount,
      discount: totalDiscount
    });

    return res.json({
      success: true,
      message: 'Pago procesado exitosamente',
      data: appointment
    });

  } catch (error) {
    console.error('❌ Error al procesar pago:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// Subir evidencia de cita
router.post('/:id/evidence', async (req, res) => {
  try {
    const { id } = req.params;
    const { businessId } = req.query;
    const { evidence } = req.body; // { before: [], after: [], documents: [] }

    if (!evidence) {
      return res.status(400).json({
        success: false,
        error: 'Datos de evidencia requeridos'
      });
    }

    const where = { id, businessId };

    // Aplicar filtros de acceso según el rol
    if (req.specialist) {
      where.specialistId = req.specialist.id;
    }

    const appointment = await Appointment.findOne({ where });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Turno no encontrado'
      });
    }

    // Actualizar evidencia
    // Merge con evidencia existente si la hay
    const currentEvidence = appointment.evidence || { before: [], after: [], documents: [] };
    const updatedEvidence = {
      before: [...(currentEvidence.before || []), ...(evidence.before || [])],
      after: [...(currentEvidence.after || []), ...(evidence.after || [])],
      documents: [...(currentEvidence.documents || []), ...(evidence.documents || [])]
    };

    await appointment.update({
      evidence: updatedEvidence
    });

    console.log(`✅ Evidencia actualizada para turno ${id}`);

    return res.json({
      success: true,
      message: 'Evidencia guardada exitosamente',
      data: appointment
    });

  } catch (error) {
    console.error('Error al subir evidencia:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /:id/consent - Capturar consentimiento firmado
router.post('/:id/consent', async (req, res) => {
  try {
    const { id } = req.params;
    const { businessId } = req.query;
    const { clientData, serviceInfo, consentTemplate, capturedBy } = req.body;

    console.log('📝 POST /appointments/:id/consent');
    console.log('📝 Appointment ID:', id);
    console.log('📝 Client Data:', clientData);

    // Buscar el appointment
    const appointment = await Appointment.findOne({
      where: { id, businessId },
      include: [
        { model: Service, as: 'service' },
        { model: Client, as: 'client' }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Cita no encontrada'
      });
    }

    // Crear la firma de consentimiento
    const consentSignature = await ConsentSignature.create({
      businessId,
      customerId: appointment.clientId,
      consentTemplateId: appointment.service.consentTemplateId,
      appointmentId: id,
      serviceId: appointment.serviceId,
      templateVersion: consentTemplate?.version || '1.0',
      templateContent: consentTemplate?.content || clientData.consentText,
      signedBy: clientData.clientName,
      signatureData: clientData.signature, // Firma en base64
      signatureType: 'DIGITAL',
      signedAt: new Date(),
      editableFieldsData: {
        clientIdNumber: clientData.clientId,
        agreedToTerms: clientData.agreedToTerms,
        agreedToTreatment: clientData.agreedToTreatment,
        agreedToPhotos: clientData.agreedToPhotos,
        ...clientData.editableFields // Campos dinámicos del template (alergias, medicamentos, etc.)
      },
      ipAddress: req.ip,
      deviceInfo: req.headers['user-agent']
    });

    console.log('✅ Consentimiento capturado:', consentSignature.id);

    // Generar PDF automáticamente
    try {
      console.log('📄 Generando PDF del consentimiento...');
      
      // Recargar con todas las relaciones necesarias para el PDF
      const signatureWithIncludes = await ConsentSignature.findByPk(consentSignature.id, {
        include: [
          {
            model: ConsentTemplate,
            as: 'template'
          },
          {
            model: Client,
            as: 'customer'
          },
          {
            model: Business,
            as: 'business'
          },
          {
            model: Service,
            as: 'service'
          }
        ]
      });

      // Generar el PDF
      const pdfBuffer = await generateConsentPDF(signatureWithIncludes);

      // Guardar PDF en filesystem (temporal - TODO: mover a Cloudinary en producción)
      const uploadsDir = path.join(__dirname, '../../uploads/consents');
      await fs.mkdir(uploadsDir, { recursive: true });
      
      const pdfFilename = `consent_${consentSignature.id}_${Date.now()}.pdf`;
      const pdfPath = path.join(uploadsDir, pdfFilename);
      
      await fs.writeFile(pdfPath, pdfBuffer);

      // Actualizar consentSignature con la URL del PDF
      const pdfUrl = `/uploads/consents/${pdfFilename}`;
      await consentSignature.update({
        pdfUrl,
        pdfGeneratedAt: new Date()
      });

      console.log('✅ PDF generado exitosamente:', pdfUrl);

    } catch (pdfError) {
      console.error('⚠️ Error generando PDF (continuando sin PDF):', pdfError);
      // No fallar la request si el PDF falla - el consentimiento ya está guardado
    }

    // Actualizar el appointment
    await appointment.update({
      hasConsent: true,
      consentSignedAt: new Date(),
      // consentSignatureId eliminado del modelo
    });

    return res.json({
      success: true,
      message: 'Consentimiento capturado exitosamente',
      data: {
        consentSignature: {
          id: consentSignature.id,
          signedBy: consentSignature.signedBy,
          signedAt: consentSignature.signedAt,
          pdfUrl: consentSignature.pdfUrl,
          pdfGeneratedAt: consentSignature.pdfGeneratedAt
        },
        appointment: {
          id: appointment.id,
          hasConsent: appointment.hasConsent,
          consentSignedAt: appointment.consentSignedAt
        }
      }
    });

  } catch (error) {
    console.error('❌ Error capturando consentimiento:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al capturar consentimiento',
      details: error.message
    });
  }
});

module.exports = router;