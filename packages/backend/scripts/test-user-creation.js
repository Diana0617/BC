const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_7ugmKHXAIJ4h@ep-wandering-dream-adoipu8b-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testUserCreation() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Probando creación de usuario en Neon...\n');
    
    // Probar crear un usuario similar al que falla en producción
    const { v4: uuidv4 } = require('uuid');
    const testUser = {
      id: uuidv4(),
      email: `test${Date.now()}@test.com`,
      password: '$2a$10$test.hash.example',
      firstName: 'Test',
      lastName: 'User',
      role: 'CLIENT'
    };
    
    const query = `
      INSERT INTO users (id, email, password, "firstName", "lastName", role, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, email, "firstName", "lastName", role, "createdAt"
    `;
    
    const result = await client.query(query, [
      testUser.id,
      testUser.email, 
      testUser.password,
      testUser.firstName,
      testUser.lastName,
      testUser.role
    ]);
    
    console.log('✅ Usuario creado exitosamente:');
    console.log(JSON.stringify(result.rows[0], null, 2));
    
    // Limpiar el usuario de prueba
    await client.query('DELETE FROM users WHERE id = $1', [testUser.id]);
    console.log('🗑️  Usuario de prueba eliminado');
    
  } catch (error) {
    console.error('❌ Error al crear usuario:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

testUserCreation();