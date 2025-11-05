const express = require('express');
const router = express.Router();
const WhatsAppAdminController = require('../controllers/WhatsAppAdminController');
const { authenticateToken, checkRole } = require('../middleware/auth');

/**
 * WhatsApp Admin Routes
 * 
 * All routes require:
 * - Authentication (authenticateToken)
 * - BUSINESS role (checkRole(['BUSINESS']))
 * 
 * Routes are scoped to /api/admin/whatsapp
 */

// =====================================================================
// TOKEN MANAGEMENT
// =====================================================================

/**
 * @route   POST /api/admin/whatsapp/businesses/:businessId/tokens
 * @desc    Store WhatsApp token manually
 * @access  Private (BUSINESS)
 */
router.post(
  '/businesses/:businessId/tokens',
  authenticateToken,
  checkRole(['BUSINESS']),
  WhatsAppAdminController.storeToken
);

/**
 * @route   GET /api/admin/whatsapp/businesses/:businessId/tokens
 * @desc    Get WhatsApp token information (without exposing the actual token)
 * @access  Private (BUSINESS)
 */
router.get(
  '/businesses/:businessId/tokens',
  authenticateToken,
  checkRole(['BUSINESS']),
  WhatsAppAdminController.getTokenInfo
);

/**
 * @route   POST /api/admin/whatsapp/businesses/:businessId/tokens/rotate
 * @desc    Rotate WhatsApp token
 * @access  Private (BUSINESS)
 */
router.post(
  '/businesses/:businessId/tokens/rotate',
  authenticateToken,
  checkRole(['BUSINESS']),
  WhatsAppAdminController.rotateToken
);

/**
 * @route   DELETE /api/admin/whatsapp/businesses/:businessId/tokens
 * @desc    Delete WhatsApp token (disconnect)
 * @access  Private (BUSINESS)
 */
router.delete(
  '/businesses/:businessId/tokens',
  authenticateToken,
  checkRole(['BUSINESS']),
  WhatsAppAdminController.deleteToken
);

/**
 * @route   POST /api/admin/whatsapp/businesses/:businessId/test-connection
 * @desc    Test WhatsApp connection
 * @access  Private (BUSINESS)
 */
router.post(
  '/businesses/:businessId/test-connection',
  authenticateToken,
  checkRole(['BUSINESS']),
  WhatsAppAdminController.testConnection
);

// =====================================================================
// EMBEDDED SIGNUP
// =====================================================================

/**
 * @route   GET /api/admin/whatsapp/embedded-signup/config
 * @desc    Get Embedded Signup configuration
 * @access  Private (BUSINESS)
 */
router.get(
  '/embedded-signup/config',
  authenticateToken,
  checkRole(['BUSINESS']),
  WhatsAppAdminController.getEmbeddedSignupConfig
);

/**
 * @route   POST /api/admin/whatsapp/embedded-signup/callback
 * @desc    Handle Embedded Signup callback
 * @access  Private (BUSINESS)
 */
router.post(
  '/embedded-signup/callback',
  authenticateToken,
  checkRole(['BUSINESS']),
  WhatsAppAdminController.handleEmbeddedSignupCallback
);

// =====================================================================
// TEMPLATE MANAGEMENT
// =====================================================================

/**
 * @route   GET /api/admin/whatsapp/businesses/:businessId/templates
 * @desc    Get WhatsApp message templates
 * @access  Private (BUSINESS)
 */
router.get(
  '/businesses/:businessId/templates',
  authenticateToken,
  checkRole(['BUSINESS']),
  WhatsAppAdminController.getTemplates
);

/**
 * @route   POST /api/admin/whatsapp/businesses/:businessId/templates
 * @desc    Create new WhatsApp message template
 * @access  Private (BUSINESS)
 */
router.post(
  '/businesses/:businessId/templates',
  authenticateToken,
  checkRole(['BUSINESS']),
  WhatsAppAdminController.createTemplate
);

/**
 * @route   PUT /api/admin/whatsapp/businesses/:businessId/templates/:templateId
 * @desc    Update WhatsApp message template
 * @access  Private (BUSINESS)
 */
router.put(
  '/businesses/:businessId/templates/:templateId',
  authenticateToken,
  checkRole(['BUSINESS']),
  WhatsAppAdminController.updateTemplate
);

/**
 * @route   DELETE /api/admin/whatsapp/businesses/:businessId/templates/:templateId
 * @desc    Delete WhatsApp message template
 * @access  Private (BUSINESS)
 */
router.delete(
  '/businesses/:businessId/templates/:templateId',
  authenticateToken,
  checkRole(['BUSINESS']),
  WhatsAppAdminController.deleteTemplate
);

/**
 * @route   POST /api/admin/whatsapp/businesses/:businessId/templates/:templateId/submit
 * @desc    Submit template to Meta for approval
 * @access  Private (BUSINESS)
 */
router.post(
  '/businesses/:businessId/templates/:templateId/submit',
  authenticateToken,
  checkRole(['BUSINESS']),
  WhatsAppAdminController.submitTemplate
);

/**
 * @route   GET /api/admin/whatsapp/businesses/:businessId/templates/sync
 * @desc    Sync templates from Meta
 * @access  Private (BUSINESS)
 */
router.get(
  '/businesses/:businessId/templates/sync',
  authenticateToken,
  checkRole(['BUSINESS']),
  WhatsAppAdminController.syncTemplates
);

// =====================================================================
// MESSAGE HISTORY
// =====================================================================

/**
 * @route   GET /api/admin/whatsapp/businesses/:businessId/messages
 * @desc    Get message history
 * @access  Private (BUSINESS)
 */
router.get(
  '/businesses/:businessId/messages',
  authenticateToken,
  checkRole(['BUSINESS']),
  WhatsAppAdminController.getMessages
);

/**
 * @route   GET /api/admin/whatsapp/businesses/:businessId/messages/:messageId
 * @desc    Get message by ID
 * @access  Private (BUSINESS)
 */
router.get(
  '/businesses/:businessId/messages/:messageId',
  authenticateToken,
  checkRole(['BUSINESS']),
  WhatsAppAdminController.getMessageById
);

// =====================================================================
// WEBHOOK EVENTS
// =====================================================================

/**
 * @route   GET /api/admin/whatsapp/businesses/:businessId/webhook-events
 * @desc    Get webhook events
 * @access  Private (BUSINESS)
 */
router.get(
  '/businesses/:businessId/webhook-events',
  authenticateToken,
  checkRole(['BUSINESS']),
  WhatsAppAdminController.getWebhookEvents
);

/**
 * @route   GET /api/admin/whatsapp/businesses/:businessId/webhook-events/:eventId
 * @desc    Get webhook event by ID
 * @access  Private (BUSINESS)
 */
router.get(
  '/businesses/:businessId/webhook-events/:eventId',
  authenticateToken,
  checkRole(['BUSINESS']),
  WhatsAppAdminController.getWebhookEventById
);

/**
 * @route   POST /api/admin/whatsapp/businesses/:businessId/webhook-events/:eventId/replay
 * @desc    Replay webhook event
 * @access  Private (BUSINESS)
 */
router.post(
  '/businesses/:businessId/webhook-events/:eventId/replay',
  authenticateToken,
  checkRole(['BUSINESS']),
  WhatsAppAdminController.replayWebhookEvent
);

module.exports = router;
