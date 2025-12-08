/**
 * businessWompiPaymentWebhookRoutes.js
 * 
 * Rutas para recibir webhooks de Wompi sobre pagos de turnos online.
 * 
 * IMPORTANTE: Estas rutas están COMPLETAMENTE SEPARADAS del webhook de
 * suscripciones de Beauty Control (/api/wompi/webhook).
 * 
 * Endpoint: POST /api/webhooks/wompi/payments/:businessId
 */

const express = require('express')
const router = express.Router()
const BusinessWompiPaymentWebhookController = require('../webhooks/businessWompiPaymentWebhookController')

/**
 * POST /api/webhooks/wompi/payments/:businessId
 * Recibir notificaciones de Wompi sobre pagos de turnos
 * 
 * IMPORTANTE: Esta ruta NO requiere autenticación porque viene de Wompi
 * La autenticidad se valida mediante la firma del webhook
 */
router.post(
  '/payments/:businessId',
  BusinessWompiPaymentWebhookController.handlePaymentWebhook
)

module.exports = router
