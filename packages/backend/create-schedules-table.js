const { Schedule } = require('./src/models');

async function createTable() {
  try {
    console.log('Creating Schedule table...');
    await Schedule.sync({ force: true });
    console.log('✅ Schedule table created successfully');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

createTable();
