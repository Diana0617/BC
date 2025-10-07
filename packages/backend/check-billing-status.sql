-- Script de verificación rápida del estado de billing cycle
-- Ejecutar ANTES de las pruebas

-- 1. Verificar que la migración se ejecutó
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'subscription_plans' 
  AND column_name IN ('monthly_price', 'annual_price', 'billing_cycle', 'annual_discount_percent')
ORDER BY column_name;

-- Resultado esperado: 4 filas (los 4 campos nuevos)

-- 2. Verificar campo en business_subscriptions
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'business_subscriptions' 
  AND column_name = 'billing_cycle';

-- Resultado esperado: 1 fila

-- 3. Ver planes existentes (si los hay)
SELECT 
  id,
  name,
  price as legacy_price,
  monthly_price,
  annual_price,
  billing_cycle,
  annual_discount_percent,
  is_active,
  status
FROM subscription_plans
ORDER BY created_at DESC;

-- 4. Contar suscripciones con billing cycle
SELECT 
  billing_cycle,
  COUNT(*) as total,
  AVG(amount) as avg_amount
FROM business_subscriptions
GROUP BY billing_cycle;

-- 5. Estado final esperado
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'subscription_plans' 
        AND column_name = 'monthly_price'
    ) THEN '✅ Migración ejecutada'
    ELSE '❌ FALTA ejecutar migración'
  END as migration_status;
