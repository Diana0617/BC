#!/usr/bin/env node

/**
 * Script para inicializar planes de suscripción base del sistema Beauty Control
 * Uso: node scripts/seed-plans.js
 */

require('dotenv').config();
const { SubscriptionPlan, Module, PlanModule, sequelize } = require('../src/models');

const basePlans = [
  {
    planData: {
      name: 'Básico',
      description: 'Plan ideal para salones pequeños que están comenzando. Incluye funcionalidades esenciales para gestionar citas y clientes.',
      price: 49900,
      currency: 'COP',
      duration: 1,
      durationType: 'MONTHS',
      maxUsers: 3,
      maxClients: 100,
      maxAppointments: 200,
      storageLimit: 1073741824, // 1GB en bytes
      status: 'ACTIVE',
      isPopular: false,
      trialDays: 15,
      features: {
        appointments: 'Gestión básica de citas',
        clients: 'Base de datos de clientes',
        payments: 'Pagos en efectivo',
        reports: 'Reportes básicos',
        support: 'Soporte por email'
      },
      limitations: {
        integrations: 'Sin integraciones de pago',
        advanced_features: 'Sin funciones avanzadas',
        marketing: 'Sin herramientas de marketing'
      }
    },
    modules: [
      { moduleName: 'authentication', isIncluded: true },
      { moduleName: 'dashboard', isIncluded: true },
      { moduleName: 'user-management', isIncluded: true },
      { moduleName: 'appointment-booking', isIncluded: true },
      { moduleName: 'basic-inventory', isIncluded: true },
      { moduleName: 'basic-payments', isIncluded: true },
      { moduleName: 'basic-reports', isIncluded: true }
    ]
  },
  
  {
    planData: {
      name: 'Estándar',
      description: 'Plan perfecto para salones en crecimiento. Incluye recordatorios automáticos y mejor gestión de inventario.',
      price: 89900,
      currency: 'COP',
      duration: 1,
      durationType: 'MONTHS',
      maxUsers: 8,
      maxClients: 500,
      maxAppointments: 1000,
      storageLimit: 5368709120, // 5GB en bytes
      status: 'ACTIVE',
      isPopular: true,
      trialDays: 15,
      features: {
        appointments: 'Gestión avanzada de citas con recordatorios',
        clients: 'Base de datos expandida de clientes',
        inventory: 'Control de stock con alertas',
        payments: 'Pagos en efectivo + Wompi',
        reports: 'Reportes avanzados',
        support: 'Soporte prioritario'
      },
      limitations: {
        advanced_integrations: 'Integraciones limitadas',
        marketing_tools: 'Herramientas de marketing básicas'
      }
    },
    modules: [
      { moduleName: 'authentication', isIncluded: true },
      { moduleName: 'dashboard', isIncluded: true },
      { moduleName: 'user-management', isIncluded: true },
      { moduleName: 'appointment-booking', isIncluded: true },
      { moduleName: 'appointment-reminders', isIncluded: true },
      { moduleName: 'basic-inventory', isIncluded: true },
      { moduleName: 'stock-control', isIncluded: true },
      { moduleName: 'basic-payments', isIncluded: true },
      { moduleName: 'wompi-integration', isIncluded: true },
      { moduleName: 'basic-reports', isIncluded: true }
    ]
  },
  
  {
    planData: {
      name: 'Premium',
      description: 'Plan completo para salones establecidos. Incluye todas las integraciones, análisis avanzado y herramientas de marketing.',
      price: 149900,
      currency: 'COP',
      duration: 1,
      durationType: 'MONTHS',
      maxUsers: 20,
      maxClients: 2000,
      maxAppointments: null, // Sin límite
      storageLimit: 21474836480, // 20GB en bytes
      status: 'ACTIVE',
      isPopular: true,
      trialDays: 30,
      features: {
        appointments: 'Programación avanzada con recursos múltiples',
        clients: 'Base de datos ilimitada con segmentación',
        inventory: 'Control completo de inventario',
        payments: 'Todas las opciones de pago disponibles',
        integrations: 'Todas las integraciones incluidas',
        marketing: 'Suite completa de marketing',
        analytics: 'Análisis avanzado con IA',
        support: 'Soporte 24/7 con gerente dedicado'
      },
      limitations: {
        custom_development: 'Desarrollos personalizados bajo cotización'
      }
    },
    modules: [
      { moduleName: 'authentication', isIncluded: true },
      { moduleName: 'dashboard', isIncluded: true },
      { moduleName: 'user-management', isIncluded: true },
      { moduleName: 'appointment-booking', isIncluded: true },
      { moduleName: 'appointment-reminders', isIncluded: true },
      { moduleName: 'advanced-scheduling', isIncluded: true },
      { moduleName: 'basic-inventory', isIncluded: true },
      { moduleName: 'stock-control', isIncluded: true },
      { moduleName: 'basic-payments', isIncluded: true },
      { moduleName: 'wompi-integration', isIncluded: true },
      { moduleName: 'taxxa-integration', isIncluded: true },
      { moduleName: 'mercadopago-integration', isIncluded: true },
      { moduleName: 'basic-reports', isIncluded: true },
      { moduleName: 'advanced-analytics', isIncluded: true },
      { moduleName: 'email-marketing', isIncluded: true },
      { moduleName: 'sms-notifications', isIncluded: true }
    ]
  },
  
  {
    planData: {
      name: 'Enterprise',
      description: 'Plan empresarial para cadenas de salones. Incluye todas las funcionalidades más integraciones con redes sociales y soporte dedicado.',
      price: 249900,
      currency: 'COP',
      duration: 1,
      durationType: 'MONTHS',
      maxUsers: null, // Sin límite
      maxClients: null, // Sin límite
      maxAppointments: null, // Sin límite
      storageLimit: 107374182400, // 100GB en bytes
      status: 'ACTIVE',
      isPopular: false,
      trialDays: 30,
      features: {
        everything_premium: 'Todas las funciones del plan Premium',
        social_integrations: 'Integración completa con redes sociales',
        multi_location: 'Gestión de múltiples ubicaciones',
        advanced_roles: 'Roles y permisos avanzados',
        api_access: 'Acceso completo a APIs',
        custom_branding: 'Marca personalizada',
        priority_support: 'Soporte premium con SLA garantizado',
        training: 'Entrenamiento personalizado incluido'
      },
      limitations: {}
    },
    modules: [
      { moduleName: 'authentication', isIncluded: true },
      { moduleName: 'dashboard', isIncluded: true },
      { moduleName: 'user-management', isIncluded: true },
      { moduleName: 'appointment-booking', isIncluded: true },
      { moduleName: 'appointment-reminders', isIncluded: true },
      { moduleName: 'advanced-scheduling', isIncluded: true },
      { moduleName: 'basic-inventory', isIncluded: true },
      { moduleName: 'stock-control', isIncluded: true },
      { moduleName: 'basic-payments', isIncluded: true },
      { moduleName: 'wompi-integration', isIncluded: true },
      { moduleName: 'taxxa-integration', isIncluded: true },
      { moduleName: 'mercadopago-integration', isIncluded: true },
      { moduleName: 'basic-reports', isIncluded: true },
      { moduleName: 'advanced-analytics', isIncluded: true },
      { moduleName: 'email-marketing', isIncluded: true },
      { moduleName: 'sms-notifications', isIncluded: true },
      { moduleName: 'social-media-booking', isIncluded: true }
    ]
  }
];

async function seedPlans() {
  try {
    console.log('🌱 Iniciando seeding de planes de suscripción...');
    
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');
    
    // Obtener todos los módulos para hacer el mapeo
    const allModules = await Module.findAll({
      attributes: ['id', 'name']
    });
    
    const moduleMap = allModules.reduce((map, module) => {
      map[module.name] = module.id;
      return map;
    }, {});
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const planConfig of basePlans) {
      // Verificar si el plan ya existe
      const existingPlan = await SubscriptionPlan.findOne({ 
        where: { name: planConfig.planData.name } 
      });
      
      if (existingPlan) {
        console.log(`⏭️  Plan '${planConfig.planData.name}' ya existe, saltando...`);
        skippedCount++;
        continue;
      }
      
      // Iniciar transacción para crear plan con módulos
      const transaction = await sequelize.transaction();
      
      try {
        // Crear el plan
        const newPlan = await SubscriptionPlan.create(planConfig.planData, { transaction });
        
        // Preparar datos de módulos
        const planModuleData = [];
        for (const moduleConfig of planConfig.modules) {
          const moduleId = moduleMap[moduleConfig.moduleName];
          if (moduleId) {
            planModuleData.push({
              subscriptionPlanId: newPlan.id,
              moduleId: moduleId,
              isIncluded: moduleConfig.isIncluded,
              limitQuantity: moduleConfig.limitQuantity || null,
              additionalPrice: moduleConfig.additionalPrice || 0,
              configuration: moduleConfig.configuration || {}
            });
          } else {
            console.log(`⚠️  Módulo '${moduleConfig.moduleName}' no encontrado para el plan '${planConfig.planData.name}'`);
          }
        }
        
        // Crear asociaciones plan-módulo
        if (planModuleData.length > 0) {
          await PlanModule.bulkCreate(planModuleData, { transaction });
        }
        
        await transaction.commit();
        
        console.log(`✅ Plan '${newPlan.name}' creado exitosamente con ${planModuleData.length} módulos.`);
        createdCount++;
        
      } catch (error) {
        await transaction.rollback();
        console.error(`❌ Error creando plan '${planConfig.planData.name}':`, error.message);
      }
    }
    
    console.log('\n📊 Resumen del seeding de planes:');
    console.log(`   • Planes creados: ${createdCount}`);
    console.log(`   • Planes existentes: ${skippedCount}`);
    console.log(`   • Total de planes base: ${basePlans.length}`);
    console.log('🎉 Seeding de planes completado exitosamente!\n');
    
  } catch (error) {
    console.error('❌ Error durante el seeding de planes:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el seeding si el script se ejecuta directamente
if (require.main === module) {
  seedPlans()
    .then(() => {
      console.log('✨ Script de seeding de planes finalizado.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal en el script de seeding de planes:', error);
      process.exit(1);
    });
}

module.exports = { seedPlans, basePlans };