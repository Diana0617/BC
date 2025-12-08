'use strict';

/**
 * Migration: Create whatsapp_tokens table
 * Purpose: Securely store encrypted WhatsApp Business Platform access tokens
 * 
 * Tokens are encrypted using AES-256-GCM before storage.
 * This table supports token rotation and expiry tracking.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('whatsapp_tokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      businessId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Business that owns this token',
        field: 'business_id'
      },
      encryptedToken: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'AES-256-GCM encrypted access token (stores iv:tag:ciphertext)',
        field: 'encrypted_token'
      },
      tokenType: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'USER_ACCESS_TOKEN',
        comment: 'Token type: USER_ACCESS_TOKEN, SYSTEM_USER_TOKEN',
        field: 'token_type'
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Token expiration date (null for non-expiring tokens)',
        field: 'expires_at'
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: 'Additional token metadata (permissions, scopes, WABA ID, etc.)'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this token is currently active',
        field: 'is_active'
      },
      lastRotatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Last time the token was rotated',
        field: 'last_rotated_at'
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

    // Indexes
    await queryInterface.addIndex('whatsapp_tokens', ['business_id'], {
      name: 'idx_whatsapp_tokens_business_id',
      unique: true
    });

    await queryInterface.addIndex('whatsapp_tokens', ['is_active'], {
      name: 'idx_whatsapp_tokens_active'
    });

    await queryInterface.addIndex('whatsapp_tokens', ['expires_at'], {
      name: 'idx_whatsapp_tokens_expires_at'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('whatsapp_tokens');
  }
};
