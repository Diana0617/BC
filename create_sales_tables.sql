-- ============================================================
-- VERIFICAR Y CREAR TABLAS DE VENTAS
-- ============================================================

-- Verificar si existe la tabla sales
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'sales'
);

-- Si no existe, crearla:
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    "branchId" UUID REFERENCES branches(id),
    "saleNumber" VARCHAR(255) NOT NULL UNIQUE,
    "userId" UUID NOT NULL REFERENCES users(id),
    "clientId" UUID REFERENCES clients(id),
    "shiftId" UUID REFERENCES cash_register_shifts(id),
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount DECIMAL(15,2) NOT NULL DEFAULT 0,
    "discountType" VARCHAR(50) NOT NULL DEFAULT 'NONE' CHECK ("discountType" IN ('PERCENTAGE', 'FIXED', 'NONE')),
    "discountValue" DECIMAL(10,2),
    tax DECIMAL(15,2) NOT NULL DEFAULT 0,
    "taxPercentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    total DECIMAL(15,2) NOT NULL DEFAULT 0,
    "paymentMethod" VARCHAR(50) NOT NULL DEFAULT 'CASH' CHECK ("paymentMethod" IN ('CASH', 'CARD', 'TRANSFER', 'MIXED', 'OTHER')),
    "paymentDetails" JSONB DEFAULT '{}',
    "paidAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "changeAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'CANCELLED', 'REFUNDED', 'PENDING')),
    "cancelledAt" TIMESTAMP,
    "cancelledBy" UUID REFERENCES users(id),
    "cancellationReason" TEXT,
    "refundedAt" TIMESTAMP,
    "refundedBy" UUID REFERENCES users(id),
    "refundReason" TEXT,
    notes TEXT,
    "receiptId" UUID REFERENCES receipts(id),
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Crear índices para sales
CREATE INDEX IF NOT EXISTS idx_sales_business_id ON sales("businessId");
CREATE INDEX IF NOT EXISTS idx_sales_branch_id ON sales("branchId");
CREATE INDEX IF NOT EXISTS idx_sales_sale_number ON sales("saleNumber");
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales("userId");
CREATE INDEX IF NOT EXISTS idx_sales_client_id ON sales("clientId");
CREATE INDEX IF NOT EXISTS idx_sales_shift_id ON sales("shiftId");
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales("createdAt");

-- Verificar si existe la tabla sale_items
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'sale_items'
);

-- Si no existe, crearla:
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "saleId" UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    "productId" UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    "unitPrice" DECIMAL(10,2) NOT NULL CHECK ("unitPrice" >= 0),
    "unitCost" DECIMAL(10,2) CHECK ("unitCost" >= 0),
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount DECIMAL(15,2) NOT NULL DEFAULT 0,
    "discountType" VARCHAR(50) NOT NULL DEFAULT 'NONE' CHECK ("discountType" IN ('PERCENTAGE', 'FIXED', 'NONE')),
    "discountValue" DECIMAL(10,2),
    tax DECIMAL(15,2) NOT NULL DEFAULT 0,
    "taxPercentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    total DECIMAL(15,2) NOT NULL DEFAULT 0,
    profit DECIMAL(15,2) CHECK (profit >= 0),
    "inventoryMovementId" UUID REFERENCES inventory_movements(id),
    notes TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Crear índices para sale_items
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items("saleId");
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items("productId");
CREATE INDEX IF NOT EXISTS idx_sale_items_inventory_movement_id ON sale_items("inventoryMovementId");

-- Verificar que las tablas fueron creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('sales', 'sale_items')
ORDER BY table_name;

-- Mensaje de confirmación
SELECT 'Tablas sales y sale_items verificadas/creadas exitosamente' as resultado;
