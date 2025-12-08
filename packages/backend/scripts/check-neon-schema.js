const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_7ugmKHXAIJ4h@ep-wandering-dream-adoipu8b-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkSchema() {
  const client = await pool.connect();
  
  try {
    console.log('📊 Verificando estructura de la base de datos Neon...\n');
    
    // Verificar si la tabla users existe y su estructura
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    console.log('¿Tabla users existe?', tableExists.rows[0].exists);
    
    if (tableExists.rows[0].exists) {
      // Obtener estructura de la tabla users
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users'
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📋 Estructura actual de la tabla users:');
      console.log('Column Name\t\tData Type\t\tNullable\tDefault');
      console.log('─'.repeat(70));
      columns.rows.forEach(col => {
        console.log(`${col.column_name.padEnd(20)}\t${col.data_type.padEnd(15)}\t${col.is_nullable}\t\t${col.column_default || 'NULL'}`);
      });
      
      // Contar registros
      const count = await client.query('SELECT COUNT(*) FROM users');
      console.log(`\n📊 Total de usuarios: ${count.rows[0].count}`);
      
      // Mostrar algunos ejemplos
      if (parseInt(count.rows[0].count) > 0) {
        const sample = await client.query('SELECT * FROM users LIMIT 3');
        console.log('\n👤 Ejemplos de usuarios:');
        console.log(JSON.stringify(sample.rows, null, 2));
      }
    }
    
    // Verificar otras tablas importantes
    const allTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n📂 Todas las tablas en la base de datos:');
    allTables.rows.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error al verificar schema:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkSchema();