const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Businesses',
      key: 'id'
    }
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
  sku: {
    type: DataTypes.STRING,
    allowNull: true
  },
  barcode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  trackInventory: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  currentStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  minStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  maxStock: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'unit'
  },
  weight: {
    type: DataTypes.DECIMAL(8, 3),
    allowNull: true
  },
  dimensions: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      length: null,
      width: null,
      height: null,
      unit: 'cm'
    }
  },
  images: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  taxable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  taxRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  supplier: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  tags: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  variants: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  expirationTracking: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  batchTracking: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  serialTracking: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'products',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId', 'isActive']
    },
    {
      fields: ['businessId', 'category']
    },
    {
      fields: ['sku', 'businessId']
    },
    {
      fields: ['barcode']
    }
  ]
});

module.exports = Product;