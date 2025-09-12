const { User } = require('./src/models');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    console.log('🔍 Buscando usuario existente...');
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ 
      where: { email: 'test@example.com' },
      raw: true 
    });
    
    if (existingUser) {
      console.log('👤 Usuario test@example.com ya existe:');
      console.log('- Status:', existingUser.status);
      console.log('- Role:', existingUser.role);
      
      // Probar login con este usuario
      const passwordCheck = await bcrypt.compare('Test123!', existingUser.password);
      console.log('- Password Test123! funciona:', passwordCheck);
      
      return existingUser;
    }
    
    console.log('➕ Creando nuevo usuario de prueba...');
    
    // Crear nuevo usuario (NO hasheamos la contraseña aquí porque el modelo lo hace automáticamente)
    const newUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'Test123!', // Sin hashear, el hook del modelo lo hará
      phone: '+573001234567',
      role: 'CLIENT',
      status: 'ACTIVE',
      emailVerified: true
    });
    
    console.log('✅ Usuario creado exitosamente:');
    console.log('- Email: test@example.com');
    console.log('- Password: Test123!');
    console.log('- Status:', newUser.status);
    console.log('- Role:', newUser.role);
    
    return newUser;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testLogin() {
  try {
    console.log('\n🔐 Probando login...');
    
    const user = await User.findOne({
      where: { 
        email: 'test@example.com',
        status: 'ACTIVE'
      }
    });
    
    if (!user) {
      console.log('❌ Usuario no encontrado con status ACTIVE');
      return;
    }
    
    const isPasswordValid = await bcrypt.compare('Test123!', user.password);
    console.log('🔑 Password válida:', isPasswordValid);
    
    if (isPasswordValid) {
      console.log('🎉 ¡Login exitoso!');
      console.log('Puedes usar estas credenciales en la web app:');
      console.log('Email: test@example.com');
      console.log('Password: Test123!');
    }
    
  } catch (error) {
    console.error('❌ Error en login:', error.message);
  }
}

async function main() {
  await createTestUser();
  await testLogin();
  process.exit(0);
}

main();