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

// Middleware para todas las rutas - solo OWNER
router.use(authenticateToken);
router.use(ownerOnly);

/**
 * @route GET /api/owner/subscription-status/summary
 * @desc Obtener resumen general de estados de suscripciones
 * @access Private (OWNER only)
 */
router.get('/summary', SubscriptionStatusController.getStatusSummary);

/**
 * @route POST /api/owner/subscription-status/check
 * @desc Ejecutar verificación manual de todas las suscripciones
 * @access Private (OWNER only)
 */
router.post('/check', SubscriptionStatusController.runManualCheck);

/**
 * @route GET /api/owner/subscription-status/attention
 * @desc Obtener suscripciones que requieren atención inmediata
 * @access Private (OWNER only)
 */
router.get('/attention', SubscriptionStatusController.getAttentionRequired);

/**
 * @route GET /api/owner/subscription-status/business/:businessId
 * @desc Verificar estado específico de una suscripción de negocio
 * @access Private (OWNER only)
 */
router.get('/business/:businessId', SubscriptionStatusController.checkSpecificSubscription);

/**
 * @route PUT /api/owner/subscription-status/payments/:paymentId/confirm
 * @desc Confirmar un pago pendiente y extender suscripción
 * @access Private (OWNER only)
 */
router.put('/payments/:paymentId/confirm', SubscriptionStatusController.confirmPayment);

/**
 * @route PUT /api/owner/subscription-status/payments/:paymentId/reject
 * @desc Rechazar un pago pendiente
 * @access Private (OWNER only)
 */
router.put('/payments/:paymentId/reject', SubscriptionStatusController.rejectPayment);

/**
 * @route GET /api/owner/subscription-status/business/:businessId/history
 * @desc Obtener historial de pagos de una suscripción
 * @access Private (OWNER only)
 */
router.get('/business/:businessId/history', SubscriptionStatusController.getStatusHistory);

module.exports = router;