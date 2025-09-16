/**
 * Script para crear un negocio de prueba con usuarios para testing
 */

const { Business, User } = require('../src/models');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/database');

async function createTestBusiness() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    // Datos del negocio de prueba
    const businessData = {
      name: 'Salón de Prueba Business Control',
      subdomain: 'salon-prueba',
      email: 'admin@salon-prueba.com',
      phone: '+57 300 123 4567',
      address: JSON.stringify({
        street: 'Calle 123 #45-67',
        city: 'Bogotá',
        state: 'Cundinamarca',
        country: 'Colombia',
        postalCode: '110111'
      }),
      settings: JSON.stringify({
        timezone: 'America/Bogota',
        currency: 'COP',
        language: 'es',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h'
      }),
      subscription: JSON.stringify({
        planId: 'BASIC',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
        autoRenewal: true
      }),
      status: 'ACTIVE'
    };

    // Verificar si el negocio ya existe
    const existingBusiness = await Business.findOne({ 
      where: { subdomain: businessData.subdomain }
    });
    if (existingBusiness) {
      console.log('⚠️ El negocio ya existe con subdomain:', businessData.subdomain);
      console.log('💡 Usa: salon-prueba.businesscontrol.app');
      return;
    }

    // Crear el negocio
    const business = await Business.create(businessData);
    console.log('✅ Negocio creado:', business.name);
    console.log('🌐 Subdomain:', business.subdomain);

    // Usuarios de prueba
    const usersData = [
      {
        email: 'owner@salon-prueba.com',
        password: 'Owner123!',
        firstName: 'María',
        lastName: 'García',
        phone: '+573001111111',
        role: 'OWNER',
        businessId: business.id,
        isActive: true
      },
      {
        email: 'specialist@salon-prueba.com',
        password: 'Specialist123!',
        firstName: 'Ana',
        lastName: 'Rodríguez',
        phone: '+573002222222',
        role: 'SPECIALIST',
        businessId: business.id,
        isActive: true,
        specialistData: JSON.stringify({
          specialties: ['CORTE', 'PEINADO', 'MANICURE'],
          commissionRate: 40,
          schedule: {
            monday: { isActive: true, start: '09:00', end: '17:00' },
            tuesday: { isActive: true, start: '09:00', end: '17:00' },
            wednesday: { isActive: true, start: '09:00', end: '17:00' },
            thursday: { isActive: true, start: '09:00', end: '17:00' },
            friday: { isActive: true, start: '09:00', end: '17:00' },
            saturday: { isActive: true, start: '08:00', end: '16:00' },
            sunday: { isActive: false }
          }
        })
      },
      {
        email: 'receptionist@salon-prueba.com',
        password: 'Reception123!',
        firstName: 'Carmen',
        lastName: 'López',
        phone: '+573003333333',
        role: 'RECEPTIONIST',
        businessId: business.id,
        isActive: true
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

    console.log('\n🎉 Negocio de prueba creado exitosamente!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('🌐 Subdomain: salon-prueba');
    console.log('👑 Owner: owner@salon-prueba.com / Owner123!');
    console.log('✂️ Specialist: specialist@salon-prueba.com / Specialist123!');
    console.log('📞 Receptionist: receptionist@salon-prueba.com / Reception123!');
    console.log('\n💡 URL de acceso: salon-prueba.businesscontrol.app');

  } catch (error) {
    console.error('❌ Error creando el negocio de prueba:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  createTestBusiness();
}

module.exports = { createTestBusiness };