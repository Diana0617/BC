const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo Sale
 * Gestiona las ventas directas de productos en el negocio
 * Puede estar asociada a un turno (CashRegisterShift) o ser independiente
 */
const Sale = sequelize.define('Sale', {
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
    comment: 'Sucursal donde se realiza la venta'
  },
  saleNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Número único de venta: VENTA-TIMESTAMP'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que registra la venta (BUSINESS, RECEPTIONIST, SPECIALIST, etc.)'
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'clients',
      key: 'id'
    },
    comment: 'Cliente asociado a la venta (opcional)'
  },
  shiftId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'cash_register_shifts',
      key: 'id'
    },
    comment: 'Turno asociado si la venta se hace durante un turno activo'
  },
  subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Suma de items antes de descuentos e impuestos'
  },
  discount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Monto del descuento aplicado'
  },
  discountType: {
    type: DataTypes.ENUM('PERCENTAGE', 'FIXED', 'NONE'),
    allowNull: false,
    defaultValue: 'NONE',
    comment: 'Tipo de descuento: porcentaje o monto fijo'
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Valor del descuento (% o monto) antes de calcular'
  },
  tax: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Monto del impuesto (IVA u otros)'
  },
  taxPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Porcentaje de impuesto aplicado (ej: 0, 5, 19)'
  },
  total: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Total final: subtotal - descuento + impuesto'
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'CASH',
    comment: 'Método de pago utilizado (acepta valores personalizados del negocio)'
  },
  paymentDetails: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Detalles del pago (si es mixto, referencia de transferencia, etc.)'
  },
  paidAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Monto pagado por el cliente'
  },
  changeAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Cambio devuelto al cliente'
  },
  status: {
    type: DataTypes.ENUM('COMPLETED', 'CANCELLED', 'REFUNDED', 'PENDING'),
    allowNull: false,
    defaultValue: 'COMPLETED',
    comment: 'Estado de la venta'
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancelledBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refundedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  refundReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales sobre la venta'
  },
  receiptId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'receipts',
      key: 'id'
    },
    comment: 'Recibo generado para esta venta'
  }
}, {
  tableName: 'sales',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId']
    },
    {
      fields: ['branchId']
    },
    {
      unique: true,
      fields: ['saleNumber']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['clientId']
    },
    {
      fields: ['shift_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['business_id', 'status', 'created_at']
    }
  ],
  hooks: {
    beforeValidate: (sale) => {
      // Generar número de venta si no existe
      if (!sale.saleNumber) {
        sale.saleNumber = `VENTA-${Date.now()}`;
      }
      
      // Validar que paidAmount sea >= total si está completada
      if (sale.status === 'COMPLETED' && sale.paidAmount < sale.total) {
        throw new Error('El monto pagado debe ser igual o mayor al total');
      }
      
      // Calcular cambio automáticamente
      if (sale.paidAmount > sale.total) {
        sale.changeAmount = sale.paidAmount - sale.total;
      } else {
        sale.changeAmount = 0;
      }
    }
  }
});

/**
 * Métodos de instancia
 */

Sale.prototype.calculateTotals = function() {
  // Esto se calculará desde los items, pero aquí validamos coherencia
  const calculatedTotal = this.subtotal - this.discount + this.tax;
  return calculatedTotal.toFixed(2);
};

Sale.prototype.canBeCancelled = function() {
  return this.status === 'COMPLETED' && !this.cancelledAt;
};

Sale.prototype.canBeRefunded = function() {
  return this.status === 'COMPLETED' && !this.refundedAt && !this.cancelledAt;
};

/**
 * Métodos estáticos
 */

Sale.generateSaleNumber = function() {
  return `VENTA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

module.exports = Sale;
