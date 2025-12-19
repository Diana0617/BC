// Script para ejecutar en Azure SSH Console
// Ejecutar: node scripts/list-users-azure.js

const { sequelize } = require('../src/config/database');

async function listUsers() {
  try {
    console.log('🔐 Conectando a la base de datos...\n');
    await sequelize.authenticate();
    console.log('✅ Conectado\n');

    // Consultar usuarios con información de negocio
    const [users] = await sequelize.query(`
      SELECT 
        u.id,
        u.email,
        u.role,
        u."firstName",
        u."lastName",
        u."createdAt",
        b.id as "businessId",
        b.name as "businessName",
        b.status as "businessStatus"
      FROM users u
      LEFT JOIN businesses b ON u."businessId" = b.id
      ORDER BY u."createdAt" DESC
    `);

    console.log(`📊 Total de usuarios: ${users.length}\n`);
    console.log('═══════════════════════════════════════════════════════════════════════════════');

    // Agrupar por rol
    const usersByRole = users.reduce((acc, user) => {
      if (!acc[user.role]) {
        acc[user.role] = [];
      }
      acc[user.role].push(user);
      return acc;
    }, {});

    // Mostrar usuarios por rol
    Object.keys(usersByRole).sort().forEach(role => {
      console.log(`\n🏷️  ROL: ${role} (${usersByRole[role].length} usuarios)`);
      console.log('───────────────────────────────────────────────────────────────────────────────');
      
      usersByRole[role].forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Sin nombre');
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🆔 ID: ${user.id}`);
        if (user.businessId) {
          console.log(`   🏢 Negocio: ${user.businessName || 'Sin nombre'} (${user.businessStatus})`);
          console.log(`   🔗 Business ID: ${user.businessId}`);
        } else {
          console.log(`   🏢 Sin negocio asociado`);
        }
        console.log(`   📅 Creado: ${new Date(user.createdAt).toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`);
      });
    });

    // Resumen estadístico
    console.log('\n\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('📈 RESUMEN ESTADÍSTICO');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log(`\nTotal usuarios: ${users.length}`);
    
    Object.keys(usersByRole).sort().forEach(role => {
      const count = usersByRole[role].length;
      const percentage = ((count / users.length) * 100).toFixed(1);
      console.log(`  ${role}: ${count} (${percentage}%)`);
    });

    const usersWithBusiness = users.filter(u => u.businessId).length;
    const usersWithoutBusiness = users.length - usersWithBusiness;
    console.log(`\n👥 Usuarios con negocio: ${usersWithBusiness}`);
    console.log(`🚫 Usuarios sin negocio: ${usersWithoutBusiness}`);

    // Negocios únicos
    const uniqueBusinesses = new Set(users.filter(u => u.businessId).map(u => u.businessId));
    console.log(`🏢 Negocios únicos: ${uniqueBusinesses.size}`);

    await sequelize.close();
    console.log('\n✅ Conexión cerrada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.original) {
      console.error('   Detalles:', error.original.message);
    }
    process.exit(1);
  }
}

listUsers();
