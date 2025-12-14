const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * LoyaltyReward - Recompensas/beneficios canjeados por puntos de fidelización
 * 
 * Registra cuando un cliente canjea sus puntos por un beneficio:
 * - Descuento en próxima cita
 * - Voucher de valor
 * - Servicio gratuito
 * - Regalo/producto
 */
const LoyaltyReward = sequelize.define('LoyaltyReward', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'Código único de la recompensa (ej: RWD-ABC123XYZ)'
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    },
    comment: 'Negocio que otorga la recompensa'
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id'
    },
    comment: 'Cliente que canjea la recompensa'
  },
  pointsUsed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Cantidad de puntos canjeados'
  },
  rewardType: {
    type: DataTypes.ENUM(
      'DISCOUNT_PERCENTAGE',   // Descuento % en próxima compra
      'DISCOUNT_FIXED',        // Descuento fijo en $
      'FREE_SERVICE',          // Servicio gratuito
      'VOUCHER',               // Voucher de valor
      'PRODUCT',               // Producto gratis
      'UPGRADE',               // Upgrade de servicio
      'CUSTOM'                 // Beneficio personalizado
    ),
    allowNull: false,
    comment: 'Tipo de recompensa canjeada'
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Valor de la recompensa (%, $, etc.)'
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'COP',
    comment: 'Moneda de la recompensa'
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'USED', 'EXPIRED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'ACTIVE',
    comment: 'Estado de la recompensa'
  },
  issuedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de canje/emisión'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha de expiración de la recompensa'
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha en que se usó la recompensa'
  },
  usedInReferenceType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Tipo de entidad donde se aplicó (appointments, products, etc.)'
  },
  usedInReferenceId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID de la entidad donde se aplicó (appointmentId, productId, etc.)'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción detallada del beneficio'
  },
  conditions: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Condiciones de uso (servicios aplicables, mínimo de compra, etc.)'
  },
  issuedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que procesó el canje'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Datos adicionales (transacción de puntos, reglas aplicadas, etc.)'
  }
}, {
  tableName: 'loyalty_rewards',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['code']
    },
    {
      fields: ['businessId', 'clientId']
    },
    {
      fields: ['status', 'expiresAt']
    },
    {
      fields: ['usedInReferenceType', 'usedInReferenceId']
    }
  ]
});

module.exports = LoyaltyReward;
