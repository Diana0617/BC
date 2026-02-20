-- Ver un ejemplo de item dentro del array JSON
SELECT 
  id,
  "invoiceNumber",
  items->0 as primer_item,
  "createdAt"
FROM supplier_invoices
WHERE "businessId" = '5c99c297-ee8b-4d43-aee1-72f6dfa6e070'
  AND items IS NOT NULL
  AND jsonb_array_length(items::jsonb) > 0
ORDER BY "createdAt" DESC
LIMIT 3;
