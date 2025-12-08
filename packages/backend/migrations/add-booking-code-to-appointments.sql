-- Agregar campo bookingCode a la tabla appointments
-- Código único para reservas públicas

-- Agregar la columna si no existe
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS "bookingCode" VARCHAR(255);

-- Agregar el comentario
COMMENT ON COLUMN appointments."bookingCode" IS 'Código único para reservas públicas';

-- Crear el índice único (esto crea automáticamente la constraint)
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_booking_code_unique
ON appointments ("bookingCode")
WHERE "bookingCode" IS NOT NULL;