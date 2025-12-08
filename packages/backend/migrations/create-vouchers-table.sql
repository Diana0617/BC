-- Crear tabla de vouchers (cupones generados por cancelaciones)
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE,
  "businessId" UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  "customerId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "originalBookingId" UUID REFERENCES appointments(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'COP',
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'USED', 'EXPIRED', 'CANCELLED')),
  "issuedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "expiresAt" TIMESTAMP NOT NULL,
  "usedAt" TIMESTAMP,
  "usedInBookingId" UUID REFERENCES appointments(id) ON DELETE SET NULL,
  "cancelReason" TEXT,
  notes TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_vouchers_business_customer 
  ON vouchers("businessId", "customerId");

CREATE INDEX IF NOT EXISTS idx_vouchers_code 
  ON vouchers(code);

CREATE INDEX IF NOT EXISTS idx_vouchers_status_expires 
  ON vouchers(status, "expiresAt");

CREATE INDEX IF NOT EXISTS idx_vouchers_customer_status 
  ON vouchers("customerId", status);

-- Comentarios
COMMENT ON TABLE vouchers IS 'Vouchers generados por cancelación de citas';
COMMENT ON COLUMN vouchers.code IS 'Código único del voucher (ej: VCH-ABC123XYZ)';
COMMENT ON COLUMN vouchers.amount IS 'Valor del voucher en la moneda del negocio';
COMMENT ON COLUMN vouchers.status IS 'Estado del voucher: ACTIVE, USED, EXPIRED, CANCELLED';
COMMENT ON COLUMN vouchers."issuedAt" IS 'Fecha de emisión del voucher';
COMMENT ON COLUMN vouchers."expiresAt" IS 'Fecha de expiración del voucher';
COMMENT ON COLUMN vouchers."usedAt" IS 'Fecha en que se usó el voucher';
