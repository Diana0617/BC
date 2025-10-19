const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TreatmentPlan = sequelize.define('TreatmentPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id'
    }
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'services',
      key: 'id'
    }
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    }
  },
  specialistId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  planType: {
    type: DataTypes.ENUM('MULTI_SESSION', 'WITH_MAINTENANCE'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'CANCELLED', 'PAUSED'),
    defaultValue: 'ACTIVE',
    allowNull: false
  },
  totalSessions: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  completedSessions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    allowNull: false
  },
  paymentPlan: {
    type: DataTypes.ENUM('FULL_UPFRONT', 'PER_SESSION', 'INSTALLMENTS'),
    defaultValue: 'FULL_UPFRONT',
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  expectedEndDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actualEndDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  config: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'treatment_plans',
  timestamps: true,
  indexes: [
    {
      fields: ['clientId'],
      name: 'idx_treatment_plans_client'
    },
    {
      fields: ['businessId'],
      name: 'idx_treatment_plans_business'
    },
    {
      fields: ['specialistId'],
      name: 'idx_treatment_plans_specialist'
    },
    {
      fields: ['status'],
      name: 'idx_treatment_plans_status'
    },
    {
      fields: ['serviceId'],
      name: 'idx_treatment_plans_service'
    }
  ]
});

// Métodos de instancia útiles
TreatmentPlan.prototype.isCompleted = function() {
  return this.completedSessions >= this.totalSessions;
};

TreatmentPlan.prototype.getProgress = function() {
  return {
    completed: this.completedSessions,
    total: this.totalSessions,
    percentage: Math.round((this.completedSessions / this.totalSessions) * 100)
  };
};

TreatmentPlan.prototype.getPaymentProgress = function() {
  const paid = parseFloat(this.paidAmount);
  const total = parseFloat(this.totalPrice);
  return {
    paid,
    total,
    remaining: total - paid,
    percentage: Math.round((paid / total) * 100)
  };
};

TreatmentPlan.prototype.canScheduleNextSession = function() {
  return this.status === 'ACTIVE' && !this.isCompleted();
};

module.exports = TreatmentPlan;
