const models = require('./src/models');

async function createTable() {
  try {
    console.log('Creating SpecialistService table...');
    await models.SpecialistService.sync({ force: true });
    console.log('✅ SpecialistService table created successfully');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

createTable();
