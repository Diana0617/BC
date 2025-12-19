const { sequelize } = require('../src/config/database');
const { SubscriptionPlan, Module, PlanModule } = require('../src/models');

async function debugEnterpriseModules() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    // Buscar el plan Enterprise
    const enterprisePlan = await SubscriptionPlan.findOne({
      where: { name: 'Enterprise' },
      include: [
        {
          model: Module,
          as: 'modules',
          through: {
            model: PlanModule,
            attributes: ['isIncluded', 'limitQuantity', 'additionalPrice', 'configuration']
          },
          attributes: ['id', 'name', 'displayName', 'description', 'icon', 'category', 'status']
        }
      ]
    });

    if (!enterprisePlan) {
      console.log('❌ No se encontró el plan Enterprise');
      return;
    }

    console.log('\n📊 Plan Enterprise:');
    console.log('  ID:', enterprisePlan.id);
    console.log('  Name:', enterprisePlan.name);
    console.log('  Total módulos:', enterprisePlan.modules?.length || 0);
    console.log('\n📦 Módulos incluidos:');

    if (enterprisePlan.modules) {
      // Agrupar por nombre para detectar duplicados
      const modulesByName = {};
      
      enterprisePlan.modules.forEach((module, index) => {
        const key = module.name;
        if (!modulesByName[key]) {
          modulesByName[key] = [];
        }
        modulesByName[key].push({
          id: module.id,
          name: module.name,
          displayName: module.displayName,
          category: module.category,
          status: module.status,
          isIncluded: module.PlanModule?.isIncluded,
          planModuleConfig: module.PlanModule
        });
      });

      // Mostrar módulos agrupados
      Object.entries(modulesByName).forEach(([name, instances]) => {
        if (instances.length > 1) {
          console.log(`\n⚠️  DUPLICADO: ${name} (${instances.length} instancias):`);
          instances.forEach((inst, idx) => {
            console.log(`   ${idx + 1}. ID: ${inst.id}, DisplayName: ${inst.displayName}, Status: ${inst.status}, isIncluded: ${inst.isIncluded}`);
          });
        } else {
          const mod = instances[0];
          console.log(`  ✓ ${mod.displayName || mod.name} (${mod.name})`);
          console.log(`    - ID: ${mod.id}`);
          console.log(`    - Category: ${mod.category}`);
          console.log(`    - Status: ${mod.status}`);
          console.log(`    - isIncluded: ${mod.isIncluded}`);
        }
      });
    }

    // Verificar plan_modules directamente
    console.log('\n📋 Consultando plan_modules directamente:');
    const planModules = await PlanModule.findAll({
      where: { subscriptionPlanId: enterprisePlan.id },
      include: [
        {
          model: Module,
          as: 'module',
          attributes: ['id', 'name', 'displayName', 'status']
        }
      ],
      order: [['moduleId', 'ASC']]
    });

    console.log(`  Total registros en plan_modules: ${planModules.length}`);
    
    // Detectar duplicados
    const moduleIdCount = {};
    planModules.forEach(pm => {
      const moduleId = pm.moduleId;
      if (!moduleIdCount[moduleId]) {
        moduleIdCount[moduleId] = [];
      }
      moduleIdCount[moduleId].push(pm);
    });

    console.log('\n🔍 Análisis de duplicados:');
    let hasDuplicates = false;
    Object.entries(moduleIdCount).forEach(([moduleId, records]) => {
      if (records.length > 1) {
        hasDuplicates = true;
        console.log(`  ⚠️  Módulo ID ${moduleId} (${records[0].module?.displayName}) aparece ${records.length} veces:`);
        records.forEach((rec, idx) => {
          console.log(`     ${idx + 1}. plan_modules.id: ${rec.id}, isIncluded: ${rec.isIncluded}`);
        });
      }
    });

    if (!hasDuplicates) {
      console.log('  ✅ No se encontraron duplicados en plan_modules');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

debugEnterpriseModules();
