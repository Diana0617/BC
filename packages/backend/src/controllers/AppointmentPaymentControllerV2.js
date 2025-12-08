const AppointmentPayment = require('../models/AppointmentPayment');
const Appointment = require('../models/Appointment');
const Client = require('../models/Client');
const Receipt = require('../models/Receipt');
const BusinessPaymentConfig = require('../models/BusinessPaymentConfig');
const { Op } = require('sequelize');
const { cloudinary } = require('../config/cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

/**
 * Controlador para gestión de pagos de citas
 * Usa el modelo AppointmentPayment con métodos de pago personalizados
 */
class AppointmentPaymentControllerV2 {

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
      const allowedMimes = [
        'image/jpeg', 
        'image/jpg', 
        'image/png', 
        'image/webp', 
        'application/pdf'
      ];
      
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
   * Registrar un pago de cita
   * POST /api/appointments/:appointmentId/payments
   */
  static async registerPayment(req, res) {
    try {
      const { appointmentId } = req.params;
      const {
        amount,
        paymentMethodId,
        reference,
        notes,
        proofUrl // Si ya se subió el comprobante antes
      } = req.body;

      // Validaciones
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'El monto debe ser mayor a cero'
        });
      }

      if (!paymentMethodId) {
        return res.status(400).json({
          success: false,
          error: 'Debe seleccionar un método de pago'
        });
      }

      // Obtener la cita
      const appointment = await Appointment.findByPk(appointmentId, {
        include: [
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          }
        ]
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      // Obtener configuración de pagos del negocio
      const paymentConfig = await BusinessPaymentConfig.findOne({
        where: { businessId: appointment.businessId }
      });

      if (!paymentConfig) {
        return res.status(404).json({
          success: false,
          error: 'Configuración de pagos no encontrada'
        });
      }

      // Buscar el método de pago
      const paymentMethod = (paymentConfig.paymentMethods || [])
        .find(m => m.id === paymentMethodId && m.isActive);

      if (!paymentMethod) {
        return res.status(400).json({
          success: false,
          error: 'Método de pago no válido o inactivo'
        });
      }

      // Calcular saldo pendiente
      const totalAmount = parseFloat(appointment.totalAmount || 0);
      const paidAmount = parseFloat(appointment.paidAmount || 0);
      const pendingAmount = totalAmount - paidAmount;

      // Validar que no se exceda el saldo pendiente
      if (parseFloat(amount) > pendingAmount) {
        return res.status(400).json({
          success: false,
          error: `El monto (${amount}) excede el saldo pendiente (${pendingAmount})`
        });
      }

      // Crear el registro de pago
      const payment = await AppointmentPayment.create({
        appointmentId,
        businessId: appointment.businessId,
        clientId: appointment.clientId,
        amount,
        paymentMethodId,
        paymentMethodName: paymentMethod.name,
        paymentMethodType: paymentMethod.type,
        reference,
        notes,
        proofUrl: proofUrl || null,
        status: 'COMPLETED',
        registeredBy: req.user.id,
        registeredByRole: req.user.role,
        paymentDate: new Date(),
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          registeredFrom: 'mobile' // o 'web'
        }
      });

      // Actualizar el monto pagado de la cita
      const newPaidAmount = paidAmount + parseFloat(amount);
      const newPaymentStatus = newPaidAmount >= totalAmount ? 'PAID' : 
                               newPaidAmount > 0 ? 'PARTIAL' : 'PENDING';

      await appointment.update({
        paidAmount: newPaidAmount,
        paymentStatus: newPaymentStatus
      });

      // Si el pago es completo, generar recibo automáticamente
      let receipt = null;
      if (newPaymentStatus === 'PAID') {
        receipt = await this.generateReceipt(appointment, payment);
        
        // Actualizar el pago con el receiptId
        await payment.update({
          receiptId: receipt.id
        });
      }

      // Recargar el pago con todas las relaciones
      const paymentWithRelations = await AppointmentPayment.findByPk(payment.id);

      res.status(201).json({
        success: true,
        data: {
          payment: paymentWithRelations,
          receipt: receipt,
          appointmentStatus: {
            totalAmount,
            paidAmount: newPaidAmount,
            pendingAmount: totalAmount - newPaidAmount,
            paymentStatus: newPaymentStatus
          }
        },
        message: 'Pago registrado exitosamente'
      });

    } catch (error) {
      console.error('Error registrando pago:', error);
      res.status(500).json({
        success: false,
        error: 'Error al registrar el pago'
      });
    }
  }

  /**
   * Obtener pagos de una cita
   * GET /api/appointments/:appointmentId/payments
   */
  static async getAppointmentPayments(req, res) {
    try {
      const { appointmentId } = req.params;

      const appointment = await Appointment.findByPk(appointmentId);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      const payments = await AppointmentPayment.findAll({
        where: { appointmentId },
        order: [['paymentDate', 'DESC']]
      });

      // Calcular resumen
      const totalAmount = parseFloat(appointment.totalAmount || 0);
      const paidAmount = parseFloat(appointment.paidAmount || 0);
      const pendingAmount = totalAmount - paidAmount;

      res.json({
        success: true,
        data: {
          payments,
          summary: {
            totalAmount,
            paidAmount,
            pendingAmount,
            paymentStatus: appointment.paymentStatus,
            paymentsCount: payments.length
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo pagos:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener pagos'
      });
    }
  }

  /**
   * Subir comprobante de pago
   * POST /api/appointments/:appointmentId/payments/:paymentId/proof
   */
  static async uploadPaymentProof(req, res) {
    try {
      const { appointmentId, paymentId } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No se ha enviado ningún archivo'
        });
      }

      const payment = await AppointmentPayment.findOne({
        where: { 
          id: paymentId,
          appointmentId
        }
      });

      if (!payment) {
        // Eliminar archivo temporal
        await fs.unlink(req.file.path);
        return res.status(404).json({
          success: false,
          error: 'Pago no encontrado'
        });
      }

      // Subir a Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: `beauty-control/payments/${appointmentId}`,
        resource_type: 'auto'
      });

      // Eliminar archivo temporal
      await fs.unlink(req.file.path);

      // Actualizar el pago con la URL del comprobante
      await payment.update({
        proofUrl: result.secure_url,
        proofType: req.file.mimetype
      });

      res.json({
        success: true,
        data: {
          proofUrl: result.secure_url,
          proofType: req.file.mimetype
        },
        message: 'Comprobante subido exitosamente'
      });

    } catch (error) {
      console.error('Error subiendo comprobante:', error);
      
      // Intentar eliminar archivo temporal si existe
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error eliminando archivo temporal:', unlinkError);
        }
      }

      res.status(500).json({
        success: false,
        error: 'Error al subir comprobante'
      });
    }
  }

  /**
   * Anular/reembolsar un pago
   * POST /api/appointments/:appointmentId/payments/:paymentId/refund
   */
  static async refundPayment(req, res) {
    try {
      const { appointmentId, paymentId } = req.params;
      const { reason } = req.body;

      const payment = await AppointmentPayment.findOne({
        where: { 
          id: paymentId,
          appointmentId
        }
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Pago no encontrado'
        });
      }

      if (payment.status === 'REFUNDED') {
        return res.status(400).json({
          success: false,
          error: 'Este pago ya fue reembolsado'
        });
      }

      // Obtener la cita para actualizar el monto pagado
      const appointment = await Appointment.findByPk(appointmentId);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      // Actualizar el pago
      await payment.update({
        status: 'REFUNDED',
        metadata: {
          ...payment.metadata,
          refund: {
            refundedAt: new Date(),
            refundedBy: req.user.id,
            reason: reason || 'No especificado'
          }
        }
      });

      // Actualizar el monto pagado de la cita
      const newPaidAmount = parseFloat(appointment.paidAmount) - parseFloat(payment.amount);
      const totalAmount = parseFloat(appointment.totalAmount || 0);
      const newPaymentStatus = newPaidAmount >= totalAmount ? 'PAID' : 
                               newPaidAmount > 0 ? 'PARTIAL' : 'PENDING';

      await appointment.update({
        paidAmount: Math.max(0, newPaidAmount),
        paymentStatus: newPaymentStatus
      });

      res.json({
        success: true,
        data: payment,
        message: 'Pago reembolsado exitosamente'
      });

    } catch (error) {
      console.error('Error reembolsando pago:', error);
      res.status(500).json({
        success: false,
        error: 'Error al reembolsar el pago'
      });
    }
  }

  /**
   * Generar recibo automático cuando se completa el pago
   * (Helper function)
   */
  static async generateReceipt(appointment, payment) {
    try {
      // Obtener el último número de recibo del negocio
      const lastReceipt = await Receipt.findOne({
        where: { businessId: appointment.businessId },
        order: [['receiptNumber', 'DESC']]
      });

      const nextNumber = lastReceipt ? lastReceipt.receiptNumber + 1 : 1;

      // Crear el recibo
      const receipt = await Receipt.create({
        businessId: appointment.businessId,
        branchId: appointment.branchId,
        receiptNumber: nextNumber,
        clientId: appointment.clientId,
        appointmentId: appointment.id,
        specialistId: appointment.specialistId,
        serviceId: appointment.serviceId,
        date: new Date(),
        time: new Date().toTimeString().split(' ')[0],
        amount: appointment.totalAmount,
        paymentMethod: payment.paymentMethodName,
        status: 'ACTIVE',
        metadata: {
          generatedAutomatically: true,
          paymentId: payment.id,
          generatedAt: new Date()
        }
      });

      return receipt;
    } catch (error) {
      console.error('Error generando recibo:', error);
      throw error;
    }
  }

}

module.exports = AppointmentPaymentControllerV2;
