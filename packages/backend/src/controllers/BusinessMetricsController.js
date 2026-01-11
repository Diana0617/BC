const { Appointment, BusinessExpense, Business, User, Service, Product, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Controlador para métricas del dashboard de Business
 */
class BusinessMetricsController {
  
  /**
   * Obtener métricas principales del negocio
   * GET /api/business/metrics?period=today|week|month
   */
  static async getMainMetrics(req, res) {
    try {
      const businessId = req.user.businessId;
      const { period = 'today' } = req.query;

      // Calcular fechas según el período
      const now = new Date();
      let startDate;
      
      switch (period) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = new Date(now.setHours(0, 0, 0, 0));
      }

      // 1. Métricas de ventas (usando paidAmount de appointments)
      const salesData = await Appointment.findAll({
        where: {
          businessId,
          paymentStatus: {
            [Op.in]: ['PAID', 'PARTIAL']
          },
          startTime: {
            [Op.gte]: startDate
          }
        },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('paidAmount')), 'totalSales'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalTransactions']
        ],
        raw: true
      });

      const totalSales = parseFloat(salesData[0]?.totalSales || 0);
      const totalTransactions = parseInt(salesData[0]?.totalTransactions || 0);

      // 2. Métricas de gastos
      const expensesData = await BusinessExpense.findAll({
        where: {
          businessId,
          createdAt: {
            [Op.gte]: startDate
          }
        },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('amount')), 'totalExpenses']
        ],
        raw: true
      });

      const totalExpenses = parseFloat(expensesData[0]?.totalExpenses || 0);
      const netIncome = totalSales - totalExpenses;

      // 3. Métricas de citas
      const appointmentsData = await Appointment.findAll({
        where: {
          businessId,
          startTime: {
            [Op.gte]: startDate
          }
        },
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      const appointmentStats = {
        total: 0,
        completed: 0,
        cancelled: 0,
        pending: 0,
        confirmed: 0
      };

      appointmentsData.forEach(stat => {
        const count = parseInt(stat.count);
        appointmentStats.total += count;
        
        if (stat.status === 'COMPLETED') appointmentStats.completed = count;
        if (stat.status === 'CANCELLED') appointmentStats.cancelled = count;
        if (stat.status === 'PENDING') appointmentStats.pending = count;
        if (stat.status === 'CONFIRMED') appointmentStats.confirmed = count;
      });

      // Calcular cambio porcentual (comparar con período anterior)
      // TODO: Implementar comparación con período anterior para mostrar tendencias

      res.json({
        success: true,
        data: {
          sales: {
            value: totalSales,
            formatted: new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0
            }).format(totalSales),
            transactions: totalTransactions,
            subtitle: `${totalTransactions} transacciones`,
            change: '+15%' // TODO: Calcular cambio real
          },
          income: {
            value: netIncome,
            formatted: new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0
            }).format(netIncome),
            subtitle: 'Ingresos netos',
            change: '+8%' // TODO: Calcular cambio real
          },
          appointments: {
            value: appointmentStats.total,
            completed: appointmentStats.completed,
            pending: appointmentStats.pending,
            confirmed: appointmentStats.confirmed,
            subtitle: `${appointmentStats.completed} completados`,
            change: `+${appointmentStats.completed}` // TODO: Calcular cambio real
          },
          cancelled: {
            value: appointmentStats.cancelled,
            percentage: appointmentStats.total > 0 
              ? Math.round((appointmentStats.cancelled / appointmentStats.total) * 100) 
              : 0,
            subtitle: `${appointmentStats.total > 0 ? Math.round((appointmentStats.cancelled / appointmentStats.total) * 100) : 0}% cancelación`,
            change: '-2' // TODO: Calcular cambio real
          },
          expenses: {
            value: totalExpenses,
            formatted: new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0
            }).format(totalExpenses),
            subtitle: `Gastos del ${period === 'today' ? 'día' : period === 'week' ? 'semana' : 'mes'}`,
            change: '+5%' // TODO: Calcular cambio real
          }
        },
        period,
        generatedAt: new Date()
      });

    } catch (error) {
      console.error('Error obteniendo métricas principales:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener métricas del negocio',
        details: error.message
      });
    }
  }

  /**
   * Obtener desglose de ventas
   * GET /api/business/metrics/sales-breakdown?period=today|week|month
   */
  static async getSalesBreakdown(req, res) {
    try {
      const businessId = req.user.businessId;
      const { period = 'today' } = req.query;

      const now = new Date();
      let startDate;
      
      switch (period) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = new Date(now.setHours(0, 0, 0, 0));
      }

      // Obtener totales de appointments con pago
      const salesData = await Appointment.findAll({
        where: {
          businessId,
          paymentStatus: {
            [Op.in]: ['PAID', 'PARTIAL']
          },
          startTime: {
            [Op.gte]: startDate
          }
        },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('paidAmount')), 'total'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        raw: true
      });

      const totalSales = parseFloat(salesData[0]?.total || 0);
      const totalCount = parseInt(salesData[0]?.count || 0);
      const averageTicket = totalCount > 0 ? totalSales / totalCount : 0;

      res.json({
        success: true,
        data: {
          services: {
            value: parseFloat(totalSales),
            formatted: new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0
            }).format(totalSales)
          },
          products: {
            value: 0,
            formatted: new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0
            }).format(0)
          },
          mostUsedMethod: {
            method: 'N/A',
            count: 0
          },
          averageTicket: {
            value: averageTicket,
            formatted: new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0
            }).format(averageTicket)
          },
          total: {
            value: totalSales,
            transactions: totalCount
          },
          methodsByType: []
        },
        period,
        generatedAt: new Date()
      });

    } catch (error) {
      console.error('Error obteniendo desglose de ventas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener desglose de ventas',
        details: error.message
      });
    }
  }

  /**
   * Obtener resumen de estado de citas
   * GET /api/business/metrics/appointments-summary?period=today|week|month
   */
  static async getAppointmentsSummary(req, res) {
    try {
      const businessId = req.user.businessId;
      const { period = 'today' } = req.query;

      const now = new Date();
      let startDate;
      
      switch (period) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = new Date(now.setHours(0, 0, 0, 0));
      }

      const appointmentsData = await Appointment.findAll({
        where: {
          businessId,
          startTime: {
            [Op.gte]: startDate
          }
        },
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      const stats = {
        completed: 0,
        pending: 0,
        cancelled: 0,
        confirmed: 0,
        total: 0
      };

      appointmentsData.forEach(stat => {
        const count = parseInt(stat.count);
        stats.total += count;
        
        if (stat.status === 'COMPLETED') stats.completed = count;
        if (stat.status === 'CANCELLED') stats.cancelled = count;
        if (stat.status === 'PENDING') stats.pending = count;
        if (stat.status === 'CONFIRMED') stats.confirmed = count;
      });

      // Calcular tasa de ocupación (citas completadas + confirmadas / total de slots disponibles)
      // TODO: Implementar cálculo real de slots disponibles
      const occupancyRate = stats.total > 0 
        ? Math.round(((stats.completed + stats.confirmed) / stats.total) * 100)
        : 0;

      res.json({
        success: true,
        data: {
          completed: stats.completed,
          pending: stats.pending,
          cancelled: stats.cancelled,
          confirmed: stats.confirmed,
          total: stats.total,
          occupancyRate: `${occupancyRate}%`,
          cancellationRate: stats.total > 0 
            ? `${Math.round((stats.cancelled / stats.total) * 100)}%`
            : '0%'
        },
        period,
        generatedAt: new Date()
      });

    } catch (error) {
      console.error('Error obteniendo resumen de citas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener resumen de citas',
        details: error.message
      });
    }
  }
}

module.exports = BusinessMetricsController;
