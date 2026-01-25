-- Hacer userId nullable en la tabla receipts
-- Este campo no debe referenciar al cliente (que está en tabla clients)
-- sino al usuario que registró el pago (opcional)

BEGIN;

-- Modificar la columna userId para permitir NULL
ALTER TABLE receipts 
  ALTER COLUMN "userId" DROP NOT NULL;

-- Actualizar el comentario de la columna para reflejar su propósito correcto
COMMENT ON COLUMN receipts."userId" IS 'Usuario que registró el pago (opcional, distinto del cliente)';

-- Actualizar los registros existentes que tengan userId inválido (que no exista en users)
-- Establecerlos como NULL
UPDATE receipts 
SET "userId" = NULL 
WHERE "userId" NOT IN (SELECT id FROM users);

COMMIT;

-- Verificar el cambio
SELECT 
  column_name, 
  is_nullable, 
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'receipts' 
  AND column_name = 'userId';

-- Contar cuántos receipts tienen userId NULL vs no NULL
SELECT 
  COUNT(*) FILTER (WHERE "userId" IS NULL) as sin_usuario,
  COUNT(*) FILTER (WHERE "userId" IS NOT NULL) as con_usuario,
  COUNT(*) as total
FROM receipts;
