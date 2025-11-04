/**
 * Script para limpiar TODA la base de datos
 * ⚠️ CUIDADO: Esto borrará TODOS los datos
 * Uso: node scripts/clear-database.js
 */

const { sequelize } = require('../src/config/database');

async function clearDatabase() {
  try {
    console.log('⚠️  ADVERTENCIA: Esto borrará TODOS los datos de la base de datos');
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');
    
    console.log('🗑️  Borrando todos los datos...');
    
    // Desactivar foreign key checks temporalmente
    await sequelize.query('SET CONSTRAINTS ALL DEFERRED');
    
    // Obtener todas las tablas
    const tables = await sequelize.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log(`📋 Tablas encontradas: ${tables.length}`);
    
    // Truncar cada tabla
    for (const { tablename } of tables) {
      if (tablename !== 'SequelizeMeta') { // No borrar migraciones
        console.log(`  ↳ Limpiando tabla: ${tablename}`);
        await sequelize.query(`TRUNCATE TABLE "${tablename}" CASCADE`);
      }
    }
    
    console.log('✅ Base de datos limpiada exitosamente');
    console.log('💡 Ahora puedes crear nuevos usuarios desde Insomnia');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearDatabase();
