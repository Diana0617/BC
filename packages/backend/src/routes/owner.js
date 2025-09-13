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
 * @route GET /api/owner/dashboard/plan-distribution
 * @desc Obtener distribución de planes para gráfico circular
 * @access Private (solo OWNER)
 */
router.get('/dashboard/plan-distribution', OwnerDashboardController.getPlanDistribution);

/**
 * @route GET /api/owner/dashboard/top-businesses
 * @desc Obtener top negocios más activos
 * @access Private (solo OWNER)
 * @query {number} limit - Número de negocios a mostrar (máximo 50, default: 10)
 */
router.get('/dashboard/top-businesses', OwnerDashboardController.getTopBusinesses);

/**
 * @route GET /api/owner/dashboard/growth-stats
 * @desc Obtener estadísticas de conversión y crecimiento
 * @access Private (solo OWNER)
 * @query {string} period - Período de tiempo para comparación
 */
router.get('/dashboard/growth-stats', OwnerDashboardController.getGrowthStats);

/**
 * @route GET /api/owner/dashboard/export
 * @desc Exportar datos del dashboard
 * @access Private (solo OWNER)
 * @query {string} format - Formato de exportación (json, csv)
 * @query {string} period - Período de datos a exportar
 */
router.get('/dashboard/export', OwnerDashboardController.exportData);

// === GESTIÓN DE PLANES DE SUSCRIPCIÓN ===

/**
 * @route GET /api/owner/plans
 * @desc Listar todos los planes con estadísticas
 * @access Private (solo OWNER)
 * @query {number} page - Número de página (default: 1)
 * @query {number} limit - Elementos por página (default: 10)
 * @query {string} status - Filtrar por estado (all, ACTIVE, INACTIVE, DEPRECATED)
 * @query {string} sortBy - Campo para ordenar (default: createdAt)
 * @query {string} sortOrder - Orden (ASC, DESC)
 */
router.get('/plans', OwnerPlanController.getAllPlans);

/**
 * @route GET /api/owner/plans/:planId
 * @desc Obtener detalles completos de un plan específico
 * @access Private (solo OWNER)
 * @param {string} planId - ID del plan
 */
router.get('/plans/:planId', OwnerPlanController.getPlanById);

/**
 * @route POST /api/owner/plans
 * @desc Crear un nuevo plan de suscripción
 * @access Private (solo OWNER)
 * @body {string} name - Nombre del plan
 * @body {string} description - Descripción del plan
 * @body {number} price - Precio del plan
 * @body {string} currency - Moneda (default: COP)
 * @body {number} duration - Duración
 * @body {string} durationType - Tipo de duración (DAYS, WEEKS, MONTHS, YEARS)
 * @body {number} maxUsers - Máximo de usuarios
 * @body {number} maxClients - Máximo de clientes
 * @body {number} maxAppointments - Máximo de citas
 * @body {number} storageLimit - Límite de almacenamiento en bytes
 * @body {number} trialDays - Días de prueba
 * @body {object} features - Características del plan
 * @body {object} limitations - Limitaciones del plan
 * @body {boolean} isPopular - Si es plan popular
 */
router.post('/plans', OwnerPlanController.createPlan);

/**
 * @route PUT /api/owner/plans/:planId
 * @desc Actualizar un plan existente
 * @access Private (solo OWNER)
 * @param {string} planId - ID del plan
 * @body {object} updateData - Datos a actualizar
 */
router.put('/plans/:planId', OwnerPlanController.updatePlan);

/**
 * @route PATCH /api/owner/plans/:planId/status
 * @desc Cambiar estado de un plan (activar/desactivar/deprecar)
 * @access Private (solo OWNER)
 * @param {string} planId - ID del plan
 * @body {string} status - Nuevo estado (ACTIVE, INACTIVE, DEPRECATED)
 */
router.patch('/plans/:planId/status', OwnerPlanController.changePlanStatus);

/**
 * @route GET /api/owner/plans/:planId/stats
 * @desc Obtener estadísticas detalladas de uso de un plan
 * @access Private (solo OWNER)
 * @param {string} planId - ID del plan
 */
router.get('/plans/:planId/stats', OwnerPlanController.getPlanUsageStats);

// === ESTADÍSTICAS DE LA PLATAFORMA ===

/**
 * @route GET /api/owner/stats/platform
 * @desc Obtener estadísticas globales de la plataforma
 * @access Private (solo OWNER)
 * @returns {object} Estadísticas de usuarios, negocios, suscripciones e ingresos
 */
router.get('/stats/platform', OwnerController.getPlatformStats);

// === GESTIÓN DE NEGOCIOS ===

/**
 * @route GET /api/owner/businesses
 * @desc Listar todos los negocios de la plataforma
 * @access Private (solo OWNER)
 * @query {number} page - Número de página (default: 1)
 * @query {number} limit - Elementos por página (default: 10)
 * @query {string} status - Filtrar por estado
 * @query {string} search - Búsqueda por nombre o email
 */
router.get('/businesses', OwnerController.getAllBusinesses);

/**
 * @route POST /api/owner/businesses
 * @desc Crear un negocio manualmente (registro administrativo)
 * @access Private (solo OWNER)
 * @body {object} businessData - Datos del negocio y propietario
 * @body {string} businessData.businessName - Nombre del negocio
 * @body {string} businessData.businessEmail - Email del negocio
 * @body {string} businessData.businessPhone - Teléfono del negocio
 * @body {string} businessData.address - Dirección
 * @body {string} businessData.city - Ciudad
 * @body {string} businessData.country - País
 * @body {string} businessData.ownerEmail - Email del propietario
 * @body {string} businessData.ownerFirstName - Nombre del propietario
 * @body {string} businessData.ownerLastName - Apellido del propietario
 * @body {string} businessData.ownerPhone - Teléfono del propietario
 * @body {string} businessData.subscriptionPlanId - ID del plan inicial
 */
router.post('/businesses', OwnerController.createBusinessManually);

/**
 * @route PATCH /api/owner/businesses/:businessId/status
 * @desc Activar/Desactivar un negocio
 * @access Private (solo OWNER)
 * @param {string} businessId - ID del negocio
 * @body {string} status - Nuevo estado (ACTIVE, INACTIVE, SUSPENDED)
 * @body {string} reason - Razón del cambio de estado
 */
router.patch('/businesses/:businessId/status', OwnerController.toggleBusinessStatus);

// === GESTIÓN DE SUSCRIPCIONES ===

/**
 * @route POST /api/owner/subscriptions
 * @desc Crear una suscripción para un negocio
 * @access Private (solo OWNER)
 * @body {string} businessId - ID del negocio
 * @body {string} subscriptionPlanId - ID del plan de suscripción
 * @body {number} duration - Duración en meses (default: 1)
 */
router.post('/subscriptions', OwnerController.createSubscription);

/**
 * @route PATCH /api/owner/subscriptions/:subscriptionId/cancel
 * @desc Cancelar una suscripción
 * @access Private (solo OWNER)
 * @param {string} subscriptionId - ID de la suscripción
 * @body {string} reason - Razón de la cancelación
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
router.use('/subscription-status', require('./subscriptionStatus'));

module.exports = router;