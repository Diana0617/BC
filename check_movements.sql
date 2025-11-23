-- Verificar movimientos para el producto
SELECT * FROM inventory_movements 
WHERE "productId" = 'd92e652f-a5c8-406e-a50d-8effb981ec12'
ORDER BY "createdAt" DESC;

-- Ver el producto y su stock actual
SELECT id, name, sku, "currentStock", "trackInventory"
FROM products 
WHERE id = 'd92e652f-a5c8-406e-a50d-8effb981ec12';

-- Ver facturas relacionadas con este producto
SELECT 
  si.id as invoice_id,
  si."invoiceNumber",
  si.status,
  si."createdAt",
  sii."productId",
  sii.quantity,
  sii."unitCost"
FROM supplier_invoices si
JOIN supplier_invoice_items sii ON si.id = sii."supplierInvoiceId"
WHERE sii."productId" = 'd92e652f-a5c8-406e-a50d-8effb981ec12'
ORDER BY si."createdAt" DESC;
