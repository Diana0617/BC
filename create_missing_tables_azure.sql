-- ============================================
-- CREAR TABLAS FALTANTES EN AZURE
-- Script generado comparando base local vs Azure
-- ============================================

BEGIN;

-- ============================================
-- 1. TABLA: procedure_supplies
-- Registra consumo de productos en procedimientos
-- ============================================
CREATE TABLE IF NOT EXISTS "procedure_supplies" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "business_id" UUID NOT NULL,
    "branch_id" UUID,
    "appointment_id" UUID,
    "shift_id" UUID,
    "specialist_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" NUMERIC(10,3) NOT NULL CHECK (quantity > 0),
    "unit" VARCHAR(255) NOT NULL DEFAULT 'unit',
    "unit_cost" NUMERIC(10,2),
    "total_cost" NUMERIC(15,2),
    "reason" VARCHAR(255),
    "notes" TEXT,
    "inventory_movement_id" UUID,
    "registered_by" UUID NOT NULL,
    "registered_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "fk_procedure_supplies_business" 
        FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_procedure_supplies_branch" 
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL,
    CONSTRAINT "fk_procedure_supplies_appointment" 
        FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL,
    CONSTRAINT "fk_procedure_supplies_shift" 
        FOREIGN KEY ("shift_id") REFERENCES "cash_register_shifts"("id") ON DELETE SET NULL,
    CONSTRAINT "fk_procedure_supplies_specialist" 
        FOREIGN KEY ("specialist_id") REFERENCES "users"("id") ON DELETE RESTRICT,
    CONSTRAINT "fk_procedure_supplies_product" 
        FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT,
    CONSTRAINT "fk_procedure_supplies_registered_by" 
        FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE RESTRICT,
    CONSTRAINT "fk_procedure_supplies_inventory_movement" 
        FOREIGN KEY ("inventory_movement_id") REFERENCES "inventory_movements"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "idx_procedure_supplies_business" ON "procedure_supplies"("business_id");
CREATE INDEX IF NOT EXISTS "idx_procedure_supplies_branch" ON "procedure_supplies"("branch_id");
CREATE INDEX IF NOT EXISTS "idx_procedure_supplies_appointment" ON "procedure_supplies"("appointment_id");
CREATE INDEX IF NOT EXISTS "idx_procedure_supplies_shift" ON "procedure_supplies"("shift_id");
CREATE INDEX IF NOT EXISTS "idx_procedure_supplies_specialist" ON "procedure_supplies"("specialist_id");
CREATE INDEX IF NOT EXISTS "idx_procedure_supplies_product" ON "procedure_supplies"("product_id");
CREATE INDEX IF NOT EXISTS "idx_procedure_supplies_registered_at" ON "procedure_supplies"("registered_at");
CREATE INDEX IF NOT EXISTS "idx_procedure_supplies_inventory_movement" ON "procedure_supplies"("inventory_movement_id");
CREATE INDEX IF NOT EXISTS "idx_procedure_supplies_business_specialist_date" 
    ON "procedure_supplies"("business_id", "specialist_id", "registered_at");

COMMENT ON TABLE "procedure_supplies" IS 'Registra el consumo de productos/insumos durante procedimientos';

COMMIT;

SELECT 'TABLA procedure_supplies CREADA EXITOSAMENTE' AS resultado;
