const { Op, literal } = require('sequelize');
const { 
  SubscriptionPayment, 
  BusinessSubscription, 
  Business, 
  SubscriptionPlan, 
  User,
  OwnerPaymentConfiguration 
} = require('../models');
const PaginationService = require('../services/PaginationService');
const CloudinaryService = require('../services/CloudinaryService');

class OwnerPaymentController {
  
  /**
   * Obtener todos los pagos de suscripciones con filtros
   */
  static async getAllPayments(req, res) {
    try {
      const { 
        status, 
        paymentMethod, 
        startDate, 
        endDate, 
        businessId,
        hasReceipt
      } = req.query;

      // Parse pagination with defaults
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      // Construir filtros
      const where = {};
      
      if (status) {
        where.status = status;
      }
      
      if (paymentMethod) {
        where.paymentMethod = paymentMethod;
      }
      
      if (startDate || endDate) {
        where.paidAt = {};
        if (startDate) where.paidAt[Op.gte] = new Date(startDate);
        if (endDate) where.paidAt[Op.lte] = new Date(endDate);
      }
      
      if (hasReceipt === 'true') {
        where.receiptUrl = { [Op.ne]: null };
      } else if (hasReceipt === 'false') {
        where.receiptUrl = null;
      }

      // Filtro por negocio específico
      const includeWhere = businessId ? { id: businessId } : {};

      const result = await PaginationService.paginate(SubscriptionPayment, {
        page,
        limit,
        where,
        include: [
          {
            model: BusinessSubscription,
            as: 'subscription',
            include: [
              {
                model: Business,
                as: 'business',
                where: includeWhere,
                attributes: ['id', 'name', 'email', 'phone']
              },
              {
                model: SubscriptionPlan,
                as: 'plan',
                attributes: ['id', 'name', 'price', 'currency']
              }
            ]
          },
          {
            model: OwnerPaymentConfiguration,
            as: 'paymentConfiguration',
            attributes: ['id', 'name', 'provider']
          },
          {
            model: User,
            as: 'receiptUploader',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Calcular estadísticas adicionales
      const stats = await SubscriptionPayment.findOne({
        attributes: [
          [literal('COUNT(*)'), 'total'],
          [literal('COUNT(CASE WHEN status = \'COMPLETED\' THEN 1 END)'), 'completed'],
          [literal('COUNT(CASE WHEN status = \'PENDING\' THEN 1 END)'), 'pending'],
          [literal('COUNT(CASE WHEN status = \'FAILED\' THEN 1 END)'), 'failed'],
          [literal('SUM(CASE WHEN status = \'COMPLETED\' THEN amount ELSE 0 END)'), 'totalRevenue'],
          [literal('SUM(CASE WHEN status = \'COMPLETED\' THEN "netAmount" ELSE 0 END)'), 'netRevenue']
        ],
        where,
        include: businessId ? [{
          model: BusinessSubscription,
          as: 'subscription',
          include: [{
            model: Business,
            as: 'business',
            where: { id: businessId }
          }]
        }] : [],
        raw: true
      });

      res.json({
        success: true,
        data: {
          payments: result.data,
          pagination: result.pagination,
          stats: {
            total: parseInt(stats.total) || 0,
            completed: parseInt(stats.completed) || 0,
            pending: parseInt(stats.pending) || 0,
            failed: parseInt(stats.failed) || 0,
            totalRevenue: parseFloat(stats.totalRevenue) || 0,
            netRevenue: parseFloat(stats.netRevenue) || 0
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo pagos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener un pago específico por ID
   */
  static async getPaymentById(req, res) {
    try {
      const { id } = req.params;

      const payment = await SubscriptionPayment.findByPk(id, {
        include: [
          {
            model: BusinessSubscription,
            as: 'subscription',
            include: [
              {
                model: Business,
                as: 'business',
                attributes: ['id', 'name', 'email', 'phone', 'address']
              },
              {
                model: SubscriptionPlan,
                as: 'plan'
              }
            ]
          },
          {
            model: OwnerPaymentConfiguration,
            as: 'paymentConfiguration'
          },
          {
            model: User,
            as: 'receiptUploader',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      res.json({
        success: true,
        data: payment
      });

    } catch (error) {
      console.error('Error obteniendo pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Crear un nuevo pago manual
   */
  static async createPayment(req, res) {
    try {
      const {
        businessSubscriptionId,
        amount,
        currency = 'COP',
        paymentMethod,
        description,
        dueDate,
        transactionId,
        externalReference
      } = req.body;

      // Validar que la suscripción existe
      const subscription = await BusinessSubscription.findByPk(businessSubscriptionId, {
        include: [
          {
            model: Business,
            as: 'business',
            attributes: ['id', 'name']
          },
          {
            model: SubscriptionPlan,
            as: 'plan',
            attributes: ['id', 'name', 'price']
          }
        ]
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Suscripción no encontrada'
        });
      }

      // Calcular comisión y monto neto (para pagos manuales, comisión = 0)
      const commissionFee = 0;
      const netAmount = amount;

      const payment = await SubscriptionPayment.create({
        businessSubscriptionId,
        amount,
        currency,
        paymentMethod,
        description,
        dueDate: dueDate || new Date(),
        transactionId,
        externalReference,
        commissionFee,
        netAmount,
        status: paymentMethod === 'MANUAL' ? 'PENDING' : 'PROCESSING'
      });

      // Obtener el pago creado con todas las relaciones
      const createdPayment = await SubscriptionPayment.findByPk(payment.id, {
        include: [
          {
            model: BusinessSubscription,
            as: 'subscription',
            include: [
              {
                model: Business,
                as: 'business',
                attributes: ['id', 'name', 'email']
              },
              {
                model: SubscriptionPlan,
                as: 'plan',
                attributes: ['id', 'name', 'price']
              }
            ]
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Pago creado exitosamente',
        data: createdPayment
      });

    } catch (error) {
      console.error('Error creando pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Actualizar estado de un pago
   */
  static async updatePayment(req, res) {
    try {
      const { id } = req.params;
      const {
        status,
        paidAt,
        failureReason,
        refundReason,
        refundedAmount,
        notes
      } = req.body;

      const payment = await SubscriptionPayment.findByPk(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      const updateData = {};

      if (status) {
        updateData.status = status;
        
        // Si se marca como completado, establecer fecha de pago
        if (status === 'COMPLETED' && !payment.paidAt) {
          updateData.paidAt = paidAt || new Date();
        }
        
        // Si es reembolso, establecer fecha y monto
        if (status === 'REFUNDED' || status === 'PARTIALLY_REFUNDED') {
          updateData.refundedAt = new Date();
          if (refundedAmount !== undefined) {
            updateData.refundedAmount = refundedAmount;
          }
        }
      }

      if (failureReason) updateData.failureReason = failureReason;
      if (refundReason) updateData.refundReason = refundReason;
      if (notes) updateData.notes = notes;

      await payment.update(updateData);

      // Obtener el pago actualizado con relaciones
      const updatedPayment = await SubscriptionPayment.findByPk(id, {
        include: [
          {
            model: BusinessSubscription,
            as: 'subscription',
            include: [
              {
                model: Business,
                as: 'business',
                attributes: ['id', 'name', 'email']
              },
              {
                model: SubscriptionPlan,
                as: 'plan',
                attributes: ['id', 'name', 'price']
              }
            ]
          },
          {
            model: User,
            as: 'receiptUploader',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });

      res.json({
        success: true,
        message: 'Pago actualizado exitosamente',
        data: updatedPayment
      });

    } catch (error) {
      console.error('Error actualizando pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Subir comprobante de pago
   */
  static async uploadReceipt(req, res) {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ningún archivo'
        });
      }

      const payment = await SubscriptionPayment.findByPk(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      // Subir archivo a Cloudinary
      const cloudinaryResult = await CloudinaryService.uploadPaymentReceipt(
        req.file.path, 
        payment.id
      );

      if (!cloudinaryResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Error subiendo archivo a Cloudinary',
          error: cloudinaryResult.error
        });
      }

      // Actualizar pago con información del comprobante
      await payment.update({
        receiptUrl: cloudinaryResult.data.secure_url,
        receiptPublicId: cloudinaryResult.data.public_id,
        receiptMetadata: {
          originalName: req.file.originalname,
          size: req.file.size,
          format: cloudinaryResult.data.format,
          width: cloudinaryResult.data.width,
          height: cloudinaryResult.data.height
        },
        receiptUploadedBy: req.user.id,
        receiptUploadedAt: new Date()
      });

      res.json({
        success: true,
        message: 'Comprobante subido exitosamente',
        data: {
          receiptUrl: cloudinaryResult.data.secure_url,
          receiptPublicId: cloudinaryResult.data.public_id,
          metadata: payment.receiptMetadata
        }
      });

    } catch (error) {
      console.error('Error subiendo comprobante:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Eliminar comprobante de pago
   */
  static async deleteReceipt(req, res) {
    try {
      const { id } = req.params;

      const payment = await SubscriptionPayment.findByPk(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      if (!payment.receiptPublicId) {
        return res.status(400).json({
          success: false,
          message: 'No hay comprobante para eliminar'
        });
      }

      // Eliminar archivo de Cloudinary
      await CloudinaryService.deleteDocument(payment.receiptPublicId);

      // Limpiar campos del comprobante en la base de datos
      await payment.update({
        receiptUrl: null,
        receiptPublicId: null,
        receiptMetadata: null,
        receiptUploadedBy: null,
        receiptUploadedAt: null
      });

      res.json({
        success: true,
        message: 'Comprobante eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando comprobante:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de pagos por período
   */
  static async getPaymentStats(req, res) {
    try {
      const { 
        startDate, 
        endDate, 
        groupBy = 'month' // day, week, month, year
      } = req.query;

      const whereClause = {};
      
      if (startDate || endDate) {
        whereClause.paidAt = {};
        if (startDate) whereClause.paidAt[Op.gte] = new Date(startDate);
        if (endDate) whereClause.paidAt[Op.lte] = new Date(endDate);
      }

      // Estadísticas generales
      const generalStats = await SubscriptionPayment.findOne({
        attributes: [
          [literal('COUNT(*)'), 'totalPayments'],
          [literal('COUNT(CASE WHEN status = \'COMPLETED\' THEN 1 END)'), 'completedPayments'],
          [literal('COUNT(CASE WHEN status = \'PENDING\' THEN 1 END)'), 'pendingPayments'],
          [literal('COUNT(CASE WHEN status = \'FAILED\' THEN 1 END)'), 'failedPayments'],
          [literal('SUM(CASE WHEN status = \'COMPLETED\' THEN amount ELSE 0 END)'), 'totalRevenue'],
          [literal('SUM(CASE WHEN status = \'COMPLETED\' THEN net_amount ELSE 0 END)'), 'netRevenue'],
          [literal('SUM(CASE WHEN status = \'COMPLETED\' THEN commission_fee ELSE 0 END)'), 'totalCommissions'],
          [literal('AVG(CASE WHEN status = \'COMPLETED\' THEN amount END)'), 'avgPaymentAmount']
        ],
        where: whereClause,
        raw: true
      });

      // Estadísticas por método de pago
      const paymentMethodStats = await SubscriptionPayment.findAll({
        attributes: [
          'paymentMethod',
          [literal('COUNT(*)'), 'count'],
          [literal('SUM(CASE WHEN status = \'COMPLETED\' THEN amount ELSE 0 END)'), 'revenue']
        ],
        where: whereClause,
        group: ['paymentMethod'],
        raw: true
      });

      // Estadísticas por estado
      const statusStats = await SubscriptionPayment.findAll({
        attributes: [
          'status',
          [literal('COUNT(*)'), 'count'],
          [literal('SUM(amount)'), 'totalAmount']
        ],
        where: whereClause,
        group: ['status'],
        raw: true
      });

      res.json({
        success: true,
        data: {
          general: {
            totalPayments: parseInt(generalStats.totalPayments) || 0,
            completedPayments: parseInt(generalStats.completedPayments) || 0,
            pendingPayments: parseInt(generalStats.pendingPayments) || 0,
            failedPayments: parseInt(generalStats.failedPayments) || 0,
            totalRevenue: parseFloat(generalStats.totalRevenue) || 0,
            netRevenue: parseFloat(generalStats.netRevenue) || 0,
            totalCommissions: parseFloat(generalStats.totalCommissions) || 0,
            avgPaymentAmount: parseFloat(generalStats.avgPaymentAmount) || 0
          },
          byPaymentMethod: paymentMethodStats,
          byStatus: statusStats
        }
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas de pagos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = OwnerPaymentController;