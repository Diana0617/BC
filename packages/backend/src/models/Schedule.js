const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Schedule = sequelize.define('Schedule', {
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
    }
  },
  specialistId: {
    type: DataTypes.UUID,
    allowNull: true, // null = horario general del negocio
    references: {
      model: 'users',
      key: 'id'
    }
  },
  branchId: {
    type: DataTypes.UUID,
    allowNull: true, // null = aplica a todas las sucursales
    references: {
      model: 'branches',
      key: 'id'
    },
    comment: 'Sucursal específica para este horario. Si es null, aplica a todas las sucursales.'
  },
  type: {
    type: DataTypes.ENUM('BUSINESS_DEFAULT', 'SPECIALIST_CUSTOM', 'TEMPORARY_OVERRIDE'),
    allowNull: false,
    defaultValue: 'BUSINESS_DEFAULT'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nombre descriptivo del horario (ej: "Horario de Verano", "Horario de María")'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción opcional del horario'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Si el horario está activo'
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si es el horario por defecto (solo uno por especialista/negocio)'
  },
  effectiveFrom: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha desde cuando es efectivo este horario'
  },
  effectiveTo: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha hasta cuando es efectivo este horario'
  },
  weeklySchedule: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      monday: {
        enabled: true,
        shifts: [
          {
            start: '09:00',
            end: '18:00',
            breakStart: '12:00',
            breakEnd: '13:00'
          }
        ]
      },
      tuesday: {
        enabled: true,
        shifts: [
          {
            start: '09:00',
            end: '18:00',
            breakStart: '12:00',
            breakEnd: '13:00'
          }
        ]
      },
      wednesday: {
        enabled: true,
        shifts: [
          {
            start: '09:00',
            end: '18:00',
            breakStart: '12:00',
            breakEnd: '13:00'
          }
        ]
      },
      thursday: {
        enabled: true,
        shifts: [
          {
            start: '09:00',
            end: '18:00',
            breakStart: '12:00',
            breakEnd: '13:00'
          }
        ]
      },
      friday: {
        enabled: true,
        shifts: [
          {
            start: '09:00',
            end: '18:00',
            breakStart: '12:00',
            breakEnd: '13:00'
          }
        ]
      },
      saturday: {
        enabled: true,
        shifts: [
          {
            start: '09:00',
            end: '16:00',
            breakStart: null,
            breakEnd: null
          }
        ]
      },
      sunday: {
        enabled: false,
        shifts: []
      }
    },
   
  },
  slotDuration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30,
    comment: 'Duración de cada slot en minutos'
  },
  bufferTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
    comment: 'Tiempo de buffer entre citas en minutos'
  },
  timezone: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'America/Bogota',
    comment: 'Zona horaria para este horario'
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Prioridad del horario (mayor número = mayor prioridad)'
  },
  exceptions: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Excepciones específicas por fecha (vacaciones, días especiales, etc.)'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que creó este horario'
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que actualizó este horario por última vez'
  }
}, {
  tableName: 'schedules',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId']
    },
    {
      fields: ['specialistId']
    },
    {
      fields: ['type']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['isDefault']
    },
    {
      fields: ['effectiveFrom', 'effectiveTo']
    },
    {
      unique: true,
      fields: ['businessId', 'specialistId', 'isDefault'],
      where: {
        isDefault: true,
        isActive: true
      },
      name: 'unique_default_schedule_per_specialist'
    }
  ]
});

module.exports = Schedule;