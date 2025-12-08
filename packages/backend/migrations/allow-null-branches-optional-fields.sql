-- Permitir NULL en campos opcionales de branches
-- Esto permite crear sucursales sin datos completos durante la configuración inicial

-- Modificar columna address para permitir NULL
ALTER TABLE branches 
ALTER COLUMN address DROP NOT NULL;

-- Modificar columna city para permitir NULL
ALTER TABLE branches 
ALTER COLUMN city DROP NOT NULL;

-- La columna email ya permite NULL, no requiere cambios

COMMENT ON COLUMN branches.address IS 'Dirección de la sucursal (opcional durante configuración inicial)';
COMMENT ON COLUMN branches.city IS 'Ciudad de la sucursal (opcional durante configuración inicial)';
