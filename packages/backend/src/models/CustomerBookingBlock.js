const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * CustomerBookingBlock - Bloqueos temporales de acceso a agenda
 * 
 * Gestiona penalizaciones por exceso de cancelaciones
 */
const CustomerBookingBlock = sequelize.define('CustomerBookingBlock', {
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
    comment: 'Negocio que aplica el bloqueo'
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Cliente bloqueado'
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'LIFTED', 'EXPIRED'),
    allowNull: false,
    defaultValue: 'ACTIVE',
    comment: 'Estado del bloqueo'
  },
  reason: {
    type: DataTypes.ENUM('EXCESSIVE_CANCELLATIONS', 'MANUAL', 'NO_SHOW', 'OTHER'),
    allowNull: false,
    defaultValue: 'EXCESSIVE_CANCELLATIONS',
    comment: 'Razón del bloqueo'
  },
  blockedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de inicio del bloqueo'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha de fin del bloqueo'
  },
  liftedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha en que se levantó el bloqueo manualmente'
  },
  liftedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que levantó el bloqueo'
  },
  cancellationCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Número de cancelaciones que causaron el bloqueo'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales sobre el bloqueo'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Datos adicionales (IDs de cancelaciones, etc.)'
  }
}, {
  tableName: 'customer_booking_blocks',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId', 'customerId', 'status']
    },
    {
      fields: ['customerId', 'status', 'expiresAt']
    },
    {
      fields: ['status', 'expiresAt']
    }
  ]
});

module.exports = CustomerBookingBlock;
