const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_7ugmKHXAIJ4h@ep-wandering-dream-adoipu8b-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkEnums() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando enums en la base de datos...\n');
    
    // Verificar valores del enum role
    const roleEnum = await client.query(`
      SELECT enumlabel as role_value
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid FROM pg_type WHERE typname = 'enum_users_role'
      );
    `);
    
    console.log('📋 Valores disponibles para role:');
    roleEnum.rows.forEach(row => {
      console.log(`- ${row.role_value}`);
    });
    
    // Verificar valores del enum status
    const statusEnum = await client.query(`
      SELECT enumlabel as status_value
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid FROM pg_type WHERE typname = 'enum_users_status'
      );
    `);
    
    console.log('\n📋 Valores disponibles para status:');
    statusEnum.rows.forEach(row => {
      console.log(`- ${row.status_value}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkEnums();