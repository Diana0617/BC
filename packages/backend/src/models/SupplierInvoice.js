const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SupplierInvoice = sequelize.define('SupplierInvoice', {
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
  supplierId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'suppliers',
      key: 'id'
    }
  },
  purchaseOrderId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'purchase_orders',
      key: 'id'
    }
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(
      'PENDING',
      'APPROVED',
      'PAID',
      'OVERDUE',
      'DISPUTED',
      'CANCELLED'
    ),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  issueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  tax: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  total: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'COP'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  payments: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  paidAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  remainingAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'supplier_invoices',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId']
    },
    {
      fields: ['supplierId']
    },
    {
      fields: ['purchaseOrderId']
    },
    {
      fields: ['invoiceNumber']
    },
    {
      fields: ['status']
    },
    {
      fields: ['issueDate']
    },
    {
      fields: ['dueDate']
    }
  ]
});

module.exports = SupplierInvoice;