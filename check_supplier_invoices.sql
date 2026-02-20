-- Consultar facturas del business específico
SELECT 
  id,
  "invoiceNumber",
  status,
  "receiptStatus",
  items,
  total,
  "createdAt"
FROM supplier_invoices
WHERE "businessId" = '5c99c297-ee8b-4d43-aee1-72f6dfa6e070'
ORDER BY "createdAt" DESC
LIMIT 5;
