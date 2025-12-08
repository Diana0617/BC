-- Migration: Crear tablas de sistema de permisos
-- Fecha: 2025-10-19
-- Descripción: Crea las tablas para el sistema de permisos granulares

-- Tabla de permisos (catálogo de permisos disponibles)
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_permissions_key ON permissions(key);
CREATE INDEX idx_permissions_category ON permissions(category);

COMMENT ON TABLE permissions IS 'Catálogo de permisos disponibles en el sistema';
COMMENT ON COLUMN permissions.key IS 'Clave única del permiso, ej: appointments.create, payments.view';
COMMENT ON COLUMN permissions.name IS 'Nombre legible del permiso';
COMMENT ON COLUMN permissions.description IS 'Descripción detallada del permiso';
COMMENT ON COLUMN permissions.category IS 'Categoría del permiso: appointments, payments, clients, etc.';
COMMENT ON COLUMN permissions.is_active IS 'Si el permiso está activo y disponible para asignar';

-- Tabla de permisos por defecto por rol
CREATE TABLE IF NOT EXISTS role_default_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL CHECK (role IN ('BUSINESS', 'SPECIALIST', 'RECEPTIONIST', 'RECEPTIONIST_SPECIALIST')),
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  is_granted BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role, permission_id)
);

CREATE INDEX idx_role_default_permissions_role ON role_default_permissions(role);
CREATE INDEX idx_role_default_permissions_permission_id ON role_default_permissions(permission_id);

COMMENT ON TABLE role_default_permissions IS 'Permisos por defecto para cada rol';
COMMENT ON COLUMN role_default_permissions.role IS 'Rol al que aplica este permiso por defecto';
COMMENT ON COLUMN role_default_permissions.is_granted IS 'Si el permiso está concedido por defecto para este rol';

-- Tabla de permisos personalizados por usuario y negocio
CREATE TABLE IF NOT EXISTS user_business_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  is_granted BOOLEAN NOT NULL,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, business_id, permission_id)
);

CREATE INDEX idx_user_business_permissions_user_business ON user_business_permissions(user_id, business_id);
CREATE INDEX idx_user_business_permissions_permission_id ON user_business_permissions(permission_id);
CREATE INDEX idx_user_business_permissions_granted_by ON user_business_permissions(granted_by);

COMMENT ON TABLE user_business_permissions IS 'Permisos personalizados concedidos o revocados a usuarios específicos en negocios específicos';
COMMENT ON COLUMN user_business_permissions.user_id IS 'Usuario al que se le concede/revoca el permiso';
COMMENT ON COLUMN user_business_permissions.business_id IS 'Negocio en el que aplica el permiso';
COMMENT ON COLUMN user_business_permissions.permission_id IS 'Permiso que se concede/revoca';
COMMENT ON COLUMN user_business_permissions.is_granted IS 'true = concedido (override), false = revocado (override)';
COMMENT ON COLUMN user_business_permissions.granted_by IS 'Usuario que concedió o revocó el permiso';
COMMENT ON COLUMN user_business_permissions.granted_at IS 'Fecha en que se concedió el permiso';
COMMENT ON COLUMN user_business_permissions.revoked_at IS 'Fecha en que se revocó el permiso (si is_granted=false)';
COMMENT ON COLUMN user_business_permissions.notes IS 'Notas sobre por qué se concedió/revocó este permiso';
