/**
 * Script para RESETEAR la base de datos de Neon (PostgreSQL Cloud)
 * Elimina todas las tablas y permite recrearlas
 * 
 * IMPORTANTE: Este script NO elimina la base de datos completa
 * (no tenemos permisos en Neon), solo elimina todas las tablas.
 * 
 * Uso: DATABASE_URL=<tu-url-neon> node scripts/reset-neon-database.js
 * O configura DATABASE_URL en tu .env
 */

require('dotenv').config();
const { Client } = require('pg');

// Verificar que DATABASE_URL esté configurada
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL no está configurada');
  console.error('\n💡 Opciones:');
  console.error('   1. Configura DATABASE_URL en tu archivo .env');
  console.error('   2. Pasa la variable al ejecutar:');
  console.error('      DATABASE_URL=postgresql://... node scripts/reset-neon-database.js\n');
  process.exit(1);
}

console.log('🔗 Usando DATABASE_URL configurada');
console.log(`📍 Host: ${new URL(process.env.DATABASE_URL).host}\n`);

async function resetNeonDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Necesario para Neon
    }
  });

  try {
    console.log('🔌 Conectando a Neon PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado a Neon\n');

    console.log('🔍 Obteniendo lista de tablas...');
    
    // Obtener todas las tablas del schema public
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    const tables = tablesResult.rows.map(row => row.tablename);
    
    if (tables.length === 0) {
      console.log('⚠️  No hay tablas para eliminar\n');
    } else {
      console.log(`📋 Se encontraron ${tables.length} tablas:\n`);
      tables.forEach(table => console.log(`   - ${table}`));
      console.log('');

      console.log('🗑️  Eliminando todas las tablas...');
      
      // Eliminar todas las tablas en cascada
      for (const table of tables) {
        try {
          await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
          console.log(`   ✓ ${table} eliminada`);
        } catch (error) {
          console.log(`   ✗ Error al eliminar ${table}:`, error.message);
        }
      }
      console.log('');
    }

    // Verificar que no queden tablas
    const remainingTablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public';
    `);

    if (remainingTablesResult.rows.length === 0) {
      console.log('✅ Todas las tablas eliminadas correctamente\n');
    } else {
      console.log('⚠️  Algunas tablas no pudieron eliminarse:\n');
      remainingTablesResult.rows.forEach(row => {
        console.log(`   - ${row.tablename}`);
      });
      console.log('');
    }

    // También eliminar las secuencias (sequences) asociadas
    console.log('🔍 Eliminando secuencias (sequences)...');
    const sequencesResult = await client.query(`
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_schema = 'public';
    `);

    if (sequencesResult.rows.length > 0) {
      for (const row of sequencesResult.rows) {
        try {
          await client.query(`DROP SEQUENCE IF EXISTS "${row.sequence_name}" CASCADE;`);
          console.log(`   ✓ ${row.sequence_name} eliminada`);
        } catch (error) {
          console.log(`   ✗ Error al eliminar ${row.sequence_name}:`, error.message);
        }
      }
    } else {
      console.log('   (No hay secuencias para eliminar)');
    }
    console.log('');

    // Eliminar tipos ENUM personalizados
    console.log('🔍 Eliminando tipos ENUM personalizados...');
    const enumsResult = await client.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e' 
      AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    `);

    if (enumsResult.rows.length > 0) {
      for (const row of enumsResult.rows) {
        try {
          await client.query(`DROP TYPE IF EXISTS "${row.typname}" CASCADE;`);
          console.log(`   ✓ ${row.typname} eliminado`);
        } catch (error) {
          console.log(`   ✗ Error al eliminar ${row.typname}:`, error.message);
        }
      }
    } else {
      console.log('   (No hay tipos ENUM para eliminar)');
    }
    console.log('');

    await client.end();
    console.log('🔌 Desconectado de Neon\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Base de datos de Neon reseteada exitosamente\n');
    console.log('📋 Próximos pasos:');
    console.log('   1. Asegúrate de que el .env tenga DATABASE_URL configurada\n');
    console.log('   2. Ejecuta en el backend:');
    console.log('      FORCE_SYNC_DB=true npm start\n');
    console.log('   3. Espera a que se creen todas las tablas (verás logs de Sequelize)\n');
    console.log('   4. Ctrl+C para detener el servidor\n');
    console.log('   5. Ejecuta los seeders (si existen):');
    console.log('      node scripts/seed-modules.js');
    console.log('      node scripts/seed-rule-templates.js\n');
    console.log('   6. Cambia en .env:');
    console.log('      DISABLE_SYNC=true\n');
    console.log('   7. Ejecuta normalmente:');
    console.log('      npm start');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Error durante el reset de Neon:', error);
    console.error('\nDetalles del error:', error.message);
    process.exit(1);
  }
}

// Ejecutar el script
console.log('⚠️  ADVERTENCIA: Este script eliminará TODAS las tablas de la base de datos');
console.log(`📍 Base de datos: ${new URL(process.env.DATABASE_URL).pathname.slice(1)}`);
console.log(`🏠 Host: ${new URL(process.env.DATABASE_URL).host}`);
console.log('⚠️  ¿Estás seguro de que quieres continuar?\n');
console.log('Ejecutando en 3 segundos...\n');

setTimeout(() => {
  resetNeonDatabase();
}, 3000);
