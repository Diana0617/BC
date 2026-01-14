const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InventoryMovement = sequelize.define('InventoryMovement', {
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
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  movementType: {
    type: DataTypes.ENUM(
      'PURCHASE', 
      'SALE', 
      'ADJUSTMENT', 
      'TRANSFER', 
      'RETURN',
      'DAMAGE',
      'EXPIRED',
      'INITIAL_STOCK'
    ),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unitCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  totalCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  previousStock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  newStock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  referenceId: {
    type: DataTypes.UUID,
    allowNull: true // ID de la venta, compra, etc.
  },
  referenceType: {
    type: DataTypes.STRING,
    allowNull: true // 'SALE', 'PURCHASE', 'APPOINTMENT', etc.
  },
  batchNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  expirationDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  supplierInfo: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  documentUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  branchId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'branches',
      key: 'id'
    },
    comment: 'Sucursal donde ocurre el movimiento'
  },
  specialistId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Especialista que retira el producto (para procedimientos)'
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'appointments',
      key: 'id'
    },
    comment: 'Cita asociada al movimiento'
  },
  fromBranchId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'branches',
      key: 'id'
    },
    comment: 'Sucursal de origen en transferencias'
  },
  toBranchId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'branches',
      key: 'id'
    },
    comment: 'Sucursal de destino en transferencias'
  }
}, {
  tableName: 'inventory_movements',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId', 'productId']
    },
    {
      fields: ['businessId', 'movementType']
    },
    {
      fields: ['userId', 'businessId']
    },
    {
      fields: ['referenceId', 'referenceType']
    }
  ]
});

module.exports = InventoryMovement;