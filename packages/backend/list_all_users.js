const { User, Business } = require('./src/models');

(async () => {
  try {
    const users = await User.findAll({
      limit: 20,
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`\n📊 Total usuarios en la BD: ${users.length}\n`);
    
    users.forEach(u => {
      console.log(`👤 ${u.firstName} ${u.lastName}`);
      console.log(`   email: ${u.email}`);
      console.log(`   role: ${u.role}`);
      console.log(`   businessId: ${u.businessId}`);
      console.log('');
    });
    
    const businesses = await Business.findAll();
    console.log(`\n🏢 Total negocios: ${businesses.length}\n`);
    businesses.forEach(b => {
      console.log(`   - ${b.name} (${b.id})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
