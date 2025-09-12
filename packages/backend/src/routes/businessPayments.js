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

/**
 * @route GET /api/business/subscription
 * @desc Obtener información de la suscripción actual del negocio
 * @access Private (Business users)
 */
router.get('/subscription', BusinessPaymentController.getMySubscription);

/**
 * @route POST /api/business/subscription/payment
 * @desc Subir comprobante de pago de suscripción
 * @access Private (Business users)
 * @body { amount, paymentDate, paymentMethod?, notes? }
 * @file receipt (imagen o PDF del comprobante)
 */
router.post('/subscription/payment', 
  uploadImageMiddleware.single('receipt'), 
  BusinessPaymentController.uploadPaymentReceipt
);

/**
 * @route GET /api/business/subscription/payments
 * @desc Obtener historial de pagos del negocio
 * @access Private (Business users)
 * @query { page?, limit?, status? }
 */
router.get('/subscription/payments', BusinessPaymentController.getMyPaymentHistory);

/**
 * @route GET /api/business/subscription/payments/:paymentId
 * @desc Obtener detalles de un pago específico
 * @access Private (Business users)
 */
router.get('/subscription/payments/:paymentId', BusinessPaymentController.getPaymentDetails);

/**
 * @route GET /api/business/access-status
 * @desc Verificar estado de acceso actual del negocio
 * @access Private (Business users)
 */
router.get('/access-status', BusinessPaymentController.getAccessStatus);

module.exports = router;