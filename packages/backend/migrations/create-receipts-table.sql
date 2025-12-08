-- Migración para crear la tabla de recibos
-- Ejecutar después de crear el modelo Receipt.js

CREATE TABLE IF NOT EXISTS receipts (
  id SERIAL PRIMARY KEY,
  
  -- Numeración secuencial por negocio
  receipt_number VARCHAR(20) NOT NULL UNIQUE,
  sequence_number INTEGER NOT NULL,
  
  -- Relaciones principales
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE RESTRICT,
  specialist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  
  -- Información del especialista (desnormalizada para histórico)
  specialist_name VARCHAR(100) NOT NULL,
  specialist_code VARCHAR(20),
  
  -- Información del cliente (desnormalizada para histórico)
  client_name VARCHAR(100) NOT NULL,
  client_phone VARCHAR(20),
  client_email VARCHAR(100),
  
  -- Fechas y horarios
  service_date DATE NOT NULL,
  service_time TIME NOT NULL,
  issue_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Información del servicio
  service_name VARCHAR(200) NOT NULL,
  service_description TEXT,
  
  -- Información financiera
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tip DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Información del pago
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('CASH', 'CARD', 'TRANSFER', 'WOMPI', 'OTHER')),
  payment_reference VARCHAR(100),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'PAID' CHECK (payment_status IN ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED')),
  
  -- Estado del recibo
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED', 'REFUNDED')),
  
  -- Información de envío
  sent_via_email BOOLEAN NOT NULL DEFAULT FALSE,
  sent_via_whatsapp BOOLEAN NOT NULL DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  whatsapp_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadatos adicionales (JSONB para PostgreSQL)
  metadata JSONB,
  
  -- Campos de auditoría
  created_by INTEGER REFERENCES users(id),
  notes TEXT,
  
  -- Timestamps estándar
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE -- Para soft delete
);

-- Índices para optimizar consultas
CREATE UNIQUE INDEX receipts_business_sequence_unique ON receipts (business_id, sequence_number) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX receipts_number_unique ON receipts (receipt_number) WHERE deleted_at IS NULL;
CREATE INDEX receipts_business_service_date_idx ON receipts (business_id, service_date) WHERE deleted_at IS NULL;
CREATE INDEX receipts_specialist_service_date_idx ON receipts (specialist_id, service_date) WHERE deleted_at IS NULL;
CREATE INDEX receipts_appointment_idx ON receipts (appointment_id) WHERE deleted_at IS NULL;
CREATE INDEX receipts_payment_reference_idx ON receipts (payment_reference) WHERE deleted_at IS NULL;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_receipts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER receipts_updated_at_trigger
  BEFORE UPDATE ON receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_receipts_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE receipts IS 'Recibos de pago con numeración secuencial por negocio';
COMMENT ON COLUMN receipts.receipt_number IS 'Número de recibo secuencial por negocio (ej: REC-2024-00001)';
COMMENT ON COLUMN receipts.sequence_number IS 'Número secuencial interno para el negocio';
COMMENT ON COLUMN receipts.specialist_name IS 'Nombre completo del especialista al momento del recibo';
COMMENT ON COLUMN receipts.metadata IS 'Información adicional del recibo (comisiones, reglas aplicadas, etc.)';