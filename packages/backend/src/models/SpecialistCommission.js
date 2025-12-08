const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SpecialistCommission = sequelize.define('SpecialistCommission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  specialistId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    }
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: true, // Null = configuración general, no null = servicio específico
    references: {
      model: 'services',
      key: 'id'
    }
  },
  commissionType: {
    type: DataTypes.ENUM('PERCENTAGE', 'FIXED_AMOUNT'),
    allowNull: false,
    defaultValue: 'PERCENTAGE'
  },
  commissionValue: {
    type: DataTypes.DECIMAL(5, 2), // Para porcentaje (ej: 60.00) o monto fijo
    allowNull: false,
    validate: {
      min: 0,
      max: function(value) {
        if (this.commissionType === 'PERCENTAGE') {
          return value <= 100;
        }
        return true;
      }
    }
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'COP'
  },
  paymentFrequency: {
    type: DataTypes.ENUM('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'ON_DEMAND'),
    allowNull: false,
    defaultValue: 'BIWEEKLY'
  },
  paymentDay: {
    type: DataTypes.INTEGER, // Día del mes o semana según frecuencia
    allowNull: true,
    validate: {
      min: 1,
      max: 31
    }
  },
  minimumAmount: {
    type: DataTypes.DECIMAL(10, 2), // Monto mínimo para generar pago
    allowNull: false,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  effectiveFrom: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  effectiveTo: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'specialist_commissions',
  timestamps: true,
  indexes: [
    {
      fields: ['specialistId']
    },
    {
      fields: ['businessId']
    },
    {
      fields: ['serviceId']
    },
    {
      fields: ['isActive']
    },
    {
      unique: true,
      fields: ['specialistId', 'serviceId', 'effectiveFrom'],
      name: 'unique_specialist_service_commission'
    }
  ]
});

module.exports = SpecialistCommission;