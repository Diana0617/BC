const { sequelize, Business } = require('./src/models');

async function listBusinesses() {
  try {
    const businesses = await Business.findAll({
      attributes: ['id', 'name', 'email', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    console.log(`\ní³Š Total de businesses en producciÃ³n: ${businesses.length}\n`);
    
    businesses.forEach((b, i) => {
      console.log(`${i + 1}. ${b.name}`);
      console.log(`   ID: ${b.id}`);
      console.log(`   Email: ${b.email}`);
      console.log(`   Status: ${b.status}`);
      console.log(`   Creado: ${b.createdAt}`);
      console.log('');
    });
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

listBusinesses();
