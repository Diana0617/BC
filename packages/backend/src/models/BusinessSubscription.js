const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BusinessSubscription = sequelize.define('BusinessSubscription', {
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
  subscriptionPlanId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'subscription_plans',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'EXPIRED', 'CANCELED', 'SUSPENDED', 'TRIAL'),
    allowNull: false,
    defaultValue: 'TRIAL'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  trialEndDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  autoRenew: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentStatus: {
    type: DataTypes.ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  lastPaymentDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  nextPaymentDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'COP'
  },
  discountApplied: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  canceledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancelReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'business_subscriptions',
  timestamps: true,
  scopes: {
    active: {
      where: {
        status: ['ACTIVE', 'TRIAL']
      }
    }
  }
});

module.exports = BusinessSubscription;