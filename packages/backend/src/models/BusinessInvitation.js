const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BusinessInvitation = sequelize.define('BusinessInvitation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  invitationToken: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Token único para la invitación'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  planId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'subscription_plans',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM(
      'SENT',           // Invitación enviada
      'VIEWED',         // Link visitado
      'PAYMENT_STARTED', // Proceso de pago iniciado
      'COMPLETED',      // Pago completado y negocio activado
      'EXPIRED',        // Token expirado
      'CANCELLED'       // Invitación cancelada
    ),
    allowNull: false,
    defaultValue: 'SENT'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha de expiración del token'
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de envío del email'
  },
  viewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha cuando se visitó el link'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha cuando se completó el pago'
  },
  invitedBy: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Email del owner que envió la invitación'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Datos adicionales de la invitación'
  }
}, {
  tableName: 'business_invitations',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['invitationToken'],
      unique: true
    },
    {
      fields: ['email']
    },
    {
      fields: ['status']
    },
    {
      fields: ['expiresAt']
    }
  ]
});

module.exports = BusinessInvitation;