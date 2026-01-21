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
    onDelete: 'CASCADE'
  },
  encryptedToken: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tokenType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'USER_ACCESS_TOKEN'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  lastRotatedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'whatsapp_tokens',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['businessId']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['expiresAt']
    }
  ]
});

module.exports = WhatsAppToken;
