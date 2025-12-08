const { Op } = require('sequelize');
const { Business, BusinessSubscription, SubscriptionPlan, User } = require('../models');
const PaginationService = require('../services/PaginationService');

class OwnerTrialController {

  /**
   * Obtener lista de trials activos y próximos a expirar
   */
  static async getActiveTrials(req, res) {
    try {
      const { 
        status = 'TRIAL',
        expiresIn = 30, // días
        page = 1, 
        limit = 20,
        sortBy = 'trialEndDate',
        sortOrder = 'ASC'
      } = req.query;

      // Filtros base
      const where = {
        status: status === 'all' ? ['TRIAL', 'ACTIVE'] : [status]
      };

      // Filtro por fecha de expiración
      if (expiresIn && expiresIn !== 'all') {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + parseInt(expiresIn));
        
        where.trialEndDate = {
          [Op.lte]: expirationDate
        };
      }

      // Paginación
      const paginationOptions = PaginationService.getPaginationOptions(page, limit);

      const trials = await Business.findAndCountAll({
        where,
        include: [
          {
            model: BusinessSubscription,
            as: 'subscription',
            include: [
              {
                model: SubscriptionPlan,
                as: 'plan',
                attributes: ['id', 'name', 'price', 'currency', 'trialDays']
              }
            ]
          },
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        ...paginationOptions
      });

      // Calcular días restantes para cada trial
      const trialsWithDaysLeft = trials.rows.map(trial => {
        const trialData = trial.toJSON();
        if (trialData.trialEndDate) {
          const now = new Date();
          const endDate = new Date(trialData.trialEndDate);
          const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
          trialData.daysLeft = Math.max(0, daysLeft);
          trialData.isExpired = daysLeft <= 0;
          trialData.isExpiringSoon = daysLeft <= 3 && daysLeft > 0;
        }
        return trialData;
      });

      const pagination = PaginationService.formatPagination(
        trials.count, 
        page, 
        limit
      );

      res.json({
        success: true,
        data: {
          trials: trialsWithDaysLeft,
          pagination,
          summary: {
            total: trials.count,
            expiringSoon: trialsWithDaysLeft.filter(t => t.isExpiringSoon).length,
            expired: trialsWithDaysLeft.filter(t => t.isExpired).length
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo trials:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Crear trial manual para un negocio específico
   */
  static async createManualTrial(req, res) {
    try {
      const { businessId, trialDays = 30, reason } = req.body;

      if (!businessId || !trialDays) {
        return res.status(400).json({
          success: false,
          message: 'businessId y trialDays son obligatorios'
        });
      }

      // Verificar que el negocio existe
      const business = await Business.findByPk(businessId);
      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'Negocio no encontrado'
        });
      }

      // Verificar que el negocio no esté ya en trial activo
      if (business.status === 'TRIAL' && business.trialEndDate > new Date()) {
        return res.status(400).json({
          success: false,
          message: 'El negocio ya tiene un trial activo'
        });
      }

      // Calcular fecha de finalización del trial
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + parseInt(trialDays));

      // Actualizar el negocio
      await business.update({
        status: 'TRIAL',
        trialEndDate,
        updatedAt: new Date()
      });

      // Actualizar la suscripción si existe
      const subscription = await BusinessSubscription.findOne({
        where: { businessId }
      });

      if (subscription) {
        await subscription.update({
          status: 'TRIAL',
          trialEndDate,
          updatedAt: new Date()
        });
      }

      // Obtener datos actualizados
      const updatedBusiness = await Business.findByPk(businessId, {
        include: [
          {
            model: BusinessSubscription,
            as: 'subscription',
            include: [
              {
                model: SubscriptionPlan,
                as: 'plan',
                attributes: ['id', 'name', 'price', 'currency']
              }
            ]
          }
        ]
      });

      res.json({
        success: true,
        message: `Trial de ${trialDays} días creado exitosamente`,
        data: {
          business: updatedBusiness,
          trialInfo: {
            startDate: new Date(),
            endDate: trialEndDate,
            durationDays: trialDays,
            reason: reason || 'Trial manual creado por Owner'
          }
        }
      });

    } catch (error) {
      console.error('Error creando trial manual:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Extender duración de un trial existente
   */
  static async extendTrial(req, res) {
    try {
      const { businessId } = req.params;
      const { additionalDays, reason } = req.body;

      if (!additionalDays || additionalDays <= 0) {
        return res.status(400).json({
          success: false,
          message: 'additionalDays debe ser un número positivo'
        });
      }

      // Buscar el negocio
      const business = await Business.findByPk(businessId);
      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'Negocio no encontrado'
        });
      }

      // Verificar que esté en trial
      if (business.status !== 'TRIAL') {
        return res.status(400).json({
          success: false,
          message: 'El negocio debe estar en estado TRIAL para extender el trial'
        });
      }

      // Calcular nueva fecha de finalización
      const currentEndDate = new Date(business.trialEndDate);
      const newEndDate = new Date(currentEndDate);
      newEndDate.setDate(newEndDate.getDate() + parseInt(additionalDays));

      // Actualizar el negocio
      await business.update({
        trialEndDate: newEndDate
      });

      // Actualizar la suscripción
      const subscription = await BusinessSubscription.findOne({
        where: { businessId }
      });

      if (subscription) {
        await subscription.update({
          trialEndDate: newEndDate
        });
      }

      res.json({
        success: true,
        message: `Trial extendido por ${additionalDays} días adicionales`,
        data: {
          businessId,
          previousEndDate: currentEndDate,
          newEndDate,
          additionalDays: parseInt(additionalDays),
          reason: reason || 'Extensión manual por Owner'
        }
      });

    } catch (error) {
      console.error('Error extendiendo trial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Convertir trial a suscripción activa manualmente
   */
  static async convertTrialToActive(req, res) {
    try {
      const { businessId } = req.params;
      const { planId, reason } = req.body;

      // Buscar el negocio
      const business = await Business.findByPk(businessId, {
        include: [
          {
            model: BusinessSubscription,
            as: 'subscription'
          }
        ]
      });

      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'Negocio no encontrado'
        });
      }

      // Verificar que esté en trial
      if (business.status !== 'TRIAL') {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden convertir negocios en estado TRIAL'
        });
      }

      // Verificar el plan si se especifica
      let plan = null;
      if (planId) {
        plan = await SubscriptionPlan.findByPk(planId);
        if (!plan || !plan.isActive) {
          return res.status(400).json({
            success: false,
            message: 'Plan no válido o inactivo'
          });
        }
      }

      // Actualizar el negocio
      await business.update({
        status: 'ACTIVE',
        trialEndDate: null // Limpiar fecha de trial
      });

      // Actualizar la suscripción
      if (business.subscription) {
        const updateData = {
          status: 'ACTIVE',
          trialEndDate: null,
          activatedAt: new Date()
        };

        if (planId) {
          updateData.planId = planId;
        }

        await business.subscription.update(updateData);
      }

      // Obtener datos actualizados
      const updatedBusiness = await Business.findByPk(businessId, {
        include: [
          {
            model: BusinessSubscription,
            as: 'subscription',
            include: [
              {
                model: SubscriptionPlan,
                as: 'plan',
                attributes: ['id', 'name', 'price', 'currency']
              }
            ]
          }
        ]
      });

      res.json({
        success: true,
        message: 'Trial convertido a suscripción activa exitosamente',
        data: {
          business: updatedBusiness,
          conversionInfo: {
            convertedAt: new Date(),
            newPlan: plan ? { id: plan.id, name: plan.name } : null,
            reason: reason || 'Conversión manual por Owner'
          }
        }
      });

    } catch (error) {
      console.error('Error convirtiendo trial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Cancelar trial antes de tiempo
   */
  static async cancelTrial(req, res) {
    try {
      const { businessId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'La razón de cancelación es obligatoria'
        });
      }

      // Buscar el negocio
      const business = await Business.findByPk(businessId);
      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'Negocio no encontrado'
        });
      }

      // Verificar que esté en trial
      if (business.status !== 'TRIAL') {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden cancelar negocios en estado TRIAL'
        });
      }

      // Actualizar el negocio
      await business.update({
        status: 'INACTIVE',
        trialEndDate: new Date() // Marcar como finalizado ahora
      });

      // Actualizar la suscripción
      const subscription = await BusinessSubscription.findOne({
        where: { businessId }
      });

      if (subscription) {
        await subscription.update({
          status: 'CANCELED',
          trialEndDate: new Date(),
          cancellation_reason: reason
        });
      }

      res.json({
        success: true,
        message: 'Trial cancelado exitosamente',
        data: {
          businessId,
          canceledAt: new Date(),
          reason
        }
      });

    } catch (error) {
      console.error('Error cancelando trial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener estadísticas detalladas de trials
   */
  static async getTrialStats(req, res) {
    try {
      const { period = 'last30days' } = req.query;

      // Configurar rango de fechas según período
      let dateFilter = {};
      const now = new Date();
      
      switch (period) {
        case 'last7days':
          dateFilter = {
            createdAt: {
              [Op.gte]: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            }
          };
          break;
        case 'last30days':
          dateFilter = {
            createdAt: {
              [Op.gte]: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            }
          };
          break;
        case 'last90days':
          dateFilter = {
            createdAt: {
              [Op.gte]: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
            }
          };
          break;
        default:
          // Sin filtro de fecha para 'all'
          break;
      }

      // Estadísticas generales
      const [
        activeTrials,
        totalTrials,
        convertedTrials,
        canceledTrials,
        expiringSoon
      ] = await Promise.all([
        // Trials activos actualmente
        Business.count({
          where: { 
            status: 'TRIAL',
            trialEndDate: { [Op.gt]: now }
          }
        }),
        
        // Total de trials creados en el período
        Business.count({
          where: { 
            status: ['TRIAL', 'ACTIVE', 'INACTIVE'],
            ...dateFilter
          }
        }),
        
        // Trials convertidos a activos
        Business.count({
          where: { 
            status: 'ACTIVE',
            ...dateFilter
          }
        }),
        
        // Trials cancelados/inactivos
        Business.count({
          where: { 
            status: 'INACTIVE',
            ...dateFilter
          }
        }),
        
        // Trials que expiran en los próximos 3 días
        Business.count({
          where: { 
            status: 'TRIAL',
            trialEndDate: {
              [Op.between]: [now, new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)]
            }
          }
        })
      ]);

      // Calcular tasas de conversión
      const conversionRate = totalTrials > 0 ? (convertedTrials / totalTrials) * 100 : 0;
      const cancellationRate = totalTrials > 0 ? (canceledTrials / totalTrials) * 100 : 0;

      res.json({
        success: true,
        data: {
          period,
          activeTrials,
          totalTrials,
          convertedTrials,
          canceledTrials,
          expiringSoon,
          rates: {
            conversion: Math.round(conversionRate * 100) / 100,
            cancellation: Math.round(cancellationRate * 100) / 100
          },
          health: {
            status: conversionRate > 20 ? 'good' : conversionRate > 10 ? 'warning' : 'needs_attention',
            message: conversionRate > 20 
              ? 'Excelente tasa de conversión de trials'
              : conversionRate > 10
              ? 'Tasa de conversión moderada, hay oportunidades de mejora'
              : 'Tasa de conversión baja, revisar estrategia de trials'
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas de trials:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = OwnerTrialController;