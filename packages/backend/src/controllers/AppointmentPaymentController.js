const { Appointment, Service, Client, Business, SpecialistProfile } = require('../models');
const { Op } = require('sequelize');
const { cloudinary } = require('../config/cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

/**
 * Controlador para gestión de pagos en citas
 * Permite registrar comprobantes cuando el negocio no usa Wompi
 */
class AppointmentPaymentController {

  /**
   * Configuración de multer para comprobantes de pago
   */
  static getPaymentProofMulter() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/temp');
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `payment-proof-${uniqueSuffix}${extension}`);
      }
    });

    const fileFilter = (req, file, cb) => {
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
      }
    };

    return multer({
      storage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB máximo
      },
      fileFilter
    });
  }

  /**
   * Registrar pago de cita con comprobante
   * POST /api/appointments/:appointmentId/payment
   */
  static async recordPayment(req, res) {
    try {
      const { appointmentId } = req.params;
      const { businessId } = req.body;
      
      console.log('💳 [recordPayment] Iniciando registro de pago');
      console.log('💳 [recordPayment] appointmentId:', appointmentId);
      console.log('💳 [recordPayment] req.body:', JSON.stringify(req.body, null, 2));
      console.log('💳 [recordPayment] paymentMethodId:', req.body.paymentMethodId);
      console.log('💳 [recordPayment] paymentMethod:', req.body.paymentMethod);
      
      // Verificar que el especialista tenga acceso a la cita
      // RECEPTIONIST_SPECIALIST puede cobrar citas de cualquier especialista del negocio
      const appointmentWhere = { id: appointmentId, businessId };
      if (req.user.role === 'SPECIALIST' || req.user.role === 'BUSINESS_SPECIALIST') {
        appointmentWhere.specialistId = req.specialist.id;
      }
      const appointment = await Appointment.findOne({
        where: appointmentWhere,
        include: [
          {
            model: Service,
            attributes: ['id', 'name', 'price']
          },
          {
            model: Business,
            attributes: ['id', 'name', 'paymentMethods']
          }
        ]
      });

      if (!appointment) {
        console.error('❌ [recordPayment] Cita NO encontrada. where:', JSON.stringify(appointmentWhere));
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }
      console.log('✅ [recordPayment] Cita encontrada:', appointment.id, '| totalAmount:', appointment.totalAmount, '| specialistId:', appointment.specialistId);

      const {
        paymentMethod,
        paymentMethodId,
        amount,
        currency = 'COP',
        notes,
        transactionId
      } = req.body;
      
      console.log('💳 [recordPayment] Datos extraídos - paymentMethod:', paymentMethod, 'paymentMethodId:', paymentMethodId);
      
      // ✅ CORREGIDO: Si viene paymentMethodId, SIEMPRE buscar en DB (ignorar paymentMethod del body)
      let resolvedPaymentMethod = paymentMethod;
      let paymentMethodName = null;
      let paymentMethodType = null;
      
      if (paymentMethodId) {
        // Si viene paymentMethodId, consultar la base de datos para obtener el tipo y nombre correctos
        console.log('💳 [recordPayment] Buscando PaymentMethod con ID:', paymentMethodId);
        
        const PaymentMethod = require('../models/PaymentMethod');
        const foundPaymentMethod = await PaymentMethod.findOne({
          where: {
            id: paymentMethodId,
            businessId,
            isActive: true
          }
        });
        
        if (!foundPaymentMethod) {
          console.error('❌ [recordPayment] Método de pago no encontrado:', paymentMethodId);
          return res.status(400).json({
            success: false,
            error: 'Método de pago no válido o inactivo'
          });
        }
        
        // Usar los valores de la base de datos (ignora cualquier valor en paymentMethod del body)
        resolvedPaymentMethod = foundPaymentMethod.type; // CASH, CARD, TRANSFER, etc.
        paymentMethodName = foundPaymentMethod.name; // "Efectivo", "Transferencia", etc.
        paymentMethodType = foundPaymentMethod.type;
        
        console.log('✅ [recordPayment] Método encontrado:', {
          id: foundPaymentMethod.id,
          name: paymentMethodName,
          type: paymentMethodType
        });
      } else if (paymentMethod) {
        // Si no viene paymentMethodId pero sí paymentMethod (legacy/manual), usar ese valor
        console.log('⚠️ [recordPayment] Usando paymentMethod legacy:', paymentMethod);
        paymentMethodName = paymentMethod;
        paymentMethodType = paymentMethod;
      } else {
        // Si no viene ni paymentMethodId ni paymentMethod, error
        console.error('❌ [recordPayment] No se proporcionó método de pago');
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar un método de pago'
        });
      }

      // Nota: No validamos contra un enum hardcodeado porque los negocios pueden crear
      // sus propios métodos de pago. La validación ya se hizo al buscar en la BD.

      // Validar monto — se permite 0 para servicios gratuitos/cortesía
      const paymentAmount = parseFloat(amount);
      console.log('💰 [recordPayment] amount recibido:', amount, '| parseFloat:', paymentAmount);
      if (isNaN(paymentAmount) || paymentAmount < 0) {
        console.error('❌ [recordPayment] Monto inválido:', amount);
        return res.status(400).json({
          success: false,
          error: 'Monto de pago inválido'
        });
      }
      console.log('✅ [recordPayment] Monto válido:', paymentAmount);

      let proofUrl = null;
      let proofPublicId = null;

      // Subir comprobante si se proporcionó
      if (req.file) {
        try {
          const resourceType = req.file.mimetype === 'application/pdf' ? 'raw' : 'image';
          
          const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: resourceType,
            folder: `beauty-control/appointments/${appointmentId}/payment-proofs`,
            public_id: `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            quality: resourceType === 'image' ? 'auto:good' : undefined,
            fetch_format: resourceType === 'image' ? 'auto' : undefined
          });

          proofUrl = result.secure_url;
          proofPublicId = result.public_id;

          // Eliminar archivo temporal
          await fs.unlink(req.file.path).catch(console.error);

        } catch (uploadError) {
          console.error('Error subiendo comprobante:', uploadError);
          await fs.unlink(req.file.path).catch(console.error);
          
          return res.status(500).json({
            success: false,
            error: 'Error subiendo comprobante de pago'
          });
        }
      }

      // Crear registro de pago (en metadata para backward compatibility)
      const paymentRecord = {
        method: resolvedPaymentMethod,
        amount: paymentAmount,
        currency,
        transactionId,
        proof: proofUrl ? {
          url: proofUrl,
          publicId: proofPublicId,
          uploadedAt: new Date()
        } : null,
        notes,
        recordedAt: new Date(),
        recordedBy: req.specialist.id
      };

      // Obtener pagos existentes
      const currentPayments = appointment.metadata?.payments || [];
      currentPayments.push(paymentRecord);

      // Calcular nuevo monto pagado
      const totalPaid = currentPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      // Determinar estado de pago
      let paymentStatus = 'PENDING';
      if (totalPaid >= appointment.totalAmount) {
        paymentStatus = 'PAID';
      } else if (totalPaid > 0) {
        paymentStatus = 'PARTIAL';
      }

      // Actualizar la cita
      const metadata = appointment.metadata || {};
      metadata.payments = currentPayments;

      await appointment.update({
        paidAmount: totalPaid,
        paymentStatus,
        metadata
      });
      
      // ✅ NUEVO: Crear registro en AppointmentPayment
      console.log('💾 [recordPayment] Creando registro en AppointmentPayment...');
      const AppointmentPayment = require('../models/AppointmentPayment');
      
      try {
        const appointmentPaymentData = {
          appointmentId: appointment.id,
          businessId,
          clientId: appointment.clientId,
          paymentMethodId: paymentMethodId || null,
          paymentMethodName: paymentMethodName || resolvedPaymentMethod,
          paymentMethodType: paymentMethodType || resolvedPaymentMethod,
          amount: paymentAmount,
          reference: transactionId || null,
          notes: notes || null,
          proofUrl: proofUrl || null,
          proofType: proofUrl ? 'image/jpeg' : null,
          status: 'COMPLETED',
          registeredBy: req.specialist.id,
          registeredByRole: req.user.role,
          paymentDate: new Date(),
          metadata: {
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            proofPublicId: proofPublicId || null
          }
        };
        
        console.log('💾 [recordPayment] Datos AppointmentPayment:', JSON.stringify(appointmentPaymentData, null, 2));
        
        await AppointmentPayment.create(appointmentPaymentData);
        console.log('✅ [recordPayment] AppointmentPayment creado exitosamente');
      } catch (apError) {
        console.error('❌ [recordPayment] Error creando AppointmentPayment:', apError);
        // No fallar el pago completo si falla esto, solo loguearlo
      }
      
      // ✅ NUEVO: Crear recibo automáticamente cuando el pago está completo
    console.log(`📊 [recordPayment] ====== INICIANDO CREACIÓN DE RECIBO ======`);
      console.log(`📊 [recordPayment] paymentStatus: ${paymentStatus}, totalPaid: ${totalPaid}, totalAmount: ${appointment.totalAmount}`);
      console.log(`📊 [recordPayment] appointment.status: ${appointment.status}`);
      
      if (paymentStatus === 'PAID') {
        console.log('🧾 [recordPayment] ✅ Payment PAID - Creando recibo automáticamente...');
        try {
          const Receipt = require('../models/Receipt');
          
          // Verificar si ya existe un recibo para esta cita
          const existingReceipt = await Receipt.findOne({
            where: {
              appointmentId: appointment.id,
              businessId,
              status: 'ACTIVE'
            }
          });
          
          if (!existingReceipt) {
            console.log('🧾 [recordPayment] No existe recibo previo. Recargando appointment con relaciones...');
            // Recargar appointment con todas las relaciones necesarias para el recibo
            const fullAppointment = await Appointment.findByPk(appointment.id, {
              include: [
                {
                  model: Service,
                  attributes: ['id', 'name', 'price']
                },
                {
                  model: Client,
                  attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
                },
                {
                  model: require('../models/User'),
                  as: 'specialist',
                  attributes: ['id', 'firstName', 'lastName']
                }
              ]
            });
            
            console.log('🧾 [recordPayment] fullAppointment cargado:', {
              id: fullAppointment.id,
              hasService: !!fullAppointment.Service,
              hasClient: !!fullAppointment.Client,
              hasSpecialist: !!fullAppointment.specialist,
              totalAmount: fullAppointment.totalAmount
            });
            
            const receiptPaymentData = {
              method: paymentMethodType || resolvedPaymentMethod,
              methodName: paymentMethodName || resolvedPaymentMethod,
              methodId: paymentMethodId || null,
              amount: paymentAmount,
              transactionId: transactionId,
              reference: transactionId
            };
            
            console.log('🧾 [recordPayment] Invocando Receipt.createFromAppointment con paymentData:', JSON.stringify(receiptPaymentData, null, 2));
            console.log('🧾 [recordPayment] fullAppointment.toJSON():', JSON.stringify(fullAppointment.toJSON(), null, 2).substring(0, 500));
            
            const createdReceipt = await Receipt.createFromAppointment(
              fullAppointment.toJSON(),
              receiptPaymentData,
              { createdBy: req.specialist.id }
            );
            console.log('✅✅✅ [recordPayment] RECIBO CREADO EXITOSAMENTE - ID:', createdReceipt.id, 'Number:', createdReceipt.receiptNumber);
          } else {
            console.log('ℹ️ [recordPayment] Ya existe recibo para esta cita - ID:', existingReceipt.id, 'Number:', existingReceipt.receiptNumber);
          }
        } catch (receiptError) {
          console.error('❌❌❌ [recordPayment] ERROR CREANDO RECIBO ❌❌❌');
          console.error('   Name:', receiptError.name);
          console.error('   Message:', receiptError.message);
          console.error('   Code:', receiptError.code);
          console.error('   SQL:', receiptError.sql);
          console.error('   Original:', receiptError.original);
          console.error('   Stack:', receiptError.stack);
          // No fallar el pago si falla la creación del recibo
        }
      } else {
        console.log(`⏭️ [recordPayment] paymentStatus=${paymentStatus} - No se crea recibo automático (solo cuando PAID)`);
      }
      console.log(`📊 [recordPayment] ====== FIN CREACIÓN DE RECIBO ======`);

      res.json({
        success: true,
        message: 'Pago registrado exitosamente',
        data: {
          appointmentId,
          paymentRecord,
          totalPaid,
          pendingAmount: Math.max(0, appointment.totalAmount - totalPaid),
          paymentStatus
        }
      });

    } catch (error) {
      console.error('Error registrando pago:', error);
      
      // Limpiar archivo temporal si hay error
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener historial de pagos de una cita
   * GET /api/appointments/:appointmentId/payments
   */
  static async getPaymentHistory(req, res) {
    try {
      const { appointmentId } = req.params;
      const { businessId } = req.query;
      
      const where = {
        id: appointmentId,
        businessId
      };

      // Aplicar filtros de acceso según el rol
      if (req.specialist) {
        where.specialistId = req.specialist.id;
      }

      const appointment = await Appointment.findOne({
        where,
        attributes: [
          'id', 
          'totalAmount', 
          'paidAmount', 
          'paymentStatus', 
          'metadata'
        ],
        include: [{
          model: Service,
          attributes: ['id', 'name', 'price']
        }]
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      const payments = appointment.metadata?.payments || [];
      const pendingAmount = Math.max(0, appointment.totalAmount - appointment.paidAmount);

      res.json({
        success: true,
        data: {
          appointmentId,
          service: appointment.Service,
          paymentSummary: {
            totalAmount: appointment.totalAmount,
            paidAmount: appointment.paidAmount,
            pendingAmount,
            paymentStatus: appointment.paymentStatus
          },
          payments: payments.map(payment => ({
            ...payment,
            recordedAt: new Date(payment.recordedAt)
          }))
        }
      });

    } catch (error) {
      console.error('Error obteniendo historial de pagos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar pago existente
   * PUT /api/appointments/:appointmentId/payments/:paymentIndex
   */
  static async updatePayment(req, res) {
    try {
      const { appointmentId, paymentIndex } = req.params;
      const { businessId } = req.body;
      
      const appointment = await Appointment.findOne({
        where: {
          id: appointmentId,
          businessId,
          specialistId: req.specialist.id
        }
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      const payments = appointment.metadata?.payments || [];
      const index = parseInt(paymentIndex);

      if (index < 0 || index >= payments.length) {
        return res.status(404).json({
          success: false,
          error: 'Pago no encontrado'
        });
      }

      const { notes, transactionId } = req.body;

      // Actualizar campos permitidos
      if (notes !== undefined) {
        payments[index].notes = notes;
      }
      if (transactionId !== undefined) {
        payments[index].transactionId = transactionId;
      }

      payments[index].updatedAt = new Date();
      payments[index].updatedBy = req.specialist.id;

      // Actualizar metadata
      const metadata = appointment.metadata || {};
      metadata.payments = payments;

      await appointment.update({ metadata });

      res.json({
        success: true,
        message: 'Pago actualizado exitosamente',
        data: payments[index]
      });

    } catch (error) {
      console.error('Error actualizando pago:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Eliminar pago
   * DELETE /api/appointments/:appointmentId/payments/:paymentIndex
   */
  static async deletePayment(req, res) {
    try {
      const { appointmentId, paymentIndex } = req.params;
      const { businessId } = req.query;
      
      const appointment = await Appointment.findOne({
        where: {
          id: appointmentId,
          businessId,
          specialistId: req.specialist.id
        }
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      const payments = appointment.metadata?.payments || [];
      const index = parseInt(paymentIndex);

      if (index < 0 || index >= payments.length) {
        return res.status(404).json({
          success: false,
          error: 'Pago no encontrado'
        });
      }

      const paymentToDelete = payments[index];

      // Eliminar comprobante de Cloudinary si existe
      if (paymentToDelete.proof?.publicId) {
        try {
          await cloudinary.uploader.destroy(paymentToDelete.proof.publicId);
        } catch (cloudinaryError) {
          console.error('Error eliminando comprobante de Cloudinary:', cloudinaryError);
        }
      }

      // Remover pago del array
      payments.splice(index, 1);

      // Recalcular totales
      const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
      
      let paymentStatus = 'PENDING';
      if (totalPaid >= appointment.totalAmount) {
        paymentStatus = 'PAID';
      } else if (totalPaid > 0) {
        paymentStatus = 'PARTIAL';
      }

      // Actualizar metadata
      const metadata = appointment.metadata || {};
      metadata.payments = payments;

      await appointment.update({
        paidAmount: totalPaid,
        paymentStatus,
        metadata
      });

      res.json({
        success: true,
        message: 'Pago eliminado exitosamente',
        data: {
          deletedPayment: paymentToDelete,
          newTotal: totalPaid,
          paymentStatus
        }
      });

    } catch (error) {
      console.error('Error eliminando pago:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Generar reporte de pagos del especialista
   * GET /api/specialists/me/payments?businessId={bizId}
   */
  static async getMyPaymentReport(req, res) {
    try {
      const { businessId } = req.query;
      const specialistId = req.specialist.id;
      
      const {
        startDate,
        endDate,
        month,
        year = new Date().getFullYear()
      } = req.query;

      let dateFilter = {};

      if (month && year) {
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0);
        dateFilter.completedAt = {
          [Op.between]: [startOfMonth, endOfMonth]
        };
      } else if (startDate && endDate) {
        dateFilter.completedAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const appointments = await Appointment.findAll({
        where: {
          businessId,
          specialistId,
          status: 'COMPLETED',
          paymentStatus: ['PAID', 'PARTIAL'],
          ...dateFilter
        },
        include: [
          {
            model: Service,
            attributes: ['id', 'name', 'price']
          },
          {
            model: Client,
            attributes: ['id', 'firstName', 'lastName']
          }
        ],
        order: [['completedAt', 'DESC']]
      });

      // Obtener información de comisiones del especialista
      const profile = await SpecialistProfile.findOne({
        where: { userId: specialistId, businessId }
      });

      const paymentSummary = {
        totalAppointments: appointments.length,
        totalRevenue: 0,
        totalCommissions: 0,
        paymentMethods: {},
        appointments: []
      };

      appointments.forEach(appointment => {
        const payments = appointment.metadata?.payments || [];
        const appointmentRevenue = appointment.paidAmount;
        
        paymentSummary.totalRevenue += appointmentRevenue;

        // Calcular comisión
        let commission = 0;
        if (profile) {
          if (profile.commissionType === 'PERCENTAGE') {
            commission = (appointmentRevenue * profile.commissionRate) / 100;
          } else if (profile.commissionType === 'FIXED_AMOUNT') {
            commission = profile.fixedCommissionAmount;
          }
        }
        paymentSummary.totalCommissions += commission;

        // Agrupar por métodos de pago
        payments.forEach(payment => {
          if (!paymentSummary.paymentMethods[payment.method]) {
            paymentSummary.paymentMethods[payment.method] = 0;
          }
          paymentSummary.paymentMethods[payment.method] += payment.amount;
        });

        paymentSummary.appointments.push({
          id: appointment.id,
          clientName: `${appointment.Client.firstName} ${appointment.Client.lastName}`,
          serviceName: appointment.Service.name,
          totalAmount: appointment.totalAmount,
          paidAmount: appointment.paidAmount,
          commission,
          completedAt: appointment.completedAt,
          paymentStatus: appointment.paymentStatus,
          payments: payments.length
        });
      });

      res.json({
        success: true,
        data: paymentSummary
      });

    } catch (error) {
      console.error('Error generando reporte de pagos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

}

module.exports = AppointmentPaymentController;