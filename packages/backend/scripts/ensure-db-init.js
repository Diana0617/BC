require('dotenv').config();
const { sequelize } = require('../src/models');

/**
 * Script que verifica si la base de datos está inicializada
 * Si no lo está, devuelve código de error para activar db:init
 */

async function checkDatabaseInitialized() {
  try {
    console.log('🔍 Verificando si la base de datos está inicializada...');

    // Verificar conexión
    await sequelize.authenticate();
    
    // Intentar una consulta simple para verificar si existen las tablas
    const { User } = require('../src/models');
    const userCount = await User.count();
    
    console.log(`✅ Base de datos inicializada - ${userCount} usuarios encontrados`);
    process.exit(0);
    
  } catch (error) {
    console.log('⚠️ Base de datos no inicializada o error:', error.message);
    process.exit(1); // Código de error para activar db:init
  }
}

// Solo ejecutar si es llamado directamente
if (require.main === module) {
  checkDatabaseInitialized();
}

module.exports = { checkDatabaseInitialized };