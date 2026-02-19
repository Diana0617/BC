# Fix: Error 25P02 - Receipts Unique Constraint

**Fecha:** 2026-02-16  
**Error:** `SequelizeDatabaseError: current transaction is aborted, commands ignored until end of transaction block` (código 25P02)

## 🔴 Problema Identificado

El índice UNIQUE `receipts_number_unique` **NO respetaba multi-tenancy**:

```sql
-- ANTES (INCORRECTO)
CREATE UNIQUE INDEX receipts_number_unique ON receipts (receiptNumber);
```

**Consecuencia:** Dos negocios no podían tener el mismo `receiptNumber`, violando aislamiento multi-tenant. 

### Caso Real
- **Negocio A** (5c99c297-...) crea `REC-2026-00002` el 2026-02-05 ✅
- **Negocio B** (ce0cfcad-...) intenta crear `REC-2026-00002` el 2026-02-16 ❌
- PostgreSQL rechaza INSERT → Transacción abortada → Error 25P02

## ✅ Solución Aplicada

Recrear índice UNIQUE con `businessId + receiptNumber`:

```sql
-- DESPUÉS (CORRECTO)
DROP INDEX IF EXISTS receipts_number_unique;
CREATE UNIQUE INDEX receipts_number_unique ON receipts (businessId, receiptNumber);
```

**Resultado:** Cada negocio tiene su propia secuencia de números de recibo.

## 📋 Ejecución del Fix

### En Azure (Producción)
```bash
# Ejecutado en: 2026-02-16T20:XX:XX
PGPASSWORD=BeautyControl2024! psql "host=beautycontrol-db.postgres.database.azure.com ..." -c "
BEGIN;
DROP INDEX IF EXISTS receipts_number_unique;
CREATE UNIQUE INDEX receipts_number_unique ON receipts (\"businessId\", \"receiptNumber\");
COMMIT;
"
```

**Status:** ✅ Aplicado exitosamente

### Verificación
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'receipts' AND indexname = 'receipts_number_unique';

-- Resultado:
-- receipts_number_unique | CREATE UNIQUE INDEX receipts_number_unique 
--                          ON public.receipts USING btree (businessId, receiptNumber)
```

## 🔄 Índices Multi-Tenant Actuales

Tabla `receipts` ahora tiene 3 índices UNIQUE correctos:

1. **`receipts_pkey`**: `(id)` - PK global
2. **`receipts_business_sequence_unique`**: `(businessId, sequenceNumber)` - Secuencia por negocio ✅
3. **`receipts_number_unique`**: `(businessId, receiptNumber)` - Número por negocio ✅ **FIXED**

## 📝 Acciones Complementarias

1. ✅ Limpiar pago de prueba antiguo con método CASH
2. ✅ Verificar foreign keys (todos válidos)
3. ⏳ **SIGUIENTE:** Probar creación de recibo con pago TRANSFER

## 🎯 Test Siguiente

Con datos limpios y fix aplicado, ahora deberías:

1. **Registrar pago** con método "Transferencia" (paymentMethodId: `5727ec69-...`)
2. **Verificar AppointmentPayment** guarda `paymentMethodType='TRANSFER'` (no CASH)
3. **Crear recibo** - No debería fallar con 25P02
4. **Verificar PDF** muestra "Transferencia" (no "Efectivo")

---

**Autor:** GitHub Copilot  
**Ref Issue:** Error 25P02 receipt creation  
**Commit:** Ver historial manual (migrations/ en .gitignore)
