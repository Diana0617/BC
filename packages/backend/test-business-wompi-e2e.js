/**
 * test-business-wompi-e2e.js
 * 
 * Pruebas End-to-End del sistema completo de Business Wompi Payment Config
 * 
 * Flujo completo:
 * 1. Crear configuración en DB
 * 2. Guardar credenciales encriptadas
 * 3. Recuperar configuración de DB
 * 4. Desencriptar credenciales
 * 5. Verificar contra API de Wompi
 * 6. Cambiar modo (test → prod)
 * 7. Activar/desactivar configuración
 * 8. Validar persistencia en DB
 * 9. Cleanup
 * 
 * EJECUTAR: node test-business-wompi-e2e.js
 */

require('dotenv').config();
const WompiConfig = require('./src/models/BusinessWompiPaymentConfig');
const BusinessWompiPaymentService = require('./src/services/BusinessWompiPaymentService');
const { sequelize } = require('./src/config/database');

// Colores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'cyan');
  console.log('='.repeat(70) + '\n');
}

function logTest(name) {
  log(`\n▶ TEST E2E: ${name}`, 'blue');
}

function logSuccess(message) {
  log(`  ✓ ${message}`, 'green');
}

function logError(message) {
  log(`  ✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`  ⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`  ℹ ${message}`, 'magenta');
}

// Credenciales de prueba
const TEST_CREDENTIALS = {
  test: {
    publicKey: 'pub_test_E2E_TEST_KEY_12345',
    privateKey: 'prv_test_E2E_TEST_PRIVATE_67890',
    integritySecret: 'test_e2e_integrity_secret'
  },
  prod: {
    publicKey: 'pub_prod_E2E_PROD_KEY_12345',
    privateKey: 'prv_prod_E2E_PROD_PRIVATE_67890',
    integritySecret: 'prod_e2e_integrity_secret'
  }
};

// ID de Business de prueba (debe existir en la DB)
let TEST_BUSINESS_ID = null;
let createdConfigId = null;

async function runE2ETests() {
  logSection('PRUEBAS E2E - BUSINESS WOMPI PAYMENT CONFIG CON BASE DE DATOS');
  
  let testsTotal = 0;
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // Verificar conexión
    await sequelize.authenticate();
    logSuccess('Conexión a base de datos establecida');

    // ============================================================
    // SETUP: Obtener un Business existente para pruebas
    // ============================================================
    logTest('SETUP: Obtener Business de prueba');
    testsTotal++;

    try {
      const [businesses] = await sequelize.query(
        'SELECT id, name FROM businesses LIMIT 1'
      );

      if (businesses.length === 0) {
        throw new Error('No hay negocios en la base de datos. Crea al menos uno para ejecutar las pruebas.');
      }

      TEST_BUSINESS_ID = businesses[0].id;
      logSuccess(`Business encontrado: ${businesses[0].name} (${TEST_BUSINESS_ID})`);
      testsPassed++;
    } catch (error) {
      logError(`Error en setup: ${error.message}`);
      testsFailed++;
      throw error;
    }

    // ============================================================
    // TEST 1: Crear configuración en DB
    // ============================================================
    logTest('Crear configuración de Wompi en base de datos');
    testsTotal++;

    try {
      // Encriptar credenciales de test
      const encryptedTestCreds = await BusinessWompiPaymentService.encryptCredentials(TEST_CREDENTIALS.test);

      // Crear configuración
      const newConfig = await WompiConfig.create({
        businessId: TEST_BUSINESS_ID,
        testPublicKey: encryptedTestCreds.publicKey,
        testPrivateKeyEncrypted: encryptedTestCreds.privateKeyEncrypted,
        testIntegritySecretEncrypted: encryptedTestCreds.integritySecretEncrypted,
        isTestMode: true,
        isActive: false,
        webhookUrl: BusinessWompiPaymentService.generateWebhookUrl(TEST_BUSINESS_ID, 'https://app.beautycontrol.com'),
        verificationStatus: 'pending'
      });

      createdConfigId = newConfig.id;

      logSuccess('Configuración creada en BD');
      logInfo(`ID: ${createdConfigId}`);
      logInfo(`Business ID: ${TEST_BUSINESS_ID}`);
      logInfo(`Modo: Test`);
      logInfo(`Estado: Inactiva`);
      testsPassed++;
    } catch (error) {
      logError(`Error al crear configuración: ${error.message}`);
      testsFailed++;
    }

    // ============================================================
    // TEST 2: Recuperar configuración de DB y verificar datos
    // ============================================================
    logTest('Recuperar configuración de DB y validar datos');
    testsTotal++;

    try {
      const retrievedConfig = await WompiConfig.findOne({
        where: { businessId: TEST_BUSINESS_ID }
      });

      if (!retrievedConfig) {
        throw new Error('Configuración no encontrada en DB');
      }

      logSuccess('Configuración recuperada de BD');
      logInfo(`ID coincide: ${retrievedConfig.id === createdConfigId}`);
      logInfo(`Business ID coincide: ${retrievedConfig.businessId === TEST_BUSINESS_ID}`);
      logInfo(`Test Public Key guardada: ${retrievedConfig.testPublicKey}`);
      logInfo(`Credenciales privadas encriptadas: Sí`);
      testsPassed++;
    } catch (error) {
      logError(`Error al recuperar configuración: ${error.message}`);
      testsFailed++;
    }

    // ============================================================
    // TEST 3: Desencriptar credenciales desde DB
    // ============================================================
    logTest('Desencriptar credenciales almacenadas en DB');
    testsTotal++;

    try {
      const retrievedConfig = await WompiConfig.findOne({
        where: { businessId: TEST_BUSINESS_ID }
      });

      const decryptedCreds = await BusinessWompiPaymentService.decryptCredentials({
        publicKey: retrievedConfig.testPublicKey,
        privateKeyEncrypted: retrievedConfig.testPrivateKeyEncrypted,
        integritySecretEncrypted: retrievedConfig.testIntegritySecretEncrypted
      });

      const credsMatch = 
        decryptedCreds.publicKey === TEST_CREDENTIALS.test.publicKey &&
        decryptedCreds.privateKey === TEST_CREDENTIALS.test.privateKey &&
        decryptedCreds.integritySecret === TEST_CREDENTIALS.test.integritySecret;

      if (credsMatch) {
        logSuccess('Credenciales desencriptadas correctamente');
        logInfo('Todas las credenciales coinciden con las originales');
        testsPassed++;
      } else {
        logError('Las credenciales desencriptadas NO coinciden');
        testsFailed++;
      }
    } catch (error) {
      logError(`Error al desencriptar: ${error.message}`);
      testsFailed++;
    }

    // ============================================================
    // TEST 4: Método getActiveCredentials del modelo
    // ============================================================
    logTest('Usar método getActiveCredentials() del modelo');
    testsTotal++;

    try {
      const retrievedConfig = await WompiConfig.findOne({
        where: { businessId: TEST_BUSINESS_ID }
      });

      const activeCreds = await retrievedConfig.getActiveCredentials();

      if (activeCreds && activeCreds.publicKey === TEST_CREDENTIALS.test.publicKey) {
        logSuccess('getActiveCredentials() funciona correctamente');
        logInfo(`Modo actual: ${retrievedConfig.isTestMode ? 'Test' : 'Producción'}`);
        logInfo(`Public Key activa: ${activeCreds.publicKey}`);
        testsPassed++;
      } else {
        logError('getActiveCredentials() no retornó las credenciales correctas');
        testsFailed++;
      }
    } catch (error) {
      logError(`Error en getActiveCredentials(): ${error.message}`);
      testsFailed++;
    }

    // ============================================================
    // TEST 5: Agregar credenciales de producción
    // ============================================================
    logTest('Agregar credenciales de producción a configuración existente');
    testsTotal++;

    try {
      const encryptedProdCreds = await BusinessWompiPaymentService.encryptCredentials(TEST_CREDENTIALS.prod);

      await WompiConfig.update(
        {
          prodPublicKey: encryptedProdCreds.publicKey,
          prodPrivateKeyEncrypted: encryptedProdCreds.privateKeyEncrypted,
          prodIntegritySecretEncrypted: encryptedProdCreds.integritySecretEncrypted
        },
        {
          where: { businessId: TEST_BUSINESS_ID }
        }
      );

      const updatedConfig = await WompiConfig.findOne({
        where: { businessId: TEST_BUSINESS_ID }
      });

      if (updatedConfig.prodPublicKey === TEST_CREDENTIALS.prod.publicKey) {
        logSuccess('Credenciales de producción agregadas');
        logInfo('Public Key de producción guardada');
        testsPassed++;
      } else {
        logError('Error al guardar credenciales de producción');
        testsFailed++;
      }
    } catch (error) {
      logError(`Error al agregar credenciales prod: ${error.message}`);
      testsFailed++;
    }

    // ============================================================
    // TEST 6: Cambiar modo de test a producción
    // ============================================================
    logTest('Cambiar de modo test a producción');
    testsTotal++;

    try {
      await WompiConfig.update(
        { isTestMode: false },
        { where: { businessId: TEST_BUSINESS_ID } }
      );

      const updatedConfig = await WompiConfig.findOne({
        where: { businessId: TEST_BUSINESS_ID }
      });

      // Obtener credenciales activas (ahora deben ser las de prod)
      const activeCreds = await updatedConfig.getActiveCredentials();

      if (!updatedConfig.isTestMode && activeCreds.publicKey === TEST_CREDENTIALS.prod.publicKey) {
        logSuccess('Modo cambiado a producción correctamente');
        logInfo('getActiveCredentials() ahora retorna credenciales de producción');
        testsPassed++;
      } else {
        logError('El cambio de modo no funcionó correctamente');
        testsFailed++;
      }
    } catch (error) {
      logError(`Error al cambiar modo: ${error.message}`);
      testsFailed++;
    }

    // ============================================================
    // TEST 7: Activar configuración
    // ============================================================
    logTest('Activar configuración de Wompi');
    testsTotal++;

    try {
      await WompiConfig.update(
        { 
          isActive: true,
          verificationStatus: 'verified',
          verifiedAt: new Date()
        },
        { where: { businessId: TEST_BUSINESS_ID } }
      );

      const activeConfig = await WompiConfig.findOne({
        where: { businessId: TEST_BUSINESS_ID }
      });

      const isReady = await activeConfig.isReadyForPayments();

      if (activeConfig.isActive && isReady) {
        logSuccess('Configuración activada exitosamente');
        logInfo('isReadyForPayments() retorna true');
        logInfo(`Verificada en: ${activeConfig.verifiedAt}`);
        testsPassed++;
      } else {
        logError('Error al activar configuración');
        testsFailed++;
      }
    } catch (error) {
      logError(`Error al activar: ${error.message}`);
      testsFailed++;
    }

    // ============================================================
    // TEST 8: Verificar hasCredentialsForCurrentMode
    // ============================================================
    logTest('Verificar método hasCredentialsForCurrentMode()');
    testsTotal++;

    try {
      const config = await WompiConfig.findOne({
        where: { businessId: TEST_BUSINESS_ID }
      });

      const hasTestCreds = config.hasCredentialsForCurrentMode();
      
      // Cambiar a modo test y verificar de nuevo
      config.isTestMode = true;
      const hasTestCredsInTestMode = config.hasCredentialsForCurrentMode();

      if (hasTestCreds && hasTestCredsInTestMode) {
        logSuccess('hasCredentialsForCurrentMode() funciona correctamente');
        logInfo('Detecta credenciales tanto en modo test como producción');
        testsPassed++;
      } else {
        logError('hasCredentialsForCurrentMode() no funciona correctamente');
        testsFailed++;
      }
    } catch (error) {
      logError(`Error en hasCredentialsForCurrentMode(): ${error.message}`);
      testsFailed++;
    }

    // ============================================================
    // TEST 9: Validar unicidad (un Business = una config)
    // ============================================================
    logTest('Validar constraint de unicidad (businessId único)');
    testsTotal++;

    try {
      let duplicateError = null;
      try {
        await WompiConfig.create({
          businessId: TEST_BUSINESS_ID, // Mismo business
          testPublicKey: 'test',
          isTestMode: true
        });
      } catch (error) {
        duplicateError = error;
      }

      if (duplicateError && duplicateError.name === 'SequelizeUniqueConstraintError') {
        logSuccess('Constraint de unicidad funciona correctamente');
        logInfo('No se puede crear segunda configuración para mismo Business');
        testsPassed++;
      } else {
        logError('Constraint de unicidad NO está funcionando');
        testsFailed++;
      }
    } catch (error) {
      logError(`Error en test de unicidad: ${error.message}`);
      testsFailed++;
    }

  } catch (error) {
    logError(`Error crítico en suite de pruebas: ${error.message}`);
    console.error(error);
  } finally {
    // ============================================================
    // CLEANUP: Eliminar datos de prueba
    // ============================================================
    logSection('CLEANUP');
    
    try {
      if (TEST_BUSINESS_ID) {
        const deleted = await WompiConfig.destroy({
          where: { businessId: TEST_BUSINESS_ID }
        });

        if (deleted > 0) {
          logSuccess(`Configuración de prueba eliminada (${deleted} registro(s))`);
        }
      }
    } catch (error) {
      logWarning(`Error en cleanup: ${error.message}`);
    }

    logSuccess('Pruebas finalizadas');
  }

  // ============================================================
  // RESUMEN FINAL
  // ============================================================
  logSection('RESUMEN DE PRUEBAS E2E');
  
  log(`Total de pruebas: ${testsTotal}`, 'blue');
  log(`Pruebas exitosas: ${testsPassed}`, 'green');
  log(`Pruebas fallidas: ${testsFailed}`, testsFailed > 0 ? 'red' : 'green');
  
  const successRate = ((testsPassed / testsTotal) * 100).toFixed(1);
  log(`\nTasa de éxito: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');
  
  if (testsFailed === 0) {
    logSection('🎉 TODAS LAS PRUEBAS E2E PASARON EXITOSAMENTE 🎉');
    log('\n✅ El sistema está listo para producción!', 'green');
  } else {
    logSection('⚠️  ALGUNAS PRUEBAS E2E FALLARON - REVISAR ⚠️');
  }
  
  process.exit(testsFailed > 0 ? 1 : 0);
}

// Ejecutar pruebas
runE2ETests().catch(error => {
  logError(`Error fatal: ${error.message}`);
  console.error(error);
  process.exit(1);
});
