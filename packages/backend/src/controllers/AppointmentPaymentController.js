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
      
      // Verificar que el especialista tenga acceso a la cita
      const appointment = await Appointment.findOne({
        where: {
          id: appointmentId,
          businessId,
          specialistId: req.specialist.id
        },
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
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      const {
        paymentMethod,
        amount,
        currency = 'COP',
        notes,
        transactionId
      } = req.body;

      // Validar método de pago
      const validPaymentMethods = ['CASH', 'CARD', 'TRANSFER', 'QR', 'OTHER'];
      if (!validPaymentMethods.includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          error: 'Método de pago no válido'
        });
      }

      // Validar monto
      const paymentAmount = parseFloat(amount);
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Monto de pago inválido'
        });
      }

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

      // Crear registro de pago
      const paymentRecord = {
        method: paymentMethod,
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