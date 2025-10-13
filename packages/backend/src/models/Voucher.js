const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Voucher - Cupones generados por cancelación de citas
 * 
 * Permite a los clientes reagendar servicios sin perder el pago
 * cuando cancelan con suficiente anticipación
 */
const Voucher = sequelize.define('Voucher', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'Código único del voucher (ej: VCH-ABC123XYZ)'
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    },
    comment: 'Negocio que emitió el voucher'
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Cliente dueño del voucher'
  },
  originalBookingId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'appointments',
      key: 'id'
    },
    comment: 'Cita original que generó el voucher'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Valor del voucher en la moneda del negocio'
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'COP',
    comment: 'Moneda del voucher (COP, USD, etc.)'
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'USED', 'EXPIRED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'ACTIVE',
    comment: 'Estado del voucher'
  },
  issuedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de emisión'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha de expiración'
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha en que se usó el voucher'
  },
  usedInBookingId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'appointments',
      key: 'id'
    },
    comment: 'Cita en la que se aplicó el voucher'
  },
  cancelReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Razón de cancelación de la cita original'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales sobre el voucher'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Datos adicionales (servicio original, especialista, etc.)'
  }
}, {
  tableName: 'vouchers',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['code']
    },
    {
      fields: ['businessId', 'customerId']
    },
    {
      fields: ['status', 'expiresAt']
    },
    {
      fields: ['originalBookingId']
    }
  ]
});

module.exports = Voucher;
