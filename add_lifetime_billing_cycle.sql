-- ============================================================
-- Agregar soporte para suscripciones LIFETIME
-- ============================================================

-- 1. Agregar valor LIFETIME al enum de billingCycle en business_subscriptions
-- (Debe ejecutarse fuera de transacción)
ALTER TYPE "enum_business_subscriptions_billingCycle" ADD VALUE IF NOT EXISTS 'LIFETIME';

-- 2. Actualizar la suscripción de Laura Vargas a LIFETIME gratuita
-- (Ejecutar después de que el ALTER TYPE esté confirmado)
BEGIN;

UPDATE business_subscriptions
SET 
    status = 'ACTIVE',
    "billingCycle" = 'LIFETIME',
    amount = 0,
    "autoRenew" = false,
    "endDate" = '2099-12-31 23:59:59+00', -- Fecha muy lejana para indicar "sin expiración"
    notes = 'Suscripción gratuita de por vida (Lifetime) - Creada por Owner'
WHERE "businessId" = 'f97e749b-36d3-48bd-b82f-42cd6f23ed86';

-- 3. Verificar el resultado
SELECT 
    bs.id,
    b.name as business_name,
    bs.status,
    bs."billingCycle",
    bs.amount,
    bs."startDate",
    bs."endDate",
    bs."autoRenew",
    bs.notes,
    sp.name as plan_name
FROM business_subscriptions bs
INNER JOIN businesses b ON bs."businessId" = b.id
LEFT JOIN subscription_plans sp ON bs."subscriptionPlanId" = sp.id
WHERE bs."businessId" = 'f97e749b-36d3-48bd-b82f-42cd6f23ed86';

COMMIT;

-- ============================================================
-- RESUMEN
-- ============================================================
SELECT 
    '✅ Suscripción LIFETIME configurada para Laura Vargas' as resultado;
