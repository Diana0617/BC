const express = require('express');
const router = express.Router();
const whatsappWebhookController = require('../controllers/WhatsAppWebhookController');
const { authenticateToken } = require('../middleware/auth');

/**
 * WhatsApp Webhook Routes
 * 
 * Public routes for Meta webhook verification and events
 * Admin routes for monitoring and debugging
 */

// ==========================================
// PUBLIC ROUTES (No authentication)
// ==========================================

/**
 * @route GET /api/webhooks/whatsapp
 * @desc Verify webhook with Meta (called during webhook setup in Meta dashboard)
 * @access Public
 */
router.get('/', whatsappWebhookController.verifyWebhook.bind(whatsappWebhookController));

/**
 * @route POST /api/webhooks/whatsapp
 * @desc Receive webhook events from WhatsApp Business Platform
 * @access Public (validated via signature)
 */
router.post('/', whatsappWebhookController.handleWebhook.bind(whatsappWebhookController));

// ==========================================
// ADMIN ROUTES (Requires authentication)
// ==========================================

/**
 * @route GET /api/webhooks/whatsapp/events/:businessId
 * @desc Get webhook events for a business (monitoring/debugging)
 * @access Private (Admin/Business owner)
 */
router.get(
  '/events/:businessId',
  authenticateToken,
  whatsappWebhookController.getWebhookEvents.bind(whatsappWebhookController)
);

/**
 * @route POST /api/webhooks/whatsapp/replay/:eventId
 * @desc Replay a webhook event (debugging)
 * @access Private (Admin only)
 */
router.post(
  '/replay/:eventId',
  authenticateToken,
  whatsappWebhookController.replayWebhookEvent.bind(whatsappWebhookController)
);

module.exports = router;
