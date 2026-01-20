const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CommissionPaymentRequest = sequelize.define('CommissionPaymentRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  requestNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // Ej: CPR-2024-001
  },
  specialistId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    }
  },
  periodFrom: {
    type: DataTypes.DATE,
    allowNull: false
  },
  periodTo: {
    type: DataTypes.DATE,
    allowNull: false
  },
  totalAmount: {
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
    type: DataTypes.ENUM(
      'DRAFT',        // Borrador (especialista editando)
      'SUBMITTED',    // Enviado para aprobación
      'APPROVED',     // Aprobado por el negocio
      'REJECTED',     // Rechazado por el negocio
      'PAID',         // Pagado
      'CANCELLED'     // Cancelado
    ),
    allowNull: false,
    defaultValue: 'DRAFT'
  },
  documentUrl: {
    type: DataTypes.STRING,
    allowNull: true // URL del documento PDF generado
  },
  signatureUrl: {
    type: DataTypes.STRING,
    allowNull: true // URL de la firma aplicada al documento
  },
  specialistNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  businessNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reviewedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  paidBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  paymentMethod: {
    type: DataTypes.ENUM('BANK_TRANSFER', 'CASH', 'DIGITAL_WALLET', 'CHECK', 'OTHER'),
    allowNull: true
  },
  paymentReference: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentProofUrl: {
    type: DataTypes.STRING,
    allowNull: true // URL del comprobante de pago subido a Cloudinary
  },
  bankAccount: {
    type: DataTypes.JSON, // Información de la cuenta bancaria
    allowNull: true
  }
}, {
  tableName: 'commission_payment_requests',
  timestamps: true,
  indexes: [
    {
      fields: ['specialistId']
    },
    {
      fields: ['businessId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['periodFrom', 'periodTo']
    },
    {
      fields: ['requestNumber']
    }
  ]
});

module.exports = CommissionPaymentRequest;