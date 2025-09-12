/**
 * Controlador para gestión de pagos desde el lado del negocio
 * Los negocios pueden ver su suscripción, subir comprobantes y hacer pagos
 */

const { BusinessSubscription, SubscriptionPayment, SubscriptionPlan, Business } = require('../models');
const SubscriptionStatusService = require('../services/SubscriptionStatusService');
const { uploadPaymentReceipt } = require('../config/cloudinary');

class BusinessPaymentController {

  /**
   * Obtener información de la suscripción actual del negocio
   */
  static async getMySubscription(req, res) {
    try {
      const businessId = req.user.businessId;

      const subscription = await BusinessSubscription.findOne({
        where: { businessId },
        include: [
          {
            model: SubscriptionPlan,
            as: 'plan',
            attributes: ['id', 'name', 'price', 'billingCycle', 'description']
          },
          {
            model: SubscriptionPayment,
            as: 'payments',
            limit: 5,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'amount', 'status', 'paymentDate', 'receiptUrl', 'createdAt']
          }
        ]
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró suscripción activa para este negocio.'
        });
      }

      // Verificar estado actual
      const statusInfo = await SubscriptionStatusService.checkBusinessSubscription(businessId);

      res.json({
        success: true,
        data: {
          subscription: {
            id: subscription.id,
            status: statusInfo.status,
            nextPaymentDate: subscription.nextPaymentDate,
            lastPaymentDate: subscription.lastPaymentDate,
            daysOverdue: statusInfo.daysOverdue || 0,
            accessLevel: statusInfo.level,
            hasAccess: statusInfo.access
          },
          plan: subscription.plan,
          recentPayments: subscription.payments
        }
      });

    } catch (error) {
      console.error('Error obteniendo suscripción del negocio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Subir comprobante de pago
   */
  static async uploadPaymentReceipt(req, res) {
    try {
      const businessId = req.user.businessId;
      const { amount, paymentDate, paymentMethod, notes } = req.body;

      // Validaciones
      if (!amount || !paymentDate) {
        return res.status(400).json({
          success: false,
          message: 'El monto y la fecha de pago son requeridos.'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'El comprobante de pago es requerido.'
        });
      }

      // Verificar que existe la suscripción
      const subscription = await BusinessSubscription.findOne({
        where: { businessId }
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró suscripción para este negocio.'
        });
      }

      // Subir archivo a Cloudinary
      const uploadResult = await uploadPaymentReceipt(req.file.buffer, {
        businessId,
        paymentDate,
        amount
      });

      // Crear registro de pago
      const payment = await SubscriptionPayment.create({
        businessSubscriptionId: subscription.id,
        amount: parseFloat(amount),
        paymentDate: new Date(paymentDate),
        paymentMethod: paymentMethod || 'TRANSFER',
        status: 'PENDING', // Pendiente de verificación OWNER
        receiptUrl: uploadResult.secure_url,
        receiptPublicId: uploadResult.public_id,
        receiptMetadata: uploadResult.metadata,
        receiptUploadedBy: req.user.id,
        notes: notes || null
      });

      res.status(201).json({
        success: true,
        data: {
          payment: {
            id: payment.id,
            amount: payment.amount,
            paymentDate: payment.paymentDate,
            status: payment.status,
            receiptUrl: payment.receiptUrl
          }
        },
        message: 'Comprobante subido exitosamente. Será verificado por el administrador.'
      });

    } catch (error) {
      console.error('Error subiendo comprobante:', error);
      res.status(500).json({
        success: false,
        message: 'Error subiendo el comprobante.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener historial de pagos del negocio
   */
  static async getMyPaymentHistory(req, res) {
    try {
      const businessId = req.user.businessId;
      const { page = 1, limit = 10, status } = req.query;

      const offset = (page - 1) * limit;

      // Obtener suscripción
      const subscription = await BusinessSubscription.findOne({
        where: { businessId }
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró suscripción para este negocio.'
        });
      }

      // Construir filtros
      const where = { businessSubscriptionId: subscription.id };
      if (status) {
        where.status = status;
      }

      const payments = await SubscriptionPayment.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        attributes: [
          'id', 'amount', 'paymentDate', 'paymentMethod', 'status', 
          'receiptUrl', 'notes', 'verificationNotes', 'createdAt'
        ]
      });

      res.json({
        success: true,
        data: {
          payments: payments.rows,
          pagination: {
            total: payments.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(payments.count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo historial de pagos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener detalles de un pago específico
   */
  static async getPaymentDetails(req, res) {
    try {
      const { paymentId } = req.params;
      const businessId = req.user.businessId;

      const payment = await SubscriptionPayment.findOne({
        where: { id: paymentId },
        include: [
          {
            model: BusinessSubscription,
            as: 'subscription',
            where: { businessId },
            attributes: ['id', 'businessId']
          }
        ]
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado o no pertenece a este negocio.'
        });
      }

      res.json({
        success: true,
        data: {
          payment: {
            id: payment.id,
            amount: payment.amount,
            paymentDate: payment.paymentDate,
            paymentMethod: payment.paymentMethod,
            status: payment.status,
            receiptUrl: payment.receiptUrl,
            notes: payment.notes,
            verificationNotes: payment.verificationNotes,
            createdAt: payment.createdAt,
            verifiedAt: payment.verifiedAt
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo detalles del pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener estado de acceso actual del negocio
   */
  static async getAccessStatus(req, res) {
    try {
      const businessId = req.user.businessId;

      const statusInfo = await SubscriptionStatusService.checkBusinessSubscription(businessId);

      res.json({
        success: true,
        data: {
          hasAccess: statusInfo.access,
          accessLevel: statusInfo.level,
          status: statusInfo.status,
          daysOverdue: statusInfo.daysOverdue || 0,
          restrictions: this.getAccessRestrictions(statusInfo.level)
        }
      });

    } catch (error) {
      console.error('Error verificando estado de acceso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener restricciones basadas en el nivel de acceso
   */
  static getAccessRestrictions(accessLevel) {
    const restrictions = {
      'FULL': [],
      'LIMITED': [
        'No se pueden crear nuevos servicios',
        'No se pueden agregar nuevos especialistas', 
        'Acceso limitado a reportes avanzados',
        'No se pueden usar módulos premium'
      ],
      'NONE': [
        'Sin acceso a la plataforma',
        'Solo vista de información básica',
        'No se pueden realizar operaciones'
      ]
    };

    return restrictions[accessLevel] || restrictions['NONE'];
  }
}

module.exports = BusinessPaymentController;