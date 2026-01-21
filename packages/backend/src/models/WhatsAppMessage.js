const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * WhatsAppMessage Model
 * 
 * Tracks all WhatsApp messages sent through the platform
 */

const WhatsAppMessage = sequelize.define('WhatsAppMessage', {
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
  clientId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'clients',
      key: 'id'
    }
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'appointments',
      key: 'id'
    }
  },
  to: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  phoneNumberId: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  messageType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  payload: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  providerMessageId: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'QUEUED'
  },
  errorCode: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'whatsapp_messages',
  timestamps: true,
  indexes: [
    { fields: ['businessId'] },
    { fields: ['clientId'] },
    { fields: ['appointmentId'] },
    { fields: ['providerMessageId'] },
    { fields: ['status'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = WhatsAppMessage;
