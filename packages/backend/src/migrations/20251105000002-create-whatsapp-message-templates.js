'use strict';

/**
 * Migration: Create whatsapp_message_templates table
 * Purpose: Track WhatsApp message templates and their approval status
 * 
 * WhatsApp requires pre-approved message templates for business-initiated messages.
 * This table stores templates, their status, and metadata for tracking approvals.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('whatsapp_message_templates', {
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
      templateName: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Unique template name (e.g., appointment_reminder)',
        field: 'template_name'
      },
      language: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'es',
        comment: 'Language code (ISO 639-1)'
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'TRANSACTIONAL',
        comment: 'Template category: TRANSACTIONAL, MARKETING, AUTHENTICATION'
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Template body text with {{variable}} placeholders'
      },
      header: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Optional template header'
      },
      footer: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Optional template footer'
      },
      buttons: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Optional template buttons configuration'
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'PENDING',
        comment: 'Template status: PENDING, APPROVED, REJECTED, DISABLED'
      },
      metaTemplateId: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Meta API template ID after approval',
        field: 'meta_template_id'
      },
      rejectionReason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Reason for template rejection by Meta',
        field: 'rejection_reason'
      },
      approvedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'approved_at'
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
    await queryInterface.addIndex('whatsapp_message_templates', ['business_id'], {
      name: 'idx_whatsapp_templates_business_id'
    });

    await queryInterface.addIndex('whatsapp_message_templates', ['business_id', 'template_name'], {
      name: 'idx_whatsapp_templates_business_name',
      unique: true
    });

    await queryInterface.addIndex('whatsapp_message_templates', ['status'], {
      name: 'idx_whatsapp_templates_status'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('whatsapp_message_templates');
  }
};
