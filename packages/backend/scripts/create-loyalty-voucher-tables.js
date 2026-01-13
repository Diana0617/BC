#!/usr/bin/env node
require('dotenv').config();
const { sequelize } = require('../src/config/database');

// Importar modelos
const Voucher = require('../src/models/Voucher');
const CustomerBookingBlock = require('../src/models/CustomerBookingBlock');
const CustomerCancellationHistory = require('../src/models/CustomerCancellationHistory');
const LoyaltyPointTransaction = require('../src/models/LoyaltyPointTransaction');
const LoyaltyReward = require('../src/models/LoyaltyReward');
const BusinessClient = require('../src/models/BusinessClient');

async function createLoyaltyVoucherTables() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');
    
    // Obtener todas las tablas existentes
    const [existingTables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    const existingTableNames = existingTables.map(t => t.table_name);
    
    console.log('📋 Tablas existentes en la base de datos:');
    console.log(`   Total: ${existingTableNames.length} tablas\n`);
    
    // Tablas que necesitamos para Loyalty y Vouchers
    const requiredTables = [
      { name: 'vouchers', model: Voucher, description: 'Vouchers por cancelaciones' },
      { name: 'customer_booking_blocks', model: CustomerBookingBlock, description: 'Bloqueos por exceso de cancelaciones' },
      { name: 'customer_cancellation_history', model: CustomerCancellationHistory, description: 'Historial de cancelaciones' },
      { name: 'loyalty_point_transactions', model: LoyaltyPointTransaction, description: 'Transacciones de puntos de fidelidad' },
      { name: 'loyalty_rewards', model: LoyaltyReward, description: 'Recompensas canjeadas' },
      { name: 'business_clients', model: BusinessClient, description: 'Relación negocio-cliente con puntos' }
    ];
    
    const missingTables = requiredTables.filter(t => !existingTableNames.includes(t.name));
    const existingRequired = requiredTables.filter(t => existingTableNames.includes(t.name));
    
    if (existingRequired.length > 0) {
      console.log('✅ Tablas ya existentes:');
      existingRequired.forEach(t => console.log(`   ✓ ${t.name} - ${t.description}`));
      console.log('');
    }
    
    if (missingTables.length === 0) {
      console.log('🎉 ¡Todas las tablas ya existen!\n');
      return;
    }
    
    console.log('📊 Tablas faltantes que se crearán:');
    missingTables.forEach(t => console.log(`   ❌ ${t.name} - ${t.description}`));
    console.log('');
    
    console.log('🔨 Creando tablas faltantes...\n');
    
    // Crear tablas en orden (respetando dependencias)
    for (const table of missingTables) {
      try {
        console.log(`   📝 Creando ${table.name}...`);
        await table.model.sync({ force: false });
        console.log(`   ✅ ${table.name} creada exitosamente`);
      } catch (error) {
        console.error(`   ❌ Error creando ${table.name}:`, error.message);
        throw error;
      }
    }
    
    console.log('\n🎉 ¡Todas las tablas fueron creadas exitosamente!\n');
    
    // Verificar que se crearon
    const [finalTables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN (${requiredTables.map(t => `'${t.name}'`).join(',')})
      ORDER BY table_name;
    `);
    
    console.log('📊 Estado final:');
    requiredTables.forEach(table => {
      const exists = finalTables.some(t => t.table_name === table.name);
      console.log(`   ${exists ? '✅' : '❌'} ${table.name}`);
    });
    console.log('');
    
    if (missingTables.length > 0) {
      console.log('💡 Próximos pasos:');
      console.log('   1. El sistema de vouchers automáticos está listo');
      console.log('   2. Puedes crear vouchers manuales desde la API');
      console.log('   3. El sistema de loyalty/fidelización está operativo');
      console.log('   4. Los puntos se acreditarán automáticamente en pagos');
      console.log('');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar
createLoyaltyVoucherTables()
  .then(() => {
    console.log('✨ Proceso completado exitosamente\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Error fatal:', error.message);
    process.exit(1);
  });
