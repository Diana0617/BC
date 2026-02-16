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
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    },
    comment: 'Negocio que emite el recibo'
  },
  
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: true, // Permitir null porque puede ser de venta o cita
    references: {
      model: 'appointments',
      key: 'id'
    },
    comment: 'Cita asociada al recibo'
  },
  
  saleId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'sales',
      key: 'id'
    },
    comment: 'Venta asociada al recibo'
  },
  
  specialistId: {
    type: DataTypes.UUID,
    allowNull: true, // Permitir null para ventas
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Especialista que realizó el servicio'
  },
  
  userId: {
    type: DataTypes.UUID,
    allowNull: true, // Nullable porque el cliente no es un user, solo guardamos datos desnormalizados
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que registró el pago (opcional, distinto del cliente)'
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
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
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
 * VERSION SIMPLIFICADA - Sin advisory locks
 */
Receipt.generateReceiptNumber = async function(businessId, transaction = null) {
  const { Business, sequelize } = require('./index');
  
  console.log('💯 [generateReceiptNumber v2] Iniciando generación para businessId:', businessId);
  
  // Obtener configuraciones del negocio
  const business = await Business.findByPk(businessId, { transaction });
  
  if (!business) {
    console.error('❌ [generateReceiptNumber v2] Negocio no encontrado');
    throw new Error('Negocio no encontrado');
  }
  
  console.log('✅ [generateReceiptNumber v2] Negocio encontrado:', business.name);
  
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
  
  // Buscar el último recibo para este negocio (en este año si resetYearly)
  let baseCondition = { businessId };
  if (receiptSettings.resetYearly) {
    baseCondition.createdAt = {
      [Op.gte]: new Date(`${currentYear}-01-01`),
      [Op.lt]: new Date(`${currentYear + 1}-01-01`)
    };
  }
  
  console.log('🔍 [generateReceiptNumber v2] Buscando último recibo...');
  const lastReceipt = await Receipt.findOne({
    where: baseCondition,
    order: [['sequenceNumber', 'DESC']],
    attributes: ['sequenceNumber', 'receiptNumber'],
    transaction
  });
  
  console.log('📊 [generateReceiptNumber v2] Último recibo:', lastReceipt ? lastReceipt.receiptNumber : 'ninguno');
  
  // Calcular siguiente número
  let nextSequence = lastReceipt ? (lastReceipt.sequenceNumber + 1) : (receiptSettings.initialNumber || 1);
  
  // Generar número de recibo
  const paddedNumber = nextSequence.toString().padStart(receiptSettings.padLength || 5, '0');
  let receiptNumber = receiptSettings.format
    .replace('{YEAR}', currentYear.toString())
    .replace('{PREFIX}', receiptSettings.prefix || 'REC')
    .replace('{NUMBER}', paddedNumber);
  
  console.log('🎯 [generateReceiptNumber v2] Número generado:', receiptNumber, 'sequence:', nextSequence);
  
  return {
    receiptNumber,
    sequenceNumber: nextSequence
  };
};

/**
 * Método estático para crear un recibo desde una cita
 * VERSION SIMPLIFICADA
 */
Receipt.createFromAppointment = async function(appointmentData, paymentData, options = {}) {
  const { sequelize } = require('../config/database');
  
  console.log('🧾 [createFromAppointment v2] INICIO');
  console.log('📋 [createFromAppointment v2] appointmentId:', appointmentData.id);
  console.log('💰 [createFromAppointment v2] payment:', paymentData.amount, paymentData.method);
  
  // Usar transacción para atomicidad
  return await sequelize.transaction(async (t) => {
    try {
      console.log('🔄 [createFromAppointment v2] Generando número...');
      
      // Generar número de recibo
      const { receiptNumber, sequenceNumber } = await Receipt.generateReceiptNumber(
        appointmentData.businessId,
        t
      );
      
      console.log('✅ [createFromAppointment v2] Número:', receiptNumber);
      
      // Preparar datos del recibo
      const receiptData = {
        receiptNumber,
        sequenceNumber,
        businessId: appointmentData.businessId,
        appointmentId: appointmentData.id,
        specialistId: appointmentData.specialistId,
        userId: options.createdBy || null,
        
        specialistName: appointmentData.specialist ? 
          `${appointmentData.specialist.firstName} ${appointmentData.specialist.lastName}` : 'N/A',
        specialistCode: appointmentData.specialist?.code || null,
        
        clientName: appointmentData.client ? 
          `${appointmentData.client.firstName} ${appointmentData.client.lastName}` : 'N/A',
        clientPhone: appointmentData.client?.phone || null,
        clientEmail: appointmentData.client?.email || null,
        
        serviceDate: appointmentData.startTime ? 
          new Date(appointmentData.startTime).toISOString().substring(0, 10) : 
          new Date().toISOString().substring(0, 10),
        serviceTime: appointmentData.startTime ? 
          new Date(appointmentData.startTime).toTimeString().substring(0, 5) : '00:00',
        issueDate: new Date(),
        
        serviceName: appointmentData.services && appointmentData.services.length > 0
          ? (appointmentData.services.length === 1 
             ? appointmentData.services[0].name 
             : `${appointmentData.services.length} servicios`)
          : (appointmentData.service?.name || 'Servicio'),
        serviceDescription: appointmentData.notes || null,
        
        subtotal: appointmentData.baseAmount || paymentData.amount,
        tax: appointmentData.tax || 0,
        discount: appointmentData.discount || 0,
        tip: appointmentData.tip || 0,
        totalAmount: appointmentData.finalAmount || paymentData.amount,
        
        paymentMethod: paymentData.method || 'CASH',
        paymentReference: paymentData.transactionId || paymentData.reference,
        paymentStatus: 'PAID',
        
        metadata: {
          appointmentServices: appointmentData.services || [],
          appliedRules: appointmentData.appliedRules || [],
          commissionData: appointmentData.commissionData || null,
          paymentData: paymentData
        },
        
        createdBy: options.createdBy || appointmentData.specialistId
      };
      
      console.log('💾 [createFromAppointment v2] Creando recibo...');
      console.log('📝 [createFromAppointment v2] receiptData keys:', Object.keys(receiptData));
      console.log('📝 [createFromAppointment v2] serviceDate:', receiptData.serviceDate, 'type:', typeof receiptData.serviceDate);
      console.log('📝 [createFromAppointment v2] paymentMethod:', receiptData.paymentMethod);
      console.log('📝 [createFromAppointment v2] metadata:', JSON.stringify(receiptData.metadata).substring(0, 100));
      
      try {
        const receipt = await Receipt.create(receiptData, { transaction: t });
        console.log('✅ [createFromAppointment v2] Recibo creado:', receipt.id);
        return receipt;
      } catch (createError) {
        console.error('💥 [createFromAppointment v2] Error en Receipt.create():');
        console.error('   Name:', createError.name);
        console.error('   Message:', createError.message);
        console.error('   SQL:', createError.sql);
        console.error('   Original error:', createError.original);
        throw createError;
      }
      
    } catch (transactionError) {
      console.error('❌❌❌ [createFromAppointment v2] ERROR EN TRANSACCIÓN ❌❌❌');
      console.error('Error name:', transactionError.name);
      console.error('Error message:', transactionError.message);
      console.error('Error code:', transactionError.original?.code);
      console.error('Error detail:', transactionError.original?.detail);
      console.error('Error constraint:', transactionError.original?.constraint);
      console.error('Error stack:', transactionError.stack);
      throw transactionError;
    }
  });
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
