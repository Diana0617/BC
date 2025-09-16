/**
 * Script para crear usuarios de prueba para el negocio existente
 */

const { Business, User } = require('../src/models');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/database');

async function createTestUsers() {
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
      console.log('💡 Ejecuta primero: node scripts/create-test-business.js');
      return;
    }

    console.log('✅ Negocio encontrado:', business.name);

    // Usuarios de prueba
    const usersData = [
      {
        email: 'owner@salon-prueba.com',
        password: 'Owner123!',
        firstName: 'María',
        lastName: 'García',
        phone: '+573001111111',
        role: 'BUSINESS',
        businessId: business.id,
        status: 'ACTIVE'
      },
      {
        email: 'specialist@salon-prueba.com',
        password: 'Specialist123!',
        firstName: 'Ana',
        lastName: 'Rodríguez',
        phone: '+573002222222',
        role: 'SPECIALIST',
        businessId: business.id,
        status: 'ACTIVE'
      },
      {
        email: 'receptionist@salon-prueba.com',
        password: 'Reception123!',
        firstName: 'Carmen',
        lastName: 'López',
        phone: '+573003333333',
        role: 'RECEPTIONIST',
        businessId: business.id,
        status: 'ACTIVE'
      }
    ];

    // Crear usuarios
    for (const userData of usersData) {
      try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ 
          where: {
            email: userData.email, 
            businessId: business.id
          }
        });
        
        if (existingUser) {
          console.log(`⚠️ Usuario ya existe: ${userData.email}`);
          continue;
        }

        // Hashear la contraseña
        userData.password = await bcrypt.hash(userData.password, 12);
        
        // Crear el usuario
        const user = await User.create(userData);
        console.log(`✅ Usuario creado: ${user.email} (${user.role})`);
      } catch (error) {
        console.error(`❌ Error creando usuario ${userData.email}:`, error.message);
      }
    }

    console.log('\n🎉 Usuarios de prueba creados exitosamente!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('🌐 Subdomain: salon-prueba');
    console.log('👑 Business: owner@salon-prueba.com / Owner123!');
    console.log('✂️ Specialist: specialist@salon-prueba.com / Specialist123!');
    console.log('📞 Receptionist: receptionist@salon-prueba.com / Reception123!');
    console.log('\n💡 URL de acceso: salon-prueba.businesscontrol.app');

  } catch (error) {
    console.error('❌ Error creando los usuarios de prueba:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  createTestUsers();
}

module.exports = { createTestUsers };