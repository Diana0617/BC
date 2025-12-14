const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * LoyaltyPointTransaction - Registro de transacciones de puntos de fidelización
 * 
 * Cada acción que otorga o consume puntos se registra aquí:
 * - Pagos de citas
 * - Compras de productos
 * - Referidos
 * - Canjes de recompensas
 * - Ajustes manuales
 */
const LoyaltyPointTransaction = sequelize.define('LoyaltyPointTransaction', {
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
    comment: 'Negocio que otorga/consume los puntos'
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id'
    },
    comment: 'Cliente que recibe/consume los puntos'
  },
  branchId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'branches',
      key: 'id'
    },
    comment: 'Sucursal donde se generó la transacción (si aplica)'
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Cantidad de puntos (positivo = acredita, negativo = debita)'
  },
  type: {
    type: DataTypes.ENUM(
      'APPOINTMENT_PAYMENT',  // Pago de cita completada
      'PRODUCT_PURCHASE',      // Compra de producto
      'REFERRAL',              // Referir un cliente nuevo
      'REFERRAL_FIRST_VISIT',  // Primer visita del cliente referido (bonus adicional)
      'REDEMPTION',            // Canje de recompensa
      'EXPIRATION',            // Expiración de puntos
      'MANUAL_ADJUSTMENT',     // Ajuste manual por negocio
      'BONUS',                 // Bonificación especial
      'REFUND'                 // Reembolso/devolución
    ),
    allowNull: false,
    comment: 'Tipo de transacción que generó puntos'
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'COMPLETED', 'REVERSED', 'EXPIRED'),
    allowNull: false,
    defaultValue: 'COMPLETED',
    comment: 'Estado de la transacción de puntos'
  },
  referenceType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Tipo de entidad relacionada (appointments, products, loyalty_rewards, etc.)'
  },
  referenceId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID de la entidad relacionada (appointmentId, productId, rewardId, etc.)'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Monto en dinero asociado a la transacción (si aplica)'
  },
  multiplier: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 1.00,
    comment: 'Multiplicador usado para calcular puntos (ej: 1.5x por promoción)'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción de la transacción'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de expiración de estos puntos (si aplica)'
  },
  processedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que procesó la transacción (si fue manual)'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Datos adicionales (regla aplicada, campaña, etc.)'
  }
}, {
  tableName: 'loyalty_point_transactions',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId', 'clientId', 'createdAt']
    },
    {
      fields: ['referenceType', 'referenceId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['type']
    },
    {
      fields: ['expiresAt']
    }
  ]
});

module.exports = LoyaltyPointTransaction;
