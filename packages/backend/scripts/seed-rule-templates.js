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
    key: 'RESERVAS_ONLINE_HABILITADAS',
    type: 'BOOLEAN',
    defaultValue: true,
    description: 'Permitir que los clientes agenden citas online a través del enlace público',
    category: 'BOOKING_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'online_booking',
    examples: {
      values: [true, false],
      descriptions: ['Reservas online habilitadas', 'Reservas online deshabilitadas']
    }
  },

  // =====================
  // VALIDACIONES DE COMPLETAR CITAS (BusinessRuleService)
  // =====================
  // NOTA: Los permisos de "quién puede cerrar citas cobrando" ahora se manejan
  // en el sistema de permisos (appointments.close_with_payment, payments.create)
  {
    key: 'REQUIRE_CONSENT_FOR_COMPLETION',
    type: 'BOOLEAN',
    defaultValue: false,
    description: 'Requiere consentimiento informado firmado antes de completar cualquier cita',
    category: 'APPOINTMENT',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    examples: {
      values: [true, false],
      descriptions: ['Consentimiento obligatorio', 'Consentimiento opcional']
    }
  },
  {
    key: 'REQUIRE_BEFORE_PHOTO',
    type: 'BOOLEAN',
    defaultValue: false,
    description: 'Requiere foto "antes" del procedimiento para completar cita',
    category: 'APPOINTMENT',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    examples: {
      values: [true, false],
      descriptions: ['Foto antes obligatoria', 'Foto antes opcional']
    }
  },
  {
    key: 'REQUIRE_AFTER_PHOTO',
    type: 'BOOLEAN',
    defaultValue: false,
    description: 'Requiere foto "después" del procedimiento para completar cita',
    category: 'APPOINTMENT',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    examples: {
      values: [true, false],
      descriptions: ['Foto después obligatoria', 'Foto después opcional']
    }
  },
  {
    key: 'REQUIRE_BOTH_PHOTOS',
    type: 'BOOLEAN',
    defaultValue: false,
    description: 'Requiere fotos antes y después del procedimiento para completar cita',
    category: 'APPOINTMENT',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    examples: {
      values: [true, false],
      descriptions: ['Ambas fotos obligatorias', 'Fotos opcionales']
    }
  },
  {
    key: 'REQUIRE_FULL_PAYMENT',
    type: 'BOOLEAN',
    defaultValue: false,
    description: 'Requiere pago completo antes de completar cita',
    category: 'PAYMENT',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    examples: {
      values: [true, false],
      descriptions: ['Pago completo obligatorio', 'Pago completo opcional']
    }
  },
  {
    key: 'REQUIRE_MINIMUM_PAYMENT',
    type: 'NUMBER',
    defaultValue: 50,
    description: 'Porcentaje mínimo de pago requerido para completar cita (0-100)',
    category: 'PAYMENT',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    validationRules: {
      min: 0,
      max: 100,
      type: 'number'
    },
    examples: {
      values: [0, 30, 50, 70, 100],
      descriptions: ['Sin mínimo', '30% mínimo', '50% mínimo', '70% mínimo', 'Pago completo']
    }
  },
  {
    key: 'MINIMUM_DURATION',
    type: 'NUMBER',
    defaultValue: 30,
    description: 'Duración mínima de la cita en minutos (genera warning si es menor)',
    category: 'TIME',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    validationRules: {
      min: 5,
      max: 480,
      type: 'integer'
    },
    examples: {
      values: [15, 30, 45, 60, 90],
      descriptions: ['15 minutos', '30 minutos', '45 minutos', '1 hora', '1.5 horas']
    }
  },
  {
    key: 'MAXIMUM_DURATION',
    type: 'NUMBER',
    defaultValue: 240,
    description: 'Duración máxima de la cita en minutos (genera warning si es mayor)',
    category: 'TIME',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    validationRules: {
      min: 30,
      max: 960,
      type: 'integer'
    },
    examples: {
      values: [60, 120, 180, 240, 480],
      descriptions: ['1 hora', '2 horas', '3 horas', '4 horas', '8 horas']
    }
  },
  {
    key: 'REQUIRE_CLIENT_SIGNATURE',
    type: 'BOOLEAN',
    defaultValue: false,
    description: 'Requiere firma adicional del cliente al completar cita',
    category: 'APPOINTMENT',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    examples: {
      values: [true, false],
      descriptions: ['Firma obligatoria', 'Sin firma requerida']
    }
  },
  {
    key: 'REQUIRE_CLIENT_FEEDBACK',
    type: 'BOOLEAN',
    defaultValue: false,
    description: 'Requiere feedback del cliente antes de completar cita',
    category: 'APPOINTMENT',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'gestion_de_turnos',
    examples: {
      values: [true, false],
      descriptions: ['Feedback obligatorio', 'Feedback opcional']
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
    description: '¿Generar facturas automáticamente al completar servicios?',
    category: 'SERVICE_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'facturacion_electronica',
    examples: {
      values: [true, false],
      descriptions: ['Sí, automáticamente', 'No, las creo manualmente']
    }
  },
  
  {
    key: 'FACTURA_ENVIAR_EMAIL',
    type: 'BOOLEAN',
    defaultValue: true,
    description: '¿Enviar facturas por email automáticamente a tus clientes?',
    category: 'NOTIFICATION_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    requiredModule: 'facturacion_electronica',
    examples: {
      values: [true, false],
      descriptions: ['Sí, envío automático', 'No, envío manual']
    }
  },
  
 

  // =====================
  // POLÍTICAS GENERALES DEL NEGOCIO
  // =====================
 
  {
    key: 'PAGO_ACEPTAR_EFECTIVO',
    type: 'BOOLEAN',
    defaultValue: true,
    description: '¿Aceptas pagos en efectivo en tu negocio?',
    category: 'PAYMENT_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    examples: {
      values: [true, false],
      descriptions: ['Sí, acepto efectivo', 'No, solo pagos digitales']
    }
  },
  {
    key: 'PAGO_ACEPTAR_TARJETA',
    type: 'BOOLEAN',
    defaultValue: true,
    description: '¿Aceptas pagos con tarjeta de crédito/débito?',
    category: 'PAYMENT_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    examples: {
      values: [true, false],
      descriptions: ['Sí, acepto tarjetas', 'No acepto tarjetas']
    }
  },
  {
    key: 'COMISIONES_HABILITADAS',
    type: 'BOOLEAN',
    defaultValue: true,
    description: '¿Trabajas con comisiones para tus especialistas?',
    category: 'SERVICE_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    examples: {
      values: [true, false],
      descriptions: ['Sí, pago por comisiones', 'No, pago salario fijo']
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
    description: '¿Permites devoluciones y reembolsos en tu negocio?',
    category: 'REFUND_POLICY',
    allowCustomization: true,
    version: '1.0.0',
    examples: {
      values: [true, false],
      descriptions: ['Sí, acepto devoluciones', 'No acepto devoluciones']
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

/**
 * Seed de plantillas de reglas
 * @param {boolean} closeConnection - Si debe cerrar la conexión al finalizar (default: false para API)
 */
async function seedRuleTemplates(closeConnection = false) {
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

    // =====================
    // REGLAS DE FIDELIZACIÓN Y REFERIDOS
    // =====================
    const loyaltyRules = [
      {
        key: 'LOYALTY_ENABLED',
        type: 'BOOLEAN',
        defaultValue: true,
        description: 'Activar programa de fidelización y puntos',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        requiredModule: 'loyalty',
        examples: {
          values: [true, false],
          descriptions: ['Programa activo', 'Programa desactivado']
        }
      },
      {
        key: 'LOYALTY_POINTS_PER_CURRENCY_UNIT',
        type: 'NUMBER',
        defaultValue: 1,
        description: 'Puntos otorgados por cada $1000 COP gastados',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        requiredModule: 'loyalty',
        validationRules: {
          min: 0,
          max: 100,
          type: 'number'
        },
        examples: {
          values: [0.1, 0.5, 1, 2, 5],
          descriptions: ['0.1 puntos por $1000', '0.5 puntos por $1000', '1 punto por $1000', '2 puntos por $1000', '5 puntos por $1000']
        }
      },
      {
        key: 'LOYALTY_APPOINTMENT_POINTS_ENABLED',
        type: 'BOOLEAN',
        defaultValue: true,
        description: 'Otorgar puntos por pago de citas completadas',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        requiredModule: 'loyalty'
      },
      {
        key: 'LOYALTY_PRODUCT_POINTS_ENABLED',
        type: 'BOOLEAN',
        defaultValue: true,
        description: 'Otorgar puntos por compra de productos',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        requiredModule: 'loyalty'
      },
      {
        key: 'LOYALTY_REFERRAL_ENABLED',
        type: 'BOOLEAN',
        defaultValue: true,
        description: 'Otorgar puntos por referir nuevos clientes',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        requiredModule: 'loyalty'
      },
      {
        key: 'LOYALTY_REFERRAL_POINTS',
        type: 'NUMBER',
        defaultValue: 500,
        description: 'Puntos otorgados al referir un cliente nuevo',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        requiredModule: 'loyalty',
        validationRules: {
          min: 0,
          max: 10000,
          type: 'integer'
        },
        examples: {
          values: [100, 250, 500, 1000, 2000],
          descriptions: ['100 puntos', '250 puntos', '500 puntos', '1000 puntos', '2000 puntos']
        }
      },
      {
        key: 'LOYALTY_REFERRAL_FIRST_VISIT_BONUS',
        type: 'NUMBER',
        defaultValue: 200,
        description: 'Puntos bonus cuando el referido completa su primera cita pagada',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        requiredModule: 'loyalty',
        validationRules: {
          min: 0,
          max: 5000,
          type: 'integer'
        },
        examples: {
          values: [0, 100, 200, 500, 1000],
          descriptions: ['Sin bonus', '100 puntos', '200 puntos', '500 puntos', '1000 puntos']
        }
      },
      {
        key: 'LOYALTY_MILESTONE_ENABLED',
        type: 'BOOLEAN',
        defaultValue: true,
        description: 'Otorgar puntos al completar X procedimientos (hitos)',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        requiredModule: 'loyalty'
      },
      {
        key: 'LOYALTY_MILESTONE_COUNT',
        type: 'NUMBER',
        defaultValue: 5,
        description: 'Cantidad de procedimientos para alcanzar el hito',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        requiredModule: 'loyalty',
        validationRules: {
          min: 1,
          max: 100,
          type: 'integer'
        },
        examples: {
          values: [3, 5, 10, 15, 20],
          descriptions: ['Cada 3 citas', 'Cada 5 citas', 'Cada 10 citas', 'Cada 15 citas', 'Cada 20 citas']
        }
      },
      {
        key: 'LOYALTY_MILESTONE_POINTS',
        type: 'NUMBER',
        defaultValue: 300,
        description: 'Puntos otorgados al alcanzar el hito de procedimientos',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        requiredModule: 'loyalty',
        validationRules: {
          min: 0,
          max: 10000,
          type: 'integer'
        }
      },
      {
        key: 'LOYALTY_ON_TIME_PAYMENT_BONUS',
        type: 'NUMBER',
        defaultValue: 50,
        description: 'Puntos bonus por pagar puntualmente (sin deuda)',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        requiredModule: 'loyalty',
        validationRules: {
          min: 0,
          max: 1000,
          type: 'integer'
        },
        examples: {
          values: [0, 25, 50, 100, 200],
          descriptions: ['Sin bonus', '25 puntos', '50 puntos', '100 puntos', '200 puntos']
        }
      },
      {
        key: 'LOYALTY_BIRTHDAY_BONUS_ENABLED',
        type: 'BOOLEAN',
        defaultValue: true,
        description: 'Otorgar puntos de cumpleaños al cliente',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        requiredModule: 'loyalty'
      },
      {
        key: 'LOYALTY_BIRTHDAY_BONUS_POINTS',
        type: 'NUMBER',
        defaultValue: 500,
        description: 'Puntos de regalo en el cumpleaños del cliente',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        requiredModule: 'loyalty',
        validationRules: {
          min: 0,
          max: 5000,
          type: 'integer'
        },
        examples: {
          values: [100, 250, 500, 1000, 2000],
          descriptions: ['100 puntos', '250 puntos', '500 puntos', '1000 puntos', '2000 puntos']
        }
      },
      {
        key: 'LOYALTY_ANNIVERSARY_BONUS_ENABLED',
        type: 'BOOLEAN',
        defaultValue: true,
        description: 'Otorgar puntos en aniversario de cliente (antigüedad)',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        requiredModule: 'loyalty'
      },
      {
        key: 'LOYALTY_ANNIVERSARY_BONUS_POINTS',
        type: 'NUMBER',
        defaultValue: 1000,
        description: 'Puntos de regalo por cada año como cliente',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        requiredModule: 'loyalty',
        validationRules: {
          min: 0,
          max: 10000,
          type: 'integer'
        }
      },
      {
        key: 'LOYALTY_POINTS_EXPIRY_DAYS',
        type: 'NUMBER',
        defaultValue: 365,
        description: 'Días de validez de los puntos (0 = nunca expiran)',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        requiredModule: 'loyalty',
        validationRules: {
          min: 0,
          max: 3650,
          type: 'integer'
        },
        examples: {
          values: [0, 90, 180, 365, 730],
          descriptions: ['Nunca expiran', '3 meses', '6 meses', '1 año', '2 años']
        }
      },
      {
        key: 'LOYALTY_MIN_POINTS_TO_REDEEM',
        type: 'NUMBER',
        defaultValue: 1000,
        description: 'Cantidad mínima de puntos para poder canjear recompensas',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        requiredModule: 'loyalty',
        validationRules: {
          min: 0,
          max: 50000,
          type: 'integer'
        },
        examples: {
          values: [500, 1000, 2000, 5000, 10000],
          descriptions: ['500 puntos', '1000 puntos', '2000 puntos', '5000 puntos', '10000 puntos']
        }
      },
      {
        key: 'LOYALTY_REWARD_EXPIRY_DAYS',
        type: 'NUMBER',
        defaultValue: 30,
        description: 'Días de validez de las recompensas canjeadas',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        requiredModule: 'loyalty',
        validationRules: {
          min: 1,
          max: 365,
          type: 'integer'
        },
        examples: {
          values: [15, 30, 60, 90, 180],
          descriptions: ['15 días', '30 días', '60 días', '90 días', '6 meses']
        }
      },
      {
        key: 'LOYALTY_DISCOUNT_PERCENTAGE_RATE',
        type: 'NUMBER',
        defaultValue: 10,
        description: 'Porcentaje de descuento por cada X puntos canjeados',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        requiredModule: 'loyalty',
        validationRules: {
          min: 1,
          max: 100,
          type: 'number'
        },
        examples: {
          values: [5, 10, 15, 20, 25],
          descriptions: ['5% descuento', '10% descuento', '15% descuento', '20% descuento', '25% descuento']
        }
      },
      {
        key: 'LOYALTY_POINTS_FOR_DISCOUNT',
        type: 'NUMBER',
        defaultValue: 1000,
        description: 'Cantidad de puntos necesarios para obtener el descuento configurado',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        requiredModule: 'loyalty',
        validationRules: {
          min: 100,
          max: 50000,
          type: 'integer'
        },
        examples: {
          values: [500, 1000, 2000, 5000, 10000],
          descriptions: ['500 puntos', '1000 puntos', '2000 puntos', '5000 puntos', '10000 puntos']
        }
      },
      // ================ REGLAS DE BRANDING PARA TARJETAS ================
      {
        key: 'BRANDING_PRIMARY_COLOR',
        type: 'STRING',
        defaultValue: '#8B5CF6',
        description: 'Color primario del negocio (hexadecimal) para tarjeta de fidelización',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        validationRules: {
          pattern: '^#[0-9A-Fa-f]{6}$',
          type: 'string'
        },
        examples: {
          values: ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
          descriptions: ['Púrpura', 'Azul', 'Verde', 'Ámbar', 'Rojo']
        }
      },
      {
        key: 'BRANDING_SECONDARY_COLOR',
        type: 'STRING',
        defaultValue: '#EC4899',
        description: 'Color secundario del negocio (hexadecimal) para gradientes',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        validationRules: {
          pattern: '^#[0-9A-Fa-f]{6}$',
          type: 'string'
        },
        examples: {
          values: ['#EC4899', '#6366F1', '#14B8A6', '#F97316', '#DC2626'],
          descriptions: ['Rosa', 'Índigo', 'Verde azulado', 'Naranja', 'Rojo oscuro']
        }
      },
      {
        key: 'BRANDING_ACCENT_COLOR',
        type: 'STRING',
        defaultValue: '#F59E0B',
        description: 'Color de acento para destacar elementos (puntos, botones)',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        validationRules: {
          pattern: '^#[0-9A-Fa-f]{6}$',
          type: 'string'
        },
        examples: {
          values: ['#F59E0B', '#FBBF24', '#34D399', '#60A5FA', '#F472B6'],
          descriptions: ['Ámbar', 'Amarillo', 'Verde claro', 'Azul claro', 'Rosa claro']
        }
      },
      {
        key: 'BRANDING_TEXT_COLOR',
        type: 'STRING',
        defaultValue: '#1F2937',
        description: 'Color de texto principal',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        validationRules: {
          pattern: '^#[0-9A-Fa-f]{6}$',
          type: 'string'
        },
        examples: {
          values: ['#1F2937', '#374151', '#4B5563', '#6B7280', '#000000'],
          descriptions: ['Gris oscuro', 'Gris medio oscuro', 'Gris medio', 'Gris', 'Negro']
        }
      },
      {
        key: 'BRANDING_BACKGROUND_COLOR',
        type: 'STRING',
        defaultValue: '#FFFFFF',
        description: 'Color de fondo',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        validationRules: {
          pattern: '^#[0-9A-Fa-f]{6}$',
          type: 'string'
        },
        examples: {
          values: ['#FFFFFF', '#F9FAFB', '#F3F4F6', '#E5E7EB', '#D1D5DB'],
          descriptions: ['Blanco', 'Gris muy claro', 'Gris claro', 'Gris', 'Gris medio']
        }
      },
      {
        key: 'BRANDING_USE_GRADIENT',
        type: 'BOOLEAN',
        defaultValue: true,
        description: 'Usar gradiente en tarjeta de fidelización (de color primario a secundario)',
        category: 'GENERAL',
        allowCustomization: true,
        version: '1.0.0',
        examples: {
          values: [true, false],
          descriptions: ['Usar gradiente', 'Color sólido']
        }
      }
    ];

    console.log('\n📝 Agregando reglas de Fidelización...');
    for (const template of loyaltyRules) {
      try {
        const [rule, wasCreated] = await RuleTemplate.findOrCreate({
          where: { key: template.key },
          defaults: template
        });

        if (wasCreated) {
          created++;
          console.log(`✅ Creada: ${template.key}`);
        } else {
          // Actualizar si ya existe
          await rule.update(template);
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
    
    return {
      created,
      updated,
      skipped,
      total: created + updated + skipped,
      totalInDb
    };
    
  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    throw error;
  } finally {
    if (closeConnection) {
      await sequelize.close();
    }
  }
}

// Ejecutar el seeding
if (require.main === module) {
  seedRuleTemplates(true) // Cerrar conexión cuando se ejecuta como script
    .then(() => {
      console.log('✅ Script ejecutado correctamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error ejecutando el script:', error);
      process.exit(1);
    });
}

module.exports = seedRuleTemplates; // Exportar solo la función