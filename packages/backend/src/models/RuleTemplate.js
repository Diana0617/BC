const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * RuleTemplate - Define reglas globales que pueden ser aplicadas a negocios
 * 
 * Esta es una versión simplificada que reemplaza BusinessRuleTemplate
 * y define templates de reglas que pueden ser usados por múltiples negocios.
 */
const RuleTemplate = sequelize.define('RuleTemplate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 100]
    },
    comment: 'Identificador único de la regla (ej: PAYMENT_POLICY_STANDARD)'
  },
  type: {
    type: DataTypes.ENUM('BOOLEAN', 'STRING', 'NUMBER', 'JSON', 'CONFIGURATION'),
    allowNull: false,
    comment: 'Tipo de dato que almacena esta regla'
  },
  defaultValue: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Valor por defecto de la regla'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción detallada de qué hace esta regla'
  },
  category: {
    type: DataTypes.ENUM(
      'PAYMENT_POLICY',
      'CANCELLATION_POLICY', 
      'BOOKING_POLICY',
      'WORKING_HOURS',
      'NOTIFICATION_POLICY',
      'REFUND_POLICY',
      'SERVICE_POLICY',
      'APPOINTMENT',        // 👈 Nueva: Validaciones de completar citas
      'PAYMENT',            // 👈 Nueva: Validaciones de pago
      'TIME',               // 👈 Nueva: Validaciones de duración
      'GENERAL'
    ),
    allowNull: false,
    defaultValue: 'GENERAL',
    comment: 'Categoría funcional de la regla'
  },
  allowCustomization: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Si los negocios pueden personalizar esta regla'
  },
  version: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '1.0.0',
    comment: 'Versión de la regla para control de cambios'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Si la regla está disponible para uso'
  },
  validationRules: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Reglas de validación para valores personalizados'
  },
  examples: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Ejemplos de uso de la regla'
  },
  requiredModule: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'required_module',
    comment: 'Nombre del módulo requerido para usar esta regla (ej: facturacion_electronica, gestion_de_turnos)'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Usuario que creó la regla'
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Usuario que actualizó la regla por última vez'
  }
}, {
  tableName: 'rule_templates',
  timestamps: true,
  indexes: [
    {
      fields: ['key'],
      unique: true
    },
    {
      fields: ['category']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['type']
    }
  ]
});

// Definir asociaciones después de que el modelo esté definido
RuleTemplate.associate = function(models) {
  // Una regla template es creada por un usuario Owner
  RuleTemplate.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator',
    allowNull: true
  });
  
  // Una regla template es actualizada por un usuario
  RuleTemplate.belongsTo(models.User, {
    foreignKey: 'updatedBy', 
    as: 'updater',
    allowNull: true
  });
};

// Agregar índices únicos después de la definición
RuleTemplate.addIndex = async () => {
  try {
    await RuleTemplate.sequelize.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "rule_templates_key_unique" ON "rule_templates" ("key");'
    );
  } catch (error) {
    // Si el índice ya existe, no es un error
    if (!error.message.includes('already exists')) {
      console.warn('Warning creating unique index for rule_templates.key:', error.message);
    }
  }
};

module.exports = RuleTemplate;