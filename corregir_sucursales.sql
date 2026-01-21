-- ============================================
-- CORRECCIÓN: Actualizar Estado de Sucursales
-- ============================================
-- IMPORTANTE: Revisa cuidadosamente antes de ejecutar
-- Ajusta los IDs según tus necesidades

-- ==================================================
-- CASO 1: Activar/Desactivar una sucursal específica
-- ==================================================
-- Descomenta y ajusta el ID de la sucursal que deseas cambiar

-- Para ACTIVAR una sucursal:
-- UPDATE branches 
-- SET 
--     is_active = true,
--     updated_at = NOW()
-- WHERE id = 'ID_DE_TU_SUCURSAL_AQUI'
-- RETURNING id, code, name, is_active;

-- Para DESACTIVAR una sucursal:
-- UPDATE branches 
-- SET 
--     is_active = false,
--     updated_at = NOW()
-- WHERE id = 'ID_DE_TU_SUCURSAL_AQUI'
-- RETURNING id, code, name, is_active;

-- ==================================================
-- CASO 2: Corregir sucursales sin código
-- ==================================================
-- Esto generará códigos automáticos para sucursales que no lo tengan

-- Ver sucursales sin código:
SELECT 
    id,
    name,
    code,
    is_active
FROM branches
WHERE code IS NULL OR code = '';

-- Generar códigos automáticos (ajusta según necesites):
-- UPDATE branches
-- SET 
--     code = CONCAT(UPPER(SUBSTRING(name, 1, 3)), '-', LPAD(CAST(id AS VARCHAR), 3, '0')),
--     updated_at = NOW()
-- WHERE code IS NULL OR code = ''
-- RETURNING id, name, code;

-- ==================================================
-- CASO 3: Establecer una sucursal como principal
-- ==================================================
-- IMPORTANTE: Solo puede haber UNA sucursal principal por negocio

-- Ver sucursales principales actuales:
SELECT 
    business_id,
    COUNT(*) as cantidad,
    STRING_AGG(name, ', ') as sucursales
FROM branches
WHERE is_main_branch = true
GROUP BY business_id;

-- Para marcar UNA sucursal como principal (reemplaza los IDs):
-- BEGIN;
-- 
-- -- 1. Quitar la marca principal de todas las sucursales del negocio
-- UPDATE branches
-- SET is_main_branch = false, updated_at = NOW()
-- WHERE business_id = 'ID_DEL_NEGOCIO_AQUI';
-- 
-- -- 2. Marcar la sucursal deseada como principal
-- UPDATE branches
-- SET is_main_branch = true, updated_at = NOW()
-- WHERE id = 'ID_DE_LA_SUCURSAL_PRINCIPAL_AQUI';
-- 
-- COMMIT;

-- ==================================================
-- CASO 4: Activar TODAS las sucursales de un negocio
-- ==================================================
-- Usar con precaución

-- UPDATE branches
-- SET 
--     is_active = true,
--     updated_at = NOW()
-- WHERE business_id = 'ID_DEL_NEGOCIO_AQUI'
-- RETURNING id, name, is_active;

-- ==================================================
-- VERIFICACIÓN FINAL
-- ==================================================
-- Ejecuta esto después de hacer cambios para verificar

SELECT 
    b.id,
    b.code,
    b.name,
    b.is_active AS activa,
    b.is_main_branch AS principal,
    b.city,
    bus.name AS negocio,
    b.updated_at AS ultima_actualizacion
FROM branches b
LEFT JOIN businesses bus ON b.business_id = bus.id
ORDER BY b.business_id, b.is_main_branch DESC, b.name;
