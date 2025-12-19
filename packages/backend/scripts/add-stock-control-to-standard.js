#!/usr/bin/env node

/**
 * Script para agregar el módulo stock-control al plan Estándar
 * Uso: node scripts/add-stock-control-to-standard.js
 */

const { sequelize } = require('../src/config/database');
const { SubscriptionPlan, Module, PlanModule } = require('../src/models');

async function addStockControlToStandard() {
  try {
    console.log('🔧 Agregando módulo stock-control al plan Estándar...\n');
    
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    // Buscar el plan Estándar
    const standardPlan = await SubscriptionPlan.findOne({
      where: { name: 'Estándar' }
    });

    if (!standardPlan) {
      console.log('❌ No se encontró el plan Estándar');
      return;
    }

    console.log(`📋 Plan encontrado: ${standardPlan.name} (ID: ${standardPlan.id})`);

    // Buscar el módulo stock-control
    const stockControlModule = await Module.findOne({
      where: { name: 'stock-control' }
    });

    if (!stockControlModule) {
      console.log('❌ No se encontró el módulo stock-control');
      return;
    }

    console.log(`📦 Módulo encontrado: ${stockControlModule.displayName} (${stockControlModule.name})`);

    // Verificar si ya existe la asociación
    const existingAssociation = await PlanModule.findOne({
      where: {
        subscriptionPlanId: standardPlan.id,
        moduleId: stockControlModule.id
      }
    });

    if (existingAssociation) {
      console.log('⚠️  El módulo stock-control ya está asociado al plan Estándar');
      console.log(`   isIncluded: ${existingAssociation.isIncluded}`);
      return;
    }

    // Crear la asociación
    await PlanModule.create({
      subscriptionPlanId: standardPlan.id,
      moduleId: stockControlModule.id,
      isIncluded: true,
      limitQuantity: null,
      additionalPrice: 0,
      configuration: {}
    });

    console.log('✅ Módulo stock-control agregado exitosamente al plan Estándar');
    console.log('\n📊 Resumen:');
    console.log(`   Plan: ${standardPlan.name}`);
    console.log(`   Módulo agregado: ${stockControlModule.displayName}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await sequelize.close();
    console.log('\n✅ Conexión cerrada');
  }
}

// Ejecutar si se ejecuta directamente
if (require.main === module) {
  addStockControlToStandard()
    .then(() => {
      console.log('✨ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = addStockControlToStandard;
