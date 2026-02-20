-- Ver todos los productos del business
SELECT 
  id,
  name,
  sku,
  category,
  brand,
  price,
  cost,
  "trackInventory",
  "isActive"
FROM products
WHERE "businessId" = '5c99c297-ee8b-4d43-aee1-72f6dfa6e070'
ORDER BY "createdAt" DESC
LIMIT 20;
