'use strict';

/**
 * Migration: Create whatsapp_opt_ins table
 * Purpose: Track customer opt-in/opt-out preferences for WhatsApp communications
 * 
 * Required for compliance with WhatsApp Business Platform policies and data protection regulations.
 * Tracks customer consent to receive WhatsApp messages.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('whatsapp_opt_ins', {
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
        allowNull: false,
        references: {
          model: 'clients',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        field: 'client_id'
      },
      channel: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'whatsapp',
        comment: 'Communication channel (whatsapp, sms, email)'
      },
      optInValue: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'True = opted in, False = opted out',
        field: 'opt_in_value'
      },
      optInMethod: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'How the opt-in was obtained: web_form, in_app, verbal, etc.',
        field: 'opt_in_method'
      },
      optInSource: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Source of the opt-in (e.g., appointment_booking, profile_settings)',
        field: 'opt_in_source'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Additional notes about the opt-in/opt-out'
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
    await queryInterface.addIndex('whatsapp_opt_ins', ['business_id'], {
      name: 'idx_whatsapp_opt_ins_business_id'
    });

    await queryInterface.addIndex('whatsapp_opt_ins', ['client_id'], {
      name: 'idx_whatsapp_opt_ins_client_id'
    });

    await queryInterface.addIndex('whatsapp_opt_ins', ['business_id', 'client_id', 'channel'], {
      name: 'idx_whatsapp_opt_ins_unique',
      unique: true
    });

    await queryInterface.addIndex('whatsapp_opt_ins', ['opt_in_value'], {
      name: 'idx_whatsapp_opt_ins_value'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('whatsapp_opt_ins');
  }
};
