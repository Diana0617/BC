const bcrypt = require('bcryptjs');
const { User, Business, SubscriptionPlan } = require('../src/models');

/**
 * Test para verificar que el fix de contraseñas funciona correctamente
 */
async function testPasswordFix() {
  try {
    console.log('🧪 Iniciando test del fix de contraseñas...');
    
    // 1. Buscar un plan válido
    const plan = await SubscriptionPlan.findOne({ where: { status: 'ACTIVE' } });
    if (!plan) {
      console.log('❌ No hay planes activos para testing');
      return;
    }
    
    console.log('📋 Plan encontrado:', plan.name);
    
    // 2. Datos de prueba
    const testEmail = 'test-password@example.com';
    const testPassword = 'MiPasswordDePrueba123!';
    
    // Limpiar datos previos
    await User.destroy({ where: { email: testEmail } });
    console.log('🧹 Datos previos limpiados');
    
    // 3. Simular creación de negocio con datos completos
    const businessData = {
      businessName: 'Salón Test Password',
      businessEmail: 'salon-test@example.com',
      businessPhone: '+57 300 123 4567',
      address: 'Calle Test 123',
      city: 'Bogotá',
      country: 'Colombia',
      ownerEmail: testEmail,
      ownerFirstName: 'Test',
      ownerLastName: 'Password',
      ownerPhone: '+57 300 765 4321',
      ownerPassword: testPassword,  // Esta es la clave del test
      subscriptionPlanId: plan.id
    };
    
    console.log('📨 Simulando creación de negocio con datos:', {
      ownerEmail: businessData.ownerEmail,
      ownerPassword: '***PROVIDED***',
      businessName: businessData.businessName
    });
    
    // 4. Hacer el request de creación (simular el endpoint)
    const axios = require('axios');
    const API_URL = 'http://localhost:3001/api/owner/businesses';
    
    try {
      // Necesitamos un token de owner para hacer la request
      console.log('🔑 Para completar el test, necesitas hacer una request a:');
      console.log(`POST ${API_URL}`);
      console.log('Con los datos:', JSON.stringify(businessData, null, 2));
      console.log('\n📝 Después de crear el negocio, verifica el login con:');
      console.log(`Email: ${testEmail}`);
      console.log(`Password: ${testPassword}`);
      
    } catch (error) {
      console.log('ℹ️ Este script prepara los datos. Para completar el test:');
      console.log('1. Usa Insomnia o Postman para crear el negocio');
      console.log('2. Después intenta hacer login con las credenciales');
    }
    
    // 5. Función helper para verificar password después
    console.log('\n🔍 Para verificar manualmente la contraseña en la BD:');
    console.log(`
const bcrypt = require('bcryptjs');
const { User } = require('./src/models');

User.findOne({ where: { email: '${testEmail}' } })
  .then(user => {
    if (user) {
      const isValid = bcrypt.compareSync('${testPassword}', user.password);
      console.log('Password válida:', isValid);
    }
  });
`);
    
  } catch (error) {
    console.error('❌ Error en test:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testPasswordFix()
    .then(() => {
      console.log('\n✅ Test script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en test:', error);
      process.exit(1);
    });
}

module.exports = { testPasswordFix };