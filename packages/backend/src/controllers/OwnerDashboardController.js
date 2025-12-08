/**
 * Controlador para el dashboard del Owner
 * Proporciona endpoints para métricas, estadísticas y gráficos
 */

const OwnerDashboardService = require('../services/OwnerDashboardService');

/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardMetrics:
 *       type: object
 *       properties:
 *         totalBusinesses:
 *           type: integer
 *           description: Total de negocios activos
 *         totalRevenue:
 *           type: number
 *           description: Ingresos totales en centavos
 *         totalSubscriptions:
 *           type: integer
 *           description: Total de suscripciones activas
 *         averageRevenue:
 *           type: number
 *           description: Ingreso promedio por negocio
 *         growthRate:
 *           type: number
 *           description: Tasa de crecimiento vs período anterior
 *         period:
 *           type: string
 *           description: Período de las métricas
 */

class OwnerDashboardController {

  /**
   * @swagger
   * /api/owner/dashboard/metrics:
   *   get:
   *     summary: 📊 Obtener métricas principales del dashboard
   *     description: Retorna las métricas clave para el dashboard del Owner
   *     tags: [👤 Owner - Dashboard]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: period
   *         schema:
   *           type: string
   *           enum: [thisMonth, lastMonth, thisYear, lastYear]
   *           default: thisMonth
   *         description: Período para calcular las métricas
   *     responses:
   *       200:
   *         description: Métricas obtenidas exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/DashboardMetrics'
   *                 message:
   *                   type: string
   *                   example: "Métricas principales obtenidas correctamente"
   *       401:
   *         description: No autorizado - Token inválido
   *       403:
   *         description: Forbidden - No es Owner
   *       500:
   *         description: Error interno del servidor
   */
  static async getMainMetrics(req, res) {
    try {
      const { period = 'thisMonth' } = req.query;
      
      const metrics = await OwnerDashboardService.getMainMetrics(period);

      res.json({
        success: true,
        data: metrics,
        message: 'Métricas principales obtenidas correctamente'
      });

    } catch (error) {
      console.error('Error obteniendo métricas principales:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo métricas del dashboard',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * @swagger
   * /api/owner/dashboard/revenue-chart:
   *   get:
   *     summary: 📈 Obtener datos para gráfico de ingresos
   *     description: Retorna datos para graficar ingresos por mes
   *     tags: [👤 Owner - Dashboard]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: months
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 24
   *           default: 6
   *         description: Número de meses hacia atrás para el gráfico
   *     responses:
   *       200:
   *         description: Datos del gráfico obtenidos exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     chartData:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           month:
   *                             type: string
   *                             example: "2024-01"
   *                           revenue:
   *                             type: number
   *                             example: 1500000
   *                           count:
   *                             type: integer
   *                             example: 15
   *                     period:
   *                       type: string
   *                       example: "6 meses"
   *       400:
   *         description: Parámetros inválidos
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  static async getRevenueChart(req, res) {
    try {
      const { months = 6 } = req.query;
      const monthsNumber = parseInt(months);

      if (monthsNumber < 1 || monthsNumber > 24) {
        return res.status(400).json({
          success: false,
          message: 'El parámetro months debe estar entre 1 y 24'
        });
      }

      const chartData = await OwnerDashboardService.getPaymentsByMonth(monthsNumber);

      res.json({
        success: true,
        data: {
          chartData,
          period: `${monthsNumber} meses`,
          totalDataPoints: chartData.length
        },
        message: 'Datos de gráfico de ingresos obtenidos correctamente'
      });

    } catch (error) {
      console.error('Error obteniendo gráfico de ingresos:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo datos del gráfico',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener distribución de planes para gráfico circular
   */
  static async getPlanDistribution(req, res) {
    try {
      const distribution = await OwnerDashboardService.getPlanDistribution();

      res.json({
        success: true,
        data: {
          distribution,
          totalPlans: distribution.length,
          totalSubscriptions: distribution.reduce((sum, plan) => sum + plan.value, 0)
        },
        message: 'Distribución de planes obtenida correctamente'
      });

    } catch (error) {
      console.error('Error obteniendo distribución de planes:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo distribución de planes',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener top negocios más activos
   */
  static async getTopBusinesses(req, res) {
    try {
      const { limit = 10 } = req.query;
      const limitNumber = Math.min(parseInt(limit), 50); // Máximo 50

      const topBusinesses = await OwnerDashboardService.getTopActiveBusinesses(limitNumber);

      res.json({
        success: true,
        data: {
          businesses: topBusinesses,
          totalShown: topBusinesses.length,
          requestedLimit: limitNumber
        },
        message: 'Top negocios obtenidos correctamente'
      });

    } catch (error) {
      console.error('Error obteniendo top negocios:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo negocios más activos',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener estadísticas de conversión y crecimiento
   */
  static async getGrowthStats(req, res) {
    try {
      const { period = 'thisMonth' } = req.query;

      const [
        conversionRate,
        businessGrowth,
        revenueTrend
      ] = await Promise.all([
        OwnerDashboardService.getTrialToActiveConversionRate(),
        OwnerDashboardService.getBusinessGrowthRate(),
        OwnerDashboardService.getRevenueTrend()
      ]);

      res.json({
        success: true,
        data: {
          conversionRate: {
            value: conversionRate,
            description: 'Porcentaje de trials que se convierten a suscripción activa'
          },
          businessGrowth: {
            value: businessGrowth,
            description: 'Crecimiento de negocios comparado con el mes anterior'
          },
          revenueTrend: {
            value: revenueTrend,
            description: 'Tendencia de ingresos comparado con el mes anterior'
          }
        },
        message: 'Estadísticas de crecimiento obtenidas correctamente'
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas de crecimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas de crecimiento',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener resumen rápido para widgets
   */
  static async getQuickSummary(req, res) {
    try {
      const [
        totalRevenue,
        activeSubscriptions,
        totalBusinesses,
        thisMonthRevenue
      ] = await Promise.all([
        OwnerDashboardService.getTotalRevenue(),
        OwnerDashboardService.getActiveSubscriptionsCount(),
        OwnerDashboardService.getTotalBusinessesCount(),
        OwnerDashboardService.getRevenueInPeriod(
          new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          new Date()
        )
      ]);

      res.json({
        success: true,
        data: {
          widgets: [
            {
              title: 'Ingresos Totales',
              value: totalRevenue,
              format: 'currency',
              icon: 'dollar'
            },
            {
              title: 'Ingresos Este Mes',
              value: thisMonthRevenue,
              format: 'currency',
              icon: 'calendar'
            },
            {
              title: 'Suscripciones Activas',
              value: activeSubscriptions,
              format: 'number',
              icon: 'subscription'
            },
            {
              title: 'Total Negocios',
              value: totalBusinesses,
              format: 'number',
              icon: 'business'
            }
          ]
        },
        message: 'Resumen rápido obtenido correctamente'
      });

    } catch (error) {
      console.error('Error obteniendo resumen rápido:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo resumen del dashboard',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Endpoint para exportar datos (para uso futuro)
   */
  static async exportData(req, res) {
    try {
      const { format = 'json', period = 'thisMonth' } = req.query;

      if (!['json', 'csv'].includes(format)) {
        return res.status(400).json({
          success: false,
          message: 'Formato debe ser json o csv'
        });
      }

      const data = await OwnerDashboardService.getMainMetrics(period);

      if (format === 'json') {
        res.json({
          success: true,
          data,
          exportedAt: new Date().toISOString(),
          period
        });
      } else {
        // Para CSV implementar más adelante
        res.status(501).json({
          success: false,
          message: 'Exportación a CSV no implementada aún'
        });
      }

    } catch (error) {
      console.error('Error exportando datos:', error);
      res.status(500).json({
        success: false,
        message: 'Error exportando datos del dashboard',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = OwnerDashboardController;