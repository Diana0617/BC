-- ================================================
-- MIGRACIÓN PRODUCCIÓN: Agregar transactionDate
-- Base de datos: Azure PostgreSQL (beautycontrol-db)
-- Fecha: 2026-01-13
-- ================================================

-- 1. Agregar columna transactionDate
ALTER TABLE financial_movements 
ADD COLUMN IF NOT EXISTS "transactionDate" DATE NOT NULL DEFAULT CURRENT_DATE;

COMMENT ON COLUMN financial_movements."transactionDate" 
IS 'Fecha real de la transacción (no la fecha de creación del registro)';

-- 2. Crear índice para optimizar consultas por fecha
CREATE INDEX IF NOT EXISTS idx_financial_movements_transaction_date 
ON financial_movements ("businessId", "transactionDate" DESC);

-- 3. Actualizar registros existentes: usar createdAt como base inicial
UPDATE financial_movements 
SET "transactionDate" = DATE("createdAt")
WHERE "transactionDate" IS NULL OR "transactionDate" = CURRENT_DATE;

-- 4. Actualizar appointments para usar la fecha del turno
UPDATE financial_movements fm
SET "transactionDate" = DATE(a."startTime")
FROM appointments a
WHERE 
  fm.category = 'APPOINTMENT' 
  AND fm."referenceType" = 'APPOINTMENT'
  AND fm."referenceId" = a.id;

-- 5. Verificar resultados
SELECT 
  'TOTAL' as tipo,
  COUNT(*) as cantidad,
  MIN("transactionDate") as fecha_min,
  MAX("transactionDate") as fecha_max
FROM financial_movements

UNION ALL

SELECT 
  category as tipo,
  COUNT(*) as cantidad,
  MIN("transactionDate") as fecha_min,
  MAX("transactionDate") as fecha_max
FROM financial_movements
GROUP BY category
ORDER BY tipo;

-- Fin de la migración
SELECT '✅ Migración completada exitosamente' as resultado;