/**
 * Rutas públicas para procesamiento de invitaciones
 * No requieren autenticación
 */

const express = require('express');
const router = express.Router();
const PublicInvitationController = require('../controllers/PublicInvitationController');

/**
 * @route GET /api/public/invitation/:token
 * @desc Validar token de invitación y obtener datos
 * @access Public
 */
router.get('/invitation/:token', PublicInvitationController.validateInvitation);

/**
 * @route POST /api/public/invitation/:token/payment
 * @desc Procesar pago de invitación
 * @access Public
 */
router.post('/invitation/:token/payment', PublicInvitationController.processInvitationPayment);

/**
 * @route GET /api/public/invitation/:token/status
 * @desc Obtener estado de la invitación
 * @access Public
 */
router.get('/invitation/:token/status', PublicInvitationController.getInvitationStatus);

/**
 * @route GET /api/public/invitation/:token/success
 * @desc Página de éxito después del pago
 * @access Public
 */
router.get('/invitation/:token/success', PublicInvitationController.paymentSuccess);

/**
 * @route POST /api/public/webhooks/payment
 * @desc Webhook de confirmación de pago desde Wompi
 * @access Public (Wompi only)
 */
router.post('/webhooks/payment', PublicInvitationController.paymentWebhook);

module.exports = router;