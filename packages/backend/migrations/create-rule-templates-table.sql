-- Migration: Create rule_templates table
-- Description: Creates the simplified rule templates table

-- Drop table if exists (for development)
DROP TABLE IF EXISTS rule_templates CASCADE;

-- Create rule_templates table
CREATE TABLE rule_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('BOOLEAN', 'STRING', 'NUMBER', 'JSON')),
    "defaultValue" JSONB NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'GENERAL' CHECK (category IN (
        'PAYMENT_POLICY',
        'CANCELLATION_POLICY', 
        'BOOKING_POLICY',
        'WORKING_HOURS',
        'NOTIFICATION_POLICY',
        'REFUND_POLICY',
        'SERVICE_POLICY',
        'GENERAL'
    )),
    "allowCustomization" BOOLEAN NOT NULL DEFAULT TRUE,
    version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "validationRules" JSONB,
    examples JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_rule_templates_key ON rule_templates(key);
CREATE INDEX idx_rule_templates_category ON rule_templates(category);
CREATE INDEX idx_rule_templates_is_active ON rule_templates("isActive");
CREATE INDEX idx_rule_templates_type ON rule_templates(type);

-- Add comments
COMMENT ON TABLE rule_templates IS 'Templates globales de reglas que pueden ser aplicadas a negocios';
COMMENT ON COLUMN rule_templates.key IS 'Identificador único de la regla (ej: allow_close_without_payment)';
COMMENT ON COLUMN rule_templates.type IS 'Tipo de dato que almacena esta regla';
COMMENT ON COLUMN rule_templates."defaultValue" IS 'Valor por defecto de la regla';
COMMENT ON COLUMN rule_templates.description IS 'Descripción detallada de qué hace esta regla';
COMMENT ON COLUMN rule_templates.category IS 'Categoría funcional de la regla';
COMMENT ON COLUMN rule_templates."allowCustomization" IS 'Si los negocios pueden personalizar esta regla';
COMMENT ON COLUMN rule_templates.version IS 'Versión de la regla para control de cambios';
COMMENT ON COLUMN rule_templates."isActive" IS 'Si la regla está disponible para uso';
COMMENT ON COLUMN rule_templates."validationRules" IS 'Reglas de validación para valores personalizados';
COMMENT ON COLUMN rule_templates.examples IS 'Ejemplos de uso de la regla';

-- Insert some default rule templates
INSERT INTO rule_templates (key, type, "defaultValue", description, category, "allowCustomization") VALUES
('allow_close_without_payment', 'BOOLEAN', 'false', 'Permite cerrar turnos sin confirmación de pago', 'PAYMENT_POLICY', true),
('enable_cancellation', 'BOOLEAN', 'true', 'Permite cancelar turnos', 'CANCELLATION_POLICY', true),
('auto_refund_on_cancel', 'BOOLEAN', 'false', 'Reembolso automático al cancelar', 'REFUND_POLICY', true),
('cancellation_time_limit', 'NUMBER', '24', 'Horas límite para cancelar antes del turno', 'CANCELLATION_POLICY', true),
('require_deposit_for_booking', 'BOOLEAN', 'false', 'Requiere depósito para reservar', 'PAYMENT_POLICY', true),
('deposit_percentage', 'NUMBER', '50', 'Porcentaje de depósito requerido', 'PAYMENT_POLICY', true),
('max_advance_booking_days', 'NUMBER', '30', 'Días máximos de anticipación para reservar', 'BOOKING_POLICY', true),
('working_hours', 'JSON', '{"monday":{"start":"09:00","end":"18:00","enabled":true},"tuesday":{"start":"09:00","end":"18:00","enabled":true},"wednesday":{"start":"09:00","end":"18:00","enabled":true},"thursday":{"start":"09:00","end":"18:00","enabled":true},"friday":{"start":"09:00","end":"18:00","enabled":true},"saturday":{"start":"09:00","end":"16:00","enabled":true},"sunday":{"start":"10:00","end":"14:00","enabled":false}}', 'Horarios de trabajo del negocio', 'WORKING_HOURS', true),
('notification_settings', 'JSON', '{"emailNotifications":true,"smsNotifications":false,"reminderHours":[24,2],"confirmationRequired":true}', 'Configuraciones de notificaciones', 'NOTIFICATION_POLICY', true);