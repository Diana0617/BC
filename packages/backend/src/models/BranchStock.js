const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo BranchStock
 * Gestiona el inventario de productos por sucursal
 * Permite que cada sucursal tenga su propio control de stock independiente
 */
const BranchStock = sequelize.define('BranchStock', {
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
    allowNull: false,
    references: {
      model: 'branches',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  currentStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'current_stock',
    validate: {
      min: 0
    }
  },
  minStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'min_stock',
    validate: {
      min: 0
    }
  },
  maxStock: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'max_stock',
    validate: {
      min: 0
    }
  },
  lastCountDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_count_date'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'branch_stocks',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['branchId', 'productId']
    },
    {
      fields: ['businessId']
    },
    {
      fields: ['branchId']
    },
    {
      fields: ['productId']
    },
    {
      name: 'idx_low_stock',
      fields: ['current_stock', 'min_stock'],
      where: {
        current_stock: {
          [sequelize.Sequelize.Op.lte]: sequelize.col('min_stock')
        }
      }
    }
  ],
  hooks: {
    /**
     * Validar que el stock no sea negativo antes de guardar
     */
    beforeValidate: (branchStock) => {
      if (branchStock.currentStock < 0) {
        throw new Error('El stock no puede ser negativo');
      }
    },
    
    /**
     * Validar que maxStock sea mayor que minStock si está definido
     */
    beforeSave: (branchStock) => {
      if (branchStock.maxStock && branchStock.minStock) {
        if (branchStock.maxStock < branchStock.minStock) {
          throw new Error('El stock máximo debe ser mayor que el stock mínimo');
        }
      }
    }
  }
});

/**
 * Métodos de instancia
 */
BranchStock.prototype.isLowStock = function() {
  return this.currentStock <= this.minStock;
};

BranchStock.prototype.isOutOfStock = function() {
  return this.currentStock === 0;
};

BranchStock.prototype.isOverStock = function() {
  return this.maxStock && this.currentStock >= this.maxStock;
};

BranchStock.prototype.getStockStatus = function() {
  if (this.isOutOfStock()) return 'OUT_OF_STOCK';
  if (this.isLowStock()) return 'LOW_STOCK';
  if (this.isOverStock()) return 'OVERSTOCK';
  return 'OK';
};

BranchStock.prototype.adjustStock = async function(quantity, reason, userId, transaction) {
  const previousStock = this.currentStock;
  const newStock = previousStock + quantity;
  
  if (newStock < 0) {
    throw new Error('Stock insuficiente para realizar esta operación');
  }
  
  this.currentStock = newStock;
  await this.save({ transaction });
  
  // Crear movimiento de inventario
  const InventoryMovement = require('./InventoryMovement');
  await InventoryMovement.create({
    businessId: this.businessId,
    productId: this.productId,
    branchId: this.branchId,
    userId: userId,
    movementType: quantity > 0 ? 'ADJUSTMENT' : 'ADJUSTMENT',
    quantity: Math.abs(quantity),
    previousStock: previousStock,
    newStock: newStock,
    reason: reason,
    notes: `Ajuste de stock: ${quantity > 0 ? '+' : ''}${quantity}`
  }, { transaction });
  
  return this;
};

/**
 * Métodos estáticos
 */

/**
 * Obtener stock de un producto en una sucursal específica
 */
BranchStock.getStock = async function(branchId, productId) {
  return await this.findOne({
    where: { branchId, productId }
  });
};

/**
 * Obtener productos con stock bajo en una sucursal
 */
BranchStock.getLowStockProducts = async function(branchId) {
  return await this.findAll({
    where: {
      branchId,
      [sequelize.Sequelize.Op.or]: [
        sequelize.where(
          sequelize.col('current_stock'),
          '<=',
          sequelize.col('min_stock')
        )
      ]
    },
    include: [{
      model: sequelize.models.Product,
      as: 'product'
    }]
  });
};

/**
 * Inicializar stock para un producto en una sucursal
 */
BranchStock.initializeStock = async function(branchId, productId, businessId, initialStock, userId, transaction) {
  // Buscar si ya existe
  let stock = await this.findOne({
    where: { branchId, productId }
  });
  
  if (stock) {
    throw new Error('Ya existe un registro de stock para este producto en esta sucursal');
  }
  
  // Crear el registro de stock
  stock = await this.create({
    businessId,
    branchId,
    productId,
    currentStock: initialStock,
    minStock: 0,
    maxStock: null,
    lastCountDate: new Date()
  }, { transaction });
  
  // Crear movimiento inicial
  const InventoryMovement = require('./InventoryMovement');
  await InventoryMovement.create({
    businessId,
    productId,
    branchId,
    userId,
    movementType: 'INITIAL_STOCK',
    quantity: initialStock,
    previousStock: 0,
    newStock: initialStock,
    reason: 'Stock inicial',
    notes: 'Carga inicial de inventario'
  }, { transaction });
  
  return stock;
};

module.exports = BranchStock;
