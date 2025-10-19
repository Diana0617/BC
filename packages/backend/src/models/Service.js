const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Service = sequelize.define('Service', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  duration: {
    type: DataTypes.INTEGER, // minutos
    allowNull: false,
    validate: {
      min: 1
    }
  },
  requiresConsent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si este servicio requiere consentimiento firmado del cliente'
  },
  consentTemplateId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'consent_templates',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'Template de consentimiento por defecto para este servicio'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^#[0-9A-F]{6}$/i
    }
  },
  preparationTime: {
    type: DataTypes.INTEGER, // minutos antes del servicio
    allowNull: false,
    defaultValue: 0
  },
  cleanupTime: {
    type: DataTypes.INTEGER, // minutos después del servicio
    allowNull: false,
    defaultValue: 0
  },
  maxConcurrent: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  requiresEquipment: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  skillsRequired: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  images: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  bookingSettings: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      onlineBookingEnabled: true,
      advanceBookingDays: 30,
      requiresApproval: false,
      allowWaitlist: true
    }
  },
  tags: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  // Campos para servicios multi-sesión / paquetes
  isPackage: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si este servicio es un paquete multi-sesión'
  },
  packageType: {
    type: DataTypes.ENUM('SINGLE', 'MULTI_SESSION', 'WITH_MAINTENANCE'),
    allowNull: false,
    defaultValue: 'SINGLE',
    comment: 'Tipo de paquete: SINGLE (sesión única), MULTI_SESSION (múltiples sesiones), WITH_MAINTENANCE (con mantenimientos)'
  },
  packageConfig: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Configuración del paquete: { sessions: number, sessionInterval: number, maintenanceInterval: number, maintenanceSessions: number, pricing: { perSession: number, discount: number } }'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Precio total del paquete completo'
  },
  allowPartialPayment: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Permite pago por sesión o solo pago completo upfront'
  },
  pricePerSession: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Precio por sesión individual si se permite pago parcial'
  }
}, {
  tableName: 'services',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId', 'isActive']
    },
    {
      fields: ['businessId', 'category']
    },
    {
      fields: ['isPackage']
    }
  ]
});

// Métodos de instancia para paquetes
Service.prototype.isMultiSession = function() {
  return this.isPackage && this.packageType === 'MULTI_SESSION';
};

Service.prototype.hasMaintenanceSessions = function() {
  return this.isPackage && this.packageType === 'WITH_MAINTENANCE';
};

Service.prototype.getTotalSessions = function() {
  if (!this.isPackage || !this.packageConfig) return 1;
  
  if (this.packageType === 'MULTI_SESSION') {
    return this.packageConfig.sessions || 1;
  }
  
  if (this.packageType === 'WITH_MAINTENANCE') {
    return 1 + (this.packageConfig.maintenanceSessions || 0);
  }
  
  return 1;
};

Service.prototype.calculatePackagePrice = function() {
  if (!this.isPackage) return parseFloat(this.price);
  
  if (this.totalPrice) {
    return parseFloat(this.totalPrice);
  }
  
  // Calcular basado en precio por sesión si está disponible
  if (this.pricePerSession) {
    return parseFloat(this.pricePerSession) * this.getTotalSessions();
  }
  
  return parseFloat(this.price);
};

module.exports = Service;