/**
 * Script para probar el endpoint de Embedded Signup Config en producción
 * 
 * Uso: node test-embedded-config.js
 */

const https = require('https');

const BACKEND_URL = 'https://beautycontrol-api.azurewebsites.net';

// Necesitarás un token válido - obtenerlo desde la consola del navegador:
// localStorage.getItem('token')
const TOKEN = process.argv[2];

if (!TOKEN) {
  console.log('❌ Error: Debes proporcionar un token de autenticación');
  console.log('');
  console.log('📝 Uso:');
  console.log('  node test-embedded-config.js <tu-token>');
  console.log('');
  console.log('💡 Para obtener tu token:');
  console.log('  1. Abre tu app en el navegador');
  console.log('  2. Abre la consola (F12)');
  console.log('  3. Ejecuta: localStorage.getItem("token")');
  console.log('  4. Copia el token y úsalo aquí');
  process.exit(1);
}

console.log('🧪 Probando endpoint de Embedded Signup Config...\n');

const options = {
  hostname: 'beautycontrol-api.azurewebsites.net',
  path: '/api/admin/whatsapp/embedded-signup/config',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`📊 Status: ${res.statusCode}\n`);
    
    try {
      const json = JSON.parse(data);
      console.log('📦 Response:\n');
      console.log(JSON.stringify(json, null, 2));
      console.log('\n');
      
      if (json.success && json.data) {
        const { appId, configId } = json.data;
        
        console.log('✅ Respuesta exitosa\n');
        console.log('📱 App ID:', appId || '❌ FALTA');
        console.log('🔧 Config ID:', configId || '❌ FALTA');
        
        if (!appId) {
          console.log('\n⚠️  META_APP_ID no está configurado en Render');
        }
        if (!configId) {
          console.log('\n⚠️  WHATSAPP_CONFIG_ID no está configurado en Render');
        }
        
        if (appId && configId) {
          console.log('\n🎉 Todo configurado correctamente!');
        }
      } else {
        console.log('❌ Error en la respuesta');
      }
    } catch (error) {
      console.log('❌ Error parseando JSON:');
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error en la petición:', error.message);
});

req.end();
