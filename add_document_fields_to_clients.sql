-- Agregar campos de documento a la tabla clients
-- Ejecutar en: beautycontrol database

BEGIN;

-- Agregar columna documentType
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS "documentType" VARCHAR(50);

-- Agregar columna documentNumber  
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS "documentNumber" VARCHAR(50);

-- Agregar comentarios
COMMENT ON COLUMN clients."documentType" IS 'Tipo de documento: DNI, Pasaporte, Cédula, RUT, etc. (flexible para multi-país)';
COMMENT ON COLUMN clients."documentNumber" IS 'Número de documento (sin validación de formato específico)';

COMMIT;

-- Verificar que se agregaron las columnas
SELECT column_name, data_type, is_nullable, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'clients' 
  AND column_name IN ('documentType', 'documentNumber');
