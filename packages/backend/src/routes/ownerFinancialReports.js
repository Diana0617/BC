const express = require('express');
const router = express.Router();
const OwnerFinancialReportController = require('../controllers/OwnerFinancialReportController');
const { authenticateToken } = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');

// Middleware para todas las rutas - solo OWNER
router.use(authenticateToken);
router.use(ownerOnly);

/**
 * @swagger
 * /api/owner/financial-reports:
 *   get:
 *     tags:
 *       - Owner Financial Reports
 *     summary: Obtener todos los reportes financieros
 *     description: Recupera una lista paginada de reportes financieros generados con filtros avanzados por tipo, fecha y estado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reportType
 *         schema:
 *           type: string
 *           enum: [DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY, CUSTOM]
 *         description: Filtrar por tipo de reporte
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         description: Fecha de inicio para filtrar reportes
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
 *         description: Fecha de fin para filtrar reportes
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [GENERATING, COMPLETED, FAILED]
 *         description: Filtrar por estado del reporte
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
 *           default: 20
 *         description: Cantidad de elementos por página
 *     responses:
 *       200:
 *         description: Lista de reportes obtenida exitosamente
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
 *                     reports:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/OwnerFinancialReport'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalReports:
 *                           type: integer
 *                           description: Total de reportes generados
 *                         completedReports:
 *                           type: integer
 *                           description: Reportes completados exitosamente
 *                         failedReports:
 *                           type: integer
 *                           description: Reportes que fallaron
 *             example:
 *               success: true
 *               data:
 *                 reports:
 *                   - id: "123e4567-e89b-12d3-a456-426614174000"
 *                     reportType: "MONTHLY"
 *                     reportPeriod: "2024-01"
 *                     status: "COMPLETED"
 *                     totalRevenue: 2500000
 *                     totalPayments: 125
 *                     generatedAt: "2024-02-01T09:00:00Z"
 *                 pagination:
 *                   currentPage: 1
 *                   totalPages: 3
 *                   totalItems: 45
 *                   itemsPerPage: 20
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', OwnerFinancialReportController.getAllReports);

/**
 * @swagger
 * /api/owner/financial-reports/executive-summary:
 *   get:
 *     tags:
 *       - Owner Financial Reports
 *     summary: Obtener resumen ejecutivo de métricas
 *     description: Genera un resumen ejecutivo con las métricas clave del negocio para el período especificado, incluyendo KPIs y tendencias
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [month, quarter, year]
 *           default: month
 *         description: Período para el resumen ejecutivo
 *         example: "month"
 *     responses:
 *       200:
 *         description: Resumen ejecutivo generado exitosamente
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
 *                       type: string
 *                       description: Período del resumen
 *                       example: "2024-01"
 *                     kpis:
 *                       type: object
 *                       properties:
 *                         totalRevenue:
 *                           type: number
 *                           description: Ingresos totales del período
 *                           example: 2500000
 *                         monthlyRecurringRevenue:
 *                           type: number
 *                           description: Ingresos recurrentes mensuales
 *                           example: 2100000
 *                         averageRevenuePerBusiness:
 *                           type: number
 *                           description: Ingreso promedio por negocio
 *                           example: 83333
 *                         churnRate:
 *                           type: number
 *                           description: Tasa de cancelación en porcentaje
 *                           example: 2.5
 *                         retentionRate:
 *                           type: number
 *                           description: Tasa de retención en porcentaje
 *                           example: 97.5
 *                         totalActiveSubscriptions:
 *                           type: integer
 *                           description: Suscripciones activas
 *                           example: 30
 *                     trends:
 *                       type: object
 *                       properties:
 *                         revenueGrowth:
 *                           type: number
 *                           description: Crecimiento de ingresos vs período anterior
 *                           example: 15.2
 *                         subscriptionGrowth:
 *                           type: number
 *                           description: Crecimiento en suscripciones vs período anterior
 *                           example: 8.7
 *                         paymentSuccessRate:
 *                           type: number
 *                           description: Tasa de éxito en pagos
 *                           example: 94.2
 *                     breakdown:
 *                       type: object
 *                       properties:
 *                         byPlan:
 *                           type: object
 *                           description: Distribución de ingresos por plan
 *                         byPaymentMethod:
 *                           type: object
 *                           description: Distribución por método de pago
 *                         topPerformingBusinesses:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               businessName:
 *                                 type: string
 *                               revenue:
 *                                 type: number
 *                               subscriptionPlan:
 *                                 type: string
 *             example:
 *               success: true
 *               data:
 *                 period: "2024-01"
 *                 kpis:
 *                   totalRevenue: 2500000
 *                   monthlyRecurringRevenue: 2100000
 *                   averageRevenuePerBusiness: 83333
 *                   churnRate: 2.5
 *                   retentionRate: 97.5
 *                   totalActiveSubscriptions: 30
 *                 trends:
 *                   revenueGrowth: 15.2
 *                   subscriptionGrowth: 8.7
 *                   paymentSuccessRate: 94.2
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/executive-summary', OwnerFinancialReportController.getExecutiveSummary);

/**
 * @swagger
 * /api/owner/financial-reports/{id}:
 *   get:
 *     tags:
 *       - Owner Financial Reports
 *     summary: Obtener reporte específico por ID
 *     description: Recupera un reporte financiero específico con todos sus detalles, métricas y datos históricos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del reporte financiero
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Reporte encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/OwnerFinancialReport'
 *             example:
 *               success: true
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 reportType: "MONTHLY"
 *                 reportPeriod: "2024-01"
 *                 startDate: "2024-01-01T00:00:00Z"
 *                 endDate: "2024-01-31T23:59:59Z"
 *                 status: "COMPLETED"
 *                 totalRevenue: 2500000
 *                 subscriptionRevenue: 2100000
 *                 netRevenue: 2375000
 *                 totalPayments: 125
 *                 completedPayments: 118
 *                 failedPayments: 7
 *                 newSubscriptions: 5
 *                 renewedSubscriptions: 23
 *                 canceledSubscriptions: 2
 *                 activeSubscriptions: 30
 *                 churnRate: 6.67
 *                 retentionRate: 93.33
 *                 revenueByPlan:
 *                   "Plan Básico": 600000
 *                   "Plan Pro": 1200000
 *                   "Plan Premium": 700000
 *                 generatedAt: "2024-02-01T09:00:00Z"
 *                 generatedBy: "AUTOMATIC"
 *       404:
 *         description: Reporte no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Reporte financiero no encontrado"
 *               error: "FINANCIAL_REPORT_NOT_FOUND"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', OwnerFinancialReportController.getReportById);

/**
 * @swagger
 * /api/owner/financial-reports/generate:
 *   post:
 *     tags:
 *       - Owner Financial Reports
 *     summary: Generar nuevo reporte financiero
 *     description: Genera un reporte financiero personalizado para el período y tipo especificado con análisis detallado de métricas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportType
 *               - startDate
 *               - endDate
 *             properties:
 *               reportType:
 *                 type: string
 *                 enum: [DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY, CUSTOM]
 *                 description: Tipo de reporte a generar
 *                 example: "MONTHLY"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio del período del reporte
 *                 example: "2024-01-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Fecha de fin del período del reporte
 *                 example: "2024-01-31"
 *               currency:
 *                 type: string
 *                 default: "COP"
 *                 description: Moneda para el reporte
 *                 example: "COP"
 *               includeComparisons:
 *                 type: boolean
 *                 default: true
 *                 description: Incluir comparaciones con períodos anteriores
 *               includeProjections:
 *                 type: boolean
 *                 default: false
 *                 description: Incluir proyecciones futuras basadas en tendencias
 *     responses:
 *       201:
 *         description: Reporte generado exitosamente
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
 *                   example: "Reporte financiero generado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     reportId:
 *                       type: string
 *                       description: ID del reporte generado
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     status:
 *                       type: string
 *                       description: Estado inicial del reporte
 *                       example: "GENERATING"
 *                     estimatedCompletionTime:
 *                       type: string
 *                       format: date-time
 *                       description: Tiempo estimado de finalización
 *                       example: "2024-02-01T09:05:00Z"
 *                     reportType:
 *                       type: string
 *                       example: "MONTHLY"
 *                     reportPeriod:
 *                       type: string
 *                       example: "2024-01"
 *             example:
 *               success: true
 *               message: "Reporte financiero generado exitosamente"
 *               data:
 *                 reportId: "123e4567-e89b-12d3-a456-426614174000"
 *                 status: "GENERATING"
 *                 estimatedCompletionTime: "2024-02-01T09:05:00Z"
 *                 reportType: "MONTHLY"
 *                 reportPeriod: "2024-01"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_dates:
 *                 summary: Fechas inválidas
 *                 value:
 *                   success: false
 *                   message: "La fecha de fin debe ser posterior a la fecha de inicio"
 *                   error: "INVALID_DATE_RANGE"
 *               invalid_type:
 *                 summary: Tipo de reporte inválido
 *                 value:
 *                   success: false
 *                   message: "Tipo de reporte no válido"
 *                   errors:
 *                     - field: "reportType"
 *                       message: "Debe ser uno de: DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY, CUSTOM"
 *       409:
 *         description: Reporte duplicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Ya existe un reporte para este período"
 *               error: "DUPLICATE_REPORT"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/generate', OwnerFinancialReportController.generateReport);

/**
 * @swagger
 * /api/owner/financial-reports/{id}:
 *   delete:
 *     tags:
 *       - Owner Financial Reports
 *     summary: Eliminar reporte financiero
 *     description: Elimina permanentemente un reporte financiero específico. Esta acción no se puede deshacer.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del reporte financiero a eliminar
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Reporte eliminado exitosamente
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
 *                   example: "Reporte financiero eliminado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedReportId:
 *                       type: string
 *                       description: ID del reporte eliminado
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     reportType:
 *                       type: string
 *                       description: Tipo del reporte eliminado
 *                       example: "MONTHLY"
 *                     reportPeriod:
 *                       type: string
 *                       description: Período del reporte eliminado
 *                       example: "2024-01"
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha y hora de eliminación
 *                       example: "2024-02-15T14:30:00Z"
 *             example:
 *               success: true
 *               message: "Reporte financiero eliminado exitosamente"
 *               data:
 *                 deletedReportId: "123e4567-e89b-12d3-a456-426614174000"
 *                 reportType: "MONTHLY"
 *                 reportPeriod: "2024-01"
 *                 deletedAt: "2024-02-15T14:30:00Z"
 *       404:
 *         description: Reporte no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Reporte financiero no encontrado"
 *               error: "FINANCIAL_REPORT_NOT_FOUND"
 *       409:
 *         description: No se puede eliminar el reporte
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               report_in_use:
 *                 summary: Reporte en uso
 *                 value:
 *                   success: false
 *                   message: "No se puede eliminar un reporte que está siendo generado"
 *                   error: "REPORT_IN_GENERATION"
 *               protected_report:
 *                 summary: Reporte protegido
 *                 value:
 *                   success: false
 *                   message: "No se puede eliminar un reporte del sistema"
 *                   error: "PROTECTED_REPORT"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', OwnerFinancialReportController.deleteReport);

module.exports = router;