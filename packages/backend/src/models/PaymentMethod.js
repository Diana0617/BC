const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PaymentMethod = sequelize.define('PaymentMethod', {
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
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nombre del método de pago (ej: "Efectivo", "Yape", "Transferencia Bancolombia")'
  },
  type: {
    type: DataTypes.ENUM('CASH', 'CARD', 'TRANSFER', 'QR', 'ONLINE', 'OTHER'),
    allowNull: false,
    comment: 'Tipo de método de pago'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  requiresProof: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si requiere comprobante de pago'
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Nombre del ícono'
  },
  bankInfo: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Información bancaria para transferencias',
    defaultValue: {},
    validate: {
      isValidBankInfo(value) {
        if (this.type === 'TRANSFER' && value) {
          const required = ['bankName', 'accountNumber'];
          const missing = required.filter(field => !value[field]);
          if (missing.length > 0) {
            throw new Error(`Campos requeridos para TRANSFER: ${missing.join(', ')}`);
          }
        }
      }
    }
  },
  qrInfo: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Información para pagos QR (Yape, Plin, etc)',
    defaultValue: {},
    validate: {
      isValidQrInfo(value) {
        if (this.type === 'QR' && value) {
          if (!value.phoneNumber && !value.qrImage) {
            throw new Error('Se requiere phoneNumber o qrImage para métodos QR');
          }
        }
      }
    }
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Información adicional del método',
    defaultValue: {}
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Orden de visualización'
  }
}, {
  tableName: 'payment_methods',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId'],
      name: 'idx_payment_methods_business_id'
    },
    {
      fields: ['businessId', 'isActive'],
      name: 'idx_payment_methods_business_active'
    },
    {
      fields: ['type'],
      name: 'idx_payment_methods_type'
    }
  ]
});

// Métodos de instancia
PaymentMethod.prototype.toJSON = function() {
  const values = { ...this.get() };
  
  // Formatear según el tipo
  if (this.type === 'TRANSFER') {
    return {
      ...values,
      bankInfo: this.bankInfo || {}
    };
  }
  
  if (this.type === 'QR') {
    return {
      ...values,
      qrInfo: this.qrInfo || {}
    };
  }
  
  return values;
};

module.exports = PaymentMethod;
