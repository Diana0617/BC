-- Migration: Create business_rules table
-- Description: Creates the simplified business rules table that links businesses to rule templates

-- Drop table if exists (for development)
DROP TABLE IF EXISTS business_rules CASCADE;

-- Create business_rules table
CREATE TABLE business_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL,
    "ruleTemplateId" UUID NOT NULL,
    "customValue" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "updatedBy" UUID,
    notes TEXT,
    "appliedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_business_rules_business 
        FOREIGN KEY ("businessId") REFERENCES businesses(id) ON DELETE CASCADE,
    CONSTRAINT fk_business_rules_rule_template 
        FOREIGN KEY ("ruleTemplateId") REFERENCES rule_templates(id) ON DELETE CASCADE,
    CONSTRAINT fk_business_rules_updated_by 
        FOREIGN KEY ("updatedBy") REFERENCES users(id) ON DELETE SET NULL,
    
    -- Unique constraint to prevent duplicate business-rule combinations
    CONSTRAINT unique_business_rule_template 
        UNIQUE ("businessId", "ruleTemplateId")
);

-- Create indexes
CREATE INDEX idx_business_rules_business_id ON business_rules("businessId");
CREATE INDEX idx_business_rules_rule_template_id ON business_rules("ruleTemplateId");
CREATE INDEX idx_business_rules_is_active ON business_rules("isActive");
CREATE INDEX idx_business_rules_updated_by ON business_rules("updatedBy");

-- Add comments
COMMENT ON TABLE business_rules IS 'Relación entre negocios y templates de reglas con valores personalizados';
COMMENT ON COLUMN business_rules."businessId" IS 'ID del negocio que usa esta regla';
COMMENT ON COLUMN business_rules."ruleTemplateId" IS 'ID del template de regla';
COMMENT ON COLUMN business_rules."customValue" IS 'Valor personalizado del negocio. Si es NULL, usar defaultValue del template';
COMMENT ON COLUMN business_rules."isActive" IS 'Si esta regla está activa para el negocio';
COMMENT ON COLUMN business_rules."updatedBy" IS 'Usuario que realizó la última modificación';
COMMENT ON COLUMN business_rules.notes IS 'Notas adicionales sobre la configuración de esta regla';
COMMENT ON COLUMN business_rules."appliedAt" IS 'Fecha cuando se aplicó por primera vez esta regla';