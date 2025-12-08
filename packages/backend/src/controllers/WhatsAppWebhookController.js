const WhatsAppMessage = require('../models/WhatsAppMessage');
const { Business } = require('../models');
const whatsappService = require('../services/WhatsAppService');
const logger = require('../utils/logger');
const crypto = require('crypto');

/**
 * WhatsAppWebhookController
 * 
 * Handles incoming webhooks from WhatsApp Business Platform
 * 
 * Webhook events:
 * - message_status: Updates for sent messages (delivered, read, failed)
 * - messages: Incoming messages from users
 * - account_alerts: Account-level notifications
 */

class WhatsAppWebhookController {
  /**
   * Verify webhook (GET request from Meta during setup)
   * 
   * Meta sends a GET request with hub.mode, hub.verify_token, and hub.challenge
   * We must respond with hub.challenge if verify_token matches
   */
  async verifyWebhook(req, res) {
    try {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'beauty_control_whatsapp_verify';

      if (mode === 'subscribe' && token === verifyToken) {
        logger.info('Webhook verified successfully');
        res.status(200).send(challenge);
      } else {
        logger.warn('Webhook verification failed');
        res.sendStatus(403);
      }
    } catch (error) {
      logger.error('Error verifying webhook:', error);
      res.sendStatus(500);
    }
  }

  /**
   * Handle incoming webhook events (POST request)
   * 
   * Meta sends webhook events for message status updates, incoming messages, etc.
   */
  async handleWebhook(req, res) {
    try {
      // Immediately respond with 200 to acknowledge receipt
      res.sendStatus(200);

      const body = req.body;

      // Validate webhook signature (security)
      if (!this._validateSignature(req)) {
        logger.error('Invalid webhook signature');
        return;
      }

      logger.info('Webhook received:', JSON.stringify(body, null, 2));

      // Process webhook asynchronously
      this._processWebhookAsync(body).catch(error => {
        logger.error('Error processing webhook async:', error);
      });

    } catch (error) {
      logger.error('Error handling webhook:', error);
    }
  }

  /**
   * Validate webhook signature using app secret
   * @private
   */
  _validateSignature(req) {
    try {
      const signature = req.headers['x-hub-signature-256'];
      
      if (!signature) {
        logger.warn('No signature provided in webhook');
        return false;
      }

      const appSecret = process.env.WHATSAPP_APP_SECRET;
      
      if (!appSecret) {
        logger.error('WHATSAPP_APP_SECRET not configured');
        return false;
      }

      // Calculate expected signature
      const expectedSignature = crypto
        .createHmac('sha256', appSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      const signatureHash = signature.split('sha256=')[1];

      return crypto.timingSafeEqual(
        Buffer.from(signatureHash),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      logger.error('Error validating signature:', error);
      return false;
    }
  }

  /**
   * Process webhook events asynchronously
   * @private
   */
  async _processWebhookAsync(body) {
    try {
      if (!body.entry || !body.object) {
        logger.warn('Invalid webhook payload structure');
        return;
      }

      for (const entry of body.entry) {
        // Each entry can have multiple changes
        const changes = entry.changes || [];

        for (const change of changes) {
          const field = change.field;
          const value = change.value;

          if (field === 'messages') {
            await this._handleMessageEvent(value);
          } else if (field === 'message_status') {
            await this._handleStatusUpdate(value);
          } else {
            logger.info(`Unhandled webhook field: ${field}`);
          }
        }
      }
    } catch (error) {
      logger.error('Error processing webhook async:', error);
      throw error;
    }
  }

  /**
   * Handle incoming message events
   * @private
   */
  async _handleMessageEvent(value) {
    try {
      const messages = value.messages || [];
      const metadata = value.metadata || {};

      logger.info(`Processing ${messages.length} incoming messages`);

      for (const message of messages) {
        logger.info('Incoming message:', {
          from: message.from,
          type: message.type,
          timestamp: message.timestamp
        });

        // TODO: Implementar lógica de respuesta automática si es necesario
        // Por ahora solo logueamos el mensaje
      }
    } catch (error) {
      logger.error('Error handling message event:', error);
    }
  }

  /**
   * Handle message status updates (delivered, read, failed)
   * @private
   */
  async _handleStatusUpdate(value) {
    try {
      const statuses = value.statuses || [];

      logger.info(`Processing ${statuses.length} status updates`);

      for (const status of statuses) {
        const messageId = status.id;
        const statusValue = status.status; // sent, delivered, read, failed
        const timestamp = status.timestamp;

        logger.info(`Status update for message ${messageId}: ${statusValue}`);

        // Map WhatsApp status to our internal status
        const statusMap = {
          'sent': 'SENT',
          'delivered': 'DELIVERED',
          'read': 'READ',
          'failed': 'FAILED'
        };

        const mappedStatus = statusMap[statusValue] || statusValue.toUpperCase();

        // Update message status in database
        const metadata = {
          timestamp,
          recipientId: status.recipient_id,
          errorCode: status.errors?.[0]?.code,
          errorMessage: status.errors?.[0]?.title
        };

        await whatsappService.updateMessageStatus(messageId, mappedStatus, metadata);
      }
    } catch (error) {
      logger.error('Error handling status update:', error);
    }
  }

  /**
   * Get webhook events for a business (for debugging/monitoring)
   */
  async getWebhookEvents(req, res) {
    try {
      const { businessId } = req.params;
      const { limit = 50, offset = 0, processed } = req.query;

      // TODO: Implementar cuando tengamos el modelo WhatsAppWebhookEvent
      // Por ahora retornamos mock
      
      res.json({
        success: true,
        message: 'Webhook events endpoint (to be implemented)',
        data: []
      });
    } catch (error) {
      logger.error('Error getting webhook events:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Replay a webhook event (for debugging)
   */
  async replayWebhookEvent(req, res) {
    try {
      const { eventId } = req.params;

      // TODO: Implementar replay de eventos
      
      res.json({
        success: true,
        message: 'Webhook replay endpoint (to be implemented)'
      });
    } catch (error) {
      logger.error('Error replaying webhook event:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new WhatsAppWebhookController();
