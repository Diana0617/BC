-- ============================================
-- SOLUCIÓN PARA RECIBOS DUPLICADOS
-- Business ID: f97e749b-36d3-48bd-b82f-42cd6f23ed86
-- ============================================

-- 1. VER TODOS LOS RECIBOS DUPLICADOS
SELECT 
    "receiptNumber",
    COUNT(*) as cantidad,
    STRING_AGG(id::text, ', ') as ids,
    MIN("createdAt") as primer_creado,
    MAX("createdAt") as ultimo_creado
FROM 
    receipts
WHERE 
    "businessId" = 'f97e749b-36d3-48bd-b82f-42cd6f23ed86'
    AND "deletedAt" IS NULL
GROUP BY 
    "receiptNumber"
HAVING 
    COUNT(*) > 1
ORDER BY 
    "receiptNumber";

-- 2. VER DETALLES DE LOS RECIBOS CON NÚMERO REC-2026-00001
SELECT 
    id,
    "receiptNumber",
    "sequenceNumber",
    "saleId",
    "appointmentId",
    "totalAmount",
    status,
    "createdAt"
FROM 
    receipts
WHERE 
    "businessId" = 'f97e749b-36d3-48bd-b82f-42cd6f23ed86'
    AND "receiptNumber" = 'REC-2026-00001'
    AND "deletedAt" IS NULL
ORDER BY 
    "createdAt";

-- 3. VER VENTAS ASOCIADAS A ESTOS RECIBOS
SELECT 
    r.id as receipt_id,
    r."receiptNumber",
    r."saleId",
    s."saleNumber",
    s.total,
    s.status as sale_status,
    s."createdAt" as sale_created
FROM 
    receipts r
LEFT JOIN 
    sales s ON r."saleId" = s.id
WHERE 
    r."businessId" = 'f97e749b-36d3-48bd-b82f-42cd6f23ed86'
    AND r."receiptNumber" = 'REC-2026-00001'
    AND r."deletedAt" IS NULL
ORDER BY 
    r."createdAt";

-- ============================================
-- OPCIÓN A: ELIMINAR DUPLICADOS (SOFT DELETE)
-- Mantener solo el primer recibo creado
-- ============================================

-- PRECAUCIÓN: Ejecuta esto solo si quieres eliminar los duplicados
-- Esto hará soft delete de los recibos duplicados, manteniendo el primero

/*
UPDATE receipts
SET 
    "deletedAt" = NOW(),
    "updatedAt" = NOW()
WHERE 
    "businessId" = 'f97e749b-36d3-48bd-b82f-42cd6f23ed86'
    AND "receiptNumber" = 'REC-2026-00001'
    AND id NOT IN (
        SELECT id 
        FROM receipts 
        WHERE "businessId" = 'f97e749b-36d3-48bd-b82f-42cd6f23ed86'
          AND "receiptNumber" = 'REC-2026-00001'
          AND "deletedAt" IS NULL
        ORDER BY "createdAt" ASC
        LIMIT 1
    )
    AND "deletedAt" IS NULL;
*/

-- ============================================
-- OPCIÓN B: RENUMERAR DUPLICADOS
-- Asignar nuevos números consecutivos
-- ============================================

-- Ver el último número de secuencia usado
SELECT 
    MAX("sequenceNumber") as ultimo_numero
FROM 
    receipts
WHERE 
    "businessId" = 'f97e749b-36d3-48bd-b82f-42cd6f23ed86'
    AND EXTRACT(YEAR FROM "createdAt") = 2026
    AND "deletedAt" IS NULL;

-- PRECAUCIÓN: Ejecuta esto solo si quieres renumerar
-- Esta query actualizará los recibos duplicados con nuevos números

/*
WITH duplicates AS (
    SELECT 
        id,
        "receiptNumber",
        ROW_NUMBER() OVER (
            PARTITION BY "receiptNumber" 
            ORDER BY "createdAt"
        ) as row_num,
        (
            SELECT MAX("sequenceNumber") 
            FROM receipts 
            WHERE "businessId" = 'f97e749b-36d3-48bd-b82f-42cd6f23ed86'
              AND EXTRACT(YEAR FROM "createdAt") = 2026
        ) as max_seq
    FROM 
        receipts
    WHERE 
        "businessId" = 'f97e749b-36d3-48bd-b82f-42cd6f23ed86'
        AND "receiptNumber" = 'REC-2026-00001'
        AND "deletedAt" IS NULL
)
UPDATE receipts r
SET 
    "sequenceNumber" = d.max_seq + d.row_num,
    "receiptNumber" = 'REC-2026-' || LPAD((d.max_seq + d.row_num)::text, 5, '0'),
    "updatedAt" = NOW()
FROM duplicates d
WHERE 
    r.id = d.id
    AND d.row_num > 1;  -- Solo actualizar los duplicados, no el primero
*/

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Verificar que ya no hay duplicados
SELECT 
    "receiptNumber",
    COUNT(*) as cantidad
FROM 
    receipts
WHERE 
    "businessId" = 'f97e749b-36d3-48bd-b82f-42cd6f23ed86'
    AND "deletedAt" IS NULL
GROUP BY 
    "receiptNumber"
HAVING 
    COUNT(*) > 1;

-- Ver todos los recibos del negocio ordenados
SELECT 
    id,
    "receiptNumber",
    "sequenceNumber",
    "totalAmount",
    status,
    "createdAt"
FROM 
    receipts
WHERE 
    "businessId" = 'f97e749b-36d3-48bd-b82f-42cd6f23ed86'
    AND "deletedAt" IS NULL
ORDER BY 
    "sequenceNumber", "createdAt";
