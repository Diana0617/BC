const { SpecialistProfile } = require('./src/models');

async function createTable() {
  try {
    console.log('Creating SpecialistProfile table...');
    await SpecialistProfile.sync({ force: true });
    console.log('✅ Table created successfully');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

createTable();
