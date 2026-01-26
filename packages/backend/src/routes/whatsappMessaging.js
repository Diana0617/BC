const express = require('express');
const router = express.Router();
const WhatsAppMessagingController = require('../controllers/WhatsAppMessagingController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { Business } = require('../models');

/**
 * WhatsApp Messaging Routes
 * 
 * Routes for sending messages to clients
 * All routes require:
 * - Authentication (authenticateToken)
 * - BUSINESS or SPECIALIST role
 * 
 * Routes are scoped to /api/business/:businessId/whatsapp
 */

// Middleware para validar que el usuario tiene acceso al negocio
const validateBusinessAccess = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    
    // Verify user owns this business or is a specialist in it
    if (req.user.role === 'BUSINESS') {
      if (req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permiso para acceder a este negocio'
        });
      }
    } else if (req.user.role === 'SPECIALIST') {
      // Verify specialist belongs to this business
      const business = await Business.findByPk(businessId);
      if (!business) {
        return res.status(404).json({ success: false, error: 'Negocio no encontrado' });
      }
      // TODO: Verify specialist relationship with business
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error validando acceso'
    });
  }
};

router.use(authenticateToken);
router.use(validateBusinessAccess);

// =====================================================================
// SEND MESSAGES
// =====================================================================

/**
 * @route   POST /api/business/:businessId/whatsapp/send-template-message
 * @desc    Send WhatsApp message using an approved template
 * @access  Private (BUSINESS, SPECIALIST, RECEPTIONIST)
 * 
 * Body:
 * {
 *   "recipientPhone": "+573001234567",  // Client phone number
 *   "templateName": "appointment_reminder_v1",  // Template name (must be APPROVED)
 *   "variables": {
 *     "clientName": "Juan",
 *     "appointmentDate": "2026-01-30",
 *     "appointmentTime": "14:00"
 *   },
 *   "clientId": "uuid",  // Optional: to link message to client
 *   "appointmentId": "uuid"  // Optional: to link message to appointment
 * }
 */
router.post(
  '/:businessId/send-template-message',
  WhatsAppMessagingController.sendTemplateMessage
);

/**
 * @route   POST /api/business/:businessId/whatsapp/send-text-message
 * @desc    Send simple text message (not a template)
 * @access  Private (BUSINESS only - not available for specialists)
 * 
 * Body:
 * {
 *   "recipientPhone": "+573001234567",
 *   "message": "Hola, esto es un mensaje de prueba",
 *   "clientId": "uuid"  // Optional
 * }
 */
router.post(
  '/:businessId/send-text-message',
  authorizeRole(['BUSINESS']),
  WhatsAppMessagingController.sendTextMessage
);

/**
 * @route   GET /api/business/:businessId/whatsapp/message-status/:messageId
 * @desc    Get status of a sent message
 * @access  Private (BUSINESS, SPECIALIST, RECEPTIONIST)
 */
router.get(
  '/:businessId/message-status/:messageId',
  WhatsAppMessagingController.getMessageStatus
);

/**
 * @route   POST /api/business/:businessId/whatsapp/send-appointment-reminder
 * @desc    Send appointment reminder to client
 * @access  Private (BUSINESS, SPECIALIST)
 * 
 * Body:
 * {
 *   "appointmentId": "uuid"
 * }
 */
router.post(
  '/:businessId/send-appointment-reminder',
  authorizeRole(['BUSINESS', 'SPECIALIST']),
  WhatsAppMessagingController.sendAppointmentReminder
);

/**
 * @route   POST /api/business/:businessId/whatsapp/send-appointment-confirmation
 * @desc    Send appointment confirmation to client
 * @access  Private (BUSINESS, SPECIALIST, RECEPTIONIST)
 * 
 * Body:
 * {
 *   "appointmentId": "uuid"
 * }
 */
router.post(
  '/:businessId/send-appointment-confirmation',
  authorizeRole(['BUSINESS', 'SPECIALIST', 'RECEPTIONIST']),
  WhatsAppMessagingController.sendAppointmentConfirmation
);

/**
 * @route   POST /api/business/:businessId/whatsapp/send-payment-receipt
 * @desc    Send payment receipt to client
 * @access  Private (BUSINESS, SPECIALIST)
 * 
 * Body:
 * {
 *   "receiptId": "uuid"
 * }
 */
router.post(
  '/:businessId/send-payment-receipt',
  authorizeRole(['BUSINESS', 'SPECIALIST']),
  WhatsAppMessagingController.sendPaymentReceipt
);

module.exports = router;
