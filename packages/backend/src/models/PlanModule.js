const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PlanModule = sequelize.define('PlanModule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  subscriptionPlanId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'subscription_plans',
      key: 'id'
    }
  },
  moduleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'modules',
      key: 'id'
    }
  },
  isIncluded: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  limitQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  additionalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  configuration: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'plan_modules',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['subscriptionPlanId', 'moduleId']
    }
  ]
});

module.exports = PlanModule;