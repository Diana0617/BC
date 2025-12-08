const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * BusinessWompiPaymentConfig Model
 * 
 * Almacena la configuración de Wompi para que cada Business pueda recibir
 * pagos de sus clientes por turnos online.
 * 
 * IMPORTANTE: Completamente separado del sistema de pagos de suscripción de BC.
 * Este modelo es para que los CLIENTES paguen a los NEGOCIOS, no para que
 * los NEGOCIOS paguen a BC.
 * 
 * Características:
 * - Credenciales separadas para sandbox (test) y producción
 * - Claves privadas y secretos encriptados en BD
 * - Toggle entre modo test/producción
 * - Estado de verificación de credenciales
 * - Webhook URL único por negocio
 */

const BusinessWompiPaymentConfig = sequelize.define('BusinessWompiPaymentConfig', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'business_id',
    references: {
      model: 'businesses',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },

  // ========================================
  // CREDENCIALES DE PRODUCCIÓN
  // ========================================
  
  prodPublicKey: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'prod_public_key',
    comment: 'Wompi public key for production (pub_prod_...)'
  },
  
  prodPrivateKeyEncrypted: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'prod_private_key_encrypted',
    comment: 'Encrypted Wompi private key for production (prv_prod_...)'
  },
  
  prodIntegritySecretEncrypted: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'prod_integrity_secret_encrypted',
    comment: 'Encrypted Wompi integrity secret for production webhooks'
  },

  // ========================================
  // CREDENCIALES DE SANDBOX (TEST)
  // ========================================
  
  testPublicKey: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'test_public_key',
    comment: 'Wompi public key for sandbox/test (pub_test_...)'
  },
  
  testPrivateKeyEncrypted: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'test_private_key_encrypted',
    comment: 'Encrypted Wompi private key for sandbox/test (prv_test_...)'
  },
  
  testIntegritySecretEncrypted: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'test_integrity_secret_encrypted',
    comment: 'Encrypted Wompi integrity secret for sandbox webhooks'
  },

  // ========================================
  // CONFIGURACIÓN Y ESTADO
  // ========================================
  
  isTestMode: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_test_mode',
    comment: 'true = usando credenciales de test, false = usando credenciales de producción'
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_active',
    comment: 'true = sistema de pagos habilitado para este negocio'
  },
  
  webhookUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'webhook_url',
    comment: 'URL completa del webhook para este negocio: /api/webhooks/wompi/payments/:businessId'
  },

  // ========================================
  // VERIFICACIÓN DE CREDENCIALES
  // ========================================
  
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'verified_at',
    comment: 'Última vez que se verificaron las credenciales contra la API de Wompi'
  },
  
  verificationStatus: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'pending',
    field: 'verification_status',
    validate: {
      isIn: [['pending', 'verified', 'failed', 'expired']]
    },
    comment: 'Estado de verificación: pending | verified | failed | expired'
  },
  
  verificationError: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'verification_error',
    comment: 'Mensaje de error si la verificación falla'
  },

  // ========================================
  // METADATA
  // ========================================
  
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'business_wompi_payment_configs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['business_id']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['verification_status']
    }
  ]
});

// ========================================
// ASSOCIATIONS
// ========================================

BusinessWompiPaymentConfig.associate = (models) => {
  BusinessWompiPaymentConfig.belongsTo(models.Business, {
    foreignKey: 'businessId',
    as: 'business'
  });
};

// ========================================
// INSTANCE METHODS
// ========================================

/**
 * Obtiene las credenciales activas según el modo (test o producción)
 * @returns {Object} Objeto con publicKey, privateKeyEncrypted, integritySecretEncrypted
 */
BusinessWompiPaymentConfig.prototype.getActiveCredentials = function() {
  if (this.isTestMode) {
    return {
      publicKey: this.testPublicKey,
      privateKeyEncrypted: this.testPrivateKeyEncrypted,
      integritySecretEncrypted: this.testIntegritySecretEncrypted,
      mode: 'test'
    };
  } else {
    return {
      publicKey: this.prodPublicKey,
      privateKeyEncrypted: this.prodPrivateKeyEncrypted,
      integritySecretEncrypted: this.prodIntegritySecretEncrypted,
      mode: 'production'
    };
  }
};

/**
 * Verifica si tiene credenciales configuradas para el modo actual
 * @returns {boolean}
 */
BusinessWompiPaymentConfig.prototype.hasCredentialsForCurrentMode = function() {
  const credentials = this.getActiveCredentials();
  return !!(credentials.publicKey && credentials.privateKeyEncrypted && credentials.integritySecretEncrypted);
};

/**
 * Verifica si está listo para procesar pagos
 * @returns {boolean}
 */
BusinessWompiPaymentConfig.prototype.isReadyForPayments = function() {
  return this.isActive && 
         this.verificationStatus === 'verified' && 
         this.hasCredentialsForCurrentMode();
};

module.exports = BusinessWompiPaymentConfig;
