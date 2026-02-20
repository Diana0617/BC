-- Consultar producto MY360
SELECT 
  id,
  name,
  sku,
  category,
  brand,
  price,
  cost,
  "trackInventory",
  "isActive",
  "createdAt"
FROM products
WHERE sku = 'MY360'
  AND "businessId" = '5c99c297-ee8b-4d43-aee1-72f6dfa6e070';

-- Ver el stock por sucursal de este producto
SELECT 
  bs.id,
  bs."currentStock",
  bs."minStock",
  bs."maxStock",
  bs."lastCountDate",
  b.name as branch_name,
  b.id as branch_id
FROM branch_stocks bs
LEFT JOIN branches b ON bs."branchId" = b.id
LEFT JOIN products p ON bs."productId" = p.id
WHERE p.sku = 'MY360'
  AND p."businessId" = '5c99c297-ee8b-4d43-aee1-72f6dfa6e070';

-- Ver movimientos recientes de este producto
SELECT 
  im.id,
  im."movementType",
  im.quantity,
  im."unitCost",
  im."previousStock",
  im."newStock",
  im."createdAt",
  b.name as branch_name
FROM inventory_movements im
LEFT JOIN products p ON im."productId" = p.id
LEFT JOIN branches b ON im."branchId" = b.id
WHERE p.sku = 'MY360'
  AND p."businessId" = '5c99c297-ee8b-4d43-aee1-72f6dfa6e070'
ORDER BY im."createdAt" DESC
LIMIT 5;
