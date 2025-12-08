-- Migration: Add dataRetentionUntil field to businesses table
-- Purpose: Track data retention period after subscription expiration (30 days policy)
-- Date: 2025-11-14

-- Add the data retention field
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS "dataRetentionUntil" TIMESTAMP WITH TIME ZONE;

-- Add comment to explain the field
COMMENT ON COLUMN businesses."dataRetentionUntil" IS 'Fecha hasta la cual se mantendrán los datos del negocio después de la expiración de suscripción (30 días después del último vencimiento)';

-- Update existing businesses with expired trials to set retention date
UPDATE businesses 
SET "dataRetentionUntil" = "trialEndDate" + INTERVAL '30 days'
WHERE status = 'TRIAL' 
  AND "trialEndDate" IS NOT NULL 
  AND "trialEndDate" < NOW()
  AND "dataRetentionUntil" IS NULL;

-- Create index for efficient queries on data retention
CREATE INDEX IF NOT EXISTS idx_businesses_data_retention 
ON businesses("dataRetentionUntil") 
WHERE "dataRetentionUntil" IS NOT NULL;
