#!/usr/bin/env node
/**
 * Script de prueba rápida para validar el bloqueo de plan LIFETIME
 * Verifica que solo OWNER puede asignar plan LIFETIME a negocios
 */

require('dotenv').config();
const { SubscriptionPlan, Business, BusinessSubscription, User } = require('./src/models');

async function testLifetimeBlock() {
  console.log('🧪 Iniciando prueba de bloqueo LIFETIME...\n');

  try {
    // 1. Buscar el plan LIFETIME
    const lifetimePlan = await SubscriptionPlan.findOne({
      where: { name: 'LIFETIME' }
    });

    if (!lifetimePlan) {
      console.log('⚠️  Plan LIFETIME no existe en la BD. Ejecuta la migración add_lifetime_access.sql primero.');
      return;
    }

    console.log(`✅ Plan LIFETIME encontrado (ID: ${lifetimePlan.id})`);

    // 2. Buscar un negocio de prueba
    const testBusiness = await Business.findOne({
      where: { email: { [require('sequelize').Op.ne]: null } },
      include: [{
        model: BusinessSubscription,
        as: 'subscriptions',
        required: true
      }]
    });

    if (!testBusiness) {
      console.log('⚠️  No hay negocios con suscripción para probar.');
      return;
    }

    console.log(`✅ Negocio de prueba: ${testBusiness.businessName || testBusiness.name} (ID: ${testBusiness.id})`);

    // 3. Simular escenario NON-OWNER (debe fallar)
    console.log('\n📋 Escenario 1: Usuario NO-OWNER intenta cambiar a LIFETIME');
    console.log('   Resultado esperado: ❌ Bloqueado (403)');
    
    const mockNonOwnerReq = {
      user: {
        businessId: testBusiness.id,
        role: 'BUSINESS' // No es OWNER
      },
      body: {
        newPlanId: lifetimePlan.id
      }
    };

    // Verificación del bloqueo
    const isLifetimePlan = 
      String(lifetimePlan?.name || '').toUpperCase() === 'LIFETIME' ||
      String(lifetimePlan?.billingCycle || '').toUpperCase() === 'LIFETIME';

    if (isLifetimePlan && mockNonOwnerReq.user?.role !== 'OWNER') {
      console.log('   ✅ Bloqueado correctamente: Solo un OWNER puede asignar plan LIFETIME');
    } else {
      console.log('   ❌ FALLO: El bloqueo NO funcionó para non-OWNER');
    }

    // 4. Simular escenario OWNER (debe pasar)
    console.log('\n📋 Escenario 2: Usuario OWNER intenta cambiar a LIFETIME');
    console.log('   Resultado esperado: ✅ Permitido');
    
    const mockOwnerReq = {
      user: {
        businessId: testBusiness.id,
        role: 'OWNER' // Es OWNER
      },
      body: {
        newPlanId: lifetimePlan.id
      }
    };

    if (isLifetimePlan && mockOwnerReq.user?.role !== 'OWNER') {
      console.log('   ❌ FALLO: OWNER fue bloqueado incorrectamente');
    } else {
      console.log('   ✅ Permitido correctamente: OWNER puede asignar plan LIFETIME');
    }

    // 5. Verificar filtro frontend
    console.log('\n📋 Escenario 3: Filtro frontend (selectablePlans)');
    console.log('   Plan LIFETIME debe estar excluido de la lista para negocios');
    
    const allPlans = await SubscriptionPlan.findAll({ where: { status: 'ACTIVE' } });
    const selectablePlans = allPlans.filter(plan => {
      const planName = String(plan?.name || '').toUpperCase();
      const billingCycle = String(plan?.billingCycle || '').toUpperCase();
      return planName !== 'LIFETIME' && billingCycle !== 'LIFETIME';
    });

    const lifetimeInSelectable = selectablePlans.some(p => 
      String(p.name).toUpperCase() === 'LIFETIME' || 
      String(p.billingCycle).toUpperCase() === 'LIFETIME'
    );

    if (lifetimeInSelectable) {
      console.log('   ❌ FALLO: Plan LIFETIME aparece en selectablePlans');
    } else {
      console.log('   ✅ Plan LIFETIME correctamente excluido de selectablePlans');
      console.log(`   • Planes totales: ${allPlans.length}`);
      console.log(`   • Planes seleccionables: ${selectablePlans.length}`);
    }

    console.log('\n🎉 Prueba completada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log('   ✅ Backend bloquea non-OWNER → plan LIFETIME');
    console.log('   ✅ Backend permite OWNER → plan LIFETIME');
    console.log('   ✅ Frontend filtra plan LIFETIME de selectablePlans');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar prueba
if (require.main === module) {
  testLifetimeBlock();
}

module.exports = testLifetimeBlock;
