-- Verificar turnos abiertos actualmente
SELECT 
  "CashRegisterShifts"."id",
  "CashRegisterShifts"."businessId",
  "CashRegisterShifts"."branchId",
  "CashRegisterShifts"."userId",
  "CashRegisterShifts"."status",
  "CashRegisterShifts"."openedAt",
  "CashRegisterShifts"."closedAt",
  "Branch"."name" as "branchName",
  "User"."firstName" || ' ' || "User"."lastName" as "userName"
FROM "CashRegisterShifts"
LEFT JOIN "Branches" as "Branch" ON "CashRegisterShifts"."branchId" = "Branch"."id"
LEFT JOIN "Users" as "User" ON "CashRegisterShifts"."userId" = "User"."id"
WHERE "CashRegisterShifts"."status" = 'OPEN'
ORDER BY "CashRegisterShifts"."openedAt" DESC;
