const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkUser() {
  try {
    console.log('\n🔍 Verificando usuario en producción...\n');
    
    const userId = 'cd6660d5-8cf1-409f-acea-d54f5f07375e';
    const email = 'mercedeslobeto@gmail.com';
    
    // Buscar por userId
    console.log('1️⃣ Buscando por userId:', userId);
    const userByIdResult = await pool.query(`
      SELECT id, email, role, "businessId", "firstName", "lastName"
      FROM users
      WHERE id = $1
    `, [userId]);
    
    if (userByIdResult.rows.length > 0) {
      console.log('✅ Usuario EXISTE con ese ID:');
      console.log(JSON.stringify(userByIdResult.rows[0], null, 2));
    } else {
      console.log('❌ Usuario NO EXISTE con ese ID');
    }
    
    // Buscar por email
    console.log('\n2️⃣ Buscando por email:', email);
    const userByEmailResult = await pool.query(`
      SELECT id, email, role, "businessId", "firstName", "lastName", "createdAt"
      FROM users
      WHERE email = $1
      ORDER BY "createdAt" DESC
    `, [email]);
    
    if (userByEmailResult.rows.length > 0) {
      console.log(`✅ Encontrados ${userByEmailResult.rows.length} usuario(s) con ese email:`);
      userByEmailResult.rows.forEach((user, index) => {
        console.log(`\n   Usuario ${index + 1}:`);
        console.log(JSON.stringify(user, null, 2));
      });
    } else {
      console.log('❌ No se encontró ningún usuario con ese email');
    }
    
    // Verificar conexión a BD
    console.log('\n3️⃣ Información de conexión:');
    const dbResult = await pool.query('SELECT current_database(), current_user');
    console.log('   Database:', dbResult.rows[0].current_database);
    console.log('   User:', dbResult.rows[0].current_user);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUser();
