const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * WhatsAppWebhookEvent Model
 * 
 * Stores all webhook events received from Meta WhatsApp Business Platform
 */

const WhatsAppWebhookEvent = sequelize.define('WhatsAppWebhookEvent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    }
  },
  eventType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'event_type',
    comment: 'Type of webhook event'
  },
  phoneNumberId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'phone_number_id',
    comment: 'Phone number ID from webhook'
  },
  messageId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'message_id',
    comment: 'Message ID if event is message-related'
  },
  payload: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Full webhook payload from Meta'
  },
  processed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Whether event has been processed successfully'
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'processed_at',
    comment: 'When event was processed'
  },
  processingError: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'processing_error',
    comment: 'Error message if processing failed'
  },
  receivedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'received_at',
    comment: 'When webhook was received'
  }
}, {
  tableName: 'whatsapp_webhook_events',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId']
    },
    {
      fields: ['eventType']
    },
    {
      fields: ['processed']
    },
    {
      fields: ['messageId']
    },
    {
      fields: ['received_at']
    }
  ]
});

module.exports = WhatsAppWebhookEvent;
