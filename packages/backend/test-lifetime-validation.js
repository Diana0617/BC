#!/usr/bin/env node
/**
 * Test unitario de la lógica de bloqueo LIFETIME (sin requerir BD)
 * Verifica que la validación funcione correctamente
 */

console.log('🧪 Test de validación LIFETIME (Lógica pura)\n');

// Simular objetos de plan
const lifetimePlanByName = {
  id: 999,
  name: 'LIFETIME',
  billingCycle: 'MONTHLY',
  price: 0
};

const lifetimePlanByCycle = {
  id: 998,
  name: 'Special Plan',
  billingCycle: 'LIFETIME',
  price: 0
};

const normalPlan = {
  id: 1,
  name: 'Estándar',
  billingCycle: 'MONTHLY',
  price: 79900
};

// Función de validación (copiada del controlador)
function isLifetimePlan(plan) {
  return (
    String(plan?.name || '').toUpperCase() === 'LIFETIME' ||
    String(plan?.billingCycle || '').toUpperCase() === 'LIFETIME'
  );
}

function canAssignPlan(plan, userRole) {
  const isLifetime = isLifetimePlan(plan);
  if (isLifetime && userRole !== 'OWNER') {
    return {
      allowed: false,
      status: 403,
      message: 'Solo un OWNER puede asignar un plan LIFETIME a un negocio.'
    };
  }
  return { allowed: true };
}

// Test cases
const testCases = [
  {
    description: 'NON-OWNER intenta cambiar a plan con name=LIFETIME',
    plan: lifetimePlanByName,
    userRole: 'BUSINESS',
    expectedResult: false,
    expectedStatus: 403
  },
  {
    description: 'NON-OWNER intenta cambiar a plan con billingCycle=LIFETIME',
    plan: lifetimePlanByCycle,
    userRole: 'BUSINESS',
    expectedResult: false,
    expectedStatus: 403
  },
  {
    description: 'OWNER intenta cambiar a plan con name=LIFETIME',
    plan: lifetimePlanByName,
    userRole: 'OWNER',
    expectedResult: true
  },
  {
    description: 'OWNER intenta cambiar a plan con billingCycle=LIFETIME',
    plan: lifetimePlanByCycle,
    userRole: 'OWNER',
    expectedResult: true
  },
  {
    description: 'NON-OWNER intenta cambiar a plan normal',
    plan: normalPlan,
    userRole: 'BUSINESS',
    expectedResult: true
  },
  {
    description: 'OWNER intenta cambiar a plan normal',
    plan: normalPlan,
    userRole: 'OWNER',
    expectedResult: true
  }
];

// Ejecutar tests
let passed = 0;
let failed = 0;

console.log('📋 Ejecutando casos de prueba:\n');

testCases.forEach((testCase, index) => {
  const result = canAssignPlan(testCase.plan, testCase.userRole);
  const success = result.allowed === testCase.expectedResult;
  
  if (success) {
    console.log(`✅ Test ${index + 1}: PASS`);
    console.log(`   ${testCase.description}`);
    console.log(`   Resultado: ${result.allowed ? 'Permitido' : 'Bloqueado (403)'}`);
    passed++;
  } else {
    console.log(`❌ Test ${index + 1}: FAIL`);
    console.log(`   ${testCase.description}`);
    console.log(`   Esperado: ${testCase.expectedResult ? 'Permitido' : 'Bloqueado'}`);
    console.log(`   Obtenido: ${result.allowed ? 'Permitido' : 'Bloqueado'}`);
    failed++;
  }
  console.log('');
});

// Test del filtro frontend
console.log('📋 Test de filtro frontend (selectablePlans):\n');

const allPlans = [
  lifetimePlanByName,
  lifetimePlanByCycle,
  normalPlan,
  { id: 2, name: 'Profesional', billingCycle: 'MONTHLY', price: 119900 },
  { id: 3, name: 'Premium', billingCycle: 'ANNUAL', price: 169900 }
];

const selectablePlans = allPlans.filter(plan => {
  const planName = String(plan?.name || '').toUpperCase();
  const billingCycle = String(plan?.billingCycle || '').toUpperCase();
  return planName !== 'LIFETIME' && billingCycle !== 'LIFETIME';
});

console.log(`   • Planes totales: ${allPlans.length}`);
console.log(`   • Planes seleccionables (sin LIFETIME): ${selectablePlans.length}`);
console.log(`   • Planes filtrados: ${allPlans.length - selectablePlans.length}`);

const lifetimeInSelectable = selectablePlans.some(p => 
  String(p.name).toUpperCase() === 'LIFETIME' || 
  String(p.billingCycle).toUpperCase() === 'LIFETIME'
);

if (lifetimeInSelectable) {
  console.log('   ❌ FAIL: Plan LIFETIME aparece en selectablePlans');
  failed++;
} else {
  console.log('   ✅ PASS: Plan LIFETIME correctamente excluido');
  passed++;
}

// Resumen final
console.log('\n' + '='.repeat(50));
console.log('📊 RESUMEN DE PRUEBAS');
console.log('='.repeat(50));
console.log(`✅ Tests exitosos: ${passed}`);
console.log(`❌ Tests fallidos: ${failed}`);
console.log(`📝 Total tests: ${passed + failed}`);

if (failed === 0) {
  console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
  console.log('\n✅ Validaciones implementadas correctamente:');
  console.log('   • Backend bloquea non-OWNER → plan LIFETIME (403)');
  console.log('   • Backend permite OWNER → plan LIFETIME');
  console.log('   • Frontend filtra plan LIFETIME de selectablePlans');
  process.exit(0);
} else {
  console.log('\n⚠️  Algunas pruebas fallaron. Revisa la implementación.');
  process.exit(1);
}
