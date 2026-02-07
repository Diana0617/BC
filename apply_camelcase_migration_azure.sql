-- ============================================================
-- MIGRACIÓN DE TIMESTAMPS A CAMELCASE EN AZURE POSTGRESQL
-- ============================================================
-- Fecha: 2026-02-07
-- Base de datos: beautycontrol-db.postgres.database.azure.com
-- Ambiente: PRODUCCIÓN
-- Propósito: Normalizar columnas created_at/updated_at a createdAt/updatedAt
-- 
-- VERIFICACIÓN PREVIA COMPLETADA:
-- ✅ permissions: 36 registros
-- ✅ role_default_permissions: 10 registros  
-- ✅ user_business_permissions: 13 registros
-- ============================================================

-- Iniciar transacción para poder hacer rollback si algo falla
BEGIN;

-- ============================================================
-- TABLA: permissions
-- ============================================================
ALTER TABLE permissions 
  RENAME COLUMN created_at TO "createdAt";

ALTER TABLE permissions 
  RENAME COLUMN updated_at TO "updatedAt";

-- ============================================================
-- TABLA: role_default_permissions
-- ============================================================
ALTER TABLE role_default_permissions 
  RENAME COLUMN created_at TO "createdAt";

ALTER TABLE role_default_permissions 
  RENAME COLUMN updated_at TO "updatedAt";

-- ============================================================
-- TABLA: user_business_permissions
-- ============================================================
ALTER TABLE user_business_permissions 
  RENAME COLUMN created_at TO "createdAt";

ALTER TABLE user_business_permissions 
  RENAME COLUMN updated_at TO "updatedAt";

-- ============================================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- ============================================================
-- Verificar que las columnas nuevas existen
SELECT 
  table_name,
  column_name
FROM information_schema.columns
WHERE table_name IN ('permissions', 'role_default_permissions', 'user_business_permissions')
  AND column_name IN ('createdAt', 'updatedAt')
ORDER BY table_name, column_name;

-- Verificar conteo de registros (debe ser igual que antes)
SELECT 'permissions' AS table_name, COUNT(*) AS record_count FROM permissions
UNION ALL
SELECT 'role_default_permissions', COUNT(*) FROM role_default_permissions
UNION ALL
SELECT 'user_business_permissions', COUNT(*) FROM user_business_permissions;

-- ============================================================
-- CONFIRMAR O REVERTIR
-- ============================================================
-- Si todo se ve bien, ejecutar: COMMIT;
-- Si algo salió mal, ejecutar: ROLLBACK;

-- NO COMENTAR - Dejar que el DBA decida:
-- COMMIT;
