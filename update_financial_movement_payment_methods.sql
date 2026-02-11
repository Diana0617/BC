-- Actualizar ENUM de paymentMethod en FinancialMovement
-- Este script añade los nuevos métodos de pago al ENUM existente

-- 1. Primero, verificar el ENUM actual
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value
FROM 
    pg_type t 
JOIN 
    pg_enum e ON t.oid = e.enumtypid  
WHERE 
    t.typname = 'enum_financial_movements_paymentMethod'
ORDER BY 
    e.enumsortorder;

-- 2. Añadir los nuevos valores al ENUM
-- Nota: Esta operación es segura, solo añade valores sin eliminar los existentes

ALTER TYPE "enum_financial_movements_paymentMethod" ADD VALUE IF NOT EXISTS 'CARD';
ALTER TYPE "enum_financial_movements_paymentMethod" ADD VALUE IF NOT EXISTS 'TRANSFER';
ALTER TYPE "enum_financial_movements_paymentMethod" ADD VALUE IF NOT EXISTS 'QR';
ALTER TYPE "enum_financial_movements_paymentMethod" ADD VALUE IF NOT EXISTS 'ONLINE';
ALTER TYPE "enum_financial_movements_paymentMethod" ADD VALUE IF NOT EXISTS 'OTHER';

-- 3. Verificar que se añadieron correctamente
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value
FROM 
    pg_type t 
JOIN 
    pg_enum e ON t.oid = e.enumtypid  
WHERE 
    t.typname = 'enum_financial_movements_paymentMethod'
ORDER BY 
    e.enumsortorder;

-- 4. (OPCIONAL) Si necesitas mapear valores antiguos a nuevos:
-- UPDATE financial_movements SET "paymentMethod" = 'TRANSFER' WHERE "paymentMethod" = 'BANK_TRANSFER';

-- NOTAS:
-- - Los valores ya existentes (CASH, CREDIT_CARD, DEBIT_CARD, etc.) permanecen intactos
-- - Los nuevos valores (CARD, TRANSFER, QR, ONLINE, OTHER) ahora son válidos
-- - Esto permite que el sistema guarde pagos con cualquiera de estos métodos
-- - No es necesario reiniciar el backend después de ejecutar este script
