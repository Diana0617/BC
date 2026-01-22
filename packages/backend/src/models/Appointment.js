const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Appointment = sequelize.define('Appointment', {
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
  branchId: {
    type: DataTypes.UUID,
    allowNull: true, // Inicialmente nullable para migración gradual
    references: {
      model: 'branches',
      key: 'id'
    },
    comment: 'Sucursal donde se realiza la cita'
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id'
    }
  },
  specialistId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'services',
      key: 'id'
    }
  },
  appointmentNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(
      'PENDING', 
      'CONFIRMED', 
      'IN_PROGRESS', 
      'COMPLETED', 
      'CANCELED', 
      'NO_SHOW',
      'RESCHEDULED'
    ),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  paymentStatus: {
    type: DataTypes.ENUM('PENDING', 'PARTIAL', 'PAID', 'REFUNDED', 'PENDING_VERIFICATION'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  clientNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  specialistNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancelReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  canceledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  canceledBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  confirmedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  hasConsent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  consentSignedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  consentDocument: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // consentSignatureId removido para evitar dependencia circular
  // Usar ConsentSignature.appointmentId en su lugar para la relación
  evidence: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      before: [],
      after: [],
      documents: []
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  remindersSent: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  meetingLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  rescheduleHistory: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  additionalServices: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  // Información de pagos adelantados/depósitos
  advancePayment: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: null,
    comment: 'Información del pago adelantado requerido para la cita'
    // Estructura: {
    //   required: boolean,
    //   amount: number,
    //   percentage: number,
    //   wompiReference: string,
    //   status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED',
    //   paidAt: timestamp,
    //   refundedAt: timestamp,
    //   transactionData: object
    // }
  },
  // Referencia de pago en Wompi para el adelanto
  wompiPaymentReference: {
    type: DataTypes.STRING,
    allowNull: true,
    // unique: true, // ⚠️ Comentado temporalmente para evitar error de migración
    comment: 'Referencia única del pago adelantado en Wompi'
  },
  // Estado específico del depósito/adelanto
  depositStatus: {
    type: DataTypes.STRING, // ⚠️ Cambiado temporalmente de ENUM a STRING
    allowNull: false,
    defaultValue: 'NOT_REQUIRED',
    comment: 'Estado del depósito requerido para agendar la cita'
  },
  // Campos para reservas online
  paymentProofUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL del comprobante de pago subido por el cliente (para reservas online)'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Método de pago seleccionado (CASH, TRANSFER, CARD, etc.)'
  },
  source: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'SYSTEM',
    comment: 'Origen de la cita (SYSTEM, ONLINE_BOOKING, MOBILE_APP, etc.)'
  },
  bookingCode: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    comment: 'Código único de reserva para tracking'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'appointments',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId', 'startTime']
    },
    {
      fields: ['specialistId', 'startTime']
    },
    {
      fields: ['clientId', 'businessId']
    },
    {
      fields: ['status', 'businessId']
    },
    {
      fields: ['appointmentNumber']
    }
  ]
});

// Relaciones
Appointment.associate = (models) => {
  Appointment.belongsTo(models.Business, {
    foreignKey: 'businessId',
    as: 'business'
  });

  Appointment.belongsTo(models.Branch, {
    foreignKey: 'branchId',
    as: 'branch'
  });

  Appointment.belongsTo(models.Client, {
    foreignKey: 'clientId',
    as: 'client'
  });

  Appointment.belongsTo(models.User, {
    foreignKey: 'specialistId',
    as: 'specialist'
  });

  Appointment.belongsTo(models.Service, {
    foreignKey: 'serviceId',
    as: 'service'
  });

  Appointment.belongsTo(models.User, {
    foreignKey: 'canceledBy',
    as: 'canceledByUser'
  });

  // Relación con el usuario que procesó el pago
  Appointment.belongsTo(models.User, {
    foreignKey: 'paidByUserId',
    as: 'paidBy'
  });

  // Relación con Receipt (uno a uno)
  if (models.Receipt) {
    Appointment.hasOne(models.Receipt, {
      foreignKey: 'appointmentId',
      as: 'receipt'
    });
  }
};

module.exports = Appointment;