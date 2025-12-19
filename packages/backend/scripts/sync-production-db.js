#!/usr/bin/env node
require('dotenv').config();
const { sequelize } = require('../src/models');

async function syncDatabase() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');
    
    console.log('📋 Sincronizando modelos con la base de datos...');
    console.log('⚠️  Esto creará las tablas faltantes sin eliminar datos existentes\n');
    
    // alter: true modifica las tablas existentes y crea las faltantes
    // NO elimina datos
    await sequelize.sync({ alter: true });
    
    console.log('\n✅ Base de datos sincronizada correctamente');
    console.log('📊 Tablas creadas/actualizadas:\n');
    
    const tables = [
      'suppliers',
      'supplier_contacts',
      'supplier_invoices',
      'supplier_invoice_payments',
      'supplier_catalog_items',
      'supplier_evaluations',
      'purchase_orders',
      'branch_stocks'
    ];
    
    for (const table of tables) {
      try {
        const result = await sequelize.query(
          `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = '${table}'`
        );
        if (result[0][0].count > 0) {
          console.log(`   ✅ ${table}`);
        }
      } catch (error) {
        console.log(`   ❌ ${table}`);
      }
    }
    
    console.log('\n🎉 Sincronización completada\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

syncDatabase()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
