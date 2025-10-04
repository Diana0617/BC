const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('./src/config/database');
const Module = require('./src/models/Module');

async function seedModules() {
  // Módulos existentes (mantener consistencia con frontend)
  const existingModules = [
    {
      name: 'facturacion_electronica',
      displayName: 'Facturación Electrónica',
      description: 'Sistema de facturación electrónica con integración Taxxa.',
      category: 'INTEGRATIONS',
      icon: 'file-text',
      requiresConfiguration: true
    },
    {
      name: 'gestion_de_turnos',
      displayName: 'Gestión de Turnos',
      description: 'Sistema completo para gestión de citas y turnos.',
      category: 'APPOINTMENTS',
      icon: 'calendar',
      requiresConfiguration: true
    }
  ];

  // Nuevos módulos a agregar
  const newModules = [
    {
      name: 'inventory',
      displayName: 'Inventario',
      description: 'Gestión de stock de insumos y productos vendibles, incluyendo proveedores.',
      category: 'INVENTORY',
      icon: 'box',
      requiresConfiguration: false
    },
    {
      name: 'expenses',
      displayName: 'Control de Gastos',
      description: 'Registro y categorización de gastos del negocio.',
      category: 'REPORTS',
      icon: 'dollar-sign',
      requiresConfiguration: false
    },
    {
      name: 'balance',
      displayName: 'Balance General',
      description: 'Reporte financiero completo del negocio.',
      category: 'REPORTS',
      icon: 'bar-chart-2',
      requiresConfiguration: false
    },
    {
      name: 'client_history',
      displayName: 'Historial de Clientes',
      description: 'Turnos cumplidos, cancelados y procedimientos realizados.',
      category: 'ANALYTICS',
      icon: 'users',
      requiresConfiguration: false
    },
    {
      name: 'multi_branch',
      displayName: 'Múltiples Sucursales',
      description: 'Permite gestionar más de una sucursal en un mismo negocio.',
      category: 'CORE',
      icon: 'map-pin',
      requiresConfiguration: true,
      configurationSchema: { maxBranches: { type: 'number', default: 1 } }
    },
    {
      name: 'wompi_integration',
      displayName: 'Integración Wompi',
      description: 'Pagos en línea a través de Wompi.',
      category: 'INTEGRATIONS',
      icon: 'credit-card',
      requiresConfiguration: true
    },
    {
      name: 'taxxa_integration',
      displayName: 'Integración Taxxa',
      description: 'Facturación electrónica con Taxxa.',
      category: 'INTEGRATIONS',
      icon: 'file-text',
      requiresConfiguration: true
    },
    // Módulos adicionales que podrían ser útiles
    {
      name: 'online_booking',
      displayName: 'Reservas en Línea',
      description: 'Permite a los clientes reservar citas desde la web.',
      category: 'APPOINTMENTS',
      icon: 'globe',
      requiresConfiguration: true
    },
    {
      name: 'sms_notifications',
      displayName: 'Notificaciones SMS',
      description: 'Envío de recordatorios y confirmaciones por SMS.',
      category: 'COMMUNICATIONS',
      icon: 'message-square',
      requiresConfiguration: true
    },
    {
      name: 'email_marketing',
      displayName: 'Email Marketing',
      description: 'Campañas de email y comunicación con clientes.',
      category: 'COMMUNICATIONS',
      icon: 'mail',
      requiresConfiguration: true
    },
    {
      name: 'loyalty_program',
      displayName: 'Programa de Fidelización',
      description: 'Sistema de puntos y recompensas para clientes.',
      category: 'ANALYTICS',
      icon: 'star',
      requiresConfiguration: true
    },
    {
      name: 'advanced_reports',
      displayName: 'Reportes Avanzados',
      description: 'Análisis detallado de ventas, clientes y rendimiento.',
      category: 'ANALYTICS',
      icon: 'trending-up',
      requiresConfiguration: false
    }
  ];

  const allModules = [...existingModules, ...newModules];

  console.log(`🔄 Procesando ${allModules.length} módulos...`);

  for (const moduleData of allModules) {
    try {
      // Usar findOrCreate para evitar duplicados
      const [module, created] = await Module.findOrCreate({
        where: { name: moduleData.name },
        defaults: {
          id: uuidv4(),
          ...moduleData,
          status: 'ACTIVE',
          version: '1.0.0'
        }
      });

      if (created) {
        console.log(`✅ Creado: ${moduleData.displayName}`);
      } else {
        console.log(`⏭️  Ya existe: ${moduleData.displayName}`);
      }
    } catch (error) {
      console.error(`❌ Error con ${moduleData.name}:`, error.message);
    }
  }

  console.log('✅ Proceso de módulos completado');
}

async function run() {
  try {
    await sequelize.authenticate();
    console.log('🔗 Conectado a la base de datos');

    await seedModules();

    console.log('🎉 Script completado exitosamente');
  } catch (error) {
    console.error('💥 Error en el script:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

run();