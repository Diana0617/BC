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
    }
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
    type: DataTypes.ENUM('PENDING', 'PROCESSING', 'ATTEMPT_FAILED', 'PAYMENT_INCOMPLETE', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'APPROVED', 'DECLINED', 'ERROR', 'VOIDED', 'THREEDS_PENDING', 'THREEDS_CHALLENGE', 'THREEDS_COMPLETED'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  paymentMethod: {
    type: DataTypes.ENUM('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'PSE', 'CASH', 'CHECK', 'DIGITAL_WALLET', 'MANUAL', 'WOMPI_CARD', 'WOMPI_3DS', 'WOMPI_3RI'),
    allowNull: false
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'ID de transaccion del proveedor de pagos'
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
    comment: 'Public ID del comprobante en Cloudinary para gestion'
  },
  receiptMetadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Metadatos del archivo'
  },
  receiptUploadedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que subio el comprobante'
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
    comment: 'Comision cobrada por el proveedor de pagos'
  },
  netAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Monto neto recibido despues de comisiones'
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
    comment: 'Razon del fallo si status es FAILED'
  },
  refundReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Razon del reembolso si aplica'
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
  },
  
  // === TOKENIZACIÓN Y PAGOS RECURRENTES (3DS/3RI) ===
  paymentSourceToken: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Token de la fuente de pago para cobros recurrentes (3RI)'
  },
  isThreeDsEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si la fuente de pago fue creada con 3D Secure'
  },
  threeDsAuthData: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Datos de autenticacion 3DS completos'
  },
  
  // === CAMPOS ESPECÍFICOS 3DS v2 ===
  browserInfo: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Informacion del navegador requerida para 3DS v2'
  },
  threeDsAuthType: {
    type: DataTypes.ENUM('no_challenge_success', 'challenge_denied', 'challenge_v2', 'supported_version_error', 'authentication_error'),
    allowNull: true
  },
  threeDsMethodData: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'HTML iframe codificado para challenge 3DS'
  },
  currentStep: {
    type: DataTypes.ENUM('SUPPORTED_VERSION', 'AUTHENTICATION', 'CHALLENGE'),
    allowNull: true
  },
  currentStepStatus: {
    type: DataTypes.ENUM('PENDING', 'COMPLETED', 'Non-Authenticated', 'ERROR'),
    allowNull: true
  },
  isRecurringPayment: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si es un pago recurrente automático'
  },
  originalPaymentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'subscription_payments',
      key: 'id'
    },
    comment: 'Referencia al pago original que estableció el token 3DS'
  },
  recurringType: {
    type: DataTypes.ENUM('INITIAL', 'RECURRING', 'MANUAL'),
    allowNull: false,
    defaultValue: 'MANUAL'
  },
  autoRenewalEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si está habilitada la renovación automática'
  },
  
  // === GESTIÓN DE REINTENTOS ===
  paymentAttempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Número de intentos de pago realizados'
  },
  lastAttemptAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha del último intento de pago'
  },
  maxAttempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3,
    comment: 'Máximo número de intentos permitidos'
  },
  attemptHistory: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Historial de intentos con detalles de errores'
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
    attemptFailed: {
      where: {
        status: 'ATTEMPT_FAILED'
      }
    },
    canRetry: {
      where: {
        status: ['PENDING', 'ATTEMPT_FAILED'],
        paymentAttempts: {
          [require('sequelize').Op.lt]: require('sequelize').col('maxAttempts')
        }
      }
    },
    expired: {
      where: {
        status: ['PENDING', 'ATTEMPT_FAILED'],
        createdAt: {
          [require('sequelize').Op.lt]: new Date(Date.now() - (48 * 60 * 60 * 1000)) // 48 horas
        }
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

// === MÉTODOS DE INSTANCIA PARA MANEJO DE INTENTOS FALLIDOS ===

/**
 * Registra un intento fallido de pago
 * @param {string} reason - Razón del fallo
 * @param {Object} errorDetails - Detalles adicionales del error
 */
SubscriptionPayment.prototype.recordFailedAttempt = async function(reason, errorDetails = {}) {
  const currentHistory = Array.isArray(this.attemptHistory) ? this.attemptHistory : [];
  
  const attemptRecord = {
    attemptNumber: this.paymentAttempts + 1,
    timestamp: new Date().toISOString(),
    reason: reason,
    errorDetails: errorDetails,
    status: 'FAILED'
  };

  currentHistory.push(attemptRecord);

  const updateData = {
    paymentAttempts: this.paymentAttempts + 1,
    lastAttemptAt: new Date(),
    attemptHistory: currentHistory,
    failureReason: reason
  };

  // Si alcanzamos el máximo de intentos, marcar como FAILED definitivamente
  if (this.paymentAttempts + 1 >= this.maxAttempts) {
    updateData.status = 'FAILED';
  } else {
    updateData.status = 'ATTEMPT_FAILED';
  }

  await this.update(updateData);
  return this;
};

/**
 * Verifica si el pago puede ser reintentado
 * @returns {boolean}
 */
SubscriptionPayment.prototype.canRetry = function() {
  return this.paymentAttempts < this.maxAttempts && 
         ['PENDING', 'ATTEMPT_FAILED'].includes(this.status);
};

/**
 * Obtiene el número de intentos restantes
 * @returns {number}
 */
SubscriptionPayment.prototype.getRemainingAttempts = function() {
  return Math.max(0, this.maxAttempts - this.paymentAttempts);
};

/**
 * Marca el pago como exitoso y limpia el historial de intentos fallidos
 * @param {string} transactionId - ID de la transacción exitosa
 * @param {Object} additionalData - Datos adicionales del pago exitoso
 */
SubscriptionPayment.prototype.markAsSuccessful = async function(transactionId, additionalData = {}) {
  const currentHistory = Array.isArray(this.attemptHistory) ? this.attemptHistory : [];
  
  const successRecord = {
    attemptNumber: this.paymentAttempts + 1,
    timestamp: new Date().toISOString(),
    status: 'SUCCESS',
    transactionId: transactionId,
    ...additionalData
  };

  currentHistory.push(successRecord);

  await this.update({
    status: 'COMPLETED',
    transactionId: transactionId,
    paidAt: new Date(),
    attemptHistory: currentHistory,
    failureReason: null // Limpiar la razón de fallo
  });

  return this;
};

/**
 * Obtiene estadísticas de intentos de pago
 * @returns {Object}
 */
SubscriptionPayment.prototype.getAttemptStats = function() {
  const history = Array.isArray(this.attemptHistory) ? this.attemptHistory : [];
  
  return {
    totalAttempts: this.paymentAttempts,
    maxAttempts: this.maxAttempts,
    remainingAttempts: this.getRemainingAttempts(),
    canRetry: this.canRetry(),
    lastAttemptAt: this.lastAttemptAt,
    failedAttempts: history.filter(h => h.status === 'FAILED').length,
    attemptHistory: history,
    currentStatus: this.status
  };
};

// === MÉTODOS ADICIONALES PARA GESTIÓN DE INTENTOS ===

/**
 * Marca un intento como fallido y actualiza el historial
 * @param {string} reason - Razón del fallo
 * @param {Object} errorDetails - Detalles adicionales del error
 */
SubscriptionPayment.prototype.markAttemptAsFailed = async function(reason, errorDetails = {}) {
  const attemptData = {
    attemptNumber: this.paymentAttempts,
    status: 'FAILED',
    timestamp: new Date(),
    reason: reason,
    errorDetails: errorDetails
  };

  // Actualizar historial
  const history = Array.isArray(this.attemptHistory) ? this.attemptHistory : [];
  history.push(attemptData);

  // Actualizar campos
  this.attemptHistory = history;
  this.lastAttemptAt = new Date();
  this.failureReason = reason;

  // Determinar el nuevo status
  if (this.paymentAttempts >= this.maxAttempts) {
    this.status = 'FAILED';
  } else {
    this.status = 'ATTEMPT_FAILED';
  }

  await this.save();
  return this;
};

/**
 * Prepara para un nuevo intento de pago
 */
SubscriptionPayment.prototype.prepareForRetry = async function() {
  if (!this.canRetry()) {
    throw new Error('No se pueden realizar más intentos de pago');
  }

  this.paymentAttempts += 1;
  this.status = 'PENDING';
  
  await this.save();
  return this;
};

/**
 * Marca el pago como exitoso y registra el intento en el historial
 * @param {Object} paymentData - Datos del pago exitoso
 */
SubscriptionPayment.prototype.markAsSuccessful = async function(paymentData = {}) {
  const attemptData = {
    attemptNumber: this.paymentAttempts,
    status: 'COMPLETED',
    timestamp: new Date(),
    paymentData: paymentData
  };

  // Actualizar historial
  const history = Array.isArray(this.attemptHistory) ? this.attemptHistory : [];
  history.push(attemptData);

  // Actualizar campos
  this.attemptHistory = history;
  this.lastAttemptAt = new Date();
  this.status = 'COMPLETED';
  this.paidAt = new Date();

  await this.save();
  return this;
};

/**
 * Obtiene estadísticas de los intentos de pago
 */
SubscriptionPayment.prototype.getRetryStatistics = function() {
  const history = Array.isArray(this.attemptHistory) ? this.attemptHistory : [];
  
  return {
    totalAttempts: this.paymentAttempts,
    maxAttempts: this.maxAttempts,
    remainingAttempts: this.getRemainingAttempts(),
    canRetry: this.canRetry(),
    lastAttemptAt: this.lastAttemptAt,
    failedAttempts: history.filter(h => h.status === 'FAILED').length,
    attemptHistory: history,
    currentStatus: this.status
  };
};

module.exports = SubscriptionPayment;