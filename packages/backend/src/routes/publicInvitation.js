/**
 * Rutas públicas para procesamiento de invitaciones
 * No requieren autenticación
 */

const express = require('express');
const router = express.Router();
const PublicInvitationController = require('../controllers/PublicInvitationController');

/**
 * @swagger
 * tags:
 *   - name: Public Invitations
 *     description: Rutas públicas para procesamiento de invitaciones de negocios (sin autenticación)
 */

/**
 * @swagger
 * /api/public/invitation/{token}:
 *   get:
 *     tags:
 *       - Public Invitations
 *     summary: Validar token de invitación y obtener datos
 *     description: Valida un token de invitación público y retorna los datos del negocio y plan asociados. No requiere autenticación.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token único de la invitación
 *         example: "inv_abc123def456ghi789"
 *     responses:
 *       200:
 *         description: Token válido - datos de invitación obtenidos
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
 *                     invitation:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: ID de la invitación
 *                           example: "invitation_001"
 *                         businessName:
 *                           type: string
 *                           description: Nombre del negocio
 *                           example: "Salon de Belleza María"
 *                         businessEmail:
 *                           type: string
 *                           format: email
 *                           description: Email del negocio
 *                           example: "maria@salonbella.com"
 *                         status:
 *                           type: string
 *                           enum: [PENDING, COMPLETED, EXPIRED, CANCELLED]
 *                           description: Estado de la invitación
 *                           example: "PENDING"
 *                         expiresAt:
 *                           type: string
 *                           format: date-time
 *                           description: Fecha de expiración
 *                           example: "2024-02-15T23:59:59Z"
 *                     plan:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: ID del plan
 *                           example: "plan_pro"
 *                         name:
 *                           type: string
 *                           description: Nombre del plan
 *                           example: "Plan Pro"
 *                         price:
 *                           type: number
 *                           description: Precio del plan
 *                           example: 49.99
 *                         currency:
 *                           type: string
 *                           description: Moneda
 *                           example: "COP"
 *                         features:
 *                           type: array
 *                           description: Características del plan
 *                           items:
 *                             type: string
 *                           example: ["Citas ilimitadas", "Inventario avanzado", "Reportes"]
 *             example:
 *               success: true
 *               data:
 *                 invitation:
 *                   id: "invitation_001"
 *                   businessName: "Salon de Belleza María"
 *                   businessEmail: "maria@salonbella.com"
 *                   status: "PENDING"
 *                   expiresAt: "2024-02-15T23:59:59Z"
 *                 plan:
 *                   id: "plan_pro"
 *                   name: "Plan Pro"
 *                   price: 49.99
 *                   currency: "COP"
 *                   features: ["Citas ilimitadas", "Inventario avanzado", "Reportes"]
 *       404:
 *         description: Token de invitación no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de invitación no encontrado"
 *       410:
 *         description: Token de invitación expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "La invitación ha expirado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
router.get('/invitation/:token', PublicInvitationController.validateInvitation);

/**
 * @swagger
 * /api/public/invitation/{token}/payment:
 *   post:
 *     tags:
 *       - Public Invitations
 *     summary: Procesar pago de invitación
 *     description: Procesa el pago de una invitación válida para activar la suscripción del negocio. No requiere autenticación.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token único de la invitación
 *         example: "inv_abc123def456ghi789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentMethod
 *               - paymentData
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [WOMPI, CREDIT_CARD, BANK_TRANSFER, PSE]
 *                 description: Método de pago utilizado
 *                 example: "WOMPI"
 *               paymentData:
 *                 type: object
 *                 description: Datos específicos del método de pago
 *                 properties:
 *                   transactionId:
 *                     type: string
 *                     description: ID de la transacción del proveedor
 *                     example: "txn_wompi_123456"
 *                   amount:
 *                     type: number
 *                     description: Monto pagado
 *                     example: 49.99
 *                   currency:
 *                     type: string
 *                     description: Moneda del pago
 *                     example: "COP"
 *               customerData:
 *                 type: object
 *                 description: Datos del cliente (opcional)
 *                 properties:
 *                   fullName:
 *                     type: string
 *                     description: Nombre completo
 *                     example: "María González"
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: Email de contacto
 *                     example: "maria@salonbella.com"
 *                   phone:
 *                     type: string
 *                     description: Teléfono
 *                     example: "+57 300 123 4567"
 *           example:
 *             paymentMethod: "WOMPI"
 *             paymentData:
 *               transactionId: "txn_wompi_123456"
 *               amount: 49.99
 *               currency: "COP"
 *             customerData:
 *               fullName: "María González"
 *               email: "maria@salonbella.com"
 *               phone: "+57 300 123 4567"
 *     responses:
 *       200:
 *         description: Pago procesado exitosamente
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
 *                   example: "Pago procesado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentId:
 *                       type: string
 *                       description: ID del pago generado
 *                       example: "payment_001"
 *                     subscriptionId:
 *                       type: string
 *                       description: ID de la suscripción creada
 *                       example: "sub_001"
 *                     businessId:
 *                       type: string
 *                       description: ID del negocio creado
 *                       example: "business_001"
 *                     activationDate:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha de activación
 *                       example: "2024-01-20T10:30:00Z"
 *                     redirectUrl:
 *                       type: string
 *                       format: uri
 *                       description: URL de redirección después del pago
 *                       example: "https://app.beautycontrol.com/welcome"
 *             example:
 *               success: true
 *               message: "Pago procesado exitosamente"
 *               data:
 *                 paymentId: "payment_001"
 *                 subscriptionId: "sub_001"
 *                 businessId: "business_001"
 *                 activationDate: "2024-01-20T10:30:00Z"
 *                 redirectUrl: "https://app.beautycontrol.com/welcome"
 *       400:
 *         description: Datos de pago inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Datos de pago inválidos"
 *       404:
 *         description: Token de invitación no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de invitación no encontrado"
 *       410:
 *         description: Invitación expirada o ya procesada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "La invitación ha expirado o ya fue procesada"
 *       422:
 *         description: Error en el procesamiento del pago
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error procesando el pago"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
router.post('/invitation/:token/payment', PublicInvitationController.processInvitationPayment);

/**
 * @swagger
 * /api/public/invitation/{token}/status:
 *   get:
 *     tags:
 *       - Public Invitations
 *     summary: Obtener estado de la invitación
 *     description: Consulta el estado actual de una invitación sin exponer información sensible. No requiere autenticación.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token único de la invitación
 *         example: "inv_abc123def456ghi789"
 *     responses:
 *       200:
 *         description: Estado de la invitación obtenido exitosamente
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
 *                     status:
 *                       type: string
 *                       enum: [PENDING, PROCESSING, COMPLETED, EXPIRED, CANCELLED]
 *                       description: Estado actual de la invitación
 *                       example: "PENDING"
 *                     businessName:
 *                       type: string
 *                       description: Nombre del negocio
 *                       example: "Salon de Belleza María"
 *                     planName:
 *                       type: string
 *                       description: Nombre del plan
 *                       example: "Plan Pro"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha de expiración
 *                       example: "2024-02-15T23:59:59Z"
 *                     timeRemaining:
 *                       type: object
 *                       description: Tiempo restante hasta la expiración
 *                       properties:
 *                         days:
 *                           type: integer
 *                           description: Días restantes
 *                           example: 15
 *                         hours:
 *                           type: integer
 *                           description: Horas restantes
 *                           example: 8
 *                         minutes:
 *                           type: integer
 *                           description: Minutos restantes
 *                           example: 45
 *                     isExpired:
 *                       type: boolean
 *                       description: Si la invitación está expirada
 *                       example: false
 *             example:
 *               success: true
 *               data:
 *                 status: "PENDING"
 *                 businessName: "Salon de Belleza María"
 *                 planName: "Plan Pro"
 *                 expiresAt: "2024-02-15T23:59:59Z"
 *                 timeRemaining:
 *                   days: 15
 *                   hours: 8
 *                   minutes: 45
 *                 isExpired: false
 *       404:
 *         description: Token de invitación no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de invitación no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
router.get('/invitation/:token/status', PublicInvitationController.getInvitationStatus);

/**
 * @swagger
 * /api/public/invitation/{token}/success:
 *   get:
 *     tags:
 *       - Public Invitations
 *     summary: Página de éxito después del pago
 *     description: Endpoint para mostrar confirmación de pago exitoso y datos de acceso. No requiere autenticación.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token único de la invitación
 *         example: "inv_abc123def456ghi789"
 *     responses:
 *       200:
 *         description: Pago confirmado - datos de acceso proporcionados
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
 *                   example: "¡Pago exitoso! Tu negocio ha sido activado"
 *                 data:
 *                   type: object
 *                   properties:
 *                     business:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: ID del negocio
 *                           example: "business_001"
 *                         name:
 *                           type: string
 *                           description: Nombre del negocio
 *                           example: "Salon de Belleza María"
 *                         subdomain:
 *                           type: string
 *                           description: Subdominio asignado
 *                           example: "salonmaria"
 *                         url:
 *                           type: string
 *                           format: uri
 *                           description: URL completa del negocio
 *                           example: "https://salonmaria.beautycontrol.com"
 *                     subscription:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: ID de la suscripción
 *                           example: "sub_001"
 *                         plan:
 *                           type: string
 *                           description: Nombre del plan
 *                           example: "Plan Pro"
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                           description: Fecha de inicio
 *                           example: "2024-01-20T10:30:00Z"
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                           description: Fecha de fin
 *                           example: "2024-02-20T10:30:00Z"
 *                         status:
 *                           type: string
 *                           description: Estado de la suscripción
 *                           example: "ACTIVE"
 *                     accessCredentials:
 *                       type: object
 *                       properties:
 *                         loginUrl:
 *                           type: string
 *                           format: uri
 *                           description: URL de inicio de sesión
 *                           example: "https://app.beautycontrol.com/login"
 *                         temporaryPassword:
 *                           type: string
 *                           description: Contraseña temporal (se debe cambiar)
 *                           example: "TempPass123!"
 *                         mustChangePassword:
 *                           type: boolean
 *                           description: Si debe cambiar la contraseña
 *                           example: true
 *                     nextSteps:
 *                       type: array
 *                       description: Pasos siguientes recomendados
 *                       items:
 *                         type: string
 *                       example: [
 *                         "Inicia sesión con tus credenciales",
 *                         "Cambia tu contraseña temporal",
 *                         "Configura tu perfil de negocio",
 *                         "Invita a tu equipo"
 *                       ]
 *             example:
 *               success: true
 *               message: "¡Pago exitoso! Tu negocio ha sido activado"
 *               data:
 *                 business:
 *                   id: "business_001"
 *                   name: "Salon de Belleza María"
 *                   subdomain: "salonmaria"
 *                   url: "https://salonmaria.beautycontrol.com"
 *                 subscription:
 *                   id: "sub_001"
 *                   plan: "Plan Pro"
 *                   startDate: "2024-01-20T10:30:00Z"
 *                   endDate: "2024-02-20T10:30:00Z"
 *                   status: "ACTIVE"
 *                 accessCredentials:
 *                   loginUrl: "https://app.beautycontrol.com/login"
 *                   temporaryPassword: "TempPass123!"
 *                   mustChangePassword: true
 *                 nextSteps: [
 *                   "Inicia sesión con tus credenciales",
 *                   "Cambia tu contraseña temporal",
 *                   "Configura tu perfil de negocio",
 *                   "Invita a tu equipo"
 *                 ]
 *       404:
 *         description: Token no encontrado o pago no completado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invitación no encontrada o pago no completado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
router.get('/invitation/:token/success', PublicInvitationController.paymentSuccess);

/**
 * @swagger
 * /api/public/webhooks/payment:
 *   post:
 *     tags:
 *       - Public Invitations
 *     summary: Webhook de confirmación de pago desde Wompi
 *     description: Webhook público para recibir confirmaciones automáticas de pago desde el proveedor Wompi. No requiere autenticación pero verifica la firma.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 description: Tipo de evento
 *                 example: "transaction.updated"
 *               data:
 *                 type: object
 *                 properties:
 *                   transaction:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID de la transacción
 *                         example: "txn_wompi_123456"
 *                       reference:
 *                         type: string
 *                         description: Referencia personalizada
 *                         example: "inv_abc123def456ghi789"
 *                       status:
 *                         type: string
 *                         enum: [APPROVED, DECLINED, ERROR, VOIDED]
 *                         description: Estado de la transacción
 *                         example: "APPROVED"
 *                       amount_in_cents:
 *                         type: integer
 *                         description: Monto en centavos
 *                         example: 4999000
 *                       currency:
 *                         type: string
 *                         description: Moneda
 *                         example: "COP"
 *                       payment_method:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: "CREDIT_CARD"
 *                           extra:
 *                             type: object
 *                             properties:
 *                               last_four:
 *                                 type: string
 *                                 example: "1234"
 *                               brand:
 *                                 type: string
 *                                 example: "VISA"
 *           example:
 *             event: "transaction.updated"
 *             data:
 *               transaction:
 *                 id: "txn_wompi_123456"
 *                 reference: "inv_abc123def456ghi789"
 *                 status: "APPROVED"
 *                 amount_in_cents: 4999000
 *                 currency: "COP"
 *                 payment_method:
 *                   type: "CREDIT_CARD"
 *                   extra:
 *                     last_four: "1234"
 *                     brand: "VISA"
 *     parameters:
 *       - in: header
 *         name: x-wompi-signature
 *         schema:
 *           type: string
 *         description: Firma digital de Wompi para verificar autenticidad
 *         example: "sha256=abc123def456..."
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
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
 *                   example: "Webhook procesado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     processed:
 *                       type: boolean
 *                       description: Si el webhook fue procesado
 *                       example: true
 *                     invitationId:
 *                       type: string
 *                       description: ID de la invitación afectada
 *                       example: "invitation_001"
 *                     newStatus:
 *                       type: string
 *                       description: Nuevo estado de la invitación
 *                       example: "COMPLETED"
 *             example:
 *               success: true
 *               message: "Webhook procesado exitosamente"
 *               data:
 *                 processed: true
 *                 invitationId: "invitation_001"
 *                 newStatus: "COMPLETED"
 *       400:
 *         description: Signature inválida o datos malformados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Signature inválida"
 *       404:
 *         description: Invitación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invitación no encontrada"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
router.post('/webhooks/payment', PublicInvitationController.paymentWebhook);

module.exports = router;