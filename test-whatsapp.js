/**
 * Script de Prueba - WhatsApp Business Platform
 * 
 * Este script te ayuda a diagnosticar y probar la configuración de WhatsApp
 */

const BASE_URL = 'https://beautycontrol-api.azurewebsites.net';

// ============================================
// 1. PROBAR WEBHOOK (sin autenticación)
// ============================================

console.log('🧪 PRUEBAS DE WHATSAPP BUSINESS PLATFORM\n');

async function testWebhookVerification() {
  console.log('1️⃣ Probando verificación del webhook...');
  
  const url = `${BASE_URL}/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=beauty_control_webhook_verify_2024&hub.challenge=test123`;
  
  try {
    const response = await fetch(url);
    const text = await response.text();
    
    if (text === 'test123') {
      console.log('✅ Webhook verification: OK');
      console.log(`   Response: ${text}\n`);
      return true;
    } else {
      console.log('❌ Webhook verification: FAILED');
      console.log(`   Expected: test123`);
      console.log(`   Received: ${text}\n`);
      return false;
    }
  } catch (error) {
    console.log('❌ Webhook verification: ERROR');
    console.log(`   ${error.message}\n`);
    return false;
  }
}

// ============================================
// 2. PROBAR ENDPOINTS DE ADMIN (requiere autenticación)
// ============================================

async function testAdminEndpoints(token, businessId) {
  console.log('2️⃣ Probando endpoints de administración...');
  
  if (!token || !businessId) {
    console.log('⚠️  Saltando pruebas de admin (falta token o businessId)\n');
    return;
  }
  
  // 2.1 Obtener configuración de Embedded Signup
  try {
    console.log('   - GET /api/admin/whatsapp/embedded-signup/config');
    const response = await fetch(`${BASE_URL}/api/admin/whatsapp/embedded-signup/config`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ Embedded Signup Config: OK');
      console.log(`      App ID: ${data.data?.appId}`);
    } else {
      console.log('   ❌ Embedded Signup Config: FAILED');
      console.log(`      ${data.message}`);
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  // 2.2 Obtener información del token
  try {
    console.log('   - GET /api/admin/whatsapp/businesses/:businessId/tokens');
    const response = await fetch(`${BASE_URL}/api/admin/whatsapp/businesses/${businessId}/tokens`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ Token Info: OK');
      console.log(`      Has Token: ${data.data?.hasToken}`);
      console.log(`      Is Active: ${data.data?.isActive}`);
      console.log(`      Phone: ${data.data?.phoneNumber || 'Not configured'}`);
    } else {
      console.log('   ⚠️  Token Info: No token configured yet');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  console.log();
}

// ============================================
// 3. PROBAR CONEXIÓN DE WHATSAPP
// ============================================

async function testWhatsAppConnection(token, businessId) {
  console.log('3️⃣ Probando conexión con WhatsApp...');
  
  if (!token || !businessId) {
    console.log('⚠️  Saltando prueba de conexión (falta token o businessId)\n');
    return;
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/whatsapp/businesses/${businessId}/test-connection`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ WhatsApp Connection: OK');
      console.log(`   Phone: ${data.data?.phoneNumber}`);
      console.log(`   Status: ${data.data?.status}`);
      console.log(`   Quality: ${data.data?.quality}\n`);
    } else {
      console.log('❌ WhatsApp Connection: FAILED');
      console.log(`   ${data.message}\n`);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log();
  }
}

// ============================================
// 4. INSTRUCCIONES PARA CONFIGURAR TOKEN
// ============================================

function showTokenInstructions() {
  console.log('📋 INSTRUCCIONES PARA CONFIGURAR TOKEN\n');
  console.log('1. Ve a: https://developers.facebook.com/apps/1928881431390804/whatsapp-business/wa-getting-started/');
  console.log('2. Copia el "Temporary access token" (válido por 24 horas)');
  console.log('3. Copia el "Phone number ID" (debajo del número de teléfono)');
  console.log('4. Usa este curl para almacenar el token:\n');
  console.log(`curl -X POST ${BASE_URL}/api/admin/whatsapp/businesses/{TU_BUSINESS_ID}/tokens \\`);
  console.log(`  -H "Authorization: Bearer {TU_JWT_TOKEN}" \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{`);
  console.log(`    "accessToken": "{TOKEN_DE_META}",`);
  console.log(`    "phoneNumberId": "{PHONE_NUMBER_ID}",`);
  console.log(`    "phoneNumber": "+57XXXXXXXXXX",`);
  console.log(`    "metadata": {`);
  console.log(`      "displayName": "Beauty Control",`);
  console.log(`      "qualityRating": "GREEN"`);
  console.log(`    }`);
  console.log(`  }'\n`);
}

// ============================================
// EJECUTAR TODAS LAS PRUEBAS
// ============================================

async function runAllTests() {
  // Prueba 1: Webhook (no requiere auth)
  const webhookOk = await testWebhookVerification();
  
  if (!webhookOk) {
    console.log('⚠️  ATENCIÓN: El webhook no está funcionando correctamente.');
    console.log('   Verifica que el servidor esté corriendo y accesible públicamente.\n');
  }
  
  // Para pruebas de admin, necesitas proveer token y businessId
  const token = process.env.TEST_JWT_TOKEN || null;
  const businessId = process.env.TEST_BUSINESS_ID || null;
  
  if (!token || !businessId) {
    console.log('⚠️  Para probar endpoints de admin, configura:');
    console.log('   export TEST_JWT_TOKEN="tu_jwt_token"');
    console.log('   export TEST_BUSINESS_ID="tu_business_id"\n');
  } else {
    await testAdminEndpoints(token, businessId);
    await testWhatsAppConnection(token, businessId);
  }
  
  // Mostrar instrucciones
  showTokenInstructions();
  
  // Resumen final
  console.log('═══════════════════════════════════════════════════════');
  console.log('🎯 PRÓXIMOS PASOS:\n');
  console.log('1. ✅ Verificar webhook en Meta Developer Console');
  console.log('   URL: https://beautycontrol-api.azurewebsites.net/api/webhooks/whatsapp');
  console.log('   Token: beauty_control_webhook_verify_2024\n');
  console.log('2. 🔐 Configurar token de acceso para un negocio');
  console.log('   (ver instrucciones arriba)\n');
  console.log('3. 📱 Agregar número de prueba en Meta');
  console.log('   Settings > Phone Numbers > Add phone number\n');
  console.log('4. 📤 Enviar mensaje de prueba\n');
  console.log('═══════════════════════════════════════════════════════\n');
}

// Ejecutar
runAllTests().catch(console.error);
