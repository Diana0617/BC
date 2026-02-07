/**
 * Script para normalizar timestamps de tablas de permisos a camelCase en Azure
 * 
 * Este script se conecta directamente a Azure PostgreSQL y renombra:
 * - created_at → createdAt
 * - updated_at → updatedAt
 * 
 * En las tablas:
 * - permissions
 * - role_default_permissions  
 * - user_business_permissions
 */

const { Client } = require('pg');

// Obtener connection string de variable de entorno o usar valores por defecto
const connectionString = process.env.DATABASE_URL || 
  'postgresql://dbadmin:BeautyControl2024!@beautycontrol-db.postgres.database.azure.com:5432/beautycontrol?sslmode=require';

async function migrateToCalmelCase() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false // Azure requiere SSL
    }
  });

  try {
    console.log('🔌 Conectando a Azure PostgreSQL...');
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    const tables = [
      { name: 'permissions', display: 'Permisos' },
      { name: 'role_default_permissions', display: 'Permisos por Defecto de Roles' },
      { name: 'user_business_permissions', display: 'Permisos Personalizados de Usuarios' }
    ];

    for (const table of tables) {
      console.log(`📋 Migrando tabla: ${table.display} (${table.name})`);

      try {
        // Verificar si ya tiene columnas en camelCase
        const checkQuery = `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = $1 
            AND column_name IN ('createdAt', 'updatedAt', 'created_at', 'updated_at')
        `;
        const checkResult = await client.query(checkQuery, [table.name]);
        const columns = checkResult.rows.map(r => r.column_name);

        console.log(`   Columnas actuales: ${columns.join(', ')}`);

        // Si ya está en camelCase, saltar
        if (columns.includes('createdAt') && columns.includes('updatedAt')) {
          console.log(`   ℹ️  Ya está en camelCase, saltando...\n`);
          continue;
        }

        // Si tiene snake_case, convertir
        if (columns.includes('created_at')) {
          console.log('   🔄 Renombrando created_at → createdAt...');
          await client.query(`ALTER TABLE ${table.name} RENAME COLUMN created_at TO "createdAt"`);
          console.log('   ✅ created_at renombrado');
        }

        if (columns.includes('updated_at')) {
          console.log('   🔄 Renombrando updated_at → updatedAt...');
          await client.query(`ALTER TABLE ${table.name} RENAME COLUMN updated_at TO "updatedAt"`);
          console.log('   ✅ updated_at renombrado');
        }

        console.log(`   ✨ Tabla ${table.display} migrada exitosamente\n`);

      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log(`   ⚠️  Tabla ${table.name} no existe, saltando...\n`);
        } else {
          throw error;
        }
      }
    }

    console.log('🎉 Migración completada exitosamente!');
    console.log('\n📝 Siguiente paso: Ejecutar el seed de permisos:');
    console.log('   node scripts/seed-expenses-permissions.js\n');

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message);
    console.error('\nDetalles del error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar migración
if (require.main === module) {
  migrateToCalmelCase()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = migrateToCalmelCase;
