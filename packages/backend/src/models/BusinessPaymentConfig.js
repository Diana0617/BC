const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BusinessPaymentConfig = sequelize.define('BusinessPaymentConfig', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true, // Un negocio solo puede tener una configuración de pago activa
    references: {
      model: 'businesses',
      key: 'id'
    }
  },
  provider: {
    type: DataTypes.ENUM('WOMPI', 'STRIPE', 'PAYPAL', 'PAYULATAM', 'MERCADOPAGO'),
    allowNull: false,
    defaultValue: 'WOMPI',
    comment: 'Proveedor de pagos principal'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si la configuración está activa y operativa'
  },
  testMode: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Si está en modo de pruebas o producción'
  },
  // Configuración de Wompi
  wompiConfig: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Configuración específica de Wompi',
    defaultValue: {
      publicKey: null,
      privateKey: null,
      publicKeyTest: null,
      privateKeyTest: null,
      webhookSecret: null,
      currency: 'COP',
      acceptedMethods: ['CARD', 'NEQUI', 'PSE'],
      webhookUrl: null,
      returnUrl: null,
      cancelUrl: null,
      integritySecret: null
    }
  },
  // Configuración de Stripe
  stripeConfig: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Configuración específica de Stripe',
    defaultValue: {
      publicKey: null,
      secretKey: null,
      webhookSecret: null,
      currency: 'usd',
      acceptedMethods: ['card', 'ideal', 'sepa_debit'],
      webhookUrl: null,
      returnUrl: null,
      cancelUrl: null
    }
  },
  // Configuración de PayPal
  paypalConfig: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Configuración específica de PayPal',
    defaultValue: {
      clientId: null,
      clientSecret: null,
      webhookId: null,
      currency: 'USD',
      environment: 'sandbox', // sandbox o live
      webhookUrl: null,
      returnUrl: null,
      cancelUrl: null
    }
  },
  // URLs de configuración
  webhookUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL del webhook para este negocio específico'
  },
  returnUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL de retorno después del pago exitoso'
  },
  cancelUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL de retorno después de cancelar el pago'
  },
  // Configuración de comisiones
  commissionSettings: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      platformCommissionRate: 5.0, // Porcentaje que se queda la plataforma
      paymentGatewayRate: 2.9, // Porcentaje del gateway de pago
      fixedFee: 900, // Tarifa fija en centavos
      currency: 'COP'
    },
    comment: 'Configuración de comisiones y tarifas'
  },
  // Configuración de depósitos y anticipos
  depositSettings: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      requireDeposit: false,
      depositPercentage: 50,
      depositMinAmount: 10000, // En centavos
      allowPartialPayments: true,
      autoRefundCancellations: false
    },
    comment: 'Configuración de depósitos y anticipos'
  },
  // Métodos de pago habilitados para este negocio
  enabledMethods: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      creditCard: true,
      debitCard: true,
      pse: true,
      nequi: false,
      daviplata: false,
      bancolombia: false,
      cash: true,
      transfer: false
    },
    comment: 'Métodos de pago habilitados'
  },
  // Configuración de facturación
  invoiceSettings: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      autoGenerateInvoice: true,
      invoicePrefix: 'FAC',
      invoiceNumbering: 'sequential', // sequential, random, custom
      taxRate: 19, // IVA en Colombia
      includeTax: true,
      invoiceTemplate: 'default'
    },
    comment: 'Configuración de facturación'
  },
  // Configuración de notificaciones de pago
  notificationSettings: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      notifyPaymentSuccess: true,
      notifyPaymentFailure: true,
      notifyRefunds: true,
      notifyChargebacks: true,
      emailTemplate: 'default',
      smsNotifications: false
    },
    comment: 'Configuración de notificaciones de pago'
  },
  // Configuración de seguridad
  securitySettings: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      require3DSecure: false,
      fraudDetection: true,
      ipRestrictions: [],
      maxDailyAmount: 5000000, // En centavos
      maxTransactionAmount: 1000000, // En centavos
      allowInternationalCards: true
    },
    comment: 'Configuración de seguridad'
  },
  // Estado de verificación
  verificationStatus: {
    type: DataTypes.ENUM('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'),
    allowNull: false,
    defaultValue: 'PENDING',
    comment: 'Estado de verificación de la configuración'
  },
  verificationDetails: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Detalles del proceso de verificación'
  },
  lastTestDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Última fecha de prueba de la configuración'
  },
  lastTestResult: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Resultado de la última prueba'
  },
  activatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de activación de la configuración'
  },
  activatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que activó la configuración'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas administrativas'
  }
}, {
  tableName: 'business_payment_configs',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['businessId']
    },
    {
      fields: ['provider']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['testMode']
    },
    {
      fields: ['verificationStatus']
    }
  ]
});

module.exports = BusinessPaymentConfig;