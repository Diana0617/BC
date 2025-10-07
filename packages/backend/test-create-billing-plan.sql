-- Script de prueba: Crear plan con facturación mensual/anual
-- Ejecutar después de correr la migración add-billing-cycle-fields.sql

-- 1. Crear un plan de prueba con precios mensuales y anuales
INSERT INTO subscription_plans (
  name,
  description,
  price,              -- Precio legacy (fallback)
  monthly_price,      -- Precio mensual
  annual_price,       -- Precio anual con descuento
  currency,
  billing_cycle,      -- Ciclo por defecto
  annual_discount_percent,
  duration,
  duration_type,
  trial_days,
  is_active,
  status,
  created_at,
  updated_at
) VALUES (
  'Plan Prueba Premium',
  'Plan de prueba con facturación mensual y anual - 20% descuento anual',
  50000,              -- $50,000 COP/mes (legacy)
  50000,              -- $50,000 COP/mes
  480000,             -- $480,000 COP/año (12 meses * $50k * 0.8 = 20% descuento)
  'COP',
  'MONTHLY',
  20,                 -- 20% de descuento anual
  1,
  'MONTHS',
  7,                  -- 7 días de prueba gratis
  true,
  'ACTIVE',
  NOW(),
  NOW()
) RETURNING id, name, monthly_price, annual_price, annual_discount_percent;

-- 2. Verificar que el plan se creó correctamente
SELECT 
  id,
  name,
  price as legacy_price,
  monthly_price,
  annual_price,
  billing_cycle,
  annual_discount_percent,
  trial_days,
  duration || ' ' || duration_type as subscription_duration
FROM subscription_plans 
WHERE name = 'Plan Prueba Premium';

-- 3. Calcular el ahorro anual
SELECT 
  name,
  monthly_price,
  annual_price,
  (monthly_price * 12) as monthly_cost_per_year,
  ((monthly_price * 12) - annual_price) as annual_savings,
  annual_discount_percent || '%' as advertised_discount,
  ROUND(
    (((monthly_price * 12) - annual_price)::numeric / (monthly_price * 12) * 100), 
    2
  ) || '%' as actual_discount_percent
FROM subscription_plans 
WHERE name = 'Plan Prueba Premium';
