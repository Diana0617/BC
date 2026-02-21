const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/AppointmentController');
const { authenticateToken } = require('../middleware/auth');
const { Appointment, Service, ConsentSignature, ConsentTemplate, Client, Business } = require('../models');
const { generateConsentPDF } = require('../utils/consentPdfGenerator');
const CloudinaryService = require('../services/CloudinaryService');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
// const tenancyMiddleware = require('../middleware/tenancy');
// const { allStaffRoles } = require('../middleware/roleCheck');

// Todas las rutas de citas requieren autenticación
router.use(authenticateToken);
// router.use(tenancyMiddleware);
// router.use(allStaffRoles);

// Configuración de multer para evidencias
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPG, PNG, WEBP)'), false);
    }
  }
});

// Obtener lista de citas
router.get('/', AppointmentController.getAppointments);

// Obtener resumen de turnos del día
router.get('/summary/today', AppointmentController.getTodaySummary);

// Obtener citas por rango de fechas (debe ir ANTES de '/:id' para evitar conflictos)
router.get('/date-range', AppointmentController.getAppointmentsByDateRange);

// Procesar turnos sin asistencia (No Shows) - Admin only
router.post('/process-no-shows', AppointmentController.processNoShows);

// Obtener estadísticas de No Shows
router.get('/no-show-stats/:businessId', AppointmentController.getNoShowStats);

// Obtener historial de citas de un cliente específico
router.get('/client/:clientId', AppointmentController.getClientAppointments);

// Crear nueva cita
router.post('/', AppointmentController.createAppointment);

// Obtener cita por ID
router.get('/:id', AppointmentController.getAppointmentDetail);

// Actualizar cita (incluyendo modificar servicios durante el turno)
// Body puede incluir: serviceIds (array), startTime, endTime, specialistId, branchId, notes
router.put('/:id', AppointmentController.updateAppointment);

// 🆕 Verificar disponibilidad para cambio de horario (sin guardar cambios)
router.post('/:id/check-availability', AppointmentController.checkAvailability);

// Cancelar cita
router.patch('/:id/cancel', AppointmentController.updateAppointmentStatus);

// Actualizar estado de cita (genérico para PENDING -> CONFIRMED, etc.)
router.patch('/:id/status', AppointmentController.updateAppointmentStatus);

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

    if (!paymentMethodId || amount === undefined || amount === null || amount === '') {
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

    const appointment = await Appointment.findOne({ 
      where,
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'price']
        },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
        }
      ]
    });

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

    // Convertir a números y limpiar cualquier formato
    const numericAmount = parseFloat(amount) || 0;
    const numericDiscount = parseFloat(discount) || 0;
    const currentDiscount = parseFloat(appointment.discountAmount) || 0;

    // Calcular el monto total con descuento
    const totalDiscount = currentDiscount + numericDiscount;
    const finalAmount = Math.max(0, numericAmount - numericDiscount);

    // Actualizar appointment con información de pago
    await appointment.update({
      paymentStatus: 'PAID',
      paidAmount: finalAmount,
      discountAmount: totalDiscount,
      paymentMethodId,
      paidAt: new Date(),
      specialistNotes: notes || appointment.specialistNotes
    });

    // 💰 Crear registro en FinancialMovement
    const FinancialMovement = require('../models/FinancialMovement');
    const AppointmentPayment = require('../models/AppointmentPayment');
    const PaymentMethod = require('../models/PaymentMethod');
    
    // ✅ FIX: Consultar tabla payment_methods directamente
    console.log('💳 [appointments/payment] Buscando PaymentMethod con ID:', paymentMethodId);
    
    let paymentMethodType = 'CASH'; // default
    let paymentMethodName = 'Efectivo'; // default
    
    try {
      const foundPaymentMethod = await PaymentMethod.findOne({
        where: {
          id: paymentMethodId,
          businessId,
          isActive: true
        }
      });
      
      if (foundPaymentMethod) {
        paymentMethodType = foundPaymentMethod.type; // TRANSFER, CASH, CARD, QR, etc.
        paymentMethodName = foundPaymentMethod.name; // "Transferencia", "Efectivo", etc.
        console.log('✅ [appointments/payment] Método encontrado:', {
          id: foundPaymentMethod.id,
          name: paymentMethodName,
          type: paymentMethodType
        });
      } else {
        console.warn('⚠️ [appointments/payment] PaymentMethod no encontrado, usando CASH por defecto');
      }
    } catch (error) {
      console.error('❌ [appointments/payment] Error consultando PaymentMethod:', error);
      console.warn('⚠️ [appointments/payment] Usando CASH por defecto');
    }
    
    // 🧾 Crear registro de AppointmentPayment (necesario para el recibo)
    await AppointmentPayment.create({
      appointmentId: appointment.id,
      businessId,
      clientId: appointment.clientId,
      paymentMethodId,
      paymentMethodName,
      paymentMethodType,
      amount: finalAmount,
      reference: null,
      notes: notes || null,
      proofUrl: null,
      proofType: null,
      status: 'COMPLETED',
      registeredBy: req.user.id,
      registeredByRole: req.user.role,
      paymentDate: new Date(),
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });
    
    await FinancialMovement.create({
      businessId,
      type: 'INCOME',
      category: 'APPOINTMENT',
      amount: finalAmount,
      paymentMethod: paymentMethodType,
      description: `Pago de cita - ${appointment.service?.name || 'Servicio'}`,
      referenceId: appointment.id,
      referenceType: 'APPOINTMENT',
      transactionId: paymentMethodId, // Guardamos el ID del método de pago personalizado aquí
      userId: req.user.id,
      clientId: appointment.clientId,
      status: 'COMPLETED',
      notes: notes || null
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

// Subir archivo de evidencia a Cloudinary
router.post('/:id/evidence/upload', upload.single('file'), async (req, res) => {
  let tempFilePath = null;
  
  try {
    const { id } = req.params;
    const businessId = req.query.businessId || req.user?.businessId;
    const { type } = req.body; // 'before' | 'after' | 'process'

    if (!businessId) {
      return res.status(400).json({
        success: false,
        error: 'businessId es requerido'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Archivo requerido'
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

    // Escribir buffer a archivo temporal
    const uploadsDir = path.join(__dirname, '../../uploads/temp');
    await fs.mkdir(uploadsDir, { recursive: true });
    
    const tempFileName = `evidence_${Date.now()}_${Math.random().toString(36).substring(7)}${path.extname(req.file.originalname)}`;
    tempFilePath = path.join(uploadsDir, tempFileName);
    
    await fs.writeFile(tempFilePath, req.file.buffer);

    // Subir a Cloudinary usando el servicio existente
    const evidenceType = type || 'before';
    const uploadResult = await CloudinaryService.uploadAppointmentEvidence(
      tempFilePath,
      id,
      evidenceType
    );
    
    // El servicio ya elimina el archivo temporal, marcarlo como null
    tempFilePath = null;

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Error al subir evidencia a Cloudinary');
    }

    const evidenceData = {
      url: uploadResult.data.main.url,
      publicId: uploadResult.data.main.public_id,
      thumbnail: uploadResult.data.thumbnail.url,
      type: evidenceType,
      uploadedAt: new Date(),
      uploadedBy: req.user.id
    };

    // Actualizar evidencia en el appointment
    const currentEvidence = appointment.evidence || { before: [], after: [], process: [] };
    
    if (!currentEvidence[evidenceType]) {
      currentEvidence[evidenceType] = [];
    }
    
    currentEvidence[evidenceType].push(evidenceData);

    await appointment.update({
      evidence: currentEvidence
    });

    console.log(`✅ Evidencia subida para turno ${id}:`, evidenceData.url);

    return res.json({
      success: true,
      message: 'Evidencia subida exitosamente',
      data: evidenceData
    });

  } catch (error) {
    console.error('Error al subir evidencia:', error);
    
    // Limpiar archivo temporal en caso de error
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (unlinkError) {
        console.error('Error eliminando archivo temporal:', unlinkError);
      }
    }
    
    return res.status(500).json({
      success: false,
      error: 'Error al subir archivo',
      details: error.message
    });
  }
});

// Subir evidencia de cita (deprecated - usar /evidence/upload)
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

    // Cargar el template de consentimiento
    const templateId = appointment.service.consentTemplateId;
    if (!templateId) {
      return res.status(400).json({
        success: false,
        error: 'El servicio no tiene un template de consentimiento configurado'
      });
    }

    const template = await ConsentTemplate.findByPk(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template de consentimiento no encontrado'
      });
    }

    // Crear la firma de consentimiento
    const consentSignature = await ConsentSignature.create({
      businessId,
      customerId: appointment.clientId,
      consentTemplateId: templateId,
      appointmentId: id,
      serviceId: appointment.serviceId,
      templateVersion: template.version,
      templateContent: template.content,
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

      // Guardar PDF temporalmente para subir a Cloudinary
      const uploadsDir = path.join(__dirname, '../../uploads/temp');
      await fs.mkdir(uploadsDir, { recursive: true });
      
      const pdfFilename = `consent_${consentSignature.id}_${Date.now()}.pdf`;
      const tempPdfPath = path.join(uploadsDir, pdfFilename);
      
      await fs.writeFile(tempPdfPath, pdfBuffer);

      // Subir a Cloudinary
      const { uploadConsentDocument } = require('../config/cloudinary');
      const uploadResult = await uploadConsentDocument(
        tempPdfPath,
        businessId,
        consentSignature.id
      );

      // Eliminar archivo temporal
      await fs.unlink(tempPdfPath);

      // Actualizar consentSignature con la URL del PDF
      await consentSignature.update({
        pdfUrl: uploadResult.secure_url,
        pdfGeneratedAt: new Date()
      });

      console.log('✅ PDF generado exitosamente:', uploadResult.secure_url);

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