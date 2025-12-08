const express = require('express')
const SubscriptionController = require('../controllers/SubscriptionController')
const Payment3DSController = require('../controllers/Payment3DSController')

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Gestión de suscripciones y creación de cuentas
 */

// Rutas públicas (sin autenticación)
router.post('/create', SubscriptionController.createSubscription)
router.post('/validate-invitation', SubscriptionController.validateInvitation)

// Rutas 3DS v2 públicas para registro
router.post('/3ds/create', Payment3DSController.createPublic3DSPayment)
router.get('/3ds/status/:transactionId', Payment3DSController.getPublic3DSTransactionStatus)

module.exports = router