# Arreglos Caja Registradora - 19 de Febrero 2026

## Problemas Identificados y Corregidos

### 1. ✅ Métodos de Pago Mostrando Código en Lugar de Nombre Personalizado

**Problema:** En la lista de movimientos, se mostraba "TRANSFER" en lugar de "transferencia" (el nombre personalizado del negocio).

**Solución:** 
- **Frontend (CashRegisterMovementsUnified.jsx):** Se modificó la visualización para usar `movement.paymentMethodName` preferentemente, con fallback a la traducción hardcoded del enum solo cuando no hay nombre personalizado.

```javascript
// ANTES
{movement.paymentMethod === 'TRANSFER' ? 'Transferencia' : movement.paymentMethod}

// AHORA
{movement.paymentMethodName || 
 (movement.paymentMethod === 'CASH' ? 'Efectivo' :
  movement.paymentMethod === 'CARD' ? 'Tarjeta' :
  movement.paymentMethod === 'TRANSFER' ? 'Transferencia' :
  movement.paymentMethod === 'WOMPI' ? 'Wompi' :
  movement.paymentMethod)}
```

**Archivos Modificados:**
- `packages/web-app/src/components/specialist/cash-register/CashRegisterMovementsUnified.jsx` (línea 613)

---

### 2. ✅ Pagos con QR No Generan Recibo Automáticamente

**Problema:** Cuando se hacía un pago con método QR, NO se generaba el recibo en PDF automáticamente.

**Causas Identificadas:**
1. El modelo `Receipt.js` tenía referencias a campos inexistentes en `Appointment` (`baseAmount`, `tax`, `tip`, `finalAmount`)
2. El modelo también buscaba `appointmentData.service` (minúscula) cuando Sequelize returna `Service` (mayúscula capitalizada)
3. Faltaban logs detallados para debuggear el flujo

**Soluciones Implementadas:**

#### a) Actualización del Modelo Receipt.js

**Corrección de campos de Appointment:**
```javascript
// ANTES
subtotal: appointmentData.baseAmount || paymentData.amount,
tax: appointmentData.tax || 0,
totalAmount: appointmentData.finalAmount || paymentData.amount,

// AHORA
subtotal: appointmentData.totalAmount || paymentData.amount,
tax: 0,
discount: appointmentData.discountAmount || 0,
totalAmount: appointmentData.totalAmount || paymentData.amount,
```

**Corrección de referencia a Service:**
```javascript
// ANTES
serviceName: ... (appointmentData.service?.name || 'Servicio'),

// AHORA
serviceName: ... (appointmentData.Service?.name || appointmentData.service?.name || 'Servicio'),
```

#### b) Mejora de Logs en AppointmentPaymentController.js

Se agregaron logs extensivos para rastrear el flujo completo:
- Estado del pago (PAID, PARTIAL, PENDING)
- Verificación de recibo existente
- Carga de relaciones del appointment
- Creación del recibo
- Errores detallados con stack trace

```javascript
console.log(`📊 [recordPayment] paymentStatus: ${paymentStatus}, totalPaid: ${totalPaid}`);
console.log('🧾 [recordPayment] ✅ Payment PAID - Creando recibo automáticamente...');
console.log('🧾 [recordPayment] fullAppointment cargado:', {
  id: fullAppointment.id,
  hasService: !!fullAppointment.Service,
  hasClient: !!fullAppointment.Client,
  hasSpecialist: !!fullAppointment.specialist,
  totalAmount: fullAppointment.totalAmount
});
```

**Archivos Modificados:**
- `packages/backend/src/models/Receipt.js` (líneas 410-424)
- `packages/backend/src/controllers/AppointmentPaymentController.js` (líneas 275-320)

---

## Cómo Probar los Cambios

### 1. Probar Nombres de Métodos de Pago Personalizados

1. Ve a Caja Registradora → Movimientos
2. Verifica que los pagos con métodos personalizados del negocio (ej: "transferencia", "Qr") muestren el nombre personalizado, NO el código ENUM (TRANSFER, QR)

### 2. Probar Generación de Recibo QR

1. Ve a una cita pendiente
2. Haz un pago usando el método QR
3. **Verifica en Consola del Backend:**
   - Busca logs con prefijo `🧾 [recordPayment]`
   - Debe mostrar: "✅ Payment PAID - Creando recibo automáticamente..."
   - Debe indicar si el recibo se creó o si ya existía
   - Si hay error, mostrará el stack trace completo
4. **Verifica en Caja:** El recibo debe aparecer en la lista de movimientos

### 3. Verificar Cierre de Caja

Si tienes problemas cerrando caja:

1. **Verifica que tienes un turno abierto:**
   - Ejecuta el archivo `check_open_shifts.sql` en tu cliente PostgreSQL
   - Busca tu userId

2. **Si no aparece tu turno:**
   - El problema puede ser que el turno se abrió en otra sucursal
   - Verifica que `selectedBranchId` en el UI coincida con el `branchId` del turno abierto
   - El sistema ahora debería auto-actualizar el selector de sucursal

3. **Si aparece el turno pero no se puede cerrar:**
   - Mira la consola del navegador en busca de errores
   - Verifica que `shiftData` esté cargado (debería verse en Network tab cuando haces click en "Cerrar Caja")
   - Endpoint esperado: `GET /api/cash-register/shift/{shiftId}?businessId={bizId}`

---

## Script SQL de Diagnóstico

Se creó `check_open_shifts.sql` para verificar turnos abiertos:

```sql
SELECT 
  "CashRegisterShifts"."id",
  "CashRegisterShifts"."businessId",
  "CashRegisterShifts"."branchId",
  "CashRegisterShifts"."userId",
  "CashRegisterShifts"."status",
  "CashRegisterShifts"."openedAt",
  "Branch"."name" as "branchName",
  "User"."firstName" || ' ' || "User"."lastName" as "userName"
FROM "CashRegisterShifts"
LEFT JOIN "Branches" as "Branch" ON "CashRegisterShifts"."branchId" = "Branch"."id"
LEFT JOIN "Users" as "User" ON "CashRegisterShifts"."userId" = "User"."id"
WHERE "CashRegisterShifts"."status" = 'OPEN'
ORDER BY "CashRegisterShifts"."openedAt" DESC;
```

---

## Notas Importantes

1. **Los logs son muy detallados ahora:** Revisa la consola del backend cuando hagas un pago para ver el flujo completo de creación de recibos.

2. **Cierre de Caja:** Si sigues teniendo problemas con el cierre:
   - Comparte los logs del navegador (F12 → Console)
   - Ejecuta el script SQL y comparte el resultado
   - Esto nos permitirá identificar si el problema es de detección de turno o carga de datos

3. **Nombres de Métodos de Pago:** Ahora el sistema siempre intentará mostrar el nombre personalizado primero. Solo usará los nombres genéricos ("Efectivo", "Transferencia", etc.) si no hay nombre personalizado.

---

## Próximos Pasos

Una vez que pruebes estos cambios, por favor reporta:
1. ✅ ¿Los nombres de métodos de pago se muestran correctamente?
2. ✅ ¿Se generan recibos automáticamente para pagos QR?
3. ❓ ¿Persiste el problema de cierre de caja?
   - Si sí: Comparte logs y resultado del script SQL
   - Si no: ¡Perfecto! 🎉
