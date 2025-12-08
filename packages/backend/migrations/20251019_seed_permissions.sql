-- Seed: Permisos iniciales del sistema
-- Fecha: 2025-10-19
-- Descripción: Inserta los permisos base y configuración por defecto para cada rol

-- ==================== PERMISOS DE CITAS ====================
INSERT INTO permissions (key, name, description, category) VALUES
('appointments.view_own', 'Ver mis citas', 'Permite ver solo las citas propias del especialista', 'appointments'),
('appointments.view_all', 'Ver todas las citas', 'Permite ver todas las citas del negocio', 'appointments'),
('appointments.create', 'Crear citas', 'Permite crear nuevas citas', 'appointments'),
('appointments.edit', 'Editar citas', 'Permite modificar citas existentes', 'appointments'),
('appointments.cancel', 'Cancelar citas', 'Permite cancelar citas', 'appointments'),
('appointments.complete', 'Completar citas', 'Permite marcar citas como completadas', 'appointments'),
('appointments.close_with_payment', 'Cerrar cita cobrando', 'Permite cerrar citas recibiendo pagos', 'appointments'),
('appointments.close_without_payment', 'Cerrar cita sin cobro', 'Permite cerrar citas sin registrar pago', 'appointments'),
('appointments.view_history', 'Ver historial de citas', 'Permite ver el historial completo de citas', 'appointments')
ON CONFLICT (key) DO NOTHING;

-- ==================== PERMISOS DE PAGOS ====================
INSERT INTO permissions (key, name, description, category) VALUES
('payments.view', 'Ver pagos', 'Permite ver información de pagos', 'payments'),
('payments.create', 'Registrar pagos', 'Permite crear y registrar pagos', 'payments'),
('payments.refund', 'Realizar devoluciones', 'Permite procesar reembolsos de pagos', 'payments'),
('payments.view_reports', 'Ver reportes de pagos', 'Permite acceder a reportes financieros', 'payments')
ON CONFLICT (key) DO NOTHING;

-- ==================== PERMISOS DE CLIENTES ====================
INSERT INTO permissions (key, name, description, category) VALUES
('clients.view', 'Ver clientes', 'Permite ver la lista de clientes', 'clients'),
('clients.create', 'Crear clientes', 'Permite agregar nuevos clientes', 'clients'),
('clients.edit', 'Editar clientes', 'Permite modificar información de clientes', 'clients'),
('clients.view_history', 'Ver historial de cliente', 'Permite ver el historial completo del cliente', 'clients'),
('clients.view_personal_data', 'Ver datos personales', 'Permite ver información sensible del cliente (dirección, contacto, etc)', 'clients'),
('clients.delete', 'Eliminar clientes', 'Permite eliminar clientes del sistema', 'clients')
ON CONFLICT (key) DO NOTHING;

-- ==================== PERMISOS DE COMISIONES ====================
INSERT INTO permissions (key, name, description, category) VALUES
('commissions.view_own', 'Ver mis comisiones', 'Permite ver solo las comisiones propias', 'commissions'),
('commissions.view_all', 'Ver todas las comisiones', 'Permite ver comisiones de todos los especialistas', 'commissions'),
('commissions.approve', 'Aprobar comisiones', 'Permite aprobar solicitudes de pago de comisiones', 'commissions'),
('commissions.edit_config', 'Configurar comisiones', 'Permite modificar la configuración de comisiones', 'commissions')
ON CONFLICT (key) DO NOTHING;

-- ==================== PERMISOS DE INVENTARIO ====================
INSERT INTO permissions (key, name, description, category) VALUES
('inventory.view', 'Ver inventario', 'Permite ver productos en inventario', 'inventory'),
('inventory.sell', 'Vender productos', 'Permite registrar ventas de productos', 'inventory'),
('inventory.manage', 'Gestionar inventario', 'Permite agregar, editar y eliminar productos del inventario', 'inventory'),
('inventory.view_movements', 'Ver movimientos', 'Permite ver el historial de movimientos de inventario', 'inventory')
ON CONFLICT (key) DO NOTHING;

-- ==================== PERMISOS DE REPORTES ====================
INSERT INTO permissions (key, name, description, category) VALUES
('reports.view_own', 'Ver mis reportes', 'Permite ver reportes individuales propios', 'reports'),
('reports.view_all', 'Ver todos los reportes', 'Permite ver reportes generales del negocio', 'reports'),
('reports.export', 'Exportar reportes', 'Permite exportar reportes a Excel/PDF', 'reports')
ON CONFLICT (key) DO NOTHING;

-- ==================== PERMISOS DE SERVICIOS ====================
INSERT INTO permissions (key, name, description, category) VALUES
('services.view', 'Ver servicios', 'Permite ver la lista de servicios', 'services'),
('services.create', 'Crear servicios', 'Permite agregar nuevos servicios', 'services'),
('services.edit', 'Editar servicios', 'Permite modificar servicios existentes', 'services'),
('services.delete', 'Eliminar servicios', 'Permite eliminar servicios', 'services')
ON CONFLICT (key) DO NOTHING;

-- ==================== PERMISOS DE EQUIPO ====================
INSERT INTO permissions (key, name, description, category) VALUES
('team.view', 'Ver equipo', 'Permite ver la lista de miembros del equipo', 'team'),
('team.manage', 'Gestionar equipo', 'Permite agregar, editar y eliminar miembros del equipo', 'team'),
('team.assign_permissions', 'Asignar permisos', 'Permite modificar permisos de otros usuarios', 'team')
ON CONFLICT (key) DO NOTHING;

-- ==================== PERMISOS DE CONFIGURACIÓN ====================
INSERT INTO permissions (key, name, description, category) VALUES
('config.view', 'Ver configuración', 'Permite ver la configuración del negocio', 'config'),
('config.edit', 'Editar configuración', 'Permite modificar la configuración del negocio', 'config'),
('config.business_rules', 'Gestionar reglas de negocio', 'Permite configurar reglas de negocio', 'config')
ON CONFLICT (key) DO NOTHING;

-- ==================== PERMISOS POR DEFECTO: BUSINESS (dueño del negocio) ====================
-- BUSINESS tiene acceso completo a todo
INSERT INTO role_default_permissions (role, permission_id, is_granted)
SELECT 'BUSINESS', id, true FROM permissions
ON CONFLICT (role, permission_id) DO NOTHING;

-- ==================== PERMISOS POR DEFECTO: RECEPTIONIST ====================
-- RECEPTIONIST puede: ver, crear y gestionar citas; ver y crear clientes; ver inventario y vender
INSERT INTO role_default_permissions (role, permission_id, is_granted)
SELECT 'RECEPTIONIST', id, true FROM permissions WHERE key IN (
  -- Citas
  'appointments.view_all',
  'appointments.create',
  'appointments.edit',
  'appointments.cancel',
  'appointments.view_history',
  -- Clientes
  'clients.view',
  'clients.create',
  'clients.edit',
  'clients.view_history',
  'clients.view_personal_data',
  -- Inventario
  'inventory.view',
  'inventory.sell',
  -- Servicios
  'services.view',
  -- Equipo
  'team.view'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- ==================== PERMISOS POR DEFECTO: SPECIALIST ====================
-- SPECIALIST puede: ver sus citas, ver clientes básico, ver sus comisiones
INSERT INTO role_default_permissions (role, permission_id, is_granted)
SELECT 'SPECIALIST', id, true FROM permissions WHERE key IN (
  -- Citas (solo propias)
  'appointments.view_own',
  'appointments.view_history',
  -- Clientes (básico)
  'clients.view',
  'clients.view_history',
  -- Comisiones
  'commissions.view_own',
  -- Reportes
  'reports.view_own',
  -- Servicios
  'services.view'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- ==================== PERMISOS POR DEFECTO: RECEPTIONIST_SPECIALIST ====================
-- RECEPTIONIST_SPECIALIST hereda permisos de ambos roles
INSERT INTO role_default_permissions (role, permission_id, is_granted)
SELECT 'RECEPTIONIST_SPECIALIST', id, true FROM permissions WHERE key IN (
  -- Todas las de RECEPTIONIST
  'appointments.view_all',
  'appointments.create',
  'appointments.edit',
  'appointments.cancel',
  'appointments.view_history',
  'clients.view',
  'clients.create',
  'clients.edit',
  'clients.view_history',
  'clients.view_personal_data',
  'inventory.view',
  'inventory.sell',
  'services.view',
  'team.view',
  -- Más las específicas de SPECIALIST
  'appointments.view_own',
  'commissions.view_own',
  'reports.view_own'
)
ON CONFLICT (role, permission_id) DO NOTHING;
