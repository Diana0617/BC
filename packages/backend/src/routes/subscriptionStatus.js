/**
 * Rutas para gestión de verificación de suscripciones (OWNER)
 * 
 * Endpoints:
 * - GET /summary - Resumen general de estados
 * - POST /check - Ejecutar verificación manual  
 * - GET /attention - Suscripciones que requieren atención
 * - GET /business/:businessId - Verificar suscripción específica
 * - PUT /payments/:paymentId/confirm - Confirmar pago
 * - PUT /payments/:paymentId/reject - Rechazar pago
 * - GET /business/:businessId/history - Historial de pagos
 */

const express = require('express');
const router = express.Router();
const SubscriptionStatusController = require('../controllers/SubscriptionStatusController');
const { authenticateToken } = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');

/**
 * @swagger
 * tags:
 *   - name: Owner Subscription Status
 *     description: Gestión y verificación de estados de suscripciones (solo Owner)
 */

// Middleware para todas las rutas - solo OWNER
router.use(authenticateToken);
router.use(ownerOnly);

/**
 * @swagger
 * /api/owner/subscription-status/summary:
 *   get:
 *     tags:
 *       - Owner Subscription Status
 *     summary: Obtener resumen general de estados de suscripciones
 *     description: Proporciona un resumen ejecutivo del estado de todas las suscripciones de la plataforma para el Owner
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
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalSubscriptions:
 *                           type: integer
 *                           description: Total de suscripciones en la plataforma
 *                           example: 250
 *                         activeSubscriptions:
 *                           type: integer
 *                           description: Suscripciones activas
 *                           example: 195
 *                         expiredSubscriptions:
 *                           type: integer
 *                           description: Suscripciones expiradas
 *                           example: 35
 *                         suspendedSubscriptions:
 *                           type: integer
 *                           description: Suscripciones suspendidas
 *                           example: 20
 *                     urgentActions:
 *                       type: object
 *                       properties:
 *                         pendingPayments:
 *                           type: integer
 *                           description: Pagos pendientes de verificación
 *                           example: 12
 *                         expiringSoon:
 *                           type: integer
 *                           description: Suscripciones que vencen en 7 días
 *                           example: 18
 *                         overdue:
 *                           type: integer
 *                           description: Suscripciones vencidas sin pago
 *                           example: 8
 *                         requiresAttention:
 *                           type: integer
 *                           description: Total que requiere atención inmediata
 *                           example: 38
 *                     revenue:
 *                       type: object
 *                       properties:
 *                         monthlyRecurring:
 *                           type: number
 *                           description: Ingresos recurrentes mensuales
 *                           example: 12450.75
 *                         pendingCollection:
 *                           type: number
 *                           description: Monto pendiente de cobro
 *                           example: 980.50
 *                         thisMonthCollected:
 *                           type: number
 *                           description: Monto cobrado este mes
 *                           example: 8750.25
 *                     trends:
 *                       type: object
 *                       properties:
 *                         renewalRate:
 *                           type: number
 *                           description: Tasa de renovación (%)
 *                           example: 85.5
 *                         churnRate:
 *                           type: number
 *                           description: Tasa de cancelación (%)
 *                           example: 14.5
 *                         avgSubscriptionValue:
 *                           type: number
 *                           description: Valor promedio de suscripción
 *                           example: 63.85
 *             example:
 *               success: true
 *               data:
 *                 overview:
 *                   totalSubscriptions: 250
 *                   activeSubscriptions: 195
 *                   expiredSubscriptions: 35
 *                   suspendedSubscriptions: 20
 *                 urgentActions:
 *                   pendingPayments: 12
 *                   expiringSoon: 18
 *                   overdue: 8
 *                   requiresAttention: 38
 *                 revenue:
 *                   monthlyRecurring: 12450.75
 *                   pendingCollection: 980.50
 *                   thisMonthCollected: 8750.25
 *                 trends:
 *                   renewalRate: 85.5
 *                   churnRate: 14.5
 *                   avgSubscriptionValue: 63.85
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/summary', SubscriptionStatusController.getStatusSummary);

/**
 * @swagger
 * /api/owner/subscription-status/check:
 *   post:
 *     tags:
 *       - Owner Subscription Status
 *     summary: Ejecutar verificación manual de suscripciones
 *     description: Ejecuta una verificación manual inmediata de todas las suscripciones para actualizar estados y detectar problemas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scope:
 *                 type: string
 *                 enum: [all, expired, pending, specific]
 *                 description: Alcance de la verificación
 *                 example: all
 *               businessIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs específicos a verificar (solo si scope es 'specific')
 *                 example: ["67508291234567890123456a", "67508291234567890123456b"]
 *               forceUpdate:
 *                 type: boolean
 *                 description: Forzar actualización de estados aunque parezcan correctos
 *                 example: false
 *           example:
 *             scope: all
 *             forceUpdate: false
 *     responses:
 *       200:
 *         description: Verificación ejecutada exitosamente
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
 *                     verificationId:
 *                       type: string
 *                       description: ID único de la verificación ejecutada
 *                       example: "verify_20241201_143022_abc123"
 *                     startTime:
 *                       type: string
 *                       format: date-time
 *                       description: Hora de inicio de la verificación
 *                       example: "2024-12-01T14:30:22.154Z"
 *                     endTime:
 *                       type: string
 *                       format: date-time
 *                       description: Hora de finalización
 *                       example: "2024-12-01T14:32:18.698Z"
 *                     processed:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           description: Total de suscripciones procesadas
 *                           example: 250
 *                         updated:
 *                           type: integer
 *                           description: Suscripciones que requirieron actualización
 *                           example: 23
 *                         errors:
 *                           type: integer
 *                           description: Errores encontrados durante verificación
 *                           example: 2
 *                     changes:
 *                       type: object
 *                       properties:
 *                         statusChanges:
 *                           type: integer
 *                           description: Cambios de estado detectados
 *                           example: 18
 *                         newExpirations:
 *                           type: integer
 *                           description: Nuevas expiraciones detectadas
 *                           example: 5
 *                         reactivations:
 *                           type: integer
 *                           description: Suscripciones reactivadas
 *                           example: 3
 *                     alerts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             enum: [warning, error, info]
 *                             example: warning
 *                           businessId:
 *                             type: string
 *                             example: "67508291234567890123456a"
 *                           businessName:
 *                             type: string
 *                             example: "Salón Bella Vista"
 *                           message:
 *                             type: string
 *                             example: "Suscripción vencida hace 5 días sin pago confirmado"
 *                           priority:
 *                             type: string
 *                             enum: [low, medium, high, urgent]
 *                             example: high
 *             example:
 *               success: true
 *               data:
 *                 verificationId: "verify_20241201_143022_abc123"
 *                 startTime: "2024-12-01T14:30:22.154Z"
 *                 endTime: "2024-12-01T14:32:18.698Z"
 *                 processed:
 *                   total: 250
 *                   updated: 23
 *                   errors: 2
 *                 changes:
 *                   statusChanges: 18
 *                   newExpirations: 5
 *                   reactivations: 3
 *                 alerts:
 *                   - type: warning
 *                     businessId: "67508291234567890123456a"
 *                     businessName: "Salón Bella Vista"
 *                     message: "Suscripción vencida hace 5 días sin pago confirmado"
 *                     priority: high
 *       400:
 *         description: Parámetros de verificación inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Scope 'specific' requiere businessIds válidos"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/check', SubscriptionStatusController.runManualCheck);

/**
 * @swagger
 * /api/owner/subscription-status/attention:
 *   get:
 *     tags:
 *       - Owner Subscription Status
 *     summary: Obtener suscripciones que requieren atención
 *     description: Lista todas las suscripciones que requieren atención inmediata del Owner (vencidas, con problemas de pago, etc.)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent, all]
 *           default: all
 *         description: Filtrar por nivel de prioridad
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [expired, payment_pending, payment_failed, expiring_soon, suspended, all]
 *           default: all
 *         description: Filtrar por tipo de problema
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Número máximo de resultados
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Número de resultados a omitir (paginación)
 *     responses:
 *       200:
 *         description: Lista de suscripciones que requieren atención obtenida exitosamente
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
 *                     items:
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
 *                           contactEmail:
 *                             type: string
 *                             format: email
 *                             example: "contacto@salonbellavista.com"
 *                           subscriptionStatus:
 *                             type: string
 *                             enum: [active, expired, suspended, pending_payment]
 *                             example: expired
 *                           currentPlan:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "Plan Premium"
 *                               price:
 *                                 type: number
 *                                 example: 89.99
 *                               currency:
 *                                 type: string
 *                                 example: "COP"
 *                           issue:
 *                             type: object
 *                             properties:
 *                               type:
 *                                 type: string
 *                                 enum: [expired, payment_pending, payment_failed, expiring_soon, suspended]
 *                                 example: expired
 *                               description:
 *                                 type: string
 *                                 example: "Suscripción vencida hace 5 días"
 *                               priority:
 *                                 type: string
 *                                 enum: [low, medium, high, urgent]
 *                                 example: high
 *                               daysOverdue:
 *                                 type: integer
 *                                 description: Días vencidos (si aplica)
 *                                 example: 5
 *                           lastPayment:
 *                             type: object
 *                             properties:
 *                               date:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2024-10-15T10:30:00.000Z"
 *                               amount:
 *                                 type: number
 *                                 example: 89.99
 *                               status:
 *                                 type: string
 *                                 enum: [completed, pending, failed, rejected]
 *                                 example: completed
 *                           nextAction:
 *                             type: object
 *                             properties:
 *                               recommended:
 *                                 type: string
 *                                 example: "contact_client"
 *                               description:
 *                                 type: string
 *                                 example: "Contactar al cliente para renovación"
 *                               urgent:
 *                                 type: boolean
 *                                 example: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T08:00:00.000Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-11-20T15:45:30.000Z"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           description: Total de elementos
 *                           example: 38
 *                         limit:
 *                           type: integer
 *                           example: 50
 *                         offset:
 *                           type: integer
 *                           example: 0
 *                         hasMore:
 *                           type: boolean
 *                           example: false
 *                     summary:
 *                       type: object
 *                       properties:
 *                         byPriority:
 *                           type: object
 *                           properties:
 *                             urgent:
 *                               type: integer
 *                               example: 8
 *                             high:
 *                               type: integer
 *                               example: 15
 *                             medium:
 *                               type: integer
 *                               example: 12
 *                             low:
 *                               type: integer
 *                               example: 3
 *                         byType:
 *                           type: object
 *                           properties:
 *                             expired:
 *                               type: integer
 *                               example: 20
 *                             payment_pending:
 *                               type: integer
 *                               example: 8
 *                             payment_failed:
 *                               type: integer
 *                               example: 5
 *                             expiring_soon:
 *                               type: integer
 *                               example: 5
 *             example:
 *               success: true
 *               data:
 *                 items:
 *                   - businessId: "67508291234567890123456a"
 *                     businessName: "Salón Bella Vista"
 *                     contactEmail: "contacto@salonbellavista.com"
 *                     subscriptionStatus: expired
 *                     currentPlan:
 *                       name: "Plan Premium"
 *                       price: 89.99
 *                       currency: "COP"
 *                     issue:
 *                       type: expired
 *                       description: "Suscripción vencida hace 5 días"
 *                       priority: high
 *                       daysOverdue: 5
 *                     lastPayment:
 *                       date: "2024-10-15T10:30:00.000Z"
 *                       amount: 89.99
 *                       status: completed
 *                     nextAction:
 *                       recommended: "contact_client"
 *                       description: "Contactar al cliente para renovación"
 *                       urgent: true
 *                     createdAt: "2024-01-15T08:00:00.000Z"
 *                     updatedAt: "2024-11-20T15:45:30.000Z"
 *                 pagination:
 *                   total: 38
 *                   limit: 50
 *                   offset: 0
 *                   hasMore: false
 *                 summary:
 *                   byPriority:
 *                     urgent: 8
 *                     high: 15
 *                     medium: 12
 *                     low: 3
 *                   byType:
 *                     expired: 20
 *                     payment_pending: 8
 *                     payment_failed: 5
 *                     expiring_soon: 5
 *       400:
 *         description: Parámetros de consulta inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Parámetro 'priority' debe ser uno de: low, medium, high, urgent, all"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/attention', SubscriptionStatusController.getAttentionRequired);

/**
 * @swagger
 * /api/owner/subscription-status/business/{businessId}:
 *   get:
 *     tags:
 *       - Owner Subscription Status
 *     summary: Verificar estado específico de suscripción de negocio
 *     description: Obtiene información detallada del estado de suscripción de un negocio específico para verificación del Owner
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del negocio a verificar
 *         example: "67508291234567890123456a"
 *       - in: query
 *         name: includeHistory
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir historial de pagos reciente
 *       - in: query
 *         name: includeModules
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir información de módulos utilizados
 *     responses:
 *       200:
 *         description: Estado de suscripción obtenido exitosamente
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
 *                     business:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "67508291234567890123456a"
 *                         name:
 *                           type: string
 *                           example: "Salón Bella Vista"
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: "contacto@salonbellavista.com"
 *                         phone:
 *                           type: string
 *                           example: "+57 300 123 4567"
 *                         subdomain:
 *                           type: string
 *                           example: "bellavista"
 *                         registeredAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-15T08:00:00.000Z"
 *                     subscription:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [active, expired, suspended, pending_payment, trial]
 *                           example: active
 *                         currentPlan:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "67508291234567890123456p"
 *                             name:
 *                               type: string
 *                               example: "Plan Premium"
 *                             price:
 *                               type: number
 *                               example: 89.99
 *                             currency:
 *                               type: string
 *                               example: "COP"
 *                             features:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["appointments", "inventory", "reports", "customers"]
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-15T08:00:00.000Z"
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-12-15T08:00:00.000Z"
 *                         daysRemaining:
 *                           type: integer
 *                           description: Días restantes (negativo si vencido)
 *                           example: 25
 *                         autoRenewal:
 *                           type: boolean
 *                           example: true
 *                         renewalAttempts:
 *                           type: integer
 *                           description: Intentos de renovación automática realizados
 *                           example: 0
 *                     payment:
 *                       type: object
 *                       properties:
 *                         lastPayment:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "pay_67508291234567890123456a"
 *                             amount:
 *                               type: number
 *                               example: 89.99
 *                             currency:
 *                               type: string
 *                               example: "COP"
 *                             method:
 *                               type: string
 *                               enum: [wompi, manual, bank_transfer]
 *                               example: wompi
 *                             status:
 *                               type: string
 *                               enum: [completed, pending, failed, rejected]
 *                               example: completed
 *                             date:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-11-15T14:30:00.000Z"
 *                             transactionId:
 *                               type: string
 *                               example: "wompi_tx_abc123"
 *                         nextPayment:
 *                           type: object
 *                           properties:
 *                             dueDate:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-12-15T08:00:00.000Z"
 *                             amount:
 *                               type: number
 *                               example: 89.99
 *                             currency:
 *                               type: string
 *                               example: "COP"
 *                             status:
 *                               type: string
 *                               enum: [pending, scheduled, overdue]
 *                               example: scheduled
 *                         paymentIssues:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               type:
 *                                 type: string
 *                                 enum: [failed_payment, declined_card, insufficient_funds, expired_card]
 *                                 example: failed_payment
 *                               description:
 *                                 type: string
 *                                 example: "El último intento de pago falló"
 *                               date:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2024-11-20T10:15:00.000Z"
 *                               resolved:
 *                                 type: boolean
 *                                 example: false
 *                     systemChecks:
 *                       type: object
 *                       properties:
 *                         lastVerification:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-12-01T06:00:00.000Z"
 *                         accessStatus:
 *                           type: string
 *                           enum: [full_access, limited_access, no_access]
 *                           example: full_access
 *                         moduleAccess:
 *                           type: object
 *                           properties:
 *                             available:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["appointments", "inventory", "reports", "customers"]
 *                             restricted:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: []
 *                         healthScore:
 *                           type: integer
 *                           minimum: 0
 *                           maximum: 100
 *                           description: Puntuación de salud de la suscripción (0-100)
 *                           example: 85
 *                     history:
 *                       type: array
 *                       description: Historial reciente (solo si includeHistory=true)
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-11-15T14:30:00.000Z"
 *                           type:
 *                             type: string
 *                             enum: [payment, status_change, plan_change, renewal]
 *                             example: payment
 *                           description:
 *                             type: string
 *                             example: "Pago exitoso de Plan Premium"
 *                           amount:
 *                             type: number
 *                             example: 89.99
 *                           status:
 *                             type: string
 *                             example: completed
 *             example:
 *               success: true
 *               data:
 *                 business:
 *                   id: "67508291234567890123456a"
 *                   name: "Salón Bella Vista"
 *                   email: "contacto@salonbellavista.com"
 *                   phone: "+57 300 123 4567"
 *                   subdomain: "bellavista"
 *                   registeredAt: "2024-01-15T08:00:00.000Z"
 *                 subscription:
 *                   status: active
 *                   currentPlan:
 *                     id: "67508291234567890123456p"
 *                     name: "Plan Premium"
 *                     price: 89.99
 *                     currency: "COP"
 *                     features: ["appointments", "inventory", "reports", "customers"]
 *                   startDate: "2024-01-15T08:00:00.000Z"
 *                   endDate: "2024-12-15T08:00:00.000Z"
 *                   daysRemaining: 25
 *                   autoRenewal: true
 *                   renewalAttempts: 0
 *                 payment:
 *                   lastPayment:
 *                     id: "pay_67508291234567890123456a"
 *                     amount: 89.99
 *                     currency: "COP"
 *                     method: wompi
 *                     status: completed
 *                     date: "2024-11-15T14:30:00.000Z"
 *                     transactionId: "wompi_tx_abc123"
 *                   nextPayment:
 *                     dueDate: "2024-12-15T08:00:00.000Z"
 *                     amount: 89.99
 *                     currency: "COP"
 *                     status: scheduled
 *                   paymentIssues: []
 *                 systemChecks:
 *                   lastVerification: "2024-12-01T06:00:00.000Z"
 *                   accessStatus: full_access
 *                   moduleAccess:
 *                     available: ["appointments", "inventory", "reports", "customers"]
 *                     restricted: []
 *                   healthScore: 85
 *       400:
 *         description: ID de negocio inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "ID de negocio inválido"
 *       404:
 *         description: Negocio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Negocio no encontrado"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/business/:businessId', SubscriptionStatusController.checkSpecificSubscription);

/**
 * @swagger
 * /api/owner/subscription-status/payments/{paymentId}/confirm:
 *   put:
 *     tags:
 *       - Owner Subscription Status
 *     summary: Confirmar pago pendiente y extender suscripción
 *     description: Permite al Owner confirmar manualmente un pago pendiente y extender automáticamente la suscripción del negocio
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del pago a confirmar
 *         example: "pay_67508291234567890123456a"
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
 *                 description: Razón de la confirmación manual
 *                 example: "Pago verificado por transferencia bancaria"
 *               notes:
 *                 type: string
 *                 description: Notas adicionales sobre la confirmación
 *                 example: "Cliente envió comprobante por WhatsApp, validado con banco"
 *               amount:
 *                 type: number
 *                 description: Monto confirmado (si difiere del original)
 *                 example: 89.99
 *               currency:
 *                 type: string
 *                 description: Moneda del pago confirmado
 *                 example: "COP"
 *               paymentMethod:
 *                 type: string
 *                 enum: [bank_transfer, cash, check, wompi, other]
 *                 description: Método de pago utilizado
 *                 example: bank_transfer
 *               transactionReference:
 *                 type: string
 *                 description: Referencia de la transacción externa
 *                 example: "TRF-20241201-001234"
 *               extendSubscription:
 *                 type: boolean
 *                 description: Si extender automáticamente la suscripción
 *                 default: true
 *                 example: true
 *           example:
 *             reason: "Pago verificado por transferencia bancaria"
 *             notes: "Cliente envió comprobante por WhatsApp, validado con banco"
 *             amount: 89.99
 *             currency: "COP"
 *             paymentMethod: bank_transfer
 *             transactionReference: "TRF-20241201-001234"
 *             extendSubscription: true
 *     responses:
 *       200:
 *         description: Pago confirmado exitosamente
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
 *                     payment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "pay_67508291234567890123456a"
 *                         status:
 *                           type: string
 *                           enum: [confirmed]
 *                           example: confirmed
 *                         previousStatus:
 *                           type: string
 *                           enum: [pending, failed]
 *                           example: pending
 *                         amount:
 *                           type: number
 *                           example: 89.99
 *                         currency:
 *                           type: string
 *                           example: "COP"
 *                         method:
 *                           type: string
 *                           example: bank_transfer
 *                         confirmedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-12-01T15:30:00.000Z"
 *                         confirmedBy:
 *                           type: string
 *                           description: ID del Owner que confirmó
 *                           example: "67508291234567890123456o"
 *                         confirmationReason:
 *                           type: string
 *                           example: "Pago verificado por transferencia bancaria"
 *                         transactionReference:
 *                           type: string
 *                           example: "TRF-20241201-001234"
 *                     subscription:
 *                       type: object
 *                       properties:
 *                         businessId:
 *                           type: string
 *                           example: "67508291234567890123456a"
 *                         businessName:
 *                           type: string
 *                           example: "Salón Bella Vista"
 *                         previousStatus:
 *                           type: string
 *                           enum: [active, expired, suspended, pending_payment]
 *                           example: expired
 *                         newStatus:
 *                           type: string
 *                           enum: [active]
 *                           example: active
 *                         previousEndDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-11-15T08:00:00.000Z"
 *                         newEndDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-12-15T08:00:00.000Z"
 *                         daysExtended:
 *                           type: integer
 *                           description: Días extendidos en la suscripción
 *                           example: 30
 *                         autoRenewalEnabled:
 *                           type: boolean
 *                           example: true
 *                     notifications:
 *                       type: object
 *                       properties:
 *                         emailSent:
 *                           type: boolean
 *                           description: Si se envió notificación por email al negocio
 *                           example: true
 *                         smsKey:
 *                           type: boolean
 *                           description: Si se envió notificación SMS
 *                           example: false
 *                         inAppNotified:
 *                           type: boolean
 *                           description: Si se creó notificación en la app
 *                           example: true
 *                     auditTrail:
 *                       type: object
 *                       properties:
 *                         action:
 *                           type: string
 *                           example: "payment_confirmed_manually"
 *                         performedBy:
 *                           type: string
 *                           example: "owner"
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-12-01T15:30:00.000Z"
 *                         details:
 *                           type: object
 *                           properties:
 *                             paymentId:
 *                               type: string
 *                               example: "pay_67508291234567890123456a"
 *                             businessId:
 *                               type: string
 *                               example: "67508291234567890123456a"
 *                             amount:
 *                               type: number
 *                               example: 89.99
 *                             method:
 *                               type: string
 *                               example: "bank_transfer"
 *             example:
 *               success: true
 *               data:
 *                 payment:
 *                   id: "pay_67508291234567890123456a"
 *                   status: confirmed
 *                   previousStatus: pending
 *                   amount: 89.99
 *                   currency: "COP"
 *                   method: bank_transfer
 *                   confirmedAt: "2024-12-01T15:30:00.000Z"
 *                   confirmedBy: "67508291234567890123456o"
 *                   confirmationReason: "Pago verificado por transferencia bancaria"
 *                   transactionReference: "TRF-20241201-001234"
 *                 subscription:
 *                   businessId: "67508291234567890123456a"
 *                   businessName: "Salón Bella Vista"
 *                   previousStatus: expired
 *                   newStatus: active
 *                   previousEndDate: "2024-11-15T08:00:00.000Z"
 *                   newEndDate: "2024-12-15T08:00:00.000Z"
 *                   daysExtended: 30
 *                   autoRenewalEnabled: true
 *                 notifications:
 *                   emailSent: true
 *                   smsKey: false
 *                   inAppNotified: true
 *                 auditTrail:
 *                   action: "payment_confirmed_manually"
 *                   performedBy: "owner"
 *                   timestamp: "2024-12-01T15:30:00.000Z"
 *                   details:
 *                     paymentId: "pay_67508291234567890123456a"
 *                     businessId: "67508291234567890123456a"
 *                     amount: 89.99
 *                     method: "bank_transfer"
 *       400:
 *         description: Datos de confirmación inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "El campo 'reason' es requerido para confirmar el pago"
 *       404:
 *         description: Pago no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Pago no encontrado o ya procesado"
 *       409:
 *         description: El pago ya fue procesado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "El pago ya fue confirmado anteriormente"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/payments/:paymentId/confirm', SubscriptionStatusController.confirmPayment);

/**
 * @swagger
 * /api/owner/subscription-status/payments/{paymentId}/reject:
 *   put:
 *     tags:
 *       - Owner Subscription Status
 *     summary: Rechazar pago pendiente
 *     description: Permite al Owner rechazar un pago pendiente y documentar las razones del rechazo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del pago a rechazar
 *         example: "pay_67508291234567890123456a"
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
 *                 enum: [insufficient_funds, invalid_document, fraud_suspicion, duplicate_payment, incorrect_amount, expired_payment, other]
 *                 description: Razón del rechazo
 *                 example: insufficient_funds
 *               notes:
 *                 type: string
 *                 description: Notas adicionales sobre el rechazo
 *                 example: "Comprobante bancario no coincide con el monto declarado"
 *               suspendSubscription:
 *                 type: boolean
 *                 description: Si suspender la suscripción tras el rechazo
 *                 default: false
 *                 example: false
 *               allowRetry:
 *                 type: boolean
 *                 description: Si permitir reintento de pago
 *                 default: true
 *                 example: true
 *               notifyBusiness:
 *                 type: boolean
 *                 description: Si notificar al negocio sobre el rechazo
 *                 default: true
 *                 example: true
 *           example:
 *             reason: insufficient_funds
 *             notes: "Comprobante bancario no coincide con el monto declarado"
 *             suspendSubscription: false
 *             allowRetry: true
 *             notifyBusiness: true
 *     responses:
 *       200:
 *         description: Pago rechazado exitosamente
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
 *                     payment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "pay_67508291234567890123456a"
 *                         status:
 *                           type: string
 *                           enum: [rejected]
 *                           example: rejected
 *                         previousStatus:
 *                           type: string
 *                           enum: [pending, failed]
 *                           example: pending
 *                         amount:
 *                           type: number
 *                           example: 89.99
 *                         currency:
 *                           type: string
 *                           example: "COP"
 *                         rejectedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-12-01T15:30:00.000Z"
 *                         rejectedBy:
 *                           type: string
 *                           description: ID del Owner que rechazó
 *                           example: "67508291234567890123456o"
 *                         rejectionReason:
 *                           type: string
 *                           example: insufficient_funds
 *                         rejectionNotes:
 *                           type: string
 *                           example: "Comprobante bancario no coincide con el monto declarado"
 *                     subscription:
 *                       type: object
 *                       properties:
 *                         businessId:
 *                           type: string
 *                           example: "67508291234567890123456a"
 *                         businessName:
 *                           type: string
 *                           example: "Salón Bella Vista"
 *                         status:
 *                           type: string
 *                           enum: [active, expired, suspended, pending_payment]
 *                           example: pending_payment
 *                         statusChanged:
 *                           type: boolean
 *                           description: Si el estado de suscripción cambió por el rechazo
 *                           example: false
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-11-15T08:00:00.000Z"
 *                         allowRetry:
 *                           type: boolean
 *                           example: true
 *                         retryDeadline:
 *                           type: string
 *                           format: date-time
 *                           description: Fecha límite para reintento (si allowRetry=true)
 *                           example: "2024-12-08T15:30:00.000Z"
 *                     nextActions:
 *                       type: object
 *                       properties:
 *                         businessCanRetry:
 *                           type: boolean
 *                           example: true
 *                         ownerShouldContact:
 *                           type: boolean
 *                           description: Si el Owner debería contactar al negocio
 *                           example: true
 *                         automaticSuspension:
 *                           type: boolean
 *                           description: Si se programó suspensión automática
 *                           example: false
 *                         suspensionDate:
 *                           type: string
 *                           format: date-time
 *                           description: Fecha de suspensión automática (si aplica)
 *                           nullable: true
 *                           example: null
 *                     notifications:
 *                       type: object
 *                       properties:
 *                         businessNotified:
 *                           type: boolean
 *                           description: Si se notificó al negocio
 *                           example: true
 *                         emailSent:
 *                           type: boolean
 *                           example: true
 *                         smsKey:
 *                           type: boolean
 *                           example: false
 *                         inAppNotified:
 *                           type: boolean
 *                           example: true
 *                     auditTrail:
 *                       type: object
 *                       properties:
 *                         action:
 *                           type: string
 *                           example: "payment_rejected_manually"
 *                         performedBy:
 *                           type: string
 *                           example: "owner"
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-12-01T15:30:00.000Z"
 *                         details:
 *                           type: object
 *                           properties:
 *                             paymentId:
 *                               type: string
 *                               example: "pay_67508291234567890123456a"
 *                             businessId:
 *                               type: string
 *                               example: "67508291234567890123456a"
 *                             reason:
 *                               type: string
 *                               example: "insufficient_funds"
 *                             notes:
 *                               type: string
 *                               example: "Comprobante bancario no coincide con el monto declarado"
 *             example:
 *               success: true
 *               data:
 *                 payment:
 *                   id: "pay_67508291234567890123456a"
 *                   status: rejected
 *                   previousStatus: pending
 *                   amount: 89.99
 *                   currency: "COP"
 *                   rejectedAt: "2024-12-01T15:30:00.000Z"
 *                   rejectedBy: "67508291234567890123456o"
 *                   rejectionReason: insufficient_funds
 *                   rejectionNotes: "Comprobante bancario no coincide con el monto declarado"
 *                 subscription:
 *                   businessId: "67508291234567890123456a"
 *                   businessName: "Salón Bella Vista"
 *                   status: pending_payment
 *                   statusChanged: false
 *                   endDate: "2024-11-15T08:00:00.000Z"
 *                   allowRetry: true
 *                   retryDeadline: "2024-12-08T15:30:00.000Z"
 *                 nextActions:
 *                   businessCanRetry: true
 *                   ownerShouldContact: true
 *                   automaticSuspension: false
 *                   suspensionDate: null
 *                 notifications:
 *                   businessNotified: true
 *                   emailSent: true
 *                   smsKey: false
 *                   inAppNotified: true
 *                 auditTrail:
 *                   action: "payment_rejected_manually"
 *                   performedBy: "owner"
 *                   timestamp: "2024-12-01T15:30:00.000Z"
 *                   details:
 *                     paymentId: "pay_67508291234567890123456a"
 *                     businessId: "67508291234567890123456a"
 *                     reason: "insufficient_funds"
 *                     notes: "Comprobante bancario no coincide con el monto declarado"
 *       400:
 *         description: Datos de rechazo inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "El campo 'reason' es requerido para rechazar el pago"
 *       404:
 *         description: Pago no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Pago no encontrado o ya procesado"
 *       409:
 *         description: El pago ya fue procesado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "El pago ya fue procesado anteriormente"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/payments/:paymentId/reject', SubscriptionStatusController.rejectPayment);

/**
 * @swagger
 * /api/owner/subscription-status/business/{businessId}/history:
 *   get:
 *     tags:
 *       - Owner Subscription Status
 *     summary: Obtener historial de pagos de suscripción
 *     description: Obtiene el historial completo de pagos y eventos de suscripción para un negocio específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del negocio
 *         example: "67508291234567890123456a"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del historial (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del historial (YYYY-MM-DD)
 *         example: "2024-12-31"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [payment, status_change, plan_change, renewal, suspension, all]
 *           default: all
 *         description: Tipo de eventos a incluir
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [completed, pending, failed, rejected, cancelled, all]
 *           default: all
 *         description: Filtrar por estado de los eventos
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Número máximo de resultados
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Número de resultados a omitir (paginación)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de clasificación por fecha
 *     responses:
 *       200:
 *         description: Historial obtenido exitosamente
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
 *                     business:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "67508291234567890123456a"
 *                         name:
 *                           type: string
 *                           example: "Salón Bella Vista"
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: "contacto@salonbellavista.com"
 *                         registeredAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-15T08:00:00.000Z"
 *                     history:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "hist_67508291234567890123456a"
 *                           type:
 *                             type: string
 *                             enum: [payment, status_change, plan_change, renewal, suspension, reactivation]
 *                             example: payment
 *                           date:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-11-15T14:30:00.000Z"
 *                           description:
 *                             type: string
 *                             example: "Pago exitoso de Plan Premium"
 *                           status:
 *                             type: string
 *                             enum: [completed, pending, failed, rejected, cancelled]
 *                             example: completed
 *                           amount:
 *                             type: number
 *                             description: Monto (solo para eventos de pago)
 *                             example: 89.99
 *                           currency:
 *                             type: string
 *                             description: Moneda (solo para eventos de pago)
 *                             example: "COP"
 *                           paymentMethod:
 *                             type: string
 *                             enum: [wompi, bank_transfer, cash, check, other]
 *                             description: Método de pago (solo para eventos de pago)
 *                             example: wompi
 *                           transactionId:
 *                             type: string
 *                             description: ID de transacción externa (si aplica)
 *                             example: "wompi_tx_abc123"
 *                           planDetails:
 *                             type: object
 *                             description: Detalles del plan (para cambios de plan)
 *                             properties:
 *                               previousPlan:
 *                                 type: string
 *                                 example: "Plan Básico"
 *                               newPlan:
 *                                 type: string
 *                                 example: "Plan Premium"
 *                               priceChange:
 *                                 type: number
 *                                 example: 30.00
 *                           subscriptionDetails:
 *                             type: object
 *                             description: Detalles de la suscripción (para cambios de estado)
 *                             properties:
 *                               previousStatus:
 *                                 type: string
 *                                 enum: [active, expired, suspended, pending_payment]
 *                                 example: expired
 *                               newStatus:
 *                                 type: string
 *                                 enum: [active, expired, suspended, pending_payment]
 *                                 example: active
 *                               previousEndDate:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2024-10-15T08:00:00.000Z"
 *                               newEndDate:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2024-11-15T08:00:00.000Z"
 *                           performedBy:
 *                             type: object
 *                             properties:
 *                               type:
 *                                 type: string
 *                                 enum: [system, owner, business, automatic]
 *                                 example: system
 *                               id:
 *                                 type: string
 *                                 description: ID del usuario (si aplica)
 *                                 example: "67508291234567890123456o"
 *                               name:
 *                                 type: string
 *                                 description: Nombre del usuario (si aplica)
 *                                 example: "Sistema Automático"
 *                           notes:
 *                             type: string
 *                             description: Notas adicionales sobre el evento
 *                             example: "Renovación automática exitosa"
 *                           metadata:
 *                             type: object
 *                             description: Metadatos adicionales específicos del evento
 *                             properties:
 *                               ipAddress:
 *                                 type: string
 *                                 example: "192.168.1.1"
 *                               userAgent:
 *                                 type: string
 *                                 example: "Mozilla/5.0..."
 *                               source:
 *                                 type: string
 *                                 enum: [web, mobile, api, system]
 *                                 example: web
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           description: Total de eventos en el historial
 *                           example: 125
 *                         limit:
 *                           type: integer
 *                           example: 50
 *                         offset:
 *                           type: integer
 *                           example: 0
 *                         hasMore:
 *                           type: boolean
 *                           example: true
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalPayments:
 *                           type: integer
 *                           description: Total de pagos en el período
 *                           example: 12
 *                         successfulPayments:
 *                           type: integer
 *                           example: 10
 *                         failedPayments:
 *                           type: integer
 *                           example: 2
 *                         totalAmount:
 *                           type: number
 *                           description: Monto total pagado en el período
 *                           example: 1079.88
 *                         averagePayment:
 *                           type: number
 *                           description: Promedio de pago
 *                           example: 89.99
 *                         planChanges:
 *                           type: integer
 *                           description: Número de cambios de plan
 *                           example: 2
 *                         suspensions:
 *                           type: integer
 *                           description: Número de suspensiones
 *                           example: 1
 *                         reactivations:
 *                           type: integer
 *                           description: Número de reactivaciones
 *                           example: 1
 *             example:
 *               success: true
 *               data:
 *                 business:
 *                   id: "67508291234567890123456a"
 *                   name: "Salón Bella Vista"
 *                   email: "contacto@salonbellavista.com"
 *                   registeredAt: "2024-01-15T08:00:00.000Z"
 *                 history:
 *                   - id: "hist_67508291234567890123456a"
 *                     type: payment
 *                     date: "2024-11-15T14:30:00.000Z"
 *                     description: "Pago exitoso de Plan Premium"
 *                     status: completed
 *                     amount: 89.99
 *                     currency: "COP"
 *                     paymentMethod: wompi
 *                     transactionId: "wompi_tx_abc123"
 *                     performedBy:
 *                       type: system
 *                       id: null
 *                       name: "Sistema Automático"
 *                     notes: "Renovación automática exitosa"
 *                     metadata:
 *                       ipAddress: "192.168.1.1"
 *                       userAgent: "Mozilla/5.0..."
 *                       source: web
 *                 pagination:
 *                   total: 125
 *                   limit: 50
 *                   offset: 0
 *                   hasMore: true
 *                 summary:
 *                   totalPayments: 12
 *                   successfulPayments: 10
 *                   failedPayments: 2
 *                   totalAmount: 1079.88
 *                   averagePayment: 89.99
 *                   planChanges: 2
 *                   suspensions: 1
 *                   reactivations: 1
 *       400:
 *         description: Parámetros de consulta inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Fecha de inicio debe ser anterior a fecha de fin"
 *       404:
 *         description: Negocio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Negocio no encontrado"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/business/:businessId/history', SubscriptionStatusController.getStatusHistory);

module.exports = router;