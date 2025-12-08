-- Crear tabla de bloqueos de clientes
CREATE TABLE IF NOT EXISTS customer_booking_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "businessId" UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  "customerId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'LIFTED', 'EXPIRED')),
  reason VARCHAR(50) NOT NULL DEFAULT 'EXCESSIVE_CANCELLATIONS' CHECK (reason IN ('EXCESSIVE_CANCELLATIONS', 'MANUAL', 'NO_SHOW', 'OTHER')),
  "blockedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "expiresAt" TIMESTAMP NOT NULL,
  "liftedAt" TIMESTAMP,
  "liftedBy" UUID REFERENCES users(id) ON DELETE SET NULL,
  "cancellationCount" INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_customer_blocks_business_customer_status 
  ON customer_booking_blocks("businessId", "customerId", status);

CREATE INDEX IF NOT EXISTS idx_customer_blocks_customer_status_expires 
  ON customer_booking_blocks("customerId", status, "expiresAt");

CREATE INDEX IF NOT EXISTS idx_customer_blocks_status_expires 
  ON customer_booking_blocks(status, "expiresAt");

-- Comentarios
COMMENT ON TABLE customer_booking_blocks IS 'Bloqueos temporales de acceso a agenda por exceso de cancelaciones';
COMMENT ON COLUMN customer_booking_blocks.status IS 'Estado del bloqueo: ACTIVE, LIFTED, EXPIRED';
COMMENT ON COLUMN customer_booking_blocks.reason IS 'Razón del bloqueo: EXCESSIVE_CANCELLATIONS, MANUAL, NO_SHOW, OTHER';
COMMENT ON COLUMN customer_booking_blocks."blockedAt" IS 'Fecha de inicio del bloqueo';
COMMENT ON COLUMN customer_booking_blocks."expiresAt" IS 'Fecha de fin del bloqueo';
COMMENT ON COLUMN customer_booking_blocks."liftedAt" IS 'Fecha en que se levantó el bloqueo manualmente';
COMMENT ON COLUMN customer_booking_blocks."cancellationCount" IS 'Número de cancelaciones que causaron el bloqueo';
