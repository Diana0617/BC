-- Ver todas las columnas de la tabla receipts
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    character_maximum_length,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'receipts'
ORDER BY ordinal_position;
