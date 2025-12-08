const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CommissionDetail = sequelize.define('CommissionDetail', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  paymentRequestId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'commission_payment_requests',
      key: 'id'
    }
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'appointments',
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
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id'
    }
  },
  serviceDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  serviceName: {
    type: DataTypes.STRING,
    allowNull: false // Nombre del servicio al momento del registro
  },
  servicePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  commissionRate: {
    type: DataTypes.DECIMAL(5, 2), // % de comisión aplicado
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  commissionAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'COP'
  },
  clientName: {
    type: DataTypes.STRING,
    allowNull: false // Nombre del cliente al momento del registro
  },
  paymentStatus: {
    type: DataTypes.ENUM('PENDING', 'PAID', 'DISPUTED'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isDisputed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  disputeReason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'commission_details',
  timestamps: true,
  indexes: [
    {
      fields: ['paymentRequestId']
    },
    {
      fields: ['appointmentId']
    },
    {
      fields: ['serviceId']
    },
    {
      fields: ['clientId']
    },
    {
      fields: ['serviceDate']
    },
    {
      fields: ['paymentStatus']
    }
  ]
});

module.exports = CommissionDetail;