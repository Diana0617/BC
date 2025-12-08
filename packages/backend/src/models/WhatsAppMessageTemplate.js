const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * WhatsAppMessageTemplate Model
 * 
 * Stores WhatsApp message templates submitted to Meta for approval
 */

const WhatsAppMessageTemplate = sequelize.define('WhatsAppMessageTemplate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    },
    field: 'business_id'
  },
  templateName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'template_name',
    comment: 'Template name (lowercase, underscores only)'
  },
  language: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'es',
    comment: 'Language code (es, en, pt_BR, etc.)'
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'TRANSACTIONAL',
    comment: 'Template category'
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Template body text'
  },
  header: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Optional header text'
  },
  footer: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Optional footer text'
  },
  buttons: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Optional buttons configuration'
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'PENDING',
    allowNull: false,
    comment: 'Template approval status'
  },
  metaTemplateId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'meta_template_id',
    comment: 'Template ID assigned by Meta after submission'
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'rejection_reason',
    comment: 'Reason for rejection if status is REJECTED'
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'approved_at',
    comment: 'When template was approved by Meta'
  }
}, {
  tableName: 'whatsapp_message_templates',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['business_id']
    },
    {
      fields: ['status']
    },
    {
      unique: true,
      fields: ['business_id', 'template_name']
    }
  ]
});

module.exports = WhatsAppMessageTemplate;
