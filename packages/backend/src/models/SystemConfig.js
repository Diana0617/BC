const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Configuración de Sistema
 * Almacena configuraciones globales como modo mantenimiento
 */
const SystemConfig = sequelize.define('SystemConfig', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  key: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    comment: 'Clave única de configuración (ej: maintenance_mode, system_version)'
  },
  value: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
    comment: 'Valor de la configuración en formato JSON'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción de para qué sirve esta configuración'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que realizó la última actualización'
  }
}, {
  tableName: 'system_config',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['key']
    }
  ]
});

module.exports = SystemConfig;
