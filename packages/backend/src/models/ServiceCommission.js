const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ServiceCommission = sequelize.define('ServiceCommission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'services',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Servicio al que aplica esta comisión'
  },
  
  // Configuración de comisión específica del servicio
  type: {
    type: DataTypes.ENUM('PERCENTAGE', 'FIXED'),
    allowNull: false,
    defaultValue: 'PERCENTAGE',
    
  },
  specialistPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 50.00,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Porcentaje de comisión para el especialista'
  },
  businessPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 50.00,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Porcentaje para el negocio (debe sumar 100 con specialistPercentage)'
  },
  fixedAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Monto fijo de comisión (usado cuando type = FIXED)'
  },
  
  // Metadatos
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales sobre esta comisión específica'
  }
}, {
  tableName: 'service_commissions',
  timestamps: true,
  indexes: [
    {
      fields: ['serviceId'],
      unique: true
    }
  ],
  hooks: {
    // Validar que los porcentajes sumen 100
    beforeValidate: (commission) => {
      if (commission.type === 'PERCENTAGE') {
        if (commission.specialistPercentage && commission.businessPercentage) {
          const sum = parseFloat(commission.specialistPercentage) + parseFloat(commission.businessPercentage);
          if (Math.abs(sum - 100) > 0.01) { // Tolerancia de 0.01 por decimales
            throw new Error('Los porcentajes deben sumar 100%');
          }
        } else if (commission.specialistPercentage) {
          // Auto-calcular businessPercentage
          commission.businessPercentage = 100 - parseFloat(commission.specialistPercentage);
        }
      }
    }
  }
});

module.exports = ServiceCommission;
