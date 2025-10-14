const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Service = sequelize.define('Service', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  duration: {
    type: DataTypes.INTEGER, // minutos
    allowNull: false,
    validate: {
      min: 1
    }
  },
  requiresConsent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si este servicio requiere consentimiento firmado del cliente'
  },
  consentTemplateId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'consent_templates',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'Template de consentimiento por defecto para este servicio'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^#[0-9A-F]{6}$/i
    }
  },
  preparationTime: {
    type: DataTypes.INTEGER, // minutos antes del servicio
    allowNull: false,
    defaultValue: 0
  },
  cleanupTime: {
    type: DataTypes.INTEGER, // minutos después del servicio
    allowNull: false,
    defaultValue: 0
  },
  maxConcurrent: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  requiresEquipment: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  skillsRequired: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  images: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  bookingSettings: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      onlineBookingEnabled: true,
      advanceBookingDays: 30,
      requiresApproval: false,
      allowWaitlist: true
    }
  },
  tags: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'services',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId', 'isActive']
    },
    {
      fields: ['businessId', 'category']
    }
  ]
});

module.exports = Service;