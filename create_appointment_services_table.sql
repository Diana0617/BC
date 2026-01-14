-- ============================================
-- CREAR TABLA appointment_services EN AZURE
-- Tabla intermedia para relación muchos-a-muchos 
-- entre citas (appointments) y servicios (services)
-- ============================================

BEGIN;

-- Crear la tabla appointment_services
CREATE TABLE IF NOT EXISTS "appointment_services" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "appointmentId" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "price" DECIMAL(10, 2) NOT NULL,
    "duration" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT "fk_appointment_services_appointment" 
        FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_appointment_services_service" 
        FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE,
    
    -- Unique constraint para evitar duplicados
    CONSTRAINT "unique_appointment_service" UNIQUE ("appointmentId", "serviceId")
);

-- Crear índices para optimizar las consultas
CREATE INDEX IF NOT EXISTS "idx_appointment_services_appointmentId" 
    ON "appointment_services"("appointmentId");

CREATE INDEX IF NOT EXISTS "idx_appointment_services_serviceId" 
    ON "appointment_services"("serviceId");

-- Comentarios en las columnas
COMMENT ON COLUMN "appointment_services"."appointmentId" IS 'ID de la cita';
COMMENT ON COLUMN "appointment_services"."serviceId" IS 'ID del servicio';
COMMENT ON COLUMN "appointment_services"."price" IS 'Precio del servicio al momento de la cita (histórico)';
COMMENT ON COLUMN "appointment_services"."duration" IS 'Duración del servicio en minutos al momento de la cita';
COMMENT ON COLUMN "appointment_services"."order" IS 'Orden en que se realizan los servicios';

COMMIT;

SELECT 'TABLA appointment_services CREADA EXITOSAMENTE' AS resultado;
