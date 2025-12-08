require('dotenv').config();
const { sequelize } = require('../src/models');

/**
 * Script para verificar tablas existentes en la base de datos
 */

async function checkTables() {
  try {
    console.log('🔍 Verificando tablas existentes en la base de datos...');

    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Obtener lista de tablas
    const [results] = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('📋 Tablas existentes:');
    results.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Verificar específicamente las tablas relacionadas con especialistas
    const specialistTables = results.filter(row =>
      row.table_name.includes('specialist') ||
      row.table_name.includes('branch')
    );

    if (specialistTables.length > 0) {
      console.log('\n👤 Tablas relacionadas con especialistas:');
      specialistTables.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log('\n⚠️  No se encontraron tablas relacionadas con especialistas');
    }

  } catch (error) {
    console.error('❌ Error verificando tablas:', error);
    process.exit(1);
  } finally {
    // Cerrar conexión
    await sequelize.close();
    console.log('🔒 Conexión a la base de datos cerrada');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkTables();
}

module.exports = { checkTables };