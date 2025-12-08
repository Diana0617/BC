/**
 * run-wompi-migration.js
 * 
 * Script para ejecutar manualmente la migración de business_wompi_payment_config
 */

const { Sequelize, QueryInterface } = require('sequelize');
const config = require('./config/config.json').development;

// Importar la migración
const migration = require('./migrations/20251106000001-create-business-wompi-payment-config.js');

async function runMigration() {
  const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: console.log
  });

  try {
    console.log('🚀 Iniciando migración de business_wompi_payment_config...\n');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✓ Conexión a la base de datos establecida\n');
    
    const queryInterface = sequelize.getQueryInterface();
    
    // Ejecutar migración
    console.log('📝 Ejecutando migración UP...\n');
    await migration.up(queryInterface, Sequelize);
    
    // Registrar en SequelizeMeta
    console.log('\n📋 Registrando migración en SequelizeMeta...');
    await sequelize.query(
      'INSERT INTO "SequelizeMeta" (name) VALUES (:name)',
      {
        replacements: { name: '20251106000001-create-business-wompi-payment-config.js' }
      }
    );
    
    console.log('\n✅ Migración ejecutada exitosamente!');
    console.log('\n📊 Verificando tabla creada...');
    
    // Verificar que la tabla existe
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'business_wompi_payment_configs'"
    );
    
    if (tables.length > 0) {
      console.log('✓ Tabla business_wompi_payment_configs creada correctamente');
      
      // Verificar columnas
      const [columns] = await sequelize.query(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'business_wompi_payment_configs' ORDER BY ordinal_position"
      );
      
      console.log('\n📋 Columnas creadas (' + columns.length + '):');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
      
      // Verificar índices
      const [indexes] = await sequelize.query(
        "SELECT indexname FROM pg_indexes WHERE tablename = 'business_wompi_payment_configs'"
      );
      
      console.log('\n🔍 Índices creados (' + indexes.length + '):');
      indexes.forEach(idx => {
        console.log(`  - ${idx.indexname}`);
      });
    } else {
      console.error('✗ ERROR: La tabla no fue creada');
    }
    
  } catch (error) {
    console.error('\n❌ Error durante la migración:');
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

runMigration();
