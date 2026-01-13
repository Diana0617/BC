const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Tabla intermedia para relación muchos-a-muchos entre Appointments y Services
 * Permite que una cita tenga múltiples servicios
 */
const AppointmentService = sequelize.define('AppointmentService', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'appointments',
      key: 'id'
    },
    comment: 'ID de la cita'
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'services',
      key: 'id'
    },
    comment: 'ID del servicio'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Precio del servicio al momento de la cita (histórico)'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Duración del servicio en minutos al momento de la cita'
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Orden en que se realizan los servicios'
  }
}, {
  tableName: 'appointment_services',
  timestamps: true,
  indexes: [
    {
      fields: ['appointmentId']
    },
    {
      fields: ['serviceId']
    },
    {
      unique: true,
      fields: ['appointmentId', 'serviceId'],
      name: 'unique_appointment_service'
    }
  ]
});

module.exports = AppointmentService;
