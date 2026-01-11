-- Script para agregar campos de loyalty/referidos a business_clients
-- Si ya existen, PostgreSQL dará un error pero no afectará los datos

BEGIN;

-- Agregar columna referralCode
ALTER TABLE business_clients 
ADD COLUMN IF NOT EXISTS "referralCode" VARCHAR(15) UNIQUE;

-- Agregar columna referredBy
ALTER TABLE business_clients 
ADD COLUMN IF NOT EXISTS "referredBy" UUID;

-- Agregar columna referralCount
ALTER TABLE business_clients 
ADD COLUMN IF NOT EXISTS "referralCount" INTEGER NOT NULL DEFAULT 0;

-- Agregar columna lastReferralDate
ALTER TABLE business_clients 
ADD COLUMN IF NOT EXISTS "lastReferralDate" TIMESTAMP WITH TIME ZONE;

-- Crear índice único para referralCode
CREATE UNIQUE INDEX IF NOT EXISTS idx_bc_referral_code_unique 
ON business_clients("referralCode");

-- Crear índice para referredBy
CREATE INDEX IF NOT EXISTS idx_bc_referred_by 
ON business_clients("referredBy");

-- Agregar foreign key para referredBy
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'business_clients_referredBy_fkey'
    ) THEN
        ALTER TABLE business_clients 
        ADD CONSTRAINT business_clients_referredBy_fkey 
        FOREIGN KEY ("referredBy") 
        REFERENCES clients(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

COMMIT;

-- Verificar que las columnas fueron agregadas
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'business_clients' 
AND column_name IN ('referralCode', 'referredBy', 'referralCount', 'lastReferralDate')
ORDER BY column_name;
