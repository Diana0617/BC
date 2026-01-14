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
    },
    field: 'client_id'
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'appointments',
      key: 'id'
    },
    field: 'appointment_id'
  },
  to: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  phoneNumberId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'phone_number_id'
  },
  messageType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'message_type'
  },
  payload: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  providerMessageId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'provider_message_id'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'QUEUED'
  },
  errorCode: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'error_code'
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'error_message'
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'sent_at'
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'delivered_at'
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'read_at'
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
