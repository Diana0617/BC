-- ================================================
-- CREAR TABLAS DE SISTEMA DE PERMISOS
-- Base de datos: Azure PostgreSQL (beautycontrol-db)
-- Fecha: 2026-01-16
-- ================================================

-- 1. Crear tabla de permisos
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para permissions
CREATE INDEX IF NOT EXISTS idx_permissions_key ON permissions(key);
CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);

COMMENT ON TABLE permissions IS 'Catálogo de permisos disponibles en el sistema';
COMMENT ON COLUMN permissions.key IS 'Clave única del permiso, ej: appointments.create, payments.view';
COMMENT ON COLUMN permissions.name IS 'Nombre legible del permiso';
COMMENT ON COLUMN permissions.category IS 'Categoría del permiso: appointments, payments, clients, etc.';

-- 2. Crear tabla de permisos por defecto según rol
CREATE TABLE IF NOT EXISTS role_default_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL CHECK (role IN ('OWNER', 'BUSINESS', 'SPECIALIST', 'RECEPTIONIST', 'RECEPTIONIST_SPECIALIST')),
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  is_granted BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role, permission_id)
);

-- Índice para role_default_permissions
CREATE INDEX IF NOT EXISTS idx_role_default_permissions_role ON role_default_permissions(role);

COMMENT ON TABLE role_default_permissions IS 'Permisos por defecto según el rol del usuario';
COMMENT ON COLUMN role_default_permissions.is_granted IS 'Si el permiso está concedido por defecto para este rol';

-- 3. Crear tabla de permisos personalizados por usuario y negocio
CREATE TABLE IF NOT EXISTS user_business_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "businessId" UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  is_granted BOOLEAN NOT NULL,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMPTZ,
  notes TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, "businessId", permission_id)
);

-- Índices para user_business_permissions
CREATE INDEX IF NOT EXISTS idx_user_business_permissions_user_business ON user_business_permissions(user_id, "businessId");
CREATE INDEX IF NOT EXISTS idx_user_business_permissions_permission ON user_business_permissions(permission_id);

COMMENT ON TABLE user_business_permissions IS 'Permisos personalizados asignados a usuarios específicos en un negocio';
COMMENT ON COLUMN user_business_permissions.is_granted IS 'true = concedido (override), false = revocado (override)';
COMMENT ON COLUMN user_business_permissions.granted_by IS 'Usuario que concedió o revocó el permiso';

-- 4. Insertar permisos básicos del sistema
INSERT INTO permissions (key, name, description, category) VALUES
-- Citas (Appointments)
('appointments.view', 'Ver Citas', 'Permite ver las citas del negocio', 'appointments'),
('appointments.create', 'Crear Citas', 'Permite crear nuevas citas', 'appointments'),
('appointments.edit', 'Editar Citas', 'Permite modificar citas existentes', 'appointments'),
('appointments.delete', 'Eliminar Citas', 'Permite cancelar o eliminar citas', 'appointments'),
('appointments.view_all', 'Ver Todas las Citas', 'Permite ver citas de todos los especialistas', 'appointments'),

-- Clientes (Clients)
('clients.view', 'Ver Clientes', 'Permite ver la lista de clientes', 'clients'),
('clients.create', 'Crear Clientes', 'Permite registrar nuevos clientes', 'clients'),
('clients.edit', 'Editar Clientes', 'Permite modificar información de clientes', 'clients'),
('clients.delete', 'Eliminar Clientes', 'Permite eliminar clientes', 'clients'),
('clients.view_history', 'Ver Historial de Clientes', 'Permite ver el historial completo de citas y tratamientos', 'clients'),

-- Pagos (Payments)
('payments.view', 'Ver Pagos', 'Permite ver información de pagos', 'payments'),
('payments.process', 'Procesar Pagos', 'Permite procesar y registrar pagos', 'payments'),
('payments.refund', 'Reembolsar Pagos', 'Permite realizar reembolsos', 'payments'),
('payments.view_reports', 'Ver Reportes de Pagos', 'Permite ver reportes financieros', 'payments'),

-- Servicios (Services)
('services.view', 'Ver Servicios', 'Permite ver el catálogo de servicios', 'services'),
('services.create', 'Crear Servicios', 'Permite agregar nuevos servicios', 'services'),
('services.edit', 'Editar Servicios', 'Permite modificar servicios', 'services'),
('services.delete', 'Eliminar Servicios', 'Permite eliminar servicios', 'services'),

-- Inventario (Inventory)
('inventory.view', 'Ver Inventario', 'Permite ver el inventario de productos', 'inventory'),
('inventory.manage', 'Gestionar Inventario', 'Permite agregar, editar y eliminar productos', 'inventory'),
('inventory.view_reports', 'Ver Reportes de Inventario', 'Permite ver reportes de movimientos', 'inventory'),

-- Equipo (Staff)
('staff.view', 'Ver Equipo', 'Permite ver la lista de empleados', 'staff'),
('staff.manage', 'Gestionar Equipo', 'Permite agregar, editar y eliminar empleados', 'staff'),
('staff.view_performance', 'Ver Rendimiento del Equipo', 'Permite ver estadísticas de rendimiento', 'staff'),

-- Configuración (Settings)
('settings.view', 'Ver Configuración', 'Permite ver la configuración del negocio', 'settings'),
('settings.edit', 'Editar Configuración', 'Permite modificar la configuración', 'settings'),
('settings.manage_permissions', 'Gestionar Permisos', 'Permite asignar permisos a otros usuarios', 'settings')
ON CONFLICT (key) DO NOTHING;

-- 5. Asignar permisos por defecto para BUSINESS/OWNER (todos los permisos)
INSERT INTO role_default_permissions (role, permission_id, is_granted)
SELECT 'BUSINESS', id, true FROM permissions
ON CONFLICT (role, permission_id) DO NOTHING;

INSERT INTO role_default_permissions (role, permission_id, is_granted)
SELECT 'OWNER', id, true FROM permissions
ON CONFLICT (role, permission_id) DO NOTHING;

-- 6. Permisos por defecto para RECEPTIONIST
INSERT INTO role_default_permissions (role, permission_id, is_granted)
SELECT 'RECEPTIONIST', id, true FROM permissions 
WHERE key IN (
  'appointments.view',
  'appointments.create',
  'appointments.edit',
  'clients.view',
  'clients.create',
  'clients.edit',
  'clients.view_history',
  'payments.view',
  'payments.process',
  'services.view'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- 7. Permisos por defecto para RECEPTIONIST_SPECIALIST (receptionist + sus propios servicios)
INSERT INTO role_default_permissions (role, permission_id, is_granted)
SELECT 'RECEPTIONIST_SPECIALIST', id, true FROM permissions 
WHERE key IN (
  'appointments.view',
  'appointments.view_all',
  'appointments.create',
  'appointments.edit',
  'clients.view',
  'clients.create',
  'clients.edit',
  'clients.view_history',
  'payments.view',
  'payments.process',
  'services.view'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- 8. Permisos por defecto para SPECIALIST (solo sus citas y clientes)
INSERT INTO role_default_permissions (role, permission_id, is_granted)
SELECT 'SPECIALIST', id, true FROM permissions 
WHERE key IN (
  'appointments.view',
  'appointments.create',
  'appointments.edit',
  'clients.view',
  'clients.create',
  'clients.view_history',
  'services.view'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- Verificar resultados
SELECT '✅ Tablas de permisos creadas' as resultado;
SELECT COUNT(*) as total_permisos FROM permissions;
SELECT role, COUNT(*) as permisos_por_defecto FROM role_default_permissions GROUP BY role ORDER BY role;
