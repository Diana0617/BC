#!/usr/bin/env node

/**
 * Script para inicializar planes de suscripción base del sistema Beauty Control
 * Uso: node scripts/seed-plans.js
 */

require('dotenv').config();
const { SubscriptionPlan, Module, PlanModule, sequelize } = require('../src/models');

const basePlans = [
  // =====================
  // PLAN BÁSICO - Solo lo esencial
  // =====================
  {
    planData: {
      name: 'Básico',
      description: 'Plan ideal para salones pequeños que están comenzando. Incluye funcionalidades esenciales para gestionar citas y clientes.',
      price: 39900,
      currency: 'COP',
      duration: 1,
      durationType: 'MONTHS',
      maxUsers: 3,
      maxClients: 100,
      maxAppointments: 200,
      storageLimit: 1073741824, // 1GB
      status: 'ACTIVE',
      isPopular: false,
      trialDays: 15,
      features: {
        appointments: 'Gestión básica de citas',
        clients: 'Base de datos de hasta 100 clientes',
        payments: 'Pagos en efectivo',
        support: 'Soporte por email'
      },
      limitations: {
        single_branch: 'Solo 1 sucursal',
        no_integrations: 'Sin integraciones de pago online',
        no_analytics: 'Sin reportes avanzados',
        no_inventory: 'Sin gestión de inventario'
      }
    },
    modules: [
      // CORE (obligatorios)
      { moduleName: 'authentication', isIncluded: true },
      { moduleName: 'dashboard', isIncluded: true },
      { moduleName: 'user-management', isIncluded: true },
      // APPOINTMENTS
      { moduleName: 'appointment-booking', isIncluded: true },
      // PAYMENTS
      { moduleName: 'basic-payments', isIncluded: true }
    ]
  },

  // =====================
  // PLAN ESTÁNDAR - Salón en crecimiento
  // =====================
  {
    planData: {
      name: 'Estándar',
      description: 'Plan perfecto para salones en crecimiento. Incluye recordatorios automáticos, inventario y control de gastos.',
      price: 79900,
      currency: 'COP',
      duration: 1,
      durationType: 'MONTHS',
      maxUsers: 8,
      maxClients: 500,
      maxAppointments: 1000,
      storageLimit: 5368709120, // 5GB
      status: 'ACTIVE',
      isPopular: true,
      trialDays: 15,
      features: {
        appointments: 'Gestión de citas con recordatorios automáticos',
        clients: 'Base de datos de hasta 500 clientes con historial',
        inventory: 'Gestión de inventario básico',
        expenses: 'Control de gastos del negocio',
        payments: 'Pagos en efectivo',
        support: 'Soporte prioritario'
      },
      limitations: {
        single_branch: 'Solo 1 sucursal',
        no_online_payments: 'Sin pagos online',
        basic_reports: 'Reportes básicos únicamente'
      }
    },
    modules: [
      // CORE
      { moduleName: 'authentication', isIncluded: true },
      { moduleName: 'dashboard', isIncluded: true },
      { moduleName: 'user-management', isIncluded: true },
      // APPOINTMENTS
      { moduleName: 'appointment-booking', isIncluded: true },
      { moduleName: 'appointment-reminders', isIncluded: true },
      // INVENTORY
      { moduleName: 'inventory', isIncluded: true },
      // PAYMENTS
      { moduleName: 'basic-payments', isIncluded: true },
      // REPORTS
      { moduleName: 'expenses', isIncluded: true },
      { moduleName: 'client_history', isIncluded: true }
    ]
  },

  // =====================
  // PLAN PROFESIONAL - Con pagos online
  // =====================
  {
    planData: {
      name: 'Profesional',
      description: 'Plan profesional con pagos online a través de Wompi. Ideal para salones que quieren modernizar sus cobros.',
      price: 119900,
      currency: 'COP',
      duration: 1,
      durationType: 'MONTHS',
      maxUsers: 12,
      maxClients: 1000,
      maxAppointments: 2000,
      storageLimit: 10737418240, // 10GB
      status: 'ACTIVE',
      isPopular: true,
      trialDays: 30,
      features: {
        appointments: 'Gestión completa de citas con recordatorios',
        clients: 'Base de datos de hasta 1000 clientes con historial completo',
        inventory: 'Gestión de inventario con control de stock',
        expenses: 'Control completo de gastos',
        balance: 'Balance general financiero',
        payments: 'Pagos en efectivo + Wompi (tarjetas y PSE)',
        support: 'Soporte prioritario 24/7'
      },
      limitations: {
        single_branch: 'Solo 1 sucursal',
        basic_analytics: 'Análisis básico'
      }
    },
    modules: [
      // CORE
      { moduleName: 'authentication', isIncluded: true },
      { moduleName: 'dashboard', isIncluded: true },
      { moduleName: 'user-management', isIncluded: true },
      // APPOINTMENTS
      { moduleName: 'appointment-booking', isIncluded: true },
      { moduleName: 'appointment-reminders', isIncluded: true },
      // INVENTORY
      { moduleName: 'inventory', isIncluded: true },
      { moduleName: 'stock-control', isIncluded: true },
      // PAYMENTS
      { moduleName: 'basic-payments', isIncluded: true },
      { moduleName: 'wompi_integration', isIncluded: true },
      // REPORTS
      { moduleName: 'expenses', isIncluded: true },
      { moduleName: 'balance', isIncluded: true },
      { moduleName: 'client_history', isIncluded: true }
    ]
  },

  // =====================
  // PLAN PREMIUM - Todo incluido + facturación
  // =====================
  {
    planData: {
      name: 'Premium',
      description: 'Plan completo con facturación electrónica Taxxa, análisis avanzado y todas las integraciones de pago.',
      price: 169900,
      currency: 'COP',
      duration: 1,
      durationType: 'MONTHS',
      maxUsers: 20,
      maxClients: 5000,
      maxAppointments: null, // Sin límite
      storageLimit: 21474836480, // 20GB
      status: 'ACTIVE',
      isPopular: true,
      trialDays: 30,
      features: {
        appointments: 'Gestión completa de citas con recordatorios',
        clients: 'Base de datos ilimitada con historial completo',
        inventory: 'Gestión completa de inventario y proveedores',
        expenses: 'Control completo de gastos y balance',
        payments: 'Todas las opciones de pago (efectivo + Wompi)',
        invoicing: 'Facturación electrónica con Taxxa',
        analytics: 'Análisis avanzado con reportes personalizados',
        support: 'Soporte VIP 24/7'
      },
      limitations: {
        single_branch: 'Solo 1 sucursal (multi-sucursal disponible en Enterprise)'
      }
    },
    modules: [
      // CORE
      { moduleName: 'authentication', isIncluded: true },
      { moduleName: 'dashboard', isIncluded: true },
      { moduleName: 'user-management', isIncluded: true },
      // APPOINTMENTS
      { moduleName: 'appointment-booking', isIncluded: true },
      { moduleName: 'appointment-reminders', isIncluded: true },
      // INVENTORY
      { moduleName: 'inventory', isIncluded: true },
      { moduleName: 'stock-control', isIncluded: true },
      // PAYMENTS & INTEGRATIONS
      { moduleName: 'basic-payments', isIncluded: true },
      { moduleName: 'wompi_integration', isIncluded: true },
      { moduleName: 'taxxa_integration', isIncluded: true },
      // REPORTS & ANALYTICS
      { moduleName: 'expenses', isIncluded: true },
      { moduleName: 'balance', isIncluded: true },
      { moduleName: 'client_history', isIncluded: true },
      { moduleName: 'advanced-analytics', isIncluded: true }
    ]
  },

  // =====================
  // PLAN ENTERPRISE - Cadenas de salones
  // =====================
  {
    planData: {
      name: 'Enterprise',
      description: 'Plan empresarial para cadenas de salones. Incluye múltiples sucursales, todas las integraciones y soporte dedicado.',
      price: 249900,
      currency: 'COP',
      duration: 1,
      durationType: 'MONTHS',
      maxUsers: null, // Sin límite
      maxClients: null, // Sin límite
      maxAppointments: null, // Sin límite
      storageLimit: 107374182400, // 100GB
      status: 'ACTIVE',
      isPopular: false,
      trialDays: 30,
      features: {
        everything_premium: 'Todas las funciones del plan Premium',
        multi_branch: 'Gestión de múltiples sucursales',
        unlimited: 'Sin límites de usuarios, clientes o citas',
        advanced_analytics: 'Análisis empresarial con comparativas entre sucursales',
        custom_integrations: 'Integraciones personalizadas',
        api_access: 'Acceso completo a APIs',
        priority_support: 'Soporte empresarial con SLA garantizado',
        training: 'Entrenamiento personalizado incluido',
        dedicated_manager: 'Gerente de cuenta dedicado'
      },
      limitations: {}
    },
    modules: [
      // CORE
      { moduleName: 'authentication', isIncluded: true },
      { moduleName: 'dashboard', isIncluded: true },
      { moduleName: 'user-management', isIncluded: true },
      { moduleName: 'multi_branch', isIncluded: true }, // EXCLUSIVO
      // APPOINTMENTS
      { moduleName: 'appointment-booking', isIncluded: true },
      { moduleName: 'appointment-reminders', isIncluded: true },
      // INVENTORY
      { moduleName: 'inventory', isIncluded: true },
      { moduleName: 'stock-control', isIncluded: true },
      // PAYMENTS & INTEGRATIONS
      { moduleName: 'basic-payments', isIncluded: true },
      { moduleName: 'wompi_integration', isIncluded: true },
      { moduleName: 'taxxa_integration', isIncluded: true },
      // REPORTS & ANALYTICS
      { moduleName: 'expenses', isIncluded: true },
      { moduleName: 'balance', isIncluded: true },
      { moduleName: 'client_history', isIncluded: true },
      { moduleName: 'advanced-analytics', isIncluded: true }
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