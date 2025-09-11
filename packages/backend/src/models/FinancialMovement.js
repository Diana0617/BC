const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FinancialMovement = sequelize.define('FinancialMovement', {
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
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('INCOME', 'EXPENSE'),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM(
      'SERVICE_PAYMENT',
      'PRODUCT_SALE',
      'SUBSCRIPTION_PAYMENT',
      'REFUND',
      'RENT',
      'UTILITIES',
      'SUPPLIES',
      'MARKETING',
      'EQUIPMENT',
      'SALARY',
      'COMMISSION',
      'TAX',
      'OTHER'
    ),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'COP'
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.ENUM(
      'CASH',
      'CREDIT_CARD',
      'DEBIT_CARD',
      'BANK_TRANSFER',
      'DIGITAL_WALLET',
      'CHECK',
      'VOUCHER',
      'CREDIT'
    ),
    allowNull: false
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  referenceId: {
    type: DataTypes.UUID,
    allowNull: true // ID del appointment, sale, etc.
  },
  referenceType: {
    type: DataTypes.STRING,
    allowNull: true // 'APPOINTMENT', 'PRODUCT_SALE', etc.
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Clients',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'),
    allowNull: false,
    defaultValue: 'COMPLETED'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  paidDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  receiptUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  voucherUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  taxRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  commission: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      specialistAmount: 0,
      businessAmount: 0,
      rate: 0
    }
  },
  integrationData: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  recurringConfig: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'financial_movements',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId', 'type']
    },
    {
      fields: ['businessId', 'category']
    },
    {
      fields: ['businessId', 'status']
    },
    {
      fields: ['clientId', 'businessId']
    },
    {
      fields: ['userId', 'businessId']
    },
    {
      fields: ['referenceId', 'referenceType']
    },
    {
      fields: ['transactionId']
    }
  ]
});

module.exports = FinancialMovement;