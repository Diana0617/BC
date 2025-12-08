#!/usr/bin/env node

/**
 * Script para ejecutar la migración en Railway (producción)
 * Uso: DATABASE_URL=<tu_neon_url> node scripts/run-migration-railway.js
 */

require('dotenv').config();
const { Sequelize, QueryInterface, DataTypes } = require('sequelize');
const migration = require('../migrations/20241125-add-business-specialist-role');

async function runMigrationOnRailway() {
  // Verificar que la DATABASE_URL esté configurada
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL no está configurada');
    console.log('\nUso:');
    console.log('DATABASE_URL=<tu_neon_url> node scripts/run-migration-railway.js');
    process.exit(1);
  }

  console.log('🚀 Conectando a la base de datos de producción...\n');
  console.log('📍 Database:', databaseUrl.substring(0, 50) + '...\n');

  // Crear instancia de Sequelize para producción
  const sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });

  try {
    // Probar la conexión
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente\n');

    // Ejecutar la migración
    console.log('🔄 Ejecutando migración en producción...\n');
    await migration.up(sequelize.getQueryInterface(), Sequelize);
    
    console.log('\n✅ Migración ejecutada correctamente en producción');
    console.log('\n📋 Resumen de cambios:');
    console.log('  ✓ Rol BUSINESS_SPECIALIST agregado');
    console.log('  ✓ Campo maxServices agregado a subscription_plans');
    console.log('  ✓ Plan Básico actualizado (1 usuario, 10 servicios)');
    
    await sequelize.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error ejecutando migración en producción:', error);
    await sequelize.close();
    process.exit(1);
  }
}

runMigrationOnRailway();
