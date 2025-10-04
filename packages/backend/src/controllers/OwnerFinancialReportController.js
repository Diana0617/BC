const { Op, literal, fn, col } = require('sequelize');
const { 
  OwnerFinancialReport, 
  SubscriptionPayment, 
  BusinessSubscription, 
  Business, 
  SubscriptionPlan 
} = require('../models');
const PaginationService = require('../services/PaginationService');

class OwnerFinancialReportController {

  /**
   * Obtener todos los reportes financieros
   */
  static async getAllReports(req, res) {
    try {
      const { 
        reportType, 
        startDate, 
        endDate,
        status,
        page = 1, 
        limit = 20 
      } = req.query;

      // Construir filtros
      const where = {};
      
      if (reportType) {
        where.reportType = reportType;
      }
      
      if (status) {
        where.status = status;
      }
      
      if (startDate || endDate) {
        where.startDate = {};
        if (startDate) where.startDate[Op.gte] = new Date(startDate);
        if (endDate) where.startDate[Op.lte] = new Date(endDate);
      }

      const result = await PaginationService.paginate(OwnerFinancialReport, {
        page: parseInt(page),
        limit: parseInt(limit),
        where,
        order: [['generatedAt', 'DESC']]
      });

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error obteniendo reportes financieros:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener un reporte específico por ID
   */
  static async getReportById(req, res) {
    try {
      const { id } = req.params;

      const report = await OwnerFinancialReport.findByPk(id);

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Reporte financiero no encontrado'
        });
      }

      res.json({
        success: true,
        data: report
      });

    } catch (error) {
      console.error('Error obteniendo reporte financiero:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Generar un nuevo reporte financiero
   */
  static async generateReport(req, res) {
    try {
      const {
        reportType,
        startDate,
        endDate,
        currency = 'COP'
      } = req.body;

      // Validaciones
      if (!reportType || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'reportType, startDate y endDate son requeridos'
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Verificar si ya existe un reporte para este período
      const reportPeriod = OwnerFinancialReportController.generateReportPeriod(reportType, start);
      const existingReport = await OwnerFinancialReport.findOne({
        where: {
          reportType,
          reportPeriod
        }
      });

      if (existingReport) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un reporte para este período',
          data: existingReport
        });
      }

      // Crear reporte en estado GENERATING
      const report = await OwnerFinancialReport.create({
        reportType,
        reportPeriod,
        startDate: start,
        endDate: end,
        currency,
        status: 'GENERATING',
        generatedBy: 'MANUAL'
      });

      // Generar datos del reporte en background
      setImmediate(async () => {
        try {
          await OwnerFinancialReportController.calculateReportData(report.id, start, end);
        } catch (error) {
          console.error('Error generando datos del reporte:', error);
          await OwnerFinancialReport.update(
            { status: 'FAILED' },
            { where: { id: report.id } }
          );
        }
      });

      res.status(201).json({
        success: true,
        message: 'Reporte en generación. Será completado en unos momentos.',
        data: report
      });

    } catch (error) {
      console.error('Error generando reporte financiero:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener resumen ejecutivo de métricas actuales
   */
  static async getExecutiveSummary(req, res) {
    try {
      const { period = 'month' } = req.query; // month, quarter, year
      
      const now = new Date();
      let startDate, endDate;
      
      switch (period) {
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }

      // Obtener métricas de pagos
      const paymentStats = await SubscriptionPayment.findOne({
        attributes: [
          [literal('COUNT(*)'), 'totalPayments'],
          [literal('COUNT(CASE WHEN status = \'COMPLETED\' THEN 1 END)'), 'completedPayments'],
          [literal('SUM(CASE WHEN status = \'COMPLETED\' THEN "SubscriptionPayment"."amount" ELSE 0 END)'), 'totalRevenue'],
          // Use quoted model attribute names to match the actual column created by the model (camelCase)
          [literal('SUM(CASE WHEN status = \'COMPLETED\' THEN "SubscriptionPayment"."netAmount" ELSE 0 END)'), 'netRevenue'],
          [literal('SUM(CASE WHEN status = \'COMPLETED\' THEN "SubscriptionPayment"."commissionFee" ELSE 0 END)'), 'totalCommissions'],
          [literal('AVG(CASE WHEN status = \'COMPLETED\' THEN "SubscriptionPayment"."amount" END)'), 'avgPaymentAmount']
        ],
        where: {
          paidAt: {
            [Op.between]: [startDate, endDate]
          }
        },
        raw: true
      });

      // Obtener métricas de suscripciones
      const subscriptionStats = await BusinessSubscription.findOne({
        attributes: [
          [literal('COUNT(*)'), 'totalSubscriptions'],
          [literal('COUNT(CASE WHEN status = \'ACTIVE\' THEN 1 END)'), 'activeSubscriptions'],
          [literal('COUNT(CASE WHEN status = \'TRIAL\' THEN 1 END)'), 'trialSubscriptions'],
          [literal('COUNT(CASE WHEN status = \'CANCELED\' THEN 1 END)'), 'canceledSubscriptions']
        ],
        where: {
          startDate: {
            [Op.between]: [startDate, endDate]
          }
        },
        raw: true
      });

      // Obtener top 5 planes por ingresos
      const topPlans = await SubscriptionPlan.findAll({
        attributes: [
          'id', 'name', 'price',
          // Use the include alias "subscriptions" and its nested alias "subscriptions->payments"
          [literal('COUNT("subscriptions"."id")'), 'subscriptionCount'],
          [literal('SUM("subscriptions->payments"."amount")'), 'totalRevenue']
        ],
        include: [
          {
            model: BusinessSubscription,
            as: 'subscriptions',
            attributes: [],
            include: [
              {
                model: SubscriptionPayment,
                as: 'payments',
                attributes: [],
                where: {
                  status: 'COMPLETED',
                  paidAt: {
                    [Op.between]: [startDate, endDate]
                  }
                },
                required: false
              }
            ]
          }
        ],
        group: ['SubscriptionPlan.id'],
        // Order by the aliased aggregate. Use a quoted identifier so Postgres
        // doesn't try to resolve it as an unquoted column name (which caused
        // the "no existe la columna \"totalrevenue\"" error).
        order: [literal('"totalRevenue" DESC')],
        limit: 5,
        subQuery: false,
        raw: true
      });

      res.json({
        success: true,
        data: {
          period: {
            type: period,
            startDate,
            endDate
          },
          payments: {
            total: parseInt(paymentStats.totalPayments) || 0,
            completed: parseInt(paymentStats.completedPayments) || 0,
            totalRevenue: parseFloat(paymentStats.totalRevenue) || 0,
            netRevenue: parseFloat(paymentStats.netRevenue) || 0,
            totalCommissions: parseFloat(paymentStats.totalCommissions) || 0,
            avgPaymentAmount: parseFloat(paymentStats.avgPaymentAmount) || 0
          },
          subscriptions: {
            total: parseInt(subscriptionStats.totalSubscriptions) || 0,
            active: parseInt(subscriptionStats.activeSubscriptions) || 0,
            trial: parseInt(subscriptionStats.trialSubscriptions) || 0,
            canceled: parseInt(subscriptionStats.canceledSubscriptions) || 0
          },
          topPlans: topPlans.map(plan => ({
            id: plan.id,
            name: plan.name,
            price: parseFloat(plan.price),
            subscriptionCount: parseInt(plan.subscriptionCount) || 0,
            totalRevenue: parseFloat(plan.totalRevenue) || 0
          }))
        }
      });

    } catch (error) {
      console.error('Error obteniendo resumen ejecutivo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Método auxiliar para generar el período del reporte
   */
  static generateReportPeriod(reportType, date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    switch (reportType) {
      case 'DAILY':
        return `${year}-${month}-${day}`;
      case 'WEEKLY':
        const weekNumber = Math.ceil(date.getDate() / 7);
        return `${year}-${month}-W${weekNumber}`;
      case 'MONTHLY':
        return `${year}-${month}`;
      case 'QUARTERLY':
        const quarter = Math.ceil((date.getMonth() + 1) / 3);
        return `${year}-Q${quarter}`;
      case 'YEARLY':
        return `${year}`;
      default:
        return `${year}-${month}`;
    }
  }

  /**
   * Método auxiliar para calcular datos del reporte
   */
  static async calculateReportData(reportId, startDate, endDate) {
    try {
      // Obtener datos de pagos para el período
      const paymentData = await SubscriptionPayment.findOne({
        attributes: [
          [literal('COUNT(*)'), 'totalPayments'],
          [literal('COUNT(CASE WHEN status = \'COMPLETED\' THEN 1 END)'), 'completedPayments'],
          [literal('COUNT(CASE WHEN status = \'PENDING\' THEN 1 END)'), 'pendingPayments'],
          [literal('COUNT(CASE WHEN status = \'FAILED\' THEN 1 END)'), 'failedPayments'],
          [literal('COUNT(CASE WHEN status IN (\'REFUNDED\', \'PARTIALLY_REFUNDED\') THEN 1 END)'), 'refundedPayments'],
          [literal('SUM(CASE WHEN status = \'COMPLETED\' THEN "SubscriptionPayment"."amount" ELSE 0 END)'), 'totalRevenue'],
          [literal('SUM(CASE WHEN status = \'COMPLETED\' THEN "SubscriptionPayment"."netAmount" ELSE 0 END)'), 'netRevenue'],
          [literal('SUM(CASE WHEN status = \'COMPLETED\' THEN "SubscriptionPayment"."commissionFee" ELSE 0 END)'), 'totalCommissions'],
          [literal('AVG(CASE WHEN status = \'COMPLETED\' THEN ("SubscriptionPayment"."commissionFee" / NULLIF("SubscriptionPayment"."amount",0)) * 100 END)'), 'avgCommissionRate']
        ],
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        },
        raw: true
      });

      // Obtener datos de suscripciones para el período
      const subscriptionData = await BusinessSubscription.findOne({
        attributes: [
          [literal('COUNT(CASE WHEN created_at BETWEEN :startDate AND :endDate THEN 1 END)'), 'newSubscriptions'],
          [literal('COUNT(CASE WHEN status = \'ACTIVE\' AND end_date BETWEEN :startDate AND :endDate THEN 1 END)'), 'renewedSubscriptions'],
          [literal('COUNT(CASE WHEN status = \'CANCELED\' AND canceled_at BETWEEN :startDate AND :endDate THEN 1 END)'), 'canceledSubscriptions'],
          [literal('COUNT(CASE WHEN status IN (\'ACTIVE\', \'TRIAL\') THEN 1 END)'), 'activeSubscriptions']
        ],
        replacements: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        raw: true
      });

      // Calcular métricas adicionales
      const totalSubscriptions = parseInt(subscriptionData.newSubscriptions) || 0;
      const canceledSubscriptions = parseInt(subscriptionData.canceledSubscriptions) || 0;
      const churnRate = totalSubscriptions > 0 ? (canceledSubscriptions / totalSubscriptions) * 100 : 0;
      const retentionRate = 100 - churnRate;

      // Actualizar el reporte con los datos calculados
      await OwnerFinancialReport.update({
        // Métricas de ingresos
        totalRevenue: parseFloat(paymentData.totalRevenue) || 0,
        subscriptionRevenue: parseFloat(paymentData.totalRevenue) || 0,
        netRevenue: parseFloat(paymentData.netRevenue) || 0,
        
        // Métricas de pagos
        totalPayments: parseInt(paymentData.totalPayments) || 0,
        completedPayments: parseInt(paymentData.completedPayments) || 0,
        failedPayments: parseInt(paymentData.failedPayments) || 0,
        pendingPayments: parseInt(paymentData.pendingPayments) || 0,
        refundedPayments: parseInt(paymentData.refundedPayments) || 0,
        
        // Métricas de comisiones
        totalCommissions: parseFloat(paymentData.totalCommissions) || 0,
        averageCommissionRate: parseFloat(paymentData.avgCommissionRate) || 0,
        
        // Métricas de suscripciones
        newSubscriptions: parseInt(subscriptionData.newSubscriptions) || 0,
        renewedSubscriptions: parseInt(subscriptionData.renewedSubscriptions) || 0,
        canceledSubscriptions: parseInt(subscriptionData.canceledSubscriptions) || 0,
        activeSubscriptions: parseInt(subscriptionData.activeSubscriptions) || 0,
        
        // Métricas adicionales
        churnRate: churnRate,
        retentionRate: retentionRate,
        
        // Estado
        status: 'COMPLETED',
        generatedAt: new Date()
      }, {
        where: { id: reportId }
      });

      console.log(`✅ Reporte financiero ${reportId} generado exitosamente`);

    } catch (error) {
      console.error('Error calculando datos del reporte:', error);
      throw error;
    }
  }

  /**
   * Eliminar un reporte financiero
   */
  static async deleteReport(req, res) {
    try {
      const { id } = req.params;

      const report = await OwnerFinancialReport.findByPk(id);

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Reporte financiero no encontrado'
        });
      }

      await report.destroy();

      res.json({
        success: true,
        message: 'Reporte financiero eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando reporte financiero:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = OwnerFinancialReportController;