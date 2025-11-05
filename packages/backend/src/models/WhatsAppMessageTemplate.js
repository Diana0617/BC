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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Template name (lowercase, underscores only)'
  },
  language: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'Language code (es, en, pt_BR, etc.)'
  },
  category: {
    type: DataTypes.ENUM('UTILITY', 'MARKETING', 'AUTHENTICATION'),
    allowNull: false,
    comment: 'Template category as per WhatsApp requirements'
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED'),
    defaultValue: 'DRAFT',
    allowNull: false,
    comment: 'Template approval status'
  },
  components: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Template components (header, body, footer, buttons)'
  },
  metaTemplateId: {
    type: DataTypes.STRING,
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
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'submitted_at',
    comment: 'When template was submitted to Meta'
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'approved_at',
    comment: 'When template was approved by Meta'
  },
  lastSyncedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_synced_at',
    comment: 'Last time template was synced from Meta'
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
      fields: ['meta_template_id']
    },
    {
      unique: true,
      fields: ['business_id', 'name', 'language']
    }
  ]
});

module.exports = WhatsAppMessageTemplate;
