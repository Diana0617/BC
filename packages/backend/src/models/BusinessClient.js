const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BusinessClient = sequelize.define('BusinessClient', {
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
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id'
    }
  },
  clientNumber: {
    type: DataTypes.STRING,
    allowNull: true // número de cliente en el negocio
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'BLOCKED', 'VIP'),
    allowNull: false,
    defaultValue: 'ACTIVE'
  },
  firstVisit: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastVisit: {
    type: DataTypes.DATE,
    allowNull: true
  },
  totalVisits: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  totalSpent: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  averageRating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  preferredSpecialistId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  businessNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  businessTags: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  loyaltyPoints: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  discountEligible: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  hasOutstandingBalance: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  outstandingAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  hasPendingCancellation: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  customFields: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'business_clients',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['businessId', 'clientId']
    },
    {
      fields: ['businessId', 'status']
    },
    {
      fields: ['clientNumber', 'businessId']
    }
  ]
});

module.exports = BusinessClient;