#!/usr/bin/env node

/**
 * Script para sincronizar las nuevas tablas de comisiones y consentimientos
 * Uso: node scripts/sync-commission-consent-tables.js
 */

require('dotenv').config();
const { 
  sequelize,
  BusinessCommissionConfig,
  ServiceCommission,
  ConsentTemplate,
  ConsentSignature
} = require('../src/models');

async function syncTables() {
  try {
    console.log('🔄 Iniciando sincronización de tablas de comisiones y consentimientos...\n');

    // Sincronizar tablas de comisiones
    console.log('📊 Sincronizando BusinessCommissionConfig...');
    await BusinessCommissionConfig.sync({ alter: true });
    console.log('✅ BusinessCommissionConfig sincronizada\n');

    console.log('📊 Sincronizando ServiceCommission...');
    await ServiceCommission.sync({ alter: true });
    console.log('✅ ServiceCommission sincronizada\n');

    // Sincronizar tablas de consentimientos
    console.log('📋 Sincronizando ConsentTemplate...');
    await ConsentTemplate.sync({ alter: true });
    console.log('✅ ConsentTemplate sincronizada\n');

    console.log('📋 Sincronizando ConsentSignature...');
    await ConsentSignature.sync({ alter: true });
    console.log('✅ ConsentSignature sincronizada\n');

    console.log('✨ ¡Todas las tablas fueron sincronizadas exitosamente!\n');
    
    // Verificar que las tablas existen
    console.log('🔍 Verificando tablas creadas...');
    const tables = await sequelize.getQueryInterface().showAllTables();
    
    const expectedTables = [
      'business_commission_configs',
      'service_commissions',
      'consent_templates',
      'consent_signatures'
    ];
    
    expectedTables.forEach(table => {
      if (tables.includes(table)) {
        console.log(`✅ ${table} - Existe`);
      } else {
        console.log(`❌ ${table} - NO existe`);
      }
    });

    console.log('\n✨ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al sincronizar tablas:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Ejecutar
syncTables();
