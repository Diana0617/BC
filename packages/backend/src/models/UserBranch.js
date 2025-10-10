const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * UserBranch - Tabla intermedia para relación many-to-many entre User y Branch
 * Permite que especialistas y recepcionistas trabajen en múltiples sucursales
 */
const UserBranch = sequelize.define('UserBranch', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  branchId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'branches',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Indica si esta es la sucursal principal del usuario'
  },
  canManageSchedule: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si el usuario puede gestionar su horario en esta sucursal'
  },
  canCreateAppointments: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si el usuario puede crear citas en esta sucursal'
  },
  assignedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de asignación a la sucursal'
  },
  assignedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que realizó la asignación'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas sobre la asignación del usuario a esta sucursal'
  }
}, {
  tableName: 'user_branches',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'branchId'],
      name: 'unique_user_branch'
    },
    {
      fields: ['userId'],
      name: 'idx_user_branch_user'
    },
    {
      fields: ['branchId'],
      name: 'idx_user_branch_branch'
    },
    {
      fields: ['isDefault'],
      name: 'idx_user_branch_default'
    }
  ]
});

module.exports = UserBranch;
