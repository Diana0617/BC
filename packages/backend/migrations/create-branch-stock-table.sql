-- Migración: Crear tabla de stock por sucursal
-- Fecha: 2025-11-06
-- Descripción: Permite que cada sucursal maneje su propio inventario de forma independiente

-- 1. Crear tabla branch_stocks
CREATE TABLE IF NOT EXISTS branch_stocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  max_stock INTEGER NOT NULL DEFAULT 0,
  last_count_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraint: Un producto solo puede tener un registro por sucursal
  UNIQUE(branch_id, product_id)
);

-- 2. Crear índices para mejorar performance
CREATE INDEX idx_branch_stocks_business ON branch_stocks(business_id);
CREATE INDEX idx_branch_stocks_branch ON branch_stocks(branch_id);
CREATE INDEX idx_branch_stocks_product ON branch_stocks(product_id);
CREATE INDEX idx_branch_stocks_low_stock ON branch_stocks(current_stock, min_stock) 
  WHERE current_stock <= min_stock;

-- 3. Actualizar tabla products - agregar campos de tipo de producto
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS product_type VARCHAR(20) DEFAULT 'BOTH',
ADD COLUMN IF NOT EXISTS requires_specialist_tracking BOOLEAN DEFAULT false;

-- Validar valores de product_type
ALTER TABLE products 
ADD CONSTRAINT check_product_type 
CHECK (product_type IN ('FOR_SALE', 'FOR_PROCEDURES', 'BOTH'));

-- 4. Actualizar tabla inventory_movements - agregar campos de sucursal y especialista
ALTER TABLE inventory_movements
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id),
ADD COLUMN IF NOT EXISTS specialist_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES appointments(id),
ADD COLUMN IF NOT EXISTS from_branch_id UUID REFERENCES branches(id),
ADD COLUMN IF NOT EXISTS to_branch_id UUID REFERENCES branches(id);

-- Crear índices para los nuevos campos
CREATE INDEX IF NOT EXISTS idx_inventory_movements_branch ON inventory_movements(branch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_specialist ON inventory_movements(specialist_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_appointment ON inventory_movements(appointment_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_from_branch ON inventory_movements(from_branch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_to_branch ON inventory_movements(to_branch_id);

-- 5. Actualizar tabla purchase_orders - agregar branch_id
ALTER TABLE purchase_orders
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_branch ON purchase_orders(branch_id);

-- 6. Actualizar tabla supplier_invoices - agregar campos de pagos parciales
ALTER TABLE supplier_invoices
ADD COLUMN IF NOT EXISTS payment_schedule JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS payment_reminders JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS cloudinary_invoice_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id);

CREATE INDEX IF NOT EXISTS idx_supplier_invoices_branch ON supplier_invoices(branch_id);

-- 7. Comentarios para documentación
COMMENT ON TABLE branch_stocks IS 'Stock de productos por sucursal - permite gestión independiente de inventario';
COMMENT ON COLUMN branch_stocks.current_stock IS 'Stock actual disponible en la sucursal';
COMMENT ON COLUMN branch_stocks.min_stock IS 'Stock mínimo antes de generar alerta';
COMMENT ON COLUMN branch_stocks.max_stock IS 'Stock máximo recomendado';
COMMENT ON COLUMN branch_stocks.last_count_date IS 'Fecha del último conteo físico';

COMMENT ON COLUMN products.product_type IS 'Tipo de producto: FOR_SALE (solo venta), FOR_PROCEDURES (solo procedimientos), BOTH (ambos)';
COMMENT ON COLUMN products.requires_specialist_tracking IS 'Indica si se debe rastrear qué especialista retira el producto';

COMMENT ON COLUMN inventory_movements.branch_id IS 'Sucursal donde ocurre el movimiento';
COMMENT ON COLUMN inventory_movements.specialist_id IS 'Especialista que retira el producto (para procedimientos)';
COMMENT ON COLUMN inventory_movements.appointment_id IS 'Cita asociada al movimiento (si aplica)';
COMMENT ON COLUMN inventory_movements.from_branch_id IS 'Sucursal de origen (transferencias)';
COMMENT ON COLUMN inventory_movements.to_branch_id IS 'Sucursal de destino (transferencias)';

-- 8. Función para sincronizar stock global desde sucursales
CREATE OR REPLACE FUNCTION sync_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar el stock global del producto sumando todos los stocks de sucursales
  UPDATE products 
  SET current_stock = (
    SELECT COALESCE(SUM(current_stock), 0) 
    FROM branch_stocks 
    WHERE product_id = NEW.product_id
  )
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para sincronización automática
DROP TRIGGER IF EXISTS trigger_sync_product_stock ON branch_stocks;
CREATE TRIGGER trigger_sync_product_stock
  AFTER INSERT OR UPDATE OF current_stock OR DELETE ON branch_stocks
  FOR EACH ROW
  EXECUTE FUNCTION sync_product_stock();

-- 9. Vista para stock consolidado con alertas
CREATE OR REPLACE VIEW v_branch_stock_alerts AS
SELECT 
  bs.id,
  bs.business_id,
  bs.branch_id,
  b.name as branch_name,
  bs.product_id,
  p.name as product_name,
  p.sku,
  bs.current_stock,
  bs.min_stock,
  bs.max_stock,
  CASE 
    WHEN bs.current_stock = 0 THEN 'OUT_OF_STOCK'
    WHEN bs.current_stock <= bs.min_stock THEN 'LOW_STOCK'
    WHEN bs.current_stock >= bs.max_stock THEN 'OVERSTOCK'
    ELSE 'OK'
  END as stock_status,
  bs.last_count_date,
  bs.created_at,
  bs.updated_at
FROM branch_stocks bs
JOIN branches b ON bs.branch_id = b.id
JOIN products p ON bs.product_id = p.id
WHERE p.track_inventory = true;

COMMENT ON VIEW v_branch_stock_alerts IS 'Vista consolidada de stock por sucursal con indicadores de alerta';

-- 10. Verificar que la extensión uuid-ossp esté instalada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Migración completada exitosamente
