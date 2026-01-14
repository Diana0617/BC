const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: true, // Permitir NULL temporalmente para clientes existentes
    references: {
      model: 'businesses',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [10, 15]
    }
  },
  phoneSecondary: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'),
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  zipCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emergencyContact: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  medicalInfo: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      allergies: [],
      medications: [],
      conditions: [],
      notes: ''
    }
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'BLOCKED'),
    allowNull: false,
    defaultValue: 'ACTIVE'
  },
  preferences: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      notifications: {
        email: true,
        sms: false,
        whatsapp: false
      },
      language: 'es',
      timezone: 'America/Bogota'
    }
  },
  tags: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  source: {
    type: DataTypes.STRING,
    allowNull: true // referrals, social media, etc.
  },
  lastAppointment: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'clients',
  timestamps: true,
  scopes: {
    active: {
      where: {
        status: 'ACTIVE'
      }
    }
  }
});

module.exports = Client;