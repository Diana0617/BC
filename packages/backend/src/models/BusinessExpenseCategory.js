const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Categorías de gastos personalizadas por negocio
 * Cada negocio puede crear sus propias categorías y definir si requieren comprobante
 */
const BusinessExpenseCategory = sequelize.define('BusinessExpenseCategory', {
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
    },
    comment: 'Negocio al que pertenece la categoría'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nombre de la categoría (ej: Arriendos, Servicios públicos, Nómina)'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Descripción de la categoría'
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: true,
    defaultValue: '#6B7280',
    comment: 'Color hex para identificar la categoría en gráficos'
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Nombre del ícono (heroicons, material-icons, etc.)'
  },
  requiresReceipt: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si es true, los gastos de esta categoría requieren comprobante obligatorio'
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si los gastos de esta categoría suelen ser recurrentes'
  },
  defaultAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Monto por defecto para gastos recurrentes (opcional)'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Categoría activa/inactiva'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Orden de visualización'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que creó la categoría'
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que actualizó la categoría'
  }
}, {
  tableName: 'business_expense_categories',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId', 'isActive']
    },
    {
      fields: ['businessId', 'name'],
      unique: true
    }
  ]
});

module.exports = BusinessExpenseCategory;
