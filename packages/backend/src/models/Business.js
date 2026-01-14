const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Business = sequelize.define('Business', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  logo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
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
  country: {
    type: DataTypes.STRING,
    allowNull: true
  },
  zipCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  taxId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  subdomain: {
    type: DataTypes.STRING,
    allowNull: true, // Opcional por ahora, se activará en producción
    unique: true,    // Preparado para unicidad global
    validate: {
      is: /^[a-z0-9-]+$/i, // Solo letras, números y guiones
      len: [3, 30],        // Entre 3 y 30 caracteres
      notIn: ['www', 'api', 'admin', 'app', 'mail', 'ftp', 'test', 'dev', 'staging'] // Subdominios reservados
    }
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'TRIAL'),
    allowNull: false,
    defaultValue: 'TRIAL'
  },
  timezone: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'America/Bogota'
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'COP'
  },
  language: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'es'
  },
  subscriptionStartDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  subscriptionEndDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  trialEndDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  dataRetentionUntil: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha hasta la cual se mantendrán los datos del negocio después de la expiración de suscripción (30 días después del último vencimiento)'
  },
  isLifetime: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Business de desarrollo/testing con acceso ilimitado sin restricciones de tiempo'
  },
  bypassSubscriptionChecks: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Omite todas las validaciones de suscripción (para testing y desarrollo)'
  },
  currentPlanId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'subscription_plans',
      key: 'id'
    }
  },
  settings: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'businesses',
  timestamps: true,
  scopes: {
    active: {
      where: {
        status: ['ACTIVE', 'TRIAL']
      }
    }
  }
});

module.exports = Business;