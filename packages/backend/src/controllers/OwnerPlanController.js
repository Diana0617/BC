/**
 * Controlador para gestión de planes de suscripción (OWNER)
 * Permite al OWNER crear, editar, activar/desactivar y gestionar planes
 */

const { SubscriptionPlan, BusinessSubscription, Business, Module } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

class OwnerPlanController {

  /**
   * Listar todos los planes con estadísticas
   */
  static async getAllPlans(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status = 'all',
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      if (status !== 'all') {
        whereClause.status = status.toUpperCase();
      }

      const plans = await SubscriptionPlan.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: BusinessSubscription,
            as: 'subscriptions',
            attributes: [
              [sequelize.fn('COUNT', sequelize.col('subscriptions.id')), 'totalSubscriptions'],
              [sequelize.fn('COUNT', sequelize.literal('CASE WHEN subscriptions.status = \'ACTIVE\' THEN 1 END')), 'activeSubscriptions']
            ],
            required: false
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        group: ['SubscriptionPlan.id'],
        subQuery: false
      });

      // Calcular estadísticas adicionales para cada plan
      const plansWithStats = await Promise.all(
        plans.rows.map(async (plan) => {
          const [revenue, conversionRate] = await Promise.all([
            this.getPlanRevenue(plan.id),
            this.getPlanConversionRate(plan.id)
          ]);

          return {
            ...plan.toJSON(),
            statistics: {
              revenue,
              conversionRate,
              popularity: await this.getPlanPopularityRank(plan.id)
            }
          };
        })
      );

      res.json({
        success: true,
        data: {
          plans: plansWithStats,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(plans.count.length / limit),
            totalItems: plans.count.length,
            itemsPerPage: parseInt(limit)
          }
        },
        message: 'Planes obtenidos correctamente'
      });

    } catch (error) {
      console.error('Error obteniendo planes:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo lista de planes',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener un plan específico con detalles completos
   */
  static async getPlanById(req, res) {
    try {
      const { planId } = req.params;

      const plan = await SubscriptionPlan.findByPk(planId, {
        include: [
          {
            model: BusinessSubscription,
            as: 'subscriptions',
            include: [
              {
                model: Business,
                as: 'business',
                attributes: ['id', 'name', 'email']
              }
            ]
          }
        ]
      });

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan no encontrado'
        });
      }

      // Obtener estadísticas detalladas
      const [revenue, conversionRate, usage] = await Promise.all([
        this.getPlanRevenue(planId),
        this.getPlanConversionRate(planId),
        this.getPlanUsageDetails(planId)
      ]);

      res.json({
        success: true,
        data: {
          plan: plan.toJSON(),
          statistics: {
            revenue,
            conversionRate,
            usage
          }
        },
        message: 'Plan obtenido correctamente'
      });

    } catch (error) {
      console.error('Error obteniendo plan:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo detalles del plan',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Crear un nuevo plan de suscripción
   */
  static async createPlan(req, res) {
    try {
      const {
        name,
        description,
        price,
        currency = 'COP',
        duration,
        durationType = 'MONTHS',
        maxUsers,
        maxClients,
        maxAppointments,
        storageLimit,
        trialDays = 0,
        features = {},
        limitations = {},
        isPopular = false
      } = req.body;

      // Validaciones básicas
      if (!name || !price || !duration) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, precio y duración son requeridos'
        });
      }

      // Verificar que no exista un plan con el mismo nombre
      const existingPlan = await SubscriptionPlan.findOne({
        where: { name: { [Op.iLike]: name } }
      });

      if (existingPlan) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un plan con ese nombre'
        });
      }

      const newPlan = await SubscriptionPlan.create({
        name,
        description,
        price,
        currency,
        duration,
        durationType,
        maxUsers,
        maxClients,
        maxAppointments,
        storageLimit,
        trialDays,
        features,
        limitations,
        isPopular,
        status: 'ACTIVE'
      });

      res.status(201).json({
        success: true,
        data: newPlan,
        message: 'Plan creado correctamente'
      });

    } catch (error) {
      console.error('Error creando plan:', error);
      res.status(500).json({
        success: false,
        message: 'Error creando plan de suscripción',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Actualizar un plan existente
   */
  static async updatePlan(req, res) {
    try {
      const { planId } = req.params;
      const updateData = req.body;

      const plan = await SubscriptionPlan.findByPk(planId);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan no encontrado'
        });
      }

      // Verificar si el plan tiene suscripciones activas antes de ciertos cambios
      if (updateData.price && plan.price !== updateData.price) {
        const activeSubscriptions = await BusinessSubscription.count({
          where: {
            planId,
            status: 'ACTIVE'
          }
        });

        if (activeSubscriptions > 0) {
          return res.status(409).json({
            success: false,
            message: 'No se puede cambiar el precio de un plan con suscripciones activas'
          });
        }
      }

      // Verificar nombre único si se está cambiando
      if (updateData.name && updateData.name !== plan.name) {
        const existingPlan = await SubscriptionPlan.findOne({
          where: { 
            name: { [Op.iLike]: updateData.name },
            id: { [Op.ne]: planId }
          }
        });

        if (existingPlan) {
          return res.status(409).json({
            success: false,
            message: 'Ya existe un plan con ese nombre'
          });
        }
      }

      await plan.update(updateData);

      res.json({
        success: true,
        data: plan,
        message: 'Plan actualizado correctamente'
      });

    } catch (error) {
      console.error('Error actualizando plan:', error);
      res.status(500).json({
        success: false,
        message: 'Error actualizando plan',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Cambiar estado de un plan (activar/desactivar)
   */
  static async changePlanStatus(req, res) {
    try {
      const { planId } = req.params;
      const { status } = req.body;

      if (!['ACTIVE', 'INACTIVE', 'DEPRECATED'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido. Debe ser ACTIVE, INACTIVE o DEPRECATED'
        });
      }

      const plan = await SubscriptionPlan.findByPk(planId);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan no encontrado'
        });
      }

      // Verificar si se puede desactivar
      if (status === 'INACTIVE' || status === 'DEPRECATED') {
        const activeSubscriptions = await BusinessSubscription.count({
          where: {
            planId,
            status: 'ACTIVE'
          }
        });

        if (activeSubscriptions > 0) {
          return res.status(409).json({
            success: false,
            message: `No se puede ${status === 'INACTIVE' ? 'desactivar' : 'deprecar'} un plan con suscripciones activas`,
            details: {
              activeSubscriptions
            }
          });
        }
      }

      await plan.update({ status });

      res.json({
        success: true,
        data: plan,
        message: `Plan ${status === 'ACTIVE' ? 'activado' : status === 'INACTIVE' ? 'desactivado' : 'deprecado'} correctamente`
      });

    } catch (error) {
      console.error('Error cambiando estado del plan:', error);
      res.status(500).json({
        success: false,
        message: 'Error cambiando estado del plan',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener estadísticas de uso de un plan
   */
  static async getPlanUsageStats(req, res) {
    try {
      const { planId } = req.params;

      const plan = await SubscriptionPlan.findByPk(planId);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan no encontrado'
        });
      }

      const [
        totalSubscriptions,
        activeSubscriptions,
        revenue,
        conversionRate,
        usageDetails
      ] = await Promise.all([
        BusinessSubscription.count({ where: { planId } }),
        BusinessSubscription.count({ where: { planId, status: 'ACTIVE' } }),
        this.getPlanRevenue(planId),
        this.getPlanConversionRate(planId),
        this.getPlanUsageDetails(planId)
      ]);

      res.json({
        success: true,
        data: {
          planId,
          planName: plan.name,
          statistics: {
            subscriptions: {
              total: totalSubscriptions,
              active: activeSubscriptions,
              conversionRate
            },
            financial: {
              revenue,
              averageRevenue: activeSubscriptions > 0 ? revenue / activeSubscriptions : 0
            },
            usage: usageDetails
          }
        },
        message: 'Estadísticas del plan obtenidas correctamente'
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas del plan:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas del plan',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // === MÉTODOS AUXILIARES ===

  /**
   * Calcular ingresos generados por un plan
   */
  static async getPlanRevenue(planId) {
    try {
      const result = await sequelize.query(`
        SELECT COALESCE(SUM(sp.amount), 0) as revenue
        FROM subscription_payments sp
        JOIN business_subscriptions bs ON sp.subscription_id = bs.id
        WHERE bs.plan_id = :planId AND sp.status = 'CONFIRMED'
      `, {
        replacements: { planId },
        type: sequelize.QueryTypes.SELECT
      });

      return parseFloat(result[0]?.revenue || 0);
    } catch (error) {
      console.error('Error calculando revenue del plan:', error);
      return 0;
    }
  }

  /**
   * Calcular tasa de conversión de trial a activo para un plan
   */
  static async getPlanConversionRate(planId) {
    try {
      const [total, converted] = await Promise.all([
        BusinessSubscription.count({
          where: {
            planId,
            status: { [Op.in]: ['TRIAL', 'ACTIVE', 'EXPIRED'] }
          }
        }),
        BusinessSubscription.count({
          where: {
            planId,
            status: 'ACTIVE',
            previousStatus: 'TRIAL'
          }
        })
      ]);

      return total > 0 ? parseFloat(((converted / total) * 100).toFixed(2)) : 0;
    } catch (error) {
      console.error('Error calculando tasa de conversión:', error);
      return 0;
    }
  }

  /**
   * Obtener ranking de popularidad de un plan
   */
  static async getPlanPopularityRank(planId) {
    try {
      const rankings = await sequelize.query(`
        SELECT 
          sp.id,
          sp.name,
          COUNT(bs.id) as subscription_count,
          RANK() OVER (ORDER BY COUNT(bs.id) DESC) as rank
        FROM subscription_plans sp
        LEFT JOIN business_subscriptions bs ON sp.id = bs.plan_id
        WHERE sp.status = 'ACTIVE'
        GROUP BY sp.id, sp.name
        ORDER BY subscription_count DESC
      `, {
        type: sequelize.QueryTypes.SELECT
      });

      const planRank = rankings.find(r => r.id === planId);
      return planRank ? parseInt(planRank.rank) : rankings.length + 1;
    } catch (error) {
      console.error('Error calculando ranking de popularidad:', error);
      return 0;
    }
  }

  /**
   * Obtener detalles de uso del plan
   */
  static async getPlanUsageDetails(planId) {
    try {
      // Esta función se puede expandir para incluir más detalles
      // Por ahora retorna información básica
      const activeSubscriptions = await BusinessSubscription.count({
        where: { planId, status: 'ACTIVE' }
      });

      return {
        activeSubscriptions,
        lastSubscriptionDate: await this.getLastSubscriptionDate(planId)
      };
    } catch (error) {
      console.error('Error obteniendo detalles de uso:', error);
      return {};
    }
  }

  /**
   * Obtener fecha de última suscripción
   */
  static async getLastSubscriptionDate(planId) {
    try {
      const lastSubscription = await BusinessSubscription.findOne({
        where: { planId },
        order: [['createdAt', 'DESC']],
        attributes: ['createdAt']
      });

      return lastSubscription ? lastSubscription.createdAt : null;
    } catch (error) {
      console.error('Error obteniendo última fecha de suscripción:', error);
      return null;
    }
  }
}

module.exports = OwnerPlanController;