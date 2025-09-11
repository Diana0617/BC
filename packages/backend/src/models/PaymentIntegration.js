const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PaymentIntegration = sequelize.define('PaymentIntegration', {
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
    }
  },
  provider: {
    type: DataTypes.ENUM('WOMPI', 'TAXXA', 'PAYPAL', 'STRIPE', 'MERCADOPAGO', 'PSE'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
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
    defaultValue: {}
  },
  credentials: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {} // Encrypted
  },
  supportedMethods: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: ['CREDIT_CARD', 'DEBIT_CARD']
  },
  fees: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      percentage: 0,
      fixed: 0,
      currency: 'COP'
    }
  },
  limits: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      minAmount: 0,
      maxAmount: null,
      dailyLimit: null,
      monthlyLimit: null
    }
  },
  webhookUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  webhookSecret: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastSync: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'ERROR', 'PENDING_VERIFICATION'),
    allowNull: false,
    defaultValue: 'PENDING_VERIFICATION'
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'payment_integrations',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId', 'provider']
    },
    {
      fields: ['businessId', 'isActive']
    },
    {
      unique: true,
      fields: ['businessId', 'provider', 'name']
    }
  ]
});

module.exports = PaymentIntegration;