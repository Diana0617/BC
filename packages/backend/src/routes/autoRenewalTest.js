/**
 * Rutas para Testing de Auto-renovación
 * Solo para desarrollo y testing
 */

const express = require('express');
const router = express.Router();
const AutoRenewalTestController = require('../controllers/AutoRenewalTestController');

// Middleware de desarrollo (solo permitir en desarrollo)
const devOnly = (req, res, next) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      success: false,
      message: 'Estas rutas solo están disponibles en desarrollo'
    });
  }
  next();
};

// Aplicar middleware de desarrollo a todas las rutas
router.use(devOnly);

/**
 * @route POST /api/test/auto-renewal/run
 * @desc Ejecutar auto-renovación manualmente
 */
router.post('/run', AutoRenewalTestController.runManualAutoRenewal);

/**
 * @route POST /api/test/auto-renewal/retries
 * @desc Ejecutar reintentos de pagos manualmente
 */
router.post('/retries', AutoRenewalTestController.runManualPaymentRetries);

/**
 * @route POST /api/test/auto-renewal/notifications
 * @desc Ejecutar notificaciones manualmente
 */
router.post('/notifications', AutoRenewalTestController.runManualNotifications);

/**
 * @route GET /api/test/auto-renewal/expiring
 * @desc Obtener suscripciones próximas a vencer
 */
router.get('/expiring', AutoRenewalTestController.getExpiringSubscriptions);

/**
 * @route GET /api/test/auto-renewal/stats
 * @desc Obtener estadísticas de auto-renovación
 */
router.get('/stats', AutoRenewalTestController.getAutoRenewalStats);

/**
 * @route POST /api/test/auto-renewal/payment-method
 * @desc Crear método de pago de prueba
 */
router.post('/payment-method', AutoRenewalTestController.createTestPaymentMethod);

/**
 * @route POST /api/test/auto-renewal/create-subscription
 * @desc Crear suscripción de prueba para testing
 */
router.post('/create-subscription', AutoRenewalTestController.createTestSubscription);

/**
 * @route POST /api/test/auto-renewal/force-expire-soon
 * @desc Forzar una suscripción a vencer pronto (para testing)
 */
router.post('/force-expire-soon', AutoRenewalTestController.forceSubscriptionToExpireSoon);

/**
 * @route PUT /api/test/auto-renewal/force-expire/:subscriptionId
 * @desc Forzar una suscripción específica a vencer pronto (para testing)
 */
router.put('/force-expire/:subscriptionId', AutoRenewalTestController.forceSubscriptionToExpireSoon);

module.exports = router;