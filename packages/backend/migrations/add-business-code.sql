-- Migración para agregar businessCode a la tabla businesses
-- Fecha: 2025-09-14
-- Propósito: Habilitar login móvil con código de negocio

-- Agregar la columna businessCode
ALTER TABLE businesses 
ADD COLUMN business_code VARCHAR(8) UNIQUE;

-- Crear índice para búsquedas rápidas
CREATE INDEX idx_businesses_business_code ON businesses(business_code);

-- Generar códigos únicos para negocios existentes
DO $$
DECLARE
    business_record RECORD;
    new_code VARCHAR(8);
    code_exists BOOLEAN;
    attempt_count INTEGER;
BEGIN
    FOR business_record IN SELECT id FROM businesses WHERE business_code IS NULL LOOP
        attempt_count := 0;
        
        -- Generar código único para cada negocio existente
        LOOP
            -- Generar código de 6 caracteres (ABC123)
            new_code := 
                chr(65 + floor(random() * 26)::int) ||  -- A-Z
                chr(65 + floor(random() * 26)::int) ||  -- A-Z
                chr(65 + floor(random() * 26)::int) ||  -- A-Z
                floor(random() * 10)::text ||           -- 0-9
                floor(random() * 10)::text ||           -- 0-9
                floor(random() * 10)::text;             -- 0-9
            
            -- Verificar si el código ya existe
            SELECT EXISTS(SELECT 1 FROM businesses WHERE business_code = new_code) INTO code_exists;
            
            -- Si no existe, usar este código
            IF NOT code_exists THEN
                UPDATE businesses 
                SET business_code = new_code 
                WHERE id = business_record.id;
                EXIT;
            END IF;
            
            attempt_count := attempt_count + 1;
            
            -- Si se hacen más de 50 intentos, usar un código basado en timestamp
            IF attempt_count > 50 THEN
                new_code := 'BC' || extract(epoch from now())::bigint::text;
                new_code := right(new_code, 8);
                UPDATE businesses 
                SET business_code = new_code 
                WHERE id = business_record.id;
                EXIT;
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- Hacer la columna NOT NULL después de poblarla
ALTER TABLE businesses 
ALTER COLUMN business_code SET NOT NULL;

-- Comentarios para documentación
COMMENT ON COLUMN businesses.business_code IS 'Código único de 6-8 caracteres para identificar el negocio en la app móvil. Formato: ABC123';