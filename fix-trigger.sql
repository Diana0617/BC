-- Eliminar el trigger que causa el error
DROP TRIGGER IF EXISTS sync_product_stock_trigger ON branch_stocks;

-- Eliminar la función del trigger
DROP FUNCTION IF EXISTS sync_product_stock();
