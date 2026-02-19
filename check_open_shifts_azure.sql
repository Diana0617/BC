-- Verificar turnos abiertos actualmente (Azure PostgreSQL)
SELECT 
  crs.id,
  crs."businessId",
  crs."branchId",
  crs."userId",
  crs.status,
  crs."openedAt",
  crs."closedAt",
  b.name as "branchName",
  u."firstName" || ' ' || u."lastName" as "userName"
FROM cash_register_shifts crs
LEFT JOIN branches b ON crs."branchId" = b.id
LEFT JOIN users u ON crs."userId" = u.id
WHERE crs.status = 'OPEN'
ORDER BY crs."openedAt" DESC;
