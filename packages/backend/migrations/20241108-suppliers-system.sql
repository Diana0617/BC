-- Migración: Sistema de Proveedores y Facturas
-- Fecha: 2024-11-08
-- Descripción: Agrega tablas de proveedores, facturas y catálogo de productos

-- 1. Agregar campos a tabla products (si no existen)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS barcode VARCHAR(255),
ADD COLUMN IF NOT EXISTS "imageUrl" VARCHAR(500);

COMMENT ON COLUMN products.description IS 'Descripción detallada del producto';
COMMENT ON COLUMN products.barcode IS 'Código de barras del producto (EAN, UPC, etc.)';
COMMENT ON COLUMN products."imageUrl" IS 'URL de la imagen principal del producto en Cloudinary';

-- 2. Crear índice en barcode para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;

-- 3. Crear tabla suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    "taxId" VARCHAR(50),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    "contactName" VARCHAR(255),
    notes TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE suppliers IS 'Proveedores de productos para el inventario';

-- Índices para suppliers
CREATE INDEX IF NOT EXISTS idx_suppliers_business ON suppliers("businessId");
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers("isActive") WHERE "isActive" = true;
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

-- 4. Crear tabla supplier_invoices
CREATE TABLE IF NOT EXISTS supplier_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    "supplierId" UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    "branchId" UUID REFERENCES branches(id) ON DELETE SET NULL,
    "invoiceNumber" VARCHAR(100),
    "invoiceDate" DATE NOT NULL,
    "dueDate" DATE,
    currency VARCHAR(3) DEFAULT 'COP',
    "taxIncluded" BOOLEAN DEFAULT false,
    "taxPercentage" DECIMAL(5,2) DEFAULT 0.00,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(15,2) DEFAULT 0.00,
    total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'PENDING',
    "fileUrl" VARCHAR(500),
    notes TEXT,
    "approvedAt" TIMESTAMP WITH TIME ZONE,
    "approvedBy" UUID REFERENCES users(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE supplier_invoices IS 'Facturas de compra a proveedores';

-- Índices para supplier_invoices
CREATE INDEX IF NOT EXISTS idx_supplier_invoices_business ON supplier_invoices("businessId");
CREATE INDEX IF NOT EXISTS idx_supplier_invoices_supplier ON supplier_invoices("supplierId");
CREATE INDEX IF NOT EXISTS idx_supplier_invoices_branch ON supplier_invoices("branchId");
CREATE INDEX IF NOT EXISTS idx_supplier_invoices_status ON supplier_invoices(status);
CREATE INDEX IF NOT EXISTS idx_supplier_invoices_date ON supplier_invoices("invoiceDate");

-- 5. Crear tabla supplier_invoice_items
CREATE TABLE IF NOT EXISTS supplier_invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "invoiceId" UUID NOT NULL REFERENCES supplier_invoices(id) ON DELETE CASCADE,
    "productId" UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity DECIMAL(15,3) NOT NULL,
    "unitCost" DECIMAL(15,2) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE supplier_invoice_items IS 'Detalle de productos en facturas de proveedores';

-- Índices para supplier_invoice_items
CREATE INDEX IF NOT EXISTS idx_supplier_invoice_items_invoice ON supplier_invoice_items("invoiceId");
CREATE INDEX IF NOT EXISTS idx_supplier_invoice_items_product ON supplier_invoice_items("productId");

-- 6. Crear tabla supplier_catalog_items
CREATE TABLE IF NOT EXISTS supplier_catalog_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    "supplierId" UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    "supplierSku" VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    brand VARCHAR(100),
    price DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'COP',
    unit VARCHAR(50) DEFAULT 'unidad',
    images JSONB,
    specifications JSONB,
    "lastUpdate" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE supplier_catalog_items IS 'Catálogo de productos que ofrece cada proveedor';

-- Índices para supplier_catalog_items
CREATE INDEX IF NOT EXISTS idx_supplier_catalog_business ON supplier_catalog_items("businessId");
CREATE INDEX IF NOT EXISTS idx_supplier_catalog_supplier ON supplier_catalog_items("supplierId");
CREATE INDEX IF NOT EXISTS idx_supplier_catalog_sku ON supplier_catalog_items("supplierSku");
CREATE INDEX IF NOT EXISTS idx_supplier_catalog_name ON supplier_catalog_items(name);
CREATE INDEX IF NOT EXISTS idx_supplier_catalog_category ON supplier_catalog_items(category);

-- 7. Agregar constraint de unicidad (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_supplier_sku'
    ) THEN
        ALTER TABLE supplier_catalog_items 
        ADD CONSTRAINT unique_supplier_sku 
        UNIQUE ("supplierId", "supplierSku");
    END IF;
END $$;

-- Verificación final
DO $$
BEGIN
    RAISE NOTICE 'Migración completada exitosamente';
    RAISE NOTICE 'Tablas creadas/actualizadas:';
    RAISE NOTICE '  - products (campos: description, barcode, imageUrl)';
    RAISE NOTICE '  - suppliers';
    RAISE NOTICE '  - supplier_invoices';
    RAISE NOTICE '  - supplier_invoice_items';
    RAISE NOTICE '  - supplier_catalog_items';
END $$;
