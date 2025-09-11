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
  allowCloseWithoutPayment: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  enableCancellation: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  autoRefundOnCancel: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  createVoucherOnCancel: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  allowCloseWithoutConsent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  cancellationPolicy: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancellationTimeLimit: {
    type: DataTypes.INTEGER, // horas antes del turno
    allowNull: false,
    defaultValue: 24
  },
  allowReschedule: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  rescheduleTimeLimit: {
    type: DataTypes.INTEGER, // horas antes del turno
    allowNull: false,
    defaultValue: 4
  },
  requireDepositForBooking: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
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
    allowNull: false,
    defaultValue: true
  },
  maxAdvanceBookingDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
      unique: true,
      fields: ['businessId']
    }
  ]
});

module.exports = BusinessRules;