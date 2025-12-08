-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "businessId" UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50),
  type VARCHAR(50) NOT NULL DEFAULT 'DISTRIBUTOR' CHECK (type IN ('DISTRIBUTOR', 'MANUFACTURER', 'WHOLESALER', 'RETAILER', 'SERVICE_PROVIDER', 'FREELANCER')),
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED', 'UNDER_REVIEW')),
  "taxId" VARCHAR(50),
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  address JSON,
  "contactPerson" JSON,
  categories JSON,
  "paymentTerms" JSON,
  "bankInfo" JSON,
  rating DECIMAL(3, 2),
  "minOrderAmount" DECIMAL(15, 2),
  "deliveryTime" INTEGER,
  notes TEXT,
  tags JSON,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS suppliers_business_id_idx ON suppliers("businessId");
CREATE INDEX IF NOT EXISTS suppliers_name_idx ON suppliers(name);
CREATE INDEX IF NOT EXISTS suppliers_code_idx ON suppliers(code);
CREATE INDEX IF NOT EXISTS suppliers_status_idx ON suppliers(status);
CREATE INDEX IF NOT EXISTS suppliers_type_idx ON suppliers(type);

-- Add unique constraint for code
CREATE UNIQUE INDEX IF NOT EXISTS suppliers_code_unique_idx ON suppliers(code) WHERE code IS NOT NULL;
