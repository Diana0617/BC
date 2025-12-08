const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * SpecialistService - Tabla intermedia para relación many-to-many entre User (specialists) y Service
 * Permite que cada especialista tenga precios personalizados para sus servicios
 */
const SpecialistService = sequelize.define('SpecialistService', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  specialistId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    comment: 'Usuario especialista que ofrece el servicio'
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'services',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    comment: 'Servicio ofrecido por el especialista'
  },
  customPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: null,
    validate: {
      min: 0
    },
    comment: 'Precio personalizado del especialista. Si es NULL, usa el precio base del servicio'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Indica si el especialista actualmente ofrece este servicio'
  },
  skillLevel: {
    type: DataTypes.ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'),
    allowNull: true,
    defaultValue: 'INTERMEDIATE',
    
  },
  averageDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duración promedio en minutos que toma al especialista completar este servicio'
  },
  commissionPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Porcentaje de comisión personalizado para este especialista en este servicio'
  },
  canBeBooked: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si este servicio puede ser reservado online para este especialista'
  },
  requiresApproval: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Si las citas para este servicio requieren aprobación del especialista'
  },
  maxBookingsPerDay: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    },
    comment: 'Máximo de reservas por día para este servicio específico'
  },
  assignedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de asignación del servicio al especialista'
  },
  assignedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que realizó la asignación'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas sobre el servicio ofrecido por este especialista'
  }
}, {
  tableName: 'specialist_services',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['specialistId', 'serviceId'],
      name: 'unique_specialist_service'
    },
    {
      fields: ['specialistId'],
      name: 'idx_specialist_service_specialist'
    },
    {
      fields: ['serviceId'],
      name: 'idx_specialist_service_service'
    },
    {
      fields: ['isActive'],
      name: 'idx_specialist_service_active'
    },
    {
      fields: ['canBeBooked'],
      name: 'idx_specialist_service_bookable'
    }
  ],
  hooks: {
    beforeValidate: (specialistService) => {
      // Si no hay precio personalizado, será null y usará el precio base del servicio
      if (specialistService.customPrice === '') {
        specialistService.customPrice = null;
      }
    }
  }
});

module.exports = SpecialistService;
