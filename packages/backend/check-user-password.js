const { User } = require('./src/models');
const bcrypt = require('bcryptjs');

async function checkUserPassword() {
  try {
    console.log('🔍 Verificando usuario mercedeslobeto@gmail.com...');
    
    const user = await User.findOne({ 
      where: { email: 'mercedeslobeto@gmail.com' },
      raw: true 
    });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    console.log('👤 Usuario encontrado:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Status:', user.status);
    console.log('- Role:', user.role);
    console.log('- BusinessId:', user.businessId);
    console.log('- Password Hash:', user.password);
    
    // Probar diferentes contraseñas
    const passwords = [
      'TempPassword123!',
      'test123',
      'password',
      'Password123!',
      '123456'
    ];
    
    console.log('\n🔐 Probando contraseñas:');
    for (const pwd of passwords) {
      const isValid = await bcrypt.compare(pwd, user.password);
      console.log(`- "${pwd}": ${isValid ? '✅' : '❌'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkUserPassword();