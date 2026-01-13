-- Actualizar transactionDate de FinancialMovements existentes para APPOINTMENTS
-- Para que usen la fecha del appointment en lugar de createdAt

UPDATE financial_movements fm
SET "transactionDate" = DATE(a."startTime")
FROM appointments a
WHERE 
  fm.category = 'APPOINTMENT' 
  AND fm."referenceType" = 'APPOINTMENT'
  AND fm."referenceId" = a.id;

-- Verificar los resultados
SELECT 
  fm.id,
  fm.description,
  fm.category,
  DATE(a."startTime") as appointment_date,
  fm."transactionDate" as current_transaction_date,
  fm."createdAt"
FROM financial_movements fm
LEFT JOIN appointments a ON fm."referenceId" = a.id AND fm."referenceType" = 'APPOINTMENT'
WHERE fm.category = 'APPOINTMENT'
ORDER BY fm."transactionDate" DESC
LIMIT 10;