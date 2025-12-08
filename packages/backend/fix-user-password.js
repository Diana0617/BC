const { User } = require('./src/models');
const bcrypt = require('bcryptjs');

async function fixUserPassword() {
  try {
    console.log('🔧 Arreglando contraseña del usuario mercedeslobeto@gmail.com...');
    
    const user = await User.findOne({ 
      where: { email: 'mercedeslobeto@gmail.com' }
    });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    console.log('👤 Usuario encontrado, hasheando contraseña...');
    
    // Hashear la contraseña TempPassword123!
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('TempPassword123!', salt);
    
    // Actualizar la contraseña
    await user.update({ password: hashedPassword });
    
    console.log('✅ Contraseña actualizada correctamente');
    
    // Verificar que funciona
    const isValid = await bcrypt.compare('TempPassword123!', hashedPassword);
    console.log('🔐 Verificación:', isValid ? '✅ Funciona' : '❌ Error');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

fixUserPassword();