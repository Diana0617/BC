-- Agregar columna transactionDate a la tabla financial_movements (usando camelCase de Sequelize)
ALTER TABLE financial_movements 
ADD COLUMN IF NOT EXISTS "transactionDate" DATE NOT NULL DEFAULT CURRENT_DATE;

-- Comentario para documentar el campo
COMMENT ON COLUMN financial_movements."transactionDate" IS 'Fecha real de la transacción (no la fecha de creación del registro)';

-- Crear índice para optimizar consultas por fecha de transacción
CREATE INDEX IF NOT EXISTS idx_financial_movements_transaction_date 
ON financial_movements ("businessId", "transactionDate" DESC);

-- Actualizar registros existentes: usar createdAt como transactionDate inicial
UPDATE financial_movements 
SET "transactionDate" = DATE("createdAt")
WHERE "transactionDate" IS NULL OR "transactionDate" = CURRENT_DATE;

-- Verificar que se aplicó correctamente
SELECT COUNT(*), MIN("transactionDate"), MAX("transactionDate") 
FROM financial_movements;
