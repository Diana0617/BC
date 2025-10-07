-- Script de limpieza después de las pruebas
-- CUIDADO: Esto elimina los datos de prueba

-- 1. Eliminar suscripciones de prueba
DELETE FROM subscription_payments 
WHERE business_subscription_id IN (
  SELECT bs.id 
  FROM business_subscriptions bs
  JOIN businesses b ON bs.business_id = b.id
  WHERE b.name LIKE '%Prueba%' OR b.name LIKE '%Test%'
);

DELETE FROM business_subscriptions 
WHERE business_id IN (
  SELECT id FROM businesses 
  WHERE name LIKE '%Prueba%' OR name LIKE '%Test%'
);

-- 2. Eliminar negocios de prueba
DELETE FROM users 
WHERE business_id IN (
  SELECT id FROM businesses 
  WHERE name LIKE '%Prueba%' OR name LIKE '%Test%'
);

DELETE FROM businesses 
WHERE name LIKE '%Prueba%' OR name LIKE '%Test%';

-- 3. Eliminar plan de prueba (opcional)
DELETE FROM subscription_plans 
WHERE name = 'Plan Prueba Premium';

-- 4. Verificar limpieza
SELECT 
  'Businesses de prueba' as table_name,
  COUNT(*) as remaining
FROM businesses 
WHERE name LIKE '%Prueba%' OR name LIKE '%Test%'

UNION ALL

SELECT 
  'Plans de prueba',
  COUNT(*)
FROM subscription_plans
WHERE name = 'Plan Prueba Premium';

-- Resultado esperado: 0 en todas las tablas
