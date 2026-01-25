# Fix para error de Foreign Key en Receipts

## Problema
Al crear un recibo desde una cita, el sistema intentaba asignar el `clientId` (de la tabla `clients`) al campo `userId` (que tiene una foreign key a la tabla `users`), causando un error de violación de foreign key constraint.

## Error Original
```
SequelizeForeignKeyConstraintError: insert or update on table "receipts" violates foreign key constraint "receipts_userId_fkey"
detail: 'Key (userId)=(448c4304-567e-4031-b716-1d9be0af8caf) is not present in table "users".'
```

## Causa
El campo `userId` en el modelo Receipt estaba siendo usado incorrectamente:
- Se intentaba almacenar el ID de un cliente (`clients` table)
- Pero la foreign key apuntaba a la tabla `users`
- Los clientes NO son usuarios del sistema

## Solución Implementada

### 1. Modelo Receipt Actualizado
- `userId` ahora es **nullable**
- Su propósito correcto es almacenar el usuario que **registró el pago** (no el cliente)
- Los datos del cliente se mantienen en campos desnormalizados: `clientName`, `clientPhone`, `clientEmail`

### 2. Cambios en el Código
- **Archivo**: `packages/backend/src/models/Receipt.js`
  - Línea ~76: `userId` ahora permite `NULL`
  - Línea ~384: Ya no se asigna `clientId` a `userId`
  - Se asigna `options.createdBy` (el usuario que crea el recibo)

### 3. Migración de Base de Datos
- **Archivo**: `packages/backend/src/migrations/20260125000001-fix-receipts-userId-nullable.js`
- **Script SQL**: `fix_receipts_userId_nullable.sql`

## Pasos para Desplegar

### En Desarrollo Local
```bash
cd packages/backend
npm run db:migrate
```

### En Azure Production
1. Conectarse a la base de datos PostgreSQL en Azure
2. Ejecutar el script: `fix_receipts_userId_nullable.sql`

O usar la migración de Sequelize:
```bash
npm run db:migrate
```

## Verificación

Después de aplicar la migración, verificar:

```sql
-- Ver la definición de la columna
SELECT 
  column_name, 
  is_nullable, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'receipts' 
  AND column_name = 'userId';

-- Resultado esperado: is_nullable = 'YES'

-- Ver cuántos receipts tienen o no userId
SELECT 
  COUNT(*) FILTER (WHERE "userId" IS NULL) as sin_usuario,
  COUNT(*) FILTER (WHERE "userId" IS NOT NULL) as con_usuario,
  COUNT(*) as total
FROM receipts;
```

## Impacto

✅ **Positivo**:
- Los recibos ahora se pueden crear sin errores
- Separación clara entre cliente (datos desnormalizados) y usuario del sistema
- El PDF de recibos sigue funcionando (ya tenía fallback para `receipt.user`)

⚠️ **A tener en cuenta**:
- Receipts antiguos pueden tener `userId` NULL después de la migración
- El campo `userId` ahora representa quién registró el pago, no el cliente
- Los datos del cliente siempre están en `clientName`, `clientPhone`, `clientEmail`

## Fecha
25 de enero de 2026
