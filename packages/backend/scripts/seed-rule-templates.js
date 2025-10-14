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
    key: 'CITAS_REQUIERE_COMPROBANTE_PAGO',
    type: 'BOOLEAN',
    defaultValue: false,
    description: 'Requiere que el especialista suba comprobante de pago antes de cerrar la cita',
    category: 'PAYMENT_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    examples: {
      values: [true, false],
      descriptions: ['Comprobante obligatorio', 'Comprobante opcional']
    }
  },

  // =====================
  // SISTEMA DE VOUCHERS Y PENALIZACIONES
  // =====================
  {
    key: 'CITAS_HORAS_VOUCHER_CANCELACION',
    type: 'NUMBER',
    defaultValue: 24,
    description: 'Horas mínimas de anticipación para generar voucher al cancelar',
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
      descriptions: ['2 horas antes', '4 horas antes', '12 horas antes', '24 horas antes', '48 horas antes']
    }
  },
  {
    key: 'CITAS_VOUCHER_VALIDEZ_DIAS',
    type: 'NUMBER',
    defaultValue: 30,
    description: 'Días de validez del voucher generado por cancelación',
    category: 'CANCELLATION_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    validationRules: {
      min: 7,
      max: 365,
      type: 'integer'
    },
    examples: {
      values: [7, 15, 30, 60, 90],
      descriptions: ['1 semana', '2 semanas', '1 mes', '2 meses', '3 meses']
    }
  },
  {
    key: 'CITAS_VOUCHER_PORCENTAJE_VALOR',
    type: 'NUMBER',
    defaultValue: 100,
    description: 'Porcentaje del valor de la cita que se convierte en voucher',
    category: 'CANCELLATION_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    validationRules: {
      min: 0,
      max: 100,
      type: 'number'
    },
    examples: {
      values: [50, 75, 100],
      descriptions: ['50% del valor', '75% del valor', '100% del valor']
    }
  },
  {
    key: 'CITAS_MAX_CANCELACIONES_PERMITIDAS',
    type: 'NUMBER',
    defaultValue: 3,
    description: 'Número máximo de cancelaciones antes de bloquear acceso a agenda',
    category: 'CANCELLATION_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    validationRules: {
      min: 1,
      max: 10,
      type: 'integer'
    },
    examples: {
      values: [2, 3, 5, 7, 10],
      descriptions: ['2 cancelaciones', '3 cancelaciones', '5 cancelaciones', '7 cancelaciones', '10 cancelaciones']
    }
  },
  {
    key: 'CITAS_PERIODO_RESETEO_CANCELACIONES',
    type: 'NUMBER',
    defaultValue: 30,
    description: 'Días después de los cuales se resetea el contador de cancelaciones',
    category: 'CANCELLATION_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    validationRules: {
      min: 7,
      max: 365,
      type: 'integer'
    },
    examples: {
      values: [7, 15, 30, 60, 90],
      descriptions: ['1 semana', '2 semanas', '1 mes', '2 meses', '3 meses']
    }
  },
  {
    key: 'CITAS_BLOQUEO_TEMPORAL_DIAS',
    type: 'NUMBER',
    defaultValue: 15,
    description: 'Días de bloqueo temporal tras exceder cancelaciones permitidas',
    category: 'CANCELLATION_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    validationRules: {
      min: 1,
      max: 90,
      type: 'integer'
    },
    examples: {
      values: [7, 15, 30, 60, 90],
      descriptions: ['1 semana', '2 semanas', '1 mes', '2 meses', '3 meses']
    }
  },
  {
    key: 'CITAS_NOTIFICAR_VOUCHER_EMAIL',
    type: 'BOOLEAN',
    defaultValue: true,
    description: 'Enviar email con código de voucher al generarse',
    category: 'NOTIFICATION_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    examples: {
      values: [true, false],
      descriptions: ['Notificar por email', 'Sin notificación']
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
  
 

  // =====================
  // POLÍTICAS GENERALES DEL NEGOCIO
  // =====================
 
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
    key: 'COMISIONES_HABILITADAS',
    type: 'BOOLEAN',
    defaultValue: true,
    description: '¿En tu negocio se manejan comisiones para especialistas?',
    category: 'SERVICE_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    examples: {
      values: [true, false],
      descriptions: ['Negocio con comisiones', 'Negocio sin comisiones (empleados con salario fijo)']
    }
  },
  {
    key: 'COMISIONES_TIPO_CALCULO',
    type: 'STRING',
    defaultValue: 'POR_SERVICIO',
    description: 'Tipo de cálculo de comisiones para especialistas',
    category: 'SERVICE_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    validationRules: {
      enum: ['GENERAL', 'POR_SERVICIO', 'MIXTO']
    },
    examples: {
      values: ['GENERAL', 'POR_SERVICIO', 'MIXTO'],
      descriptions: [
        'Mismo % para todos los servicios',
        'Cada servicio tiene su propio %',
        'Algunos servicios usan % general, otros personalizados'
      ]
    }
  },
  {
    key: 'COMISIONES_PORCENTAJE_GENERAL',
    type: 'NUMBER',
    defaultValue: 50,
    description: 'Porcentaje de comisión general para especialistas (%)',
    category: 'SERVICE_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    validationRules: {
      min: 0,
      max: 100,
      type: 'decimal',
      step: 0.5
    },
    examples: {
      values: [30, 40, 50, 60, 70],
      descriptions: ['30% especialista', '40% especialista', '50/50', '60% especialista', '70% especialista']
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