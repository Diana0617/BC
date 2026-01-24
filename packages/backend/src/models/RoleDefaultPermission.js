const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RoleDefaultPermission = sequelize.define('RoleDefaultPermission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  role: {
    type: DataTypes.ENUM('OWNER', 'BUSINESS', 'SPECIALIST', 'RECEPTIONIST', 'RECEPTIONIST_SPECIALIST'),
    allowNull: false,
    comment: 'Rol al que aplica este permiso por defecto'
  },
  permissionId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'permission_id',
    references: {
      model: 'permissions',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  isGranted: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_granted',
    comment: 'Si el permiso está concedido por defecto para este rol'
  }
}, {
  tableName: 'role_default_permissions',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['role', 'permissionId'],
      unique: true
    }
  ]
});

module.exports = RoleDefaultPermission;
