-- Ver facturas de proveedores del negocio
SELECT 
    id,
    "invoiceNumber",
    status,
    receipt_status,
    "issueDate",
    "totalAmount",
    "supplierId"
FROM supplier_invoices
WHERE "businessId" = '5c99c297-ee8b-4d43-aee1-72f6dfa6e070'
    AND "invoiceNumber" = '1233909868'
ORDER BY "createdAt" DESC;
