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

class OwnerDashboardService {

  /**
   * Obtener métricas principales del dashboard
   */
  static async getMainMetrics(dateFilter = null) {
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
  }

  /**
   * Obtener ingresos totales de todos los pagos confirmados
   */
  static async getTotalRevenue() {
    try {
      const result = await SubscriptionPayment.sum('amount', {
        where: {
          status: 'CONFIRMED'
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
          status: 'CONFIRMED',
          paymentDate: {
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
   */
  static async getRevenueTrend() {
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
      const [totalTrials, conversions] = await Promise.all([
        BusinessSubscription.count({
          where: {
            [Op.or]: [
              { status: 'TRIAL' },
              { status: 'ACTIVE' },
              { status: 'EXPIRED' }
            ]
          }
        }),
        BusinessSubscription.count({
          where: {
            status: 'ACTIVE',
            previousStatus: 'TRIAL'
          }
        })
      ]);

      if (totalTrials === 0) return 0;
      
      const rate = (conversions / totalTrials) * 100;
      return parseFloat(rate.toFixed(2));
    } catch (error) {
      console.error('Error calculando tasa de conversión:', error);
      return 0;
    }
  }

  /**
   * Obtener pagos agrupados por mes para gráficos
   */
  static async getPaymentsByMonth(months = 6) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const results = await SubscriptionPayment.findAll({
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('paymentDate')), 'month'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: {
          status: 'CONFIRMED',
          paymentDate: {
            [Op.between]: [startDate, endDate]
          }
        },
        group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('paymentDate'))],
        order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('paymentDate')), 'ASC']],
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
  }

  /**
   * Obtener distribución de planes para gráfico circular
   */
  static async getPlanDistribution() {
    try {
      const results = await BusinessSubscription.findAll({
        attributes: [
          [sequelize.col('SubscriptionPlan.name'), 'planName'],
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
        group: ['SubscriptionPlan.id', 'SubscriptionPlan.name'],
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
            as: 'subscription',
            attributes: ['status', 'currentPeriodEnd'],
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
        subscriptionStatus: business.subscription?.status
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