const express = require('express');
const router = express.Router();
const OwnerPaymentController = require('../controllers/OwnerPaymentController');
const { authenticateToken } = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');
const { uploadImageMiddleware } = require('../config/cloudinary');

// Middleware para todas las rutas - solo OWNER
router.use(authenticateToken);
router.use(ownerOnly);

/**
 * @swagger
 * /api/owner/payments:
 *   get:
 *     tags:
 *       - Owner Payments
 *     summary: Obtener todos los pagos de suscripciones
 *     description: Permite obtener una lista paginada de todos los pagos de suscripciones con múltiples filtros disponibles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED, REFUNDED, PARTIALLY_REFUNDED]
 *         description: Filtrar por estado del pago
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum: [CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, PSE, CASH, CHECK, DIGITAL_WALLET, MANUAL]
 *         description: Filtrar por método de pago
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         description: Fecha de inicio para filtrar pagos (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
 *         description: Fecha de fin para filtrar pagos (YYYY-MM-DD)
 *       - in: query
 *         name: businessId
 *         schema:
 *           type: string
 *         description: ID del negocio para filtrar pagos específicos
 *       - in: query
 *         name: hasReceipt
 *         schema:
 *           type: boolean
 *         description: Filtrar pagos que tienen comprobante (true) o no (false)
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
 *         description: Lista de pagos obtenida exitosamente
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
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SubscriptionPayment'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalAmount:
 *                           type: number
 *                           description: Monto total de todos los pagos
 *                         totalPayments:
 *                           type: integer
 *                           description: Cantidad total de pagos
 *                         byStatus:
 *                           type: object
 *                           description: Resumen por estado de pago
 *             example:
 *               success: true
 *               data:
 *                 payments:
 *                   - id: "123"
 *                     businessSubscriptionId: "456"
 *                     amount: 199900
 *                     currency: "COP"
 *                     status: "COMPLETED"
 *                     paymentMethod: "CREDIT_CARD"
 *                     paidAt: "2024-01-15T10:30:00Z"
 *                     business:
 *                       name: "Salón Bella Vista"
 *                       email: "admin@bellavista.com"
 *                 pagination:
 *                   currentPage: 1
 *                   totalPages: 5
 *                   totalItems: 95
 *                   itemsPerPage: 20
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', OwnerPaymentController.getAllPayments);

/**
 * @swagger
 * /api/owner/payments/stats:
 *   get:
 *     tags:
 *       - Owner Payments
 *     summary: Obtener estadísticas de pagos
 *     description: Genera estadísticas detalladas de pagos agrupadas por período temporal específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         description: Fecha de inicio para generar estadísticas
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
 *         description: Fecha de fin para generar estadísticas
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *         description: Período de agrupación para las estadísticas
 *     responses:
 *       200:
 *         description: Estadísticas de pagos generadas exitosamente
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
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalRevenue:
 *                           type: number
 *                           description: Ingresos totales del período
 *                         totalPayments:
 *                           type: integer
 *                           description: Cantidad total de pagos
 *                         averagePayment:
 *                           type: number
 *                           description: Pago promedio
 *                         completedPayments:
 *                           type: integer
 *                           description: Pagos completados exitosamente
 *                         failedPayments:
 *                           type: integer
 *                           description: Pagos fallidos
 *                         refundedAmount:
 *                           type: number
 *                           description: Monto total reembolsado
 *                     byPeriod:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           period:
 *                             type: string
 *                             description: Período (formato depende de groupBy)
 *                           revenue:
 *                             type: number
 *                             description: Ingresos del período
 *                           paymentCount:
 *                             type: integer
 *                             description: Cantidad de pagos
 *                     byStatus:
 *                       type: object
 *                       description: Distribución por estado de pago
 *                     byPaymentMethod:
 *                       type: object
 *                       description: Distribución por método de pago
 *             example:
 *               success: true
 *               data:
 *                 summary:
 *                   totalRevenue: 2499750
 *                   totalPayments: 125
 *                   averagePayment: 19998
 *                   completedPayments: 118
 *                   failedPayments: 7
 *                   refundedAmount: 0
 *                 byPeriod:
 *                   - period: "2024-01"
 *                     revenue: 199900
 *                     paymentCount: 10
 *                   - period: "2024-02"
 *                     revenue: 299850
 *                     paymentCount: 15
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/stats', OwnerPaymentController.getPaymentStats);

/**
 * @swagger
 * /api/owner/payments/{id}:
 *   get:
 *     tags:
 *       - Owner Payments
 *     summary: Obtener pago específico por ID
 *     description: Recupera información detallada de un pago específico incluyendo detalles de la suscripción y negocio asociado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del pago a consultar
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Pago encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/SubscriptionPayment'
 *                     - type: object
 *                       properties:
 *                         businessSubscription:
 *                           $ref: '#/components/schemas/BusinessSubscription'
 *                         business:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             email:
 *                               type: string
 *                             phone:
 *                               type: string
 *             example:
 *               success: true
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 businessSubscriptionId: "456e7890-e89b-12d3-a456-426614174001"
 *                 amount: 199900
 *                 currency: "COP"
 *                 status: "COMPLETED"
 *                 paymentMethod: "CREDIT_CARD"
 *                 transactionId: "TXN123456789"
 *                 paidAt: "2024-01-15T10:30:00Z"
 *                 dueDate: "2024-01-15T23:59:59Z"
 *                 description: "Pago mensual Plan Pro"
 *                 businessSubscription:
 *                   id: "456e7890-e89b-12d3-a456-426614174001"
 *                   status: "ACTIVE"
 *                   startDate: "2024-01-01T00:00:00Z"
 *                   endDate: "2024-12-31T23:59:59Z"
 *                 business:
 *                   id: "789e0123-e89b-12d3-a456-426614174002"
 *                   name: "Salón Bella Vista"
 *                   email: "admin@bellavista.com"
 *                   phone: "+57 300 123 4567"
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', OwnerPaymentController.getPaymentById);

/**
 * @swagger
 * /api/owner/payments:
 *   post:
 *     tags:
 *       - Owner Payments
 *     summary: Crear nuevo pago manual
 *     description: Permite al owner crear manualmente un registro de pago para una suscripción específica
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessSubscriptionId
 *               - amount
 *               - paymentMethod
 *               - dueDate
 *             properties:
 *               businessSubscriptionId:
 *                 type: string
 *                 description: ID de la suscripción de negocio
 *                 example: "456e7890-e89b-12d3-a456-426614174001"
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 description: Monto del pago en centavos
 *                 example: 199900
 *               currency:
 *                 type: string
 *                 default: "COP"
 *                 description: Moneda del pago
 *                 example: "COP"
 *               paymentMethod:
 *                 type: string
 *                 enum: [CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, PSE, CASH, CHECK, DIGITAL_WALLET, MANUAL]
 *                 description: Método de pago utilizado
 *                 example: "MANUAL"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Descripción del pago
 *                 example: "Pago manual registrado por el owner"
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de vencimiento del pago
 *                 example: "2024-02-15T23:59:59Z"
 *               transactionId:
 *                 type: string
 *                 maxLength: 255
 *                 description: ID de transacción del proveedor (opcional)
 *                 example: "TXN123456789"
 *               externalReference:
 *                 type: string
 *                 maxLength: 255
 *                 description: Referencia externa del pago (opcional)
 *                 example: "REF-MANUAL-001"
 *     responses:
 *       201:
 *         description: Pago creado exitosamente
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
 *                   example: "Pago creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/SubscriptionPayment'
 *             example:
 *               success: true
 *               message: "Pago creado exitosamente"
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 businessSubscriptionId: "456e7890-e89b-12d3-a456-426614174001"
 *                 amount: 199900
 *                 currency: "COP"
 *                 status: "PENDING"
 *                 paymentMethod: "MANUAL"
 *                 description: "Pago manual registrado por el owner"
 *                 dueDate: "2024-02-15T23:59:59Z"
 *                 transactionId: "TXN123456789"
 *                 externalReference: "REF-MANUAL-001"
 *                 createdAt: "2024-01-15T10:30:00Z"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Datos de entrada inválidos"
 *               errors:
 *                 - field: "businessSubscriptionId"
 *                   message: "ID de suscripción requerido"
 *                 - field: "amount"
 *                   message: "El monto debe ser mayor a 0"
 *       404:
 *         description: Suscripción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Suscripción no encontrada"
 *               error: "SUBSCRIPTION_NOT_FOUND"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', OwnerPaymentController.createPayment);

/**
 * @swagger
 * /api/owner/payments/{id}:
 *   put:
 *     tags:
 *       - Owner Payments
 *     summary: Actualizar estado de un pago
 *     description: Permite actualizar el estado y propiedades relacionadas de un pago existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del pago a actualizar
 *         example: "123e4567-e89b-12d3-a456-426614174000"
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
 *                 enum: [PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED, REFUNDED, PARTIALLY_REFUNDED]
 *                 description: Nuevo estado del pago
 *                 example: "COMPLETED"
 *               paidAt:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora del pago (requerida para estado COMPLETED)
 *                 example: "2024-01-15T14:30:00Z"
 *               failureReason:
 *                 type: string
 *                 maxLength: 500
 *                 description: Razón del fallo (requerida para estado FAILED)
 *                 example: "Fondos insuficientes en la cuenta"
 *               refundReason:
 *                 type: string
 *                 maxLength: 500
 *                 description: Razón del reembolso (requerida para estados REFUNDED/PARTIALLY_REFUNDED)
 *                 example: "Cancelación de servicio por parte del cliente"
 *               refundedAmount:
 *                 type: number
 *                 minimum: 0
 *                 description: Monto reembolsado en centavos
 *                 example: 99950
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Notas adicionales sobre la actualización
 *                 example: "Pago procesado manualmente después de verificación"
 *     responses:
 *       200:
 *         description: Pago actualizado exitosamente
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
 *                   example: "Pago actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/SubscriptionPayment'
 *             example:
 *               success: true
 *               message: "Pago actualizado exitosamente"
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 status: "COMPLETED"
 *                 paidAt: "2024-01-15T14:30:00Z"
 *                 notes: "Pago procesado manualmente después de verificación"
 *                 updatedAt: "2024-01-15T14:30:15Z"
 *       400:
 *         description: Datos de entrada inválidos o transición de estado inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Transición de estado inválida"
 *               error: "INVALID_STATUS_TRANSITION"
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', OwnerPaymentController.updatePayment);

/**
 * @swagger
 * /api/owner/payments/{id}/receipt:
 *   post:
 *     tags:
 *       - Owner Payments
 *     summary: Subir comprobante de pago
 *     description: Permite subir un archivo como comprobante de pago (imagen o documento)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del pago al que se asociará el comprobante
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo del comprobante de pago
 *           encoding:
 *             file:
 *               contentType: image/jpeg, image/png, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
 *     responses:
 *       200:
 *         description: Comprobante subido exitosamente
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
 *                   example: "Comprobante subido exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     receiptUrl:
 *                       type: string
 *                       description: URL del comprobante en Cloudinary
 *                       example: "https://res.cloudinary.com/beauty-control/image/upload/v1234567890/receipts/payment_123_receipt.jpg"
 *                     receiptPublicId:
 *                       type: string
 *                       description: Public ID del archivo en Cloudinary
 *                       example: "receipts/payment_123_receipt"
 *                     receiptMetadata:
 *                       type: object
 *                       properties:
 *                         size:
 *                           type: integer
 *                           description: Tamaño del archivo en bytes
 *                         format:
 *                           type: string
 *                           description: Formato del archivo
 *                         uploadedAt:
 *                           type: string
 *                           format: date-time
 *                           description: Fecha de subida
 *             example:
 *               success: true
 *               message: "Comprobante subido exitosamente"
 *               data:
 *                 receiptUrl: "https://res.cloudinary.com/beauty-control/image/upload/v1234567890/receipts/payment_123_receipt.jpg"
 *                 receiptPublicId: "receipts/payment_123_receipt"
 *                 receiptMetadata:
 *                   size: 145678
 *                   format: "jpg"
 *                   uploadedAt: "2024-01-15T14:30:00Z"
 *       400:
 *         description: Archivo inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Archivo requerido"
 *               error: "FILE_REQUIRED"
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
 *       413:
 *         description: Archivo demasiado grande
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "El archivo excede el tamaño máximo permitido"
 *               error: "FILE_TOO_LARGE"
 *       415:
 *         description: Formato de archivo no soportado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Formato de archivo no soportado. Use JPG, PNG, PDF, DOC o DOCX"
 *               error: "UNSUPPORTED_FILE_TYPE"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/:id/receipt', uploadImageMiddleware.single('file'), OwnerPaymentController.uploadReceipt);

/**
 * @swagger
 * /api/owner/payments/{id}/receipt:
 *   delete:
 *     tags:
 *       - Owner Payments
 *     summary: Eliminar comprobante de pago
 *     description: Elimina el comprobante de pago asociado a un pago específico, tanto del sistema como de Cloudinary
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del pago del cual se eliminará el comprobante
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Comprobante eliminado exitosamente
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
 *                   example: "Comprobante eliminado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentId:
 *                       type: string
 *                       description: ID del pago actualizado
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     deletedFile:
 *                       type: object
 *                       properties:
 *                         receiptUrl:
 *                           type: string
 *                           description: URL del comprobante eliminado
 *                         receiptPublicId:
 *                           type: string
 *                           description: Public ID del archivo eliminado
 *             example:
 *               success: true
 *               message: "Comprobante eliminado exitosamente"
 *               data:
 *                 paymentId: "123e4567-e89b-12d3-a456-426614174000"
 *                 deletedFile:
 *                   receiptUrl: "https://res.cloudinary.com/beauty-control/image/upload/v1234567890/receipts/payment_123_receipt.jpg"
 *                   receiptPublicId: "receipts/payment_123_receipt"
 *       404:
 *         description: Pago no encontrado o no tiene comprobante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               payment_not_found:
 *                 summary: Pago no encontrado
 *                 value:
 *                   success: false
 *                   message: "Pago no encontrado"
 *                   error: "PAYMENT_NOT_FOUND"
 *               no_receipt:
 *                 summary: Pago sin comprobante
 *                 value:
 *                   success: false
 *                   message: "El pago no tiene comprobante asociado"
 *                   error: "NO_RECEIPT_FOUND"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Error interno del servidor o error en Cloudinary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Error al eliminar el comprobante de Cloudinary"
 *               error: "CLOUDINARY_DELETE_ERROR"
 */
router.delete('/:id/receipt', OwnerPaymentController.deleteReceipt);

module.exports = router;