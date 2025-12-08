-- Agregar campo branch_id a la tabla appointments
-- Este campo es nullable inicialmente para permitir migración gradual

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- Índice para optimización de consultas por sucursal
CREATE INDEX IF NOT EXISTS idx_appointments_branch_id ON appointments(branch_id);

-- Comentarios en la columna
COMMENT ON COLUMN appointments.branch_id IS 'Referencia a la sucursal donde se realiza la cita (nullable para migración gradual)';