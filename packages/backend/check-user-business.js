const { sequelize, User, Business } = require('./src/models');

async function checkUser() {
  try {
    const userId = 'cd6660d5-8cf1-409f-acea-d54f5f073775'; // Del token JWT
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      console.log('❌ Usuario NO EXISTE');
      await sequelize.close();
      return;
    }
    
    console.log('✅ Usuario encontrado:');
    console.log('  Email:', user.email);
    console.log('  Role:', user.role);
    console.log('  BusinessId:', user.businessId);
    
    // Verificar si el business existe
    if (user.businessId) {
      const business = await Business.findByPk(user.businessId);
      
      if (business) {
        console.log('\n✅ Business EXISTE:');
        console.log('  Name:', business.name);
        console.log('  Email:', business.email);
      } else {
        console.log('\n❌ PROBLEMA: Business NO EXISTE');
        console.log('\nBusinesses disponibles en producción:');
        const businesses = await Business.findAll({ limit: 5 });
        businesses.forEach(b => {
          console.log(`  - ${b.name} (${b.id})`);
        });
        
        console.log('\n��� SOLUCIÓN:');
        console.log(`UPDATE users SET "businessId" = '952d2809-043a-4836-bfa7-63030ebd0e69' WHERE id = '${userId}';`);
        console.log('   ↑ Cambia al business "inno" (primer business disponible)');
      }
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUser();
