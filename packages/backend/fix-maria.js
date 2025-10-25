require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User } = require('./src/models');

async function fixMaria() {
  try {
    console.log('🔍 Buscando usuario Maria...\n');
    
    // Buscar usuario Maria (case insensitive)
    const maria = await User.findOne({
      where: { email: 'maria@maria.com' }
    });

    if (!maria) {
      console.log('❌ Usuario maria@maria.com NO encontrado');
      console.log('\n🔍 Buscando con mayúsculas...');
      
      const mariaUpper = await User.findOne({
        where: { email: 'Maria@maria.com' }
      });
      
      if (mariaUpper) {
        console.log('✅ Usuario encontrado con email:', mariaUpper.email);
        console.log('📝 Actualizando a minúsculas...');
        
        await mariaUpper.update({ email: 'maria@maria.com' });
        console.log('✅ Email actualizado a:', mariaUpper.email);
      } else {
        console.log('❌ Usuario Maria no existe en la base de datos');
        process.exit(1);
      }
    } else {
      console.log('✅ Usuario encontrado:', {
        id: maria.id,
        email: maria.email,
        firstName: maria.firstName,
        lastName: maria.lastName,
        role: maria.role,
        status: maria.status
      });
    }

    // Resetear contraseña a "maria" (8 caracteres)
    console.log('\n🔐 Reseteando contraseña a: "maria"');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('maria', salt);
    
    const user = await User.findOne({ where: { email: 'maria@maria.com' } });
    await user.update({ password: hashedPassword });
    
    console.log('✅ Contraseña actualizada correctamente');
    console.log('\n📋 Ahora puedes iniciar sesión con:');
    console.log('   Email: maria@maria.com');
    console.log('   Password: maria');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixMaria();
