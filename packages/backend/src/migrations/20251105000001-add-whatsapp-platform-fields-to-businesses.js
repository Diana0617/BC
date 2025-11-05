'use strict';

/**
 * Migration: Add WhatsApp Business Platform fields to businesses table
 * Purpose: Support multi-tenant WhatsApp integration with per-business tokens
 * 
 * Changes:
 * - whatsapp_enabled: Boolean flag to enable WhatsApp for this business
 * - whatsapp_phone_number: WhatsApp phone number (for display)
 * - whatsapp_phone_number_id: Meta API phone number ID
 * - whatsapp_platform_metadata: JSONB for storing platform-specific data
 * 
 * Note: business.settings.communications.whatsapp is kept for backward compatibility
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('businesses', 'whatsapp_enabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'WhatsApp Business Platform integration enabled'
    });

    await queryInterface.addColumn('businesses', 'whatsapp_phone_number', {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'WhatsApp phone number in E.164 format (e.g., +573001234567)'
    });

    await queryInterface.addColumn('businesses', 'whatsapp_phone_number_id', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Meta API Phone Number ID'
    });

    await queryInterface.addColumn('businesses', 'whatsapp_platform_metadata', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'WhatsApp Business Platform metadata (WABA ID, business verification status, etc.)'
    });

    // Add index for quick lookups by phone number ID
    await queryInterface.addIndex('businesses', ['whatsapp_phone_number_id'], {
      name: 'idx_businesses_whatsapp_phone_number_id',
      unique: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('businesses', 'idx_businesses_whatsapp_phone_number_id');
    await queryInterface.removeColumn('businesses', 'whatsapp_platform_metadata');
    await queryInterface.removeColumn('businesses', 'whatsapp_phone_number_id');
    await queryInterface.removeColumn('businesses', 'whatsapp_phone_number');
    await queryInterface.removeColumn('businesses', 'whatsapp_enabled');
  }
};
