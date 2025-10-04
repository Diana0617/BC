const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Supplier = sequelize.define('Supplier', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  code: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  type: {
    type: DataTypes.ENUM(
      'DISTRIBUTOR',
      'MANUFACTURER', 
      'WHOLESALER',
      'RETAILER',
      'SERVICE_PROVIDER',
      'FREELANCER'
    ),
    allowNull: false,
    defaultValue: 'DISTRIBUTOR'
  },
  status: {
    type: DataTypes.ENUM(
      'ACTIVE',
      'INACTIVE',
      'PENDING',
      'BLOCKED',
      'UNDER_REVIEW'
    ),
    allowNull: false,
    defaultValue: 'ACTIVE'
  },
  taxId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  address: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  contactPerson: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  categories: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  paymentTerms: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  bankInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  certifications: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  stats: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      totalOrders: 0,
      totalSpent: 0,
      pendingInvoices: 0,
      averageRating: 0
    }
  }
}, {
  tableName: 'suppliers',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId']
    },
    {
      fields: ['code'],
      unique: true
    },
    {
      fields: ['status']
    },
    {
      fields: ['type']
    }
  ]
});

module.exports = Supplier;
