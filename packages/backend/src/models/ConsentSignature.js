const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ConsentSignature = sequelize.define('ConsentSignature', {
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
    comment: 'Negocio al que pertenece esta firma'
  },
  consentTemplateId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'consent_templates',
      key: 'id'
    },
    onDelete: 'RESTRICT',
    comment: 'Template que fue firmado (RESTRICT para mantener historial)'
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Cliente que firmó el consentimiento'
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'appointments',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'Cita asociada a esta firma (opcional)'
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'services',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'Servicio asociado a esta firma'
  },
  
  // Snapshot del template al momento de firmar (IMPORTANTE PARA LEGAL)
  templateVersion: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'Versión del template cuando fue firmado'
  },
  templateContent: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Copia exacta del contenido que firmó el cliente (snapshot para trazabilidad legal)'
  },
  
  // Datos de la firma
  signatureData: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Firma digital en base64 o path a imagen de la firma'
  },
  signatureType: {
    type: DataTypes.ENUM('DIGITAL', 'UPLOADED', 'TYPED'),
    allowNull: false,
    defaultValue: 'DIGITAL',
    
  },
  signedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha y hora exacta de la firma'
  },
  signedBy: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nombre completo de quien firmó (puede diferir del nombre del cliente, ej: tutor legal)'
  },
  
  // Datos de campos editables completados por el cliente
  editableFieldsData: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Valores de campos editables completados por el cliente: {"alergias": "Penicilina", "medicamentos": "Ibuprofeno 400mg", "condiciones_medicas": "Hipertensión"}'
  },
  
  // PDF generado y firmado
  pdfUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL o path del PDF firmado almacenado (en S3 o local storage)'
  },
  pdfGeneratedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha cuando se generó el PDF'
  },
  
  // Metadatos de trazabilidad (IMPORTANTE PARA LEGAL)
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'Dirección IP desde donde se firmó (IPv4 o IPv6)'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User agent del navegador/dispositivo usado para firmar'
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Coordenadas GPS si están disponibles { lat, lng, accuracy }'
  },
  device: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Información del dispositivo (tipo, modelo, SO, etc.)'
  },
  
  // Estado de la firma
  status: {
    type: DataTypes.ENUM('ACTIVE', 'REVOKED', 'EXPIRED'),
    allowNull: false,
    defaultValue: 'ACTIVE',
  
  },
  revokedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha cuando se revocó la firma (si aplica)'
  },
  revokedReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Razón por la que se revocó la firma'
  },
  revokedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que revocó la firma'
  }
}, {
  tableName: 'consent_signatures',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId', 'customerId']
    },
    {
      fields: ['consentTemplateId']
    },
    {
      fields: ['appointmentId']
    },
    {
      fields: ['serviceId']
    },
    {
      fields: ['signedAt']
    },
    {
      fields: ['status']
    },
    {
      fields: ['customerId', 'consentTemplateId']
    }
  ]
});

module.exports = ConsentSignature;
