'use strict';

/**
 * Migration: Create whatsapp_messages table
 * Purpose: Track all WhatsApp messages sent and their delivery status
 * 
 * This table provides message tracking, delivery confirmation, and audit trail
 * for all WhatsApp communications sent through the platform.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('whatsapp_messages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      businessId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        field: 'business_id'
      },
      clientId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'clients',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Client who received the message (if applicable)',
        field: 'client_id'
      },
      appointmentId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'appointments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Related appointment (for reminder messages)',
        field: 'appointment_id'
      },
      to: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'Recipient phone number in E.164 format'
      },
      phoneNumberId: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Meta API Phone Number ID used to send the message',
        field: 'phone_number_id'
      },
      messageType: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Message type: text, template, image, document, etc.',
        field: 'message_type'
      },
      payload: {
        type: Sequelize.JSONB,
        allowNull: false,
        comment: 'Full message payload sent to WhatsApp API'
      },
      providerMessageId: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'WhatsApp message ID returned by Meta API',
        field: 'provider_message_id'
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'QUEUED',
        comment: 'Message status: QUEUED, SENT, DELIVERED, READ, FAILED'
      },
      errorCode: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Error code if message failed',
        field: 'error_code'
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Error message if message failed',
        field: 'error_message'
      },
      sentAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp when message was sent to WhatsApp API',
        field: 'sent_at'
      },
      deliveredAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp when message was delivered to recipient',
        field: 'delivered_at'
      },
      readAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp when message was read by recipient',
        field: 'read_at'
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
    await queryInterface.addIndex('whatsapp_messages', ['business_id'], {
      name: 'idx_whatsapp_messages_business_id'
    });

    await queryInterface.addIndex('whatsapp_messages', ['client_id'], {
      name: 'idx_whatsapp_messages_client_id'
    });

    await queryInterface.addIndex('whatsapp_messages', ['appointment_id'], {
      name: 'idx_whatsapp_messages_appointment_id'
    });

    await queryInterface.addIndex('whatsapp_messages', ['provider_message_id'], {
      name: 'idx_whatsapp_messages_provider_id'
    });

    await queryInterface.addIndex('whatsapp_messages', ['status'], {
      name: 'idx_whatsapp_messages_status'
    });

    await queryInterface.addIndex('whatsapp_messages', ['created_at'], {
      name: 'idx_whatsapp_messages_created_at'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('whatsapp_messages');
  }
};
