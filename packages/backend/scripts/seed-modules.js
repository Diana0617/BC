#!/usr/bin/env node

/**
 * Script para inicializar módulos base del sistema Beauty Control
 * Uso: node scripts/seed-modules.js
 */

require('dotenv').config();
const { Module, sequelize } = require('../src/models');

const baseModules = [
  // =====================
  // MÓDULOS CORE (Fundamentales - Siempre incluidos)
  // =====================
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
  {
    name: 'multi_branch',
    displayName: 'Múltiples Sucursales',
    description: 'Permite gestionar más de una sucursal en un mismo negocio',
    icon: 'map-pin',
    category: 'CORE',
    status: 'ACTIVE',
    version: '1.0.0',
    requiresConfiguration: true,
    configurationSchema: {
      type: 'object',
      properties: {
        maxBranches: { type: 'number', default: 1 }
      }
    },
    permissions: ['branches.view', 'branches.create', 'branches.edit', 'branches.delete'],
    dependencies: [],
    pricing: { type: 'PREMIUM', price: 45000, currency: 'COP' }
  },

  // =====================
  // MÓDULOS DE CITAS
  // =====================
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
    pricing: { type: 'FREE', price: 0, currency: 'COP' }
  },
  {
    name: 'appointment-reminders',
    displayName: 'Recordatorios de Citas',
    description: 'Envío automático de recordatorios por WhatsApp/SMS',
    icon: 'bell',
    category: 'APPOINTMENTS',
    status: 'ACTIVE',
    version: '1.0.0',
    requiresConfiguration: true,
    configurationSchema: {
      type: 'object',
      properties: {
        whatsappReminders: { type: 'boolean', default: true },
        smsReminders: { type: 'boolean', default: false },
        reminderHoursBefore: { type: 'number', default: 24 }
      }
    },
    permissions: ['reminders.configure', 'reminders.send'],
    dependencies: [],
    pricing: { type: 'PREMIUM', price: 25000, currency: 'COP' }
  },

  // =====================
  // MÓDULOS DE INVENTARIO
  // =====================
  {
    name: 'inventory',
    displayName: 'Inventario',
    description: 'Gestión de stock de insumos y productos vendibles, incluyendo proveedores',
    icon: 'box',
    category: 'INVENTORY',
    status: 'ACTIVE',
    version: '1.0.0',
    requiresConfiguration: false,
    permissions: ['inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete', 'suppliers.manage'],
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
    dependencies: ['inventory'],
    pricing: { type: 'PREMIUM', price: 30000, currency: 'COP' }
  },

  // =====================
  // MÓDULOS DE PAGOS Y FACTURACIÓN
  // =====================
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
    name: 'wompi_integration',
    displayName: 'Integración Wompi',
    description: 'Pagos en línea a través de Wompi (tarjetas y PSE)',
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
    name: 'taxxa_integration',
    displayName: 'Integración Taxxa',
    description: 'Facturación electrónica con Taxxa',
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

  // =====================
  // MÓDULOS DE REPORTES Y ANÁLISIS
  // =====================
  {
    name: 'expenses',
    displayName: 'Control de Gastos',
    description: 'Registro y categorización de gastos del negocio',
    icon: 'dollar-sign',
    category: 'REPORTS',
    status: 'ACTIVE',
    version: '1.0.0',
    requiresConfiguration: false,
    permissions: ['expenses.view', 'expenses.create', 'expenses.edit', 'expenses.delete'],
    dependencies: [],
    pricing: { type: 'BASIC', price: 15000, currency: 'COP' }
  },
  {
    name: 'balance',
    displayName: 'Balance General',
    description: 'Reporte financiero completo del negocio',
    icon: 'bar-chart-2',
    category: 'REPORTS',
    status: 'ACTIVE',
    version: '1.0.0',
    requiresConfiguration: false,
    permissions: ['balance.view', 'reports.financial'],
    dependencies: ['expenses', 'basic-payments'],
    pricing: { type: 'BASIC', price: 18000, currency: 'COP' }
  },
  {
    name: 'client_history',
    displayName: 'Historial de Clientes',
    description: 'Turnos cumplidos, cancelados y procedimientos realizados',
    icon: 'users',
    category: 'ANALYTICS',
    status: 'ACTIVE',
    version: '1.0.0',
    requiresConfiguration: false,
    permissions: ['clients.history', 'analytics.view'],
    dependencies: ['appointment-booking'],
    pricing: { type: 'BASIC', price: 12000, currency: 'COP' }
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
    dependencies: ['client_history', 'balance'],
    pricing: { type: 'PREMIUM', price: 40000, currency: 'COP' }
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
      // Usar findOrCreate para evitar duplicados
      const [module, wasCreated] = await Module.findOrCreate({
        where: { name: moduleData.name },
        defaults: moduleData
      });
      
      if (wasCreated) {
        console.log(`✅ Módulo '${module.name}' creado exitosamente.`);
        createdCount++;
      } else {
        console.log(`⏭️  Módulo '${moduleData.name}' ya existe, saltando...`);
        skippedCount++;
      }
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