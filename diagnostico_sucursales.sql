-- ============================================
-- DIAGNÓSTICO: Estado de Sucursales
-- ============================================
-- Este script te ayuda a verificar el estado actual de las sucursales

-- 1. Ver TODAS las sucursales con su estado completo
SELECT 
    b.id,
    b.code AS codigo,
    b.name AS nombre,
    b.is_active AS activa,
    b.is_main_branch AS principal,
    b.address AS direccion,
    b.city AS ciudad,
    b.phone AS telefono,
    b.created_at AS fecha_creacion,
    b.updated_at AS ultima_actualizacion,
    bus.name AS negocio
FROM branches b
LEFT JOIN businesses bus ON b.business_id = bus.id
ORDER BY b.is_main_branch DESC, b.created_at ASC;

-- 2. Contar sucursales por estado
SELECT 
    is_active AS activa,
    COUNT(*) AS cantidad
FROM branches
GROUP BY is_active;

-- 3. Identificar sucursales con problemas (sin código o sin negocio)
SELECT 
    id,
    code,
    name,
    business_id,
    is_active,
    CASE 
        WHEN code IS NULL OR code = '' THEN '⚠️ Sin código'
        WHEN business_id IS NULL THEN '⚠️ Sin negocio'
        ELSE '✅ OK'
    END AS estado_validacion
FROM branches
WHERE code IS NULL OR code = '' OR business_id IS NULL;

-- 4. Ver sucursales principales por negocio (solo debe haber 1 por negocio)
SELECT 
    business_id,
    COUNT(*) AS cantidad_principales,
    STRING_AGG(name, ', ') AS nombres
FROM branches
WHERE is_main_branch = true
GROUP BY business_id
HAVING COUNT(*) > 1;  -- Si esto devuelve resultados, hay un problema

-- 5. Buscar sucursales específicas por nombre (ajusta el LIKE según necesites)
SELECT 
    id,
    code,
    name,
    is_active,
    is_main_branch,
    city
FROM branches
WHERE name ILIKE '%laura%' OR name ILIKE '%villavicencio%'
ORDER BY created_at DESC;
