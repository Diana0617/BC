#!/usr/bin/env node

/**
 * Script para inicializar plantillas de reglas base del sistema Beauty Control
 * Uso: node scripts/seed-rule-templates.js
 */

require('dotenv').config();
const { RuleTemplate, sequelize } = require('../src/models');

const ruleTemplates = [
  // =====================
  // GESTIÓN DE CITAS
  // =====================
  {
    key: 'CITAS_DIAS_ANTICIPACION_MAXIMA',
    type: 'NUMBER',
    defaultValue: 30,
    description: 'Días máximos de anticipación para agendar citas',
    category: 'BOOKING_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    validationRules: {
      min: 1,
      max: 365,
      type: 'integer'
    },
    examples: {
      values: [7, 15, 30, 60],
      descriptions: ['1 semana', '2 semanas', '1 mes', '2 meses']
    }
  },
  {
    key: 'CITAS_HORAS_ANTICIPACION_MINIMA',
    type: 'NUMBER', 
    defaultValue: 2,
    description: 'Horas mínimas de anticipación para agendar citas',
    category: 'BOOKING_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    validationRules: {
      min: 0,
      max: 72,
      type: 'integer'
    },
    examples: {
      values: [0, 1, 2, 4, 24],
      descriptions: ['Sin restricción', '1 hora', '2 horas', '4 horas', '1 día']
    }
  },
  {
    key: 'CITAS_HORAS_CANCELACION',
    type: 'NUMBER',
    defaultValue: 24,
    description: 'Horas de anticipación para cancelar sin penalización',
    category: 'CANCELLATION_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    validationRules: {
      min: 0,
      max: 168,
      type: 'integer'
    },
    examples: {
      values: [2, 4, 12, 24, 48],
      descriptions: ['2 horas', '4 horas', '12 horas', '1 día', '2 días']
    }
  },
  {
    key: 'CITAS_MAXIMAS_POR_DIA',
    type: 'NUMBER',
    defaultValue: 10,
    description: 'Número máximo de citas por cliente al día',
    category: 'BOOKING_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    validationRules: {
      min: 1,
      max: 50,
      type: 'integer'
    },
    examples: {
      values: [1, 3, 5, 10, 20],
      descriptions: ['Solo 1 cita', '3 citas', '5 citas', '10 citas', 'Hasta 20 citas']
    }
  },
  {
    key: 'CITAS_RECORDATORIOS_ACTIVADOS',
    type: 'BOOLEAN',
    defaultValue: true,
    description: 'Activar recordatorios automáticos de citas',
    category: 'NOTIFICATION_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    examples: {
      values: [true, false],
      descriptions: ['Recordatorios activados', 'Sin recordatorios']
    }
  },
  {
    key: 'CITAS_HORAS_RECORDATORIO',
    type: 'NUMBER',
    defaultValue: 24,
    description: 'Horas de anticipación para enviar recordatorios',
    category: 'NOTIFICATION_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    validationRules: {
      min: 1,
      max: 168,
      type: 'integer'
    },
    examples: {
      values: [2, 4, 12, 24, 48],
      descriptions: ['2 horas antes', '4 horas antes', '12 horas antes', '1 día antes', '2 días antes']
    }
  },
  {
    key: 'CITAS_PERMITIR_SIMULTANEAS',
    type: 'BOOLEAN',
    defaultValue: false,
    description: 'Permitir citas simultáneas con diferentes especialistas',
    category: 'BOOKING_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    examples: {
      values: [true, false],
      descriptions: ['Permitir citas simultáneas', 'Solo una cita a la vez']
    }
  },
  {
    key: 'CITAS_TIEMPO_LIBRE_ENTRE_CITAS',
    type: 'NUMBER',
    defaultValue: 15,
    description: 'Tiempo libre entre citas (en minutos)',
    category: 'BOOKING_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    validationRules: {
      min: 0,
      max: 60,
      type: 'integer'
    },
    examples: {
      values: [0, 5, 10, 15, 30],
      descriptions: ['Sin tiempo libre', '5 minutos', '10 minutos', '15 minutos', '30 minutos']
    }
  },

  // =====================
  // FACTURACIÓN ELECTRÓNICA
  // =====================
  {
    key: 'FACTURA_GENERACION_AUTOMATICA',
    type: 'BOOLEAN',
    defaultValue: true,
    description: 'Generar facturas automáticamente al completar servicios',
    category: 'SERVICE_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'facturacion_electronica',
    examples: {
      values: [true, false],
      descriptions: ['Facturación automática', 'Facturación manual']
    }
  },
  {
    key: 'FACTURA_PLAZO_PAGO_DIAS',
    type: 'NUMBER',
    defaultValue: 0,
    description: 'Plazo de pago de facturas en días (0 = pago inmediato)',
    category: 'PAYMENT_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'facturacion_electronica',
    validationRules: {
      min: 0,
      max: 180,
      type: 'integer'
    },
    examples: {
      values: [0, 15, 30, 45, 60],
      descriptions: ['Pago inmediato', '15 días', '30 días', '45 días', '60 días']
    }
  },
  {
    key: 'FACTURA_INCLUIR_IVA',
    type: 'BOOLEAN',
    defaultValue: true,
    description: 'Incluir IVA en las facturas',
    category: 'SERVICE_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'facturacion_electronica',
    examples: {
      values: [true, false],
      descriptions: ['Incluir IVA', 'Sin IVA']
    }
  },
  {
    key: 'FACTURA_PORCENTAJE_IVA',
    type: 'NUMBER',
    defaultValue: 19,
    description: 'Porcentaje de IVA a aplicar (%)',
    category: 'SERVICE_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'facturacion_electronica',
    validationRules: {
      min: 0,
      max: 100,
      type: 'decimal',
      step: 0.1
    },
    examples: {
      values: [0, 5, 10, 19, 21],
      descriptions: ['Sin IVA', '5%', '10%', '19% (Colombia)', '21%']
    }
  },
  {
    key: 'FACTURA_RECARGO_MORA',
    type: 'NUMBER',
    defaultValue: 0,
    description: 'Recargo por pago tardío (%)',
    category: 'PAYMENT_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'facturacion_electronica',
    validationRules: {
      min: 0,
      max: 50,
      type: 'decimal',
      step: 0.1
    },
    examples: {
      values: [0, 1, 2.5, 5, 10],
      descriptions: ['Sin recargo', '1%', '2.5%', '5%', '10%']
    }
  },
  {
    key: 'FACTURA_ENVIAR_EMAIL',
    type: 'BOOLEAN',
    defaultValue: true,
    description: 'Enviar facturas por correo electrónico automáticamente',
    category: 'NOTIFICATION_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'facturacion_electronica',
    examples: {
      values: [true, false],
      descriptions: ['Envío automático', 'Envío manual']
    }
  },
  {
    key: 'FACTURA_REQUIERE_FIRMA',
    type: 'BOOLEAN',
    defaultValue: false,
    description: 'Requerir firma digital en facturas electrónicas',
    category: 'SERVICE_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'facturacion_electronica',
    examples: {
      values: [true, false],
      descriptions: ['Requiere firma', 'Sin firma requerida']
    }
  },
  {
    key: 'FACTURA_FORMATO_NUMERACION',
    type: 'STRING',
    defaultValue: 'F-{YEAR}-{NUMBER}',
    description: 'Formato de numeración de facturas',
    category: 'SERVICE_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'facturacion_electronica',
    validationRules: {
      pattern: '^[A-Za-z0-9\\-{}]+$',
      maxLength: 50
    },
    examples: {
      values: ['F-{YEAR}-{NUMBER}', '{NUMBER}', 'FAC-{YEAR}{MONTH}-{NUMBER}', 'INV-{NUMBER}'],
      descriptions: ['F-2024-001', '001', 'FAC-202401-001', 'INV-001']
    }
  },

  // =====================
  // POLÍTICAS GENERALES DEL NEGOCIO
  // =====================
  {
    key: 'NEGOCIO_HORA_APERTURA',
    type: 'STRING',
    defaultValue: '08:00',
    description: 'Hora de inicio de operaciones del negocio',
    category: 'WORKING_HOURS',
    allowCustomization: true,
    version: '1.0.0',
    validationRules: {
      pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
    },
    examples: {
      values: ['06:00', '08:00', '09:00', '10:00'],
      descriptions: ['6:00 AM', '8:00 AM', '9:00 AM', '10:00 AM']
    }
  },
  {
    key: 'NEGOCIO_HORA_CIERRE',
    type: 'STRING',
    defaultValue: '18:00',
    description: 'Hora de fin de operaciones del negocio',
    category: 'WORKING_HOURS',
    allowCustomization: true,
    version: '1.0.0',
    validationRules: {
      pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
    },
    examples: {
      values: ['17:00', '18:00', '20:00', '22:00'],
      descriptions: ['5:00 PM', '6:00 PM', '8:00 PM', '10:00 PM']
    }
  },
  {
    key: 'PAGO_ACEPTAR_EFECTIVO',
    type: 'BOOLEAN',
    defaultValue: true,
    description: 'Aceptar pagos en efectivo',
    category: 'PAYMENT_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    examples: {
      values: [true, false],
      descriptions: ['Acepta efectivo', 'Solo digital']
    }
  },
  {
    key: 'PAGO_ACEPTAR_TARJETA',
    type: 'BOOLEAN',
    defaultValue: true,
    description: 'Aceptar pagos con tarjeta de crédito/débito',
    category: 'PAYMENT_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    examples: {
      values: [true, false],
      descriptions: ['Acepta tarjetas', 'Sin tarjetas']
    }
  },
  {
    key: 'ESPECIALISTA_USAR_COMISIONES',
    type: 'BOOLEAN',
    defaultValue: true,
    description: 'Usar sistema de comisiones para el pago de especialistas',
    category: 'PAYMENT_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    examples: {
      values: [true, false],
      descriptions: ['Comisiones por servicio', 'Sueldo fijo']
    }
  },
  {
    key: 'ESPECIALISTA_PORCENTAJE_COMISION',
    type: 'NUMBER',
    defaultValue: 50,
    description: 'Porcentaje de comisión por defecto para especialistas (%)',
    category: 'PAYMENT_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    validationRules: {
      min: 0,
      max: 100,
      type: 'number'
    },
    examples: {
      values: [30, 40, 50, 60, 70],
      descriptions: ['30%', '40%', '50%', '60%', '70%']
    }
  },
  {
    key: 'DEVOLUCION_PERMITIR',
    type: 'BOOLEAN',
    defaultValue: true,
    description: 'Permitir devoluciones y reembolsos',
    category: 'REFUND_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    examples: {
      values: [true, false],
      descriptions: ['Permite devoluciones', 'Sin devoluciones']
    }
  },
  {
    key: 'DEVOLUCION_PLAZO_DIAS',
    type: 'NUMBER',
    defaultValue: 7,
    description: 'Días límite para solicitar devoluciones',
    category: 'REFUND_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    validationRules: {
      min: 1,
      max: 365,
      type: 'integer'
    },
    examples: {
      values: [3, 7, 15, 30, 90],
      descriptions: ['3 días', '1 semana', '2 semanas', '1 mes', '3 meses']
    }
  }
];

async function seedRuleTemplates() {
  try {
    console.log('🌱 Iniciando seeding de plantillas de reglas...');
    
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Sincronizar tabla RuleTemplate
    await RuleTemplate.sync({ force: false });
    console.log('✅ Tabla rule_templates sincronizada');

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const template of ruleTemplates) {
      try {
        const [ruleTemplate, wasCreated] = await RuleTemplate.findOrCreate({
          where: { key: template.key },
          defaults: template
        });

        if (wasCreated) {
          created++;
          console.log(`✅ Creada: ${template.key}`);
        } else {
          // Actualizar si existe
          await ruleTemplate.update(template);
          updated++;
          console.log(`🔄 Actualizada: ${template.key}`);
        }
      } catch (error) {
        skipped++;
        console.log(`⚠️  Omitida ${template.key}:`, error.message);
      }
    }

    console.log('\n📊 Resumen del seeding:');
    console.log(`✅ Creadas: ${created}`);
    console.log(`🔄 Actualizadas: ${updated}`);
    console.log(`⚠️  Omitidas: ${skipped}`);
    console.log(`📈 Total procesadas: ${created + updated + skipped}`);

    // Verificar total en la base de datos
    const totalInDb = await RuleTemplate.count();
    console.log(`🗄️  Total en base de datos: ${totalInDb}`);

    console.log('\n🎉 Seeding completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    throw error;
  }
}

// Ejecutar el seeding
if (require.main === module) {
  seedRuleTemplates()
    .then(() => {
      console.log('✅ Script ejecutado correctamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error ejecutando el script:', error);
      process.exit(1);
    });
}

module.exports = { seedRuleTemplates, ruleTemplates };