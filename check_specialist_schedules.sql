-- ============================================
-- DIAGNÓSTICO DE HORARIOS DE ESPECIALISTAS
-- Business ID: f97e749b-36d3-48bd-b82f-42cd6f23ed86
-- ============================================

-- 1. VER TODAS LAS SUCURSALES DEL NEGOCIO
SELECT 
    id,
    name,
    code,
    address,
    "isActive",
    "createdAt"
FROM 
    "Branches"
WHERE 
    "businessId" = 'f97e749b-36d3-48bd-b82f-42cd6f23ed86'
    AND "deletedAt" IS NULL
ORDER BY 
    name;

-- 2. VER ESPECIALISTAS Y SU SUCURSAL PRINCIPAL ASIGNADA
SELECT 
    u.id as user_id,
    u."firstName" || ' ' || u."lastName" as nombre_completo,
    u.email,
    u.role,
    u."branchId" as sucursal_principal_id,
    b.name as sucursal_principal_nombre,
    u."isActive" as usuario_activo,
    u."createdAt" as fecha_creacion
FROM 
    "Users" u
LEFT JOIN 
    "Branches" b ON u."branchId" = b.id
WHERE 
    u."businessId" = 'f97e749b-36d3-48bd-b82f-42cd6f23ed86'
    AND u.role = 'SPECIALIST'
    AND u."deletedAt" IS NULL
ORDER BY 
    u."firstName";

-- 3. VER PERFILES DE ESPECIALISTAS
SELECT 
    sp.id as profile_id,
    sp."userId" as user_id,
    u."firstName" || ' ' || u."lastName" as nombre_completo,
    sp."specialization",
    sp."isActive" as perfil_activo,
    sp."createdAt" as perfil_creado
FROM 
    "SpecialistProfiles" sp
LEFT JOIN 
    "Users" u ON sp."userId" = u.id
WHERE 
    u."businessId" = 'f97e749b-36d3-48bd-b82f-42cd6f23ed86'
    AND sp."deletedAt" IS NULL
ORDER BY 
    u."firstName";

-- 4. VER HORARIOS CONFIGURADOS EN SPECIALIST_BRANCH_SCHEDULES
SELECT 
    sbs.id as schedule_id,
    sbs."specialistId" as specialist_profile_id,
    u."firstName" || ' ' || u."lastName" as especialista_nombre,
    sbs."branchId" as sucursal_id,
    b.name as sucursal_nombre,
    sbs."dayOfWeek" as dia_semana,
    sbs."startTime" as hora_inicio,
    sbs."endTime" as hora_fin,
    sbs."breakStart" as break_inicio,
    sbs."breakEnd" as break_fin,
    sbs."isActive" as horario_activo,
    sbs."createdAt" as fecha_creacion_horario
FROM 
    "SpecialistBranchSchedules" sbs
LEFT JOIN 
    "SpecialistProfiles" sp ON sbs."specialistId" = sp.id
LEFT JOIN 
    "Users" u ON sp."userId" = u.id
LEFT JOIN 
    "Branches" b ON sbs."branchId" = b.id
WHERE 
    u."businessId" = 'f97e749b-36d3-48bd-b82f-42cd6f23ed86'
    AND sbs."deletedAt" IS NULL
ORDER BY 
    u."firstName", 
    b.name,
    sbs."dayOfWeek";

-- 5. RESUMEN: CONTAR HORARIOS POR ESPECIALISTA
SELECT 
    u."firstName" || ' ' || u."lastName" as especialista,
    COUNT(DISTINCT sbs."branchId") as total_sucursales,
    COUNT(sbs.id) as total_horarios_configurados,
    STRING_AGG(DISTINCT b.name, ', ') as sucursales
FROM 
    "SpecialistBranchSchedules" sbs
LEFT JOIN 
    "SpecialistProfiles" sp ON sbs."specialistId" = sp.id
LEFT JOIN 
    "Users" u ON sp."userId" = u.id
LEFT JOIN 
    "Branches" b ON sbs."branchId" = b.id
WHERE 
    u."businessId" = 'f97e749b-36d3-48bd-b82f-42cd6f23ed86'
    AND sbs."deletedAt" IS NULL
GROUP BY 
    u."firstName", u."lastName", u.id
ORDER BY 
    u."firstName";

-- 6. VER CITAS PROGRAMADAS (últimas 10)
SELECT 
    a.id,
    a."startTime",
    a."endTime",
    a.status,
    c."firstName" || ' ' || c."lastName" as cliente,
    u."firstName" || ' ' || u."lastName" as especialista,
    s.name as servicio,
    b.name as sucursal,
    a."totalAmount"
FROM 
    "Appointments" a
LEFT JOIN 
    "Clients" c ON a."clientId" = c.id
LEFT JOIN 
    "Users" u ON a."specialistId" = u.id
LEFT JOIN 
    "Services" s ON a."serviceId" = s.id
LEFT JOIN 
    "Branches" b ON a."branchId" = b.id
WHERE 
    a."businessId" = 'f97e749b-36d3-48bd-b82f-42cd6f23ed86'
    AND a."deletedAt" IS NULL
ORDER BY 
    a."startTime" DESC
LIMIT 10;

-- 7. VERIFICAR SI HAY ESPECIALISTAS SIN HORARIOS
SELECT 
    u.id as user_id,
    u."firstName" || ' ' || u."lastName" as especialista,
    u."branchId" as sucursal_principal_id,
    COUNT(sbs.id) as horarios_configurados
FROM 
    "Users" u
LEFT JOIN 
    "SpecialistProfiles" sp ON sp."userId" = u.id
LEFT JOIN 
    "SpecialistBranchSchedules" sbs ON sbs."specialistId" = sp.id AND sbs."deletedAt" IS NULL
WHERE 
    u."businessId" = 'f97e749b-36d3-48bd-b82f-42cd6f23ed86'
    AND u.role = 'SPECIALIST'
    AND u."deletedAt" IS NULL
GROUP BY 
    u.id, u."firstName", u."lastName", u."branchId"
ORDER BY 
    horarios_configurados ASC, u."firstName";
