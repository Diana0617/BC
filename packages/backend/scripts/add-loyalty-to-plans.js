#!/usr/bin/env node

/**
 * Script para agregar el módulo 'loyalty' a planes Premium y Enterprise existentes
 * Uso: node scripts/add-loyalty-to-plans.js
 */

require('dotenv').config();
const { SubscriptionPlan, Module, PlanModule, sequelize } = require('../src/models');

async function addLoyaltyToPlans() {
  try {
    console.log('🔧 Agregando módulo loyalty a planes Premium y Enterprise...');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');
    
    // Buscar el módulo loyalty
    const loyaltyModule = await Module.findOne({ where: { name: 'loyalty' } });
    
    if (!loyaltyModule) {
      console.error('❌ Módulo "loyalty" no encontrado. Ejecuta seed-modules.js primero.');
      return;
    }
    
    console.log(`✅ Módulo loyalty encontrado (ID: ${loyaltyModule.id})`);
    
    // Buscar planes Premium y Enterprise
    const plans = await SubscriptionPlan.findAll({
      where: {
        name: ['Premium', 'Enterprise']
      }
    });
    
    if (plans.length === 0) {
      console.error('❌ No se encontraron planes Premium o Enterprise.');
      return;
    }
    
    console.log(`📦 Encontrados ${plans.length} planes para actualizar`);
    
    let added = 0;
    let skipped = 0;
    
    for (const plan of plans) {
      // Verificar si ya tiene el módulo
      const existing = await PlanModule.findOne({
        where: {
          subscriptionPlanId: plan.id,
          moduleId: loyaltyModule.id
        }
      });
      
      if (existing) {
        console.log(`⏭️  Plan "${plan.name}" ya tiene el módulo loyalty`);
        skipped++;
        continue;
      }
      
      // Agregar el módulo al plan
      await PlanModule.create({
        subscriptionPlanId: plan.id,
        moduleId: loyaltyModule.id,
        isIncluded: true,
        limitQuantity: null,
        additionalPrice: 0,
        configuration: {}
      });
      
      console.log(`✅ Módulo loyalty agregado al plan "${plan.name}"`);
      added++;
    }
    
    console.log('\n📊 Resumen:');
    console.log(`   • Módulos agregados: ${added}`);
    console.log(`   • Ya existentes: ${skipped}`);
    console.log('🎉 Proceso completado!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar
if (require.main === module) {
  addLoyaltyToPlans()
    .then(() => {
      console.log('✨ Script finalizado correctamente.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = addLoyaltyToPlans;
