const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo SaleItem
 * Items/productos individuales de una venta
 * Cada item representa un producto vendido con su cantidad, precio y descuentos
 */
const SaleItem = sequelize.define('SaleItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  saleId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'sale_id',
    references: {
      model: 'sales',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'product_id',
    references: {
      model: 'products',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    },
    comment: 'Cantidad vendida'
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'unit_price',
    validate: {
      min: 0
    },
    comment: 'Precio unitario al momento de la venta (histórico)'
  },
  unitCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'unit_cost',
    validate: {
      min: 0
    },
    comment: 'Costo unitario del producto (para calcular ganancia)'
  },
  subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Subtotal del item: quantity * unitPrice'
  },
  discount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Descuento aplicado al item'
  },
  discountType: {
    type: DataTypes.ENUM('PERCENTAGE', 'FIXED', 'NONE'),
    allowNull: false,
    defaultValue: 'NONE',
    field: 'discount_type'
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'discount_value',
    comment: 'Valor original del descuento antes de calcular'
  },
  tax: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Impuesto aplicado al item'
  },
  taxPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'tax_percentage',
    comment: 'Porcentaje de impuesto del producto al momento de venta'
  },
  total: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Total del item: subtotal - discount + tax'
  },
  profit: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    validate: {
      min: 0
    },
    comment: 'Ganancia: (unitPrice - unitCost) * quantity'
  },
  inventoryMovementId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'inventory_movement_id',
    references: {
      model: 'inventory_movements',
      key: 'id'
    },
    comment: 'Movimiento de inventario generado por esta venta'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas sobre este item específico'
  }
}, {
  tableName: 'sale_items',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['sale_id']
    },
    {
      fields: ['product_id']
    },
    {
      fields: ['inventory_movement_id']
    }
  ],
  hooks: {
    beforeValidate: (item) => {
      // Calcular subtotal
      item.subtotal = item.quantity * item.unitPrice;
      
      // Calcular descuento si es porcentaje
      if (item.discountType === 'PERCENTAGE' && item.discountValue) {
        item.discount = (item.subtotal * item.discountValue) / 100;
      } else if (item.discountType === 'FIXED' && item.discountValue) {
        item.discount = item.discountValue;
      }
      
      // Calcular impuesto sobre (subtotal - descuento)
      const taxableAmount = item.subtotal - item.discount;
      if (item.taxPercentage > 0) {
        item.tax = (taxableAmount * item.taxPercentage) / 100;
      }
      
      // Calcular total
      item.total = item.subtotal - item.discount + item.tax;
      
      // Calcular ganancia si hay costo
      if (item.unitCost) {
        const profitPerUnit = item.unitPrice - item.unitCost;
        item.profit = profitPerUnit * item.quantity - item.discount;
      }
    }
  }
});

/**
 * Métodos de instancia
 */

SaleItem.prototype.getProfit = function() {
  if (!this.unitCost) return 0;
  return this.profit || 0;
};

SaleItem.prototype.getProfitMargin = function() {
  if (!this.unitCost || this.unitPrice === 0) return 0;
  return ((this.unitPrice - this.unitCost) / this.unitPrice) * 100;
};

module.exports = SaleItem;
