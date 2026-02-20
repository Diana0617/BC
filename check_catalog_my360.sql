-- Verificar si ya existe MY360 en el catálogo de proveedores
SELECT 
  id,
  "businessId",
  "supplierId",
  "productId",
  "supplierSku",
  name,
  price,
  available,
  "createdAt"
FROM supplier_catalog_items
WHERE "businessId" = '5c99c297-ee8b-4d43-aee1-72f6dfa6e070'
  AND "supplierSku" = 'MY360';
