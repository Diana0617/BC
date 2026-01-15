const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo ProcedureSupply
 * Registra el consumo de productos/insumos durante procedimientos o servicios
 * Permite rastrear qué productos se usaron en cada cita/turno
 */
const ProcedureSupply = sequelize.define('ProcedureSupply', {
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
    },
    onDelete: 'CASCADE'
  },
  branchId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'branches',
      key: 'id'
    },
    comment: 'Sucursal donde se consume el producto'
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'appointments',
      key: 'id'
    },
    comment: 'Cita asociada al consumo'
  },
  shiftId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'cash_register_shifts',
      key: 'id'
    },
    comment: 'Turno durante el cual se consume el producto'
  },
  specialistId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Especialista que usa el producto'
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    },
    comment: 'Producto consumido'
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    validate: {
      min: 0.001
    },
    comment: 'Cantidad consumida (puede ser decimal para líquidos, gramos, etc.)'
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'unit',
    comment: 'Unidad de medida: unit, ml, gr, kg, etc.'
  },
  unitCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Costo unitario del producto al momento del consumo'
  },
  totalCost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Costo total: quantity * unitCost'
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Motivo del consumo: procedimiento, tratamiento, etc.'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas sobre el uso del producto'
  },
  inventoryMovementId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'inventory_movements',
      key: 'id'
    },
    comment: 'Movimiento de inventario generado'
  },
  registeredBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que registra el consumo'
  },
  registeredAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'procedure_supplies',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId']
    },
    {
      fields: ['branchId']
    },
    {
      fields: ['appointmentId']
    },
    {
      fields: ['shiftId']
    },
    {
      fields: ['specialistId']
    },
    {
      fields: ['productId']
    },
    {
      fields: ['inventoryMovementId']
    },
    {
      fields: ['registeredAt']
    },
    {
      fields: ['businessId', 'specialistId', 'registeredAt']
    }
  ],
  hooks: {
    beforeValidate: (supply) => {
      // Calcular costo total
      if (supply.unitCost) {
        supply.totalCost = supply.quantity * supply.unitCost;
      }
    }
  }
});

/**
 * Métodos de instancia
 */

ProcedureSupply.prototype.getTotalCost = function() {
  return this.totalCost || 0;
};

/**
 * Métodos estáticos
 */

/**
 * Obtener consumo total de un producto en un rango de fechas
 */
ProcedureSupply.getTotalConsumption = async function(productId, businessId, startDate, endDate) {
  const { Op } = require('sequelize');
  
  const result = await this.findOne({
    where: {
      productId,
      businessId,
      registeredAt: {
        [Op.between]: [startDate, endDate]
      }
    },
    attributes: [
      [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
      [sequelize.fn('SUM', sequelize.col('totalCost')), 'totalCost']
    ],
    raw: true
  });
  
  return {
    totalQuantity: parseFloat(result.totalQuantity) || 0,
    totalCost: parseFloat(result.totalCost) || 0
  };
};

/**
 * Obtener consumo por especialista
 */
ProcedureSupply.getSpecialistConsumption = async function(specialistId, businessId, startDate, endDate) {
  const { Op } = require('sequelize');
  
  return await this.findAll({
    where: {
      specialistId,
      businessId,
      registeredAt: {
        [Op.between]: [startDate, endDate]
      }
    },
    include: [{
      model: sequelize.models.Product,
      as: 'product',
      attributes: ['id', 'name', 'sku', 'unit']
    }],
    order: [['registeredAt', 'DESC']]
  });
};

module.exports = ProcedureSupply;
