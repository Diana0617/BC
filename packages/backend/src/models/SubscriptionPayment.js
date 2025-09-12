const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SubscriptionPayment = sequelize.define('SubscriptionPayment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  businessSubscriptionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'business_subscriptions',
      key: 'id'
    }
  },
  paymentConfigurationId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'owner_payment_configurations',
      key: 'id'
    },
    comment: 'Configuración de pago utilizada (null para pagos manuales)'
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
  status: {
    type: DataTypes.ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  paymentMethod: {
    type: DataTypes.ENUM('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'PSE', 'CASH', 'CHECK', 'DIGITAL_WALLET', 'MANUAL'),
    allowNull: false
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'ID de transacción del proveedor de pagos'
  },
  externalReference: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Referencia externa del pago'
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  
  // === COMPROBANTES CLOUDINARY ===
  receiptUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    },
    comment: 'URL del comprobante de pago en Cloudinary'
  },
  receiptPublicId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Public ID del comprobante en Cloudinary para gestión'
  },
  receiptMetadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Metadatos del archivo: tamaño, formato, fecha subida, etc.'
  },
  receiptUploadedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que subió el comprobante'
  },
  receiptUploadedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // === DATOS FINANCIEROS ===
  commissionFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Comisión cobrada por el proveedor de pagos'
  },
  netAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Monto neto recibido después de comisiones'
  },
  
  // === INFORMACIÓN ADICIONAL ===
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas internas sobre el pago'
  },
  failureReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Razón del fallo si status es FAILED'
  },
  refundReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Razón del reembolso si aplica'
  },
  refundedAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // === METADATOS ===
  providerResponse: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Respuesta completa del proveedor de pagos'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'subscription_payments',
  timestamps: true,
  indexes: [
    {
      fields: ['businessSubscriptionId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['paymentMethod']
    },
    {
      fields: ['transactionId']
    },
    {
      fields: ['paidAt']
    },
    {
      fields: ['dueDate']
    },
    {
      unique: true,
      fields: ['transactionId'],
      name: 'unique_transaction_id',
      where: {
        transactionId: {
          [require('sequelize').Op.ne]: null
        }
      }
    }
  ],
  scopes: {
    completed: {
      where: {
        status: 'COMPLETED'
      }
    },
    pending: {
      where: {
        status: ['PENDING', 'PROCESSING']
      }
    },
    failed: {
      where: {
        status: 'FAILED'
      }
    },
    withReceipt: {
      where: {
        receiptUrl: {
          [require('sequelize').Op.ne]: null
        }
      }
    }
  }
});

module.exports = SubscriptionPayment;