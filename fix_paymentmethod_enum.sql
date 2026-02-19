-- ====================================================================
-- Cambiar paymentMethod de ENUM a VARCHAR en financial_movements
-- ====================================================================
-- RAZÓN: Cada negocio tiene payment_methods personalizados, 
--        no podemos limitar a valores ENUM fijos
-- ====================================================================

BEGIN;

-- 1. Agregar columna temporal VARCHAR
ALTER TABLE financial_movements 
ADD COLUMN "paymentMethod_temp" VARCHAR(50);

-- 2. Copiar datos del ENUM a VARCHAR (convertir a texto)
UPDATE financial_movements 
SET "paymentMethod_temp" = "paymentMethod"::text;

-- 3. Eliminar columna ENUM original
ALTER TABLE financial_movements 
DROP COLUMN "paymentMethod";

-- 4. Renombrar columna temporal
ALTER TABLE financial_movements 
RENAME COLUMN "paymentMethod_temp" TO "paymentMethod";

-- 5. Hacer NOT NULL (mantener constraint)
ALTER TABLE financial_movements 
ALTER COLUMN "paymentMethod" SET NOT NULL;

-- 6. Eliminar tipo ENUM (si no está en uso en otras tablas)
DROP TYPE IF EXISTS "enum_financial_movements_paymentMethod" CASCADE;

COMMIT;

-- Verificar resultado
SELECT "paymentMethod", COUNT(*) 
FROM financial_movements 
GROUP BY "paymentMethod";
