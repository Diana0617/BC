#!/usr/bin/env node

/**
 * Script COMPLETO para sincronizar TODAS las tablas en producción
 * Uso: node scripts/sync-all-tables.js
 */

require('dotenv').config();

// Forzar conexión a producción
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_sVkni1pYdKP4@ep-divine-bread-adt4an18-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
process.env.NODE_ENV = 'production';

const { sequelize } = require('../src/models');

async function syncAllTables() {
  try {
    console.log('🚀 Sincronizando TODAS las tablas en producción...\n');
    
    // 1. Verificar conexión
    console.log('📡 Verificando conexión a Neon...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.\n');
    
    // 2. Sincronizar TODOS los modelos de una vez
    console.log('🔄 Sincronizando todos los modelos (esto puede tardar)...\n');
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Todas las tablas sincronizadas.\n');
    
    // 3. Verificar tablas creadas
    console.log('🔍 Verificando tablas en la base de datos...\n');
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log(`📊 Total de tablas: ${tables.length}\n`);
    console.log('📋 Tablas creadas:');
    tables.forEach(row => {
      console.log(`   ✅ ${row.table_name}`);
    });
    
    // 4. Verificar tablas críticas de especialistas
    console.log('\n🔍 Verificando tablas críticas de especialistas...');
    const criticalTables = [
      'specialist_profiles',
      'specialist_services', 
      'specialist_branch_schedules',
      'appointments',
      'time_slots',
      'schedules'
    ];
    
    const tableNames = tables.map(t => t.table_name);
    const missing = criticalTables.filter(t => !tableNames.includes(t));
    
    if (missing.length > 0) {
      console.log('\n⚠️  Tablas faltantes:');
      missing.forEach(t => console.log(`   ❌ ${t}`));
    } else {
      console.log('\n✅ Todas las tablas críticas están presentes!');
    }
    
    console.log('\n✨ Sincronización completada exitosamente!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error sincronizando tablas:', error.message);
    console.error('\n📋 Stack trace:', error.stack);
    process.exit(1);
  }
}

// Ejecutar
syncAllTables();
