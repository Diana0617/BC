#!/usr/bin/env node

/**
 * Script para limpiar suscripciones de prueba
 * Uso: node scripts/cleanup-test-subscription.js <businessCode>
 * Ejemplo: node scripts/cleanup-test-subscription.js mas3d
 */

require('dotenv').config();
const { 
  Business, 
  User, 
  BusinessSubscription, 
  SubscriptionPayment,
  BusinessRule,
  sequelize 
} = require('../src/models');
const { Op } = require('sequelize');

async function cleanupTestSubscription(businessCode) {
  const transaction = await sequelize.transaction();
  
  try {
    console.log(`\n🧹 Limpiando datos de prueba para: ${businessCode}\n`);

    // 1. Buscar el negocio por subdomain
    const business = await Business.findOne({
      where: { subdomain: businessCode }
    });

    if (!business) {
      console.log(`⚠️  No se encontró negocio con subdomain: ${businessCode}`);
      await transaction.rollback();
      return;
    }

    console.log(`✅ Negocio encontrado: ${business.name} (ID: ${business.id})`);

    // 2. Eliminar usuarios del negocio
    const users = await User.findAll({
      where: { businessId: business.id }
    });
    
    if (users.length > 0) {
      await User.destroy({
        where: { businessId: business.id },
        transaction
      });
      console.log(`✅ ${users.length} usuario(s) eliminado(s)`);
    }

    // 3. Eliminar reglas del negocio
    const rules = await BusinessRule.findAll({
      where: { businessId: business.id }
    });
    
    if (rules.length > 0) {
      await BusinessRule.destroy({
        where: { businessId: business.id },
        transaction
      });
      console.log(`✅ ${rules.length} regla(s) eliminada(s)`);
    }

    // 4. Eliminar pagos de suscripción
    const subscriptions = await BusinessSubscription.findAll({
      where: { businessId: business.id }
    });

    for (const subscription of subscriptions) {
      const payments = await SubscriptionPayment.findAll({
        where: { businessSubscriptionId: subscription.id }
      });
      
      if (payments.length > 0) {
        await SubscriptionPayment.destroy({
          where: { businessSubscriptionId: subscription.id },
          transaction
        });
        console.log(`✅ ${payments.length} pago(s) eliminado(s) de suscripción ${subscription.id}`);
      }
    }

    // 5. Eliminar suscripciones
    if (subscriptions.length > 0) {
      await BusinessSubscription.destroy({
        where: { businessId: business.id },
        transaction
      });
      console.log(`✅ ${subscriptions.length} suscripción(es) eliminada(s)`);
    }

    // 6. Eliminar pagos huérfanos (sin businessSubscriptionId) que contengan el businessCode en metadata
    const orphanPayments = await SubscriptionPayment.findAll({
      where: {
        businessSubscriptionId: null
      }
    });

    // Filtrar por metadata ya que Sequelize no soporta búsqueda en JSONB fácilmente
    const relatedOrphanPayments = orphanPayments.filter(payment => 
      payment.metadata && 
      (payment.metadata.businessCode === businessCode || 
       payment.metadata.subdomain === businessCode)
    );

    if (relatedOrphanPayments.length > 0) {
      for (const payment of relatedOrphanPayments) {
        await payment.destroy({ transaction });
      }
      console.log(`✅ ${relatedOrphanPayments.length} pago(s) huérfano(s) eliminado(s)`);
    }

    // 7. Finalmente, eliminar el negocio
    await business.destroy({ transaction });
    console.log(`✅ Negocio eliminado: ${business.name}`);

    await transaction.commit();
    console.log(`\n🎉 Limpieza completada exitosamente para: ${businessCode}\n`);

  } catch (error) {
    await transaction.rollback();
    console.error('\n❌ Error durante la limpieza:', error);
    throw error;
  }
}

// Ejecutar el script
if (require.main === module) {
  const businessCode = process.argv[2];

  if (!businessCode) {
    console.error('❌ Error: Debes proporcionar un businessCode');
    console.log('Uso: node scripts/cleanup-test-subscription.js <businessCode>');
    console.log('Ejemplo: node scripts/cleanup-test-subscription.js mas3d');
    process.exit(1);
  }

  cleanupTestSubscription(businessCode)
    .then(() => {
      console.log('✨ Script finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { cleanupTestSubscription };
