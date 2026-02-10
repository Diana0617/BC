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
  receiptStatus: {
    type: DataTypes.ENUM(
      'PENDING_RECEIPT',
      'PARTIALLY_RECEIVED',
      'FULLY_RECEIVED'
    ),
    allowNull: false,
    defaultValue: 'PENDING_RECEIPT',
    comment: 'Estado de recepción de mercancía'
  },
  branchId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'branches',
      key: 'id'
    },
    comment: 'Sucursal donde se recibe la mercancía'
  },
  receivedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de recepción completa de mercancía'
  },
  receivedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que confirmó la recepción'
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
  taxIncluded: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si el IVA está incluido en los precios de los items'
  },
  taxPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Porcentaje de IVA aplicado (ej: 0, 5, 19)'
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
    },
    {
      fields: ['receiptStatus']
    },
    {
      fields: ['branchId']
    }
  ]
});

module.exports = SupplierInvoice;