const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SupplierCatalogItem = sequelize.define('SupplierCatalogItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  supplierId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'suppliers',
      key: 'id'
    }
  },
  supplierSku: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  subcategory: {
    type: DataTypes.STRING,
    allowNull: true
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'COP'
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: true
  },
  minimumOrder: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1
  },
  maximumOrder: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  leadTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Tiempo de entrega en días'
  },
  available: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  specifications: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  lastUpdate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  validUntil: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'supplier_catalog_items',
  timestamps: true,
  indexes: [
    {
      fields: ['supplierId']
    },
    {
      fields: ['supplierSku']
    },
    {
      fields: ['category']
    },
    {
      fields: ['available']
    },
    {
      fields: ['price']
    },
    {
      unique: true,
      fields: ['supplierId', 'supplierSku']
    }
  ]
});

module.exports = SupplierCatalogItem;