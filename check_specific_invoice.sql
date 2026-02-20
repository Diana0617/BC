-- Buscar la factura específica que está dando error
SELECT 
  id,
  "invoiceNumber",
  status,
  receipt_status,
  jsonb_pretty(items::jsonb) as items_json,
  "createdAt"
FROM supplier_invoices
WHERE id = '5ce9c950-6349-496c-ac10-31b5ff6efd5c';
