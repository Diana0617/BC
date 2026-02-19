-- Verificar schema de la tabla receipts en Azure
-- Ejecutar en Azure Data Studio conectado a beautycontrol-db.postgres.database.azure.com

-- Ver todas las columnas de la tabla receipts
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'receipts'
ORDER BY ordinal_position;

-- Ver constraints
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public' 
  AND tc.table_name = 'receipts';
