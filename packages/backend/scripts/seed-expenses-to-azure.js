/**
 * Seed de permisos de EXPENSES directo a Azure PostgreSQL
 * Este script se conecta explícitamente a Azure ignorando .env local
 */
const { Sequelize, DataTypes } = require('sequelize');

// Conexión directa a Azure
const sequelize = new Sequelize(
  'postgresql://dbadmin:BeautyControl2024!@beautycontrol-db.postgres.database.azure.com:5432/beautycontrol?sslmode=require',
  {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  }
);

// Definir modelos (igual que los originales pero inline)
const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'permissions',
  timestamps: true
});

const RoleDefaultPermission = sequelize.define('RoleDefaultPermission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  role: {
    type: DataTypes.ENUM('OWNER', 'BUSINESS', 'SPECIALIST', 'RECEPTIONIST', 'RECEPTIONIST_SPECIALIST'),
    allowNull: false
  },
  permissionId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'permission_id'
  },
  isGranted: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_granted'
  }
}, {
  tableName: 'role_default_permissions',
  timestamps: true
});

// Definir asociaciones
Permission.hasMany(RoleDefaultPermission, {
  foreignKey: 'permissionId',
  as: 'roleDefaults'
});
RoleDefaultPermission.belongsTo(Permission, {
  foreignKey: 'permissionId',
  as: 'permission'
});

async function seedExpensesPermissionsToAzure() {
  try {
    console.log('🔌 Conectando a Azure PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    console.log('📝 Creando permisos de EXPENSES en Azure...\n');

    const expensesPermissions = [
      {
        key: 'expenses.view',
        name: 'Ver Gastos',
        description: 'Permite ver la lista de gastos y sus detalles',
        category: 'EXPENSES',
        isActive: true
      },
      {
        key: 'expenses.create',
        name: 'Crear Gastos',
        description: 'Permite registrar nuevos gastos',
        category: 'EXPENSES',
        isActive: true
      },
      {
        key: 'expenses.edit',
        name: 'Editar Gastos',
        description: 'Permite modificar gastos existentes',
        category: 'EXPENSES',
        isActive: true
      },
      {
        key: 'expenses.delete',
        name: 'Eliminar Gastos',
        description: 'Permite eliminar gastos',
        category: 'EXPENSES',
        isActive: true
      },
      {
        key: 'expenses.approve',
        name: 'Aprobar Gastos',
        description: 'Permite aprobar o rechazar gastos pendientes',
        category: 'EXPENSES',
        isActive: true
      },
      {
        key: 'expenses.categories',
        name: 'Gestionar Categorías de Gastos',
        description: 'Permite crear y administrar categorías de gastos',
        category: 'EXPENSES',
        isActive: true
      }
    ];

    // Crear permisos
    const createdPermissions = [];
    for (const permData of expensesPermissions) {
      const [permission, created] = await Permission.findOrCreate({
        where: { key: permData.key },
        defaults: permData
      });

      if (created) {
        console.log(`✅ Permiso creado: ${permData.key}`);
      } else {
        console.log(`ℹ️  Permiso ya existe: ${permData.key}`);
      }
      createdPermissions.push(permission);
    }

    console.log('\n📊 Configurando permisos por defecto...\n');

    // Defaults por rol
    const rolePermissions = [
      // BUSINESS: Todos los permisos en true
      { role: 'BUSINESS', permissionKey: 'expenses.view', isGranted: true },
      { role: 'BUSINESS', permissionKey: 'expenses.create', isGranted: true },
      { role: 'BUSINESS', permissionKey: 'expenses.edit', isGranted: true },
      { role: 'BUSINESS', permissionKey: 'expenses.delete', isGranted: true },
      { role: 'BUSINESS', permissionKey: 'expenses.approve', isGranted: true },
      { role: 'BUSINESS', permissionKey: 'expenses.categories', isGranted: true },
      
      // RECEPTIONIST: Sin acceso por defecto
      { role: 'RECEPTIONIST', permissionKey: 'expenses.view', isGranted: false },
      { role: 'RECEPTIONIST', permissionKey: 'expenses.create', isGranted: false },
      { role: 'RECEPTIONIST', permissionKey: 'expenses.edit', isGranted: false },
      
      // RECEPTIONIST_SPECIALIST: Sin acceso por defecto
      { role: 'RECEPTIONIST_SPECIALIST', permissionKey: 'expenses.view', isGranted: false },
      { role: 'RECEPTIONIST_SPECIALIST', permissionKey: 'expenses.create', isGranted: false },
      { role: 'RECEPTIONIST_SPECIALIST', permissionKey: 'expenses.edit', isGranted: false },
      
      // SPECIALIST: Sin acceso por defecto
      { role: 'SPECIALIST', permissionKey: 'expenses.view', isGranted: false },
      { role: 'SPECIALIST', permissionKey: 'expenses.create', isGranted: false }
    ];

    for (const rp of rolePermissions) {
      const permission = createdPermissions.find(p => p.key === rp.permissionKey);
      
      if (!permission) {
        console.log(`⚠️  Permiso no encontrado: ${rp.permissionKey}`);
        continue;
      }

      const [roleDefaultPerm, created] = await RoleDefaultPermission.findOrCreate({
        where: {
          role: rp.role,
          permissionId: permission.id
        },
        defaults: {
          role: rp.role,
          permissionId: permission.id,
          isGranted: rp.isGranted
        }
      });

      if (created) {
        console.log(`✅ Default creado: ${rp.role} -> ${rp.permissionKey} (${rp.isGranted})`);
      } else {
        console.log(`ℹ️  Default ya existe: ${rp.role} -> ${rp.permissionKey}`);
      }
    }

    console.log('\n✨ Seed de permisos de EXPENSES en Azure completado exitosamente\n');

  } catch (error) {
    console.error('\n❌ Error en seed:', error.message);
    console.error(error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar
seedExpensesPermissionsToAzure()
  .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
