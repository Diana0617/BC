const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SupplierEvaluation = sequelize.define('SupplierEvaluation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  supplierId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'suppliers',
      key: 'id'
    }
  },
  evaluatedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  qualityScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  deliveryScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  serviceScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  priceScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  averageScore: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  period: {
    type: DataTypes.STRING,
    allowNull: true
  },
  evaluationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'supplier_evaluations',
  timestamps: true,
  hooks: {
    beforeSave: (evaluation) => {
      // Calcular promedio automáticamente
      const total = evaluation.qualityScore + evaluation.deliveryScore + 
                   evaluation.serviceScore + evaluation.priceScore;
      evaluation.averageScore = (total / 4).toFixed(2);
    }
  },
  indexes: [
    {
      fields: ['supplierId']
    },
    {
      fields: ['evaluatedBy']
    },
    {
      fields: ['evaluationDate']
    },
    {
      fields: ['averageScore']
    }
  ]
});

module.exports = SupplierEvaluation;