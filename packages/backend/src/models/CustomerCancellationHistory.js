const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * CustomerCancellationHistory - Historial de cancelaciones por cliente
 * 
 * Rastrea las cancelaciones para aplicar penalizaciones según reglas del negocio
 */
const CustomerCancellationHistory = sequelize.define('CustomerCancellationHistory', {
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
    comment: 'Negocio donde ocurrió la cancelación'
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Cliente que canceló'
  },
  bookingId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'appointments',
      key: 'id'
    },
    comment: 'Cita cancelada'
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha y hora de cancelación'
  },
  bookingDateTime: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha y hora original de la cita'
  },
  hoursBeforeBooking: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Horas de anticipación con que se canceló'
  },
  voucherGenerated: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si se generó voucher por esta cancelación'
  },
  voucherId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'vouchers',
      key: 'id'
    },
    comment: 'Voucher generado (si aplica)'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Razón de cancelación proporcionada por el cliente'
  },
  cancelledBy: {
    type: DataTypes.ENUM('CUSTOMER', 'BUSINESS', 'SYSTEM'),
    allowNull: false,
    defaultValue: 'CUSTOMER',
    comment: 'Quién canceló la cita'
  }
}, {
  tableName: 'customer_cancellation_history',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId', 'customerId']
    },
    {
      fields: ['customerId', 'cancelledAt']
    },
    {
      fields: ['bookingId']
    },
    {
      fields: ['voucherId']
    }
  ]
});

module.exports = CustomerCancellationHistory;
