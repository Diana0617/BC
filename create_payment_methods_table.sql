-- ============================================================
-- CREAR TABLA payment_methods EN AZURE POSTGRESQL
-- ============================================================

\echo '========================================='
\echo ' CREANDO TABLA payment_methods'
\echo '========================================='
\echo ''

BEGIN;

-- Crear ENUM para tipos de pago
DO $$ BEGIN
    CREATE TYPE "enum_payment_methods_type" AS ENUM ('CASH', 'CARD', 'TRANSFER', 'QR', 'ONLINE', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Crear tabla payment_methods
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type "enum_payment_methods_type" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiresProof" BOOLEAN NOT NULL DEFAULT false,
    icon VARCHAR(50),
    "bankInfo" JSONB,
    "qrInfo" JSONB,
    metadata JSONB,
    "order" INTEGER,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_payment_methods_business_id 
    ON payment_methods("businessId");

CREATE INDEX IF NOT EXISTS idx_payment_methods_business_active 
    ON payment_methods("businessId", "isActive");

CREATE INDEX IF NOT EXISTS idx_payment_methods_type 
    ON payment_methods(type);

-- Comentarios
COMMENT ON TABLE payment_methods IS 'Métodos de pago configurables por negocio';
COMMENT ON COLUMN payment_methods.name IS 'Nombre del método de pago (ej: "Efectivo", "Yape", "Transferencia Bancolombia")';
COMMENT ON COLUMN payment_methods.type IS 'Tipo de método de pago';
COMMENT ON COLUMN payment_methods."requiresProof" IS 'Si requiere comprobante de pago';
COMMENT ON COLUMN payment_methods.icon IS 'Nombre del ícono';
COMMENT ON COLUMN payment_methods."bankInfo" IS 'Información bancaria para transferencias';
COMMENT ON COLUMN payment_methods."qrInfo" IS 'Información para pagos QR (Yape, Plin, etc)';
COMMENT ON COLUMN payment_methods.metadata IS 'Información adicional del método';
COMMENT ON COLUMN payment_methods."order" IS 'Orden de visualización';

\echo '✅ Tabla payment_methods creada'
\echo ''
\echo 'VERIFICANDO:'
SELECT 
    tablename, 
    schemaname 
FROM pg_tables 
WHERE tablename = 'payment_methods';

\echo ''
\echo '========================================='
\echo ' TABLA CREADA EXITOSAMENTE'
\echo '========================================='

COMMIT;
