-- ═══════════════════════════════════════════════════════════════════════
-- CONSULTAS ÚTILES PARA BEAUTY CONTROL - Azure PostgreSQL
-- Base de datos: beautycontrol
-- ═══════════════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 👥 USUARIOS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Ver todos los usuarios con su negocio
SELECT 
    u.id,
    u.email,
    u.role,
    u."firstName",
    u."lastName",
    u.status,
    b.name as "businessName",
    b.status as "businessStatus",
    u."createdAt"
FROM users u
LEFT JOIN businesses b ON u."businessId" = b.id
ORDER BY u."createdAt" DESC;

-- Contar usuarios por rol
SELECT role, COUNT(*) as total
FROM users
GROUP BY role
ORDER BY total DESC;

-- Usuarios sin negocio asignado
SELECT id, email, role, "firstName", "lastName"
FROM users
WHERE "businessId" IS NULL;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🏢 NEGOCIOS Y SUSCRIPCIONES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Ver negocios con su plan actual
SELECT 
    b.id,
    b.name,
    b.email,
    b.status,
    sp.name as "planName",
    sp.price as "planPrice",
    b."trialEndDate",
    b."createdAt"
FROM businesses b
LEFT JOIN subscription_plans sp ON b."currentPlanId" = sp.id
ORDER BY b."createdAt" DESC;

-- Ver suscripciones activas con detalles
SELECT 
    bs.id,
    b.name as "businessName",
    sp.name as "planName",
    bs.status,
    bs."startDate",
    bs."endDate",
    bs."isTrial",
    bs."autoRenew",
    bs."createdAt"
FROM business_subscriptions bs
JOIN businesses b ON bs."businessId" = b.id
JOIN subscription_plans sp ON bs."subscriptionPlanId" = sp.id
WHERE bs.status IN ('ACTIVE', 'TRIAL')
ORDER BY bs."createdAt" DESC;

-- Negocios con suscripción próxima a vencer (próximos 7 días)
SELECT 
    b.name as "businessName",
    b.email,
    bs.status,
    bs."endDate",
    (bs."endDate" - CURRENT_DATE) as "daysRemaining"
FROM business_subscriptions bs
JOIN businesses b ON bs."businessId" = b.id
WHERE bs.status = 'ACTIVE'
    AND bs."endDate" BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
ORDER BY bs."endDate" ASC;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 📦 PLANES Y MÓDULOS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Ver todos los planes con cantidad de módulos
SELECT 
    sp.id,
    sp.name,
    sp.price,
    sp.duration,
    sp."durationType",
    sp.status,
    COUNT(pm.id) as "modulesCount"
FROM subscription_plans sp
LEFT JOIN plan_modules pm ON sp.id = pm."subscriptionPlanId" AND pm."isIncluded" = true
GROUP BY sp.id
ORDER BY sp.price DESC;

-- Ver módulos de un plan específico (Enterprise)
SELECT 
    m.id,
    m.name,
    m."displayName",
    m.category,
    m.status,
    pm."isIncluded",
    pm."limitQuantity",
    pm."additionalPrice"
FROM subscription_plans sp
JOIN plan_modules pm ON sp.id = pm."subscriptionPlanId"
JOIN modules m ON pm."moduleId" = m.id
WHERE sp.name = 'Enterprise'
    AND pm."isIncluded" = true
ORDER BY m.category, m."displayName";

-- Ver todos los módulos disponibles
SELECT 
    id,
    name,
    "displayName",
    category,
    status,
    version,
    "requiresConfiguration"
FROM modules
ORDER BY category, "displayName";


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 💳 TRANSACCIONES Y PAGOS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Ver últimas transacciones
SELECT 
    t.id,
    b.name as "businessName",
    t.amount,
    t.status,
    t."paymentMethod",
    t."transactionDate",
    t."createdAt"
FROM transactions t
JOIN businesses b ON t."businessId" = b.id
ORDER BY t."createdAt" DESC
LIMIT 50;

-- Ver transacciones por estado
SELECT status, COUNT(*) as total, SUM(amount) as "totalAmount"
FROM transactions
GROUP BY status
ORDER BY total DESC;

-- Pagos de suscripciones recientes
SELECT 
    sp.id,
    b.name as "businessName",
    bs."subscriptionPlanId",
    sp.amount,
    sp.status,
    sp."paymentDate",
    sp."paymentMethod"
FROM subscription_payments sp
JOIN business_subscriptions bs ON sp."subscriptionId" = bs.id
JOIN businesses b ON bs."businessId" = b.id
ORDER BY sp."createdAt" DESC
LIMIT 50;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 📊 ESTADÍSTICAS GENERALES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Dashboard general
SELECT 
    (SELECT COUNT(*) FROM businesses WHERE status = 'ACTIVE') as "activeBusinesses",
    (SELECT COUNT(*) FROM businesses WHERE status = 'TRIAL') as "trialBusinesses",
    (SELECT COUNT(*) FROM users WHERE role = 'BUSINESS') as "businessUsers",
    (SELECT COUNT(*) FROM users WHERE role = 'OWNER') as "ownerUsers",
    (SELECT COUNT(*) FROM business_subscriptions WHERE status = 'ACTIVE') as "activeSubscriptions",
    (SELECT SUM(amount) FROM transactions WHERE status = 'APPROVED' AND "transactionDate" >= CURRENT_DATE - INTERVAL '30 days') as "revenue30Days";

-- Negocios creados por mes (últimos 6 meses)
SELECT 
    TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
    COUNT(*) as "businessesCreated"
FROM businesses
WHERE "createdAt" >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', "createdAt")
ORDER BY month DESC;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🎯 PROGRAMA DE FIDELIZACIÓN
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Ver clientes con más puntos de fidelización
SELECT 
    bc.id,
    c."firstName" || ' ' || c."lastName" as "clientName",
    c.email,
    bc."loyaltyPoints",
    bc."referralCode",
    bc."referralCount",
    b.name as "businessName"
FROM business_clients bc
JOIN clients c ON bc."clientId" = c.id
JOIN businesses b ON bc."businessId" = b.id
WHERE bc."loyaltyPoints" > 0
ORDER BY bc."loyaltyPoints" DESC
LIMIT 50;

-- Reglas de fidelización por negocio
SELECT 
    b.name as "businessName",
    br."ruleType",
    br.configuration,
    br.status,
    br."createdAt"
FROM business_rules br
JOIN businesses b ON br."businessId" = b.id
WHERE br."ruleType" LIKE 'LOYALTY_%'
ORDER BY b.name, br."ruleType";


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🔍 BÚSQUEDAS ESPECÍFICAS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Buscar usuario por email
-- Reemplaza 'email@ejemplo.com' con el email que buscas
SELECT 
    u.id,
    u.email,
    u.role,
    u."firstName",
    u."lastName",
    b.name as "businessName",
    u."createdAt"
FROM users u
LEFT JOIN businesses b ON u."businessId" = b.id
WHERE u.email ILIKE '%mercedeslobeto%';

-- Buscar negocio por nombre
-- Reemplaza 'nombre' con el nombre que buscas
SELECT 
    b.id,
    b.name,
    b.email,
    b.status,
    sp.name as "planName",
    b."createdAt"
FROM businesses b
LEFT JOIN subscription_plans sp ON b."currentPlanId" = sp.id
WHERE b.name ILIKE '%mas3d%';

-- Ver información completa de un negocio específico
-- Reemplaza el ID con el que necesites
SELECT 
    b.*,
    sp.name as "currentPlanName",
    sp.price as "planPrice",
    (SELECT COUNT(*) FROM users WHERE "businessId" = b.id) as "usersCount",
    (SELECT COUNT(*) FROM business_subscriptions WHERE "businessId" = b.id) as "subscriptionsCount"
FROM businesses b
LEFT JOIN subscription_plans sp ON b."currentPlanId" = sp.id
WHERE b.id = '2970cc0e-769c-47b9-bf24-f85acfe96001';
