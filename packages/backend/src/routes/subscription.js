const express = require('express')
const SubscriptionController = require('../controllers/SubscriptionController')

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

module.exports = router