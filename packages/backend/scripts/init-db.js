require('dotenv').config();
const { sequelize } = require('../src/models');
const bcrypt = require('bcryptjs');

/**
 * Script de inicialización de la base de datos
 * Crea datos básicos necesarios para el funcionamiento del sistema
 */

async function initializeDatabase() {
  try {
    console.log('🔄 Iniciando proceso de inicialización de la base de datos...');

    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Sincronizar modelos de forma ordenada para respetar dependencias
    console.log('🔄 Sincronizando modelos en orden de dependencias...');
    
    // Importar modelos principales
    const {
      User,
      Business,
      SubscriptionPlan,
      Module,
      PlanModule,
      BusinessSubscription
    } = require('../src/models');

    if (process.env.NODE_ENV === 'production') {
      // En producción, sincronizar modelos base primero
      const baseModels = [SubscriptionPlan, Module, Business];
      for (const Model of baseModels) {
        await Model.sync({ alter: true });
        console.log(`✅ Modelo ${Model.name} sincronizado`);
      }
      
      // Luego los modelos que dependen de Business
      const dependentModels = [User, PlanModule, BusinessSubscription];
      for (const Model of dependentModels) {
        await Model.sync({ alter: true });
        console.log(`✅ Modelo ${Model.name} sincronizado`);
      }
      
      console.log('✅ Modelos principales sincronizados');
    } else {
      // En desarrollo, usar force para limpiar todo
      await sequelize.sync({ force: true });
      console.log('✅ Modelos sincronizados (force: true para desarrollo)');
    }

    // 1. Crear Módulos del Sistema
    console.log('📦 Creando módulos del sistema...');
    const modules = [
      {
        name: 'Gestión de Clientes',
        description: 'Administración completa de información de clientes',
        category: 'CORE',
        isActive: true
      },
      {
        name: 'Agenda y Citas',
        description: 'Sistema de agendamiento y gestión de citas',
        category: 'CORE',
        isActive: true
      },
      {
        name: 'Servicios',
        description: 'Catálogo y gestión de servicios ofrecidos',
        category: 'CORE',
        isActive: true
      },
      {
        name: 'Inventario',
        description: 'Control de productos e inventario',
        category: 'BUSINESS',
        isActive: true
      },
      {
        name: 'Finanzas',
        description: 'Gestión financiera y reportes',
        category: 'BUSINESS',
        isActive: true
      },
      {
        name: 'Reportes Avanzados',
        description: 'Reportes detallados y analytics',
        category: 'PREMIUM',
        isActive: true
      },
      {
        name: 'Marketing',
        description: 'Herramientas de marketing y promociones',
        category: 'PREMIUM',
        isActive: true
      },
      {
        name: 'API Access',
        description: 'Acceso a API para integraciones',
        category: 'ENTERPRISE',
        isActive: true
      }
    ];

    for (const moduleData of modules) {
      await Module.findOrCreate({
        where: { name: moduleData.name },
        defaults: moduleData
      });
    }
    console.log('✅ Módulos creados');

    // 2. Crear Planes de Suscripción
    console.log('💳 Creando planes de suscripción...');
    const plans = [
      {
        name: 'Básico',
        description: 'Plan básico para emprendedores',
        price: 29900,
        billingCycle: 'MONTHLY',
        maxUsers: 2,
        maxClients: 100,
        maxAppointments: 500,
        storageLimit: 1073741824, // 1GB
        isActive: true,
        features: {
          clientManagement: true,
          appointments: true,
          basicReports: true,
          emailSupport: true
        }
      },
      {
        name: 'Profesional',
        description: 'Plan para negocios en crecimiento',
        price: 59900,
        billingCycle: 'MONTHLY',
        maxUsers: 5,
        maxClients: 500,
        maxAppointments: 2000,
        storageLimit: 5368709120, // 5GB
        isActive: true,
        features: {
          clientManagement: true,
          appointments: true,
          inventory: true,
          financialReports: true,
          prioritySupport: true
        }
      },
      {
        name: 'Premium',
        description: 'Plan completo para negocios establecidos',
        price: 99900,
        billingCycle: 'MONTHLY',
        maxUsers: 15,
        maxClients: -1, // Ilimitado
        maxAppointments: -1, // Ilimitado
        storageLimit: 21474836480, // 20GB
        isActive: true,
        features: {
          clientManagement: true,
          appointments: true,
          inventory: true,
          financialReports: true,
          advancedReports: true,
          marketing: true,
          prioritySupport: true,
          phoneSupport: true
        }
      },
      {
        name: 'Enterprise',
        description: 'Plan empresarial con todas las funcionalidades',
        price: 199900,
        billingCycle: 'MONTHLY',
        maxUsers: -1, // Ilimitado
        maxClients: -1, // Ilimitado
        maxAppointments: -1, // Ilimitado
        storageLimit: -1, // Ilimitado
        isActive: true,
        features: {
          clientManagement: true,
          appointments: true,
          inventory: true,
          financialReports: true,
          advancedReports: true,
          marketing: true,
          apiAccess: true,
          dedicatedSupport: true,
          phoneSupport: true,
          customization: true
        }
      }
    ];

    const createdPlans = [];
    for (const planData of plans) {
      const [plan] = await SubscriptionPlan.findOrCreate({
        where: { name: planData.name },
        defaults: planData
      });
      createdPlans.push(plan);
    }
    console.log('✅ Planes de suscripción creados');

    // 3. Asignar módulos a planes
    console.log('🔗 Asignando módulos a planes...');
    const planModules = [
      // Plan Básico
      { planName: 'Básico', modules: ['Gestión de Clientes', 'Agenda y Citas', 'Servicios'] },
      // Plan Profesional
      { planName: 'Profesional', modules: ['Gestión de Clientes', 'Agenda y Citas', 'Servicios', 'Inventario', 'Finanzas'] },
      // Plan Premium
      { planName: 'Premium', modules: ['Gestión de Clientes', 'Agenda y Citas', 'Servicios', 'Inventario', 'Finanzas', 'Reportes Avanzados', 'Marketing'] },
      // Plan Enterprise
      { planName: 'Enterprise', modules: ['Gestión de Clientes', 'Agenda y Citas', 'Servicios', 'Inventario', 'Finanzas', 'Reportes Avanzados', 'Marketing', 'API Access'] }
    ];

    for (const assignment of planModules) {
      const plan = await SubscriptionPlan.findOne({ where: { name: assignment.planName } });
      for (const moduleName of assignment.modules) {
        const module = await Module.findOne({ where: { name: moduleName } });
        if (plan && module) {
          await PlanModule.findOrCreate({
            where: {
              planId: plan.id,
              moduleId: module.id
            },
            defaults: {
              planId: plan.id,
              moduleId: module.id,
              isIncluded: true
            }
          });
        }
      }
    }
    console.log('✅ Módulos asignados a planes');

    // 4. Crear usuario administrador de Beauty Control
    console.log('👤 Creando usuario administrador...');
    const adminEmail = process.env.BC_ADMIN_EMAIL || 'admin@beautycontrol.co';
    const adminPassword = process.env.BC_ADMIN_PASSWORD || 'AdminBC2024!';

    const [adminUser] = await User.findOrCreate({
      where: { email: adminEmail },
      defaults: {
        firstName: 'Admin',
        lastName: 'Beauty Control',
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 12),
        role: 'OWNER',
        isActive: true,
        emailVerified: true
      }
    });
    console.log('✅ Usuario administrador creado');

    // 5. Crear negocio demo (opcional para desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log('🏢 Creando negocio demo...');
      
      const [demoBusiness] = await Business.findOrCreate({
        where: { email: 'demo@example.com' },
        defaults: {
          name: 'Spa Belleza Demo',
          businessType: 'SPA',
          email: 'demo@example.com',
          phone: '+57 300 123 4567',
          address: 'Calle 123 #45-67, Bogotá',
          city: 'Bogotá',
          country: 'Colombia',
          timezone: 'America/Bogota',
          isActive: true
        }
      });

      // Crear usuario demo para el negocio
      const [demoUser] = await User.findOrCreate({
        where: { email: 'demo@example.com' },
        defaults: {
          firstName: 'Demo',
          lastName: 'Business',
          email: 'demo@example.com',
          password: await bcrypt.hash('demo123', 12),
          role: 'BUSINESS',
          businessId: demoBusiness.id,
          isActive: true,
          emailVerified: true
        }
      });

      // Asignar plan básico al negocio demo
      const basicPlan = await SubscriptionPlan.findOne({ where: { name: 'Básico' } });
      if (basicPlan) {
        await BusinessSubscription.findOrCreate({
          where: { businessId: demoBusiness.id },
          defaults: {
            businessId: demoBusiness.id,
            planId: basicPlan.id,
            status: 'ACTIVE',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
            isActive: true
          }
        });
      }

      console.log('✅ Negocio demo creado');
      console.log('   📧 Email: demo@example.com');
      console.log('   🔑 Password: demo123');
    }

    console.log('\n🎉 Inicialización de base de datos completada exitosamente!');
    console.log('\n📋 Resumen:');
    console.log(`   👤 Admin: ${adminEmail}`);
    console.log('   💳 Planes: Básico, Profesional, Premium, Enterprise');
    console.log('   📦 Módulos: 8 módulos creados');
    if (process.env.NODE_ENV === 'development') {
      console.log('   🏢 Negocio demo: demo@example.com');
    }

  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Script de inicialización completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en script de inicialización:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };