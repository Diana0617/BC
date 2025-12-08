-- Migración para agregar índices de rendimiento al dashboard
-- Esta migración mejora significativamente el rendimiento de las consultas del dashboard

-- ÍNDICES PARA DASHBOARD DE OWNER

-- 1. Índice para appointments por business_id y estado (para métricas principales)
CREATE INDEX IF NOT EXISTS idx_appointments_business_status 
ON appointments(business_id, status);

-- 2. Índice compuesto para appointments por business_id y fecha (para tendencias)
CREATE INDEX IF NOT EXISTS idx_appointments_business_date 
ON appointments(business_id, appointment_date);

-- 3. Índice para payments por business_id y fecha (para análisis de pagos)
CREATE INDEX IF NOT EXISTS idx_payments_business_date 
ON payments(business_id, payment_date);

-- 4. Índice para business_payments por owner_id y fecha (para ingresos por owner)
CREATE INDEX IF NOT EXISTS idx_business_payments_owner_date 
ON business_payments(owner_id, payment_date);

-- 5. Índice para business_payments por owner_id y estado (para distribución de planes)
CREATE INDEX IF NOT EXISTS idx_business_payments_owner_status 
ON business_payments(owner_id, status);

-- 6. Índice para businesses por owner_id (para consultas de negocios por owner)
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id 
ON businesses(owner_id);

-- 7. Índice para businesses por owner_id y estado (para negocios activos)
CREATE INDEX IF NOT EXISTS idx_businesses_owner_status 
ON businesses(owner_id, status);

-- 8. Índice para business_plans por business_id (para información de planes)
CREATE INDEX IF NOT EXISTS idx_business_plans_business_id 
ON business_plans(business_id);

-- 9. Índice compuesto para business_plans por business_id y fechas (para planes activos)
CREATE INDEX IF NOT EXISTS idx_business_plans_business_dates 
ON business_plans(business_id, start_date, end_date);

-- 10. Índice para appointments por business_id y fechas de creación (para métricas temporales)
CREATE INDEX IF NOT EXISTS idx_appointments_business_created 
ON appointments(business_id, created_at);

-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN GENERAL

-- 11. Índice para payments por appointment_id (para relaciones de pago)
CREATE INDEX IF NOT EXISTS idx_payments_appointment_id 
ON payments(appointment_id);

-- 12. Índice para clients por business_id (para gestión de clientes)
CREATE INDEX IF NOT EXISTS idx_clients_business_id 
ON clients(business_id);

-- 13. Índice para services por business_id (para gestión de servicios)
CREATE INDEX IF NOT EXISTS idx_services_business_id 
ON services(business_id);

-- 14. Índice para products por business_id (para gestión de productos)
CREATE INDEX IF NOT EXISTS idx_products_business_id 
ON products(business_id);

-- COMENTARIOS SOBRE LOS ÍNDICES
-- Estos índices están diseñados específicamente para optimizar:
-- 1. Consultas del dashboard principal (métricas, tendencias, distribuciones)
-- 2. Filtros por business_id que son muy comunes en el sistema
-- 3. Búsquedas por fecha que son frecuentes en reportes
-- 4. Relaciones entre tablas que se usan en JOINs frecuentes

-- NOTA: 
-- - Usar IF NOT EXISTS evita errores si algunos índices ya existen
-- - Los índices compuestos están ordenados por selectividad (más selectivo primero)
-- - Se evitan índices redundantes con PKs y UKs existentes