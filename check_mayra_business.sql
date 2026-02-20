-- Buscar el business "Importaciones Mayra" (el que aparece en la imagen)
SELECT 
  id,
  name,
  email,
  "isActive",
  "createdAt"
FROM businesses
WHERE name ILIKE '%mayra%' OR name ILIKE '%importaciones%';

-- Buscar usuarios de ese business
SELECT 
  u.id,
  u."firstName",
  u."lastName",
  u.email,
  u.role,
  u."businessId",
  b.name as business_name
FROM users u
LEFT JOIN businesses b ON u."businessId" = b.id
WHERE b.name ILIKE '%mayra%' OR b.name ILIKE '%importaciones%';

-- Contar productos de cada business
SELECT 
  b.id,
  b.name,
  COUNT(p.id) as total_productos
FROM businesses b
LEFT JOIN products p ON p."businessId" = b.id
GROUP BY b.id, b.name
ORDER BY b.name;
