const { sequelize, Business } = require('./src/models');

async function checkBusiness() {
  try {
    const businessId = 'b1effc61-cd62-45fc-a942-8eb8c144a721';
    
    const business = await Business.findByPk(businessId);
    
    if (business) {
      console.log('‚úÖ Business EXISTE:');
      console.log('  ID:', business.id);
      console.log('  Name:', business.name);
      console.log('  Email:', business.email);
      console.log('  Status:', business.status);
    } else {
      console.log('‚ùå Business NO EXISTE en la base de datos');
      console.log('\nEsto explica el error 500:');
      console.log('  - Las facturas intentan crear un proveedor con businessId');
      console.log('  - La FK businessId requiere que exista en la tabla businesses');
      console.log('  - Como no existe, falla la creaci√≥n');
      console.log('\nÌ¥ß Soluci√≥n: Usar un businessId v√°lido o crear el business');
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkBusiness();
