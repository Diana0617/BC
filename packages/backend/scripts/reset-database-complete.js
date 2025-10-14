/**
 * Script para RECREAR COMPLETAMENTE la base de datos
 * Elimina y crea de nuevo la base de datos desde cero
 */

require('dotenv').config();
const { Client } = require('pg');

async function resetCompleteDatabase() {
  const dbName = process.env.DB_NAME || 'beauty_control_dev';
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPassword = process.env.DB_PASSWORD;
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || 5432;

  // Conectar a la base de datos postgres (no a beauty_control_dev)
  const client = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: 'postgres' // Conectar a la BD default
  });

  try {
    console.log('🔌 Conectando a PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado\n');

    console.log(`🗑️  Eliminando base de datos "${dbName}" si existe...`);
    
    // Terminar todas las conexiones activas a la base de datos
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = '${dbName}'
        AND pid <> pg_backend_pid();
    `);
    
    // Eliminar la base de datos
    await client.query(`DROP DATABASE IF EXISTS "${dbName}";`);
    console.log(`✅ Base de datos "${dbName}" eliminada\n`);

    console.log(`🆕 Creando base de datos "${dbName}" desde cero...`);
    await client.query(`CREATE DATABASE "${dbName}";`);
    console.log(`✅ Base de datos "${dbName}" creada\n`);

    await client.end();
    console.log('🔌 Desconectado de PostgreSQL\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Base de datos recreada exitosamente\n');
    console.log('📋 Próximos pasos:');
    console.log('   1. Ejecuta: FORCE_SYNC_DB=true npm start');
    console.log('   2. Espera a que se creen todas las tablas');
    console.log('   3. Ctrl+C para detener');
    console.log('   4. Ejecuta: node scripts/seed-modules.js');
    console.log('   5. Ejecuta: node scripts/seed-rule-templates.js');
    console.log('   6. Cambia DISABLE_SYNC=true en .env');
    console.log('   7. Ejecuta: npm start');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Error durante el reset completo:', error);
    process.exit(1);
  }
}

resetCompleteDatabase();
