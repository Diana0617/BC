const axios = require('axios');

// Configuración del servidor
const BASE_URL = 'http://localhost:3001';

// Payload de prueba para crear un plan (sin módulos para evitar errores de FK)
const testPlanPayload = {
  name: "Plan Premium Test",
  description: "Plan premium de prueba para verificar fix de transacciones",
  price: 99.99,
  currency: "COP",
  duration: 1,
  durationType: "MONTH",
  maxUsers: 10,
  maxClients: 100,
  maxAppointments: 500,
  storageLimit: 1000,
  trialDays: 7,
  features: {
    "appointments": true,
    "inventory": true,
    "reports": true,
    "multiLocation": false
  },
  limitations: {
    "maxLocations": 1,
    "maxStaff": 10
  },
  isPopular: false,
  modules: [] // Sin módulos para simplificar la prueba
};

async function testPlanCreation() {
  try {
    console.log('🚀 Iniciando prueba de creación de plan...');
    console.log('📋 Payload a enviar:', JSON.stringify(testPlanPayload, null, 2));
    
    const response = await axios.post(`${BASE_URL}/api/owner/plans`, testPlanPayload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 segundos de timeout
    });
    
    console.log('✅ Plan creado exitosamente!');
    console.log('📊 Respuesta del servidor:', JSON.stringify(response.data, null, 2));
    console.log('🆔 ID del plan creado:', response.data.data?.id);
    
  } catch (error) {
    console.error('❌ Error en la creación del plan:');
    
    if (error.response) {
      // Error de respuesta del servidor
      console.error('🔴 Estado HTTP:', error.response.status);
      console.error('🔴 Mensaje:', error.response.data);
    } else if (error.request) {
      // Error de red
      console.error('🔴 Error de red - No se pudo conectar al servidor');
      console.error('🔴 Detalles:', error.message);
    } else {
      // Error desconocido
      console.error('🔴 Error desconocido:', error.message);
    }
  }
}

// Ejecutar la prueba
testPlanCreation();