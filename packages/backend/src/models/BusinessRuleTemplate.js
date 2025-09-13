const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BusinessRuleTemplate = sequelize.define('BusinessRuleTemplate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM(
      'PAYMENT_POLICY',
      'CANCELLATION_POLICY',
      'BOOKING_POLICY',
      'WORKING_HOURS',
      'NOTIFICATION_POLICY',
      'REFUND_POLICY',
      'SERVICE_POLICY',
      'GENERAL'
    ),
    allowNull: false,
    defaultValue: 'GENERAL'
  },
  ruleKey: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ruleValue: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  ruleType: {
    type: DataTypes.ENUM('BOOLEAN', 'STRING', 'NUMBER', 'OBJECT', 'ARRAY'),
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  allowCustomization: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  customizationOptions: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Opciones de personalización disponibles para los negocios'
  },
  businessTypes: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  planTypes: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  conditions: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  conflicts: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  dependencies: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  examples: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  warnings: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  tags: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  usageCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  lastUsed: {
    type: DataTypes.DATE,
    allowNull: true
  },
  version: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '1.0.0'
  },
  changeLog: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'business_rule_templates',
  timestamps: true,
  indexes: [
    {
      fields: ['ownerId']
    },
    {
      fields: ['category']
    },
    {
      fields: ['ruleKey']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['isDefault']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['tags'],
      using: 'gin' // Para búsqueda eficiente en arrays JSONB
    },
    {
      fields: ['businessTypes'],
      using: 'gin'
    },
    {
      fields: ['planTypes'],
      using: 'gin'
    },
    {
      unique: true,
      fields: ['ownerId', 'ruleKey', 'version'],
      name: 'unique_owner_rule_version'
    }
  ]
});

module.exports = BusinessRuleTemplate;