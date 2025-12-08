const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SavedPaymentMethod = sequelize.define('SavedPaymentMethod', {
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
  paymentProvider: {
    type: DataTypes.ENUM('WOMPI', 'PAYU', 'STRIPE', 'PAYPAL'),
    allowNull: false,
    defaultValue: 'WOMPI'
  },
  providerToken: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Token del método de pago del proveedor'
  },
  cardLastFour: {
    type: DataTypes.STRING(4),
    allowNull: true,
    comment: 'Últimos 4 dígitos de la tarjeta'
  },
  cardBrand: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Marca de la tarjeta (VISA, MASTERCARD, etc.)'
  },
  cardExpiryMonth: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 12
    }
  },
  cardExpiryYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: new Date().getFullYear()
    }
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Método de pago predeterminado'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Método de pago activo'
  },
  customerReference: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Referencia del cliente en el proveedor'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Metadatos adicionales del proveedor'
  }
}, {
  tableName: 'saved_payment_methods',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId']
    },
    {
      fields: ['businessId', 'isDefault'],
      where: { isDefault: true },
      unique: true,
      name: 'one_default_per_business'
    },
    {
      fields: ['paymentProvider', 'providerToken']
    }
  ]
}, {
  tableName: 'saved_payment_methods',
  timestamps: true,
  underscored: true
});

module.exports = SavedPaymentMethod;