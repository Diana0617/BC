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
    }
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