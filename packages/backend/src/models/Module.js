const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Module = sequelize.define('Module', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 50]
    }
  },
  displayName: {
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
  icon: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM(
      'CORE', 
      'APPOINTMENTS', 
      'PAYMENTS', 
      'INVENTORY', 
      'REPORTS', 
      'INTEGRATIONS',
      'COMMUNICATIONS',
      'ANALYTICS'
    ),
    allowNull: false,
    defaultValue: 'CORE'
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'DEVELOPMENT', 'DEPRECATED'),
    allowNull: false,
    defaultValue: 'ACTIVE'
  },
  version: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '1.0.0'
  },
  requiresConfiguration: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  configurationSchema: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  permissions: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  dependencies: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  pricing: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      type: 'FREE',
      price: 0,
      currency: 'COP'
    }
  }
}, {
  tableName: 'modules',
  timestamps: true,
  scopes: {
    active: {
      where: {
        status: 'ACTIVE'
      }
    }
  }
});

module.exports = Module;