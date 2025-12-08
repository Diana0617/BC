const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OwnerPaymentConfiguration = sequelize.define('OwnerPaymentConfiguration', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  provider: {
    type: DataTypes.ENUM('WOMPI', 'TAXXA', 'PAYPAL', 'STRIPE', 'MERCADOPAGO', 'PSE', 'BANK_TRANSFER', 'MANUAL'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  environment: {
    type: DataTypes.ENUM('SANDBOX', 'PRODUCTION'),
    allowNull: false,
    defaultValue: 'SANDBOX'
  },
  configuration: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
    comment: 'Configuración específica del proveedor de pagos'
  },
  credentials: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
    comment: 'Credenciales encriptadas del proveedor'
  },
  webhookUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  webhookSecret: {
    type: DataTypes.STRING,
    allowNull: true
  },
  supportedCurrencies: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: ['COP']
  },
  commissionRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Porcentaje de comisión del proveedor'
  },
  fixedFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Tarifa fija por transacción'
  },
  maxAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Monto máximo permitido por transacción'
  },
  minAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Monto mínimo permitido por transacción'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'owner_payment_configurations',
  timestamps: true,
  indexes: [
    {
      fields: ['provider']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['isDefault']
    }
  ]
});

module.exports = OwnerPaymentConfiguration;