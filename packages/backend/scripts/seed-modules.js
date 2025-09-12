#!/usr/bin/env node

/**
 * Script para inicializar módulos base del sistema Beauty Control
 * Uso: node scripts/seed-modules.js
 */

require('dotenv').config();
const { Module, sequelize } = require('../src/models');

const baseModules = [
  // MÓDULOS CORE (Fundamentales)
  {
    name: 'authentication',
    displayName: 'Autenticación',
    description: 'Sistema de autenticación y autorización de usuarios',
    icon: 'key',
    category: 'CORE',
    status: 'ACTIVE',
    version: '1.0.0',
    requiresConfiguration: false,
    permissions: ['auth.login', 'auth.logout', 'auth.reset-password'],
    dependencies: [],
    pricing: { type: 'FREE', price: 0, currency: 'COP' }
  },
  {
    name: 'dashboard',
    displayName: 'Panel de Control',
    description: 'Dashboard principal con métricas y resúmenes',
    icon: 'dashboard',
    category: 'CORE',
    status: 'ACTIVE',
    version: '1.0.0',
    requiresConfiguration: false,
    permissions: ['dashboard.view'],
    dependencies: [],
    pricing: { type: 'FREE', price: 0, currency: 'COP' }
  },
  {
    name: 'user-management',
    displayName: 'Gestión de Usuarios',
    description: 'Administración de usuarios del negocio',
    icon: 'users',
    category: 'CORE',
    status: 'ACTIVE',
    version: '1.0.0',
    requiresConfiguration: false,
    permissions: ['users.view', 'users.create', 'users.edit', 'users.delete'],
    dependencies: [],
    pricing: { type: 'FREE', price: 0, currency: 'COP' }
  },

  // MÓDULOS DE CITAS
  {
    name: 'appointment-booking',
    displayName: 'Reserva de Citas',
    description: 'Sistema de reserva y gestión de citas básico',
    icon: 'calendar',
    category: 'APPOINTMENTS',
    status: 'ACTIVE',
    version: '1.0.0',
    requiresConfiguration: true,
    configurationSchema: {
      type: 'object',
      properties: {
        allowOnlineBooking: { type: 'boolean', default: true },
        advanceBookingDays: { type: 'number', default: 30 },
        requiresConfirmation: { type: 'boolean', default: false }
      }
    },
    permissions: ['appointments.view', 'appointments.create', 'appointments.edit', 'appointments.cancel'],
    dependencies: [],
    pricing: { type: 'BASIC', price: 15000, currency: 'COP' }
  },
  {
    name: 'appointment-reminders',
    displayName: 'Recordatorios de Citas',
    description: 'Envío automático de recordatorios por SMS/Email',
    icon: 'bell',
    category: 'APPOINTMENTS',
    status: 'ACTIVE',
    version: '1.0.0',
    requiresConfiguration: true,
    configurationSchema: {
      type: 'object',
      properties: {
        emailReminders: { type: 'boolean', default: true },
        smsReminders: { type: 'boolean', default: false },
        reminderHoursBefore: { type: 'number', default: 24 }
      }
    },
    permissions: ['reminders.configure', 'reminders.send'],
    dependencies: [],
    pricing: { type: 'PREMIUM', price: 25000, currency: 'COP' }
  },
  {
    name: 'advanced-scheduling',
    displayName: 'Programación Avanzada',
    description: 'Gestión de horarios complejos, recursos y servicios múltiples',
    icon: 'calendar-plus',
    category: 'APPOINTMENTS',
    status: 'ACTIVE',
    version: '1.0.0',
    requiresConfiguration: true,
    configurationSchema: {
      type: 'object',
      properties: {
        resourceBooking: { type: 'boolean', default: false },
        multiServiceBooking: { type: 'boolean', default: false },
        waitingList: { type: 'boolean', default: false }
      }
    },
    permissions: ['appointments.advanced', 'resources.manage'],
    dependencies: [],
    pricing: { type: 'PREMIUM', price: 35000, currency: 'COP' }
  },

  // MÓDULOS DE INVENTARIO
  {
    name: 'basic-inventory',
    displayName: 'Inventario Básico',
    description: 'Gestión básica de productos y servicios',
    icon: 'package',
    category: 'INVENTORY',
    status: 'ACTIVE',
    version: '1.0.0',
    requiresConfiguration: false,
    permissions: ['inventory.view', 'products.manage', 'services.manage'],
    dependencies: [],
    pricing: { type: 'BASIC', price: 20000, currency: 'COP' }
  },
  {
    name: 'stock-control',
    displayName: 'Control de Stock',
    description: 'Seguimiento de existencias y alertas de stock bajo',
    icon: 'trending-down',
    category: 'INVENTORY',
    status: 'ACTIVE',
    version: '1.0.0',
    requiresConfiguration: true,
    configurationSchema: {
      type: 'object',
      properties: {
        lowStockAlert: { type: 'boolean', default: true },
        minimumStockLevel: { type: 'number', default: 5 },
        autoReorderEnabled: { type: 'boolean', default: false }
      }
    },
    permissions: ['stock.view', 'stock.adjust', 'alerts.configure'],
    dependencies: [],
    pricing: { type: 'PREMIUM', price: 30000, currency: 'COP' }
  },

  // MÓDULOS DE PAGOS
  {
    name: 'basic-payments',
    displayName: 'Pagos Básicos',
    description: 'Procesamiento básico de pagos en efectivo',
    icon: 'dollar-sign',
    category: 'PAYMENTS',
    status: 'ACTIVE',
    version: '1.0.0',
    requiresConfiguration: false,
    permissions: ['payments.process', 'payments.view'],
    dependencies: [],
    pricing: { type: 'FREE', price: 0, currency: 'COP' }
  },
  {
    name: 'wompi-integration',
    displayName: 'Wompi',
    description: 'Integración con Wompi para pagos con tarjetas y PSE',
    icon: 'credit-card',
    category: 'INTEGRATIONS',
    status: 'ACTIVE',
    version: '1.0.0',
    requiresConfiguration: true,
    configurationSchema: {
      type: 'object',
      properties: {
        publicKey: { type: 'string', default: '' },
        privateKey: { type: 'string', default: '' },
        environment: { type: 'string', default: 'sandbox' },
        enablePSE: { type: 'boolean', default: true },
        enableCards: { type: 'boolean', default: true },
        webhookUrl: { type: 'string', default: '' }
      }
    },
    permissions: ['payments.wompi', 'integrations.configure'],
    dependencies: [],
    pricing: { type: 'PREMIUM', price: 35000, currency: 'COP' }
  },
  {
    name: 'taxxa-integration',
    displayName: 'Taxxa',
    description: 'Integración con Taxxa para facturación electrónica',
    icon: 'file-text',
    category: 'INTEGRATIONS',
    status: 'ACTIVE',
    version: '1.0.0',
    requiresConfiguration: true,
    configurationSchema: {
      type: 'object',
      properties: {
        apiKey: { type: 'string', default: '' },
        companyId: { type: 'string', default: '' },
        environment: { type: 'string', default: 'test' },
        autoGenerateInvoice: { type: 'boolean', default: false },
        invoiceTemplate: { type: 'string', default: 'standard' }
      }
    },
    permissions: ['invoicing.taxxa', 'integrations.configure'],
    dependencies: [],
    pricing: { type: 'PREMIUM', price: 25000, currency: 'COP' }
  },
  {
    name: 'mercadopago-integration',
    displayName: 'MercadoPago',
    description: 'Integración con MercadoPago para pagos online',
    icon: 'shopping-cart',
    category: 'INTEGRATIONS',
    status: 'DEVELOPMENT',
    version: '1.0.0',
    requiresConfiguration: true,
    configurationSchema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', default: '' },
        publicKey: { type: 'string', default: '' },
        environment: { type: 'string', default: 'sandbox' },
        installments: { type: 'number', default: 12 }
      }
    },
    permissions: ['payments.mercadopago', 'integrations.configure'],
    dependencies: [],
    pricing: { type: 'PREMIUM', price: 30000, currency: 'COP' }
  },

  // MÓDULOS DE REPORTES
  {
    name: 'basic-reports',
    displayName: 'Reportes Básicos',
    description: 'Reportes básicos de ventas y citas',
    icon: 'file-text',
    category: 'REPORTS',
    status: 'ACTIVE',
    version: '1.0.0',
    requiresConfiguration: false,
    permissions: ['reports.basic', 'reports.export'],
    dependencies: [],
    pricing: { type: 'BASIC', price: 18000, currency: 'COP' }
  },
  {
    name: 'advanced-analytics',
    displayName: 'Análisis Avanzado',
    description: 'Análisis avanzado con gráficos y métricas detalladas',
    icon: 'bar-chart',
    category: 'ANALYTICS',
    status: 'ACTIVE',
    version: '1.0.0',
    requiresConfiguration: true,
    configurationSchema: {
      type: 'object',
      properties: {
        autoGenerateReports: { type: 'boolean', default: false },
        reportFrequency: { type: 'string', default: 'weekly' },
        includeComparisons: { type: 'boolean', default: true }
      }
    },
    permissions: ['analytics.view', 'analytics.configure'],
    dependencies: [],
    pricing: { type: 'PREMIUM', price: 40000, currency: 'COP' }
  },

  // MÓDULOS DE COMUNICACIONES
  {
    name: 'email-marketing',
    displayName: 'Email Marketing',
    description: 'Envío de campañas de email marketing a clientes',
    icon: 'mail',
    category: 'COMMUNICATIONS',
    status: 'DEVELOPMENT',
    version: '1.0.0',
    requiresConfiguration: true,
    configurationSchema: {
      type: 'object',
      properties: {
        templateCustomization: { type: 'boolean', default: true },
        automatedCampaigns: { type: 'boolean', default: false },
        segmentation: { type: 'boolean', default: false }
      }
    },
    permissions: ['marketing.send', 'marketing.configure', 'templates.manage'],
    dependencies: [],
    pricing: { type: 'PREMIUM', price: 35000, currency: 'COP' }
  },
  {
    name: 'sms-notifications',
    displayName: 'Notificaciones SMS',
    description: 'Envío de notificaciones y recordatorios por SMS',
    icon: 'message-circle',
    category: 'COMMUNICATIONS',
    status: 'DEVELOPMENT',
    version: '1.0.0',
    requiresConfiguration: true,
    configurationSchema: {
      type: 'object',
      properties: {
        enableAutomaticSMS: { type: 'boolean', default: false },
        smsProvider: { type: 'string', default: '' },
        allowCustomMessages: { type: 'boolean', default: true }
      }
    },
    permissions: ['sms.send', 'sms.configure'],
    dependencies: [],
    pricing: { type: 'PREMIUM', price: 28000, currency: 'COP' }
  },

  // MÓDULOS DE INTEGRACIONES
  {
    name: 'social-media-booking',
    displayName: 'Reservas Redes Sociales',
    description: 'Integración con Facebook, Instagram para reservas',
    icon: 'share-2',
    category: 'INTEGRATIONS',
    status: 'DEVELOPMENT',
    version: '1.0.0',
    requiresConfiguration: true,
    configurationSchema: {
      type: 'object',
      properties: {
        facebookIntegration: { type: 'boolean', default: false },
        instagramIntegration: { type: 'boolean', default: false },
        autoSyncAvailability: { type: 'boolean', default: true }
      }
    },
    permissions: ['integrations.social', 'integrations.configure'],
    dependencies: [],
    pricing: { type: 'PREMIUM', price: 50000, currency: 'COP' }
  }
];

async function seedModules() {
  try {
    console.log('🌱 Iniciando seeding de módulos base...');
    
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const moduleData of baseModules) {
      // Verificar si el módulo ya existe
      const existingModule = await Module.findOne({ 
        where: { name: moduleData.name } 
      });
      
      if (existingModule) {
        console.log(`⏭️  Módulo '${moduleData.name}' ya existe, saltando...`);
        skippedCount++;
        continue;
      }
      
      // Crear el módulo
      const newModule = await Module.create(moduleData);
      console.log(`✅ Módulo '${newModule.name}' creado exitosamente.`);
      createdCount++;
    }
    
    console.log('\n📊 Resumen del seeding:');
    console.log(`   • Módulos creados: ${createdCount}`);
    console.log(`   • Módulos existentes: ${skippedCount}`);
    console.log(`   • Total de módulos base: ${baseModules.length}`);
    console.log('🎉 Seeding completado exitosamente!\n');
    
  } catch (error) {
    console.error('❌ Error durante el seeding de módulos:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el seeding si el script se ejecuta directamente
if (require.main === module) {
  seedModules()
    .then(() => {
      console.log('✨ Script de seeding finalizado.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal en el script de seeding:', error);
      process.exit(1);
    });
}

module.exports = { seedModules, baseModules };