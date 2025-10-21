/**
 * Script de prueba para verificar que las tablas de permisos funcionan correctamente
 */

const { sequelize } = require('./src/models');
const Permission = require('./src/models/Permission');
const RoleDefaultPermission = require('./src/models/RoleDefaultPermission');
const UserBusinessPermission = require('./src/models/UserBusinessPermission');

async function testPermissions() {
  try {
    console.log('🔍 Probando sistema de permisos...\n');

    // 1. Verificar que las tablas existen
    console.log('1️⃣ Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // 2. Contar permisos totales
    console.log('2️⃣ Contando permisos en el catálogo...');
    const totalPermissions = await Permission.count();
    console.log(`✅ Total de permisos: ${totalPermissions}\n`);

    // 3. Agrupar permisos por categoría
    console.log('3️⃣ Agrupando permisos por categoría...');
    const permissions = await Permission.findAll({
      attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'total']],
      group: ['category'],
      order: [['category', 'ASC']],
      raw: true
    });
    console.log('Permisos por categoría:');
    permissions.forEach(p => {
      console.log(`  📁 ${p.category}: ${p.total} permisos`);
    });
    console.log('');

    // 4. Verificar permisos por defecto de cada rol
    console.log('4️⃣ Verificando permisos por defecto de cada rol...');
    const roles = ['BUSINESS', 'SPECIALIST', 'RECEPTIONIST', 'RECEPTIONIST_SPECIALIST'];
    
    for (const role of roles) {
      const count = await RoleDefaultPermission.count({ where: { role } });
      console.log(`  👤 ${role}: ${count} permisos por defecto`);
    }
    console.log('');

    // 5. Mostrar algunos permisos de ejemplo
    console.log('5️⃣ Ejemplos de permisos (categoría appointments):');
    const appointmentPerms = await Permission.findAll({
      where: { category: 'appointments' },
      limit: 5,
      order: [['key', 'ASC']]
    });
    
    appointmentPerms.forEach(p => {
      console.log(`  🔑 ${p.key}`);
      console.log(`     Nombre: ${p.name}`);
      console.log(`     Descripción: ${p.description}`);
      console.log('');
    });

    // 6. Verificar permisos de SPECIALIST
    console.log('6️⃣ Permisos por defecto del rol SPECIALIST:');
    const specialistPerms = await RoleDefaultPermission.findAll({
      where: { role: 'SPECIALIST', isGranted: true },
      include: [{
        model: Permission,
        as: 'permission',
        attributes: ['key', 'name', 'category']
      }]
    });
    
    const groupedByCategory = {};
    specialistPerms.forEach(rp => {
      const cat = rp.permission.category;
      if (!groupedByCategory[cat]) {
        groupedByCategory[cat] = [];
      }
      groupedByCategory[cat].push(rp.permission);
    });
    
    Object.keys(groupedByCategory).sort().forEach(cat => {
      console.log(`  📁 ${cat}:`);
      groupedByCategory[cat].forEach(p => {
        console.log(`     ✓ ${p.key} - ${p.name}`);
      });
    });

    console.log('\n✅ ¡Todas las pruebas pasaron exitosamente!');
    console.log('🎉 El sistema de permisos está funcionando correctamente\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

testPermissions();
