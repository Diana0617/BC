/**
 * Controlador para manejo de verificación de suscripciones
 * Endpoints para OWNER para monitorear y gestionar estados de suscripciones
 */

const SubscriptionStatusService = require('../services/SubscriptionStatusService');
const CronJobManager = require('../utils/CronJobManager');
const { BusinessSubscription, Business, SubscriptionPlan, SubscriptionPayment } = require('../models');
const { Op } = require('sequelize');

class SubscriptionStatusController {

  /**
   * Obtener resumen general de estados de suscripciones
   */
  static async getStatusSummary(req, res) {
    try {
      const summary = await BusinessSubscription.findAll({
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['status']
      });

      const attention = await SubscriptionStatusService.getSubscriptionsRequiringAttention();

      res.json({
        success: true,
        data: {
          statusDistribution: summary.reduce((acc, item) => {
            acc[item.status] = parseInt(item.dataValues.count);
            return acc;
          }, {}),
          attention: {
            expiringSoon: attention.expiringSoon,
            overdue: attention.overdue,
            pendingPayments: attention.pendingPayments
          },
          lastCheck: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error obteniendo resumen de estados:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Ejecutar verificación manual de suscripciones
   */
  static async runManualCheck(req, res) {
    try {
      const result = await CronJobManager.runManualSubscriptionCheck();

      res.json({
        success: true,
        data: result,
        message: 'Verificación manual completada exitosamente.'
      });

    } catch (error) {
      console.error('Error en verificación manual:', error);
      res.status(500).json({
        success: false,
        message: 'Error ejecutando verificación manual.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener suscripciones que requieren atención
   */
  static async getAttentionRequired(req, res) {
    try {
      const attention = await SubscriptionStatusService.getSubscriptionsRequiringAttention();

      res.json({
        success: true,
        data: attention
      });

    } catch (error) {
      console.error('Error obteniendo suscripciones que requieren atención:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Verificar estado específico de una suscripción
   */
  static async checkSpecificSubscription(req, res) {
    try {
      const { businessId } = req.params;

      const result = await SubscriptionStatusService.checkBusinessSubscription(businessId);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error verificando suscripción específica:', error);
      res.status(500).json({
        success: false,
        message: 'Error verificando suscripción.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Confirmar un pago pendiente (cambiar status a CONFIRMED)
   */
  static async confirmPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const { notes } = req.body;

      const result = await SubscriptionStatusService.processConfirmedPayment(paymentId);

      // Agregar nota de confirmación si se proporciona
      if (notes) {
        await SubscriptionPayment.update(
          { 
            verificationNotes: notes,
            verifiedAt: new Date(),
            verifiedBy: req.user.id
          },
          { where: { id: paymentId } }
        );
      }

      res.json({
        success: true,
        data: result,
        message: 'Pago confirmado y suscripción extendida exitosamente.'
      });

    } catch (error) {
      console.error('Error confirmando pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error confirmando el pago.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Rechazar un pago pendiente
   */
  static async rejectPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'La razón del rechazo es requerida.'
        });
      }

      await SubscriptionPayment.update(
        { 
          status: 'REJECTED',
          verificationNotes: reason,
          verifiedAt: new Date(),
          verifiedBy: req.user.id
        },
        { where: { id: paymentId } }
      );

      res.json({
        success: true,
        message: 'Pago rechazado exitosamente.'
      });

    } catch (error) {
      console.error('Error rechazando pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error rechazando el pago.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener historial de cambios de estado
   */
  static async getStatusHistory(req, res) {
    try {
      const { businessId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const offset = (page - 1) * limit;

      // Obtener pagos relacionados con la suscripción
      const subscription = await BusinessSubscription.findOne({
        where: { businessId }
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Suscripción no encontrada.'
        });
      }

      const payments = await SubscriptionPayment.findAndCountAll({
        where: { businessSubscriptionId: subscription.id },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: require('../models').User,
            as: 'receiptUploader',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
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
      console.error('Error obteniendo historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener todos los pagos de suscripciones (exitosos y fallidos)
   */
  static async getAllSubscriptionPayments(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status, 
        paymentMethod,
        dateFrom,
        dateTo,
        businessId,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      
      // Construir filtros
      const whereClause = {};
      
      if (status) {
        whereClause.status = status;
      }
      
      if (paymentMethod) {
        whereClause.paymentMethod = paymentMethod;
      }
      
      if (dateFrom || dateTo) {
        whereClause.createdAt = {};
        if (dateFrom) {
          whereClause.createdAt[Op.gte] = new Date(dateFrom);
        }
        if (dateTo) {
          whereClause.createdAt[Op.lte] = new Date(dateTo);
        }
      }

      // Incluir modelos relacionados
      const includeClause = [
        {
          model: BusinessSubscription,
          as: 'subscription',
          attributes: ['id', 'status', 'startDate', 'endDate'],
          include: [
            {
              model: Business,
              as: 'business',
              attributes: ['id', 'name', 'email', 'subdomain', 'status'],
              where: businessId ? { id: businessId } : undefined
            },
            {
              model: SubscriptionPlan,
              as: 'plan',
              attributes: ['id', 'name', 'price', 'currency', 'duration']
            }
          ]
        }
      ];

      const payments = await SubscriptionPayment.findAndCountAll({
        where: whereClause,
        include: includeClause,
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
      });

      // Calcular estadísticas básicas
      const statusStats = await SubscriptionPayment.findAll({
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('SubscriptionPayment.id')), 'count'],
          [require('sequelize').fn('SUM', require('sequelize').col('SubscriptionPayment.amount')), 'totalAmount']
        ],
        include: [
          {
            model: BusinessSubscription,
            as: 'subscription',
            attributes: [],
            include: [
              {
                model: Business,
                as: 'business',
                attributes: [],
                where: businessId ? { id: businessId } : undefined
              }
            ]
          }
        ],
        where: whereClause,
        group: ['SubscriptionPayment.status'],
        raw: true
      });

      const stats = statusStats.reduce((acc, stat) => {
        acc[stat.status] = {
          count: parseInt(stat.count),
          totalAmount: parseFloat(stat.totalAmount) || 0
        };
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          payments: payments.rows,
          pagination: {
            total: payments.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(payments.count / limit)
          },
          stats: stats,
          filters: {
            status,
            paymentMethod,
            dateFrom,
            dateTo,
            businessId,
            sortBy,
            sortOrder
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo pagos de suscripciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = SubscriptionStatusController;