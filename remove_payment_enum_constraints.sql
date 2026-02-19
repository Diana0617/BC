-- ================================================================
-- MIGRACIÓN: Eliminar ENUMs hardcodeados de métodos de pago
-- ================================================================
-- 
-- Problema: Los negocios crean métodos de pago personalizados pero 
--           las columnas con ENUM solo aceptan valores predefinidos
-- 
-- Solución: Cambiar columnas ENUM a VARCHAR para permitir valores personalizados
--
-- IMPORTANTE: Ejecutar en orden y verificar cada paso
-- ================================================================

BEGIN;

-- ================================================================
-- 1. TABLA: receipts - Cambiar payment_method de ENUM a VARCHAR
-- ================================================================

DO $$
BEGIN
  -- Verificar si la columna existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'receipts' 
    AND column_name = 'payment_method'
  ) THEN
    
    RAISE NOTICE 'Migrando receipts.payment_method...';
    
    -- 1a. Crear columna temporal
    ALTER TABLE receipts ADD COLUMN IF NOT EXISTS payment_method_temp VARCHAR(50);
    
    -- 1b. Copiar datos
    UPDATE receipts SET payment_method_temp = payment_method::text;
    
    -- 1c. Eliminar columna anterior
    ALTER TABLE receipts DROP COLUMN payment_method;
    
    -- 1d. Renombrar temporal
    ALTER TABLE receipts RENAME COLUMN payment_method_temp TO payment_method;
    
    -- 1e. Aplicar NOT NULL
    ALTER TABLE receipts ALTER COLUMN payment_method SET NOT NULL;
    
    RAISE NOTICE '✅ receipts.payment_method migrada exitosamente';
  ELSE
    RAISE NOTICE '⚠️ receipts.payment_method no existe, saltando';
  END IF;
END $$;

-- ================================================================
-- 2. TABLA: sales - Cambiar payment_method de ENUM a VARCHAR
-- ================================================================

DO $$
BEGIN
  -- Verificar si la columna existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' 
    AND column_name = 'payment_method'
  ) THEN
    
    RAISE NOTICE 'Migrando sales.payment_method...';
    
    -- 2a. Crear columna temporal
    ALTER TABLE sales ADD COLUMN IF NOT EXISTS payment_method_temp VARCHAR(50);
    
    -- 2b. Copiar datos
    UPDATE sales SET payment_method_temp = payment_method::text;
    
    -- 2c. Eliminar columna anterior
    ALTER TABLE sales DROP COLUMN payment_method;
    
    -- 2d. Renombrar temporal
    ALTER TABLE sales RENAME COLUMN payment_method_temp TO payment_method;
    
    -- 2e. Aplicar NOT NULL con default
    ALTER TABLE sales ALTER COLUMN payment_method SET NOT NULL;
    ALTER TABLE sales ALTER COLUMN payment_method SET DEFAULT 'CASH';
    
    RAISE NOTICE '✅ sales.payment_method migrada exitosamente';
  ELSE
    RAISE NOTICE '⚠️ sales.payment_method no existe, saltando';
  END IF;
END $$;

-- ================================================================
-- 3. LIMPIAR TIPOS ENUM NO USADOS (Opcional - solo si no se usan en otras tablas)
-- ================================================================

-- Comentado por seguridad - descomentar solo si estás seguro
-- DROP TYPE IF EXISTS "enum_receipts_payment_method" CASCADE;
-- DROP TYPE IF EXISTS "enum_sales_payment_method" CASCADE;

-- ================================================================
-- 4. VERIFICACIÓN
-- ================================================================

-- Verificar tipos de datos actuales
SELECT 
  table_name,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name IN ('receipts', 'sales')
  AND column_name = 'payment_method'
ORDER BY table_name;

-- Contar registros afectados
SELECT 
  'receipts' as tabla,
  COUNT(*) as total_registros,
  COUNT(DISTINCT payment_method) as metodos_unicos,
  array_agg(DISTINCT payment_method) as metodos
FROM receipts
UNION ALL
SELECT 
  'sales' as tabla,
  COUNT(*) as total_registros,
  COUNT(DISTINCT payment_method) as metodos_unicos,
  array_agg(DISTINCT payment_method) as metodos
FROM sales;

-- Si todo está OK, confirmar
COMMIT;

-- Si hay algún problema, revertir
-- ROLLBACK;

-- ================================================================
-- NOTAS POST-MIGRACIÓN
-- ================================================================
-- 
-- 1. Los métodos de pago ahora aceptan cualquier valor STRING
-- 2. La validación se hace contra la tabla payment_methods del negocio
-- 3. Los valores anteriores (CASH, CARD, TRANSFER, etc.) se mantienen
-- 4. Nuevos valores personalizados se pueden guardar sin problemas
-- 5. El modelo PaymentMethod.type sigue usando ENUM (correcto)
--
-- ================================================================
