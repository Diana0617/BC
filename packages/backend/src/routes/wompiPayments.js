/**
 * Rutas para integración con Wompi
 * Maneja pagos de suscripciones a través de Wompi
 */

const express = require('express');
const router = express.Router();
const WompiPaymentController = require('../controllers/WompiPaymentController');
const { authenticateToken } = require('../middleware/auth');

// Rutas protegidas que requieren autenticación
router.post('/initiate-subscription-payment', 
  authenticateToken, 
  WompiPaymentController.initiateSubscriptionPayment
);

router.get('/payment-status/:reference', 
  authenticateToken, 
  WompiPaymentController.checkPaymentStatus
);

router.get('/config', 
  authenticateToken, 
  WompiPaymentController.getWompiConfig
);

// Webhook público (sin autenticación porque viene de Wompi)
router.post('/webhook', WompiPaymentController.handleWebhook);

module.exports = router;