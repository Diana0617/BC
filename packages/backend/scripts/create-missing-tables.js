#!/usr/bin/env node
require('dotenv').config();
const { sequelize } = require('../src/models');

async function createMissingTables() {
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
    existingTableNames.forEach(name => console.log(`   - ${name}`));
    console.log('');
    
    // Tablas específicas de suppliers que necesitamos crear
    const supplierTables = [
      'suppliers',
      'supplier_contacts',
      'supplier_invoices',
      'supplier_invoice_payments',
      'supplier_catalog_items',
      'supplier_evaluations',
      'purchase_orders'
    ];
    
    const missingTables = supplierTables.filter(t => !existingTableNames.includes(t));
    
    if (missingTables.length === 0) {
      console.log('✅ Todas las tablas de proveedores ya existen\n');
      return;
    }
    
    console.log('📊 Tablas faltantes:');
    missingTables.forEach(name => console.log(`   ❌ ${name}`));
    console.log('');
    
    console.log('🔨 Creando tablas faltantes...\n');
    
    // Solo sincronizar las tablas que no existen usando force: false
    // Esto creará las tablas sin tocar las existentes
    const models = sequelize.models;
    
    for (const tableName of missingTables) {
      // Encontrar el modelo correspondiente
      const modelName = Object.keys(models).find(key => {
        const model = models[key];
        return model.tableName === tableName;
      });
      
      if (modelName) {
        console.log(`   Creando ${tableName}...`);
        await models[modelName].sync({ force: false });
        console.log(`   ✅ ${tableName} creada`);
      }
    }
    
    console.log('\n🎉 Tablas creadas exitosamente\n');
    
    // Verificar que se crearon
    const [finalTables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN (${supplierTables.map(t => `'${t}'`).join(',')})
      ORDER BY table_name;
    `);
    
    console.log('📊 Estado final:');
    supplierTables.forEach(name => {
      const exists = finalTables.some(t => t.table_name === name);
      console.log(`   ${exists ? '✅' : '❌'} ${name}`);
    });
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

createMissingTables()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Error fatal:', error.message);
    process.exit(1);
  });
