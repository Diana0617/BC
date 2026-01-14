-- ============================================================
-- MIGRACIÓN: Agregar acceso LIFETIME para desarrollo
-- ============================================================

\echo '========================================='
\echo ' AGREGANDO CAMPOS LIFETIME A BUSINESSES'
\echo '========================================='
\echo ''

BEGIN;

-- 1. Agregar campos isLifetime y bypassSubscriptionChecks
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS "isLifetime" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS "bypassSubscriptionChecks" BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN businesses."isLifetime" IS 'Business de desarrollo/testing con acceso ilimitado sin restricciones de tiempo';
COMMENT ON COLUMN businesses."bypassSubscriptionChecks" IS 'Omite todas las validaciones de suscripción (para testing y desarrollo)';

\echo '✅ Campos agregados a tabla businesses'
\echo ''

-- Commit para poder usar el nuevo valor del ENUM
COMMIT;

-- 2. Agregar valor LIFETIME al ENUM billingCycle (en transacción separada)
ALTER TYPE "enum_subscription_plans_billingCycle" ADD VALUE IF NOT EXISTS 'LIFETIME';

\echo '✅ Valor LIFETIME agregado al ENUM billingCycle'
\echo ''

-- Nueva transacción para crear el plan
BEGIN;

-- 3. Crear plan LIFETIME en subscription_plans (si no existe)
INSERT INTO subscription_plans (
  id,
  name,
  description,
  price,
  "monthlyPrice",
  "annualPrice",
  "billingCycle",
  "trialDays",
  currency,
  duration,
  "durationType",
  "maxUsers",
  "maxClients",
  "maxAppointments",
  "maxServices",
  "storageLimit",
  features,
  status,
  "isPopular",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'LIFETIME',
  'Plan especial para desarrollo y testing con acceso ilimitado a todas las funcionalidades sin restricciones de tiempo',
  0,
  0,
  0,
  'LIFETIME',
  0,
  'COP',
  999,  -- Duración simbólica alta
  'YEARS',
  -1,  -- -1 = ilimitado
  -1,
  -1,
  -1,
  -1,
  '{"appointments": true, "clients": true, "inventory": true, "reports": true, "integrations": true, "whatsapp": true, "expenses": true, "commissions": true, "advancedReports": true}',
  'ACTIVE',
  false,
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

\echo '✅ Plan LIFETIME creado'
\echo ''

-- 4. Mostrar businesses actuales
\echo 'BUSINESSES ACTUALES:'
SELECT id, name, email, "isLifetime", "bypassSubscriptionChecks" FROM businesses;

\echo ''
\echo '========================================='
\echo ' MIGRACIÓN COMPLETADA'
\echo '========================================='
\echo ''
\echo '📝 Para activar acceso ilimitado en un business:'
\echo '   UPDATE businesses SET "isLifetime" = true WHERE email = ''tu@email.com'';'
\echo ''
\echo '   O también:'
\echo '   UPDATE businesses SET "bypassSubscriptionChecks" = true WHERE id = ''BUSINESS_ID'';'
\echo ''

COMMIT;
-- ROLLBACK;
