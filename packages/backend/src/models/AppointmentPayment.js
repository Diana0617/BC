const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo AppointmentPayment - Registro de pagos de citas
 * 
 * Características:
 * - Múltiples pagos por cita (pagos parciales)
 * - Métodos de pago personalizados del negocio
 * - Comprobantes de pago
 * - Tracking de quien registró el pago
 * - Integración con Receipt para recibos automáticos
 */
const AppointmentPayment = sequelize.define('AppointmentPayment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Relaciones
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'appointments',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Cita a la que pertenece este pago'
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Negocio al que pertenece'
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id'
    },
    comment: 'Cliente que realizó el pago'
  },
  
  // Información del pago
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    },
    comment: 'Monto del pago'
  },
  paymentMethodId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'ID del método de pago configurado en BusinessPaymentConfig.paymentMethods'
  },
  paymentMethodName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nombre del método de pago (snapshot para historial)'
  },
  paymentMethodType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Tipo de método: CASH, CARD, TRANSFER, QR, ONLINE, OTHER'
  },
  
  // Detalles del pago
  reference: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Número de referencia, transacción o comprobante'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales del pago'
  },
  
  // Comprobante de pago
  proofUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL del comprobante de pago (imagen, PDF)'
  },
  proofType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Tipo de archivo del comprobante (image/jpeg, application/pdf, etc.)'
  },
  
  // Estado del pago
  status: {
    type: DataTypes.ENUM('PENDING', 'COMPLETED', 'REFUNDED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'COMPLETED',
    comment: 'Estado del pago'
  },
  
  // Información de quien registró el pago
  registeredBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que registró el pago (especialista, recepcionista, etc.)'
  },
  registeredByRole: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Rol del usuario que registró el pago'
  },
  
  // Fechas
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha y hora del pago'
  },
  
  // Integración con Receipt
  receiptId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'receipts',
      key: 'id'
    },
    comment: 'Recibo generado para este pago'
  },
  
  // Metadata adicional
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Metadata adicional del pago (IP, device, location, etc.)'
  },
  
  // Para pagos online (Wompi, Stripe, etc.)
  onlinePaymentData: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Datos del pago online si aplica: transactionId, provider, status, etc.'
  }
  
}, {
  tableName: 'appointment_payments',
  timestamps: true,
  indexes: [
    {
      fields: ['appointmentId']
    },
    {
      fields: ['businessId']
    },
    {
      fields: ['clientId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['paymentDate']
    },
    {
      fields: ['registeredBy']
    },
    {
      fields: ['receiptId']
    },
    {
      fields: ['businessId', 'paymentDate']
    }
  ]
});

// Métodos de instancia
AppointmentPayment.prototype.isCompleted = function() {
  return this.status === 'COMPLETED';
};

AppointmentPayment.prototype.isRefunded = function() {
  return this.status === 'REFUNDED';
};

AppointmentPayment.prototype.hasProof = function() {
  return !!this.proofUrl;
};

module.exports = AppointmentPayment;
