-- Script para crear usuario OWNER en producción
-- Ejecutar SOLO UNA VEZ en la base de datos de Neon

-- Password hasheado con bcrypt (12 rounds): AdminBC2024!
-- Si necesitas otra password, genera el hash con: bcrypt.hash('tu_password', 12)

INSERT INTO users (
  id,
  "firstName",
  "lastName",
  email,
  password,
  role,
  status,
  "emailVerified",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'Admin',
  'Beauty Control',
  'admin@beautycontrol.co',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr9qL8K3C',
  'OWNER',
  'ACTIVE',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verificar que se creó correctamente
SELECT id, "firstName", "lastName", email, role, status, "createdAt"
FROM users
WHERE email = 'admin@beautycontrol.co';
