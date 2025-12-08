/**
 * Rutas para gestión de negocios por parte del Owner
 */

const express = require('express');
const router = express.Router();
const OwnerBusinessManagementController = require('../controllers/OwnerBusinessManagementController');
const { authenticateToken } = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');

// Middleware para todas las rutas - solo owners autenticados
router.use(authenticateToken);
router.use(ownerOnly);

/**
 * @swagger
 * /api/owner/business/invite:
 *   post:
 *     tags:
 *       - Owner Business Management
 *     summary: Crear negocio e invitación de pago
 *     description: Crea un nuevo negocio y envía una invitación de pago personalizada al propietario del negocio
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
 *               - ownerName
 *               - subscriptionPlanId
 *             properties:
 *               businessName:
 *                 type: string
 *                 maxLength: 255
 *                 description: Nombre del negocio a crear
 *                 example: "Salón Bella Vista"
 *               businessEmail:
 *                 type: string
 *                 format: email
 *                 description: Email principal del negocio
 *                 example: "admin@bellavista.com"
 *               ownerName:
 *                 type: string
 *                 maxLength: 255
 *                 description: Nombre del propietario del negocio
 *                 example: "María González"
 *               ownerEmail:
 *                 type: string
 *                 format: email
 *                 description: Email personal del propietario (opcional, usa businessEmail si no se proporciona)
 *                 example: "maria@gmail.com"
 *               subscriptionPlanId:
 *                 type: string
 *                 description: ID del plan de suscripción a asignar
 *                 example: "plan_basic_001"
 *               customMessage:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Mensaje personalizado para la invitación
 *                 example: "Te invitamos a unirte a nuestra plataforma"
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha límite para completar el pago (opcional, por defecto 30 días)
 *                 example: "2024-02-15T23:59:59Z"
 *           example:
 *             businessName: "Salón Bella Vista"
 *             businessEmail: "admin@bellavista.com"
 *             ownerName: "María González"
 *             subscriptionPlanId: "plan_basic_001"
 *             customMessage: "¡Bienvenida a Beauty Control!"
 *     responses:
 *       201:
 *         description: Negocio e invitación creados exitosamente
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
 *                   example: "Negocio e invitación creados exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/BusinessInvitation'
 *             example:
 *               success: true
 *               message: "Negocio e invitación creados exitosamente"
 *               data:
 *                 id: "789e0123-e89b-12d3-a456-426614174002"
 *                 token: "abc123def456"
 *                 status: "PENDING"
 *                 expiresAt: "2024-01-22T10:30:00Z"
 *                 business:
 *                   name: "Salón Bella Vista"
 *                   email: "admin@bellavista.com"
 *                 subscriptionPlan:
 *                   name: "Plan Básico"
 *                   price: 29.99
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       409:
 *         description: El negocio ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Ya existe un negocio con ese email"
 *               error: "BUSINESS_ALREADY_EXISTS"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/invite', OwnerBusinessManagementController.createBusinessInvitation);

/**
 * @swagger
 * /api/owner/business/invitations:
 *   get:
 *     tags:
 *       - Owner Business Management
 *     summary: Listar invitaciones enviadas
 *     description: Obtiene todas las invitaciones de negocio enviadas por el propietario autenticado con filtros opcionales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACCEPTED, EXPIRED, CANCELLED]
 *         description: Filtrar por estado de la invitación
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre del negocio o email
 *       - in: query
 *         name: planId
 *         schema:
 *           type: string
 *         description: Filtrar por plan de suscripción
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
 *         description: Cantidad de resultados por página
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, expiresAt, businessName]
 *           default: createdAt
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Lista de invitaciones obtenida exitosamente
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
 *                     invitations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/BusinessInvitation'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         pending:
 *                           type: integer
 *                         accepted:
 *                           type: integer
 *                         expired:
 *                           type: integer
 *                         cancelled:
 *                           type: integer
 *             example:
 *               success: true
 *               data:
 *                 invitations:
 *                   - id: "789e0123-e89b-12d3-a456-426614174002"
 *                     token: "abc123def456"
 *                     status: "PENDING"
 *                     expiresAt: "2024-01-22T10:30:00Z"
 *                     createdAt: "2024-01-15T10:30:00Z"
 *                     business:
 *                       name: "Salón Bella Vista"
 *                       email: "admin@bellavista.com"
 *                     subscriptionPlan:
 *                       name: "Plan Pro"
 *                       price: 49.99
 *                 pagination:
 *                   page: 1
 *                   limit: 10
 *                   total: 25
 *                   pages: 3
 *                 summary:
 *                   total: 25
 *                   pending: 8
 *                   accepted: 12
 *                   expired: 3
 *                   cancelled: 2
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/invitations', OwnerBusinessManagementController.getMyInvitations);

/**
 * @swagger
 * /api/owner/business/invitations/{invitationId}/resend:
 *   post:
 *     tags:
 *       - Owner Business Management
 *     summary: Reenviar invitación
 *     description: Reenvía una invitación pendiente, renovando su fecha de expiración y notificando al destinatario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único de la invitación a reenviar
 *         example: "789e0123-e89b-12d3-a456-426614174002"
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customMessage:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Mensaje personalizado para el reenvío
 *                 example: "Recordatorio: Tu invitación expira pronto"
 *               newExpirationDays:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 90
 *                 description: Nuevos días para la expiración (por defecto 30)
 *                 example: 15
 *           example:
 *             customMessage: "Recordatorio: No olvides completar tu registro"
 *             newExpirationDays: 15
 *     responses:
 *       200:
 *         description: Invitación reenviada exitosamente
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
 *                   example: "Invitación reenviada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "789e0123-e89b-12d3-a456-426614174002"
 *                     newExpiresAt:
 *                       type: string
 *                       format: date-time
 *                       description: Nueva fecha de expiración
 *                       example: "2024-02-15T23:59:59Z"
 *                     resentAt:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha del reenvío
 *                       example: "2024-01-20T14:30:00Z"
 *                     resendCount:
 *                       type: integer
 *                       description: Número de reenvíos realizados
 *                       example: 2
 *             example:
 *               success: true
 *               message: "Invitación reenviada exitosamente"
 *               data:
 *                 id: "789e0123-e89b-12d3-a456-426614174002"
 *                 newExpiresAt: "2024-02-15T23:59:59Z"
 *                 resentAt: "2024-01-20T14:30:00Z"
 *                 resendCount: 2
 *       404:
 *         description: Invitación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Invitación no encontrada"
 *               error: "INVITATION_NOT_FOUND"
 *       400:
 *         description: No se puede reenviar la invitación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               already_accepted:
 *                 summary: Invitación ya aceptada
 *                 value:
 *                   success: false
 *                   message: "No se puede reenviar una invitación ya aceptada"
 *                   error: "INVITATION_ALREADY_ACCEPTED"
 *               cancelled:
 *                 summary: Invitación cancelada
 *                 value:
 *                   success: false
 *                   message: "No se puede reenviar una invitación cancelada"
 *                   error: "INVITATION_CANCELLED"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/invitations/:invitationId/resend', OwnerBusinessManagementController.resendInvitation);

/**
 * @swagger
 * /api/owner/business/invitations/{invitationId}:
 *   delete:
 *     tags:
 *       - Owner Business Management
 *     summary: Cancelar invitación
 *     description: Cancela una invitación pendiente, impidiendo que el negocio pueda completar el proceso de registro
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único de la invitación a cancelar
 *         example: "789e0123-e89b-12d3-a456-426614174002"
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *                 description: Motivo de la cancelación (opcional)
 *                 example: "El negocio decidió no continuar con el servicio"
 *           example:
 *             reason: "Cambio en los requerimientos del negocio"
 *     responses:
 *       200:
 *         description: Invitación cancelada exitosamente
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
 *                   example: "Invitación cancelada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "789e0123-e89b-12d3-a456-426614174002"
 *                     status:
 *                       type: string
 *                       example: "CANCELLED"
 *                     cancelledAt:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha de cancelación
 *                       example: "2024-01-20T15:45:00Z"
 *                     cancelReason:
 *                       type: string
 *                       description: Motivo de la cancelación
 *                       example: "Cambio en los requerimientos del negocio"
 *             example:
 *               success: true
 *               message: "Invitación cancelada exitosamente"
 *               data:
 *                 id: "789e0123-e89b-12d3-a456-426614174002"
 *                 status: "CANCELLED"
 *                 cancelledAt: "2024-01-20T15:45:00Z"
 *                 cancelReason: "Cambio en los requerimientos del negocio"
 *       404:
 *         description: Invitación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Invitación no encontrada"
 *               error: "INVITATION_NOT_FOUND"
 *       400:
 *         description: No se puede cancelar la invitación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               already_accepted:
 *                 summary: Invitación ya aceptada
 *                 value:
 *                   success: false
 *                   message: "No se puede cancelar una invitación ya aceptada"
 *                   error: "INVITATION_ALREADY_ACCEPTED"
 *               already_cancelled:
 *                 summary: Invitación ya cancelada
 *                 value:
 *                   success: false
 *                   message: "La invitación ya está cancelada"
 *                   error: "INVITATION_ALREADY_CANCELLED"
 *               expired:
 *                 summary: Invitación expirada
 *                 value:
 *                   success: false
 *                   message: "No se puede cancelar una invitación expirada"
 *                   error: "INVITATION_EXPIRED"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/invitations/:invitationId', OwnerBusinessManagementController.cancelInvitation);

/**
 * @swagger
 * /api/owner/business/invitations/stats:
 *   get:
 *     tags:
 *       - Owner Business Management
 *     summary: Obtener estadísticas de invitaciones
 *     description: Genera estadísticas completas sobre las invitaciones enviadas, incluyendo tasas de conversión y tendencias temporales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year, all]
 *           default: month
 *         description: Período para las estadísticas
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         description: Fecha de inicio para estadísticas personalizadas
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
 *         description: Fecha de fin para estadísticas personalizadas
 *     responses:
 *       200:
 *         description: Estadísticas de invitaciones generadas exitosamente
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
 *                       description: Período analizado
 *                       example: "month"
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalInvitations:
 *                           type: integer
 *                           description: Total de invitaciones enviadas
 *                           example: 45
 *                         acceptedInvitations:
 *                           type: integer
 *                           description: Invitaciones aceptadas
 *                           example: 32
 *                         pendingInvitations:
 *                           type: integer
 *                           description: Invitaciones pendientes
 *                           example: 8
 *                         expiredInvitations:
 *                           type: integer
 *                           description: Invitaciones expiradas
 *                           example: 3
 *                         cancelledInvitations:
 *                           type: integer
 *                           description: Invitaciones canceladas
 *                           example: 2
 *                         conversionRate:
 *                           type: number
 *                           description: Tasa de conversión en porcentaje
 *                           example: 71.11
 *                         averageAcceptanceTime:
 *                           type: number
 *                           description: Tiempo promedio de aceptación en días
 *                           example: 3.2
 *                     byPlan:
 *                       type: object
 *                       description: Distribución por plan de suscripción
 *                       example:
 *                         "Plan Básico":
 *                           invitations: 15
 *                           accepted: 12
 *                           conversionRate: 80
 *                         "Plan Pro":
 *                           invitations: 20
 *                           accepted: 15
 *                           conversionRate: 75
 *                         "Plan Premium":
 *                           invitations: 10
 *                           accepted: 5
 *                           conversionRate: 50
 *                     timeline:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                             description: Fecha del período
 *                           invitationsSent:
 *                             type: integer
 *                             description: Invitaciones enviadas en el período
 *                           invitationsAccepted:
 *                             type: integer
 *                             description: Invitaciones aceptadas en el período
 *                           conversionRate:
 *                             type: number
 *                             description: Tasa de conversión del período
 *                       example:
 *                         - date: "2024-01-01"
 *                           invitationsSent: 12
 *                           invitationsAccepted: 9
 *                           conversionRate: 75
 *                         - date: "2024-01-08"
 *                           invitationsSent: 8
 *                           invitationsAccepted: 6
 *                           conversionRate: 75
 *                     topPerformingPlans:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           planName:
 *                             type: string
 *                           totalInvitations:
 *                             type: integer
 *                           acceptedInvitations:
 *                             type: integer
 *                           conversionRate:
 *                             type: number
 *                           averageTimeToAccept:
 *                             type: number
 *                       example:
 *                         - planName: "Plan Básico"
 *                           totalInvitations: 15
 *                           acceptedInvitations: 12
 *                           conversionRate: 80
 *                           averageTimeToAccept: 2.5
 *             example:
 *               success: true
 *               data:
 *                 period: "month"
 *                 summary:
 *                   totalInvitations: 45
 *                   acceptedInvitations: 32
 *                   pendingInvitations: 8
 *                   expiredInvitations: 3
 *                   cancelledInvitations: 2
 *                   conversionRate: 71.11
 *                   averageAcceptanceTime: 3.2
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/invitations/stats', OwnerBusinessManagementController.getInvitationStats);

/**
 * @swagger
 * /api/owner/business/plans:
 *   get:
 *     tags:
 *       - Owner Business Management
 *     summary: Obtener planes disponibles para nuevos negocios
 *     description: Lista todos los planes de suscripción disponibles para asignar a nuevos negocios durante el proceso de invitación
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filtrar solo planes activos
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [basic, standard, premium, enterprise]
 *         description: Categoría de planes a filtrar
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Precio máximo de filtro
 *       - in: query
 *         name: features
 *         schema:
 *           type: string
 *         description: Buscar planes que incluyan características específicas
 *     responses:
 *       200:
 *         description: Lista de planes disponibles obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID único del plan
 *                         example: "plan_basic_001"
 *                       name:
 *                         type: string
 *                         description: Nombre del plan
 *                         example: "Plan Básico"
 *                       description:
 *                         type: string
 *                         description: Descripción del plan
 *                         example: "Plan ideal para pequeños negocios"
 *                       price:
 *                         type: number
 *                         description: Precio mensual del plan
 *                         example: 29.99
 *                       currency:
 *                         type: string
 *                         description: Moneda del precio
 *                         example: "COP"
 *                       billingCycle:
 *                         type: string
 *                         enum: [monthly, quarterly, yearly]
 *                         description: Ciclo de facturación
 *                         example: "monthly"
 *                       category:
 *                         type: string
 *                         enum: [basic, standard, premium, enterprise]
 *                         description: Categoría del plan
 *                         example: "basic"
 *                       features:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               description: Nombre de la característica
 *                             included:
 *                               type: boolean
 *                               description: Si está incluida en el plan
 *                             limit:
 *                               type: integer
 *                               description: Límite de la característica (si aplica)
 *                         example:
 *                           - name: "Usuarios"
 *                             included: true
 *                             limit: 5
 *                           - name: "Almacenamiento"
 *                             included: true
 *                             limit: 1000
 *                           - name: "Reportes avanzados"
 *                             included: false
 *                       modules:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               description: ID del módulo
 *                             name:
 *                               type: string
 *                               description: Nombre del módulo
 *                             enabled:
 *                               type: boolean
 *                               description: Si el módulo está habilitado
 *                         example:
 *                           - id: "inventory"
 *                             name: "Gestión de Inventario"
 *                             enabled: true
 *                           - id: "crm"
 *                             name: "CRM Básico"
 *                             enabled: true
 *                       isActive:
 *                         type: boolean
 *                         description: Si el plan está activo
 *                         example: true
 *                       isPopular:
 *                         type: boolean
 *                         description: Si es un plan popular/recomendado
 *                         example: false
 *                       trialPeriod:
 *                         type: integer
 *                         description: Días de período de prueba
 *                         example: 30
 *                       setupFee:
 *                         type: number
 *                         description: Tarifa de configuración inicial
 *                         example: 0
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Fecha de creación del plan
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Última actualización del plan
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total de planes encontrados
 *                       example: 4
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Categorías disponibles
 *                       example: ["basic", "standard", "premium"]
 *                     priceRange:
 *                       type: object
 *                       properties:
 *                         min:
 *                           type: number
 *                           example: 29.99
 *                         max:
 *                           type: number
 *                           example: 199.99
 *             example:
 *               success: true
 *               data:
 *                 - id: "plan_basic_001"
 *                   name: "Plan Básico"
 *                   description: "Ideal para pequeños negocios"
 *                   price: 29.99
 *                   currency: "COP"
 *                   billingCycle: "monthly"
 *                   category: "basic"
 *                   isActive: true
 *                   isPopular: false
 *                   trialPeriod: 30
 *               meta:
 *                 total: 4
 *                 categories: ["basic", "standard", "premium"]
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/plans', OwnerBusinessManagementController.getAvailablePlans);

module.exports = router;