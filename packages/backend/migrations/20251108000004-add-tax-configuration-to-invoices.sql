-- Add tax configuration columns to supplier_invoices
ALTER TABLE supplier_invoices 
ADD COLUMN IF NOT EXISTS "taxIncluded" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "taxPercentage" DECIMAL(5, 2) DEFAULT 0;

-- Add comment explaining the fields
COMMENT ON COLUMN supplier_invoices."taxIncluded" IS 'Indica si el IVA está incluido en los precios de los items';
COMMENT ON COLUMN supplier_invoices."taxPercentage" IS 'Porcentaje de IVA aplicado (ej: 0, 5, 19)';
