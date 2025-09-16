/**
 * Script para actualizar el rol del usuario owner de OWNER a BUSINESS
 */

const { Business, User } = require('../src/models');
const { sequelize } = require('../src/config/database');

async function updateUserRole() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    // Buscar el negocio existente
    const business = await Business.findOne({ 
      where: { subdomain: 'salon-prueba' }
    });

    if (!business) {
      console.log('❌ No se encontró el negocio con subdomain: salon-prueba');
      return;
    }

    // Buscar el usuario owner
    const user = await User.findOne({
      where: {
        email: 'owner@salon-prueba.com',
        businessId: business.id
      }
    });

    if (!user) {
      console.log('❌ No se encontró el usuario owner@salon-prueba.com');
      return;
    }

    console.log(`📋 Usuario encontrado: ${user.email} con rol actual: ${user.role}`);

    // Actualizar el rol
    await user.update({ role: 'BUSINESS' });

    console.log(`✅ Rol actualizado exitosamente: ${user.email} ahora tiene rol BUSINESS`);
    console.log('\n🎉 Actualización completada!');

  } catch (error) {
    console.error('❌ Error actualizando el rol del usuario:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  updateUserRole();
}

module.exports = { updateUserRole };