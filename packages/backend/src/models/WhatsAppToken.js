const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * WhatsAppToken Model
 * 
 * Stores encrypted WhatsApp Business Platform access tokens for each business.
 * Tokens are encrypted using EncryptionService before storage.
 */

const WhatsAppToken = sequelize.define('WhatsAppToken', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'businesses',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    field: 'business_id'
  },
  encryptedToken: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'encrypted_token'
  },
  tokenType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'USER_ACCESS_TOKEN',
    field: 'token_type'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expires_at'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  lastRotatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_rotated_at'
  }
}, {
  tableName: 'whatsapp_tokens',
  underscored: true,
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['business_id']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['expires_at']
    }
  ]
});

module.exports = WhatsAppToken;
