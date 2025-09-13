const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OwnerExpense = sequelize.define('OwnerExpense', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // === INFORMACIÓN BÁSICA DEL GASTO ===
  description: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Descripción detallada del gasto'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0.01
    },
    comment: 'Monto del gasto'
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'COP',
    comment: 'Moneda del gasto (ISO 4217)'
  },
  
  // === CATEGORIZACIÓN ===
  category: {
    type: DataTypes.ENUM(
      'INFRASTRUCTURE', // Infraestructura (servidores, hosting, etc.)
      'MARKETING', // Marketing y publicidad
      'PERSONNEL', // Personal y recursos humanos
      'OFFICE', // Oficina y suministros
      'TECHNOLOGY', // Tecnología y software
      'LEGAL', // Legal y contabilidad
      'TRAVEL', // Viajes y representación
      'TRAINING', // Capacitación y desarrollo
      'MAINTENANCE', // Mantenimiento y soporte
      'UTILITIES', // Servicios públicos
      'INSURANCE', // Seguros
      'TAXES', // Impuestos y tasas
      'OTHER' // Otros gastos
    ),
    allowNull: false,
    comment: 'Categoría del gasto'
  },
  subcategory: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Subcategoría específica del gasto'
  },
  
  // === FECHAS ===
  expenseDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha en que se realizó el gasto'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de vencimiento del pago (si aplica)'
  },
  
  // === INFORMACIÓN DEL PROVEEDOR ===
  vendor: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Nombre del proveedor o empresa'
  },
  vendorTaxId: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'NIT o identificación tributaria del proveedor'
  },
  vendorEmail: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    },
    comment: 'Email del proveedor'
  },
  
  // === COMPROBANTES (CLOUDINARY) ===
  receiptUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL del comprobante en Cloudinary'
  },
  receiptPublicId: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Public ID de Cloudinary para gestionar el archivo'
  },
  receiptType: {
    type: DataTypes.ENUM('IMAGE', 'PDF', 'NONE'),
    defaultValue: 'NONE',
    comment: 'Tipo de comprobante subido'
  },
  receiptOriginalName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Nombre original del archivo subido'
  },
  
  // === ESTADO Y APROBACIÓN ===
  status: {
    type: DataTypes.ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PAID'),
    defaultValue: 'PENDING',
    comment: 'Estado del gasto'
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID del usuario que aprobó el gasto'
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de aprobación'
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Razón del rechazo (si aplica)'
  },
  
  // === INFORMACIÓN CONTABLE ===
  taxAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    comment: 'Monto de impuestos incluidos'
  },
  taxRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    comment: 'Tasa de impuesto aplicada (%)'
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Indica si es un gasto recurrente'
  },
  recurringFrequency: {
    type: DataTypes.ENUM('MONTHLY', 'QUARTERLY', 'YEARLY'),
    allowNull: true,
    comment: 'Frecuencia del gasto recurrente'
  },
  
  // === INFORMACIÓN ADICIONAL ===
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales sobre el gasto'
  },
  internalReference: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Referencia interna o número de orden'
  },
  projectCode: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Código de proyecto asociado (si aplica)'
  },
  
  // === METADATOS ===
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'ID del usuario que creó el gasto'
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID del último usuario que modificó el gasto'
  }
}, {
  tableName: 'owner_expenses',
  timestamps: true,
  paranoid: true, // Soft delete
  indexes: [
    {
      fields: ['expenseDate']
    },
    {
      fields: ['category']
    },
    {
      fields: ['status']
    },
    {
      fields: ['vendor']
    },
    {
      fields: ['createdBy']
    },
    {
      fields: ['isActive']
    },
    {
      // Índice compuesto para reportes
      fields: ['expenseDate', 'category', 'status']
    }
  ]
});

// === MÉTODOS DE INSTANCIA ===
OwnerExpense.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  
  // Agregar campos calculados
  values.amountWithTax = parseFloat(values.amount) + parseFloat(values.taxAmount || 0);
  values.hasReceipt = values.receiptUrl ? true : false;
  values.isOverdue = values.dueDate && new Date(values.dueDate) < new Date() && values.status !== 'PAID';
  
  return values;
};

// === MÉTODOS ESTÁTICOS ===
OwnerExpense.getCategories = function() {
  return [
    { value: 'INFRASTRUCTURE', label: 'Infraestructura', description: 'Servidores, hosting, dominios' },
    { value: 'MARKETING', label: 'Marketing', description: 'Publicidad, promociones, campañas' },
    { value: 'PERSONNEL', label: 'Personal', description: 'Salarios, prestaciones, capacitación' },
    { value: 'OFFICE', label: 'Oficina', description: 'Suministros, mobiliario, equipos' },
    { value: 'TECHNOLOGY', label: 'Tecnología', description: 'Software, licencias, herramientas' },
    { value: 'LEGAL', label: 'Legal', description: 'Abogados, contadores, notarías' },
    { value: 'TRAVEL', label: 'Viajes', description: 'Transporte, hospedaje, alimentación' },
    { value: 'TRAINING', label: 'Capacitación', description: 'Cursos, certificaciones, eventos' },
    { value: 'MAINTENANCE', label: 'Mantenimiento', description: 'Soporte técnico, reparaciones' },
    { value: 'UTILITIES', label: 'Servicios', description: 'Internet, teléfono, electricidad' },
    { value: 'INSURANCE', label: 'Seguros', description: 'Pólizas de seguro' },
    { value: 'TAXES', label: 'Impuestos', description: 'Impuestos y tasas gubernamentales' },
    { value: 'OTHER', label: 'Otros', description: 'Gastos diversos' }
  ];
};

OwnerExpense.getStatuses = function() {
  return [
    { value: 'DRAFT', label: 'Borrador', color: 'gray' },
    { value: 'PENDING', label: 'Pendiente', color: 'yellow' },
    { value: 'APPROVED', label: 'Aprobado', color: 'green' },
    { value: 'REJECTED', label: 'Rechazado', color: 'red' },
    { value: 'PAID', label: 'Pagado', color: 'blue' }
  ];
};

module.exports = OwnerExpense;