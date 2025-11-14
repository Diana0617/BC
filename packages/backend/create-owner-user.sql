-- Script para crear usuario OWNER en producción
-- Ejecutar en Neon Database

-- Crear usuario OWNER
-- Email: admin@beautycontrol.co
-- Password: AdminBC2024!
-- Hash generado con bcrypt (12 rounds)

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
SELECT 
  id,
  "firstName",
  "lastName",
  email,
  role,
  status,
  "emailVerified",
  "createdAt"
FROM users 
WHERE email = 'admin@beautycontrol.co';
