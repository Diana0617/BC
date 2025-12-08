const express = require('express');
const router = express.Router();
const OwnerPaymentConfigurationController = require('../controllers/OwnerPaymentConfigurationController');
const { authenticateToken } = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');

// Middleware para todas las rutas - solo OWNER
router.use(authenticateToken);
router.use(ownerOnly);

/**
 * @swagger
 * /api/owner/payment-configurations:
 *   get:
 *     tags:
 *       - Owner Payment Configurations
 *     summary: Obtener todas las configuraciones de pago del Owner
 *     description: Lista todas las configuraciones de pago del propietario con filtros opcionales y paginación
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *           enum: [WOMPI, TAXXA, STRIPE, PAYPAL, MERCADOPAGO]
 *         description: Filtrar por proveedor de pago
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *       - in: query
 *         name: environment
 *         schema:
 *           type: string
 *           enum: [SANDBOX, PRODUCTION]
 *         description: Filtrar por ambiente
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
 *         description: Elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre de configuración
 *     responses:
 *       200:
 *         description: Lista de configuraciones obtenida exitosamente
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
 *                     configurations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PaymentConfiguration'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                         inactive:
 *                           type: integer
 *                         byProvider:
 *                           type: object
 *                           additionalProperties:
 *                             type: integer
 *             example:
 *               success: true
 *               data:
 *                 configurations:
 *                   - id: "conf_001"
 *                     name: "Configuración Wompi Producción"
 *                     provider: "WOMPI"
 *                     environment: "PRODUCTION"
 *                     isActive: true
 *                     isDefault: true
 *                     commissionRate: 2.5
 *                     createdAt: "2024-01-15T10:30:00Z"
 *                 pagination:
 *                   page: 1
 *                   limit: 20
 *                   total: 5
 *                   pages: 1
 *                 summary:
 *                   total: 5
 *                   active: 3
 *                   inactive: 2
 *                   byProvider:
 *                     WOMPI: 2
 *                     TAXXA: 1
 *                     STRIPE: 2
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', OwnerPaymentConfigurationController.getAllConfigurations);

/**
 * @swagger
 * /api/owner/payment-configurations/active:
 *   get:
 *     tags:
 *       - Owner Payment Configurations
 *     summary: Obtener configuraciones activas
 *     description: Lista solo las configuraciones de pago activas, útil para dropdowns y selección rápida
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *           enum: [WOMPI, TAXXA, STRIPE, PAYPAL, MERCADOPAGO]
 *         description: Filtrar por proveedor específico
 *       - in: query
 *         name: environment
 *         schema:
 *           type: string
 *           enum: [SANDBOX, PRODUCTION]
 *         description: Filtrar por ambiente
 *     responses:
 *       200:
 *         description: Configuraciones activas obtenidas exitosamente
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
 *                         description: ID de la configuración
 *                         example: "conf_001"
 *                       name:
 *                         type: string
 *                         description: Nombre de la configuración
 *                         example: "Configuración Wompi Producción"
 *                       provider:
 *                         type: string
 *                         enum: [WOMPI, TAXXA, STRIPE, PAYPAL, MERCADOPAGO]
 *                         description: Proveedor de pago
 *                         example: "WOMPI"
 *                       environment:
 *                         type: string
 *                         enum: [SANDBOX, PRODUCTION]
 *                         description: Ambiente de la configuración
 *                         example: "PRODUCTION"
 *                       isDefault:
 *                         type: boolean
 *                         description: Si es la configuración por defecto
 *                         example: true
 *                       supportedCurrencies:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: Monedas soportadas
 *                         example: ["COP", "USD"]
 *                       commissionRate:
 *                         type: number
 *                         description: Tasa de comisión en porcentaje
 *                         example: 2.5
 *                       fixedFee:
 *                         type: number
 *                         description: Tarifa fija
 *                         example: 0
 *             example:
 *               success: true
 *               data:
 *                 - id: "conf_001"
 *                   name: "Configuración Wompi Producción"
 *                   provider: "WOMPI"
 *                   environment: "PRODUCTION"
 *                   isDefault: true
 *                   supportedCurrencies: ["COP"]
 *                   commissionRate: 2.5
 *                   fixedFee: 0
 *                 - id: "conf_002"
 *                   name: "Configuración Stripe"
 *                   provider: "STRIPE"
 *                   environment: "PRODUCTION"
 *                   isDefault: false
 *                   supportedCurrencies: ["USD", "COP"]
 *                   commissionRate: 2.9
 *                   fixedFee: 0.30
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/active', OwnerPaymentConfigurationController.getActiveConfigurations);

/**
 * @swagger
 * /api/owner/payment-configurations/{id}:
 *   get:
 *     tags:
 *       - Owner Payment Configurations
 *     summary: Obtener configuración específica por ID
 *     description: Obtiene los detalles completos de una configuración de pago específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único de la configuración
 *         example: "conf_001"
 *     responses:
 *       200:
 *         description: Configuración obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PaymentConfiguration'
 *             example:
 *               success: true
 *               data:
 *                 id: "conf_001"
 *                 name: "Configuración Wompi Producción"
 *                 provider: "WOMPI"
 *                 environment: "PRODUCTION"
 *                 isActive: true
 *                 isDefault: true
 *                 supportedCurrencies: ["COP"]
 *                 commissionRate: 2.5
 *                 fixedFee: 0
 *                 maxAmount: 50000000
 *                 minAmount: 1000
 *                 webhookUrl: "https://api.beautycontrol.com/webhook/wompi"
 *                 createdAt: "2024-01-15T10:30:00Z"
 *                 updatedAt: "2024-01-20T14:15:00Z"
 *       404:
 *         description: Configuración no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Configuración de pago no encontrada"
 *               error: "PAYMENT_CONFIG_NOT_FOUND"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', OwnerPaymentConfigurationController.getConfigurationById);

/**
 * @swagger
 * /api/owner/payment-configurations:
 *   post:
 *     tags:
 *       - Owner Payment Configurations
 *     summary: Crear nueva configuración de pago
 *     description: Crea una nueva configuración de pago para el propietario con las credenciales y parámetros del proveedor
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provider
 *               - name
 *               - environment
 *               - credentials
 *               - supportedCurrencies
 *               - commissionRate
 *             properties:
 *               provider:
 *                 type: string
 *                 enum: [WOMPI, TAXXA, STRIPE, PAYPAL, MERCADOPAGO]
 *                 description: Proveedor de pago
 *                 example: "WOMPI"
 *               name:
 *                 type: string
 *                 maxLength: 255
 *                 description: Nombre descriptivo de la configuración
 *                 example: "Configuración Wompi Producción"
 *               environment:
 *                 type: string
 *                 enum: [SANDBOX, PRODUCTION]
 *                 description: Ambiente de la configuración
 *                 example: "PRODUCTION"
 *               configuration:
 *                 type: object
 *                 description: Configuración específica del proveedor
 *                 additionalProperties: true
 *                 example:
 *                   acceptPersonPayments: true
 *                   acceptMerchantsPayments: false
 *               credentials:
 *                 type: object
 *                 description: Credenciales del proveedor (se encriptan automáticamente)
 *                 additionalProperties: true
 *                 example:
 *                   publicKey: "pub_test_xxxxx"
 *                   privateKey: "prv_test_xxxxx"
 *               webhookUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL del webhook para notificaciones
 *                 example: "https://api.beautycontrol.com/webhook/wompi"
 *               webhookSecret:
 *                 type: string
 *                 description: Secret para validar webhooks
 *                 example: "whsec_xxxxx"
 *               supportedCurrencies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de monedas soportadas
 *                 example: ["COP", "USD"]
 *               commissionRate:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Tasa de comisión en porcentaje
 *                 example: 2.5
 *               fixedFee:
 *                 type: number
 *                 minimum: 0
 *                 description: Tarifa fija por transacción
 *                 example: 0
 *               maxAmount:
 *                 type: number
 *                 minimum: 0
 *                 description: Monto máximo permitido
 *                 example: 50000000
 *               minAmount:
 *                 type: number
 *                 minimum: 0
 *                 description: Monto mínimo permitido
 *                 example: 1000
 *               isActive:
 *                 type: boolean
 *                 description: Estado activo de la configuración
 *                 default: true
 *               isDefault:
 *                 type: boolean
 *                 description: Si es la configuración por defecto
 *                 default: false
 *           example:
 *             provider: "WOMPI"
 *             name: "Configuración Wompi Producción"
 *             environment: "PRODUCTION"
 *             credentials:
 *               publicKey: "pub_prod_xxxxx"
 *               privateKey: "prv_prod_xxxxx"
 *             supportedCurrencies: ["COP"]
 *             commissionRate: 2.5
 *             fixedFee: 0
 *             maxAmount: 50000000
 *             minAmount: 1000
 *             isActive: true
 *             isDefault: false
 *     responses:
 *       201:
 *         description: Configuración creada exitosamente
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
 *                   example: "Configuración de pago creada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/PaymentConfiguration'
 *             example:
 *               success: true
 *               message: "Configuración de pago creada exitosamente"
 *               data:
 *                 id: "conf_001"
 *                 name: "Configuración Wompi Producción"
 *                 provider: "WOMPI"
 *                 environment: "PRODUCTION"
 *                 isActive: true
 *                 isDefault: false
 *                 createdAt: "2024-01-15T10:30:00Z"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_provider:
 *                 summary: Proveedor inválido
 *                 value:
 *                   success: false
 *                   message: "Proveedor de pago no soportado"
 *                   error: "INVALID_PROVIDER"
 *               missing_credentials:
 *                 summary: Credenciales faltantes
 *                 value:
 *                   success: false
 *                   message: "Credenciales requeridas para el proveedor"
 *                   error: "MISSING_CREDENTIALS"
 *       409:
 *         description: Configuración duplicada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Ya existe una configuración con ese nombre"
 *               error: "CONFIGURATION_ALREADY_EXISTS"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', OwnerPaymentConfigurationController.createConfiguration);

/**
 * @swagger
 * /api/owner/payment-configurations/{id}:
 *   put:
 *     tags:
 *       - Owner Payment Configurations
 *     summary: Actualizar configuración de pago
 *     description: Actualiza una configuración de pago existente con nuevos valores
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único de la configuración a actualizar
 *         example: "conf_001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 255
 *                 description: Nombre descriptivo de la configuración
 *                 example: "Configuración Wompi Producción Actualizada"
 *               configuration:
 *                 type: object
 *                 description: Configuración específica del proveedor
 *                 additionalProperties: true
 *               credentials:
 *                 type: object
 *                 description: Credenciales del proveedor (se encriptan automáticamente)
 *                 additionalProperties: true
 *               webhookUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL del webhook para notificaciones
 *               webhookSecret:
 *                 type: string
 *                 description: Secret para validar webhooks
 *               supportedCurrencies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de monedas soportadas
 *               commissionRate:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Tasa de comisión en porcentaje
 *               fixedFee:
 *                 type: number
 *                 minimum: 0
 *                 description: Tarifa fija por transacción
 *               maxAmount:
 *                 type: number
 *                 minimum: 0
 *                 description: Monto máximo permitido
 *               minAmount:
 *                 type: number
 *                 minimum: 0
 *                 description: Monto mínimo permitido
 *               isActive:
 *                 type: boolean
 *                 description: Estado activo de la configuración
 *           example:
 *             name: "Configuración Wompi Producción V2"
 *             commissionRate: 2.3
 *             maxAmount: 100000000
 *             supportedCurrencies: ["COP", "USD"]
 *     responses:
 *       200:
 *         description: Configuración actualizada exitosamente
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
 *                   example: "Configuración actualizada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/PaymentConfiguration'
 *             example:
 *               success: true
 *               message: "Configuración actualizada exitosamente"
 *               data:
 *                 id: "conf_001"
 *                 name: "Configuración Wompi Producción V2"
 *                 provider: "WOMPI"
 *                 environment: "PRODUCTION"
 *                 commissionRate: 2.3
 *                 maxAmount: 100000000
 *                 updatedAt: "2024-01-20T14:15:00Z"
 *       404:
 *         description: Configuración no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Configuración de pago no encontrada"
 *               error: "PAYMENT_CONFIG_NOT_FOUND"
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', OwnerPaymentConfigurationController.updateConfiguration);

/**
 * @swagger
 * /api/owner/payment-configurations/{id}/toggle:
 *   patch:
 *     tags:
 *       - Owner Payment Configurations
 *     summary: Activar/Desactivar configuración de pago
 *     description: Cambia el estado activo/inactivo de una configuración de pago específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único de la configuración
 *         example: "conf_001"
 *     responses:
 *       200:
 *         description: Estado de la configuración cambiado exitosamente
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
 *                   example: "Configuración activada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "conf_001"
 *                     name:
 *                       type: string
 *                       example: "Configuración Wompi Producción"
 *                     isActive:
 *                       type: boolean
 *                       description: Nuevo estado de la configuración
 *                       example: true
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha de actualización
 *                       example: "2024-01-20T14:30:00Z"
 *             example:
 *               success: true
 *               message: "Configuración activada exitosamente"
 *               data:
 *                 id: "conf_001"
 *                 name: "Configuración Wompi Producción"
 *                 isActive: true
 *                 updatedAt: "2024-01-20T14:30:00Z"
 *       404:
 *         description: Configuración no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Configuración de pago no encontrada"
 *               error: "PAYMENT_CONFIG_NOT_FOUND"
 *       400:
 *         description: No se puede desactivar la configuración
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "No se puede desactivar la única configuración activa"
 *               error: "CANNOT_DEACTIVATE_LAST_CONFIG"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:id/toggle', OwnerPaymentConfigurationController.toggleStatus);

/**
 * @swagger
 * /api/owner/payment-configurations/{id}/set-default:
 *   patch:
 *     tags:
 *       - Owner Payment Configurations
 *     summary: Establecer como configuración por defecto
 *     description: Establece una configuración específica como la configuración por defecto, desactivando la anterior configuración por defecto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único de la configuración
 *         example: "conf_001"
 *     responses:
 *       200:
 *         description: Configuración establecida como por defecto exitosamente
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
 *                   example: "Configuración establecida como por defecto"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "conf_001"
 *                     name:
 *                       type: string
 *                       example: "Configuración Wompi Producción"
 *                     isDefault:
 *                       type: boolean
 *                       description: Confirmación de que es la configuración por defecto
 *                       example: true
 *                     isActive:
 *                       type: boolean
 *                       description: Estado activo (se activa automáticamente al ser por defecto)
 *                       example: true
 *                     previousDefaultId:
 *                       type: string
 *                       description: ID de la configuración que era por defecto anteriormente
 *                       example: "conf_002"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha de actualización
 *                       example: "2024-01-20T14:45:00Z"
 *             example:
 *               success: true
 *               message: "Configuración establecida como por defecto"
 *               data:
 *                 id: "conf_001"
 *                 name: "Configuración Wompi Producción"
 *                 isDefault: true
 *                 isActive: true
 *                 previousDefaultId: "conf_002"
 *                 updatedAt: "2024-01-20T14:45:00Z"
 *       404:
 *         description: Configuración no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Configuración de pago no encontrada"
 *               error: "PAYMENT_CONFIG_NOT_FOUND"
 *       400:
 *         description: Configuración ya es por defecto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Esta configuración ya es la por defecto"
 *               error: "ALREADY_DEFAULT_CONFIG"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:id/set-default', OwnerPaymentConfigurationController.setAsDefault);

/**
 * @swagger
 * /api/owner/payment-configurations/{id}/test:
 *   post:
 *     tags:
 *       - Owner Payment Configurations
 *     summary: Probar configuración de pago
 *     description: Realiza una prueba de conexión y validación de credenciales con el proveedor de pago
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único de la configuración a probar
 *         example: "conf_001"
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               testType:
 *                 type: string
 *                 enum: [credentials, webhook, full]
 *                 description: Tipo de prueba a realizar
 *                 default: "credentials"
 *               testAmount:
 *                 type: number
 *                 description: Monto de prueba (solo para prueba completa)
 *                 example: 1000
 *           example:
 *             testType: "credentials"
 *     responses:
 *       200:
 *         description: Prueba realizada exitosamente
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
 *                   example: "Configuración probada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     configurationId:
 *                       type: string
 *                       example: "conf_001"
 *                     testType:
 *                       type: string
 *                       example: "credentials"
 *                     testResults:
 *                       type: object
 *                       properties:
 *                         credentialsValid:
 *                           type: boolean
 *                           description: Si las credenciales son válidas
 *                           example: true
 *                         connectionSuccessful:
 *                           type: boolean
 *                           description: Si la conexión fue exitosa
 *                           example: true
 *                         responseTime:
 *                           type: number
 *                           description: Tiempo de respuesta en ms
 *                           example: 245
 *                         providerResponse:
 *                           type: string
 *                           description: Respuesta del proveedor
 *                           example: "Authentication successful"
 *                         webhookTest:
 *                           type: object
 *                           properties:
 *                             webhookReachable:
 *                               type: boolean
 *                               example: true
 *                             webhookValid:
 *                               type: boolean
 *                               example: true
 *                     testedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha y hora de la prueba
 *                       example: "2024-01-20T15:00:00Z"
 *             example:
 *               success: true
 *               message: "Configuración probada exitosamente"
 *               data:
 *                 configurationId: "conf_001"
 *                 testType: "credentials"
 *                 testResults:
 *                   credentialsValid: true
 *                   connectionSuccessful: true
 *                   responseTime: 245
 *                   providerResponse: "Authentication successful"
 *                 testedAt: "2024-01-20T15:00:00Z"
 *       404:
 *         description: Configuración no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Configuración de pago no encontrada"
 *               error: "PAYMENT_CONFIG_NOT_FOUND"
 *       400:
 *         description: Error en la prueba
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
 *                   example: "Error en la prueba de configuración"
 *                 data:
 *                   type: object
 *                   properties:
 *                     configurationId:
 *                       type: string
 *                       example: "conf_001"
 *                     testResults:
 *                       type: object
 *                       properties:
 *                         credentialsValid:
 *                           type: boolean
 *                           example: false
 *                         connectionSuccessful:
 *                           type: boolean
 *                           example: false
 *                         error:
 *                           type: string
 *                           example: "Invalid API key"
 *             example:
 *               success: false
 *               message: "Error en la prueba de configuración"
 *               data:
 *                 configurationId: "conf_001"
 *                 testResults:
 *                   credentialsValid: false
 *                   connectionSuccessful: false
 *                   error: "Invalid API key"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/:id/test', OwnerPaymentConfigurationController.testConfiguration);

/**
 * @swagger
 * /api/owner/payment-configurations/{id}:
 *   delete:
 *     tags:
 *       - Owner Payment Configurations
 *     summary: Eliminar configuración de pago
 *     description: Elimina permanentemente una configuración de pago. No se puede eliminar si tiene transacciones asociadas o es la única configuración activa
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único de la configuración a eliminar
 *         example: "conf_001"
 *     responses:
 *       200:
 *         description: Configuración eliminada exitosamente
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
 *                   example: "Configuración eliminada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedId:
 *                       type: string
 *                       description: ID de la configuración eliminada
 *                       example: "conf_001"
 *                     deletedName:
 *                       type: string
 *                       description: Nombre de la configuración eliminada
 *                       example: "Configuración Wompi Test"
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha de eliminación
 *                       example: "2024-01-20T15:30:00Z"
 *                     newDefaultId:
 *                       type: string
 *                       description: ID de la nueva configuración por defecto (si se eliminó la anterior por defecto)
 *                       example: "conf_002"
 *             example:
 *               success: true
 *               message: "Configuración eliminada exitosamente"
 *               data:
 *                 deletedId: "conf_001"
 *                 deletedName: "Configuración Wompi Test"
 *                 deletedAt: "2024-01-20T15:30:00Z"
 *       404:
 *         description: Configuración no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Configuración de pago no encontrada"
 *               error: "PAYMENT_CONFIG_NOT_FOUND"
 *       400:
 *         description: No se puede eliminar la configuración
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               has_transactions:
 *                 summary: Tiene transacciones asociadas
 *                 value:
 *                   success: false
 *                   message: "No se puede eliminar una configuración con transacciones asociadas"
 *                   error: "CONFIGURATION_HAS_TRANSACTIONS"
 *               last_active:
 *                 summary: Última configuración activa
 *                 value:
 *                   success: false
 *                   message: "No se puede eliminar la única configuración activa"
 *                   error: "CANNOT_DELETE_LAST_ACTIVE_CONFIG"
 *               is_default:
 *                 summary: Es configuración por defecto
 *                 value:
 *                   success: false
 *                   message: "Establece otra configuración como por defecto antes de eliminar"
 *                   error: "CANNOT_DELETE_DEFAULT_CONFIG"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', OwnerPaymentConfigurationController.deleteConfiguration);

module.exports = router;