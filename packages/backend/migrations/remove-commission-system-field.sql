-- Migración: Eliminar campo use_commission_system de businesses
-- Fecha: 2025-10-12
-- Descripción: Removemos el campo use_commission_system ya que ahora se maneja vía reglas de negocio
--              (SPECIALIST_COMMISSION_ENABLED en rule_templates)

-- Eliminar campo use_commission_system
ALTER TABLE businesses 
DROP COLUMN IF EXISTS use_commission_system;

-- Verificar que el campo fue eliminado
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'businesses' 
  AND column_name = 'use_commission_system';

-- Log
SELECT 'Migración completada: use_commission_system eliminado de businesses. Ahora se usa SPECIALIST_COMMISSION_ENABLED en rule_templates' AS status;
