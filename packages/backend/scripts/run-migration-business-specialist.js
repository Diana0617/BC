#!/usr/bin/env node

/**
 * Script para ejecutar la migración: Agregar BUSINESS_SPECIALIST y maxServices
 * Uso: node scripts/run-migration-business-specialist.js
 */

require('dotenv').config();
const { sequelize } = require('../src/models');
const migration = require('../migrations/20241125-add-business-specialist-role');

async function runMigration() {
  try {
    console.log('🚀 Iniciando ejecución de migración...\n');
    
    // Ejecutar la migración
    await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
    
    console.log('\n✅ Migración ejecutada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error ejecutando migración:', error);
    process.exit(1);
  }
}

runMigration();
