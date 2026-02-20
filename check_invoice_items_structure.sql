-- Ver la estructura detallada de items en facturas
SELECT 
  id,
  "invoiceNumber",
  status,
  jsonb_pretty(items::jsonb) as items_formatted,
  "createdAt"
FROM supplier_invoices
WHERE "businessId" = '5c99c297-ee8b-4d43-aee1-72f6dfa6e070'
ORDER BY "createdAt" DESC
LIMIT 2;
