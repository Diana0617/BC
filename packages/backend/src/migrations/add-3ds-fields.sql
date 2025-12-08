-- Migración para agregar soporte a 3DS/3RI en SubscriptionPayment
-- Fecha: 2025-09-19

-- 1. Agregar nuevos valores al enum de paymentMethod
ALTER TYPE enum_subscription_payments_paymentMethod ADD VALUE IF NOT EXISTS 'WOMPI_CARD';
ALTER TYPE enum_subscription_payments_paymentMethod ADD VALUE IF NOT EXISTS 'WOMPI_3DS';
ALTER TYPE enum_subscription_payments_paymentMethod ADD VALUE IF NOT EXISTS 'WOMPI_3RI';

-- 2. Agregar nuevos valores al enum de status
ALTER TYPE enum_subscription_payments_status ADD VALUE IF NOT EXISTS 'APPROVED';
ALTER TYPE enum_subscription_payments_status ADD VALUE IF NOT EXISTS 'DECLINED';
ALTER TYPE enum_subscription_payments_status ADD VALUE IF NOT EXISTS 'ERROR';
ALTER TYPE enum_subscription_payments_status ADD VALUE IF NOT EXISTS 'VOIDED';
ALTER TYPE enum_subscription_payments_status ADD VALUE IF NOT EXISTS 'THREEDS_PENDING';
ALTER TYPE enum_subscription_payments_status ADD VALUE IF NOT EXISTS 'THREEDS_CHALLENGE';
ALTER TYPE enum_subscription_payments_status ADD VALUE IF NOT EXISTS 'THREEDS_COMPLETED';

-- 3. Crear enum para recurringType
CREATE TYPE enum_subscription_payments_recurringType AS ENUM ('INITIAL', 'RECURRING', 'MANUAL');

-- 4. Agregar campos para tokenización y pagos recurrentes
ALTER TABLE subscription_payments 
ADD COLUMN IF NOT EXISTS payment_source_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_three_ds_enabled BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS three_ds_auth_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_recurring_payment BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS original_payment_id UUID REFERENCES subscription_payments(id),
ADD COLUMN IF NOT EXISTS recurring_type enum_subscription_payments_recurringType DEFAULT 'MANUAL' NOT NULL,
ADD COLUMN IF NOT EXISTS auto_renewal_enabled BOOLEAN DEFAULT FALSE NOT NULL;

-- 5. Agregar comentarios a los nuevos campos
COMMENT ON COLUMN subscription_payments.payment_source_token IS 'Token de la fuente de pago para cobros recurrentes (3RI)';
COMMENT ON COLUMN subscription_payments.is_three_ds_enabled IS 'Si la fuente de pago fue creada con 3D Secure';
COMMENT ON COLUMN subscription_payments.three_ds_auth_data IS 'Datos de autenticación 3DS completos';
COMMENT ON COLUMN subscription_payments.is_recurring_payment IS 'Si es un pago recurrente automático';
COMMENT ON COLUMN subscription_payments.original_payment_id IS 'Referencia al pago original que estableció el token 3DS';
COMMENT ON COLUMN subscription_payments.recurring_type IS 'Tipo de pago: inicial con 3DS, recurrente con 3RI, o manual';
COMMENT ON COLUMN subscription_payments.auto_renewal_enabled IS 'Si está habilitada la renovación automática';

-- 6. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_subscription_payments_payment_source_token ON subscription_payments(payment_source_token);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_is_recurring ON subscription_payments(is_recurring_payment);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_recurring_type ON subscription_payments(recurring_type);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_original_payment ON subscription_payments(original_payment_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_auto_renewal ON subscription_payments(auto_renewal_enabled);

-- 7. Actualizar registros existentes para mantener compatibilidad
UPDATE subscription_payments 
SET recurring_type = 'MANUAL'
WHERE recurring_type IS NULL;