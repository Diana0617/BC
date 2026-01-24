const { User, Business } = require('./src/models');

(async () => {
  try {
    // Buscar Mercedes
    const mercedes = await User.findOne({
      where: { 
        email: 'mercedes.quintero.0920@gmail.com'
      }
    });
    
    if (!mercedes) {
      console.log('❌ Mercedes no encontrada');
      process.exit(0);
    }
    
    console.log('👤 Mercedes encontrada:');
    console.log('   userId:', mercedes.id);
    console.log('   businessId:', mercedes.businessId);
    console.log('   role:', mercedes.role);
    
    // Buscar el negocio
    const business = await Business.findOne({
      where: { id: mercedes.businessId }
    });
    
    if (business) {
      console.log('\n🏢 Negocio:');
      console.log('   name:', business.name);
      console.log('   id:', business.id);
    }
    
    // Buscar todos los usuarios de ese negocio
    const allUsers = await User.findAll({
      where: { businessId: mercedes.businessId }
    });
    
    console.log(`\n👥 Total usuarios en el negocio: ${allUsers.length}`);
    allUsers.forEach(u => {
      console.log(`   - ${u.firstName} ${u.lastName} (${u.role})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
