-- Crear el tipo ENUM para el tipo de negocio
DO $$ BEGIN
    CREATE TYPE enum_businesses_type AS ENUM (
        'BEAUTY_SALON',
        'BARBERSHOP',
        'SPA',
        'NAIL_SALON',
        'AESTHETIC_CENTER',
        'PET_CENTER',
        'MEDICAL_OFFICE',
        'DENTAL_OFFICE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Agregar la columna type a la tabla businesses
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS type enum_businesses_type;

COMMENT ON COLUMN businesses.type IS 'Tipo de negocio/establecimiento';

-- Confirmar el cambio
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'businesses' AND column_name = 'type';
