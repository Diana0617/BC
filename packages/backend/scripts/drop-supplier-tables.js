#!/usr/bin/env node
require('dotenv').config();
const { sequelize } = require('../src/models');

async function dropSupplierTables() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');
    
    console.log('🗑️  Eliminando tablas de proveedores...\n');
    
    const tables = [
      'branch_stocks',
      'supplier_catalog_items',
      'supplier_evaluations',
      'supplier_invoice_payments',
      'supplier_invoices',
      'purchase_orders',
      'supplier_contacts',
      'suppliers'
    ];
    
    for (const table of tables) {
      try {
        await sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
        console.log(`✅ Tabla ${table} eliminada`);
      } catch (error) {
        console.log(`⚠️  Tabla ${table} no existe o error: ${error.message}`);
      }
    }
    
    console.log('\n✅ Todas las tablas de proveedores eliminadas');
    console.log('🔄 Ahora reinicia el servidor para recrearlas\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

dropSupplierTables()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
