const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SupplierContact = sequelize.define('SupplierContact', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  supplierId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'suppliers',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'supplier_contacts',
  timestamps: true,
  indexes: [
    {
      fields: ['supplierId']
    },
    {
      fields: ['isPrimary']
    }
  ]
});

module.exports = SupplierContact;