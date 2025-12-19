const { sequelize } = require('../src/config/database');
const { Business, SubscriptionPlan, Module, BusinessSubscription } = require('../src/models');

async function debugBusinessModules() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    // Buscar negocios con plan Enterprise
    const businesses = await Business.findAll({
      include: [
        {
          model: SubscriptionPlan,
          as: 'currentPlan',
          where: { name: 'Enterprise' },
          include: [
            {
              model: Module,
              as: 'modules',
              through: {
                where: { isIncluded: true },
                attributes: ['isIncluded']
              },
              where: { status: 'ACTIVE' },
              attributes: ['id', 'name', 'displayName', 'category']
            }
          ]
        },
        {
          model: BusinessSubscription,
          as: 'subscriptions',
          where: { status: ['ACTIVE', 'TRIAL'] },
          limit: 1
        }
      ],
      limit: 1
    });

    if (!businesses || businesses.length === 0) {
      console.log('❌ No se encontró ningún negocio con plan Enterprise activo');
      return;
    }

    const business = businesses[0];
    console.log('\n🏢 Negocio:', business.name);
    console.log('  ID:', business.id);
    console.log('  Email:', business.email);
    console.log('\n📊 Plan actual:', business.currentPlan.name);
    console.log('  Total módulos incluidos:', business.currentPlan.modules.length);
    
    console.log('\n📦 Módulos del plan (nombres exactos):');
    business.currentPlan.modules.forEach((module, index) => {
      console.log(`  ${index + 1}. name: "${module.name}"`);
      console.log(`     displayName: "${module.displayName}"`);
      console.log(`     category: ${module.category}`);
      console.log('');
    });

    // Lista de excludedModules del frontend para comparación
    const excludedModules = [
      'autenticacion', 'authentication', 'auth', 'seguridad', 'security',
      'panel_de_control', 'dashboard', 'panel',
      'gestion_de_usuarios', 'user_management', 'usuarios', 'users', 'clientes', 'clients', 'client_management',
      'reserva_de_citas', 'booking', 'appointments_booking', 'citas', 'appointment', 'reservas',
      'pagos_basicos', 'basic_payments', 'payments', 'pagos', 'payment',
      'stock-control', 'stock_control', 'control_de_stock', 'control_stock',
      'customer_history', 'historial_clientes', 'client_history', 'historial_de_clientes',
      'multi_branch',
      'inventory',
      'appointment-reminders',
      'taxxa_integration',
      'user-management',
      'appointment-booking',
      'basic-payments',
      'wompi_integration',
      'expenses',
      'balance',
      'advanced-analytics'
    ];

    // Secciones específicas del frontend
    const modulesSections = ['inventory', 'appointment-reminders', 'taxxa_integration'];

    console.log('\n🔍 Análisis de qué módulos se mostrarían en el sidebar:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const wouldShowAsGeneric = [];
    const wouldBeExcluded = [];
    const hasSpecificSection = [];
    
    business.currentPlan.modules.forEach((module) => {
      const nameLower = module.name.toLowerCase();
      
      if (modulesSections.includes(module.name)) {
        hasSpecificSection.push(module);
      } else if (excludedModules.includes(nameLower)) {
        wouldBeExcluded.push(module);
      } else {
        wouldShowAsGeneric.push(module);
      }
    });

    console.log('\n✅ Módulos con sección específica (NO genéricos):');
    hasSpecificSection.forEach(m => {
      console.log(`  - ${m.displayName} (${m.name})`);
    });

    console.log('\n❌ Módulos excluidos (NO se mostrarán):');
    wouldBeExcluded.forEach(m => {
      console.log(`  - ${m.displayName} (${m.name})`);
    });

    console.log('\n📝 Módulos que se mostrarían como GENÉRICOS en sidebar:');
    if (wouldShowAsGeneric.length === 0) {
      console.log('  (ninguno)');
    } else {
      wouldShowAsGeneric.forEach(m => {
        console.log(`  - ${m.displayName} (${m.name})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

debugBusinessModules();
