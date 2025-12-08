/**
 * Test de los endpoints del API de permisos
 * Ejecutar con el servidor corriendo
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001';

// Coloca aquí un token válido de un usuario BUSINESS
const TOKEN = 'TU_TOKEN_AQUI'; // <-- Necesitas reemplazar esto

async function testPermissionsAPI() {
  try {
    console.log('🧪 Probando endpoints del API de permisos...\n');

    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };

    // 1. Obtener todos los permisos
    console.log('1️⃣ GET /api/permissions - Obtener todos los permisos');
    const allPerms = await axios.get(`${API_URL}/api/permissions`, { headers });
    console.log(`✅ ${allPerms.data.data.length} permisos obtenidos\n`);

    // 2. Obtener permisos de una categoría
    console.log('2️⃣ GET /api/permissions?category=appointments - Permisos de citas');
    const appointmentPerms = await axios.get(`${API_URL}/api/permissions?category=appointments`, { headers });
    console.log(`✅ ${appointmentPerms.data.data.length} permisos de appointments\n`);

    // 3. Obtener permisos por defecto de un rol
    console.log('3️⃣ GET /api/permissions/role/SPECIALIST - Permisos por defecto de SPECIALIST');
    const roleDefaults = await axios.get(`${API_URL}/api/permissions/role/SPECIALIST`, { headers });
    console.log(`✅ ${roleDefaults.data.data.length} permisos por defecto para SPECIALIST\n`);

    // 4. Obtener permisos agrupados
    console.log('4️⃣ GET /api/permissions/grouped - Permisos agrupados por categoría');
    const grouped = await axios.get(`${API_URL}/api/permissions/grouped`, { headers });
    console.log(`✅ Permisos agrupados en ${Object.keys(grouped.data.data).length} categorías\n`);

    console.log('🎉 ¡Todas las pruebas del API pasaron exitosamente!\n');
    console.log('💡 Para probar los endpoints de usuario (grant, revoke), necesitas:');
    console.log('   - businessId del usuario logueado');
    console.log('   - userId de un miembro del equipo');
    console.log('   - permissionKey para conceder/revocar');

  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testPermissionsAPI();
