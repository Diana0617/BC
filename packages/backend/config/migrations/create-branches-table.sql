-- Crear tabla branches
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    business_hours JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Índices únicos y de búsqueda
    UNIQUE(business_id, code),
    UNIQUE(business_id, name)
);

-- Índices para optimización de consultas
CREATE INDEX idx_branches_business_id ON branches(business_id);
CREATE INDEX idx_branches_is_active ON branches(is_active);
CREATE INDEX idx_branches_city ON branches(city);
CREATE INDEX idx_branches_state ON branches(state);

-- Comentarios en la tabla
COMMENT ON TABLE branches IS 'Tabla que almacena las sucursales físicas de un negocio';
COMMENT ON COLUMN branches.business_id IS 'Referencia al negocio al que pertenece la sucursal';
COMMENT ON COLUMN branches.code IS 'Código único de la sucursal dentro del negocio';
COMMENT ON COLUMN branches.name IS 'Nombre de la sucursal';
COMMENT ON COLUMN branches.business_hours IS 'Horarios de atención en formato JSON (ej: {"monday": {"open": "09:00", "close": "18:00"}})';
COMMENT ON COLUMN branches.is_active IS 'Indica si la sucursal está activa';