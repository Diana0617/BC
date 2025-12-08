-- Agregar columna business_id a la tabla clients
-- CRÍTICO para seguridad: Los clientes deben estar asociados a un negocio específico

-- Agregar la columna business_id
ALTER TABLE clients 
ADD COLUMN business_id UUID;

-- Crear índice para mejorar rendimiento de búsquedas por negocio
CREATE INDEX idx_clients_business_id ON clients(business_id);

-- Agregar foreign key constraint
ALTER TABLE clients
ADD CONSTRAINT fk_clients_business
FOREIGN KEY (business_id)
REFERENCES businesses(id)
ON DELETE CASCADE;

-- Agregar comentario
COMMENT ON COLUMN clients.business_id IS 'ID del negocio al que pertenece el cliente (REQUERIDO para seguridad)';

-- NOTA: Los clientes existentes tendrán business_id = NULL
-- Esto está OK porque podemos asignarlos manualmente o eliminarlos si no tienen negocio asociado
