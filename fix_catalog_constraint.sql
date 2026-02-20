-- Cambiar constraint UNIQUE en supplier_catalog_items
-- Permitir mismo SKU de diferentes proveedores

BEGIN;

-- 1. Eliminar constraint UNIQUE actual (businessId, supplierSku)
ALTER TABLE supplier_catalog_items 
  DROP CONSTRAINT IF EXISTS unique_business_sku;

-- 2. Crear nuevo constraint UNIQUE (businessId, supplierId, supplierSku)
-- Permite mismo SKU de diferentes proveedores
ALTER TABLE supplier_catalog_items 
  ADD CONSTRAINT unique_business_supplier_sku 
  UNIQUE ("businessId", "supplierId", "supplierSku");

COMMIT;

-- Verificar el cambio
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE conrelid = 'supplier_catalog_items'::regclass
  AND contype = 'u';
