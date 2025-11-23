-- ============================================
-- SCRIPT PARA BACKFILL DE MOVIMIENTOS DE INVENTARIO
-- Crea movimientos para las facturas existentes que no los tienen
-- ============================================

-- Información de las facturas PAID existentes:
-- 1. Invoice 5a85aad7-0e64-45cd-b1bf-7c26f66f1c0e (F123232): 100 unidades shampoo
-- 2. Invoice 7209ad5e-9a83-404c-a925-a2dd7ecc9a06 (G0321): 20 unidades Acondicionador + 15 unidades shampoo

-- IDs necesarios:
-- businessId: d7af77b9-09cf-4d6b-b159-6249be87935e
-- userId: (necesitas obtener un userId válido de tu negocio)
-- Product IDs:
--   - Shampoo: 0abc1181-f400-4c06-8ae4-88c876c575fa
--   - Acondicionador: d92e652f-5a76-4aa3-a8c5-7e0a61f7cee6

-- ============================================
-- PASO 1: Obtener userId válido
-- ============================================
SELECT id, name, email 
FROM users 
WHERE "businessId" = 'd7af77b9-09cf-4d6b-b159-6249be87935e' 
LIMIT 1;

-- Reemplaza 'YOUR_USER_ID' con el ID obtenido arriba

-- ============================================
-- PASO 2: Crear movimiento para Factura F123232 (100 unidades shampoo)
-- ============================================
INSERT INTO inventory_movements (
  id,
  "businessId",
  "productId",
  "userId",
  "movementType",
  quantity,
  "unitCost",
  "totalCost",
  "previousStock",
  "newStock",
  reason,
  notes,
  "referenceId",
  "referenceType",
  "supplierInfo",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'd7af77b9-09cf-4d6b-b159-6249be87935e',
  '0abc1181-f400-4c06-8ae4-88c876c575fa', -- Shampoo
  'YOUR_USER_ID', -- ⚠️ REEMPLAZAR CON userId REAL
  'PURCHASE',
  100, -- Cantidad positiva (entrada)
  0, -- No sabemos el costo unitario original
  0, -- No sabemos el total
  0, -- Stock previo
  100, -- Stock nuevo
  'Entrada por factura F123232',
  'Backfill: Factura cargada antes de implementar movimientos automáticos',
  '5a85aad7-0e64-45cd-b1bf-7c26f66f1c0e', -- ID de la factura
  'SUPPLIER_INVOICE',
  '{"invoiceNumber": "F123232"}',
  NOW(),
  NOW()
);

-- ============================================
-- PASO 3: Crear movimientos para Factura G0321 (20 Acondicionador + 15 shampoo)
-- ============================================

-- 3.1: 20 unidades Acondicionador
INSERT INTO inventory_movements (
  id,
  "businessId",
  "productId",
  "userId",
  "movementType",
  quantity,
  "unitCost",
  "totalCost",
  "previousStock",
  "newStock",
  reason,
  notes,
  "referenceId",
  "referenceType",
  "supplierInfo",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'd7af77b9-09cf-4d6b-b159-6249be87935e',
  'd92e652f-5a76-4aa3-a8c5-7e0a61f7cee6', -- Acondicionador
  'YOUR_USER_ID', -- ⚠️ REEMPLAZAR CON userId REAL
  'PURCHASE',
  20,
  0,
  0,
  0,
  20,
  'Entrada por factura G0321',
  'Backfill: Factura cargada antes de implementar movimientos automáticos',
  '7209ad5e-9a83-404c-a925-a2dd7ecc9a06',
  'SUPPLIER_INVOICE',
  '{"invoiceNumber": "G0321"}',
  NOW(),
  NOW()
);

-- 3.2: 15 unidades shampoo
INSERT INTO inventory_movements (
  id,
  "businessId",
  "productId",
  "userId",
  "movementType",
  quantity,
  "unitCost",
  "totalCost",
  "previousStock",
  "newStock",
  reason,
  notes,
  "referenceId",
  "referenceType",
  "supplierInfo",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'd7af77b9-09cf-4d6b-b159-6249be87935e',
  '0abc1181-f400-4c06-8ae4-88c876c575fa', -- Shampoo
  'YOUR_USER_ID', -- ⚠️ REEMPLAZAR CON userId REAL
  'PURCHASE',
  15,
  0,
  0,
  100, -- Stock previo (tenía 100 de la otra factura)
  115, -- Stock nuevo
  'Entrada por factura G0321',
  'Backfill: Factura cargada antes de implementar movimientos automáticos',
  '7209ad5e-9a83-404c-a925-a2dd7ecc9a06',
  'SUPPLIER_INVOICE',
  '{"invoiceNumber": "G0321"}',
  NOW(),
  NOW()
);

-- ============================================
-- PASO 4: Actualizar el stock en la tabla products
-- ============================================

-- Shampoo: 100 (F123232) + 15 (G0321) = 115 unidades
UPDATE products 
SET "currentStock" = 115,
    "updatedAt" = NOW()
WHERE id = '0abc1181-f400-4c06-8ae4-88c876c575fa'
  AND "businessId" = 'd7af77b9-09cf-4d6b-b159-6249be87935e';

-- Acondicionador: 20 unidades (G0321)
UPDATE products 
SET "currentStock" = 20,
    "updatedAt" = NOW()
WHERE id = 'd92e652f-5a76-4aa3-a8c5-7e0a61f7cee6'
  AND "businessId" = 'd7af77b9-09cf-4d6b-b159-6249be87935e';

-- ============================================
-- PASO 5: Verificar resultados
-- ============================================

-- Ver movimientos creados
SELECT 
  "movementType",
  quantity,
  "previousStock",
  "newStock",
  reason,
  "referenceId",
  "createdAt"
FROM inventory_movements
WHERE "businessId" = 'd7af77b9-09cf-4d6b-b159-6249be87935e'
ORDER BY "createdAt" DESC;

-- Ver stock actualizado
SELECT 
  name,
  sku,
  "currentStock"
FROM products
WHERE "businessId" = 'd7af77b9-09cf-4d6b-b159-6249be87935e'
  AND "currentStock" > 0
ORDER BY name;

-- Contar total de movimientos
SELECT COUNT(*) as total_movimientos
FROM inventory_movements
WHERE "businessId" = 'd7af77b9-09cf-4d6b-b159-6249be87935e';
