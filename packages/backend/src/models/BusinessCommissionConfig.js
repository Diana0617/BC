const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BusinessCommissionConfig = sequelize.define('BusinessCommissionConfig', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'businesses',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Negocio al que pertenece esta configuración'
  },
  
  // Configuración general de comisiones
  commissionsEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '¿El negocio maneja comisiones para especialistas?'
  },
  calculationType: {
    type: DataTypes.ENUM('GENERAL', 'POR_SERVICIO', 'MIXTO'),
    allowNull: false,
    defaultValue: 'POR_SERVICIO',
    
  },
  generalPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 50.00,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Porcentaje general de comisión para especialistas (usado en GENERAL o MIXTO)'
  },
  
  // Metadatos
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales sobre la configuración de comisiones'
  }
}, {
  tableName: 'business_commission_configs',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId'],
      unique: true
    }
  ]
});

module.exports = BusinessCommissionConfig;
