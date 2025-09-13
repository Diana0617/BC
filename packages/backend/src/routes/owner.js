/**
 * Rutas específicas para el rol OWNER
 * 
 * Estas rutas contienen todas las funcionalidades administrativas
 * que solo puede usar el administrador de la plataforma.
 */

const express = require('express');
const router = express.Router();
const OwnerController = require('../controllers/OwnerController');
const OwnerDashboardController = require('../controllers/OwnerDashboardController');
const OwnerPlanController = require('../controllers/OwnerPlanController');
const { authenticateToken } = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');

// Importar rutas modulares
const ownerTrialsRoutes = require('./ownerTrials');

/**
 * @swagger
 * tags:
 *   - name: Owner Dashboard
 *     description: Dashboard y métricas administrativas para el Owner
 *   - name: Owner Plan Management
 *     description: Gestión de planes de suscripción por parte del Owner
 *   - name: Owner Business Management
 *     description: Gestión de negocios de la plataforma por parte del Owner
 *   - name: Owner Platform Stats
 *     description: Estadísticas globales de la plataforma
 */

// Middleware para autenticación y verificación de rol OWNER
router.use(authenticateToken);
router.use(ownerOnly);

// === DASHBOARD DEL OWNER ===

/**
 * @swagger
 * /api/owner/dashboard/metrics:
 *   get:
 *     tags:
 *       - Owner Dashboard
 *     summary: Obtener métricas principales del dashboard
 *     description: Recupera las métricas clave de la plataforma para el dashboard administrativo del Owner
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [thisMonth, lastMonth, last3Months, lastYear]
 *           default: thisMonth
 *         description: Período de tiempo para las métricas
 *         example: "thisMonth"
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
 *                   type: object
 *                   properties:
 *                     revenue:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           description: Ingresos totales del período
 *                           example: 15750.50
 *                         growth:
 *                           type: number
 *                           description: Porcentaje de crecimiento vs período anterior
 *                           example: 12.5
 *                         currency:
 *                           type: string
 *                           example: "COP"
 *                     subscriptions:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           description: Total de suscripciones activas
 *                           example: 156
 *                         new:
 *                           type: integer
 *                           description: Nuevas suscripciones en el período
 *                           example: 23
 *                         cancelled:
 *                           type: integer
 *                           description: Suscripciones canceladas en el período
 *                           example: 3
 *                         renewalRate:
 *                           type: number
 *                           description: Tasa de renovación (%)
 *                           example: 85.2
 *                     businesses:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           description: Total de negocios registrados
 *                           example: 134
 *                         active:
 *                           type: integer
 *                           description: Negocios activos
 *                           example: 128
 *                         newThisPeriod:
 *                           type: integer
 *                           description: Nuevos negocios en el período
 *                           example: 18
 *             example:
 *               success: true
 *               data:
 *                 revenue:
 *                   total: 15750.50
 *                   growth: 12.5
 *                   currency: "COP"
 *                 subscriptions:
 *                   total: 156
 *                   new: 23
 *                   cancelled: 3
 *                   renewalRate: 85.2
 *                 businesses:
 *                   total: 134
 *                   active: 128
 *                   newThisPeriod: 18
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/dashboard/metrics', OwnerDashboardController.getMainMetrics);

/**
 * @swagger
 * /api/owner/dashboard/summary:
 *   get:
 *     tags:
 *       - Owner Dashboard
 *     summary: Obtener resumen rápido para widgets
 *     description: Recupera un resumen condensado de información clave para widgets del dashboard del Owner
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen obtenido exitosamente
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
 *                     todayRevenue:
 *                       type: number
 *                       description: Ingresos del día actual
 *                       example: 540.25
 *                     pendingPayments:
 *                       type: integer
 *                       description: Pagos pendientes de verificación
 *                       example: 8
 *                     expiringSoon:
 *                       type: integer
 *                       description: Suscripciones que vencen en los próximos 7 días
 *                       example: 12
 *                     supportTickets:
 *                       type: integer
 *                       description: Tickets de soporte abiertos
 *                       example: 3
 *             example:
 *               success: true
 *               data:
 *                 todayRevenue: 540.25
 *                 pendingPayments: 8
 *                 expiringSoon: 12
 *                 supportTickets: 3
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/dashboard/summary', OwnerDashboardController.getQuickSummary);

/**
 * @swagger
 * /api/owner/dashboard/revenue-chart:
 *   get:
 *     tags:
 *       - Owner Dashboard
 *     summary: Obtener datos para gráfico de ingresos por mes
 *     description: Recupera datos históricos de ingresos para generar gráficos de tendencias mensuales
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
 *         description: Número de meses a mostrar en el gráfico
 *         example: 6
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
 *                             description: Mes en formato YYYY-MM
 *                             example: "2024-01"
 *                           monthName:
 *                             type: string
 *                             description: Nombre del mes
 *                             example: "Enero"
 *                           revenue:
 *                             type: number
 *                             description: Ingresos del mes
 *                             example: 12450.75
 *                           subscriptions:
 *                             type: integer
 *                             description: Número de suscripciones activas
 *                             example: 145
 *                     totalRevenue:
 *                       type: number
 *                       description: Ingresos totales del período
 *                       example: 67890.25
 *                     averageMonthlyRevenue:
 *                       type: number
 *                       description: Promedio mensual de ingresos
 *                       example: 11315.04
 *             example:
 *               success: true
 *               data:
 *                 chartData:
 *                   - month: "2024-01"
 *                     monthName: "Enero"
 *                     revenue: 12450.75
 *                     subscriptions: 145
 *                   - month: "2023-12"
 *                     monthName: "Diciembre"
 *                     revenue: 11980.50
 *                     subscriptions: 142
 *                 totalRevenue: 67890.25
 *                 averageMonthlyRevenue: 11315.04
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/dashboard/revenue-chart', OwnerDashboardController.getRevenueChart);

/**
 * @swagger
 * /api/owner/dashboard/plan-distribution:
 *   get:
 *     tags:
 *       - Owner Dashboard
 *     summary: Obtener distribución de planes para gráfico circular
 *     description: Proporciona la distribución de planes de suscripción activos para mostrar en gráfico circular del dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Distribución de planes obtenida exitosamente
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
 *                     planDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           planId:
 *                             type: string
 *                             example: "67508291234567890123456p"
 *                           planName:
 *                             type: string
 *                             example: "Plan Premium"
 *                           activeSubscriptions:
 *                             type: integer
 *                             description: Número de suscripciones activas
 *                             example: 45
 *                           percentage:
 *                             type: number
 *                             description: Porcentaje del total
 *                             example: 35.7
 *                           color:
 *                             type: string
 *                             description: Color sugerido para el gráfico
 *                             example: "#3498db"
 *                           revenue:
 *                             type: number
 *                             description: Ingresos generados por este plan
 *                             example: 4049.55
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalActiveSubscriptions:
 *                           type: integer
 *                           example: 126
 *                         totalPlans:
 *                           type: integer
 *                           example: 4
 *                         mostPopularPlan:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "Plan Premium"
 *                             subscriptions:
 *                               type: integer
 *                               example: 45
 *                         leastPopularPlan:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "Plan Básico"
 *                             subscriptions:
 *                               type: integer
 *                               example: 12
 *             example:
 *               success: true
 *               data:
 *                 planDistribution:
 *                   - planId: "67508291234567890123456p"
 *                     planName: "Plan Premium"
 *                     activeSubscriptions: 45
 *                     percentage: 35.7
 *                     color: "#3498db"
 *                     revenue: 4049.55
 *                   - planId: "67508291234567890123457p"
 *                     planName: "Plan Estándar"
 *                     activeSubscriptions: 38
 *                     percentage: 30.2
 *                     color: "#2ecc71"
 *                     revenue: 2280.00
 *                   - planId: "67508291234567890123458p"
 *                     planName: "Plan Profesional"
 *                     activeSubscriptions: 31
 *                     percentage: 24.6
 *                     color: "#f39c12"
 *                     revenue: 4650.00
 *                   - planId: "67508291234567890123459p"
 *                     planName: "Plan Básico"
 *                     activeSubscriptions: 12
 *                     percentage: 9.5
 *                     color: "#e74c3c"
 *                     revenue: 540.00
 *                 summary:
 *                   totalActiveSubscriptions: 126
 *                   totalPlans: 4
 *                   mostPopularPlan:
 *                     name: "Plan Premium"
 *                     subscriptions: 45
 *                   leastPopularPlan:
 *                     name: "Plan Básico"
 *                     subscriptions: 12
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/dashboard/plan-distribution', OwnerDashboardController.getPlanDistribution);

/**
 * @swagger
 * /api/owner/dashboard/top-businesses:
 *   get:
 *     tags:
 *       - Owner Dashboard
 *     summary: Obtener top negocios más activos
 *     description: Lista los negocios más activos de la plataforma basado en diferentes métricas de actividad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Número de negocios a mostrar
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [revenue, transactions, customers, growth]
 *           default: revenue
 *         description: Métrica para ordenar los resultados
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [thisMonth, lastMonth, last3Months, lastYear]
 *           default: thisMonth
 *         description: Período de tiempo para el análisis
 *     responses:
 *       200:
 *         description: Top negocios obtenidos exitosamente
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
 *                     topBusinesses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           businessId:
 *                             type: string
 *                             example: "67508291234567890123456a"
 *                           businessName:
 *                             type: string
 *                             example: "Salón Bella Vista"
 *                           owner:
 *                             type: string
 *                             example: "María González"
 *                           email:
 *                             type: string
 *                             format: email
 *                             example: "maria@salonbellavista.com"
 *                           currentPlan:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "Plan Premium"
 *                               price:
 *                                 type: number
 *                                 example: 89.99
 *                           metrics:
 *                             type: object
 *                             properties:
 *                               revenue:
 *                                 type: number
 *                                 description: Ingresos generados en el período
 *                                 example: 539.94
 *                               transactions:
 *                                 type: integer
 *                                 description: Número de transacciones
 *                                 example: 6
 *                               customers:
 *                                 type: integer
 *                                 description: Número de clientes activos
 *                                 example: 147
 *                               growth:
 *                                 type: number
 *                                 description: Porcentaje de crecimiento
 *                                 example: 12.5
 *                               lastActivity:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2024-12-01T08:30:00.000Z"
 *                           subscriptionStatus:
 *                             type: string
 *                             enum: [active, expired, suspended, trial]
 *                             example: active
 *                           registeredAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T10:00:00.000Z"
 *                           rank:
 *                             type: integer
 *                             description: Posición en el ranking
 *                             example: 1
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalBusinesses:
 *                           type: integer
 *                           example: 248
 *                         activeBusinesses:
 *                           type: integer
 *                           example: 195
 *                         period:
 *                           type: string
 *                           example: "thisMonth"
 *                         sortBy:
 *                           type: string
 *                           example: "revenue"
 *                         totalRevenue:
 *                           type: number
 *                           description: Ingresos totales del período
 *                           example: 12450.75
 *                         averageRevenue:
 *                           type: number
 *                           description: Ingreso promedio por negocio
 *                           example: 63.85
 *             example:
 *               success: true
 *               data:
 *                 topBusinesses:
 *                   - businessId: "67508291234567890123456a"
 *                     businessName: "Salón Bella Vista"
 *                     owner: "María González"
 *                     email: "maria@salonbellavista.com"
 *                     currentPlan:
 *                       name: "Plan Premium"
 *                       price: 89.99
 *                     metrics:
 *                       revenue: 539.94
 *                       transactions: 6
 *                       customers: 147
 *                       growth: 12.5
 *                       lastActivity: "2024-12-01T08:30:00.000Z"
 *                     subscriptionStatus: active
 *                     registeredAt: "2024-01-15T10:00:00.000Z"
 *                     rank: 1
 *                 summary:
 *                   totalBusinesses: 248
 *                   activeBusinesses: 195
 *                   period: "thisMonth"
 *                   sortBy: "revenue"
 *                   totalRevenue: 12450.75
 *                   averageRevenue: 63.85
 *       400:
 *         description: Parámetros de consulta inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "El parámetro 'limit' debe estar entre 1 y 50"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/dashboard/top-businesses', OwnerDashboardController.getTopBusinesses);

/**
 * @swagger
 * /api/owner/dashboard/growth-stats:
 *   get:
 *     tags:
 *       - Owner Dashboard
 *     summary: Obtener estadísticas de conversión y crecimiento
 *     description: Proporciona métricas detalladas de crecimiento, conversión y rendimiento de la plataforma
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [thisMonth, lastMonth, last3Months, lastYear, custom]
 *           default: thisMonth
 *         description: Período de tiempo para comparación
 *       - in: query
 *         name: compareWith
 *         schema:
 *           type: string
 *           enum: [previousPeriod, sameLastYear, none]
 *           default: previousPeriod
 *         description: Período de comparación para calcular crecimiento
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (solo si period=custom)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (solo si period=custom)
 *     responses:
 *       200:
 *         description: Estadísticas de crecimiento obtenidas exitosamente
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
 *                     period:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: string
 *                           example: "thisMonth"
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-12-01T00:00:00.000Z"
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-12-01T23:59:59.999Z"
 *                     growth:
 *                       type: object
 *                       properties:
 *                         newBusinesses:
 *                           type: object
 *                           properties:
 *                             current:
 *                               type: integer
 *                               example: 23
 *                             previous:
 *                               type: integer
 *                               example: 18
 *                             growth:
 *                               type: number
 *                               description: Porcentaje de crecimiento
 *                               example: 27.8
 *                             trend:
 *                               type: string
 *                               enum: [up, down, stable]
 *                               example: up
 *                         revenue:
 *                           type: object
 *                           properties:
 *                             current:
 *                               type: number
 *                               example: 12450.75
 *                             previous:
 *                               type: number
 *                               example: 11200.50
 *                             growth:
 *                               type: number
 *                               example: 11.2
 *                             trend:
 *                               type: string
 *                               example: up
 *                         activeSubscriptions:
 *                           type: object
 *                           properties:
 *                             current:
 *                               type: integer
 *                               example: 195
 *                             previous:
 *                               type: integer
 *                               example: 182
 *                             growth:
 *                               type: number
 *                               example: 7.1
 *                             trend:
 *                               type: string
 *                               example: up
 *                     conversion:
 *                       type: object
 *                       properties:
 *                         invitationToRegistration:
 *                           type: object
 *                           properties:
 *                             rate:
 *                               type: number
 *                               description: Tasa de conversión de invitación a registro (%)
 *                               example: 73.5
 *                             invitationsSent:
 *                               type: integer
 *                               example: 34
 *                             registrationsCompleted:
 *                               type: integer
 *                               example: 25
 *                         trialToSubscription:
 *                           type: object
 *                           properties:
 *                             rate:
 *                               type: number
 *                               description: Tasa de conversión de trial a suscripción (%)
 *                               example: 68.0
 *                             trialsStarted:
 *                               type: integer
 *                               example: 25
 *                             subscriptionsActivated:
 *                               type: integer
 *                               example: 17
 *                         churnRate:
 *                           type: number
 *                           description: Tasa de cancelación (%)
 *                           example: 8.5
 *                         renewalRate:
 *                           type: number
 *                           description: Tasa de renovación (%)
 *                           example: 91.5
 *                     performance:
 *                       type: object
 *                       properties:
 *                         averageRevenuePerUser:
 *                           type: number
 *                           description: ARPU - Ingreso promedio por usuario
 *                           example: 63.85
 *                         customerLifetimeValue:
 *                           type: number
 *                           description: CLV - Valor de vida del cliente
 *                           example: 765.20
 *                         paymentSuccessRate:
 *                           type: number
 *                           description: Tasa de éxito de pagos (%)
 *                           example: 94.7
 *                         averageTimeToFirstPayment:
 *                           type: integer
 *                           description: Tiempo promedio hasta primer pago (días)
 *                           example: 3
 *                     predictions:
 *                       type: object
 *                       properties:
 *                         nextMonthRevenue:
 *                           type: number
 *                           description: Predicción de ingresos del próximo mes
 *                           example: 13250.00
 *                         nextMonthNewBusinesses:
 *                           type: integer
 *                           description: Predicción de nuevos negocios
 *                           example: 26
 *                         confidence:
 *                           type: number
 *                           description: Nivel de confianza de las predicciones (%)
 *                           example: 87.3
 *             example:
 *               success: true
 *               data:
 *                 period:
 *                   current: "thisMonth"
 *                   startDate: "2024-12-01T00:00:00.000Z"
 *                   endDate: "2024-12-01T23:59:59.999Z"
 *                 growth:
 *                   newBusinesses:
 *                     current: 23
 *                     previous: 18
 *                     growth: 27.8
 *                     trend: up
 *                   revenue:
 *                     current: 12450.75
 *                     previous: 11200.50
 *                     growth: 11.2
 *                     trend: up
 *                   activeSubscriptions:
 *                     current: 195
 *                     previous: 182
 *                     growth: 7.1
 *                     trend: up
 *                 conversion:
 *                   invitationToRegistration:
 *                     rate: 73.5
 *                     invitationsSent: 34
 *                     registrationsCompleted: 25
 *                   trialToSubscription:
 *                     rate: 68.0
 *                     trialsStarted: 25
 *                     subscriptionsActivated: 17
 *                   churnRate: 8.5
 *                   renewalRate: 91.5
 *                 performance:
 *                   averageRevenuePerUser: 63.85
 *                   customerLifetimeValue: 765.20
 *                   paymentSuccessRate: 94.7
 *                   averageTimeToFirstPayment: 3
 *                 predictions:
 *                   nextMonthRevenue: 13250.00
 *                   nextMonthNewBusinesses: 26
 *                   confidence: 87.3
 *       400:
 *         description: Parámetros de consulta inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Período personalizado requiere startDate y endDate"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/dashboard/growth-stats', OwnerDashboardController.getGrowthStats);

/**
 * @swagger
 * /api/owner/dashboard/export:
 *   get:
 *     tags:
 *       - Owner Dashboard
 *     summary: Exportar datos del dashboard
 *     description: Exporta todos los datos del dashboard en diferentes formatos para análisis offline
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv, xlsx, pdf]
 *           default: json
 *         description: Formato de exportación
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [thisMonth, lastMonth, last3Months, lastYear, custom]
 *           default: thisMonth
 *         description: Período de datos a exportar
 *       - in: query
 *         name: sections
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [metrics, revenue, businesses, plans, growth, all]
 *           default: [all]
 *         style: form
 *         explode: false
 *         description: Secciones específicas a exportar
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (solo si period=custom)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (solo si period=custom)
 *       - in: query
 *         name: includeCharts
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir datos de gráficos (solo para PDF/XLSX)
 *     responses:
 *       200:
 *         description: Datos exportados exitosamente
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
 *                     exportInfo:
 *                       type: object
 *                       properties:
 *                         format:
 *                           type: string
 *                           example: "json"
 *                         fileName:
 *                           type: string
 *                           example: "dashboard_export_2024-12-01.json"
 *                         size:
 *                           type: string
 *                           description: Tamaño del archivo
 *                           example: "124.5 KB"
 *                         generatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-12-01T15:30:00.000Z"
 *                         period:
 *                           type: object
 *                           properties:
 *                             type:
 *                               type: string
 *                               example: "thisMonth"
 *                             startDate:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-12-01T00:00:00.000Z"
 *                             endDate:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-12-01T23:59:59.999Z"
 *                     downloadUrl:
 *                       type: string
 *                       description: URL temporal para descargar el archivo
 *                       example: "https://api.beautycontrol.com/downloads/temp/dashboard_export_abc123.json"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha de expiración del enlace de descarga
 *                       example: "2024-12-01T16:30:00.000Z"
 *                     sections:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["metrics", "revenue", "businesses", "plans", "growth"]
 *                     summary:
 *                       type: object
 *                       description: Resumen de los datos exportados
 *                       properties:
 *                         totalRecords:
 *                           type: integer
 *                           example: 1247
 *                         businesses:
 *                           type: integer
 *                           example: 195
 *                         transactions:
 *                           type: integer
 *                           example: 2458
 *                         plans:
 *                           type: integer
 *                           example: 4
 *             example:
 *               success: true
 *               data:
 *                 exportInfo:
 *                   format: "json"
 *                   fileName: "dashboard_export_2024-12-01.json"
 *                   size: "124.5 KB"
 *                   generatedAt: "2024-12-01T15:30:00.000Z"
 *                   period:
 *                     type: "thisMonth"
 *                     startDate: "2024-12-01T00:00:00.000Z"
 *                     endDate: "2024-12-01T23:59:59.999Z"
 *                 downloadUrl: "https://api.beautycontrol.com/downloads/temp/dashboard_export_abc123.json"
 *                 expiresAt: "2024-12-01T16:30:00.000Z"
 *                 sections: ["metrics", "revenue", "businesses", "plans", "growth"]
 *                 summary:
 *                   totalRecords: 1247
 *                   businesses: 195
 *                   transactions: 2458
 *                   plans: 4
 *           text/csv:
 *             schema:
 *               type: string
 *               description: Datos en formato CSV
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *               description: Archivo Excel con datos
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *               description: Reporte PDF con gráficos
 *       400:
 *         description: Parámetros de exportación inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Formato de exportación no soportado"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       429:
 *         description: Límite de exportaciones excedido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Límite de exportaciones por hora excedido. Inténtelo más tarde."
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/dashboard/export', OwnerDashboardController.exportData);

// === GESTIÓN DE PLANES DE SUSCRIPCIÓN ===

/**
 * @swagger
 * /api/owner/plans:
 *   get:
 *     tags:
 *       - Owner Plan Management
 *     summary: Listar todos los planes con estadísticas
 *     description: Obtiene una lista paginada de todos los planes de suscripción con sus estadísticas de uso
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Elementos por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, ACTIVE, INACTIVE, DEPRECATED]
 *           default: all
 *         description: Filtrar por estado del plan
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, name, price, activeSubscriptions, updatedAt]
 *           default: createdAt
 *         description: Campo para ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Orden de clasificación
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre o descripción del plan
 *     responses:
 *       200:
 *         description: Lista de planes obtenida exitosamente
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
 *                     plans:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "67508291234567890123456p"
 *                           name:
 *                             type: string
 *                             example: "Plan Premium"
 *                           description:
 *                             type: string
 *                             example: "Plan completo con todas las funcionalidades"
 *                           price:
 *                             type: number
 *                             example: 89.99
 *                           currency:
 *                             type: string
 *                             example: "COP"
 *                           duration:
 *                             type: integer
 *                             example: 1
 *                           durationType:
 *                             type: string
 *                             enum: [DAYS, WEEKS, MONTHS, YEARS]
 *                             example: "MONTHS"
 *                           status:
 *                             type: string
 *                             enum: [ACTIVE, INACTIVE, DEPRECATED]
 *                             example: "ACTIVE"
 *                           isPopular:
 *                             type: boolean
 *                             example: true
 *                           limits:
 *                             type: object
 *                             properties:
 *                               maxUsers:
 *                                 type: integer
 *                                 example: 10
 *                               maxClients:
 *                                 type: integer
 *                                 example: 1000
 *                               maxAppointments:
 *                                 type: integer
 *                                 example: 500
 *                               storageLimit:
 *                                 type: integer
 *                                 description: Límite en bytes
 *                                 example: 10737418240
 *                           trialDays:
 *                             type: integer
 *                             example: 15
 *                           features:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["appointments", "inventory", "reports", "analytics"]
 *                           statistics:
 *                             type: object
 *                             properties:
 *                               activeSubscriptions:
 *                                 type: integer
 *                                 example: 45
 *                               totalSubscriptions:
 *                                 type: integer
 *                                 example: 58
 *                               monthlyRevenue:
 *                                 type: number
 *                                 example: 4049.55
 *                               conversionRate:
 *                                 type: number
 *                                 description: Tasa de conversión trial-to-paid (%)
 *                                 example: 77.6
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-01T00:00:00.000Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-11-15T10:30:00.000Z"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 1
 *                         totalItems:
 *                           type: integer
 *                           example: 4
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         hasNext:
 *                           type: boolean
 *                           example: false
 *                         hasPrevious:
 *                           type: boolean
 *                           example: false
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalPlans:
 *                           type: integer
 *                           example: 4
 *                         activePlans:
 *                           type: integer
 *                           example: 3
 *                         inactivePlans:
 *                           type: integer
 *                           example: 1
 *                         deprecatedPlans:
 *                           type: integer
 *                           example: 0
 *                         totalActiveSubscriptions:
 *                           type: integer
 *                           example: 126
 *                         totalMonthlyRevenue:
 *                           type: number
 *                           example: 12450.75
 *             example:
 *               success: true
 *               data:
 *                 plans:
 *                   - id: "67508291234567890123456p"
 *                     name: "Plan Premium"
 *                     description: "Plan completo con todas las funcionalidades"
 *                     price: 89.99
 *                     currency: "COP"
 *                     duration: 1
 *                     durationType: "MONTHS"
 *                     status: "ACTIVE"
 *                     isPopular: true
 *                     limits:
 *                       maxUsers: 10
 *                       maxClients: 1000
 *                       maxAppointments: 500
 *                       storageLimit: 10737418240
 *                     trialDays: 15
 *                     features: ["appointments", "inventory", "reports", "analytics"]
 *                     statistics:
 *                       activeSubscriptions: 45
 *                       totalSubscriptions: 58
 *                       monthlyRevenue: 4049.55
 *                       conversionRate: 77.6
 *                     createdAt: "2024-01-01T00:00:00.000Z"
 *                     updatedAt: "2024-11-15T10:30:00.000Z"
 *                 pagination:
 *                   currentPage: 1
 *                   totalPages: 1
 *                   totalItems: 4
 *                   limit: 10
 *                   hasNext: false
 *                   hasPrevious: false
 *                 summary:
 *                   totalPlans: 4
 *                   activePlans: 3
 *                   inactivePlans: 1
 *                   deprecatedPlans: 0
 *                   totalActiveSubscriptions: 126
 *                   totalMonthlyRevenue: 12450.75
 *       400:
 *         description: Parámetros de consulta inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "El parámetro 'limit' debe estar entre 1 y 100"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/plans', OwnerPlanController.getAllPlans);

/**
 * @swagger
 * /api/owner/plans/{planId}:
 *   get:
 *     tags:
 *       - Owner Plan Management
 *     summary: Obtener detalles completos de un plan
 *     description: Obtiene información detallada de un plan específico incluyendo estadísticas completas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del plan
 *     responses:
 *       200:
 *         description: Detalles del plan obtenidos exitosamente
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
 *                     plan:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "67508291234567890123456p"
 *                         name:
 *                           type: string
 *                           example: "Plan Premium"
 *                         description:
 *                           type: string
 *                           example: "Plan completo con todas las funcionalidades"
 *                         price:
 *                           type: number
 *                           example: 89.99
 *                         currency:
 *                           type: string
 *                           example: "COP"
 *                         duration:
 *                           type: integer
 *                           example: 1
 *                         durationType:
 *                           type: string
 *                           enum: [DAYS, WEEKS, MONTHS, YEARS]
 *                           example: "MONTHS"
 *                         status:
 *                           type: string
 *                           enum: [ACTIVE, INACTIVE, DEPRECATED]
 *                           example: "ACTIVE"
 *                         isPopular:
 *                           type: boolean
 *                           example: true
 *                         limits:
 *                           type: object
 *                           properties:
 *                             maxUsers:
 *                               type: integer
 *                               example: 10
 *                             maxClients:
 *                               type: integer
 *                               example: 1000
 *                             maxAppointments:
 *                               type: integer
 *                               example: 500
 *                             storageLimit:
 *                               type: integer
 *                               description: Límite en bytes
 *                               example: 10737418240
 *                         trialDays:
 *                           type: integer
 *                           example: 15
 *                         features:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["appointments", "inventory", "reports", "analytics"]
 *                         moduleAccess:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               moduleId:
 *                                 type: string
 *                                 example: "m_appointments"
 *                               moduleName:
 *                                 type: string
 *                                 example: "Gestión de Citas"
 *                               enabled:
 *                                 type: boolean
 *                                 example: true
 *                               limitations:
 *                                 type: object
 *                                 properties:
 *                                   maxRecords:
 *                                     type: integer
 *                                     example: 500
 *                         statisticsDetailed:
 *                           type: object
 *                           properties:
 *                             subscriptions:
 *                               type: object
 *                               properties:
 *                                 active:
 *                                   type: integer
 *                                   example: 45
 *                                 total:
 *                                   type: integer
 *                                   example: 58
 *                                 trial:
 *                                   type: integer
 *                                   example: 8
 *                                 expired:
 *                                   type: integer
 *                                   example: 5
 *                             revenue:
 *                               type: object
 *                               properties:
 *                                 monthly:
 *                                   type: number
 *                                   example: 4049.55
 *                                 quarterly:
 *                                   type: number
 *                                   example: 12148.65
 *                                 yearly:
 *                                   type: number
 *                                   example: 48594.60
 *                             growth:
 *                               type: object
 *                               properties:
 *                                 subscriptionsLastMonth:
 *                                   type: number
 *                                   description: Crecimiento en % (último mes)
 *                                   example: 15.5
 *                                 revenueLastMonth:
 *                                   type: number
 *                                   description: Crecimiento en % (último mes)
 *                                   example: 12.3
 *                             churn:
 *                               type: object
 *                               properties:
 *                                 rate:
 *                                   type: number
 *                                   description: Tasa de cancelación (%)
 *                                   example: 8.6
 *                                 reasons:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       reason:
 *                                         type: string
 *                                         example: "Precio elevado"
 *                                       count:
 *                                         type: integer
 *                                         example: 3
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-01T00:00:00.000Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-11-15T10:30:00.000Z"
 *                         createdBy:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "67508291234567890123456o"
 *                             name:
 *                               type: string
 *                               example: "Admin Principal"
 *                             email:
 *                               type: string
 *                               example: "admin@beautyspa.com"
 *             example:
 *               success: true
 *               data:
 *                 plan:
 *                   id: "67508291234567890123456p"
 *                   name: "Plan Premium"
 *                   description: "Plan completo con todas las funcionalidades"
 *                   price: 89.99
 *                   currency: "COP"
 *                   duration: 1
 *                   durationType: "MONTHS"
 *                   status: "ACTIVE"
 *                   isPopular: true
 *                   limits:
 *                     maxUsers: 10
 *                     maxClients: 1000
 *                     maxAppointments: 500
 *                     storageLimit: 10737418240
 *                   trialDays: 15
 *                   features: ["appointments", "inventory", "reports", "analytics"]
 *                   moduleAccess:
 *                     - moduleId: "m_appointments"
 *                       moduleName: "Gestión de Citas"
 *                       enabled: true
 *                       limitations:
 *                         maxRecords: 500
 *                   statisticsDetailed:
 *                     subscriptions:
 *                       active: 45
 *                       total: 58
 *                       trial: 8
 *                       expired: 5
 *                     revenue:
 *                       monthly: 4049.55
 *                       quarterly: 12148.65
 *                       yearly: 48594.60
 *                     growth:
 *                       subscriptionsLastMonth: 15.5
 *                       revenueLastMonth: 12.3
 *                     churn:
 *                       rate: 8.6
 *                       reasons:
 *                         - reason: "Precio elevado"
 *                           count: 3
 *                   createdAt: "2024-01-01T00:00:00.000Z"
 *                   updatedAt: "2024-11-15T10:30:00.000Z"
 *                   createdBy:
 *                     id: "67508291234567890123456o"
 *                     name: "Admin Principal"
 *                     email: "admin@beautyspa.com"
 *       404:
 *         description: Plan no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Plan no encontrado"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/plans/:planId', OwnerPlanController.getPlanById);

/**
 * @swagger
 * /api/owner/plans:
 *   post:
 *     tags:
 *       - Owner Plan Management
 *     summary: Crear un nuevo plan de suscripción
 *     description: Crea un nuevo plan de suscripción con todas sus configuraciones y limitaciones
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - duration
 *               - durationType
 *               - limits
 *               - features
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Plan Premium Plus"
 *                 description: Nombre único del plan
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Plan completo con todas las funcionalidades y soporte 24/7"
 *                 description: Descripción detallada del plan
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 129.99
 *                 description: Precio del plan
 *               currency:
 *                 type: string
 *                 enum: [COP, USD, EUR]
 *                 default: "COP"
 *                 example: "COP"
 *                 description: Moneda del precio
 *               duration:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *                 description: Duración numérica
 *               durationType:
 *                 type: string
 *                 enum: [DAYS, WEEKS, MONTHS, YEARS]
 *                 example: "MONTHS"
 *                 description: Tipo de duración
 *               limits:
 *                 type: object
 *                 required:
 *                   - maxUsers
 *                   - maxClients
 *                   - maxAppointments
 *                   - storageLimit
 *                 properties:
 *                   maxUsers:
 *                     type: integer
 *                     minimum: 1
 *                     example: 15
 *                     description: Máximo número de usuarios
 *                   maxClients:
 *                     type: integer
 *                     minimum: 1
 *                     example: 2000
 *                     description: Máximo número de clientes
 *                   maxAppointments:
 *                     type: integer
 *                     minimum: 1
 *                     example: 1000
 *                     description: Máximo número de citas por mes
 *                   storageLimit:
 *                     type: integer
 *                     minimum: 1
 *                     example: 21474836480
 *                     description: Límite de almacenamiento en bytes (20GB)
 *               trialDays:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 365
 *                 default: 0
 *                 example: 30
 *                 description: Días de prueba gratuita
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["appointments", "inventory", "reports", "analytics", "multiuser", "api_access"]
 *                 description: Lista de características incluidas
 *               moduleAccess:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     moduleId:
 *                       type: string
 *                       example: "m_appointments"
 *                     enabled:
 *                       type: boolean
 *                       example: true
 *                     limitations:
 *                       type: object
 *                       example: {"maxRecords": 1000}
 *                 description: Acceso a módulos específicos
 *               isPopular:
 *                 type: boolean
 *                 default: false
 *                 example: true
 *                 description: Marcar como plan popular
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *                 default: "ACTIVE"
 *                 example: "ACTIVE"
 *                 description: Estado inicial del plan
 *           example:
 *             name: "Plan Premium Plus"
 *             description: "Plan completo con todas las funcionalidades y soporte 24/7"
 *             price: 129.99
 *             currency: "COP"
 *             duration: 1
 *             durationType: "MONTHS"
 *             limits:
 *               maxUsers: 15
 *               maxClients: 2000
 *               maxAppointments: 1000
 *               storageLimit: 21474836480
 *             trialDays: 30
 *             features: ["appointments", "inventory", "reports", "analytics", "multiuser", "api_access"]
 *             moduleAccess:
 *               - moduleId: "m_appointments"
 *                 enabled: true
 *                 limitations:
 *                   maxRecords: 1000
 *             isPopular: true
 *             status: "ACTIVE"
 *     responses:
 *       201:
 *         description: Plan creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Plan creado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     plan:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "675082912345678901234567"
 *                         name:
 *                           type: string
 *                           example: "Plan Premium Plus"
 *                         description:
 *                           type: string
 *                           example: "Plan completo con todas las funcionalidades y soporte 24/7"
 *                         price:
 *                           type: number
 *                           example: 129.99
 *                         currency:
 *                           type: string
 *                           example: "COP"
 *                         duration:
 *                           type: integer
 *                           example: 1
 *                         durationType:
 *                           type: string
 *                           example: "MONTHS"
 *                         status:
 *                           type: string
 *                           example: "ACTIVE"
 *                         isPopular:
 *                           type: boolean
 *                           example: true
 *                         limits:
 *                           type: object
 *                           properties:
 *                             maxUsers:
 *                               type: integer
 *                               example: 15
 *                             maxClients:
 *                               type: integer
 *                               example: 2000
 *                             maxAppointments:
 *                               type: integer
 *                               example: 1000
 *                             storageLimit:
 *                               type: integer
 *                               example: 21474836480
 *                         trialDays:
 *                           type: integer
 *                           example: 30
 *                         features:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["appointments", "inventory", "reports", "analytics", "multiuser", "api_access"]
 *                         moduleAccess:
 *                           type: array
 *                           items:
 *                             type: object
 *                           example: [{"moduleId": "m_appointments", "enabled": true, "limitations": {"maxRecords": 1000}}]
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-11-15T12:30:00.000Z"
 *                         createdBy:
 *                           type: string
 *                           example: "67508291234567890123456o"
 *             example:
 *               success: true
 *               message: "Plan creado exitosamente"
 *               data:
 *                 plan:
 *                   id: "675082912345678901234567"
 *                   name: "Plan Premium Plus"
 *                   description: "Plan completo con todas las funcionalidades y soporte 24/7"
 *                   price: 129.99
 *                   currency: "COP"
 *                   duration: 1
 *                   durationType: "MONTHS"
 *                   status: "ACTIVE"
 *                   isPopular: true
 *                   limits:
 *                     maxUsers: 15
 *                     maxClients: 2000
 *                     maxAppointments: 1000
 *                     storageLimit: 21474836480
 *                   trialDays: 30
 *                   features: ["appointments", "inventory", "reports", "analytics", "multiuser", "api_access"]
 *                   moduleAccess:
 *                     - moduleId: "m_appointments"
 *                       enabled: true
 *                       limitations:
 *                         maxRecords: 1000
 *                   createdAt: "2024-11-15T12:30:00.000Z"
 *                   createdBy: "67508291234567890123456o"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "El nombre del plan es requerido"
 *       409:
 *         description: Plan con el mismo nombre ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Ya existe un plan con ese nombre"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/plans', OwnerPlanController.createPlan);

/**
 * @swagger
 * /api/owner/plans/{planId}:
 *   put:
 *     tags:
 *       - Owner Plan Management
 *     summary: Actualizar un plan existente
 *     description: Actualiza todos los campos de un plan de suscripción existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del plan a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Plan Premium Actualizado"
 *                 description: Nuevo nombre del plan
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Plan mejorado con nuevas funcionalidades"
 *                 description: Nueva descripción del plan
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 149.99
 *                 description: Nuevo precio del plan
 *               currency:
 *                 type: string
 *                 enum: [COP, USD, EUR]
 *                 example: "COP"
 *                 description: Nueva moneda del precio
 *               duration:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *                 description: Nueva duración numérica
 *               durationType:
 *                 type: string
 *                 enum: [DAYS, WEEKS, MONTHS, YEARS]
 *                 example: "MONTHS"
 *                 description: Nuevo tipo de duración
 *               limits:
 *                 type: object
 *                 properties:
 *                   maxUsers:
 *                     type: integer
 *                     minimum: 1
 *                     example: 20
 *                     description: Nuevo máximo número de usuarios
 *                   maxClients:
 *                     type: integer
 *                     minimum: 1
 *                     example: 3000
 *                     description: Nuevo máximo número de clientes
 *                   maxAppointments:
 *                     type: integer
 *                     minimum: 1
 *                     example: 1500
 *                     description: Nuevo máximo número de citas por mes
 *                   storageLimit:
 *                     type: integer
 *                     minimum: 1
 *                     example: 32212254720
 *                     description: Nuevo límite de almacenamiento en bytes (30GB)
 *               trialDays:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 365
 *                 example: 45
 *                 description: Nuevos días de prueba gratuita
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["appointments", "inventory", "reports", "analytics", "multiuser", "api_access", "premium_support"]
 *                 description: Nueva lista de características incluidas
 *               moduleAccess:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     moduleId:
 *                       type: string
 *                       example: "m_appointments"
 *                     enabled:
 *                       type: boolean
 *                       example: true
 *                     limitations:
 *                       type: object
 *                       example: {"maxRecords": 1500}
 *                 description: Nuevo acceso a módulos específicos
 *               isPopular:
 *                 type: boolean
 *                 example: false
 *                 description: Nuevo estado de plan popular
 *           example:
 *             name: "Plan Premium Actualizado"
 *             description: "Plan mejorado con nuevas funcionalidades"
 *             price: 149.99
 *             currency: "COP"
 *             duration: 3
 *             durationType: "MONTHS"
 *             limits:
 *               maxUsers: 20
 *               maxClients: 3000
 *               maxAppointments: 1500
 *               storageLimit: 32212254720
 *             trialDays: 45
 *             features: ["appointments", "inventory", "reports", "analytics", "multiuser", "api_access", "premium_support"]
 *             moduleAccess:
 *               - moduleId: "m_appointments"
 *                 enabled: true
 *                 limitations:
 *                   maxRecords: 1500
 *             isPopular: false
 *     responses:
 *       200:
 *         description: Plan actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Plan actualizado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     plan:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "67508291234567890123456p"
 *                         name:
 *                           type: string
 *                           example: "Plan Premium Actualizado"
 *                         description:
 *                           type: string
 *                           example: "Plan mejorado con nuevas funcionalidades"
 *                         price:
 *                           type: number
 *                           example: 149.99
 *                         currency:
 *                           type: string
 *                           example: "COP"
 *                         duration:
 *                           type: integer
 *                           example: 3
 *                         durationType:
 *                           type: string
 *                           example: "MONTHS"
 *                         status:
 *                           type: string
 *                           example: "ACTIVE"
 *                         isPopular:
 *                           type: boolean
 *                           example: false
 *                         limits:
 *                           type: object
 *                           properties:
 *                             maxUsers:
 *                               type: integer
 *                               example: 20
 *                             maxClients:
 *                               type: integer
 *                               example: 3000
 *                             maxAppointments:
 *                               type: integer
 *                               example: 1500
 *                             storageLimit:
 *                               type: integer
 *                               example: 32212254720
 *                         trialDays:
 *                           type: integer
 *                           example: 45
 *                         features:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["appointments", "inventory", "reports", "analytics", "multiuser", "api_access", "premium_support"]
 *                         moduleAccess:
 *                           type: array
 *                           items:
 *                             type: object
 *                           example: [{"moduleId": "m_appointments", "enabled": true, "limitations": {"maxRecords": 1500}}]
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-11-15T14:30:00.000Z"
 *                         updatedBy:
 *                           type: string
 *                           example: "67508291234567890123456o"
 *                     changes:
 *                       type: object
 *                       properties:
 *                         fieldsModified:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["price", "duration", "durationType", "limits.maxUsers"]
 *                         affectedSubscriptions:
 *                           type: integer
 *                           example: 45
 *                           description: Número de suscripciones que se verán afectadas
 *             example:
 *               success: true
 *               message: "Plan actualizado exitosamente"
 *               data:
 *                 plan:
 *                   id: "67508291234567890123456p"
 *                   name: "Plan Premium Actualizado"
 *                   description: "Plan mejorado con nuevas funcionalidades"
 *                   price: 149.99
 *                   currency: "COP"
 *                   duration: 3
 *                   durationType: "MONTHS"
 *                   status: "ACTIVE"
 *                   isPopular: false
 *                   limits:
 *                     maxUsers: 20
 *                     maxClients: 3000
 *                     maxAppointments: 1500
 *                     storageLimit: 32212254720
 *                   trialDays: 45
 *                   features: ["appointments", "inventory", "reports", "analytics", "multiuser", "api_access", "premium_support"]
 *                   moduleAccess:
 *                     - moduleId: "m_appointments"
 *                       enabled: true
 *                       limitations:
 *                         maxRecords: 1500
 *                   updatedAt: "2024-11-15T14:30:00.000Z"
 *                   updatedBy: "67508291234567890123456o"
 *                 changes:
 *                   fieldsModified: ["price", "duration", "durationType", "limits.maxUsers"]
 *                   affectedSubscriptions: 45
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "El precio debe ser un número positivo"
 *       404:
 *         description: Plan no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Plan no encontrado"
 *       409:
 *         description: Plan con el mismo nombre ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Ya existe otro plan con ese nombre"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/plans/:planId', OwnerPlanController.updatePlan);

/**
 * @swagger
 * /api/owner/plans/{planId}/status:
 *   patch:
 *     tags:
 *       - Owner Plan Management
 *     summary: Cambiar estado de un plan
 *     description: Cambia el estado de un plan de suscripción (activar, desactivar o deprecar)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, DEPRECATED]
 *                 example: "INACTIVE"
 *                 description: Nuevo estado del plan
 *               reason:
 *                 type: string
 *                 maxLength: 200
 *                 example: "Plan temporalmente deshabilitado para mantenimiento"
 *                 description: Razón del cambio de estado (opcional)
 *               notifyUsers:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *                 description: Si notificar a usuarios afectados
 *           example:
 *             status: "INACTIVE"
 *             reason: "Plan temporalmente deshabilitado para mantenimiento"
 *             notifyUsers: true
 *     responses:
 *       200:
 *         description: Estado del plan cambiado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Estado del plan cambiado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     plan:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "67508291234567890123456p"
 *                         name:
 *                           type: string
 *                           example: "Plan Premium"
 *                         status:
 *                           type: string
 *                           example: "INACTIVE"
 *                         previousStatus:
 *                           type: string
 *                           example: "ACTIVE"
 *                         statusChangedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-11-15T15:00:00.000Z"
 *                         statusChangedBy:
 *                           type: string
 *                           example: "67508291234567890123456o"
 *                         statusChangeReason:
 *                           type: string
 *                           example: "Plan temporalmente deshabilitado para mantenimiento"
 *                     impact:
 *                       type: object
 *                       properties:
 *                         affectedSubscriptions:
 *                           type: integer
 *                           example: 45
 *                           description: Número de suscripciones afectadas
 *                         affectedBusinesses:
 *                           type: integer
 *                           example: 42
 *                           description: Número de negocios afectados
 *                         notificationsSent:
 *                           type: integer
 *                           example: 45
 *                           description: Número de notificaciones enviadas
 *                         expectedRevenueImpact:
 *                           type: number
 *                           example: 4049.55
 *                           description: Impacto estimado en ingresos mensuales
 *                     actions:
 *                       type: object
 *                       properties:
 *                         newSubscriptionsBlocked:
 *                           type: boolean
 *                           example: true
 *                           description: Si se bloquearon nuevas suscripciones
 *                         existingSubscriptionsStatus:
 *                           type: string
 *                           enum: [MAINTAINED, MIGRATED, SUSPENDED]
 *                           example: "MAINTAINED"
 *                           description: Estado de suscripciones existentes
 *                         alternativePlansOffered:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               planId:
 *                                 type: string
 *                                 example: "67508291234567890123456a"
 *                               planName:
 *                                 type: string
 *                                 example: "Plan Standard"
 *                               migrationOffered:
 *                                 type: boolean
 *                                 example: true
 *             example:
 *               success: true
 *               message: "Estado del plan cambiado exitosamente"
 *               data:
 *                 plan:
 *                   id: "67508291234567890123456p"
 *                   name: "Plan Premium"
 *                   status: "INACTIVE"
 *                   previousStatus: "ACTIVE"
 *                   statusChangedAt: "2024-11-15T15:00:00.000Z"
 *                   statusChangedBy: "67508291234567890123456o"
 *                   statusChangeReason: "Plan temporalmente deshabilitado para mantenimiento"
 *                 impact:
 *                   affectedSubscriptions: 45
 *                   affectedBusinesses: 42
 *                   notificationsSent: 45
 *                   expectedRevenueImpact: 4049.55
 *                 actions:
 *                   newSubscriptionsBlocked: true
 *                   existingSubscriptionsStatus: "MAINTAINED"
 *                   alternativePlansOffered:
 *                     - planId: "67508291234567890123456a"
 *                       planName: "Plan Standard"
 *                       migrationOffered: true
 *       400:
 *         description: Estado inválido o datos incorrectos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidStatus:
 *                 summary: Estado inválido
 *                 value:
 *                   success: false
 *                   error: "Estado no válido. Debe ser ACTIVE, INACTIVE o DEPRECATED"
 *               sameStatus:
 *                 summary: Mismo estado actual
 *                 value:
 *                   success: false
 *                   error: "El plan ya tiene el estado INACTIVE"
 *       404:
 *         description: Plan no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Plan no encontrado"
 *       409:
 *         description: Conflicto con suscripciones activas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "No se puede deprecar un plan con suscripciones activas"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/plans/:planId/status', OwnerPlanController.changePlanStatus);

/**
 * @swagger
 * /api/owner/plans/{planId}/stats:
 *   get:
 *     tags:
 *       - Owner Plan Management
 *     summary: Obtener estadísticas detalladas de uso de un plan
 *     description: Obtiene estadísticas completas de uso, rendimiento y métricas específicas de un plan
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del plan
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y, all]
 *           default: "30d"
 *         description: Período de tiempo para las estadísticas
 *       - in: query
 *         name: includeChurn
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Incluir análisis de cancelaciones
 *       - in: query
 *         name: includeForecast
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir proyecciones futuras
 *     responses:
 *       200:
 *         description: Estadísticas del plan obtenidas exitosamente
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
 *                     plan:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "67508291234567890123456p"
 *                         name:
 *                           type: string
 *                           example: "Plan Premium"
 *                         status:
 *                           type: string
 *                           example: "ACTIVE"
 *                         price:
 *                           type: number
 *                           example: 89.99
 *                     period:
 *                       type: object
 *                       properties:
 *                         requested:
 *                           type: string
 *                           example: "30d"
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-10-16T00:00:00.000Z"
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-11-15T23:59:59.999Z"
 *                     subscriptions:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 58
 *                         active:
 *                           type: integer
 *                           example: 45
 *                         trial:
 *                           type: integer
 *                           example: 8
 *                         expired:
 *                           type: integer
 *                           example: 5
 *                         newInPeriod:
 *                           type: integer
 *                           example: 12
 *                         renewedInPeriod:
 *                           type: integer
 *                           example: 35
 *                         canceledInPeriod:
 *                           type: integer
 *                           example: 3
 *                         conversionRate:
 *                           type: number
 *                           description: Tasa de conversión trial-to-paid (%)
 *                           example: 75.0
 *                     revenue:
 *                       type: object
 *                       properties:
 *                         totalInPeriod:
 *                           type: number
 *                           example: 4049.55
 *                         monthlyRecurring:
 *                           type: number
 *                           example: 4049.55
 *                         averagePerSubscription:
 *                           type: number
 *                           example: 89.99
 *                         projectedMonthly:
 *                           type: number
 *                           example: 4049.55
 *                         growth:
 *                           type: object
 *                           properties:
 *                             percentageLastMonth:
 *                               type: number
 *                               example: 15.5
 *                             percentageLastQuarter:
 *                               type: number
 *                               example: 45.2
 *                     usage:
 *                       type: object
 *                       properties:
 *                         averageUsers:
 *                           type: number
 *                           example: 7.2
 *                         averageClients:
 *                           type: number
 *                           example: 245.8
 *                         averageAppointments:
 *                           type: number
 *                           example: 127.5
 *                         storageUsage:
 *                           type: object
 *                           properties:
 *                             average:
 *                               type: number
 *                               description: Uso promedio en bytes
 *                               example: 2147483648
 *                             percentage:
 *                               type: number
 *                               description: Porcentaje del límite usado
 *                               example: 20.0
 *                         limitExceeded:
 *                           type: object
 *                           properties:
 *                             users:
 *                               type: integer
 *                               example: 2
 *                             clients:
 *                               type: integer
 *                               example: 0
 *                             appointments:
 *                               type: integer
 *                               example: 1
 *                             storage:
 *                               type: integer
 *                               example: 0
 *                     performance:
 *                       type: object
 *                       properties:
 *                         satisfaction:
 *                           type: object
 *                           properties:
 *                             score:
 *                               type: number
 *                               description: Puntuación promedio (1-10)
 *                               example: 8.7
 *                             responses:
 *                               type: integer
 *                               example: 32
 *                         supportTickets:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                               example: 15
 *                             resolved:
 *                               type: integer
 *                               example: 14
 *                             averageResolutionTime:
 *                               type: number
 *                               description: Tiempo promedio en horas
 *                               example: 4.2
 *                         featureUsage:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               feature:
 *                                 type: string
 *                                 example: "appointments"
 *                               usagePercentage:
 *                                 type: number
 *                                 example: 95.5
 *                               activeUsers:
 *                                 type: integer
 *                                 example: 43
 *                     churn:
 *                       type: object
 *                       properties:
 *                         rate:
 *                           type: number
 *                           description: Tasa de cancelación (%)
 *                           example: 6.7
 *                         reasons:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               reason:
 *                                 type: string
 *                                 example: "Precio elevado"
 *                               count:
 *                                 type: integer
 *                                 example: 2
 *                               percentage:
 *                                 type: number
 *                                 example: 66.7
 *                         riskFactors:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               factor:
 *                                 type: string
 *                                 example: "Bajo uso de funcionalidades"
 *                               affectedSubscriptions:
 *                                 type: integer
 *                                 example: 8
 *                     forecast:
 *                       type: object
 *                       properties:
 *                         nextMonth:
 *                           type: object
 *                           properties:
 *                             expectedSubscriptions:
 *                               type: integer
 *                               example: 52
 *                             expectedRevenue:
 *                               type: number
 *                               example: 4679.48
 *                             confidence:
 *                               type: number
 *                               description: Nivel de confianza (%)
 *                               example: 85.0
 *                         nextQuarter:
 *                           type: object
 *                           properties:
 *                             expectedSubscriptions:
 *                               type: integer
 *                               example: 68
 *                             expectedRevenue:
 *                               type: number
 *                               example: 6119.32
 *                             confidence:
 *                               type: number
 *                               example: 75.0
 *             example:
 *               success: true
 *               data:
 *                 plan:
 *                   id: "67508291234567890123456p"
 *                   name: "Plan Premium"
 *                   status: "ACTIVE"
 *                   price: 89.99
 *                 period:
 *                   requested: "30d"
 *                   startDate: "2024-10-16T00:00:00.000Z"
 *                   endDate: "2024-11-15T23:59:59.999Z"
 *                 subscriptions:
 *                   total: 58
 *                   active: 45
 *                   trial: 8
 *                   expired: 5
 *                   newInPeriod: 12
 *                   renewedInPeriod: 35
 *                   canceledInPeriod: 3
 *                   conversionRate: 75.0
 *                 revenue:
 *                   totalInPeriod: 4049.55
 *                   monthlyRecurring: 4049.55
 *                   averagePerSubscription: 89.99
 *                   projectedMonthly: 4049.55
 *                   growth:
 *                     percentageLastMonth: 15.5
 *                     percentageLastQuarter: 45.2
 *                 usage:
 *                   averageUsers: 7.2
 *                   averageClients: 245.8
 *                   averageAppointments: 127.5
 *                   storageUsage:
 *                     average: 2147483648
 *                     percentage: 20.0
 *                   limitExceeded:
 *                     users: 2
 *                     clients: 0
 *                     appointments: 1
 *                     storage: 0
 *                 performance:
 *                   satisfaction:
 *                     score: 8.7
 *                     responses: 32
 *                   supportTickets:
 *                     total: 15
 *                     resolved: 14
 *                     averageResolutionTime: 4.2
 *                   featureUsage:
 *                     - feature: "appointments"
 *                       usagePercentage: 95.5
 *                       activeUsers: 43
 *                 churn:
 *                   rate: 6.7
 *                   reasons:
 *                     - reason: "Precio elevado"
 *                       count: 2
 *                       percentage: 66.7
 *                   riskFactors:
 *                     - factor: "Bajo uso de funcionalidades"
 *                       affectedSubscriptions: 8
 *                 forecast:
 *                   nextMonth:
 *                     expectedSubscriptions: 52
 *                     expectedRevenue: 4679.48
 *                     confidence: 85.0
 *                   nextQuarter:
 *                     expectedSubscriptions: 68
 *                     expectedRevenue: 6119.32
 *                     confidence: 75.0
 *       404:
 *         description: Plan no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Plan no encontrado"
 *       400:
 *         description: Parámetros de consulta inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Período inválido. Debe ser uno de: 7d, 30d, 90d, 1y, all"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/plans/:planId/stats', OwnerPlanController.getPlanUsageStats);

// === ESTADÍSTICAS DE LA PLATAFORMA ===

/**
 * @swagger
 * /api/owner/stats/platform:
 *   get:
 *     tags:
 *       - Owner Platform Statistics
 *     summary: Obtener estadísticas globales de la plataforma
 *     description: Obtiene un resumen completo de todas las métricas de la plataforma incluyendo usuarios, negocios, suscripciones e ingresos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y, all]
 *           default: "30d"
 *         description: Período de tiempo para las estadísticas
 *       - in: query
 *         name: includeProjections
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir proyecciones futuras
 *       - in: query
 *         name: detailLevel
 *         schema:
 *           type: string
 *           enum: [summary, detailed, full]
 *           default: "detailed"
 *         description: Nivel de detalle en las estadísticas
 *     responses:
 *       200:
 *         description: Estadísticas de la plataforma obtenidas exitosamente
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
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: integer
 *                           example: 2847
 *                         totalBusinesses:
 *                           type: integer
 *                           example: 156
 *                         activeSubscriptions:
 *                           type: integer
 *                           example: 142
 *                         totalRevenue:
 *                           type: number
 *                           example: 85450.75
 *                         platformHealth:
 *                           type: string
 *                           enum: [EXCELLENT, GOOD, AVERAGE, POOR, CRITICAL]
 *                           example: "EXCELLENT"
 *                     period:
 *                       type: object
 *                       properties:
 *                         requested:
 *                           type: string
 *                           example: "30d"
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-10-16T00:00:00.000Z"
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-11-15T23:59:59.999Z"
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 2847
 *                         new:
 *                           type: integer
 *                           example: 284
 *                         active:
 *                           type: integer
 *                           example: 2156
 *                         byRole:
 *                           type: object
 *                           properties:
 *                             owners:
 *                               type: integer
 *                               example: 3
 *                             administrators:
 *                               type: integer
 *                               example: 156
 *                             employees:
 *                               type: integer
 *                               example: 2688
 *                         growth:
 *                           type: object
 *                           properties:
 *                             percentage:
 *                               type: number
 *                               example: 18.5
 *                             trend:
 *                               type: string
 *                               enum: [INCREASING, DECREASING, STABLE]
 *                               example: "INCREASING"
 *                     businesses:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 156
 *                         new:
 *                           type: integer
 *                           example: 23
 *                         active:
 *                           type: integer
 *                           example: 142
 *                         suspended:
 *                           type: integer
 *                           example: 14
 *                         byIndustry:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               industry:
 *                                 type: string
 *                                 example: "Beauty & Spa"
 *                               count:
 *                                 type: integer
 *                                 example: 89
 *                               percentage:
 *                                 type: number
 *                                 example: 57.1
 *                         averageUsers:
 *                           type: number
 *                           example: 18.2
 *                         averageClients:
 *                           type: number
 *                           example: 342.5
 *                         growth:
 *                           type: object
 *                           properties:
 *                             percentage:
 *                               type: number
 *                               example: 14.7
 *                             trend:
 *                               type: string
 *                               example: "INCREASING"
 *                     subscriptions:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 156
 *                         active:
 *                           type: integer
 *                           example: 142
 *                         trial:
 *                           type: integer
 *                           example: 28
 *                         expired:
 *                           type: integer
 *                           example: 14
 *                         byPlan:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               planId:
 *                                 type: string
 *                                 example: "67508291234567890123456p"
 *                               planName:
 *                                 type: string
 *                                 example: "Plan Premium"
 *                               count:
 *                                 type: integer
 *                                 example: 45
 *                               percentage:
 *                                 type: number
 *                                 example: 31.7
 *                               revenue:
 *                                 type: number
 *                                 example: 4049.55
 *                         conversionRate:
 *                           type: number
 *                           description: Tasa de conversión trial-to-paid (%)
 *                           example: 78.5
 *                         churnRate:
 *                           type: number
 *                           description: Tasa de cancelación (%)
 *                           example: 8.2
 *                         renewalRate:
 *                           type: number
 *                           description: Tasa de renovación (%)
 *                           example: 91.8
 *                     revenue:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 85450.75
 *                         monthly:
 *                           type: number
 *                           example: 12749.85
 *                         recurring:
 *                           type: number
 *                           example: 12749.85
 *                         oneTime:
 *                           type: number
 *                           example: 0
 *                         byPlan:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               planName:
 *                                 type: string
 *                                 example: "Plan Premium"
 *                               revenue:
 *                                 type: number
 *                                 example: 4049.55
 *                               percentage:
 *                                 type: number
 *                                 example: 31.7
 *                         growth:
 *                           type: object
 *                           properties:
 *                             percentage:
 *                               type: number
 *                               example: 22.3
 *                             trend:
 *                               type: string
 *                               example: "INCREASING"
 *                             projectedNext:
 *                               type: number
 *                               example: 15597.32
 *                     performance:
 *                       type: object
 *                       properties:
 *                         systemUptime:
 *                           type: number
 *                           description: Porcentaje de tiempo activo
 *                           example: 99.9
 *                         averageResponseTime:
 *                           type: number
 *                           description: Tiempo promedio de respuesta en ms
 *                           example: 245
 *                         errorRate:
 *                           type: number
 *                           description: Tasa de errores (%)
 *                           example: 0.1
 *                         supportTickets:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                               example: 89
 *                             resolved:
 *                               type: integer
 *                               example: 84
 *                             pending:
 *                               type: integer
 *                               example: 5
 *                             averageResolutionTime:
 *                               type: number
 *                               description: Tiempo promedio en horas
 *                               example: 6.2
 *                         customerSatisfaction:
 *                           type: object
 *                           properties:
 *                             score:
 *                               type: number
 *                               description: Puntuación promedio (1-10)
 *                               example: 8.7
 *                             responses:
 *                               type: integer
 *                               example: 167
 *                     analytics:
 *                       type: object
 *                       properties:
 *                         topFeatures:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               feature:
 *                                 type: string
 *                                 example: "appointments"
 *                               usagePercentage:
 *                                 type: number
 *                                 example: 95.2
 *                               activeBusinesses:
 *                                 type: integer
 *                                 example: 135
 *                         regionDistribution:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               region:
 *                                 type: string
 *                                 example: "Bogotá"
 *                               businesses:
 *                                 type: integer
 *                                 example: 67
 *                               percentage:
 *                                 type: number
 *                                 example: 42.9
 *                         deviceUsage:
 *                           type: object
 *                           properties:
 *                             mobile:
 *                               type: number
 *                               example: 68.5
 *                             desktop:
 *                               type: number
 *                               example: 31.5
 *                     projections:
 *                       type: object
 *                       properties:
 *                         nextMonth:
 *                           type: object
 *                           properties:
 *                             businesses:
 *                               type: integer
 *                               example: 178
 *                             users:
 *                               type: integer
 *                               example: 3256
 *                             revenue:
 *                               type: number
 *                               example: 15597.32
 *                             confidence:
 *                               type: number
 *                               description: Nivel de confianza (%)
 *                               example: 87.5
 *                         nextQuarter:
 *                           type: object
 *                           properties:
 *                             businesses:
 *                               type: integer
 *                               example: 235
 *                             users:
 *                               type: integer
 *                               example: 4280
 *                             revenue:
 *                               type: number
 *                               example: 20276.52
 *                             confidence:
 *                               type: number
 *                               example: 78.2
 *             example:
 *               success: true
 *               data:
 *                 overview:
 *                   totalUsers: 2847
 *                   totalBusinesses: 156
 *                   activeSubscriptions: 142
 *                   totalRevenue: 85450.75
 *                   platformHealth: "EXCELLENT"
 *                 period:
 *                   requested: "30d"
 *                   startDate: "2024-10-16T00:00:00.000Z"
 *                   endDate: "2024-11-15T23:59:59.999Z"
 *                 users:
 *                   total: 2847
 *                   new: 284
 *                   active: 2156
 *                   byRole:
 *                     owners: 3
 *                     administrators: 156
 *                     employees: 2688
 *                   growth:
 *                     percentage: 18.5
 *                     trend: "INCREASING"
 *                 businesses:
 *                   total: 156
 *                   new: 23
 *                   active: 142
 *                   suspended: 14
 *                   byIndustry:
 *                     - industry: "Beauty & Spa"
 *                       count: 89
 *                       percentage: 57.1
 *                   averageUsers: 18.2
 *                   averageClients: 342.5
 *                   growth:
 *                     percentage: 14.7
 *                     trend: "INCREASING"
 *                 subscriptions:
 *                   total: 156
 *                   active: 142
 *                   trial: 28
 *                   expired: 14
 *                   byPlan:
 *                     - planId: "67508291234567890123456p"
 *                       planName: "Plan Premium"
 *                       count: 45
 *                       percentage: 31.7
 *                       revenue: 4049.55
 *                   conversionRate: 78.5
 *                   churnRate: 8.2
 *                   renewalRate: 91.8
 *                 revenue:
 *                   total: 85450.75
 *                   monthly: 12749.85
 *                   recurring: 12749.85
 *                   oneTime: 0
 *                   byPlan:
 *                     - planName: "Plan Premium"
 *                       revenue: 4049.55
 *                       percentage: 31.7
 *                   growth:
 *                     percentage: 22.3
 *                     trend: "INCREASING"
 *                     projectedNext: 15597.32
 *                 performance:
 *                   systemUptime: 99.9
 *                   averageResponseTime: 245
 *                   errorRate: 0.1
 *                   supportTickets:
 *                     total: 89
 *                     resolved: 84
 *                     pending: 5
 *                     averageResolutionTime: 6.2
 *                   customerSatisfaction:
 *                     score: 8.7
 *                     responses: 167
 *                 analytics:
 *                   topFeatures:
 *                     - feature: "appointments"
 *                       usagePercentage: 95.2
 *                       activeBusinesses: 135
 *                   regionDistribution:
 *                     - region: "Bogotá"
 *                       businesses: 67
 *                       percentage: 42.9
 *                   deviceUsage:
 *                     mobile: 68.5
 *                     desktop: 31.5
 *                 projections:
 *                   nextMonth:
 *                     businesses: 178
 *                     users: 3256
 *                     revenue: 15597.32
 *                     confidence: 87.5
 *                   nextQuarter:
 *                     businesses: 235
 *                     users: 4280
 *                     revenue: 20276.52
 *                     confidence: 78.2
 *       400:
 *         description: Parámetros de consulta inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Período inválido. Debe ser uno de: 7d, 30d, 90d, 1y, all"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/stats/platform', OwnerController.getPlatformStats);

// === GESTIÓN DE NEGOCIOS ===

/**
 * @swagger
 * /api/owner/businesses:
 *   get:
 *     tags:
 *       - Owner Business Management
 *     summary: Listar todos los negocios de la plataforma
 *     description: Obtiene una lista paginada de todos los negocios registrados en la plataforma con sus datos principales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Elementos por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, ACTIVE, SUSPENDED, INACTIVE, PENDING]
 *           default: all
 *         description: Filtrar por estado del negocio
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre del negocio o email del propietario
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, businessName, subscriptionStatus, lastActivity, revenue]
 *           default: createdAt
 *         description: Campo para ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Orden de clasificación
 *       - in: query
 *         name: subscriptionStatus
 *         schema:
 *           type: string
 *           enum: [all, ACTIVE, TRIAL, EXPIRED, SUSPENDED]
 *           default: all
 *         description: Filtrar por estado de suscripción
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *         description: Filtrar por industria/categoría
 *     responses:
 *       200:
 *         description: Lista de negocios obtenida exitosamente
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
 *                     businesses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "675082912345678901234567"
 *                           businessName:
 *                             type: string
 *                             example: "Bella Spa & Wellness"
 *                           industry:
 *                             type: string
 *                             example: "Beauty & Spa"
 *                           status:
 *                             type: string
 *                             enum: [ACTIVE, SUSPENDED, INACTIVE, PENDING]
 *                             example: "ACTIVE"
 *                           owner:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "675082912345678901234568"
 *                               name:
 *                                 type: string
 *                                 example: "María González"
 *                               email:
 *                                 type: string
 *                                 example: "maria@bellaspa.com"
 *                               phone:
 *                                 type: string
 *                                 example: "+57 300 123 4567"
 *                           subscription:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "675082912345678901234569"
 *                               planName:
 *                                 type: string
 *                                 example: "Plan Premium"
 *                               status:
 *                                 type: string
 *                                 enum: [ACTIVE, TRIAL, EXPIRED, SUSPENDED]
 *                                 example: "ACTIVE"
 *                               startDate:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2024-08-15T00:00:00.000Z"
 *                               endDate:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2024-11-15T23:59:59.999Z"
 *                               autoRenewal:
 *                                 type: boolean
 *                                 example: true
 *                               monthlyRevenue:
 *                                 type: number
 *                                 example: 89.99
 *                           metrics:
 *                             type: object
 *                             properties:
 *                               totalUsers:
 *                                 type: integer
 *                                 example: 8
 *                               totalClients:
 *                                 type: integer
 *                                 example: 245
 *                               monthlyAppointments:
 *                                 type: integer
 *                                 example: 156
 *                               storageUsed:
 *                                 type: integer
 *                                 description: Almacenamiento usado en bytes
 *                                 example: 2147483648
 *                               lastActivity:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2024-11-15T14:30:00.000Z"
 *                           location:
 *                             type: object
 *                             properties:
 *                               city:
 *                                 type: string
 *                                 example: "Bogotá"
 *                               country:
 *                                 type: string
 *                                 example: "Colombia"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-08-15T10:00:00.000Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-11-15T14:30:00.000Z"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 16
 *                         totalItems:
 *                           type: integer
 *                           example: 156
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         hasNext:
 *                           type: boolean
 *                           example: true
 *                         hasPrevious:
 *                           type: boolean
 *                           example: false
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalBusinesses:
 *                           type: integer
 *                           example: 156
 *                         activeBusinesses:
 *                           type: integer
 *                           example: 142
 *                         suspendedBusinesses:
 *                           type: integer
 *                           example: 12
 *                         inactiveBusinesses:
 *                           type: integer
 *                           example: 2
 *                         totalRevenue:
 *                           type: number
 *                           example: 12749.85
 *                         averageRevenuePerBusiness:
 *                           type: number
 *                           example: 89.79
 *             example:
 *               success: true
 *               data:
 *                 businesses:
 *                   - id: "675082912345678901234567"
 *                     businessName: "Bella Spa & Wellness"
 *                     industry: "Beauty & Spa"
 *                     status: "ACTIVE"
 *                     owner:
 *                       id: "675082912345678901234568"
 *                       name: "María González"
 *                       email: "maria@bellaspa.com"
 *                       phone: "+57 300 123 4567"
 *                     subscription:
 *                       id: "675082912345678901234569"
 *                       planName: "Plan Premium"
 *                       status: "ACTIVE"
 *                       startDate: "2024-08-15T00:00:00.000Z"
 *                       endDate: "2024-11-15T23:59:59.999Z"
 *                       autoRenewal: true
 *                       monthlyRevenue: 89.99
 *                     metrics:
 *                       totalUsers: 8
 *                       totalClients: 245
 *                       monthlyAppointments: 156
 *                       storageUsed: 2147483648
 *                       lastActivity: "2024-11-15T14:30:00.000Z"
 *                     location:
 *                       city: "Bogotá"
 *                       country: "Colombia"
 *                     createdAt: "2024-08-15T10:00:00.000Z"
 *                     updatedAt: "2024-11-15T14:30:00.000Z"
 *                 pagination:
 *                   currentPage: 1
 *                   totalPages: 16
 *                   totalItems: 156
 *                   limit: 10
 *                   hasNext: true
 *                   hasPrevious: false
 *                 summary:
 *                   totalBusinesses: 156
 *                   activeBusinesses: 142
 *                   suspendedBusinesses: 12
 *                   inactiveBusinesses: 2
 *                   totalRevenue: 12749.85
 *                   averageRevenuePerBusiness: 89.79
 *       400:
 *         description: Parámetros de consulta inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "El parámetro 'limit' debe estar entre 1 y 100"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/businesses', OwnerController.getAllBusinesses);

/**
 * @swagger
 * /api/owner/businesses:
 *   post:
 *     tags:
 *       - Owner Business Management
 *     summary: Crear un negocio manualmente (registro administrativo)
 *     description: Permite al propietario crear un nuevo negocio con su propietario desde el panel administrativo
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessName
 *               - businessEmail
 *               - businessPhone
 *               - address
 *               - city
 *               - country
 *               - ownerEmail
 *               - ownerFirstName
 *               - ownerLastName
 *               - ownerPhone
 *               - subscriptionPlanId
 *             properties:
 *               businessData:
 *                 type: object
 *                 properties:
 *                   businessName:
 *                     type: string
 *                     maxLength: 100
 *                     example: "Elegance Beauty Center"
 *                     description: Nombre del negocio
 *                   businessEmail:
 *                     type: string
 *                     format: email
 *                     example: "info@elegancebeauty.com"
 *                     description: Email corporativo del negocio
 *                   businessPhone:
 *                     type: string
 *                     example: "+57 601 234 5678"
 *                     description: Teléfono principal del negocio
 *                   address:
 *                     type: string
 *                     maxLength: 200
 *                     example: "Calle 85 #15-32, Zona Rosa"
 *                     description: Dirección física del negocio
 *                   city:
 *                     type: string
 *                     maxLength: 50
 *                     example: "Bogotá"
 *                     description: Ciudad donde opera el negocio
 *                   country:
 *                     type: string
 *                     maxLength: 50
 *                     example: "Colombia"
 *                     description: País donde opera el negocio
 *                   industry:
 *                     type: string
 *                     example: "Beauty & Spa"
 *                     description: Industria o categoría del negocio
 *                   description:
 *                     type: string
 *                     maxLength: 500
 *                     example: "Centro de belleza especializado en tratamientos faciales y corporales"
 *                     description: Descripción del negocio (opcional)
 *                   ownerEmail:
 *                     type: string
 *                     format: email
 *                     example: "ana.martinez@elegancebeauty.com"
 *                     description: Email del propietario/administrador
 *                   ownerFirstName:
 *                     type: string
 *                     maxLength: 50
 *                     example: "Ana"
 *                     description: Nombre del propietario
 *                   ownerLastName:
 *                     type: string
 *                     maxLength: 50
 *                     example: "Martínez"
 *                     description: Apellido del propietario
 *                   ownerPhone:
 *                     type: string
 *                     example: "+57 310 987 6543"
 *                     description: Teléfono personal del propietario
 *                   subscriptionPlanId:
 *                     type: string
 *                     example: "67508291234567890123456p"
 *                     description: ID del plan de suscripción inicial
 *                   trialDays:
 *                     type: integer
 *                     minimum: 0
 *                     maximum: 365
 *                     example: 30
 *                     description: Días de prueba adicionales (opcional)
 *                   autoRenewal:
 *                     type: boolean
 *                     default: true
 *                     example: true
 *                     description: Configurar renovación automática
 *                   sendWelcomeEmail:
 *                     type: boolean
 *                     default: true
 *                     example: true
 *                     description: Enviar email de bienvenida al propietario
 *           example:
 *             businessData:
 *               businessName: "Elegance Beauty Center"
 *               businessEmail: "info@elegancebeauty.com"
 *               businessPhone: "+57 601 234 5678"
 *               address: "Calle 85 #15-32, Zona Rosa"
 *               city: "Bogotá"
 *               country: "Colombia"
 *               industry: "Beauty & Spa"
 *               description: "Centro de belleza especializado en tratamientos faciales y corporales"
 *               ownerEmail: "ana.martinez@elegancebeauty.com"
 *               ownerFirstName: "Ana"
 *               ownerLastName: "Martínez"
 *               ownerPhone: "+57 310 987 6543"
 *               subscriptionPlanId: "67508291234567890123456p"
 *               trialDays: 30
 *               autoRenewal: true
 *               sendWelcomeEmail: true
 *     responses:
 *       201:
 *         description: Negocio creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Negocio creado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     business:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "675082912345678901234abc"
 *                         businessName:
 *                           type: string
 *                           example: "Elegance Beauty Center"
 *                         businessEmail:
 *                           type: string
 *                           example: "info@elegancebeauty.com"
 *                         businessPhone:
 *                           type: string
 *                           example: "+57 601 234 5678"
 *                         address:
 *                           type: string
 *                           example: "Calle 85 #15-32, Zona Rosa"
 *                         city:
 *                           type: string
 *                           example: "Bogotá"
 *                         country:
 *                           type: string
 *                           example: "Colombia"
 *                         industry:
 *                           type: string
 *                           example: "Beauty & Spa"
 *                         status:
 *                           type: string
 *                           example: "ACTIVE"
 *                         subdomain:
 *                           type: string
 *                           example: "elegance-beauty"
 *                           description: Subdominio generado automáticamente
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-11-15T16:00:00.000Z"
 *                     owner:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "675082912345678901234def"
 *                         email:
 *                           type: string
 *                           example: "ana.martinez@elegancebeauty.com"
 *                         firstName:
 *                           type: string
 *                           example: "Ana"
 *                         lastName:
 *                           type: string
 *                           example: "Martínez"
 *                         phone:
 *                           type: string
 *                           example: "+57 310 987 6543"
 *                         role:
 *                           type: string
 *                           example: "ADMIN"
 *                         temporaryPassword:
 *                           type: string
 *                           example: "TempPass123!"
 *                           description: Contraseña temporal generada
 *                     subscription:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "675082912345678901234ghi"
 *                         planId:
 *                           type: string
 *                           example: "67508291234567890123456p"
 *                         planName:
 *                           type: string
 *                           example: "Plan Premium"
 *                         status:
 *                           type: string
 *                           example: "TRIAL"
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-11-15T16:00:00.000Z"
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-12-15T23:59:59.999Z"
 *                         trialDays:
 *                           type: integer
 *                           example: 30
 *                         autoRenewal:
 *                           type: boolean
 *                           example: true
 *                     notifications:
 *                       type: object
 *                       properties:
 *                         welcomeEmailSent:
 *                           type: boolean
 *                           example: true
 *                         smsNotificationSent:
 *                           type: boolean
 *                           example: true
 *                         setupGuideProvided:
 *                           type: boolean
 *                           example: true
 *             example:
 *               success: true
 *               message: "Negocio creado exitosamente"
 *               data:
 *                 business:
 *                   id: "675082912345678901234abc"
 *                   businessName: "Elegance Beauty Center"
 *                   businessEmail: "info@elegancebeauty.com"
 *                   businessPhone: "+57 601 234 5678"
 *                   address: "Calle 85 #15-32, Zona Rosa"
 *                   city: "Bogotá"
 *                   country: "Colombia"
 *                   industry: "Beauty & Spa"
 *                   status: "ACTIVE"
 *                   subdomain: "elegance-beauty"
 *                   createdAt: "2024-11-15T16:00:00.000Z"
 *                 owner:
 *                   id: "675082912345678901234def"
 *                   email: "ana.martinez@elegancebeauty.com"
 *                   firstName: "Ana"
 *                   lastName: "Martínez"
 *                   phone: "+57 310 987 6543"
 *                   role: "ADMIN"
 *                   temporaryPassword: "TempPass123!"
 *                 subscription:
 *                   id: "675082912345678901234ghi"
 *                   planId: "67508291234567890123456p"
 *                   planName: "Plan Premium"
 *                   status: "TRIAL"
 *                   startDate: "2024-11-15T16:00:00.000Z"
 *                   endDate: "2024-12-15T23:59:59.999Z"
 *                   trialDays: 30
 *                   autoRenewal: true
 *                 notifications:
 *                   welcomeEmailSent: true
 *                   smsNotificationSent: true
 *                   setupGuideProvided: true
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidEmail:
 *                 summary: Email inválido
 *                 value:
 *                   success: false
 *                   error: "El email del propietario no es válido"
 *               duplicateEmail:
 *                 summary: Email duplicado
 *                 value:
 *                   success: false
 *                   error: "Ya existe un usuario con ese email"
 *               invalidPlan:
 *                 summary: Plan inválido
 *                 value:
 *                   success: false
 *                   error: "Plan de suscripción no encontrado o inactivo"
 *       409:
 *         description: Conflicto con datos existentes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Ya existe un negocio con ese nombre o email"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/businesses', OwnerController.createBusinessManually);

/**
 * @swagger
 * /api/owner/businesses/{businessId}/status:
 *   patch:
 *     tags:
 *       - Owner Business Management
 *     summary: Cambiar estado de un negocio
 *     description: Permite activar, desactivar o suspender un negocio en la plataforma
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del negocio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED]
 *                 example: "SUSPENDED"
 *                 description: Nuevo estado del negocio
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Incumplimiento de términos de servicio"
 *                 description: Razón del cambio de estado
 *               notifyOwner:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *                 description: Notificar al propietario del negocio
 *               effectiveDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-11-16T00:00:00.000Z"
 *                 description: Fecha efectiva del cambio (opcional, por defecto inmediato)
 *               maintainData:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *                 description: Mantener datos del negocio (solo para SUSPENDED/INACTIVE)
 *           example:
 *             status: "SUSPENDED"
 *             reason: "Incumplimiento de términos de servicio"
 *             notifyOwner: true
 *             effectiveDate: "2024-11-16T00:00:00.000Z"
 *             maintainData: true
 *     responses:
 *       200:
 *         description: Estado del negocio cambiado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Estado del negocio cambiado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     business:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "675082912345678901234567"
 *                         businessName:
 *                           type: string
 *                           example: "Bella Spa & Wellness"
 *                         status:
 *                           type: string
 *                           example: "SUSPENDED"
 *                         previousStatus:
 *                           type: string
 *                           example: "ACTIVE"
 *                         statusChangedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-11-15T16:30:00.000Z"
 *                         statusChangedBy:
 *                           type: string
 *                           example: "67508291234567890123456o"
 *                         statusChangeReason:
 *                           type: string
 *                           example: "Incumplimiento de términos de servicio"
 *                         effectiveDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-11-16T00:00:00.000Z"
 *                     impact:
 *                       type: object
 *                       properties:
 *                         subscription:
 *                           type: object
 *                           properties:
 *                             currentStatus:
 *                               type: string
 *                               example: "SUSPENDED"
 *                             accessRevoked:
 *                               type: boolean
 *                               example: true
 *                             dataRetained:
 *                               type: boolean
 *                               example: true
 *                             suspensionEndDate:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-12-16T00:00:00.000Z"
 *                               description: Fecha estimada de fin de suspensión (si aplica)
 *                         users:
 *                           type: object
 *                           properties:
 *                             totalAffected:
 *                               type: integer
 *                               example: 8
 *                             accessBlocked:
 *                               type: boolean
 *                               example: true
 *                             notificationsSent:
 *                               type: integer
 *                               example: 8
 *                         data:
 *                           type: object
 *                           properties:
 *                             backupCreated:
 *                               type: boolean
 *                               example: true
 *                             retentionPeriod:
 *                               type: integer
 *                               description: Días de retención de datos
 *                               example: 90
 *                             deletionScheduled:
 *                               type: boolean
 *                               example: false
 *                     actions:
 *                       type: object
 *                       properties:
 *                         ownerNotified:
 *                           type: boolean
 *                           example: true
 *                         usersNotified:
 *                           type: boolean
 *                           example: true
 *                         accessRevoked:
 *                           type: boolean
 *                           example: true
 *                         servicesDisabled:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["api_access", "mobile_app", "web_dashboard"]
 *                         supportTicketCreated:
 *                           type: boolean
 *                           example: true
 *                         appealProcess:
 *                           type: object
 *                           properties:
 *                             available:
 *                               type: boolean
 *                               example: true
 *                             deadline:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-11-30T23:59:59.999Z"
 *                             instructions:
 *                               type: string
 *                               example: "Contacte a soporte@beautycontrol.com para iniciar proceso de apelación"
 *             example:
 *               success: true
 *               message: "Estado del negocio cambiado exitosamente"
 *               data:
 *                 business:
 *                   id: "675082912345678901234567"
 *                   businessName: "Bella Spa & Wellness"
 *                   status: "SUSPENDED"
 *                   previousStatus: "ACTIVE"
 *                   statusChangedAt: "2024-11-15T16:30:00.000Z"
 *                   statusChangedBy: "67508291234567890123456o"
 *                   statusChangeReason: "Incumplimiento de términos de servicio"
 *                   effectiveDate: "2024-11-16T00:00:00.000Z"
 *                 impact:
 *                   subscription:
 *                     currentStatus: "SUSPENDED"
 *                     accessRevoked: true
 *                     dataRetained: true
 *                     suspensionEndDate: "2024-12-16T00:00:00.000Z"
 *                   users:
 *                     totalAffected: 8
 *                     accessBlocked: true
 *                     notificationsSent: 8
 *                   data:
 *                     backupCreated: true
 *                     retentionPeriod: 90
 *                     deletionScheduled: false
 *                 actions:
 *                   ownerNotified: true
 *                   usersNotified: true
 *                   accessRevoked: true
 *                   servicesDisabled: ["api_access", "mobile_app", "web_dashboard"]
 *                   supportTicketCreated: true
 *                   appealProcess:
 *                     available: true
 *                     deadline: "2024-11-30T23:59:59.999Z"
 *                     instructions: "Contacte a soporte@beautycontrol.com para iniciar proceso de apelación"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidStatus:
 *                 summary: Estado inválido
 *                 value:
 *                   success: false
 *                   error: "Estado no válido. Debe ser ACTIVE, INACTIVE o SUSPENDED"
 *               sameStatus:
 *                 summary: Mismo estado actual
 *                 value:
 *                   success: false
 *                   error: "El negocio ya tiene el estado SUSPENDED"
 *       404:
 *         description: Negocio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Negocio no encontrado"
 *       409:
 *         description: Conflicto con estado actual o dependencias
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "No se puede suspender un negocio con pagos pendientes"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/businesses/:businessId/status', OwnerController.toggleBusinessStatus);

// === GESTIÓN DE SUSCRIPCIONES ===

/**
 * @swagger
 * /api/owner/subscriptions:
 *   post:
 *     tags:
 *       - Owner Subscription Management
 *     summary: Crear una suscripción para un negocio
 *     description: Crea una nueva suscripción o renueva una existente para un negocio específico
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessId
 *               - subscriptionPlanId
 *             properties:
 *               businessId:
 *                 type: string
 *                 example: "675082912345678901234567"
 *                 description: ID único del negocio
 *               subscriptionPlanId:
 *                 type: string
 *                 example: "67508291234567890123456p"
 *                 description: ID del plan de suscripción
 *               duration:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 36
 *                 default: 1
 *                 example: 3
 *                 description: Duración en meses
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-11-16T00:00:00.000Z"
 *                 description: Fecha de inicio (opcional, por defecto inmediato)
 *               discount:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [PERCENTAGE, FIXED_AMOUNT, FREE_MONTHS]
 *                     example: "PERCENTAGE"
 *                   value:
 *                     type: number
 *                     example: 15
 *                     description: Valor del descuento (%, monto fijo, o meses gratis)
 *                   reason:
 *                     type: string
 *                     example: "Descuento promocional de bienvenida"
 *                 description: Descuento aplicable (opcional)
 *               autoRenewal:
 *                 type: boolean
 *                 default: true
 *                 example: false
 *                 description: Configurar renovación automática
 *               paymentMethod:
 *                 type: string
 *                 enum: [CREDIT_CARD, BANK_TRANSFER, CASH, COMP, ADMIN_GIFT]
 *                 default: "ADMIN_GIFT"
 *                 example: "ADMIN_GIFT"
 *                 description: Método de pago para la suscripción
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Suscripción promocional para cliente VIP"
 *                 description: Notas administrativas (opcional)
 *               notifyBusiness:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *                 description: Notificar al negocio sobre la nueva suscripción
 *           example:
 *             businessId: "675082912345678901234567"
 *             subscriptionPlanId: "67508291234567890123456p"
 *             duration: 3
 *             startDate: "2024-11-16T00:00:00.000Z"
 *             discount:
 *               type: "PERCENTAGE"
 *               value: 15
 *               reason: "Descuento promocional de bienvenida"
 *             autoRenewal: false
 *             paymentMethod: "ADMIN_GIFT"
 *             notes: "Suscripción promocional para cliente VIP"
 *             notifyBusiness: true
 *     responses:
 *       201:
 *         description: Suscripción creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Suscripción creada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscription:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "675082912345678901234abc"
 *                         businessId:
 *                           type: string
 *                           example: "675082912345678901234567"
 *                         businessName:
 *                           type: string
 *                           example: "Bella Spa & Wellness"
 *                         planId:
 *                           type: string
 *                           example: "67508291234567890123456p"
 *                         planName:
 *                           type: string
 *                           example: "Plan Premium"
 *                         status:
 *                           type: string
 *                           enum: [ACTIVE, TRIAL, PENDING, SUSPENDED]
 *                           example: "ACTIVE"
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-11-16T00:00:00.000Z"
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-02-16T23:59:59.999Z"
 *                         duration:
 *                           type: integer
 *                           example: 3
 *                         autoRenewal:
 *                           type: boolean
 *                           example: false
 *                         pricing:
 *                           type: object
 *                           properties:
 *                             originalPrice:
 *                               type: number
 *                               example: 269.97
 *                               description: Precio original (sin descuentos)
 *                             discount:
 *                               type: object
 *                               properties:
 *                                 type:
 *                                   type: string
 *                                   example: "PERCENTAGE"
 *                                 value:
 *                                   type: number
 *                                   example: 15
 *                                 amount:
 *                                   type: number
 *                                   example: 40.50
 *                                 reason:
 *                                   type: string
 *                                   example: "Descuento promocional de bienvenida"
 *                             finalPrice:
 *                               type: number
 *                               example: 229.47
 *                               description: Precio final después de descuentos
 *                             currency:
 *                               type: string
 *                               example: "COP"
 *                         paymentMethod:
 *                           type: string
 *                           example: "ADMIN_GIFT"
 *                         features:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["appointments", "inventory", "reports", "analytics"]
 *                         limits:
 *                           type: object
 *                           properties:
 *                             maxUsers:
 *                               type: integer
 *                               example: 10
 *                             maxClients:
 *                               type: integer
 *                               example: 1000
 *                             maxAppointments:
 *                               type: integer
 *                               example: 500
 *                             storageLimit:
 *                               type: integer
 *                               example: 10737418240
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-11-15T17:00:00.000Z"
 *                         createdBy:
 *                           type: string
 *                           example: "67508291234567890123456o"
 *                         notes:
 *                           type: string
 *                           example: "Suscripción promocional para cliente VIP"
 *                     previousSubscription:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "675082912345678901234def"
 *                         status:
 *                           type: string
 *                           example: "REPLACED"
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-11-15T23:59:59.999Z"
 *                         action:
 *                           type: string
 *                           enum: [REPLACED, EXTENDED, UPGRADED, DOWNGRADED]
 *                           example: "REPLACED"
 *                       description: Información de suscripción anterior (si aplica)
 *                     billing:
 *                       type: object
 *                       properties:
 *                         invoiceGenerated:
 *                           type: boolean
 *                           example: false
 *                         paymentRequired:
 *                           type: boolean
 *                           example: false
 *                         paymentStatus:
 *                           type: string
 *                           enum: [PAID, PENDING, COMP, ADMIN_WAIVED]
 *                           example: "COMP"
 *                         nextBillingDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-02-16T00:00:00.000Z"
 *                     notifications:
 *                       type: object
 *                       properties:
 *                         businessNotified:
 *                           type: boolean
 *                           example: true
 *                         welcomeEmailSent:
 *                           type: boolean
 *                           example: true
 *                         accessGranted:
 *                           type: boolean
 *                           example: true
 *             example:
 *               success: true
 *               message: "Suscripción creada exitosamente"
 *               data:
 *                 subscription:
 *                   id: "675082912345678901234abc"
 *                   businessId: "675082912345678901234567"
 *                   businessName: "Bella Spa & Wellness"
 *                   planId: "67508291234567890123456p"
 *                   planName: "Plan Premium"
 *                   status: "ACTIVE"
 *                   startDate: "2024-11-16T00:00:00.000Z"
 *                   endDate: "2025-02-16T23:59:59.999Z"
 *                   duration: 3
 *                   autoRenewal: false
 *                   pricing:
 *                     originalPrice: 269.97
 *                     discount:
 *                       type: "PERCENTAGE"
 *                       value: 15
 *                       amount: 40.50
 *                       reason: "Descuento promocional de bienvenida"
 *                     finalPrice: 229.47
 *                     currency: "COP"
 *                   paymentMethod: "ADMIN_GIFT"
 *                   features: ["appointments", "inventory", "reports", "analytics"]
 *                   limits:
 *                     maxUsers: 10
 *                     maxClients: 1000
 *                     maxAppointments: 500
 *                     storageLimit: 10737418240
 *                   createdAt: "2024-11-15T17:00:00.000Z"
 *                   createdBy: "67508291234567890123456o"
 *                   notes: "Suscripción promocional para cliente VIP"
 *                 previousSubscription:
 *                   id: "675082912345678901234def"
 *                   status: "REPLACED"
 *                   endDate: "2024-11-15T23:59:59.999Z"
 *                   action: "REPLACED"
 *                 billing:
 *                   invoiceGenerated: false
 *                   paymentRequired: false
 *                   paymentStatus: "COMP"
 *                   nextBillingDate: "2025-02-16T00:00:00.000Z"
 *                 notifications:
 *                   businessNotified: true
 *                   welcomeEmailSent: true
 *                   accessGranted: true
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidBusiness:
 *                 summary: Negocio inválido
 *                 value:
 *                   success: false
 *                   error: "Negocio no encontrado o inactivo"
 *               invalidPlan:
 *                 summary: Plan inválido
 *                 value:
 *                   success: false
 *                   error: "Plan de suscripción no encontrado o no disponible"
 *               invalidDuration:
 *                 summary: Duración inválida
 *                 value:
 *                   success: false
 *                   error: "La duración debe estar entre 1 y 36 meses"
 *       409:
 *         description: Conflicto con suscripción existente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "El negocio ya tiene una suscripción activa. Use el endpoint de renovación o actualización."
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/subscriptions', OwnerController.createSubscription);

/**
 * @swagger
 * /api/owner/subscriptions/{subscriptionId}/cancel:
 *   patch:
 *     tags:
 *       - Owner Subscription Management
 *     summary: Cancelar una suscripción
 *     description: Cancela una suscripción activa con opciones de fecha efectiva y retención de datos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único de la suscripción
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Violación de términos de servicio"
 *                 description: Razón de la cancelación
 *               cancellationType:
 *                 type: string
 *                 enum: [IMMEDIATE, END_OF_PERIOD, SCHEDULED]
 *                 default: "END_OF_PERIOD"
 *                 example: "IMMEDIATE"
 *                 description: Tipo de cancelación
 *               effectiveDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-11-16T00:00:00.000Z"
 *                 description: Fecha efectiva de cancelación (requerido para SCHEDULED)
 *               refundType:
 *                 type: string
 *                 enum: [NONE, PARTIAL, FULL, PRORATED]
 *                 default: "NONE"
 *                 example: "PRORATED"
 *                 description: Tipo de reembolso a procesar
 *               dataRetention:
 *                 type: object
 *                 properties:
 *                   retain:
 *                     type: boolean
 *                     default: true
 *                     example: true
 *                     description: Retener datos del negocio
 *                   retentionPeriod:
 *                     type: integer
 *                     default: 90
 *                     example: 30
 *                     description: Días de retención (si retain=true)
 *               notifications:
 *                 type: object
 *                 properties:
 *                   notifyBusiness:
 *                     type: boolean
 *                     default: true
 *                     example: true
 *                     description: Notificar al negocio
 *                   notifyUsers:
 *                     type: boolean
 *                     default: true
 *                     example: true
 *                     description: Notificar a usuarios del negocio
 *                   sendSummary:
 *                     type: boolean
 *                     default: false
 *                     example: true
 *                     description: Enviar resumen de uso
 *               adminNotes:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Cancelación por incumplimiento reportado por múltiples usuarios"
 *                 description: Notas administrativas internas
 *           example:
 *             reason: "Violación de términos de servicio"
 *             cancellationType: "IMMEDIATE"
 *             effectiveDate: "2024-11-16T00:00:00.000Z"
 *             refundType: "PRORATED"
 *             dataRetention:
 *               retain: true
 *               retentionPeriod: 30
 *             notifications:
 *               notifyBusiness: true
 *               notifyUsers: true
 *               sendSummary: true
 *             adminNotes: "Cancelación por incumplimiento reportado por múltiples usuarios"
 *     responses:
 *       200:
 *         description: Suscripción cancelada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Suscripción cancelada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscription:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "675082912345678901234abc"
 *                         businessId:
 *                           type: string
 *                           example: "675082912345678901234567"
 *                         businessName:
 *                           type: string
 *                           example: "Bella Spa & Wellness"
 *                         planName:
 *                           type: string
 *                           example: "Plan Premium"
 *                         status:
 *                           type: string
 *                           example: "CANCELED"
 *                         previousStatus:
 *                           type: string
 *                           example: "ACTIVE"
 *                         originalEndDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-02-16T23:59:59.999Z"
 *                         canceledAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-11-15T17:30:00.000Z"
 *                         effectiveDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-11-16T00:00:00.000Z"
 *                         canceledBy:
 *                           type: string
 *                           example: "67508291234567890123456o"
 *                         cancellationReason:
 *                           type: string
 *                           example: "Violación de términos de servicio"
 *                         cancellationType:
 *                           type: string
 *                           example: "IMMEDIATE"
 *                     usage:
 *                       type: object
 *                       properties:
 *                         daysUsed:
 *                           type: integer
 *                           example: 45
 *                         daysRemaining:
 *                           type: integer
 *                           example: 47
 *                         usagePercentage:
 *                           type: number
 *                           example: 48.9
 *                         features:
 *                           type: object
 *                           properties:
 *                             appointments:
 *                               type: integer
 *                               example: 234
 *                             clients:
 *                               type: integer
 *                               example: 156
 *                             users:
 *                               type: integer
 *                               example: 8
 *                             storageUsed:
 *                               type: integer
 *                               example: 2147483648
 *                     billing:
 *                       type: object
 *                       properties:
 *                         originalAmount:
 *                           type: number
 *                           example: 229.47
 *                         usedAmount:
 *                           type: number
 *                           example: 112.23
 *                         refund:
 *                           type: object
 *                           properties:
 *                             type:
 *                               type: string
 *                               example: "PRORATED"
 *                             amount:
 *                               type: number
 *                               example: 117.24
 *                             status:
 *                               type: string
 *                               enum: [PENDING, PROCESSED, DENIED, NOT_APPLICABLE]
 *                               example: "PENDING"
 *                             processingTime:
 *                               type: string
 *                               example: "3-5 días hábiles"
 *                             method:
 *                               type: string
 *                               example: "ORIGINAL_PAYMENT_METHOD"
 *                     dataManagement:
 *                       type: object
 *                       properties:
 *                         retention:
 *                           type: object
 *                           properties:
 *                             enabled:
 *                               type: boolean
 *                               example: true
 *                             period:
 *                               type: integer
 *                               example: 30
 *                             expirationDate:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-12-16T00:00:00.000Z"
 *                         backup:
 *                           type: object
 *                           properties:
 *                             created:
 *                               type: boolean
 *                               example: true
 *                             location:
 *                               type: string
 *                               example: "secure-backup-storage"
 *                             downloadUrl:
 *                               type: string
 *                               example: "https://backups.beautycontrol.com/download/abc123"
 *                               description: URL temporal para descarga de backup
 *                         access:
 *                           type: object
 *                           properties:
 *                             revoked:
 *                               type: boolean
 *                               example: true
 *                             revokedAt:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-11-16T00:00:00.000Z"
 *                             graceпериod:
 *                               type: integer
 *                               description: Días de período de gracia para reactivar
 *                               example: 7
 *                     notifications:
 *                       type: object
 *                       properties:
 *                         businessNotified:
 *                           type: boolean
 *                           example: true
 *                         usersNotified:
 *                           type: integer
 *                           example: 8
 *                         summarySent:
 *                           type: boolean
 *                           example: true
 *                         supportTicketCreated:
 *                           type: boolean
 *                           example: true
 *                     reactivation:
 *                       type: object
 *                       properties:
 *                         possible:
 *                           type: boolean
 *                           example: true
 *                         deadline:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-11-23T23:59:59.999Z"
 *                         conditions:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["Resolución de violación reportada", "Pago de penalidades", "Aceptación de nuevos términos"]
 *             example:
 *               success: true
 *               message: "Suscripción cancelada exitosamente"
 *               data:
 *                 subscription:
 *                   id: "675082912345678901234abc"
 *                   businessId: "675082912345678901234567"
 *                   businessName: "Bella Spa & Wellness"
 *                   planName: "Plan Premium"
 *                   status: "CANCELED"
 *                   previousStatus: "ACTIVE"
 *                   originalEndDate: "2025-02-16T23:59:59.999Z"
 *                   canceledAt: "2024-11-15T17:30:00.000Z"
 *                   effectiveDate: "2024-11-16T00:00:00.000Z"
 *                   canceledBy: "67508291234567890123456o"
 *                   cancellationReason: "Violación de términos de servicio"
 *                   cancellationType: "IMMEDIATE"
 *                 usage:
 *                   daysUsed: 45
 *                   daysRemaining: 47
 *                   usagePercentage: 48.9
 *                   features:
 *                     appointments: 234
 *                     clients: 156
 *                     users: 8
 *                     storageUsed: 2147483648
 *                 billing:
 *                   originalAmount: 229.47
 *                   usedAmount: 112.23
 *                   refund:
 *                     type: "PRORATED"
 *                     amount: 117.24
 *                     status: "PENDING"
 *                     processingTime: "3-5 días hábiles"
 *                     method: "ORIGINAL_PAYMENT_METHOD"
 *                 dataManagement:
 *                   retention:
 *                     enabled: true
 *                     period: 30
 *                     expirationDate: "2024-12-16T00:00:00.000Z"
 *                   backup:
 *                     created: true
 *                     location: "secure-backup-storage"
 *                     downloadUrl: "https://backups.beautycontrol.com/download/abc123"
 *                   access:
 *                     revoked: true
 *                     revokedAt: "2024-11-16T00:00:00.000Z"
 *                     gracePeriod: 7
 *                 notifications:
 *                   businessNotified: true
 *                   usersNotified: 8
 *                   summarySent: true
 *                   supportTicketCreated: true
 *                 reactivation:
 *                   possible: true
 *                   deadline: "2024-11-23T23:59:59.999Z"
 *                   conditions: ["Resolución de violación reportada", "Pago de penalidades", "Aceptación de nuevos términos"]
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidCancellation:
 *                 summary: Tipo de cancelación inválido
 *                 value:
 *                   success: false
 *                   error: "Tipo de cancelación no válido"
 *               missingEffectiveDate:
 *                 summary: Fecha efectiva requerida
 *                 value:
 *                   success: false
 *                   error: "Fecha efectiva requerida para cancelación programada"
 *       404:
 *         description: Suscripción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Suscripción no encontrada"
 *       409:
 *         description: Conflicto con estado actual
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               alreadyCanceled:
 *                 summary: Ya cancelada
 *                 value:
 *                   success: false
 *                   error: "La suscripción ya está cancelada"
 *               pendingPayments:
 *                 summary: Pagos pendientes
 *                 value:
 *                   success: false
 *                   error: "No se puede cancelar con pagos pendientes. Resuelva primero los pagos pendientes."
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/subscriptions/:subscriptionId/cancel', OwnerController.cancelSubscription);

// === GESTIÓN DE PAGOS ===

/**
 * Sub-rutas para gestión de pagos de suscripciones
 * Incluye: listado, creación, actualización y comprobantes
 */
router.use('/payments', require('./ownerPayments'));

/**
 * Sub-rutas para configuraciones de pago del OWNER
 * Incluye: CRUD, activación y configuración de proveedores
 */
router.use('/payment-configurations', require('./ownerPaymentConfigurations'));

/**
 * Sub-rutas para reportes financieros del OWNER
 * Incluye: generación, consulta y estadísticas ejecutivas
 */
router.use('/financial-reports', require('./ownerFinancialReports'));

/**
 * Sub-rutas para verificación de estados de suscripciones
 * Incluye: monitoreo, verificación manual, confirmación de pagos
 */
// router.use('/subscription-status', require('./ownerSubscriptionStatus')); // TODO: Implementar cuando esté disponible

/**
 * Sub-rutas para gestión de trials del OWNER
 * Incluye: creación manual, extensión, conversión, cancelación y estadísticas
 */
router.use('/trials', ownerTrialsRoutes);

module.exports = router;