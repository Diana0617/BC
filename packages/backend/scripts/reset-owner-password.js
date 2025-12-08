/**
 * Script para resetear la contraseña del usuario OWNER en producción
 * Uso: node scripts/reset-owner-password.js
 */

const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');

const OWNER_EMAIL = 'owner@owner.com'; // Minúsculas como está en la BD
const NEW_PASSWORD = 'Owner*7754';

async function resetOwnerPassword() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // Buscar el usuario OWNER
    const user = await User.findOne({ where: { email: OWNER_EMAIL } });

    if (!user) {
      console.log('❌ Usuario no encontrado:', OWNER_EMAIL);
      console.log('💡 Puedes crear uno nuevo con el script create-owner.js');
      process.exit(1);
    }

    console.log('✅ Usuario encontrado:', {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    });

    // Hashear la nueva contraseña
    console.log('🔐 Hasheando nueva contraseña...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, saltRounds);

    // Actualizar la contraseña
    await user.update({ password: hashedPassword });

    console.log('✅ Contraseña actualizada exitosamente');
    console.log('📧 Email:', OWNER_EMAIL);
    console.log('🔑 Nueva contraseña:', NEW_PASSWORD);

    // Verificar que la contraseña funcione
    const isValid = await bcrypt.compare(NEW_PASSWORD, user.password);
    console.log('🧪 Verificación:', isValid ? '✅ OK' : '❌ ERROR');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetOwnerPassword();
