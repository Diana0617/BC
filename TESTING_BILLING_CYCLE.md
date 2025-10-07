# 🧪 Guía de Prueba: Ciclo de Facturación Mensual vs Anual

## Paso 1: Preparar la Base de Datos

### 1.1 Ejecutar la Migración (si no la has corrido)
```bash
# Conectar a la base de datos
psql -U tu_usuario -d beauty_control

# Ejecutar la migración
\i packages/backend/migrations/add-billing-cycle-fields.sql
```

### 1.2 Crear el Plan de Prueba
```bash
# Ejecutar el script de prueba
\i packages/backend/test-create-billing-plan.sql
```

**Resultado esperado:**
```
Plan Prueba Premium creado con:
- monthly_price: $50,000 COP
- annual_price: $480,000 COP
- annual_discount_percent: 20%
- trial_days: 7
```

## Paso 2: Iniciar el Sistema

### 2.1 Iniciar Backend
```bash
cd packages/backend
npm run dev
# Backend corriendo en http://localhost:3001
```

### 2.2 Iniciar Frontend
```bash
cd packages/web-app
npm run dev
# Frontend corriendo en http://localhost:5173
```

## Paso 3: Probar Creación de Suscripción Pública

### 3.1 Ir a la Página de Registro
```
http://localhost:5173/subscription
```

### 3.2 Seleccionar el Plan
- ✅ Verás "Plan Prueba Premium" en la lista de planes
- ✅ Debe mostrar el precio mensual: $50,000
- ✅ Click en "Seleccionar este plan"

### 3.3 Elegir Ciclo de Facturación
**Aparecerá el componente BillingCycleSelector con dos opciones:**

**Opción 1: Mensual**
- Precio: $50,000/mes
- Descripción: "Paga mes a mes"

**Opción 2: Anual**
- Precio: $480,000/año
- Badge verde: "Ahorra 20%"
- Ahorro: "Ahorras $120,000 al año"
- Comparación: "vs. pago mensual ($50,000 × 12)"

### 3.4 Probar Ambos Ciclos

#### **Prueba A: Suscripción Mensual**
1. Seleccionar "Mensual"
2. Click en "Continuar con Plan Mensual"
3. Llenar formulario de registro:
   - Nombre del negocio: "Salón Prueba Mensual"
   - Código: "salonmensual"
   - Email, teléfono, etc.
4. En "Resumen del Pedido" verificar:
   - ✅ Ciclo: **Mensual**
   - ✅ Precio: **$50,000**
   - ✅ Trial: **7 días**
5. Completar pago (tokenización 3DS)
6. Verificar en consola del backend:
   ```
   Precio calculado:
   billingCycle: MONTHLY
   finalPrice: 50000
   finalDuration: 1
   finalDurationType: MONTHS
   ```

#### **Prueba B: Suscripción Anual**
1. Volver a `/subscription`
2. Seleccionar el mismo plan
3. Esta vez seleccionar "Anual"
4. Click en "Continuar con Plan Anual"
5. Llenar formulario:
   - Nombre: "Salón Prueba Anual"
   - Código: "salonanual"
6. En "Resumen del Pedido" verificar:
   - ✅ Ciclo: **Anual**
   - ✅ Precio: **$480,000**
   - ✅ Ahorro: **20%**
   - ✅ Trial: **7 días**
7. Verificar en consola del backend:
   ```
   Precio calculado:
   billingCycle: ANNUAL
   finalPrice: 480000
   finalDuration: 1
   finalDurationType: YEARS
   ```

## Paso 4: Verificar en Base de Datos

### 4.1 Ver Suscripciones Creadas
```sql
-- Ver las suscripciones con su ciclo de facturación
SELECT 
  bs.id,
  b.name as business_name,
  sp.name as plan_name,
  bs.billing_cycle,
  bs.amount,
  bs.status,
  bs.start_date,
  bs.end_date,
  bs.trial_end_date
FROM business_subscriptions bs
JOIN businesses b ON bs.business_id = b.id
JOIN subscription_plans sp ON bs.subscription_plan_id = sp.id
WHERE b.name LIKE '%Prueba%'
ORDER BY bs.created_at DESC;
```

**Resultado esperado:**
```
| business_name          | billing_cycle | amount   | status | trial_end_date    | end_date          |
|------------------------|---------------|----------|--------|-------------------|-------------------|
| Salón Prueba Anual     | ANNUAL        | 480000   | TRIAL  | 2025-10-13        | 2026-10-13        |
| Salón Prueba Mensual   | MONTHLY       | 50000    | TRIAL  | 2025-10-13        | 2025-11-13        |
```

### 4.2 Ver Pagos Pendientes
```sql
-- Ver los pagos pendientes con tokens guardados
SELECT 
  sp.id,
  bs.billing_cycle,
  sp.amount,
  sp.status,
  sp.due_date,
  sp.metadata->>'description' as description
FROM subscription_payments sp
JOIN business_subscriptions bs ON sp.business_subscription_id = bs.id
WHERE sp.status = 'PENDING'
ORDER BY sp.created_at DESC
LIMIT 5;
```

## Paso 5: Probar Panel del Owner

### 5.1 Login como Owner
```
http://localhost:5173/login
Email: owner@beautycontrol.com (o tu owner de prueba)
```

### 5.2 Ir a Businesses
```
http://localhost:5173/owner/businesses
```

### 5.3 Crear Suscripción Manual

#### **Prueba C: Manual Mensual**
1. Click en "Crear Suscripción Manual"
2. Llenar datos del negocio:
   - Nombre: "Negocio Owner Mensual"
   - Código: "ownermensual"
3. Datos del propietario:
   - Email, nombre, contraseña
4. Seleccionar "Plan Prueba Premium"
5. **El BillingCycleSelector aparece automáticamente**
6. Elegir "Mensual"
7. Verificar:
   - ✅ Precio: $50,000
   - ✅ Ciclo: Mensual
8. Submit
9. ✅ Mensaje: "Suscripción creada exitosamente con pago efectivo"

#### **Prueba D: Manual Anual**
1. Repetir pero seleccionar "Anual"
2. Verificar:
   - ✅ Precio: $480,000
   - ✅ Ahorro: 20%
   - ✅ Ciclo: Anual

### 5.4 Verificar en la Lista
1. En la tabla de businesses
2. Click en un negocio creado
3. En el modal de detalles:
   - ✅ Ver columna "Ciclo" en tabla de suscripciones
   - ✅ Badge 📆 Mensual (azul) o 📅 Anual (morado)

## Paso 6: Verificar Backend Logs

### 6.1 Logs de Creación
Buscar en consola del backend:

```
📋 Datos recibidos para crear negocio:
  billingCycle: MONTHLY  o  ANNUAL

📋 Plan encontrado:
  finalPrice: 50000 o 480000
  finalDuration: 1
  finalDurationType: MONTHS o YEARS

📝 Suscripción creada:
  Ciclo: MONTHLY o ANNUAL
  Trial hasta: ...
  Duración: 1 MONTHS o 1 YEARS
```

## Paso 7: Testing con Insomnia/Postman

### 7.1 Endpoint: POST /api/subscriptions/create

**Body para MONTHLY:**
```json
{
  "planId": 1,
  "billingCycle": "MONTHLY",
  "businessData": {
    "name": "Test API Mensual",
    "businessCode": "apimensual",
    "type": "BEAUTY_SALON",
    "email": "test@test.com",
    "phone": "1234567890",
    "city": "Bogotá",
    "country": "Colombia"
  },
  "userData": {
    "firstName": "Test",
    "lastName": "User",
    "email": "test@test.com",
    "password": "Test123!",
    "phone": "1234567890"
  },
  "paymentData": {
    "paymentSourceToken": "tok_test_12345",
    "transactionId": "txn_test_12345"
  }
}
```

**Body para ANNUAL:**
```json
{
  "planId": 1,
  "billingCycle": "ANNUAL",
  "businessData": { ... },
  "userData": { ... },
  "paymentData": { ... }
}
```

### 7.2 Verificar Respuesta
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": 123,
      "billingCycle": "ANNUAL",
      "amount": 480000,
      "endDate": "2026-10-06",  // 1 año después
      "status": "TRIAL"
    }
  }
}
```

## Checklist de Pruebas ✅

### Frontend:
- [ ] BillingCycleSelector se muestra correctamente
- [ ] Precios mensuales y anuales correctos
- [ ] Badge de ahorro visible en plan anual
- [ ] Cálculo de ahorros correcto ($120,000)
- [ ] Selección cambia visualmente
- [ ] Botón "Continuar con Plan X" refleja elección
- [ ] Resumen muestra ciclo correcto
- [ ] Owner modal muestra selector
- [ ] Lista de businesses muestra badge de ciclo
- [ ] Responsive en mobile

### Backend:
- [ ] Migración ejecutada sin errores
- [ ] Plan creado con precios correctos
- [ ] billingCycle='MONTHLY' calcula endDate en 1 mes
- [ ] billingCycle='ANNUAL' calcula endDate en 1 año
- [ ] billingCycle='MONTHLY' cobra $50,000
- [ ] billingCycle='ANNUAL' cobra $480,000
- [ ] Registros en business_subscriptions tienen billingCycle
- [ ] Registros en subscription_payments tienen metadata.billingCycle

### Base de Datos:
- [ ] Campos añadidos a subscription_plans
- [ ] Campos añadidos a business_subscriptions
- [ ] Valores por defecto funcionan
- [ ] Constraints funcionan correctamente
- [ ] Queries de verificación retornan datos correctos

## Problemas Comunes y Soluciones

### Error: "billingCycle must be MONTHLY or ANNUAL"
**Solución:** Verificar que estás enviando exactamente "MONTHLY" o "ANNUAL" (mayúsculas)

### Error: Plan no tiene monthlyPrice
**Solución:** Ejecutar:
```sql
UPDATE subscription_plans 
SET monthly_price = price 
WHERE monthly_price IS NULL;
```

### BillingCycleSelector no aparece
**Solución:** Verificar que:
1. Seleccionaste un plan primero
2. El plan tiene datos de precio
3. Console del navegador sin errores

### Precio incorrecto en resumen
**Solución:** Verificar en Redux DevTools que billingCycle se está pasando correctamente

## Queries Útiles de Depuración

```sql
-- Ver todos los planes con sus precios
SELECT id, name, price, monthly_price, annual_price, annual_discount_percent
FROM subscription_plans;

-- Ver suscripciones recientes con ciclo
SELECT 
  b.name, 
  bs.billing_cycle, 
  bs.amount, 
  bs.status,
  bs.end_date
FROM business_subscriptions bs
JOIN businesses b ON bs.business_id = b.id
ORDER BY bs.created_at DESC
LIMIT 10;

-- Comparar duración mensual vs anual
SELECT 
  b.name,
  bs.billing_cycle,
  bs.start_date,
  bs.end_date,
  (bs.end_date - bs.start_date) as duration_days
FROM business_subscriptions bs
JOIN businesses b ON bs.business_id = b.id
WHERE b.name LIKE '%Prueba%';
```

## 🎉 ¡Listo para Probar!

Sigue estos pasos en orden y verifica cada checklist item. Si encuentras algún problema, revisa los logs del backend y usa las queries de depuración.

¡Buena suerte con las pruebas! 🚀
