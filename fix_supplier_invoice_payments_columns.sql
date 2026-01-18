-- ============================================================
-- MIGRACIÓN: Agregar/Arreglar columnas en supplier_invoice_payments
-- Fecha: 2026-01-18
-- Descripción: Asegura que todas las columnas necesarias existen
--              en formato camelCase (estrategia del proyecto)
-- ============================================================

\echo 'Aplicando migración: fix_supplier_invoice_payments_columns'

-- 1. Agregar paymentDate si no existe
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'supplier_invoice_payments' 
    AND column_name = 'paymentDate'
  ) THEN 
    ALTER TABLE supplier_invoice_payments 
    ADD COLUMN "paymentDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
    
    RAISE NOTICE '✓ Columna paymentDate agregada';
  ELSE
    RAISE NOTICE '✓ Columna paymentDate ya existe';
  END IF; 
END $$;

-- 2. Agregar paymentMethod si no existe
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'supplier_invoice_payments' 
    AND column_name = 'paymentMethod'
  ) THEN 
    -- Primero crear el tipo ENUM si no existe
    DO $inner$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_supplier_invoice_payments_paymentMethod') THEN
        CREATE TYPE "enum_supplier_invoice_payments_paymentMethod" AS ENUM (
          'CASH',
          'TRANSFER',
          'CHECK',
          'CREDIT_CARD',
          'DEBIT_CARD',
          'OTHER'
        );
      END IF;
    END $inner$;
    
    ALTER TABLE supplier_invoice_payments 
    ADD COLUMN "paymentMethod" "enum_supplier_invoice_payments_paymentMethod" NOT NULL DEFAULT 'TRANSFER';
    
    RAISE NOTICE '✓ Columna paymentMethod agregada';
  ELSE
    RAISE NOTICE '✓ Columna paymentMethod ya existe';
  END IF; 
END $$;

-- 3. Agregar reference si no existe
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'supplier_invoice_payments' 
    AND column_name = 'reference'
  ) THEN 
    ALTER TABLE supplier_invoice_payments 
    ADD COLUMN reference VARCHAR(255);
    
    RAISE NOTICE '✓ Columna reference agregada';
  ELSE
    RAISE NOTICE '✓ Columna reference ya existe';
  END IF; 
END $$;

-- 4. Agregar receipt si no existe
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'supplier_invoice_payments' 
    AND column_name = 'receipt'
  ) THEN 
    ALTER TABLE supplier_invoice_payments 
    ADD COLUMN receipt VARCHAR(255);
    
    RAISE NOTICE '✓ Columna receipt agregada';
  ELSE
    RAISE NOTICE '✓ Columna receipt ya existe';
  END IF; 
END $$;

-- 5. Agregar notes si no existe
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'supplier_invoice_payments' 
    AND column_name = 'notes'
  ) THEN 
    ALTER TABLE supplier_invoice_payments 
    ADD COLUMN notes TEXT;
    
    RAISE NOTICE '✓ Columna notes agregada';
  ELSE
    RAISE NOTICE '✓ Columna notes ya existe';
  END IF; 
END $$;

-- 6. Agregar createdBy si no existe
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'supplier_invoice_payments' 
    AND column_name = 'createdBy'
  ) THEN 
    ALTER TABLE supplier_invoice_payments 
    ADD COLUMN "createdBy" UUID NOT NULL REFERENCES users(id);
    
    RAISE NOTICE '✓ Columna createdBy agregada';
  ELSE
    RAISE NOTICE '✓ Columna createdBy ya existe';
  END IF; 
END $$;

-- 7. Renombrar columnas snake_case a camelCase si existen
-- (para bases de datos que fueron creadas con snake_case)
DO $$ 
BEGIN 
  -- payment_date -> paymentDate
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'supplier_invoice_payments' 
    AND column_name = 'payment_date'
  ) THEN 
    ALTER TABLE supplier_invoice_payments 
    RENAME COLUMN payment_date TO "paymentDate";
    
    RAISE NOTICE '✓ Columna payment_date renombrada a paymentDate';
  END IF;
  
  -- payment_method -> paymentMethod
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'supplier_invoice_payments' 
    AND column_name = 'payment_method'
  ) THEN 
    ALTER TABLE supplier_invoice_payments 
    RENAME COLUMN payment_method TO "paymentMethod";
    
    RAISE NOTICE '✓ Columna payment_method renombrada a paymentMethod';
  END IF;
  
  -- created_by -> createdBy
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'supplier_invoice_payments' 
    AND column_name = 'created_by'
  ) THEN 
    ALTER TABLE supplier_invoice_payments 
    RENAME COLUMN created_by TO "createdBy";
    
    RAISE NOTICE '✓ Columna created_by renombrada a createdBy';
  END IF;
END $$;

-- 8. Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_supplier_invoice_payments_invoice_id 
  ON supplier_invoice_payments("invoiceId");

CREATE INDEX IF NOT EXISTS idx_supplier_invoice_payments_business_id 
  ON supplier_invoice_payments("businessId");

CREATE INDEX IF NOT EXISTS idx_supplier_invoice_payments_payment_date 
  ON supplier_invoice_payments("paymentDate");

CREATE INDEX IF NOT EXISTS idx_supplier_invoice_payments_payment_method 
  ON supplier_invoice_payments("paymentMethod");

\echo ''
\echo '✅ Migración completada: supplier_invoice_payments'
\echo ''
