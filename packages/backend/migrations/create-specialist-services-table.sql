-- Migration: Create specialist_services table for custom pricing
-- Description: Allows specialists to have custom prices for services they offer
-- Date: 2025-10-10

-- Create specialist_services table
CREATE TABLE IF NOT EXISTS specialist_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "specialistId" UUID NOT NULL,
  "serviceId" UUID NOT NULL,
  "customPrice" DECIMAL(10, 2),
  "isActive" BOOLEAN DEFAULT TRUE,
  "skillLevel" VARCHAR(50) CHECK ("skillLevel" IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')),
  "averageDuration" INTEGER,
  "commissionPercentage" DECIMAL(5, 2) CHECK ("commissionPercentage" >= 0 AND "commissionPercentage" <= 100),
  "canBeBooked" BOOLEAN DEFAULT TRUE,
  "requiresApproval" BOOLEAN DEFAULT FALSE,
  "maxBookingsPerDay" INTEGER CHECK ("maxBookingsPerDay" >= 1),
  "assignedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "assignedBy" UUID,
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign keys
  CONSTRAINT fk_specialist_service_specialist FOREIGN KEY ("specialistId") 
    REFERENCES "Users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_specialist_service_service FOREIGN KEY ("serviceId") 
    REFERENCES "Services"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_specialist_service_assigned_by FOREIGN KEY ("assignedBy") 
    REFERENCES "Users"(id) ON DELETE SET NULL ON UPDATE CASCADE,
  
  -- Unique constraint: a specialist can only have one entry per service
  CONSTRAINT unique_specialist_service UNIQUE ("specialistId", "serviceId"),
  
  -- Check constraint: customPrice must be >= 0 if not null
  CONSTRAINT check_custom_price CHECK ("customPrice" IS NULL OR "customPrice" >= 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_specialist_service_specialist ON specialist_services("specialistId");
CREATE INDEX IF NOT EXISTS idx_specialist_service_service ON specialist_services("serviceId");
CREATE INDEX IF NOT EXISTS idx_specialist_service_active ON specialist_services("isActive");
CREATE INDEX IF NOT EXISTS idx_specialist_service_bookable ON specialist_services("canBeBooked");

-- Add comments
COMMENT ON TABLE specialist_services IS 'Many-to-many relationship between specialists and services with custom pricing';
COMMENT ON COLUMN specialist_services."specialistId" IS 'Specialist user offering the service';
COMMENT ON COLUMN specialist_services."serviceId" IS 'Service offered by the specialist';
COMMENT ON COLUMN specialist_services."customPrice" IS 'Custom price for this specialist. NULL means use base service price';
COMMENT ON COLUMN specialist_services."isActive" IS 'If specialist currently offers this service';
COMMENT ON COLUMN specialist_services."skillLevel" IS 'Specialist skill level for this service';
COMMENT ON COLUMN specialist_services."averageDuration" IS 'Average time in minutes for this specialist to complete service';
COMMENT ON COLUMN specialist_services."commissionPercentage" IS 'Custom commission percentage for this specialist on this service';
COMMENT ON COLUMN specialist_services."canBeBooked" IS 'If this service can be booked online for this specialist';
COMMENT ON COLUMN specialist_services."requiresApproval" IS 'If appointments for this service require specialist approval';
COMMENT ON COLUMN specialist_services."maxBookingsPerDay" IS 'Max bookings per day for this specific service';
COMMENT ON COLUMN specialist_services."assignedAt" IS 'Date when service was assigned to specialist';
COMMENT ON COLUMN specialist_services."assignedBy" IS 'User who made the assignment';
COMMENT ON COLUMN specialist_services.notes IS 'Notes about specialist offering this service';

-- Migration success
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: specialist_services table created successfully';
END $$;
