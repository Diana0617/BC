#!/usr/bin/env node

/**
 * Script para eliminar tablas problemáticas y permitir su recreación
 */

require('dotenv').config();

// Forzar conexión a producción
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_sVkni1pYdKP4@ep-divine-bread-adt4an18-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
process.env.NODE_ENV = 'production';

const { sequelize } = require('../src/config/database');

async function dropProblematicTables() {
  try {
    console.log('🔧 Eliminando tablas problemáticas para recrearlas...\n');
    
    // 1. Verificar conexión
    console.log('📡 Conectando a Neon...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida.\n');
    
    // Lista de tablas a eliminar (en orden inverso de dependencias)
    const tablesToDrop = [
      'business_invitations',
      'receipts',
      'time_slots',
      'appointments'
    ];
    
    for (const table of tablesToDrop) {
      try {
        console.log(`🗑️  Eliminando tabla: ${table}`);
        await sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
        console.log(`✅ ${table} eliminada\n`);
      } catch (error) {
        console.log(`⚠️  ${table} no existe o no se pudo eliminar: ${error.message}\n`);
      }
    }
    
    console.log('✅ Tablas problemáticas eliminadas. Ahora ejecuta sync-all-tables.js\n');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar
dropProblematicTables();
