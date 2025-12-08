/**
 * Optimizaciones de rendimiento para el dashboard
 * Añade índices estratégicos para mejorar las consultas frecuentes
 */

const { QueryInterface, DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Índices para BusinessSubscription (consultas de dashboard frecuentes)
    await queryInterface.addIndex('business_subscriptions', ['status'], {
      name: 'idx_business_subscriptions_status'
    });

    await queryInterface.addIndex('business_subscriptions', ['subscriptionPlanId'], {
      name: 'idx_business_subscriptions_plan_id'
    });

    await queryInterface.addIndex('business_subscriptions', ['status', 'subscriptionPlanId'], {
      name: 'idx_business_subscriptions_status_plan'
    });

    await queryInterface.addIndex('business_subscriptions', ['createdAt'], {
      name: 'idx_business_subscriptions_created_at'
    });

    // Índices para SubscriptionPayment (consultas de ingresos)
    await queryInterface.addIndex('subscription_payments', ['status'], {
      name: 'idx_subscription_payments_status'
    });

    await queryInterface.addIndex('subscription_payments', ['paidAt'], {
      name: 'idx_subscription_payments_paid_at'
    });

    await queryInterface.addIndex('subscription_payments', ['status', 'paidAt'], {
      name: 'idx_subscription_payments_status_paid_at'
    });

    await queryInterface.addIndex('subscription_payments', ['businessSubscriptionId'], {
      name: 'idx_subscription_payments_subscription_id'
    });

    // Índices para Business (consultas de crecimiento)
    await queryInterface.addIndex('businesses', ['createdAt'], {
      name: 'idx_businesses_created_at'
    });

    await queryInterface.addIndex('businesses', ['status'], {
      name: 'idx_businesses_status'
    });

    await queryInterface.addIndex('businesses', ['status', 'createdAt'], {
      name: 'idx_businesses_status_created_at'
    });

    // Índices para SubscriptionPlan (consultas de planes)
    await queryInterface.addIndex('subscription_plans', ['status'], {
      name: 'idx_subscription_plans_status'
    });

    await queryInterface.addIndex('subscription_plans', ['createdAt'], {
      name: 'idx_subscription_plans_created_at'
    });

    console.log('✅ Índices de rendimiento del dashboard añadidos correctamente');
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar índices en orden inverso
    const indicesToDrop = [
      'idx_subscription_plans_created_at',
      'idx_subscription_plans_status',
      'idx_businesses_status_created_at',
      'idx_businesses_status',
      'idx_businesses_created_at',
      'idx_subscription_payments_subscription_id',
      'idx_subscription_payments_status_paid_at',
      'idx_subscription_payments_paid_at',
      'idx_subscription_payments_status',
      'idx_business_subscriptions_created_at',
      'idx_business_subscriptions_status_plan',
      'idx_business_subscriptions_plan_id',
      'idx_business_subscriptions_status'
    ];

    for (const indexName of indicesToDrop) {
      try {
        await queryInterface.removeIndex('business_subscriptions', indexName);
      } catch (error) {
        // Ignorar errores si el índice no existe
        console.log(`⚠️ Índice ${indexName} no encontrado, continuando...`);
      }
    }

    console.log('✅ Índices de rendimiento del dashboard eliminados');
  }
};