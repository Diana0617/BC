const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkTokenUser() {
  try {
    console.log('\n🔍 Verificando userId del token...\n');
    
    const tokenUserId = 'cd6660d5-8cf1-409f-acea-d54f5f073775';
    
    // Buscar usuario con el ID del token
    const userResult = await pool.query(`
      SELECT id, email, role, "businessId"
      FROM users
      WHERE id = $1
    `, [tokenUserId]);
    
    if (userResult.rows.length === 0) {
      console.log('❌ Usuario del token NO EXISTE en producción\n');
      console.log('   Token userId:', tokenUserId);
      console.log('\n📋 Usuarios válidos en producción:');
      
      const allUsers = await pool.query(`
        SELECT u.id, u.email, u.role, u."businessId", b.name as business_name
        FROM users u
        LEFT JOIN businesses b ON u."businessId" = b.id
        WHERE u.email = 'mercedeslobeto@gmail.com'
      `);
      
      allUsers.rows.forEach(user => {
        console.log('\n   ✅ Usuario válido:');
        console.log('      Email:', user.email);
        console.log('      ID:', user.id);
        console.log('      BusinessId:', user.businessId);
        console.log('      Business:', user.business_name);
      });
      
      console.log('\n💡 SOLUCIÓN:');
      console.log('   1. Haz logout completo de la aplicación');
      console.log('   2. Vuelve a hacer login con mercedeslobeto@gmail.com');
      console.log('   3. Esto generará un token con el userId correcto\n');
    } else {
      console.log('✅ Usuario del token existe');
      console.log(userResult.rows[0]);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTokenUser();
