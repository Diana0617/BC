-- Verificar todos los productos MY360 creados
SELECT 
  id,
  name,
  sku,
  category,
  brand,
  price,
  cost,
  "currentStock",
  "isActive",
  "createdAt"
FROM products
WHERE "businessId" = '5c99c297-ee8b-4d43-aee1-72f6dfa6e070'
  AND sku = 'MY360'
ORDER BY "createdAt" DESC;

-- Ver todos los items en catálogo con SKU MY360
SELECT 
  sci.id,
  sci."supplierSku",
  sci.name,
  sci.price,
  sci."productId",
  s.name as supplier_name,
  sci."createdAt"
FROM supplier_catalog_items sci
LEFT JOIN suppliers s ON s.id = sci."supplierId"
WHERE sci."businessId" = '5c99c297-ee8b-4d43-aee1-72f6dfa6e070'
  AND sci."supplierSku" = 'MY360'
ORDER BY sci."createdAt" DESC;
