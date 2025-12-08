#!/usr/bin/env node

/**
 * Script para sincronizar TODAS las tablas de especialistas en producción
 * Uso: node scripts/sync-specialist-tables.js
 */

require('dotenv').config();

// Forzar conexión a producción
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_sVkni1pYdKP4@ep-divine-bread-adt4an18-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
process.env.NODE_ENV = 'production';

const { sequelize } = require('../src/config/database');

// Importar modelos relacionados con especialistas
const SpecialistProfile = require('../src/models/SpecialistProfile');
const SpecialistService = require('../src/models/SpecialistService');
const SpecialistBranchSchedule = require('../src/models/SpecialistBranchSchedule');
const TimeSlot = require('../src/models/TimeSlot');
const Schedule = require('../src/models/Schedule');
const SpecialistDocument = require('../src/models/SpecialistDocument');
const SpecialistCommission = require('../src/models/SpecialistCommission');
const CommissionPaymentRequest = require('../src/models/CommissionPaymentRequest');
const CommissionDetail = require('../src/models/CommissionDetail');

async function syncSpecialistTables() {
  try {
    console.log('🚀 Sincronizando tablas de especialistas en producción...\n');
    
    // 1. Verificar conexión
    console.log('📡 Verificando conexión a Neon...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.\n');
    
    // 2. Sincronizar solo las tablas de especialistas en orden
    console.log('🔄 Creando/actualizando tablas de especialistas...\n');
    
    // Tabla base de perfiles
    console.log('📋 Sincronizando: specialist_profiles');
    await SpecialistProfile.sync({ alter: true });
    console.log('✅ specialist_profiles lista\n');
    
    // Tabla de servicios del especialista
    console.log('📋 Sincronizando: specialist_services');
    await SpecialistService.sync({ alter: true });
    console.log('✅ specialist_services lista\n');
    
    // Tabla de horarios por sucursal
    console.log('📋 Sincronizando: specialist_branch_schedules');
    await SpecialistBranchSchedule.sync({ alter: true });
    console.log('✅ specialist_branch_schedules lista\n');
    
    // Tabla de schedules (si existe)
    try {
      console.log('📋 Sincronizando: schedules');
      await Schedule.sync({ alter: true });
      console.log('✅ schedules lista\n');
    } catch (error) {
      console.log('⚠️  schedules no disponible o ya existe\n');
    }
    
    // Tabla de slots de tiempo
    console.log('📋 Sincronizando: time_slots');
    await TimeSlot.sync({ alter: true });
    console.log('✅ time_slots lista\n');
    
    // Tablas de documentos
    console.log('📋 Sincronizando: specialist_documents');
    await SpecialistDocument.sync({ alter: true });
    console.log('✅ specialist_documents lista\n');
    
    // Tablas de comisiones
    console.log('📋 Sincronizando: specialist_commissions');
    await SpecialistCommission.sync({ alter: true });
    console.log('✅ specialist_commissions lista\n');
    
    console.log('📋 Sincronizando: commission_payment_requests');
    await CommissionPaymentRequest.sync({ alter: true });
    console.log('✅ commission_payment_requests lista\n');
    
    console.log('📋 Sincronizando: commission_details');
    await CommissionDetail.sync({ alter: true });
    console.log('✅ commission_details lista\n');
    
    console.log('🎉 ¡Todas las tablas de especialistas sincronizadas correctamente!\n');
    
    // 3. Verificar que las tablas existen
    console.log('🔍 Verificando tablas creadas...');
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%specialist%'
      OR table_name IN ('time_slots', 'schedules', 'commission_details', 'commission_payment_requests')
      ORDER BY table_name;
    `);
    
    console.log('\n📊 Tablas relacionadas con especialistas en la base de datos:');
    results.forEach(row => {
      console.log(`   ✅ ${row.table_name}`);
    });
    
    console.log('\n✨ Sincronización completada exitosamente!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error sincronizando tablas:', error);
    console.error('\n📋 Stack trace:', error.stack);
    process.exit(1);
  }
}

// Ejecutar
syncSpecialistTables();
