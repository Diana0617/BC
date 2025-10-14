const { sequelize } = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  try {
    console.log('🚀 Iniciando migraciones para tablas de vouchers y bloqueos...\n');
    
    // Migración 1: Crear tabla de vouchers
    console.log('📝 Ejecutando: create-vouchers-table.sql');
    const vouchersSql = fs.readFileSync(
      path.join(__dirname, '../migrations/create-vouchers-table.sql'),
      'utf8'
    );
    await sequelize.query(vouchersSql);
    console.log('✅ Tabla "vouchers" creada exitosamente\n');
    
    // Migración 2: Crear tabla de bloqueos
    console.log('📝 Ejecutando: create-customer-booking-blocks-table.sql');
    const blocksSql = fs.readFileSync(
      path.join(__dirname, '../migrations/create-customer-booking-blocks-table.sql'),
      'utf8'
    );
    await sequelize.query(blocksSql);
    console.log('✅ Tabla "customer_booking_blocks" creada exitosamente\n');
    
    console.log('🎉 ¡Todas las migraciones completadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

runMigrations()
  .then(() => {
    console.log('\n✨ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
