-- Migración: Agregar campo de sistema de comisiones a businesses
-- Fecha: 2025-10-12
-- Descripción: Permite a los negocios definir si usan sistema de comisiones o pago fijo (sueldo)

-- Agregar campo use_commission_system
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS use_commission_system BOOLEAN DEFAULT true NOT NULL;

-- Agregar comentario
COMMENT ON COLUMN businesses.use_commission_system IS 'Define si el negocio usa sistema de comisiones (true) o pago fijo/sueldo (false) para sus especialistas';

-- Actualizar negocios existentes (por defecto usan comisiones para mantener compatibilidad)
UPDATE businesses 
SET use_commission_system = true 
WHERE use_commission_system IS NULL;

-- Log
SELECT 'Migración completada: use_commission_system agregado a businesses' AS status;
