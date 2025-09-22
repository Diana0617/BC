/**
 * Controlador para manejo de verificación de suscripciones
 * Endpoints para OWNER para monitorear y gestionar estados de suscripciones
 */

const SubscriptionStatusService = require('../services/SubscriptionStatusService');
const CronJobManager = require('../utils/CronJobManager');
const { BusinessSubscription, Business, SubscriptionPlan, SubscriptionPayment } = require('../models');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');

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
        sortOrder = 'DESC',
        search
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

      if (search) {
        whereClause[Op.or] = [
          { externalReference: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { notes: { [Op.iLike]: `%${search}%` } },
          Sequelize.literal(`CAST("SubscriptionPayment"."status" AS TEXT) ILIKE '%${search}%'`),
        ];
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
              where: search ? {
                [Op.or]: [
                  { name: { [Op.iLike]: `%${search}%` } },
                  { email: { [Op.iLike]: `%${search}%` } }
                ],
                ...(search && {
                  [Op.and]: [
                    Sequelize.literal(`CAST("subscription->business"."status" AS TEXT) ILIKE '%${search}%'`)
                  ]
                })
              } : (businessId ? { id: businessId } : undefined)
            },
            {
              model: SubscriptionPlan,
              as: 'plan',
              attributes: ['id', 'name', 'price', 'currency', 'duration'],
              where: search ? {
                name: { [Op.iLike]: `%${search}%` }
              } : undefined
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

  /**
   * Obtener todas las suscripciones del Owner
   */
  static async getAllSubscriptions(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status,
        planId,
        businessId,
        startDate,
        endDate,
        expiring,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      
      // Construir filtros
      const whereClause = {};
      
      if (status) whereClause.status = status;
      if (planId) whereClause.subscriptionPlanId = planId;
      if (businessId) whereClause.businessId = businessId;
      
      if (startDate || endDate) {
        whereClause.startDate = {};
        if (startDate) whereClause.startDate[Op.gte] = new Date(startDate);
        if (endDate) whereClause.startDate[Op.lte] = new Date(endDate);
      }
      
      if (expiring === 'true') {
        const in30Days = new Date();
        in30Days.setDate(in30Days.getDate() + 30);
        whereClause.endDate = {
          [Op.gte]: new Date(),
          [Op.lte]: in30Days
        };
      }

      const subscriptions = await BusinessSubscription.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Business,
            as: 'business',
            attributes: ['id', 'name', 'email', 'subdomain']
          },
          {
            model: SubscriptionPlan,
            as: 'plan',
            attributes: ['id', 'name', 'price', 'currency']
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Calcular estadísticas básicas
      const stats = {
        totalSubscriptions: subscriptions.count,
        activeSubscriptions: subscriptions.rows.filter(s => s.status === 'ACTIVE').length,
        expiredSubscriptions: subscriptions.rows.filter(s => s.status === 'EXPIRED').length,
        suspendedSubscriptions: subscriptions.rows.filter(s => s.status === 'SUSPENDED').length,
        cancelledSubscriptions: subscriptions.rows.filter(s => s.status === 'CANCELLED').length
      };

      res.json({
        success: true,
        data: {
          subscriptions: subscriptions.rows.map(sub => ({
            id: sub.id,
            businessId: sub.businessId,
            businessName: sub.business?.name || 'N/A',
            businessEmail: sub.business?.email || 'N/A',
            businessSubdomain: sub.business?.subdomain || 'N/A',
            status: sub.status,
            currentPlan: {
              id: sub.plan?.id || null,
              name: sub.plan?.name || 'N/A',
              price: sub.plan?.price || 0,
              currency: sub.plan?.currency || 'COP'
            },
            startDate: sub.startDate,
            endDate: sub.endDate,
            autoRenewal: sub.autoRenewal,
            createdAt: sub.createdAt,
            updatedAt: sub.updatedAt
          })),
          pagination: {
            total: subscriptions.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(subscriptions.count / limit)
          },
          stats
        }
      });

    } catch (error) {
      console.error('Error obteniendo todas las suscripciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener estadísticas generales de suscripciones
   */
  static async getSubscriptionStats(req, res) {
    try {
      // Obtener conteo por estado
      const statusStats = await BusinessSubscription.findAll({
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['status']
      });

      // Obtener estadísticas adicionales
      const totalSubscriptions = await BusinessSubscription.count();
      
      // Suscripciones próximas a vencer (próximos 30 días)
      const expiringSoon = await BusinessSubscription.count({
        where: {
          status: 'ACTIVE',
          endDate: {
            [Op.gte]: new Date(),
            [Op.lte]: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        }
      });

      // Suscripciones vencidas sin renovar
      const overdueSubscriptions = await BusinessSubscription.count({
        where: {
          status: 'EXPIRED',
          endDate: {
            [Op.lt]: new Date()
          }
        }
      });

      // Construir respuesta de estadísticas
      const stats = {
        totalSubscriptions,
        activeSubscriptions: 0,
        expiredSubscriptions: 0,
        suspendedSubscriptions: 0,
        cancelledSubscriptions: 0,
        expiringSoon,
        overdue: overdueSubscriptions
      };

      // Mapear resultados de estados
      statusStats.forEach(stat => {
        const status = stat.dataValues.status;
        const count = parseInt(stat.dataValues.count);

        switch (status) {
          case 'ACTIVE':
            stats.activeSubscriptions = count;
            break;
          case 'EXPIRED':
            stats.expiredSubscriptions = count;
            break;
          case 'SUSPENDED':
            stats.suspendedSubscriptions = count;
            break;
          case 'CANCELLED':
            stats.cancelledSubscriptions = count;
            break;
        }
      });

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas de suscripciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Verificar estado de suscripción del negocio actual
   * Para uso desde rutas de Business (businessId viene del middleware/header)
   */
  static async checkBusinessSubscriptionStatus(req, res) {
    try {
      // El businessId viene del middleware de autenticación
      const businessId = req.user?.businessId;

      if (!businessId) {
        return res.status(400).json({
          success: false,
          message: 'ID de negocio requerido'
        });
      }

      const result = await SubscriptionStatusService.checkBusinessSubscription(businessId);

      res.json({
        success: true,
        subscription: result
      });

    } catch (error) {
      console.error('Error verificando suscripción del negocio:', error);
      res.status(500).json({
        success: false,
        message: 'Error verificando suscripción.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = SubscriptionStatusController;