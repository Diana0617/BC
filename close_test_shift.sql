-- Cerrar el turno de prueba de Mercedes Lobeto (sucursal "Testeando")
-- ID: ba3bea1f-60c2-4ada-9e08-ab828a6531e1

-- Primero ver los datos actuales del turno
SELECT 
  id,
  "shiftNumber",
  status,
  "openingBalance",
  "openedAt",
  "closedAt",
  "expectedClosingBalance",
  "actualClosingBalance",
  difference
FROM cash_register_shifts
WHERE id = 'ba3bea1f-60c2-4ada-9e08-ab828a6531e1';

-- Cerrar el turno
UPDATE cash_register_shifts
SET 
  status = 'CLOSED',
  "closedAt" = NOW(),
  "actualClosingBalance" = COALESCE("openingBalance", 0),
  "expectedClosingBalance" = COALESCE("openingBalance", 0),
  difference = 0,
  "closingNotes" = 'Cerrado automáticamente - Turno de prueba duplicado'
WHERE id = 'ba3bea1f-60c2-4ada-9e08-ab828a6531e1'
  AND status = 'OPEN';

-- Verificar que se cerró
SELECT 
  id,
  "shiftNumber",
  status,
  "openingBalance",
  "openedAt",
  "closedAt",
  "closingNotes"
FROM cash_register_shifts
WHERE id = 'ba3bea1f-60c2-4ada-9e08-ab828a6531e1';
