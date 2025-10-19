const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TreatmentSession = sequelize.define('TreatmentSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  treatmentPlanId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'treatment_plans',
      key: 'id'
    }
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'appointments',
      key: 'id'
    }
  },
  sessionNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'),
    defaultValue: 'PENDING',
    allowNull: false
  },
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  specialistId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  photosUrls: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'treatment_sessions',
  timestamps: true,
  indexes: [
    {
      fields: ['treatmentPlanId'],
      name: 'idx_treatment_sessions_plan'
    },
    {
      fields: ['appointmentId'],
      name: 'idx_treatment_sessions_appointment'
    },
    {
      fields: ['status'],
      name: 'idx_treatment_sessions_status'
    },
    {
      fields: ['specialistId'],
      name: 'idx_treatment_sessions_specialist'
    },
    {
      fields: ['treatmentPlanId', 'sessionNumber'],
      name: 'idx_treatment_sessions_plan_number',
      unique: true
    }
  ]
});

// Métodos de instancia útiles
TreatmentSession.prototype.isScheduled = function() {
  return this.appointmentId !== null;
};

TreatmentSession.prototype.isPending = function() {
  return this.status === 'PENDING';
};

TreatmentSession.prototype.isCompleted = function() {
  return this.status === 'COMPLETED';
};

TreatmentSession.prototype.canSchedule = function() {
  return this.status === 'PENDING' && !this.appointmentId;
};

TreatmentSession.prototype.canComplete = function() {
  return this.status === 'SCHEDULED' && this.appointmentId;
};

TreatmentSession.prototype.addPhoto = function(photoUrl) {
  if (!this.photosUrls) {
    this.photosUrls = [];
  }
  this.photosUrls.push({
    url: photoUrl,
    uploadedAt: new Date(),
    type: 'progress'
  });
};

module.exports = TreatmentSession;
