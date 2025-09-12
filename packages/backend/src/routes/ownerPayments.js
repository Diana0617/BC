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
 * @route GET /api/owner/payments
 * @desc Obtener todos los pagos de suscripciones con filtros
 * @access Private (OWNER only)
 * @queryParams {string} status - Filtrar por estado del pago
 * @queryParams {string} paymentMethod - Filtrar por método de pago
 * @queryParams {string} startDate - Fecha inicio (YYYY-MM-DD)
 * @queryParams {string} endDate - Fecha fin (YYYY-MM-DD)
 * @queryParams {string} businessId - Filtrar por negocio específico
 * @queryParams {string} hasReceipt - true/false para filtrar con/sin comprobante
 * @queryParams {number} page - Página (default: 1)
 * @queryParams {number} limit - Elementos por página (default: 20)
 */
router.get('/', OwnerPaymentController.getAllPayments);

/**
 * @route GET /api/owner/payments/stats
 * @desc Obtener estadísticas de pagos por período
 * @access Private (OWNER only)
 * @queryParams {string} startDate - Fecha inicio para estadísticas
 * @queryParams {string} endDate - Fecha fin para estadísticas
 * @queryParams {string} groupBy - Agrupar por: day, week, month, year
 */
router.get('/stats', OwnerPaymentController.getPaymentStats);

/**
 * @route GET /api/owner/payments/:id
 * @desc Obtener un pago específico por ID
 * @access Private (OWNER only)
 * @params {string} id - ID del pago
 */
router.get('/:id', OwnerPaymentController.getPaymentById);

/**
 * @route POST /api/owner/payments
 * @desc Crear un nuevo pago manual
 * @access Private (OWNER only)
 * @bodyParams {string} businessSubscriptionId - ID de la suscripción
 * @bodyParams {number} amount - Monto del pago
 * @bodyParams {string} currency - Moneda (default: COP)
 * @bodyParams {string} paymentMethod - Método de pago
 * @bodyParams {string} description - Descripción del pago
 * @bodyParams {string} dueDate - Fecha de vencimiento
 * @bodyParams {string} transactionId - ID de transacción (opcional)
 * @bodyParams {string} externalReference - Referencia externa (opcional)
 */
router.post('/', OwnerPaymentController.createPayment);

/**
 * @route PUT /api/owner/payments/:id
 * @desc Actualizar estado de un pago
 * @access Private (OWNER only)
 * @params {string} id - ID del pago
 * @bodyParams {string} status - Nuevo estado del pago
 * @bodyParams {string} paidAt - Fecha de pago (opcional)
 * @bodyParams {string} failureReason - Razón del fallo (opcional)
 * @bodyParams {string} refundReason - Razón del reembolso (opcional)
 * @bodyParams {number} refundedAmount - Monto reembolsado (opcional)
 * @bodyParams {string} notes - Notas adicionales (opcional)
 */
router.put('/:id', OwnerPaymentController.updatePayment);

/**
 * @route POST /api/owner/payments/:id/receipt
 * @desc Subir comprobante de pago
 * @access Private (OWNER only)
 * @params {string} id - ID del pago
 * @fileParam {file} file - Archivo del comprobante (JPG, PNG, PDF, DOC, DOCX)
 */
router.post('/:id/receipt', uploadImageMiddleware.single('file'), OwnerPaymentController.uploadReceipt);

/**
 * @route DELETE /api/owner/payments/:id/receipt
 * @desc Eliminar comprobante de pago
 * @access Private (OWNER only)
 * @params {string} id - ID del pago
 */
router.delete('/:id/receipt', OwnerPaymentController.deleteReceipt);

module.exports = router;