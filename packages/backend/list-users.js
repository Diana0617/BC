require('dotenv').config();
const { User } = require('./src/models');

async function listAllUsers() {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'status'],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    console.log('\n📋 Últimos 10 usuarios en la base de datos:\n');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.firstName} ${user.lastName} (${user.role}) - ${user.status}`);
    });
    
    console.log(`\n✅ Total encontrados: ${users.length}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

listAllUsers();
