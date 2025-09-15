const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo Receipt - Gestión de recibos de pago
 * 
 * Características:
 * - Numeración secuencial por negocio
 * - Tracking completo de especialista, fecha, hora
 * - Vinculación con cita y pago
 * - Control de estado del recibo
 */
const Receipt = sequelize.define('Receipt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Numeración secuencial por negocio
  receiptNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'Número de recibo secuencial por negocio (ej: REC-2024-00001)'
  },
  
  sequenceNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Número secuencial interno para el negocio'
  },
  
  // Relaciones principales
  businessId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Businesses',
      key: 'id'
    },
    comment: 'Negocio que emite el recibo'
  },
  
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Appointments',
      key: 'id'
    },
    comment: 'Cita asociada al recibo'
  },
  
  specialistId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    comment: 'Especialista que realizó el servicio'
  },
  
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    comment: 'Cliente que recibe el servicio'
  },
  
  // Información del especialista (desnormalizada para histórico)
  specialistName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nombre completo del especialista al momento del recibo'
  },
  
  specialistCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Código del especialista para identificación'
  },
  
  // Información del cliente (desnormalizada para histórico)
  clientName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nombre completo del cliente'
  },
  
  clientPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Teléfono del cliente'
  },
  
  clientEmail: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Email del cliente'
  },
  
  // Fechas y horarios
  serviceDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Fecha del servicio realizado'
  },
  
  serviceTime: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Hora del servicio realizado'
  },
  
  issueDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha y hora de emisión del recibo'
  },
  
  // Información del servicio
  serviceName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Nombre del servicio realizado'
  },
  
  serviceDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción detallada del servicio'
  },
  
  // Información financiera
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Subtotal del servicio'
  },
  
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Impuestos aplicados'
  },
  
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Descuentos aplicados'
  },
  
  tip: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Propina incluida'
  },
  
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Monto total del recibo'
  },
  
  // Información del pago
  paymentMethod: {
    type: DataTypes.ENUM('CASH', 'CARD', 'TRANSFER', 'WOMPI', 'OTHER'),
    allowNull: false,
    comment: 'Método de pago utilizado'
  },
  
  paymentReference: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Referencia del pago (transactionId, etc.)'
  },
  
  paymentStatus: {
    type: DataTypes.ENUM('PENDING', 'PAID', 'CANCELLED', 'REFUNDED'),
    allowNull: false,
    defaultValue: 'PAID',
    comment: 'Estado del pago'
  },
  
  // Estado del recibo
  status: {
    type: DataTypes.ENUM('ACTIVE', 'CANCELLED', 'REFUNDED'),
    allowNull: false,
    defaultValue: 'ACTIVE',
    comment: 'Estado del recibo'
  },
  
  // Información de envío
  sentViaEmail: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si el recibo fue enviado por email'
  },
  
  sentViaWhatsApp: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si el recibo fue enviado por WhatsApp'
  },
  
  emailSentAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha y hora de envío por email'
  },
  
  whatsAppSentAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha y hora de envío por WhatsApp'
  },
  
  // Metadatos adicionales
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Información adicional del recibo (comisiones, reglas aplicadas, etc.)'
  },
  
  // Campos de auditoría
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    },
    comment: 'Usuario que creó el recibo'
  },
  
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales del recibo'
  }
}, {
  tableName: 'receipts',
  timestamps: true,
  paranoid: true, // Soft delete
  indexes: [
    {
      unique: true,
      fields: ['businessId', 'sequenceNumber'],
      name: 'receipts_business_sequence_unique'
    },
    {
      unique: true,
      fields: ['receiptNumber'],
      name: 'receipts_number_unique'
    },
    {
      fields: ['businessId', 'serviceDate']
    },
    {
      fields: ['specialistId', 'serviceDate']
    },
    {
      fields: ['appointmentId']
    },
    {
      fields: ['paymentReference']
    }
  ]
});

/**
 * Método estático para generar el siguiente número de recibo
 */
Receipt.generateReceiptNumber = async function(businessId) {
  const { Business } = require('./index');
  
  // Obtener configuraciones del negocio
  const business = await Business.findByPk(businessId);
  if (!business) {
    throw new Error('Negocio no encontrado');
  }
  
  const settings = business.settings || {};
  const receiptSettings = settings.numbering?.receipts || {
    initialNumber: 1,
    currentNumber: 1,
    prefix: 'REC',
    format: 'REC-{YEAR}-{NUMBER}',
    padLength: 5,
    resetYearly: true
  };
  
  const currentYear = new Date().getFullYear();
  
  // Determinar el número base para buscar
  let baseCondition = { businessId };
  if (receiptSettings.resetYearly) {
    baseCondition.createdAt = {
      [Op.gte]: new Date(`${currentYear}-01-01`),
      [Op.lt]: new Date(`${currentYear + 1}-01-01`)
    };
  }
  
  // Buscar el último número de secuencia
  const lastReceipt = await Receipt.findOne({
    where: baseCondition,
    order: [['sequenceNumber', 'DESC']]
  });
  
  // Calcular siguiente número
  let nextSequence;
  if (lastReceipt) {
    nextSequence = lastReceipt.sequenceNumber + 1;
  } else {
    // Si es el primer recibo, usar el número inicial configurado
    nextSequence = receiptSettings.initialNumber || 1;
  }
  
  // Generar número de recibo según formato configurado
  const receiptNumber = receiptSettings.format
    .replace('{YEAR}', currentYear.toString())
    .replace('{PREFIX}', receiptSettings.prefix || 'REC')
    .replace('{NUMBER}', nextSequence.toString().padStart(receiptSettings.padLength || 5, '0'));
  
  // Actualizar currentNumber en configuraciones del negocio
  const updatedSettings = {
    ...settings,
    numbering: {
      ...settings.numbering,
      receipts: {
        ...receiptSettings,
        currentNumber: nextSequence
      }
    }
  };
  
  await business.update({ settings: updatedSettings });
  
  return {
    receiptNumber,
    sequenceNumber: nextSequence
  };
};

/**
 * Método estático para crear un recibo desde una cita
 */
Receipt.createFromAppointment = async function(appointmentData, paymentData, options = {}) {
  const transaction = options.transaction;
  
  try {
    // Generar número de recibo
    const { receiptNumber, sequenceNumber } = await Receipt.generateReceiptNumber(
      appointmentData.businessId
    );
    
    // Preparar datos del recibo
    const receiptData = {
      receiptNumber,
      sequenceNumber,
      businessId: appointmentData.businessId,
      appointmentId: appointmentData.id,
      specialistId: appointmentData.specialistId,
      userId: appointmentData.userId,
      
      // Información del especialista
      specialistName: appointmentData.specialist?.name || 'N/A',
      specialistCode: appointmentData.specialist?.code || null,
      
      // Información del cliente
      clientName: appointmentData.user?.name || 'N/A',
      clientPhone: appointmentData.user?.phone || null,
      clientEmail: appointmentData.user?.email || null,
      
      // Fechas
      serviceDate: appointmentData.date,
      serviceTime: appointmentData.time,
      issueDate: new Date(),
      
      // Información del servicio
      serviceName: appointmentData.service?.name || 'Servicio',
      serviceDescription: appointmentData.notes || null,
      
      // Información financiera
      subtotal: appointmentData.baseAmount || paymentData.amount,
      tax: appointmentData.tax || 0,
      discount: appointmentData.discount || 0,
      tip: appointmentData.tip || 0,
      totalAmount: appointmentData.finalAmount || paymentData.amount,
      
      // Información del pago
      paymentMethod: paymentData.method || 'WOMPI',
      paymentReference: paymentData.transactionId || paymentData.reference,
      paymentStatus: 'PAID',
      
      // Metadatos
      metadata: {
        appointmentServices: appointmentData.services || [],
        appliedRules: appointmentData.appliedRules || [],
        commissionData: appointmentData.commissionData || null,
        paymentData: paymentData
      },
      
      createdBy: options.createdBy || appointmentData.specialistId
    };
    
    const receipt = await Receipt.create(receiptData, { transaction });
    
    return receipt;
  } catch (error) {
    console.error('Error creating receipt from appointment:', error);
    throw error;
  }
};

/**
 * Método para marcar como enviado por email
 */
Receipt.prototype.markSentViaEmail = async function() {
  return await this.update({
    sentViaEmail: true,
    emailSentAt: new Date()
  });
};

/**
 * Método para marcar como enviado por WhatsApp
 */
Receipt.prototype.markSentViaWhatsApp = async function() {
  return await this.update({
    sentViaWhatsApp: true,
    whatsAppSentAt: new Date()
  });
};

/**
 * Método para obtener resumen del recibo
 */
Receipt.prototype.getSummary = function() {
  return {
    receiptNumber: this.receiptNumber,
    businessId: this.businessId,
    specialistName: this.specialistName,
    clientName: this.clientName,
    serviceDate: this.serviceDate,
    serviceTime: this.serviceTime,
    serviceName: this.serviceName,
    totalAmount: this.totalAmount,
    paymentMethod: this.paymentMethod,
    status: this.status
  };
};

module.exports = Receipt;