-- Buscar factura COLUMBIA USA 1233909868
SELECT 
    si.id,
    si."invoiceNumber",
    si."supplierName",
    si.status,
    si."receiptStatus",
    si."issueDate",
    si."totalAmount"
FROM supplier_invoices si
WHERE si."businessId" = '5c99c297-ee8b-4d43-aee1-72f6dfa6e070'
    AND si."invoiceNumber" = '1233909868';
