const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BusinessRuleAssignment = sequelize.define('BusinessRuleAssignment', {
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
  ruleTemplateId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  customValue: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  isCustomized: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  originalValue: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  assignedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  assignedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  lastModified: {
    type: DataTypes.DATE,
    allowNull: true
  },
  modifiedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'business_rule_assignments',
  timestamps: true
});

module.exports = BusinessRuleAssignment;