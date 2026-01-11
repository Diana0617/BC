-- Verificar nombre de las tablas relacionadas con clientes
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%client%'
ORDER BY tablename;
