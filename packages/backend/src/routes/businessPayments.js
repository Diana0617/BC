/**
 * Rutas para gestión de pagos desde el lado del negocio
 * 
 * Endpoints para que los negocios gestionen sus suscripciones:
 * - Consultar estado de suscripción
 * - Subir comprobantes de pago
 * - Ver historial de pagos
 * - Verificar nivel de acceso
 */

const express = require('express');
const router = express.Router();
const BusinessPaymentController = require('../controllers/BusinessPaymentController');
const { authenticateToken } = require('../middleware/auth');
const { uploadImageMiddleware } = require('../config/cloudinary');

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);
// Endpoint para cambio de plan de suscripción
router.post('/subscription/change-plan', BusinessPaymentController.changePlan);

/**
 * @swagger
 * /api/business/subscription:
 *   get:
 *     tags:
 *       - Business Payments
 *     summary: Obtener información de la suscripción actual
 *     description: Obtiene los detalles completos de la suscripción actual del negocio autenticado, incluyendo estado, plan y fechas importantes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información de suscripción obtenida exitosamente
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
 *                     subscription:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: ID de la suscripción
 *                           example: "sub_001"
 *                         status:
 *                           type: string
 *                           enum: [ACTIVE, SUSPENDED, EXPIRED, CANCELLED]
 *                           description: Estado actual de la suscripción
 *                           example: "ACTIVE"
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                           description: Fecha de inicio de la suscripción
 *                           example: "2024-01-15T00:00:00Z"
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                           description: Fecha de vencimiento de la suscripción
 *                           example: "2024-02-15T23:59:59Z"
 *                         nextBillingDate:
 *                           type: string
 *                           format: date-time
 *                           description: Fecha del próximo cobro
 *                           example: "2024-02-15T00:00:00Z"
 *                         autoRenewal:
 *                           type: boolean
 *                           description: Si la renovación automática está habilitada
 *                           example: true
 *                         amount:
 *                           type: number
 *                           description: Monto de la suscripción
 *                           example: 49.99
 *                         currency:
 *                           type: string
 *                           description: Moneda de la suscripción
 *                           example: "COP"
 *                         daysUntilExpiry:
 *                           type: integer
 *                           description: Días restantes hasta el vencimiento
 *                           example: 15
 *                     plan:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: ID del plan
 *                           example: "plan_pro_001"
 *                         name:
 *                           type: string
 *                           description: Nombre del plan
 *                           example: "Plan Pro"
 *                         description:
 *                           type: string
 *                           description: Descripción del plan
 *                           example: "Plan para negocios en crecimiento"
 *                         features:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: Características incluidas
 *                           example: ["Usuarios ilimitados", "Reportes avanzados", "Soporte prioritario"]
 *                         modules:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               enabled:
 *                                 type: boolean
 *                           description: Módulos habilitados
 *                           example: [{"name": "Inventario", "enabled": true}, {"name": "CRM", "enabled": true}]
 *                     paymentStatus:
 *                       type: object
 *                       properties:
 *                         lastPaymentDate:
 *                           type: string
 *                           format: date-time
 *                           description: Fecha del último pago
 *                           example: "2024-01-15T10:30:00Z"
 *                         lastPaymentAmount:
 *                           type: number
 *                           description: Monto del último pago
 *                           example: 49.99
 *                         pendingPayments:
 *                           type: integer
 *                           description: Número de pagos pendientes
 *                           example: 0
 *                         overdueDays:
 *                           type: integer
 *                           description: Días de retraso en pagos
 *                           example: 0
 *             example:
 *               success: true
 *               data:
 *                 subscription:
 *                   id: "sub_001"
 *                   status: "ACTIVE"
 *                   startDate: "2024-01-15T00:00:00Z"
 *                   endDate: "2024-02-15T23:59:59Z"
 *                   nextBillingDate: "2024-02-15T00:00:00Z"
 *                   autoRenewal: true
 *                   amount: 49.99
 *                   currency: "COP"
 *                   daysUntilExpiry: 15
 *                 plan:
 *                   id: "plan_pro_001"
 *                   name: "Plan Pro"
 *                   description: "Plan para negocios en crecimiento"
 *                   features: ["Usuarios ilimitados", "Reportes avanzados"]
 *                 paymentStatus:
 *                   lastPaymentDate: "2024-01-15T10:30:00Z"
 *                   lastPaymentAmount: 49.99
 *                   pendingPayments: 0
 *                   overdueDays: 0
 *       404:
 *         description: Suscripción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "No se encontró una suscripción activa para este negocio"
 *               error: "SUBSCRIPTION_NOT_FOUND"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/subscription', BusinessPaymentController.getMySubscription);

/**
 * @swagger
 * /api/business/subscription/payment:
 *   post:
 *     tags:
 *       - Business Payments
 *     summary: Subir comprobante de pago de suscripción
 *     description: Permite al negocio subir un comprobante de pago para su suscripción, incluyendo el archivo del recibo y detalles del pago
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - paymentDate
 *               - receipt
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 description: Monto del pago realizado
 *                 example: 49.99
 *               paymentDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha en que se realizó el pago
 *                 example: "2024-01-20T10:30:00Z"
 *               paymentMethod:
 *                 type: string
 *                 enum: [BANK_TRANSFER, CASH, DIGITAL_WALLET, CHECK, CREDIT_CARD, DEBIT_CARD, OTHER]
 *                 description: Método de pago utilizado
 *                 example: "BANK_TRANSFER"
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 description: Notas adicionales sobre el pago
 *                 example: "Pago realizado desde cuenta empresarial"
 *               transactionReference:
 *                 type: string
 *                 maxLength: 255
 *                 description: Referencia de la transacción bancaria
 *                 example: "TXN123456789"
 *               receipt:
 *                 type: string
 *                 format: binary
 *                 description: Archivo del comprobante (imagen o PDF)
 *           example:
 *             amount: 49.99
 *             paymentDate: "2024-01-20T10:30:00Z"
 *             paymentMethod: "BANK_TRANSFER"
 *             notes: "Pago mensual suscripción"
 *             transactionReference: "TXN123456789"
 *     responses:
 *       201:
 *         description: Comprobante de pago subido exitosamente
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
 *                   example: "Comprobante de pago subido exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentId:
 *                       type: string
 *                       description: ID del pago creado
 *                       example: "pay_001"
 *                     status:
 *                       type: string
 *                       enum: [PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED]
 *                       description: Estado inicial del pago
 *                       example: "PENDING"
 *                     amount:
 *                       type: number
 *                       description: Monto del pago
 *                       example: 49.99
 *                     receiptUrl:
 *                       type: string
 *                       format: uri
 *                       description: URL del comprobante subido
 *                       example: "https://res.cloudinary.com/beauty-control/image/upload/receipts/receipt_001.jpg"
 *                     uploadedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha de subida del comprobante
 *                       example: "2024-01-20T14:30:00Z"
 *                     estimatedProcessingTime:
 *                       type: string
 *                       description: Tiempo estimado de procesamiento
 *                       example: "1-2 días hábiles"
 *             example:
 *               success: true
 *               message: "Comprobante de pago subido exitosamente"
 *               data:
 *                 paymentId: "pay_001"
 *                 status: "PENDING"
 *                 amount: 49.99
 *                 receiptUrl: "https://res.cloudinary.com/beauty-control/image/upload/receipts/receipt_001.jpg"
 *                 uploadedAt: "2024-01-20T14:30:00Z"
 *                 estimatedProcessingTime: "1-2 días hábiles"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_amount:
 *                 summary: Monto inválido
 *                 value:
 *                   success: false
 *                   message: "El monto debe ser mayor a 0"
 *                   error: "INVALID_AMOUNT"
 *               invalid_file:
 *                 summary: Archivo inválido
 *                 value:
 *                   success: false
 *                   message: "El archivo debe ser una imagen o PDF"
 *                   error: "INVALID_FILE_TYPE"
 *               file_too_large:
 *                 summary: Archivo muy grande
 *                 value:
 *                   success: false
 *                   message: "El archivo no puede exceder 10MB"
 *                   error: "FILE_TOO_LARGE"
 *       409:
 *         description: Pago duplicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Ya existe un pago pendiente con la misma referencia"
 *               error: "DUPLICATE_PAYMENT"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/subscription/payment', 
  uploadImageMiddleware.single('receipt'), 
  BusinessPaymentController.uploadPaymentReceipt
);

/**
 * @swagger
 * /api/business/subscription/payments:
 *   get:
 *     tags:
 *       - Business Payments
 *     summary: Obtener historial de pagos de suscripción
 *     description: Recupera el historial completo de pagos de suscripción del negocio con filtros y paginación
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página para paginación
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de resultados por página
 *         example: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED]
 *         description: Filtrar por estado del pago
 *         example: "COMPLETED"
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para el filtro (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para el filtro (YYYY-MM-DD)
 *         example: "2024-01-31"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [paymentDate, amount, status, createdAt]
 *           default: paymentDate
 *         description: Campo por el cual ordenar
 *         example: "paymentDate"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Orden de los resultados
 *         example: "DESC"
 *     responses:
 *       200:
 *         description: Historial de pagos obtenido exitosamente
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
 *                   example: "Historial de pagos obtenido exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     payments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: ID del pago
 *                             example: "pay_001"
 *                           amount:
 *                             type: number
 *                             description: Monto del pago
 *                             example: 49.99
 *                           paymentDate:
 *                             type: string
 *                             format: date-time
 *                             description: Fecha del pago
 *                             example: "2024-01-20T10:30:00Z"
 *                           status:
 *                             type: string
 *                             enum: [PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED]
 *                             description: Estado del pago
 *                             example: "COMPLETED"
 *                           paymentMethod:
 *                             type: string
 *                             description: Método de pago
 *                             example: "BANK_TRANSFER"
 *                           transactionReference:
 *                             type: string
 *                             description: Referencia de la transacción
 *                             example: "TXN123456789"
 *                           receiptUrl:
 *                             type: string
 *                             format: uri
 *                             description: URL del comprobante
 *                             example: "https://res.cloudinary.com/beauty-control/image/upload/receipts/receipt_001.jpg"
 *                           processedAt:
 *                             type: string
 *                             format: date-time
 *                             description: Fecha de procesamiento
 *                             example: "2024-01-21T09:15:00Z"
 *                           notes:
 *                             type: string
 *                             description: Notas del pago
 *                             example: "Pago mensual suscripción"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             description: Fecha de creación del registro
 *                             example: "2024-01-20T14:30:00Z"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           description: Página actual
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           description: Total de páginas
 *                           example: 5
 *                         totalRecords:
 *                           type: integer
 *                           description: Total de registros
 *                           example: 47
 *                         hasNextPage:
 *                           type: boolean
 *                           description: Indica si hay página siguiente
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           description: Indica si hay página anterior
 *                           example: false
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalAmount:
 *                           type: number
 *                           description: Monto total de todos los pagos
 *                           example: 1249.75
 *                         completedPayments:
 *                           type: integer
 *                           description: Número de pagos completados
 *                           example: 23
 *                         pendingPayments:
 *                           type: integer
 *                           description: Número de pagos pendientes
 *                           example: 2
 *                         lastPaymentDate:
 *                           type: string
 *                           format: date-time
 *                           description: Fecha del último pago
 *                           example: "2024-01-20T10:30:00Z"
 *             example:
 *               success: true
 *               message: "Historial de pagos obtenido exitosamente"
 *               data:
 *                 payments:
 *                   - id: "pay_001"
 *                     amount: 49.99
 *                     paymentDate: "2024-01-20T10:30:00Z"
 *                     status: "COMPLETED"
 *                     paymentMethod: "BANK_TRANSFER"
 *                     transactionReference: "TXN123456789"
 *                     receiptUrl: "https://res.cloudinary.com/beauty-control/image/upload/receipts/receipt_001.jpg"
 *                     processedAt: "2024-01-21T09:15:00Z"
 *                     notes: "Pago mensual suscripción"
 *                     createdAt: "2024-01-20T14:30:00Z"
 *                   - id: "pay_002"
 *                     amount: 49.99
 *                     paymentDate: "2023-12-20T11:00:00Z"
 *                     status: "COMPLETED"
 *                     paymentMethod: "CREDIT_CARD"
 *                     transactionReference: "TXN987654321"
 *                     receiptUrl: "https://res.cloudinary.com/beauty-control/image/upload/receipts/receipt_002.jpg"
 *                     processedAt: "2023-12-20T16:45:00Z"
 *                     notes: "Pago renovación"
 *                     createdAt: "2023-12-20T15:20:00Z"
 *                 pagination:
 *                   currentPage: 1
 *                   totalPages: 5
 *                   totalRecords: 47
 *                   hasNextPage: true
 *                   hasPrevPage: false
 *                 summary:
 *                   totalAmount: 1249.75
 *                   completedPayments: 23
 *                   pendingPayments: 2
 *                   lastPaymentDate: "2024-01-20T10:30:00Z"
 *       400:
 *         description: Parámetros de consulta inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_date_range:
 *                 summary: Rango de fechas inválido
 *                 value:
 *                   success: false
 *                   message: "La fecha de inicio no puede ser posterior a la fecha de fin"
 *                   error: "INVALID_DATE_RANGE"
 *               invalid_status:
 *                 summary: Estado inválido
 *                 value:
 *                   success: false
 *                   message: "Estado de pago no válido"
 *                   error: "INVALID_STATUS"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/subscription/payments', BusinessPaymentController.getMyPaymentHistory);

/**
 * @swagger
 * /api/business/subscription/payments/{paymentId}:
 *   get:
 *     tags:
 *       - Business Payments
 *     summary: Obtener detalles de un pago específico
 *     description: Recupera los detalles completos de un pago específico del negocio
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del pago
 *         example: "pay_001"
 *     responses:
 *       200:
 *         description: Detalles del pago obtenidos exitosamente
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
 *                   example: "Detalles del pago obtenidos exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     payment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: ID del pago
 *                           example: "pay_001"
 *                         amount:
 *                           type: number
 *                           description: Monto del pago
 *                           example: 49.99
 *                         currency:
 *                           type: string
 *                           description: Moneda del pago
 *                           example: "USD"
 *                         paymentDate:
 *                           type: string
 *                           format: date-time
 *                           description: Fecha del pago
 *                           example: "2024-01-20T10:30:00Z"
 *                         status:
 *                           type: string
 *                           enum: [PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED]
 *                           description: Estado del pago
 *                           example: "COMPLETED"
 *                         paymentMethod:
 *                           type: string
 *                           enum: [BANK_TRANSFER, CASH, DIGITAL_WALLET, CHECK, CREDIT_CARD, DEBIT_CARD, OTHER]
 *                           description: Método de pago
 *                           example: "BANK_TRANSFER"
 *                         transactionReference:
 *                           type: string
 *                           description: Referencia de la transacción
 *                           example: "TXN123456789"
 *                         receiptUrl:
 *                           type: string
 *                           format: uri
 *                           description: URL del comprobante
 *                           example: "https://res.cloudinary.com/beauty-control/image/upload/receipts/receipt_001.jpg"
 *                         processedAt:
 *                           type: string
 *                           format: date-time
 *                           description: Fecha de procesamiento
 *                           example: "2024-01-21T09:15:00Z"
 *                         processedBy:
 *                           type: string
 *                           description: Usuario que procesó el pago
 *                           example: "admin@beautycontrol.com"
 *                         notes:
 *                           type: string
 *                           description: Notas del pago
 *                           example: "Pago mensual suscripción"
 *                         adminNotes:
 *                           type: string
 *                           description: Notas administrativas (privadas)
 *                           example: "Verificado con banco"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           description: Fecha de creación del registro
 *                           example: "2024-01-20T14:30:00Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           description: Fecha de última actualización
 *                           example: "2024-01-21T09:15:00Z"
 *                     subscription:
 *                       type: object
 *                       description: Información de la suscripción relacionada
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: ID de la suscripción
 *                           example: "sub_001"
 *                         status:
 *                           type: string
 *                           description: Estado de la suscripción
 *                           example: "ACTIVE"
 *                         plan:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               description: Nombre del plan
 *                               example: "Pro"
 *                             price:
 *                               type: number
 *                               description: Precio del plan
 *                               example: 49.99
 *                         currentPeriodStart:
 *                           type: string
 *                           format: date-time
 *                           description: Inicio del período actual
 *                           example: "2024-01-15T00:00:00Z"
 *                         currentPeriodEnd:
 *                           type: string
 *                           format: date-time
 *                           description: Fin del período actual
 *                           example: "2024-02-15T00:00:00Z"
 *                     relatedPayments:
 *                       type: array
 *                       description: Pagos relacionados o del mismo período
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: ID del pago relacionado
 *                             example: "pay_002"
 *                           status:
 *                             type: string
 *                             description: Estado del pago
 *                             example: "PENDING"
 *                           amount:
 *                             type: number
 *                             description: Monto del pago
 *                             example: 25.00
 *                           type:
 *                             type: string
 *                             description: Tipo de relación
 *                             example: "PARTIAL_PAYMENT"
 *             example:
 *               success: true
 *               message: "Detalles del pago obtenidos exitosamente"
 *               data:
 *                 payment:
 *                   id: "pay_001"
 *                   amount: 49.99
 *                   currency: "USD"
 *                   paymentDate: "2024-01-20T10:30:00Z"
 *                   status: "COMPLETED"
 *                   paymentMethod: "BANK_TRANSFER"
 *                   transactionReference: "TXN123456789"
 *                   receiptUrl: "https://res.cloudinary.com/beauty-control/image/upload/receipts/receipt_001.jpg"
 *                   processedAt: "2024-01-21T09:15:00Z"
 *                   processedBy: "admin@beautycontrol.com"
 *                   notes: "Pago mensual suscripción"
 *                   adminNotes: "Verificado con banco"
 *                   createdAt: "2024-01-20T14:30:00Z"
 *                   updatedAt: "2024-01-21T09:15:00Z"
 *                 subscription:
 *                   id: "sub_001"
 *                   status: "ACTIVE"
 *                   plan:
 *                     name: "Pro"
 *                     price: 49.99
 *                   currentPeriodStart: "2024-01-15T00:00:00Z"
 *                   currentPeriodEnd: "2024-02-15T00:00:00Z"
 *                 relatedPayments: []
 *       404:
 *         description: Pago no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Pago no encontrado"
 *               error: "PAYMENT_NOT_FOUND"
 *       403:
 *         description: Acceso denegado al pago
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "No tienes permisos para acceder a este pago"
 *               error: "PAYMENT_ACCESS_DENIED"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/subscription/payments/:paymentId', BusinessPaymentController.getPaymentDetails);

/**
 * @swagger
 * /api/business/access-status:
 *   get:
 *     tags:
 *       - Business Payments
 *     summary: Verificar estado de acceso actual del negocio
 *     description: Verifica el estado actual de acceso del negocio a la plataforma basado en el estado de pagos y suscripción
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado de acceso obtenido exitosamente
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
 *                   example: "Estado de acceso obtenido exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessStatus:
 *                       type: string
 *                       enum: [ACTIVE, SUSPENDED, GRACE_PERIOD, EXPIRED, PENDING_PAYMENT]
 *                       description: Estado actual de acceso
 *                       example: "ACTIVE"
 *                     hasAccess:
 *                       type: boolean
 *                       description: Si el negocio tiene acceso completo
 *                       example: true
 *                     subscription:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: ID de la suscripción
 *                           example: "sub_001"
 *                         status:
 *                           type: string
 *                           enum: [ACTIVE, INACTIVE, SUSPENDED, CANCELLED, EXPIRED]
 *                           description: Estado de la suscripción
 *                           example: "ACTIVE"
 *                         plan:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               description: ID del plan
 *                               example: "plan_pro"
 *                             name:
 *                               type: string
 *                               description: Nombre del plan
 *                               example: "Pro"
 *                             features:
 *                               type: array
 *                               description: Características del plan
 *                               items:
 *                                 type: string
 *                               example: ["Citas ilimitadas", "Inventario avanzado", "Reportes"]
 *                         currentPeriodStart:
 *                           type: string
 *                           format: date-time
 *                           description: Inicio del período actual
 *                           example: "2024-01-15T00:00:00Z"
 *                         currentPeriodEnd:
 *                           type: string
 *                           format: date-time
 *                           description: Fin del período actual
 *                           example: "2024-02-15T00:00:00Z"
 *                         nextBillingDate:
 *                           type: string
 *                           format: date-time
 *                           description: Próxima fecha de facturación
 *                           example: "2024-02-15T00:00:00Z"
 *                         autoRenewal:
 *                           type: boolean
 *                           description: Si la renovación automática está habilitada
 *                           example: true
 *                     paymentStatus:
 *                       type: object
 *                       properties:
 *                         lastPayment:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               description: ID del último pago
 *                               example: "pay_001"
 *                             amount:
 *                               type: number
 *                               description: Monto del último pago
 *                               example: 49.99
 *                             date:
 *                               type: string
 *                               format: date-time
 *                               description: Fecha del último pago
 *                               example: "2024-01-20T10:30:00Z"
 *                             status:
 *                               type: string
 *                               description: Estado del último pago
 *                               example: "COMPLETED"
 *                         pendingPayments:
 *                           type: integer
 *                           description: Número de pagos pendientes
 *                           example: 0
 *                         overdueAmount:
 *                           type: number
 *                           description: Monto vencido
 *                           example: 0
 *                         daysOverdue:
 *                           type: integer
 *                           description: Días de vencimiento
 *                           example: 0
 *                     restrictions:
 *                       type: object
 *                       description: Restricciones de acceso actuales
 *                       properties:
 *                         hasRestrictions:
 *                           type: boolean
 *                           description: Si hay restricciones activas
 *                           example: false
 *                         restrictedFeatures:
 *                           type: array
 *                           description: Características restringidas
 *                           items:
 *                             type: string
 *                           example: []
 *                         gracePeriodEnds:
 *                           type: string
 *                           format: date-time
 *                           description: Fin del período de gracia (si aplica)
 *                           example: null
 *                         suspensionDate:
 *                           type: string
 *                           format: date-time
 *                           description: Fecha de suspensión (si aplica)
 *                           example: null
 *                     notifications:
 *                       type: array
 *                       description: Notificaciones importantes sobre el estado de acceso
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             enum: [INFO, WARNING, ERROR, SUCCESS]
 *                             description: Tipo de notificación
 *                             example: "INFO"
 *                           message:
 *                             type: string
 *                             description: Mensaje de la notificación
 *                             example: "Tu suscripción está activa"
 *                           priority:
 *                             type: string
 *                             enum: [LOW, MEDIUM, HIGH, URGENT]
 *                             description: Prioridad de la notificación
 *                             example: "LOW"
 *                           actionRequired:
 *                             type: boolean
 *                             description: Si requiere acción del usuario
 *                             example: false
 *                           actionUrl:
 *                             type: string
 *                             description: URL para realizar la acción
 *                             example: null
 *             example:
 *               success: true
 *               message: "Estado de acceso obtenido exitosamente"
 *               data:
 *                 accessStatus: "ACTIVE"
 *                 hasAccess: true
 *                 subscription:
 *                   id: "sub_001"
 *                   status: "ACTIVE"
 *                   plan:
 *                     id: "plan_pro"
 *                     name: "Pro"
 *                     features: ["Citas ilimitadas", "Inventario avanzado", "Reportes"]
 *                   currentPeriodStart: "2024-01-15T00:00:00Z"
 *                   currentPeriodEnd: "2024-02-15T00:00:00Z"
 *                   nextBillingDate: "2024-02-15T00:00:00Z"
 *                   autoRenewal: true
 *                 paymentStatus:
 *                   lastPayment:
 *                     id: "pay_001"
 *                     amount: 49.99
 *                     date: "2024-01-20T10:30:00Z"
 *                     status: "COMPLETED"
 *                   pendingPayments: 0
 *                   overdueAmount: 0
 *                   daysOverdue: 0
 *                 restrictions:
 *                   hasRestrictions: false
 *                   restrictedFeatures: []
 *                   gracePeriodEnds: null
 *                   suspensionDate: null
 *                 notifications:
 *                   - type: "INFO"
 *                     message: "Tu suscripción está activa"
 *                     priority: "LOW"
 *                     actionRequired: false
 *                     actionUrl: null
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/access-status', BusinessPaymentController.getAccessStatus);

module.exports = router;