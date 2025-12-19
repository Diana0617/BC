#!/usr/bin/env node

/**
 * Script para limpiar módulos duplicados en planes
 * Uso: node scripts/cleanup-duplicate-plan-modules.js
 */

require('dotenv').config();
const { PlanModule, Module, SubscriptionPlan, sequelize } = require('../src/models');

async function cleanupDuplicates() {
  try {
    console.log('🧹 Limpiando módulos duplicados en planes...');
    
    await sequelize.authenticate();
    console.log('✅ Conexión establecida.');
    
    // Obtener todos los registros de plan_modules
    const allPlanModules = await PlanModule.findAll({
      include: [
        { model: Module, as: 'module', attributes: ['name'] },
        { model: SubscriptionPlan, as: 'plan', attributes: ['name'] }
      ],
      order: [['createdAt', 'ASC']]
    });
    
    console.log(`📦 Total de registros plan_modules: ${allPlanModules.length}`);
    
    // Agrupar por subscriptionPlanId + moduleId
    const grouped = {};
    const duplicates = [];
    
    allPlanModules.forEach(pm => {
      const key = `${pm.subscriptionPlanId}-${pm.moduleId}`;
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(pm);
      
      if (grouped[key].length > 1) {
        duplicates.push(key);
      }
    });
    
    console.log(`🔍 Encontrados ${duplicates.length} módulos con duplicados`);
    
    if (duplicates.length === 0) {
      console.log('✅ No hay duplicados. Todo está bien!');
      return;
    }
    
    let deletedCount = 0;
    
    // Para cada grupo de duplicados, mantener solo el primero (más antiguo)
    for (const key of duplicates) {
      const records = grouped[key];
      const [planId, moduleId] = key.split('-');
      const planName = records[0].plan?.name || 'Unknown';
      const moduleName = records[0].module?.name || 'Unknown';
      
      console.log(`\n🔧 Procesando: Plan "${planName}" - Módulo "${moduleName}"`);
      console.log(`   Duplicados encontrados: ${records.length}`);
      
      // Mantener el primero (más antiguo), eliminar el resto
      for (let i = 1; i < records.length; i++) {
        await records[i].destroy();
        deletedCount++;
        console.log(`   ❌ Eliminado duplicado #${i} (ID: ${records[i].id})`);
      }
      
      console.log(`   ✅ Mantenido original (ID: ${records[0].id})`);
    }
    
    console.log('\n📊 Resumen:');
    console.log(`   • Duplicados eliminados: ${deletedCount}`);
    console.log('🎉 Limpieza completada!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar
if (require.main === module) {
  cleanupDuplicates()
    .then(() => {
      console.log('✨ Script finalizado.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = cleanupDuplicates;
