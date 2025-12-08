-- Migración: Agregar campos de billing mensual/anual a subscription_plans
-- Fecha: 2025-10-06
-- Descripción: Permite a los planes tener precios diferenciados para pago mensual vs anual

-- Agregar campos de pricing
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS monthly_price DECIMAL(10, 2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS annual_price DECIMAL(10, 2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20) DEFAULT 'MONTHLY' CHECK (billing_cycle IN ('MONTHLY', 'ANNUAL')),
ADD COLUMN IF NOT EXISTS annual_discount_percent INTEGER DEFAULT 0 CHECK (annual_discount_percent >= 0 AND annual_discount_percent <= 100);

-- Agregar comentarios
COMMENT ON COLUMN subscription_plans.monthly_price IS 'Precio mensual (si se paga mes a mes)';
COMMENT ON COLUMN subscription_plans.annual_price IS 'Precio anual (si se paga el año completo - con descuento)';
COMMENT ON COLUMN subscription_plans.billing_cycle IS 'Ciclo de facturación por defecto: MONTHLY o ANNUAL';
COMMENT ON COLUMN subscription_plans.annual_discount_percent IS 'Porcentaje de descuento al pagar anual (ej: 20 = 20% off)';

-- El campo 'price' existente será el precio base/mensual

-- Actualizar planes existentes con valores iniciales
-- Asumiendo que el precio actual es mensual
UPDATE subscription_plans 
SET 
  monthly_price = price,
  annual_price = (price * 12 * 0.8), -- 20% descuento en anual (12 meses)
  annual_discount_percent = 20,
  billing_cycle = 'MONTHLY'
WHERE monthly_price IS NULL;

-- Agregar campo billing_cycle a business_subscriptions
ALTER TABLE business_subscriptions
ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20) DEFAULT 'MONTHLY' CHECK (billing_cycle IN ('MONTHLY', 'ANNUAL'));

COMMENT ON COLUMN business_subscriptions.billing_cycle IS 'Ciclo de facturación elegido por el cliente: MONTHLY o ANNUAL';

-- Actualizar suscripciones existentes
UPDATE business_subscriptions 
SET billing_cycle = 'MONTHLY'
WHERE billing_cycle IS NULL;

-- Crear índice para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_subscriptions_billing_cycle ON business_subscriptions(billing_cycle);
CREATE INDEX IF NOT EXISTS idx_plans_billing_cycle ON subscription_plans(billing_cycle);

-- Verificar la migración
SELECT 
  id, 
  name, 
  price as base_price,
  monthly_price,
  annual_price,
  annual_discount_percent,
  billing_cycle
FROM subscription_plans
LIMIT 5;
