const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Gastos del negocio
 * Cada negocio registra sus gastos operacionales con categorías personalizadas
 */
const BusinessExpense = sequelize.define('BusinessExpense', {
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
    },
    comment: 'Negocio al que pertenece el gasto'
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'business_expense_categories',
      key: 'id'
    },
    comment: 'Categoría personalizada del gasto'
  },
  
  // === INFORMACIÓN BÁSICA ===
  description: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Descripción detallada del gasto'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0.01
    },
    comment: 'Monto del gasto'
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'COP',
    comment: 'Moneda (ISO 4217)'
  },
  
  // === FECHAS ===
  expenseDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha en que se realizó el gasto'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de vencimiento del pago (si aplica)'
  },
  paidDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha en que se pagó el gasto'
  },
  
  // === PROVEEDOR ===
  vendor: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Nombre del proveedor'
  },
  vendorTaxId: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'NIT o identificación tributaria'
  },
  vendorPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Teléfono del proveedor'
  },
  vendorEmail: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    },
    comment: 'Email del proveedor'
  },
  
  // === COMPROBANTES (CLOUDINARY) ===
  receiptUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL del comprobante en Cloudinary'
  },
  receiptPublicId: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Public ID de Cloudinary'
  },
  receiptType: {
    type: DataTypes.ENUM('IMAGE', 'PDF'),
    allowNull: true,
    
  },
  receiptOriginalName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Nombre original del archivo'
  },
  
  // === IMPUESTOS ===
  taxAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Monto de impuestos (IVA, retención, etc.)'
  },
  taxRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Porcentaje de impuesto aplicado'
  },
  
  // === MÉTODO DE PAGO ===
  paymentMethod: {
    type: DataTypes.ENUM(
      'CASH',
      'CREDIT_CARD',
      'DEBIT_CARD',
      'BANK_TRANSFER',
      'CHECK',
      'DIGITAL_WALLET',
      'OTHER'
    ),
    allowNull: true,
   
  },
  transactionReference: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Referencia o número de transacción'
  },
  
  // === ESTADO ===
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'PAID', 'REJECTED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'PENDING'
    
  },
  
  // === RECURRENCIA ===
  isRecurring: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si es un gasto recurrente'
  },
  recurringFrequency: {
    type: DataTypes.ENUM('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'),
    allowNull: true
  },
  nextRecurrenceDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // === NOTAS Y REFERENCIAS ===
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales sobre el gasto'
  },
  internalReference: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Referencia interna del negocio'
  },
  
  // === APROBACIÓN ===
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que aprobó el gasto'
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de aprobación'
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Motivo de rechazo (si aplica)'
  },
  
  // === AUDITORÍA ===
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Gasto activo/eliminado'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que registró el gasto'
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que actualizó el gasto'
  }
}, {
  tableName: 'business_expenses',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId', 'isActive']
    },
    {
      fields: ['businessId', 'categoryId']
    },
    {
      fields: ['businessId', 'status']
    },
    {
      fields: ['businessId', 'expenseDate']
    },
    {
      fields: ['vendor']
    },
    {
      fields: ['createdBy']
    }
  ]
});

module.exports = BusinessExpense;
