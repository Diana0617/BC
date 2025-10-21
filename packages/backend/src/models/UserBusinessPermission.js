const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserBusinessPermission = sequelize.define('UserBusinessPermission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Usuario al que se le concede/revoca el permiso'
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'business_id',
    references: {
      model: 'businesses',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Negocio en el que aplica el permiso'
  },
  permissionId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'permission_id',
    references: {
      model: 'permissions',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Permiso que se concede/revoca'
  },
  isGranted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_granted',
    comment: 'true = concedido (override), false = revocado (override)'
  },
  grantedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'granted_by',
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que concedió o revocó el permiso'
  },
  grantedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'granted_at',
    comment: 'Fecha en que se concedió el permiso'
  },
  revokedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'revoked_at',
    comment: 'Fecha en que se revocó el permiso (si isGranted=false)'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas sobre por qué se concedió/revocó este permiso'
  }
}, {
  tableName: 'user_business_permissions',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['userId', 'businessId', 'permissionId'],
      unique: true
    },
    {
      fields: ['userId', 'businessId']
    },
    {
      fields: ['permissionId']
    }
  ]
});

module.exports = UserBusinessPermission;
