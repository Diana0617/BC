const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Branch = sequelize.define('Branch', {
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
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 20],
      is: /^[A-Z0-9_-]+$/i // Solo letras mayúsculas, números, guiones y underscores
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [5, 255]
    }
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Colombia'
  },
  zipCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  timezone: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'America/Bogota'
  },
  isMain: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si esta es la sucursal principal del negocio'
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE'),
    allowNull: false,
    defaultValue: 'ACTIVE'
  },
  businessHours: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '14:00', closed: false },
      sunday: { open: null, close: null, closed: true }
    },
    comment: 'Horarios de atención por día de la semana'
  },
  settings: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Configuraciones específicas de la sucursal'
  }
}, {
  tableName: 'branches',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['businessId', 'code'],
      name: 'unique_branch_code_per_business'
    },
    {
      fields: ['businessId', 'isMain'],
      where: {
        isMain: true
      },
      name: 'unique_main_branch_per_business'
    }
  ],
  scopes: {
    active: {
      where: {
        status: 'ACTIVE'
      }
    },
    byBusiness: function(businessId) {
      return {
        where: {
          businessId: businessId
        }
      };
    }
  }
});

// Relaciones
Branch.associate = (models) => {
  Branch.belongsTo(models.Business, {
    foreignKey: 'businessId',
    as: 'business'
  });

  Branch.hasMany(models.Appointment, {
    foreignKey: 'branchId',
    as: 'appointments'
  });

  Branch.belongsToMany(models.SpecialistProfile, {
    through: models.SpecialistBranchSchedule,
    foreignKey: 'branchId',
    otherKey: 'specialistId',
    as: 'specialists'
  });
};

module.exports = Branch;