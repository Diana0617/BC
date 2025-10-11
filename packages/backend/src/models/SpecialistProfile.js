const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SpecialistProfile = sequelize.define('SpecialistProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
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
  specialization: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Especialización profesional (ej: Colorista, Barbero, Estilista)'
  },
  biography: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Biografía profesional del especialista'
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Años de experiencia'
  },
  certifications: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Lista de certificaciones y títulos'
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL de la imagen de perfil profesional'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Si el especialista está activo para recibir citas'
  },
  commissionRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 50.00,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Porcentaje de comisión por servicio (0-100%)'
  },
  commissionType: {
    type: DataTypes.ENUM('PERCENTAGE', 'FIXED_AMOUNT'),
    allowNull: false,
    defaultValue: 'PERCENTAGE',
    
  },
  fixedCommissionAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Monto fijo de comisión cuando commissionType es FIXED_AMOUNT'
  },
  workingDays: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: false
    },
    comment: 'Días de trabajo del especialista'
  },
  workingHours: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      start: '09:00',
      end: '18:00'
    },
    comment: 'Horario de trabajo general del especialista'
  },
  customSchedule: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Horarios personalizados por día de la semana'
  },
  breakTime: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      enabled: true,
      start: '12:00',
      end: '13:00'
    },
    comment: 'Horario de descanso/almuerzo'
  },
  skills: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Lista de habilidades y especialidades específicas'
  },
  languages: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: ['es'],
    comment: 'Idiomas que habla el especialista'
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 5
    },
    comment: 'Calificación promedio del especialista (0-5)'
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Número total de reseñas recibidas'
  },
  phoneExtension: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Extensión telefónica interna'
  },
  emergencyContact: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Información de contacto de emergencia'
  },
  socialMedia: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Enlaces a redes sociales profesionales'
  },
  preferences: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      allowBookingNotifications: true,
      allowReminderNotifications: true,
      allowPromotionNotifications: false,
      preferredNotificationMethod: 'email' // email, sms, both
    },
    comment: 'Preferencias de notificaciones y configuración'
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'ON_VACATION', 'SICK_LEAVE', 'SUSPENDED'),
    allowNull: false,
    defaultValue: 'ACTIVE',
    
  },
  hireDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de contratación'
  },
  contractType: {
    type: DataTypes.ENUM('EMPLOYEE', 'CONTRACTOR', 'PARTNER'),
    allowNull: false,
    defaultValue: 'EMPLOYEE',
    
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas administrativas internas'
  }
}, {
  tableName: 'specialist_profiles',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId']
    },
    {
      fields: ['businessId']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['status']
    },
    {
      fields: ['specialization']
    }
  ]
});

module.exports = SpecialistProfile;