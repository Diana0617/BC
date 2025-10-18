const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DATABASE_URL = 'postgresql://neondb_owner:npg_sVkni1pYdKP4@ep-divine-bread-adt4an18-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createTestUser() {
  const client = await pool.connect();
  
  try {
    console.log('👤 Creando usuario de prueba para producción...\n');
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);
    
    const testUser = {
      id: uuidv4(),
      email: 'Owner@bc.com',
      password: hashedPassword,
      firstName: 'Owner',
      lastName: 'Usuario',
      role: 'OWNER'
    };
    
    // Verificar si el usuario ya existe
    const existingUser = await client.query('SELECT email FROM users WHERE email = $1', [testUser.email]);
    
    if (existingUser.rows.length > 0) {
      console.log('ℹ️  Usuario ya existe, actualizando...');
      
      const updateQuery = `
        UPDATE users 
        SET password = $1, "firstName" = $2, "lastName" = $3, role = $4, "updatedAt" = NOW()
        WHERE email = $5
        RETURNING id, email, "firstName", "lastName", role, "createdAt"
      `;
      
      const result = await client.query(updateQuery, [
        testUser.password,
        testUser.firstName,
        testUser.lastName,
        testUser.role,
        testUser.email
      ]);
      
      console.log('✅ Usuario actualizado:');
      console.log(JSON.stringify(result.rows[0], null, 2));
      
    } else {
      console.log('➕ Creando nuevo usuario...');
      
      const insertQuery = `
        INSERT INTO users (id, email, password, "firstName", "lastName", role, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING id, email, "firstName", "lastName", role, "createdAt"
      `;
      
      const result = await client.query(insertQuery, [
        testUser.id,
        testUser.email,
        testUser.password,
        testUser.firstName,
        testUser.lastName,
        testUser.role
      ]);
      
      console.log('✅ Usuario creado:');
      console.log(JSON.stringify(result.rows[0], null, 2));
    }
    
    console.log('\n🔐 Credenciales de prueba:');
    console.log('Email: admin@beautycontrol.com');
    console.log('Password: AdminPassword123!');
    
  } catch (error) {
    console.error('❌ Error al crear usuario:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createTestUser();