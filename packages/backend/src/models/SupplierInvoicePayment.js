const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SupplierInvoicePayment = sequelize.define('SupplierInvoicePayment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  invoiceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'supplier_invoices',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  paymentMethod: {
    type: DataTypes.ENUM(
      'CASH',           // Efectivo
      'TRANSFER',       // Transferencia bancaria
      'CHECK',          // Cheque
      'CREDIT_CARD',    // Tarjeta de crédito
      'DEBIT_CARD',     // Tarjeta de débito
      'OTHER'           // Otro
    ),
    allowNull: false,
    defaultValue: 'TRANSFER'
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Número de referencia, cheque, o transacción'
  },
  receipt: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL del comprobante de pago (Cloudinary)'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'supplier_invoice_payments',
  timestamps: true,
  indexes: [
    {
      fields: ['invoiceId']
    },
    {
      fields: ['businessId']
    },
    {
      fields: ['paymentDate']
    },
    {
      fields: ['paymentMethod']
    }
  ]
});

module.exports = SupplierInvoicePayment;
