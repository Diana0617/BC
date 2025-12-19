const { sequelize, User, Business } = require('./src/models');

async function listUsers() {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'role', 'businessId', 'createdAt'],
      limit: 20,
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`\nÌ≥ä Total usuarios en producci√≥n: ${users.length}\n`);
    
    for (const user of users) {
      console.log(`Email: ${user.email}`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  BusinessId: ${user.businessId}`);
      
      if (user.businessId) {
        const business = await Business.findByPk(user.businessId);
        console.log(`  Business: ${business ? business.name : '‚ùå NO EXISTE'}`);
      }
      console.log('');
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

listUsers();
