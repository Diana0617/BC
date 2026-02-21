-- Buscar factura C_1
SELECT 
    id,
    "invoiceNumber",
    status,
    receipt_status,
    "issueDate",
    total_amount,
    "supplierId"
FROM supplier_invoices
WHERE "businessId" = '5c99c297-ee8b-4d43-aee1-72f6dfa6e070'
    AND "invoiceNumber" = 'C_1';

-- Actualizar estado de recepción a FULLY_RECEIVED
UPDATE supplier_invoices
SET receipt_status = 'FULLY_RECEIVED'
WHERE "businessId" = '5c99c297-ee8b-4d43-aee1-72f6dfa6e070'
    AND "invoiceNumber" = 'C_1';

-- Verificar el cambio
SELECT 
    id,
    "invoiceNumber",
    status,
    receipt_status,
    "issueDate",
    total_amount
FROM supplier_invoices
WHERE "businessId" = '5c99c297-ee8b-4d43-aee1-72f6dfa6e070'
    AND "invoiceNumber" = 'C_1';
