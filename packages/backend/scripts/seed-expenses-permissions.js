const { Permission, RoleDefaultPermission } = require('../src/models');

/**
 * Script para crear permisos de EXPENSES si no existen
 */
async function seedExpensesPermissions() {
  try {
    console.log('🔐 Iniciando seed de permisos de EXPENSES...');

    const expensesPermissions = [
      {
        key: 'expenses.view',
        name: 'Ver Gastos',
        description: 'Permite ver el registro de gastos del negocio',
        category: 'EXPENSES',
        isActive: true
      },
      {
        key: 'expenses.create',
        name: 'Registrar Gastos',
        description: 'Permite registrar nuevos gastos del negocio',
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
        description: 'Permite eliminar gastos registrados',
        category: 'EXPENSES',
        isActive: true
      },
      {
        key: 'expenses.approve',
        name: 'Aprobar Gastos',
        description: 'Permite aprobar gastos pendientes',
        category: 'EXPENSES',
        isActive: true
      },
      {
        key: 'expenses.categories',
        name: 'Gestionar Categorías de Gastos',
        description: 'Permite crear y editar categorías de gastos',
        category: 'EXPENSES',
        isActive: true
      }
    ];

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
    }

    // Configurar permisos por defecto para roles
    console.log('\n📋 Configurando permisos por defecto...');

    const rolePermissions = [
      // ==========================================
      // BUSINESS: Tiene todos los permisos de gastos (OWNER del negocio)
      // ==========================================
      { role: 'BUSINESS', permissionKey: 'expenses.view', isGranted: true },
      { role: 'BUSINESS', permissionKey: 'expenses.create', isGranted: true },
      { role: 'BUSINESS', permissionKey: 'expenses.edit', isGranted: true },
      { role: 'BUSINESS', permissionKey: 'expenses.delete', isGranted: true },
      { role: 'BUSINESS', permissionKey: 'expenses.approve', isGranted: true },
      { role: 'BUSINESS', permissionKey: 'expenses.categories', isGranted: true },

      // ==========================================
      // RECEPTIONIST: Por defecto SIN acceso (debe otorgarse manualmente por BUSINESS)
      // Puede recibir: view, create, edit (NUNCA delete, approve o categories)
      // ==========================================
      { role: 'RECEPTIONIST', permissionKey: 'expenses.view', isGranted: false },
      { role: 'RECEPTIONIST', permissionKey: 'expenses.create', isGranted: false },
      { role: 'RECEPTIONIST', permissionKey: 'expenses.edit', isGranted: false },

      // ==========================================
      // RECEPTIONIST_SPECIALIST: Por defecto SIN acceso (debe otorgarse manualmente por BUSINESS)
      // Puede recibir: view, create, edit (NUNCA delete, approve o categories)
      // ==========================================
      { role: 'RECEPTIONIST_SPECIALIST', permissionKey: 'expenses.view', isGranted: false },
      { role: 'RECEPTIONIST_SPECIALIST', permissionKey: 'expenses.create', isGranted: false },
      { role: 'RECEPTIONIST_SPECIALIST', permissionKey: 'expenses.edit', isGranted: false },

      // ==========================================
      // SPECIALIST: Por defecto SIN acceso (debe otorgarse manualmente por BUSINESS)
      // Solo puede recibir: view, create (NUNCA edit, delete, approve o categories)
      // NOTA: Los especialistas NO tienen acceso a gastos en su dashboard por defecto
      // ==========================================
      { role: 'SPECIALIST', permissionKey: 'expenses.view', isGranted: false },
      { role: 'SPECIALIST', permissionKey: 'expenses.create', isGranted: false }
    ];

    for (const rp of rolePermissions) {
      const permission = await Permission.findOne({ where: { key: rp.permissionKey } });
      
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
        console.log(`✅ Permiso por defecto creado: ${rp.role} -> ${rp.permissionKey} (${rp.isGranted})`);
      } else {
        // Actualizar si ya existe
        await roleDefaultPerm.update({ isGranted: rp.isGranted });
        console.log(`🔄 Permiso por defecto actualizado: ${rp.role} -> ${rp.permissionKey} (${rp.isGranted})`);
      }
    }

    console.log('\n✨ Seed de permisos de EXPENSES completado exitosamente');
    return { success: true };

  } catch (error) {
    console.error('❌ Error en seed de permisos de EXPENSES:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedExpensesPermissions()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = seedExpensesPermissions;
