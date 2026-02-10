/**
 * Script para actualizar permisos de BUSINESS a acceso completo
 * Agrega todos los permisos faltantes sin eliminar los existentes
 * Ejecutar con: node scripts/update-business-permissions.js
 */

const { sequelize } = require('../src/config/database');
const Permission = require('../src/models/Permission');
const RoleDefaultPermission = require('../src/models/RoleDefaultPermission');

async function updateBusinessPermissions() {
  try {
    console.log('🔧 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');

    // Permisos completos que BUSINESS debe tener
    const businessPermissions = [
      // Appointments - Control completo
      'appointments.view',
      'appointments.create',
      'appointments.edit',
      'appointments.delete',
      'appointments.manage_all',
      // Clients - Control completo
      'clients.view',
      'clients.create',
      'clients.edit',
      'clients.delete',
      'clients.view_history',
      // Payments - Control completo
      'payments.view',
      'payments.create',
      'payments.refund',
      'payments.reports',
      // Services - Control completo
      'services.view',
      'services.create',
      'services.edit',
      'services.delete',
      // Inventory - Control completo
      'inventory.view',
      'inventory.create',
      'inventory.edit',
      'inventory.delete',
      'inventory.movements',
      // Staff - Control completo
      'staff.view',
      'staff.create',
      'staff.edit',
      'staff.delete',
      'staff.permissions',
      // Reports - Control completo
      'reports.view',
      'reports.export',
      'reports.financial',
      // Settings - Control del negocio (NO subscription)
      'settings.view',
      'settings.edit',
      'settings.business',
      // NOTA: Expenses y otros permisos específicos se agregan en sus propios scripts
    ];

    console.log('📊 Verificando permisos existentes...\n');

    // Obtener todos los permisos
    const permissions = await Permission.findAll();
    const permissionMap = {};
    permissions.forEach(p => {
      permissionMap[p.key] = p.id;
    });

    console.log(`✅ ${permissions.length} permisos encontrados en el sistema\n`);

    // Verificar cuáles permisos de BUSINESS ya existen
    const existingBusinessPerms = await RoleDefaultPermission.findAll({
      where: { role: 'BUSINESS' },
      include: [{
        model: Permission,
        as: 'permission',
        attributes: ['key']
      }]
    });

    const existingKeys = new Set(existingBusinessPerms.map(p => p.permission.key));
    console.log(`📋 BUSINESS actualmente tiene ${existingKeys.size} permisos`);
    console.log('Permisos existentes:', Array.from(existingKeys).sort());
    console.log('');

    // Determinar qué permisos faltan
    const permissionsToAdd = businessPermissions.filter(key => {
      return !existingKeys.has(key) && permissionMap[key]; // Solo agregar si existe en el sistema y no está asignado
    });

    if (permissionsToAdd.length === 0) {
      console.log('✅ BUSINESS ya tiene todos los permisos necesarios');
      console.log(`\n📊 Total de permisos: ${existingKeys.size}\n`);
      process.exit(0);
    }

    console.log(`➕ Agregando ${permissionsToAdd.length} permisos faltantes:\n`);
    permissionsToAdd.forEach(key => {
      console.log(`   • ${key}`);
    });
    console.log('');

    // Agregar los permisos faltantes
    const rolePermissionsToInsert = permissionsToAdd.map(key => ({
      role: 'BUSINESS',
      permissionId: permissionMap[key],
      isGranted: true
    }));

    await RoleDefaultPermission.bulkCreate(rolePermissionsToInsert, {
      ignoreDuplicates: true
    });

    console.log(`✅ ${permissionsToAdd.length} permisos agregados exitosamente\n`);

    // Verificar resultado final
    const finalBusinessPerms = await RoleDefaultPermission.count({
      where: { role: 'BUSINESS', isGranted: true }
    });

    console.log(`📊 Total final de permisos de BUSINESS: ${finalBusinessPerms}\n`);
    console.log('🎉 ¡Actualización completada exitosamente!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al actualizar permisos:', error);
    console.error('Detalles:', error.message);
    process.exit(1);
  }
}

// Ejecutar
updateBusinessPermissions();
