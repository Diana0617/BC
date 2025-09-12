const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OwnerFinancialReport = sequelize.define('OwnerFinancialReport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reportType: {
    type: DataTypes.ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM'),
    allowNull: false
  },
  reportPeriod: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Período del reporte en formato YYYY-MM-DD o YYYY-MM o YYYY'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  
  // === MÉTRICAS DE INGRESOS ===
  totalRevenue: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Ingresos totales del período'
  },
  subscriptionRevenue: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Ingresos por suscripciones'
  },
  netRevenue: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Ingresos netos después de comisiones'
  },
  
  // === MÉTRICAS DE PAGOS ===
  totalPayments: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Número total de pagos'
  },
  completedPayments: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Pagos completados exitosamente'
  },
  failedPayments: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Pagos fallidos'
  },
  pendingPayments: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Pagos pendientes'
  },
  refundedPayments: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Pagos reembolsados'
  },
  
  // === MÉTRICAS DE COMISIONES ===
  totalCommissions: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Comisiones totales pagadas a proveedores'
  },
  averageCommissionRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Tasa promedio de comisión'
  },
  
  // === MÉTRICAS DE SUSCRIPCIONES ===
  newSubscriptions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Nuevas suscripciones en el período'
  },
  renewedSubscriptions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Suscripciones renovadas'
  },
  canceledSubscriptions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Suscripciones canceladas'
  },
  activeSubscriptions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Suscripciones activas al final del período'
  },
  
  // === MÉTRICAS POR PLAN ===
  revenueByPlan: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Ingresos desglosados por plan de suscripción'
  },
  subscriptionsByPlan: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Cantidad de suscripciones por plan'
  },
  
  // === MÉTRICAS POR MÉTODO DE PAGO ===
  revenueByPaymentMethod: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Ingresos por método de pago'
  },
  paymentsByMethod: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Cantidad de pagos por método'
  },
  
  // === MÉTRICAS ADICIONALES ===
  averageRevenuePerBusiness: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Ingreso promedio por negocio'
  },
  churnRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Tasa de cancelación en porcentaje'
  },
  retentionRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Tasa de retención en porcentaje'
  },
  
  // === COMPARACIONES ===
  previousPeriodComparison: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Comparación con período anterior'
  },
  yearOverYearGrowth: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Crecimiento año sobre año en porcentaje'
  },
  
  // === METADATOS ===
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'COP'
  },
  generatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  generatedBy: {
    type: DataTypes.ENUM('AUTOMATIC', 'MANUAL', 'SCHEDULED'),
    allowNull: false,
    defaultValue: 'AUTOMATIC'
  },
  status: {
    type: DataTypes.ENUM('GENERATING', 'COMPLETED', 'FAILED'),
    allowNull: false,
    defaultValue: 'GENERATING'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'owner_financial_reports',
  timestamps: true,
  indexes: [
    {
      fields: ['reportType']
    },
    {
      fields: ['reportPeriod']
    },
    {
      fields: ['startDate', 'endDate']
    },
    {
      fields: ['generatedAt']
    },
    {
      fields: ['status']
    },
    {
      unique: true,
      fields: ['reportType', 'reportPeriod'],
      name: 'unique_report_period'
    }
  ],
  scopes: {
    completed: {
      where: {
        status: 'COMPLETED'
      }
    },
    monthly: {
      where: {
        reportType: 'MONTHLY'
      }
    },
    yearly: {
      where: {
        reportType: 'YEARLY'
      }
    }
  }
});

module.exports = OwnerFinancialReport;