-- Migration: Add 3DS v2 fields to subscription_payments table
-- Date: 2025-09-19
-- Description: Add fields required for Wompi 3D Secure v2 protocol compatibility

-- Add new columns for 3DS v2 support
ALTER TABLE subscription_payments 
ADD COLUMN browser_info JSONB DEFAULT '{}',
ADD COLUMN three_ds_auth_type VARCHAR(50),
ADD COLUMN three_ds_method_data TEXT,
ADD COLUMN current_step VARCHAR(50),
ADD COLUMN current_step_status VARCHAR(50);

-- Add comments for new columns
COMMENT ON COLUMN subscription_payments.browser_info IS 'Información del navegador requerida para 3DS v2: color depth, screen dimensions, language, user agent, timezone';
COMMENT ON COLUMN subscription_payments.three_ds_auth_type IS 'Tipo de autenticación 3DS v2 (solo para sandbox/testing)';
COMMENT ON COLUMN subscription_payments.three_ds_method_data IS 'HTML iframe codificado para challenge 3DS que debe ser decodificado y renderizado';
COMMENT ON COLUMN subscription_payments.current_step IS 'Paso actual del proceso 3DS';
COMMENT ON COLUMN subscription_payments.current_step_status IS 'Estado del paso actual de 3DS';

-- Create enum types for 3DS v2 fields
CREATE TYPE three_ds_auth_type_enum AS ENUM (
  'no_challenge_success',
  'challenge_denied', 
  'challenge_v2',
  'supported_version_error',
  'authentication_error'
);

CREATE TYPE three_ds_current_step_enum AS ENUM (
  'SUPPORTED_VERSION',
  'AUTHENTICATION',
  'CHALLENGE'
);

CREATE TYPE three_ds_step_status_enum AS ENUM (
  'PENDING',
  'COMPLETED',
  'Non-Authenticated',
  'ERROR'
);

-- Update columns to use the new enum types
ALTER TABLE subscription_payments 
ALTER COLUMN three_ds_auth_type TYPE three_ds_auth_type_enum USING three_ds_auth_type::three_ds_auth_type_enum,
ALTER COLUMN current_step TYPE three_ds_current_step_enum USING current_step::three_ds_current_step_enum,
ALTER COLUMN current_step_status TYPE three_ds_step_status_enum USING current_step_status::three_ds_step_status_enum;

-- Update existing status enum to include new 3DS v2 statuses
ALTER TYPE subscription_payment_status ADD VALUE IF NOT EXISTS 'THREEDS_AUTHENTICATION';
ALTER TYPE subscription_payment_status ADD VALUE IF NOT EXISTS 'THREEDS_CHALLENGE_REQUIRED';
ALTER TYPE subscription_payment_status ADD VALUE IF NOT EXISTS 'THREEDS_CHALLENGE_FAILED';

-- Add index for 3DS transactions
CREATE INDEX IF NOT EXISTS idx_subscription_payments_3ds_enabled ON subscription_payments(is_three_ds_enabled) WHERE is_three_ds_enabled = true;
CREATE INDEX IF NOT EXISTS idx_subscription_payments_current_step ON subscription_payments(current_step) WHERE current_step IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscription_payments_3ds_auth_type ON subscription_payments(three_ds_auth_type) WHERE three_ds_auth_type IS NOT NULL;

-- Create view for 3DS transaction monitoring
CREATE OR REPLACE VIEW v_3ds_transactions AS
SELECT 
  id,
  business_subscription_id,
  amount,
  currency,
  status,
  payment_method,
  transaction_id,
  is_three_ds_enabled,
  three_ds_auth_type,
  current_step,
  current_step_status,
  browser_info,
  three_ds_method_data IS NOT NULL as has_challenge_iframe,
  created_at,
  updated_at
FROM subscription_payments 
WHERE is_three_ds_enabled = true;

-- Add comment to view
COMMENT ON VIEW v_3ds_transactions IS 'Vista para monitorear transacciones 3DS v2 con todos los campos relevantes';

-- Insert example of browser_info structure for documentation
INSERT INTO documentation_examples (table_name, field_name, example_json, description) VALUES 
('subscription_payments', 'browser_info', 
'{"browser_color_depth": "24", "browser_screen_height": "1050", "browser_screen_width": "1680", "browser_language": "en-US", "browser_user_agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N)...", "browser_tz": "-300"}',
'Ejemplo de estructura browser_info requerida para 3DS v2')
ON CONFLICT (table_name, field_name) DO UPDATE SET 
example_json = EXCLUDED.example_json,
description = EXCLUDED.description,
updated_at = CURRENT_TIMESTAMP;