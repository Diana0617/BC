#!/usr/bin/env node

/**
 * Script para inicializar planes de suscripción base del sistema Beauty Control
 * Uso: node scripts/seed-plans.js
 */

require('dotenv').config();
const { SubscriptionPlan, Module, PlanModule, sequelize } = require('../src/models');

const basePlans = [
  // =====================
  // PLAN BÁSICO - GRATUITO PARA SIEMPRE (App Store Compliant)
  // =====================
  {
    planData: {
      name: 'Básico',
      description: '¡Gratis para siempre! Plan ideal para negocios unipersonales y emprendedores que trabajan solos. Agenda tus citas y gestiona hasta 10 procedimientos de forma simple.',
      price: 0, // GRATUITO
      currency: 'COP',
      duration: 1,
      durationType: 'MONTHS',
      maxUsers: 1, // Solo 1 usuario (unipersonal)
      maxClients: 50,
      maxAppointments: 100,
      maxServices: 10, // Máximo 10 procedimientos
      storageLimit: 524288000, // 500MB
      status: 'ACTIVE',
      isPopular: false,
      trialDays: 0, // No necesita trial, es gratis
      features: {
        appointments: 'Agenda básica de citas (hasta 100/mes)',
        clients: 'Base de datos de hasta 50 clientes',
        services: 'Hasta 10 procedimientos/servicios',
        unipersonal: 'Ideal para trabajadores independientes',
        payments: 'Registro de pagos en efectivo',
        support: 'Soporte por email',
        trial_upgrade: 'Prueba GRATIS 15 días del Plan Estándar'
      },
      limitations: {
        unipersonal: 'Solo para 1 persona (tú mismo)',
        single_branch: 'Solo 1 sucursal',
        limited_services: 'Máximo 10 procedimientos',
        no_reminders: 'Sin recordatorios automáticos',
        no_integrations: 'Sin integraciones de pago online',
        no_analytics: 'Sin reportes avanzados',
        no_inventory: 'Sin gestión de inventario',
        limited_clients: 'Máximo 50 clientes',
        limited_appointments: 'Máximo 100 citas/mes'
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
  // PLAN ESTÁNDAR - Salón en crecimiento (MÁS POPULAR)
  // =====================
  {
    planData: {
      name: 'Estándar',
      description: 'Plan perfecto para salones en crecimiento. Incluye recordatorios automáticos, inventario y control de gastos. ¡Prueba GRATIS 15 días!',
      price: 79900,
      currency: 'COP',
      duration: 1,
      durationType: 'MONTHS',
      maxUsers: 5,
      maxClients: 300,
      maxAppointments: 500,
      storageLimit: 3221225472, // 3GB
      status: 'ACTIVE',
      isPopular: true, // MÁS POPULAR
      trialDays: 7,
      features: {
        appointments: 'Gestión de citas con recordatorios automáticos',
        clients: 'Base de datos de hasta 300 clientes con historial',
        inventory: 'Gestión de inventario básico',
        expenses: 'Control de gastos del negocio',
        payments: 'Pagos en efectivo únicamente',
        support: 'Soporte prioritario',
        trial: '15 días de prueba GRATIS'
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
  // PLAN PROFESIONAL - Más capacidad y reportes avanzados
  // =====================
  {
    planData: {
      name: 'Profesional',
      description: 'Plan profesional con mayor capacidad y reportes avanzados. Ideal para salones establecidos que necesitan más usuarios y almacenamiento. ¡Prueba GRATIS 15 días!',
      price: 119900,
      currency: 'COP',
      duration: 1,
      durationType: 'MONTHS',
      maxUsers: 10,
      maxClients: 1000,
      maxAppointments: 2000,
      storageLimit: 10737418240, // 10GB
      status: 'ACTIVE',
      isPopular: false,
      trialDays: 7,
      features: {
        appointments: 'Gestión completa de citas con recordatorios',
        clients: 'Base de datos de hasta 1000 clientes con historial completo',
        inventory: 'Gestión de inventario con control de stock',
        expenses: 'Control completo de gastos',
        balance: 'Balance general financiero',
        payments: 'Pagos en efectivo únicamente',
        analytics: 'Reportes y análisis avanzados',
        support: 'Soporte prioritario',
        trial: '15 días de prueba GRATIS'
      },
      limitations: {
        single_branch: 'Solo 1 sucursal',
        no_online_payments: 'Sin pagos online (disponible en Premium)'
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
      // PAYMENTS (SIN WOMPI - solo pagos básicos)
      { moduleName: 'basic-payments', isIncluded: true },
      // REPORTS & ANALYTICS
      { moduleName: 'expenses', isIncluded: true },
      { moduleName: 'balance', isIncluded: true },
      { moduleName: 'client_history', isIncluded: true },
      { moduleName: 'advanced-analytics', isIncluded: true }
    ]
  },

  // =====================
  // PLAN PREMIUM - Todo incluido + Pagos Online + Facturación
  // =====================
  {
    planData: {
      name: 'Premium',
      description: 'Plan completo con pagos online (Wompi), facturación electrónica (Taxxa) y análisis avanzado. Incluye configuración asistida de integraciones. ¡Prueba GRATIS 30 días!',
      price: 169900,
      currency: 'COP',
      duration: 1,
      durationType: 'MONTHS',
      maxUsers: 20,
      maxClients: 5000,
      maxAppointments: null, // Sin límite
      storageLimit: 21474836480, // 20GB
      status: 'ACTIVE',
      isPopular: false,
      trialDays: 7, // Trial más largo para probar integraciones
      features: {
        appointments: 'Gestión completa de citas con recordatorios',
        clients: 'Base de datos de hasta 5000 clientes con historial completo',
        inventory: 'Gestión completa de inventario y proveedores',
        expenses: 'Control completo de gastos y balance',
        payments: 'Todas las opciones de pago: Efectivo + Wompi (tarjetas, PSE)',
        invoicing: 'Facturación electrónica con Taxxa',
        analytics: 'Análisis avanzado con reportes personalizados',
        onboarding: 'Configuración asistida de Wompi y Taxxa',
        support: 'Soporte VIP 24/7',
        trial: '30 días de prueba GRATIS'
      },
      limitations: {
        single_branch: 'Solo 1 sucursal (multi-sucursal en Enterprise)'
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
      trialDays: 7,
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

/**
 * Seed de planes de suscripción
 * @param {boolean} closeConnection - Si debe cerrar la conexión al finalizar (default: false para API)
 */
async function seedPlans(closeConnection = false) {
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
    
    return {
      created: createdCount,
      skipped: skippedCount,
      total: basePlans.length
    };
    
  } catch (error) {
    console.error('❌ Error durante el seeding de planes:', error);
    throw error;
  } finally {
    if (closeConnection) {
      await sequelize.close();
    }
  }
}

// Ejecutar el seeding si el script se ejecuta directamente
if (require.main === module) {
  seedPlans(true) // Cerrar conexión cuando se ejecuta como script
    .then(() => {
      console.log('✨ Script de seeding de planes finalizado.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal en el script de seeding de planes:', error);
      process.exit(1);
    });
}

module.exports = seedPlans; // Exportar solo la función