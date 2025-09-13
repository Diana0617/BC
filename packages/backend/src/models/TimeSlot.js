const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TimeSlot = sequelize.define('TimeSlot', {
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
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  scheduleId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'schedules',
      key: 'id'
    },
    comment: 'Horario del cual se generó este slot'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Fecha del slot (YYYY-MM-DD)'
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Hora de inicio del slot (HH:MM:SS)'
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Hora de fin del slot (HH:MM:SS)'
  },
  startDateTime: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Timestamp completo de inicio (para consultas de disponibilidad)'
  },
  endDateTime: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Timestamp completo de fin'
  },
  status: {
    type: DataTypes.ENUM('AVAILABLE', 'BOOKED', 'BLOCKED', 'BREAK', 'UNAVAILABLE'),
    allowNull: false,
    defaultValue: 'AVAILABLE',
    comment: 'Estado del slot de tiempo'
  },
  type: {
    type: DataTypes.ENUM('REGULAR', 'BREAK', 'LUNCH', 'BUFFER', 'MAINTENANCE', 'EMERGENCY'),
    allowNull: false,
    defaultValue: 'REGULAR',
    comment: 'Tipo de slot'
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'appointments',
      key: 'id'
    },
    comment: 'Cita asociada si el slot está reservado'
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'services',
      key: 'id'
    },
    comment: 'Servicio asociado (para validar duración y disponibilidad)'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30,
    comment: 'Duración del slot en minutos'
  },
  isRepeating: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si es un slot que se repite (ej: descansos programados)'
  },
  repeatPattern: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Patrón de repetición si isRepeating es true'
  },
  blockReason: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Razón del bloqueo si status es BLOCKED'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales sobre este slot'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Precio específico para este slot si aplica (precios dinámicos)'
  },
  maxCapacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Capacidad máxima de clientes para este slot (servicios grupales)'
  },
  currentCapacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Capacidad actual ocupada'
  },
  allowWalkIn: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Si permite clientes sin cita previa'
  },
  allowOnlineBooking: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Si permite reservas online'
  },
  minimumNotice: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60,
    comment: 'Tiempo mínimo de aviso para reservar este slot (en minutos)'
  },
  cancellationDeadline: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 120,
    comment: 'Tiempo límite para cancelar sin penalización (en minutos)'
  },
  tags: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Etiquetas para categorizar o filtrar slots'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Metadatos adicionales específicos del negocio'
  },
  generatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp de cuando se generó automáticamente este slot'
  },
  lastModifiedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que modificó este slot por última vez'
  }
}, {
  tableName: 'time_slots',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId']
    },
    {
      fields: ['specialistId']
    },
    {
      fields: ['date']
    },
    {
      fields: ['startDateTime', 'endDateTime']
    },
    {
      fields: ['status']
    },
    {
      fields: ['type']
    },
    {
      fields: ['appointmentId']
    },
    {
      fields: ['serviceId']
    },
    {
      fields: ['date', 'specialistId', 'status']
    },
    {
      fields: ['businessId', 'date', 'status']
    },
    {
      unique: true,
      fields: ['specialistId', 'startDateTime'],
      name: 'unique_specialist_start_time'
    }
  ]
});

module.exports = TimeSlot;