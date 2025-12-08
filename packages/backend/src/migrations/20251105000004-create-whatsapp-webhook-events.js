'use strict';

/**
 * Migration: Create whatsapp_webhook_events table
 * Purpose: Store all webhook events received from WhatsApp Business Platform
 * 
 * WhatsApp sends webhooks for message status updates, user responses, and other events.
 * This table provides a complete audit trail and enables event replay for debugging.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('whatsapp_webhook_events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      businessId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Business associated with this webhook (resolved from phone number ID)',
        field: 'business_id'
      },
      eventType: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Event type: message_status, message_received, etc.',
        field: 'event_type'
      },
      phoneNumberId: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Meta API Phone Number ID that triggered the event',
        field: 'phone_number_id'
      },
      messageId: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'WhatsApp message ID referenced in the event',
        field: 'message_id'
      },
      payload: {
        type: Sequelize.JSONB,
        allowNull: false,
        comment: 'Full webhook payload from WhatsApp'
      },
      processed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether this event has been processed'
      },
      processedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp when event was processed',
        field: 'processed_at'
      },
      processingError: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Error message if event processing failed',
        field: 'processing_error'
      },
      receivedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Timestamp when webhook was received',
        field: 'received_at'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at'
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updated_at'
      }
    });

    // Indexes for efficient queries
    await queryInterface.addIndex('whatsapp_webhook_events', ['business_id'], {
      name: 'idx_whatsapp_webhooks_business_id'
    });

    await queryInterface.addIndex('whatsapp_webhook_events', ['event_type'], {
      name: 'idx_whatsapp_webhooks_event_type'
    });

    await queryInterface.addIndex('whatsapp_webhook_events', ['message_id'], {
      name: 'idx_whatsapp_webhooks_message_id'
    });

    await queryInterface.addIndex('whatsapp_webhook_events', ['processed'], {
      name: 'idx_whatsapp_webhooks_processed'
    });

    await queryInterface.addIndex('whatsapp_webhook_events', ['received_at'], {
      name: 'idx_whatsapp_webhooks_received_at'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('whatsapp_webhook_events');
  }
};
