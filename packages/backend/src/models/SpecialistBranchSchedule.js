const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SpecialistBranchSchedule = sequelize.define('SpecialistBranchSchedule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  specialistId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'specialist_profiles',
      key: 'id'
    }
  },
  branchId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'branches',
      key: 'id'
    }
  },
  dayOfWeek: {
    type: DataTypes.ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
    allowNull: false,
    
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Hora de inicio del turno'
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Hora de fin del turno'
  },
  breakStart: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'Hora de inicio del descanso/almuerzo'
  },
  breakEnd: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'Hora de fin del descanso/almuerzo'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Indica si este horario está activo'
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Prioridad del horario (útil para conflictos, mayor número = mayor prioridad)'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales sobre este horario'
  }
}, {
  tableName: 'specialist_branch_schedules',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['specialistId', 'branchId', 'dayOfWeek'],
      name: 'unique_specialist_branch_day'
    },
    {
      fields: ['specialistId', 'dayOfWeek'],
      name: 'specialist_day_schedule'
    },
    {
      fields: ['branchId', 'dayOfWeek'],
      name: 'branch_day_schedule'
    }
  ],
  scopes: {
    active: {
      where: {
        isActive: true
      }
    },
    bySpecialist: function(specialistId) {
      return {
        where: {
          specialistId: specialistId
        }
      };
    },
    byBranch: function(branchId) {
      return {
        where: {
          branchId: branchId
        }
      };
    },
    byDay: function(dayOfWeek) {
      return {
        where: {
          dayOfWeek: dayOfWeek
        }
      };
    }
  }
});

// Relaciones
SpecialistBranchSchedule.associate = (models) => {
  SpecialistBranchSchedule.belongsTo(models.SpecialistProfile, {
    foreignKey: 'specialistId',
    as: 'specialist'
  });

  SpecialistBranchSchedule.belongsTo(models.Branch, {
    foreignKey: 'branchId',
    as: 'branch'
  });
};

module.exports = SpecialistBranchSchedule;