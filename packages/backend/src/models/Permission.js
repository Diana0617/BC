const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Clave única del permiso, ej: appointments.create, payments.view'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nombre legible del permiso'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción detallada del permiso'
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Categoría del permiso: appointments, payments, clients, etc.'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
    comment: 'Si el permiso está activo y disponible para asignar'
  }
}, {
  tableName: 'permissions',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['key'],
      unique: true
    },
    {
      fields: ['category']
    }
  ]
});

module.exports = Permission;
