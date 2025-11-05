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
    },
    field: 'business_id'
  },
  eventType: {
    type: DataTypes.ENUM(
      'message_status',
      'message_received',
      'template_status',
      'account_update',
      'phone_number_quality_update'
    ),
    allowNull: false,
    field: 'event_type',
    comment: 'Type of webhook event'
  },
  payload: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Full webhook payload from Meta'
  },
  metaEventId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'meta_event_id',
    comment: 'Event ID from Meta headers'
  },
  metaMessageId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'meta_message_id',
    comment: 'Message ID if event is message-related'
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
  retryCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    field: 'retry_count',
    comment: 'Number of processing retry attempts'
  }
}, {
  tableName: 'whatsapp_webhook_events',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['business_id']
    },
    {
      fields: ['event_type']
    },
    {
      fields: ['processed']
    },
    {
      fields: ['meta_event_id']
    },
    {
      fields: ['meta_message_id']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = WhatsAppWebhookEvent;
