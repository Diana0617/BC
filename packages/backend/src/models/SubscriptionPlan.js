const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    },
    comment: 'Precio base/mensual del plan'
  },
  monthlyPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    },
    comment: 'Precio mensual (si se paga mes a mes)'
  },
  annualPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    },
    comment: 'Precio anual (si se paga el año completo - con descuento)'
  },
  billingCycle: {
    type: DataTypes.ENUM('MONTHLY', 'ANNUAL'),
    allowNull: false,
    defaultValue: 'MONTHLY',
    comment: 'Ciclo de facturación por defecto'
  },
  annualDiscountPercent: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Porcentaje de descuento al pagar anual (ej: 20 = 20% off)'
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'COP'
  },
  duration: {
    type: DataTypes.INTEGER, // días
    allowNull: false,
    validate: {
      min: 1
    }
  },
  durationType: {
    type: DataTypes.ENUM('DAYS', 'WEEKS', 'MONTHS', 'YEARS'),
    allowNull: false,
    defaultValue: 'MONTHS'
  },
  maxUsers: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  maxClients: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  maxAppointments: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  storageLimit: {
    type: DataTypes.BIGINT, // bytes
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'DEPRECATED'),
    allowNull: false,
    defaultValue: 'ACTIVE'
  },
  isPopular: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  trialDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  features: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  limitations: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'subscription_plans',
  timestamps: true,
  scopes: {
    active: {
      where: {
        status: 'ACTIVE'
      }
    }
  }
});

module.exports = SubscriptionPlan;