const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * BusinessRule - Relación entre Business y RuleTemplate con valores personalizados
 * 
 * Esta es una versión simplificada que reemplaza BusinessRuleAssignment
 * y almacena los overrides específicos de cada negocio para las reglas.
 */
const BusinessRule = sequelize.define('BusinessRule', {
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
    comment: 'ID del negocio que usa esta regla'
  },
  ruleTemplateId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'rule_templates',
      key: 'id'
    },
    comment: 'ID del template de regla'
  },
  customValue: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Valor personalizado del negocio. Si es NULL, usar defaultValue del template'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Si esta regla está activa para el negocio'
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que realizó la última modificación'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales sobre la configuración de esta regla'
  },
  appliedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha cuando se aplicó por primera vez esta regla'
  }
}, {
  tableName: 'business_rules',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId']
    },
    {
      fields: ['ruleTemplateId']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['businessId', 'ruleTemplateId'],
      unique: true,
      name: 'unique_business_rule_template'
    }
  ]
});

module.exports = BusinessRule;