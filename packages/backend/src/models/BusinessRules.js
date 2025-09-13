const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BusinessRules = sequelize.define('BusinessRules', {
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
  ruleKey: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ruleValue: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  category: {
    type: DataTypes.ENUM(
      'PAYMENT_POLICY',
      'CANCELLATION_POLICY', 
      'APPOINTMENT_RULES',
      'NOTIFICATION_SETTINGS',
      'BUSINESS_HOURS',
      'SPECIALIST_RULES',
      'GENERAL'
    ),
    defaultValue: 'GENERAL'
  },
  // Nuevos campos para integración con plantillas
  ruleTemplateId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  ruleAssignmentId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  isFromTemplate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isCustomized: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  originalTemplateValue: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  customizationNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lastSyncedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  templateVersion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Campos legacy mantenidos para compatibilidad
  allowCloseWithoutPayment: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  enableCancellation: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  },
  autoRefundOnCancel: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  createVoucherOnCancel: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  allowCloseWithoutConsent: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  cancellationPolicy: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancellationTimeLimit: {
    type: DataTypes.INTEGER, // horas antes del turno
    allowNull: true,
    defaultValue: 24
  },
  allowReschedule: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  },
  rescheduleTimeLimit: {
    type: DataTypes.INTEGER, // horas antes del turno
    allowNull: true,
    defaultValue: 4
  },
  requireDepositForBooking: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  depositPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  allowOnlineBooking: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  },
  maxAdvanceBookingDays: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 30
  },
  workingHours: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      monday: { start: '09:00', end: '18:00', enabled: true },
      tuesday: { start: '09:00', end: '18:00', enabled: true },
      wednesday: { start: '09:00', end: '18:00', enabled: true },
      thursday: { start: '09:00', end: '18:00', enabled: true },
      friday: { start: '09:00', end: '18:00', enabled: true },
      saturday: { start: '09:00', end: '16:00', enabled: true },
      sunday: { start: '10:00', end: '14:00', enabled: false }
    }
  },
  notificationSettings: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      emailNotifications: true,
      smsNotifications: false,
      reminderHours: [24, 2],
      confirmationRequired: true
    }
  }
}, {
  tableName: 'business_rules',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId']
    },
    {
      fields: ['ruleKey']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['category']
    },
    {
      fields: ['ruleTemplateId']
    },
    {
      fields: ['ruleAssignmentId']
    },
    {
      fields: ['isFromTemplate']
    },
    {
      fields: ['isCustomized']
    },
    {
      unique: true,
      fields: ['businessId', 'ruleKey'],
      name: 'unique_business_rule'
    }
  ]
});

module.exports = BusinessRules;