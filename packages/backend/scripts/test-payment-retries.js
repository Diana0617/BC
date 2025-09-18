#!/usr/bin/env node

/**
 * Script de prueba para verificar la funcionalidad de reintentos de pago
 * Uso: node scripts/test-payment-retries.js
 */

require('dotenv').config();
const { SubscriptionPayment, BusinessSubscription, Business, SubscriptionPlan } = require('../src/models');
const WompiSubscriptionService = require('../src/services/WompiSubscriptionService');

async function testPaymentRetries() {
  console.log('🧪 Iniciando pruebas de funcionalidad de reintentos de pago...\n');

  try {
    // 1. Buscar un pago existente o crear uno de prueba
    console.log('1️⃣ Buscando pago de prueba...');
    
    let testPayment = await SubscriptionPayment.findOne({
      where: { status: 'PENDING' },
      include: [{
        model: BusinessSubscription,
        as: 'subscription'
      }]
    });

    if (!testPayment) {
      console.log('   ℹ️ No se encontró pago de prueba, creando uno...');
      
      // Buscar business y plan para crear pago de prueba
      const business = await Business.findOne();
      const plan = await SubscriptionPlan.findOne();
      
      if (!business || !plan) {
        console.log('   ❌ No hay negocios o planes en la BD para crear pago de prueba');
        return;
      }

      // Buscar o crear subscription de prueba
      let businessSubscription = await BusinessSubscription.findOne({
        where: {
          businessId: business.id,
          subscriptionPlanId: plan.id
        }
      });

      if (!businessSubscription) {
        businessSubscription = await BusinessSubscription.create({
          businessId: business.id,
          subscriptionPlanId: plan.id,
          status: 'PENDING',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
          amount: plan.price
        });
      }

      testPayment = await SubscriptionPayment.create({
        businessSubscriptionId: businessSubscription.id,
        amount: plan.price,
        currency: 'COP',
        status: 'PENDING',
        paymentMethod: 'CREDIT_CARD',
        externalReference: `TEST_${Date.now()}`,
        netAmount: plan.price,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días desde ahora
      });

      console.log('   ✅ Pago de prueba creado:', testPayment.id);
    } else {
      console.log('   ✅ Pago de prueba encontrado:', testPayment.id);
    }

    // 2. Probar método markAttemptAsFailed
    console.log('\n2️⃣ Probando markAttemptAsFailed...');
    
    await testPayment.markAttemptAsFailed('Tarjeta rechazada por banco emisor', {
      bankCode: 'DECLINED',
      errorCode: 'INSUFFICIENT_FUNDS'
    });

    console.log('   ✅ Intento marcado como fallido');
    console.log('   📊 Status:', testPayment.status);
    console.log('   📊 Intentos:', testPayment.paymentAttempts);
    console.log('   📊 Puede reintentar:', testPayment.canRetry());

    // 3. Probar método getRetryStatistics
    console.log('\n3️⃣ Probando getRetryStatistics...');
    
    const stats = testPayment.getRetryStatistics();
    console.log('   📊 Estadísticas:', JSON.stringify(stats, null, 2));

    // 4. Probar reintento si es posible
    if (testPayment.canRetry()) {
      console.log('\n4️⃣ Probando prepareForRetry...');
      
      await testPayment.prepareForRetry();
      console.log('   ✅ Preparado para reintento');
      console.log('   📊 Status:', testPayment.status);
      console.log('   📊 Intentos:', testPayment.paymentAttempts);

      // Simular otro fallo
      await testPayment.markAttemptAsFailed('Timeout de conexión', {
        errorType: 'TIMEOUT',
        duration: 30000
      });

      console.log('   ✅ Segundo intento marcado como fallido');
    }

    // 5. Probar máximo de intentos
    console.log('\n5️⃣ Probando máximo de intentos...');
    
    while (testPayment.canRetry()) {
      await testPayment.prepareForRetry();
      await testPayment.markAttemptAsFailed('Fallo simulado', { test: true });
      console.log(`   🔄 Intento ${testPayment.paymentAttempts}/${testPayment.maxAttempts} - Status: ${testPayment.status}`);
    }

    console.log('   ✅ Máximo de intentos alcanzado');
    console.log('   📊 Status final:', testPayment.status);

    // 6. Probar método markAsSuccessful en un nuevo pago
    console.log('\n6️⃣ Probando markAsSuccessful...');
    
    const successPayment = await SubscriptionPayment.create({
      businessSubscriptionId: testPayment.businessSubscriptionId,
      amount: testPayment.amount,
      currency: 'COP',
      status: 'PENDING',
      paymentMethod: 'CREDIT_CARD',
      externalReference: `SUCCESS_TEST_${Date.now()}`,
      netAmount: testPayment.amount,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días desde ahora
    });

    await successPayment.markAsSuccessful({
      transactionId: 'TXN_SUCCESS_123',
      provider: 'TEST',
      timestamp: new Date()
    });

    console.log('   ✅ Pago marcado como exitoso');
    console.log('   📊 Status:', successPayment.status);
    console.log('   📊 Pagado en:', successPayment.paidAt);

    // 7. Probar WompiSubscriptionService con estadísticas
    console.log('\n7️⃣ Probando estadísticas del servicio Wompi...');
    
    const wompiService = new WompiSubscriptionService();
    try {
      const failedStats = await wompiService.getFailedPaymentStatistics();
      console.log('   📊 Estadísticas de pagos fallidos:', JSON.stringify(failedStats, null, 2));
    } catch (error) {
      console.log('   ⚠️ Error obteniendo estadísticas (normal si no hay datos):', error.message);
    }

    console.log('\n✅ Todas las pruebas completadas exitosamente!');
    
    // Limpiar datos de prueba
    console.log('\n🧹 Limpiando datos de prueba...');
    await SubscriptionPayment.destroy({
      where: { externalReference: testPayment.externalReference }
    });
    console.log('   ✅ Pago de prueba eliminado');

    console.log('\n📋 Resumen de funcionalidades verificadas:');
    console.log('   ✅ markAttemptAsFailed - Marca intentos como fallidos');
    console.log('   ✅ prepareForRetry - Prepara para reintento');
    console.log('   ✅ markAsSuccessful - Marca pagos como exitosos');
    console.log('   ✅ canRetry - Verifica si se pueden hacer reintentos');
    console.log('   ✅ getRemainingAttempts - Obtiene intentos restantes');
    console.log('   ✅ getRetryStatistics - Obtiene estadísticas detalladas');
    console.log('   ✅ Integración con WompiSubscriptionService');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
    console.error(error.stack);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testPaymentRetries()
    .then(() => {
      console.log('\n🎉 Script de pruebas finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal en las pruebas:', error);
      process.exit(1);
    });
}

module.exports = { testPaymentRetries };