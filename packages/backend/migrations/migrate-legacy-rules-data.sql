-- Data Migration Script: Migrate from old business rules structure to new simplified structure
-- Description: Migrates data from business_rule_templates, business_rule_assignments, and business_rules 
--              to the new rule_templates and business_rules tables

-- This script should be run AFTER creating the new tables and BEFORE removing the old ones

BEGIN;

-- ================================
-- STEP 1: Migrate Rule Templates
-- ================================

-- Insert rule templates from existing BusinessRuleTemplate
INSERT INTO rule_templates (
    id,
    key, 
    type,
    "defaultValue",
    description,
    category,
    "allowCustomization",
    version,
    "isActive",
    "validationRules",
    examples,
    "createdAt",
    "updatedAt"
)
SELECT 
    brt.id,
    brt."ruleKey" as key,
    CASE 
        WHEN brt."ruleType" = 'BOOLEAN' THEN 'BOOLEAN'::varchar
        WHEN brt."ruleType" = 'STRING' THEN 'STRING'::varchar  
        WHEN brt."ruleType" = 'NUMBER' THEN 'NUMBER'::varchar
        WHEN brt."ruleType" = 'OBJECT' THEN 'JSON'::varchar
        WHEN brt."ruleType" = 'ARRAY' THEN 'JSON'::varchar
        ELSE 'JSON'::varchar
    END as type,
    brt."ruleValue" as "defaultValue",
    brt.description,
    brt.category,
    brt."allowCustomization",
    COALESCE(brt.version, '1.0.0') as version,
    brt."isActive",
    brt."customizationOptions" as "validationRules",
    brt.examples,
    brt."createdAt",
    brt."updatedAt"
FROM business_rule_templates brt
WHERE brt."isActive" = true
ON CONFLICT (key) DO UPDATE SET
    "defaultValue" = EXCLUDED."defaultValue",
    description = EXCLUDED.description,
    "updatedAt" = EXCLUDED."updatedAt";

-- ================================
-- STEP 2: Migrate Business Rule Assignments
-- ================================

-- Insert business rules from existing BusinessRuleAssignment with custom values
INSERT INTO business_rules (
    id,
    "businessId",
    "ruleTemplateId", 
    "customValue",
    "isActive",
    "updatedBy",
    notes,
    "appliedAt",
    "createdAt",
    "updatedAt"
)
SELECT 
    bra.id,
    bra."businessId",
    bra."ruleTemplateId",
    CASE 
        WHEN bra."isCustomized" = true THEN bra."customValue"
        ELSE NULL -- Use template default
    END as "customValue",
    bra."isActive",
    bra."modifiedBy" as "updatedBy",
    bra.notes,
    bra."assignedAt" as "appliedAt",
    bra."createdAt",
    COALESCE(bra."lastModified", bra."updatedAt") as "updatedAt"
FROM business_rule_assignments bra
INNER JOIN business_rule_templates brt ON bra."ruleTemplateId" = brt.id
ON CONFLICT ("businessId", "ruleTemplateId") DO UPDATE SET
    "customValue" = EXCLUDED."customValue",
    "isActive" = EXCLUDED."isActive",
    "updatedBy" = EXCLUDED."updatedBy",
    notes = EXCLUDED.notes,
    "updatedAt" = EXCLUDED."updatedAt";

-- ================================  
-- STEP 3: Migrate Legacy Business Rules
-- ================================

-- Create rule templates for legacy fields that don't exist yet
INSERT INTO rule_templates (key, type, "defaultValue", description, category, "allowCustomization") VALUES
('allow_close_without_consent', 'BOOLEAN', 'false', 'Permite cerrar sin consentimiento del cliente', 'PAYMENT_POLICY', true),
('allow_reschedule', 'BOOLEAN', 'true', 'Permite reprogramar turnos', 'CANCELLATION_POLICY', true),
('reschedule_time_limit', 'NUMBER', '4', 'Horas límite para reprogramar antes del turno', 'CANCELLATION_POLICY', true),
('allow_online_booking', 'BOOLEAN', 'true', 'Permite reservas online', 'BOOKING_POLICY', true),
('create_voucher_on_cancel', 'BOOLEAN', 'false', 'Crear voucher al cancelar', 'REFUND_POLICY', true)
ON CONFLICT (key) DO NOTHING;

-- Migrate legacy fields from business_rules table
-- This handles businesses that have direct rule customizations
INSERT INTO business_rules ("businessId", "ruleTemplateId", "customValue", "isActive", "createdAt", "updatedAt")
SELECT DISTINCT
    br."businessId",
    rt.id as "ruleTemplateId",
    CASE rt.key
        WHEN 'allow_close_without_payment' THEN to_jsonb(br."allowCloseWithoutPayment")
        WHEN 'enable_cancellation' THEN to_jsonb(br."enableCancellation")
        WHEN 'auto_refund_on_cancel' THEN to_jsonb(br."autoRefundOnCancel")
        WHEN 'create_voucher_on_cancel' THEN to_jsonb(br."createVoucherOnCancel")
        WHEN 'allow_close_without_consent' THEN to_jsonb(br."allowCloseWithoutConsent")
        WHEN 'cancellation_time_limit' THEN to_jsonb(br."cancellationTimeLimit")
        WHEN 'allow_reschedule' THEN to_jsonb(br."allowReschedule")
        WHEN 'reschedule_time_limit' THEN to_jsonb(br."rescheduleTimeLimit")
        WHEN 'require_deposit_for_booking' THEN to_jsonb(br."requireDepositForBooking")
        WHEN 'deposit_percentage' THEN to_jsonb(br."depositPercentage")
        WHEN 'allow_online_booking' THEN to_jsonb(br."allowOnlineBooking")
        WHEN 'max_advance_booking_days' THEN to_jsonb(br."maxAdvanceBookingDays")
        WHEN 'working_hours' THEN br."workingHours"
        WHEN 'notification_settings' THEN br."notificationSettings"
    END as "customValue",
    br."isActive",
    br."createdAt",
    br."updatedAt"
FROM business_rules br
CROSS JOIN rule_templates rt
WHERE rt.key IN (
    'allow_close_without_payment',
    'enable_cancellation', 
    'auto_refund_on_cancel',
    'create_voucher_on_cancel',
    'allow_close_without_consent',
    'cancellation_time_limit',
    'allow_reschedule',
    'reschedule_time_limit',
    'require_deposit_for_booking',
    'deposit_percentage',
    'allow_online_booking',
    'max_advance_booking_days',
    'working_hours',
    'notification_settings'
)
AND (
    (rt.key = 'allow_close_without_payment' AND br."allowCloseWithoutPayment" IS NOT NULL) OR
    (rt.key = 'enable_cancellation' AND br."enableCancellation" IS NOT NULL) OR
    (rt.key = 'auto_refund_on_cancel' AND br."autoRefundOnCancel" IS NOT NULL) OR
    (rt.key = 'create_voucher_on_cancel' AND br."createVoucherOnCancel" IS NOT NULL) OR
    (rt.key = 'allow_close_without_consent' AND br."allowCloseWithoutConsent" IS NOT NULL) OR
    (rt.key = 'cancellation_time_limit' AND br."cancellationTimeLimit" IS NOT NULL) OR
    (rt.key = 'allow_reschedule' AND br."allowReschedule" IS NOT NULL) OR
    (rt.key = 'reschedule_time_limit' AND br."rescheduleTimeLimit" IS NOT NULL) OR
    (rt.key = 'require_deposit_for_booking' AND br."requireDepositForBooking" IS NOT NULL) OR
    (rt.key = 'deposit_percentage' AND br."depositPercentage" IS NOT NULL) OR
    (rt.key = 'allow_online_booking' AND br."allowOnlineBooking" IS NOT NULL) OR
    (rt.key = 'max_advance_booking_days' AND br."maxAdvanceBookingDays" IS NOT NULL) OR
    (rt.key = 'working_hours' AND br."workingHours" IS NOT NULL) OR
    (rt.key = 'notification_settings' AND br."notificationSettings" IS NOT NULL)
)
ON CONFLICT ("businessId", "ruleTemplateId") DO NOTHING; -- Keep existing assignments

-- ================================
-- STEP 4: Verification Queries
-- ================================

-- Count records migrated
DO $$ 
BEGIN
    RAISE NOTICE 'Migration Summary:';
    RAISE NOTICE 'Rule Templates: % records', (SELECT COUNT(*) FROM rule_templates);
    RAISE NOTICE 'Business Rules: % records', (SELECT COUNT(*) FROM business_rules);
    RAISE NOTICE 'Active Business Rules: % records', (SELECT COUNT(*) FROM business_rules WHERE "isActive" = true);
END $$;

COMMIT;