const { Permission, RoleDefaultPermission } = require('../src/models');

/**
 * Verificar si los permisos de EXPENSES existen en Azure
 */
async function checkExpensesPermissions() {
  try {
    console.log('🔍 Verificando permisos de EXPENSES en Azure...\n');

    // Buscar todos los permisos de expenses
    const expensesPermissions = await Permission.findAll({
      where: { category: 'EXPENSES' },
      order: [['key', 'ASC']]
    });

    console.log('📋 Permisos de EXPENSES encontrados:', expensesPermissions.length);
    
    if (expensesPermissions.length === 0) {
      console.log('❌ NO hay permisos de EXPENSES en la base de datos');
      console.log('\n💡 Solución: Ejecutar el seed de permisos:');
      console.log('   node scripts/seed-expenses-permissions.js\n');
      process.exit(0);
    }

    console.log('\nDetalles:\n');
    expensesPermissions.forEach(p => {
      console.log(`  ✅ ${p.key.padEnd(25)} - ${p.name}`);
    });

    // Verificar defaults por rol
    console.log('\n📊 Permisos por defecto configurados:\n');
    
    const roles = ['BUSINESS', 'RECEPTIONIST', 'RECEPTIONIST_SPECIALIST', 'SPECIALIST'];
    
    for (const role of roles) {
      const defaults = await RoleDefaultPermission.findAll({
        where: { role },
        include: [{
          model: Permission,
          as: 'permission',
          where: { category: 'EXPENSES' }
        }]
      });

      console.log(`  ${role}:`);
      if (defaults.length === 0) {
        console.log(`    ⚠️  No tiene permisos de EXPENSES configurados`);
      } else {
        defaults.forEach(d => {
          const icon = d.isGranted ? '✅' : '❌';
          console.log(`    ${icon} ${d.permission.key}: ${d.isGranted}`);
        });
      }
      console.log('');
    }

    console.log('✅ Verificación completada\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkExpensesPermissions();
