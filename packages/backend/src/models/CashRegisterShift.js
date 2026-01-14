const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo para turnos de caja
 * Registra la apertura y cierre de caja de recepcionistas/especialistas
 */
const CashRegisterShift = sequelize.define('CashRegisterShift', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  // Relaciones
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    },
    comment: 'Negocio al que pertenece el turno'
  },

  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que abre/cierra el turno'
  },

  branchId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'branches',
      key: 'id'
    },
    comment: 'Sucursal donde se realiza el turno'
  },

  // Información del turno
  shiftNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Número secuencial del turno en el día'
  },

  status: {
    type: DataTypes.ENUM('OPEN', 'CLOSED'),
    defaultValue: 'OPEN',
    allowNull: false
  },

  // Fechas y horas
  openedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },

  closedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },

  // Dinero en caja
  openingBalance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Dinero inicial recibido de caja anterior'
  },

  expectedClosingBalance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Balance esperado según transacciones'
  },

  actualClosingBalance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Balance real declarado al cerrar'
  },

  difference: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Diferencia entre esperado y real (faltante o sobrante)'
  },

  // Resumen de transacciones
  summary: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Resumen del turno: { appointments: {}, products: {}, paymentMethods: {} }'
  },

  // Notas
  openingNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas al abrir el turno'
  },

  closingNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas al cerrar el turno (explicación de diferencias)'
  },

  // Metadata adicional
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Datos adicionales del turno'
  }

}, {
  tableName: 'cash_register_shifts',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId', 'openedAt']
    },
    {
      fields: ['userId', 'status']
    },
    {
      fields: ['branchId', 'openedAt']
    },
    {
      fields: ['status', 'openedAt']
    }
  ]
});

// Hooks
CashRegisterShift.beforeCreate(async (shift) => {
  // Generar número de turno automáticamente
  if (!shift.shiftNumber) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const count = await CashRegisterShift.count({
      where: {
        businessId: shift.businessId,
        openedAt: {
          [require('sequelize').Op.gte]: today
        }
      }
    });
    
    shift.shiftNumber = count + 1;
  }
});

module.exports = CashRegisterShift;
