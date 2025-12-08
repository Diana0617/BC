/**
 * Servicio para generar métricas y datos del dashboard del Owner
 * Proporciona estadísticas de negocio, ingresos y suscripciones
 */

const { 
  BusinessSubscription, 
  SubscriptionPayment, 
  SubscriptionPlan, 
  Business, 
  User 
} = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { dashboardCache, CACHE_CONFIG } = require('../utils/cache');

class OwnerDashboardService {

  /**
   * Obtener métricas principales del dashboard con cache
   */
  static async getMainMetrics(dateFilter = null) {
    const cacheKey = `dashboard_metrics_${dateFilter || 'default'}`;
    
    return await dashboardCache.wrap(cacheKey, async () => {
      try {
        const { startDate, endDate } = this.getDateRange(dateFilter);

        const [
          totalRevenue,
          monthlyRevenue,
          activeSubscriptions,
          totalBusinesses,
          newBusinessesThisMonth,
          subscriptionsByStatus,
          paymentsByMonth
        ] = await Promise.all([
          this.getTotalRevenue(),
          this.getRevenueInPeriod(startDate, endDate),
          this.getActiveSubscriptionsCount(),
          this.getTotalBusinessesCount(),
          this.getNewBusinessesInPeriod(startDate, endDate),
          this.getSubscriptionsByStatus(),
          this.getPaymentsByMonth(6) // últimos 6 meses
        ]);

        return {
          revenue: {
            total: totalRevenue,
            thisMonth: monthlyRevenue,
            trend: await this.getRevenueTrend()
          },
          subscriptions: {
          active: activeSubscriptions,
          byStatus: subscriptionsByStatus,
          conversionRate: await this.getTrialToActiveConversionRate()
        },
        businesses: {
          total: totalBusinesses,
          newThisMonth: newBusinessesThisMonth,
          growthRate: await this.getBusinessGrowthRate()
        },
        charts: {
          monthlyPayments: paymentsByMonth,
          planDistribution: await this.getPlanDistribution()
        }
      };

      } catch (error) {
        console.error('Error obteniendo métricas principales:', error);
        throw new Error('Error calculando métricas del dashboard');
      }
    }, CACHE_CONFIG.DASHBOARD_METRICS);
  }

  /**
   * Obtener ingresos totales de todos los pagos confirmados
   */
  static async getTotalRevenue() {
    try {
      const result = await SubscriptionPayment.sum('amount', {
        where: {
          status: 'COMPLETED'
        }
      });
      return result || 0;
    } catch (error) {
      console.error('Error calculando ingresos totales:', error);
      return 0;
    }
  }

  /**
   * Obtener ingresos en un período específico
   */
  static async getRevenueInPeriod(startDate, endDate) {
    try {
      const result = await SubscriptionPayment.sum('amount', {
        where: {
          status: 'COMPLETED',
          paidAt: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      return result || 0;
    } catch (error) {
      console.error('Error calculando ingresos del período:', error);
      return 0;
    }
  }

  /**
   * Obtener tendencia de ingresos (comparación con período anterior)
   * Obtener tendencia de ingresos con cache
   */
  static async getRevenueTrend() {
    const cacheKey = 'dashboard_revenue_trend';
    
    return await dashboardCache.wrap(cacheKey, async () => {
      try {
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const [currentMonth, lastMonth] = await Promise.all([
          this.getRevenueInPeriod(currentMonthStart, now),
          this.getRevenueInPeriod(lastMonthStart, lastMonthEnd)
        ]);

        if (lastMonth === 0) return 0;
        
        const trend = ((currentMonth - lastMonth) / lastMonth) * 100;
        return parseFloat(trend.toFixed(2));
      } catch (error) {
        console.error('Error calculando tendencia de ingresos:', error);
        return 0;
      }
    }, CACHE_CONFIG.DASHBOARD_REVENUE);
  }

  /**
   * Obtener número de suscripciones activas
   */
  static async getActiveSubscriptionsCount() {
    try {
      return await BusinessSubscription.count({
        where: {
          status: 'ACTIVE'
        }
      });
    } catch (error) {
      console.error('Error contando suscripciones activas:', error);
      return 0;
    }
  }

  /**
   * Obtener suscripciones agrupadas por estado
   */
  static async getSubscriptionsByStatus() {
    try {
      const results = await BusinessSubscription.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      return results.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {});
    } catch (error) {
      console.error('Error obteniendo suscripciones por estado:', error);
      return {};
    }
  }

  /**
   * Obtener total de negocios registrados
   */
  static async getTotalBusinessesCount() {
    try {
      return await Business.count();
    } catch (error) {
      console.error('Error contando negocios totales:', error);
      return 0;
    }
  }

  /**
   * Obtener negocios nuevos en un período
   */
  static async getNewBusinessesInPeriod(startDate, endDate) {
    try {
      return await Business.count({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
    } catch (error) {
      console.error('Error contando negocios nuevos:', error);
      return 0;
    }
  }

  /**
   * Obtener tasa de crecimiento de negocios
   */
  static async getBusinessGrowthRate() {
    try {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const [currentMonth, lastMonth] = await Promise.all([
        this.getNewBusinessesInPeriod(currentMonthStart, now),
        this.getNewBusinessesInPeriod(lastMonthStart, lastMonthEnd)
      ]);

      if (lastMonth === 0) return currentMonth > 0 ? 100 : 0;
      
      const growth = ((currentMonth - lastMonth) / lastMonth) * 100;
      return parseFloat(growth.toFixed(2));
    } catch (error) {
      console.error('Error calculando crecimiento de negocios:', error);
      return 0;
    }
  }

  /**
   * Obtener tasa de conversión de TRIAL a ACTIVE
   */
  static async getTrialToActiveConversionRate() {
    try {
      // Temporal: usar un método simplificado sin previousStatus
      const [totalTrials, activeSubscriptions] = await Promise.all([
        BusinessSubscription.count({
          where: {
            status: 'TRIAL'
          }
        }),
        BusinessSubscription.count({
          where: {
            status: 'ACTIVE'
          }
        })
      ]);

      if (totalTrials === 0) return 0;
      
      // Temporal: calcular una tasa estimada basada en activos vs trials
      const totalActiveAndTrial = totalTrials + activeSubscriptions;
      const rate = totalActiveAndTrial === 0 ? 0 : (activeSubscriptions / totalActiveAndTrial) * 100;
      return parseFloat(rate.toFixed(2));
    } catch (error) {
      console.error('Error calculando tasa de conversión:', error);
      return 0;
    }
  }

  /**
   * Obtener pagos agrupados por mes para gráficos con cache
   */
  static async getPaymentsByMonth(months = 6) {
    const cacheKey = `dashboard_payments_by_month_${months}`;
    
    return await dashboardCache.wrap(cacheKey, async () => {
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        const results = await SubscriptionPayment.findAll({
          attributes: [
            [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('paidAt')), 'month'],
            [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          where: {
            status: 'COMPLETED',
            paidAt: {
              [Op.between]: [startDate, endDate]
            }
          },
          group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('paidAt'))],
          order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('paidAt')), 'ASC']],
          raw: true
        });

        return results.map(item => ({
          month: item.month,
          total: parseFloat(item.total || 0),
          count: parseInt(item.count || 0)
        }));
      } catch (error) {
        console.error('Error obteniendo pagos por mes:', error);
        return [];
      }
    }, CACHE_CONFIG.DASHBOARD_REVENUE);
  }

  /**
   * Obtener distribución de planes para gráfico circular con cache
   */
  static async getPlanDistribution() {
    const cacheKey = 'dashboard_plan_distribution';
    
    return await dashboardCache.wrap(cacheKey, async () => {
      try {
        const results = await BusinessSubscription.findAll({
          attributes: [
            [sequelize.col('plan.name'), 'planName'],
            [sequelize.fn('COUNT', sequelize.col('BusinessSubscription.id')), 'count']
          ],
          include: [
            {
              model: SubscriptionPlan,
              as: 'plan',
              attributes: []
            }
          ],
          where: {
            status: ['ACTIVE', 'TRIAL']
          },
          group: ['plan.id', 'plan.name'],
          raw: true
        });

        return results.map(item => ({
          name: item.planName,
          value: parseInt(item.count)
        }));
      } catch (error) {
        console.error('Error obteniendo distribución de planes:', error);
        return [];
      }
    }, CACHE_CONFIG.DASHBOARD_PLANS);
  }

  /**
   * Obtener top negocios más activos
   */
  static async getTopActiveBusinesses(limit = 10) {
    try {
      // Por ahora basado en fecha de última actividad
      // Luego se puede mejorar con métricas reales de actividad
      const results = await Business.findAll({
        attributes: [
          'id',
          'name',
          'email',
          'subdomain',
          'updatedAt'
        ],
        include: [
          {
            model: BusinessSubscription,
            as: 'subscriptions',
            attributes: ['status', 'endDate'],
            where: {
              status: 'ACTIVE'
            }
          }
        ],
        order: [['updatedAt', 'DESC']],
        limit,
        raw: false
      });

      return results.map(business => ({
        id: business.id,
        name: business.name,
        email: business.email,
        subdomain: business.subdomain,
        lastActivity: business.updatedAt,
        subscriptionStatus: business.subscriptions?.[0]?.status
      }));
    } catch (error) {
      console.error('Error obteniendo negocios activos:', error);
      return [];
    }
  }

  /**
   * Utilidad para obtener rangos de fechas
   */
  static getDateRange(filter) {
    const now = new Date();
    let startDate, endDate = now;

    switch (filter) {
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'last3Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'lastYear':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case 'thisMonth':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    return { startDate, endDate };
  }
}

module.exports = OwnerDashboardService;