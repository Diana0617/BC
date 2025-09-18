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
 * - GET /payments - Listar todos los pagos de suscripciones
 */

const express = require('express');
const router = express.Router();
const SubscriptionStatusController = require('../controllers/SubscriptionStatusController');
const { authenticateToken } = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');

// Middleware para todas las rutas - solo OWNER
router.use(authenticateToken);
router.use(ownerOnly);

// GET /summary - Resumen general de estados de suscripciones
router.get('/summary', SubscriptionStatusController.getStatusSummary);

// POST /check - Ejecutar verificación manual de suscripciones
router.post('/check', SubscriptionStatusController.runManualCheck);

// GET /attention - Obtener suscripciones que requieren atención
router.get('/attention', SubscriptionStatusController.getAttentionRequired);

// GET /business/:businessId - Verificar estado específico de suscripción
router.get('/business/:businessId', SubscriptionStatusController.checkSpecificSubscription);

// PUT /payments/:paymentId/confirm - Confirmar pago pendiente y extender suscripción
router.put('/payments/:paymentId/confirm', SubscriptionStatusController.confirmPayment);

// PUT /payments/:paymentId/reject - Rechazar pago pendiente
router.put('/payments/:paymentId/reject', SubscriptionStatusController.rejectPayment);

// GET /business/:businessId/history - Obtener historial de pagos de un negocio
router.get('/business/:businessId/history', SubscriptionStatusController.getPaymentHistory);

// GET /payments - Obtener todos los pagos de suscripciones con filtros y estadísticas
router.get('/payments', SubscriptionStatusController.getAllSubscriptionPayments);

module.exports = router;