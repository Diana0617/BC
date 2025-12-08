const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ConsentTemplate = sequelize.define('ConsentTemplate', {
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
    onDelete: 'CASCADE',
    comment: 'Negocio al que pertenece este template'
  },
  
  // Información del template
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [3, 100]
    },
    comment: 'Nombre del template (ej: "Consentimiento Botox")'
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Código único del template (ej: "CONSENT_BOTOX_V1")'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'HTML del consentimiento con placeholders automáticos: {{negocio_nombre}}, {{cliente_nombre}}, {{fecha_firma}}, etc.'
  },
  version: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '1.0.0',
    comment: 'Versión del template para control de cambios'
  },
  
  // Configuración de campos editables que debe completar el cliente
  editableFields: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Campos que el cliente debe completar al firmar: [{"name": "alergias", "label": "Alergias", "type": "textarea", "required": true}, {"name": "medicamentos", "label": "Medicamentos Actuales", "type": "textarea", "required": false}]'
  },
  
  // Configuración del PDF generado
  pdfConfig: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      includeLogo: true,
      includeBusinessName: true,
      includeDate: true,
      fontSize: 12,
      fontFamily: 'Arial',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    },
    comment: 'Configuración de cómo se genera el PDF'
  },
  
  // Categorización
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Categoría del consentimiento (ej: ESTETICO, MEDICO, DEPILACION, TATUAJE)'
  },
  
  // Estado
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Si este template está activo y puede ser usado'
  },
  
  // Metadatos
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Metadatos adicionales (ej: idioma, autor, notas internas)'
  }
}, {
  tableName: 'consent_templates',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId', 'code'],
      unique: true,
      name: 'unique_business_consent_code'
    },
    {
      fields: ['businessId', 'isActive']
    },
    {
      fields: ['businessId', 'category']
    },
    {
      fields: ['code']
    }
  ]
});

module.exports = ConsentTemplate;
