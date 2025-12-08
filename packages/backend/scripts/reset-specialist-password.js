const bcrypt = require('bcryptjs');
const path = require('path');

// Cargar .env desde el directorio correcto
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../src/models/User');

async function resetPassword() {
  try {
    const email = 'felipeosoriolobeto@gmail.com';
    const newPassword = 'Admin*7754';

    console.log(`🔐 Reseteando contraseña para: ${email}`);
    
    // Buscar usuario
    const user = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      console.log('❌ No se encontró el usuario');
      process.exit(1);
    }

    console.log('✅ Usuario encontrado:', {
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('✅ Contraseña hasheada');

    // Actualizar contraseña
    await user.update({ password: hashedPassword });

    console.log('✅ Contraseña actualizada exitosamente');
    console.log('\n📋 Credenciales actualizadas:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}`);
    console.log(`   Role: ${user.role}`);
    console.log('\n✨ Ahora puedes hacer login con estas credenciales');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

resetPassword();
