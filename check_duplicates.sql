-- Productos con más de 1 movimiento PURCHASE por factura (duplicados por bug)
SELECT 
  si."invoiceNumber",
  si.status,
  si.receipt_status,
  p.sku,
  p.name as producto,
  COUNT(im.id) as movimientos,
  SUM(im.quantity) as qty_total_cargada,
  p."currentStock" as stock_actual
FROM supplier_invoices si
JOIN inventory_movements im 
  ON im."referenceId" = si.id 
  AND im."referenceType" = 'SUPPLIER_INVOICE'
  AND im."movementType" = 'PURCHASE'
JOIN products p ON im."productId" = p.id
WHERE si."businessId" = '5c99c297-ee8b-4d43-aee1-72f6dfa6e070'
GROUP BY si.id, si."invoiceNumber", si.status, si.receipt_status, p.id, p.sku, p.name, p."currentStock"
HAVING COUNT(im.id) > 1
ORDER BY si."invoiceNumber", p.sku;
