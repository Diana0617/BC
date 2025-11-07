# 🧪 Flujo de Testing - Auto-Renovación con Insomnia

## 📋 Pre-requisitos

1. **Servidor ejecutándose** con `NODE_ENV=development`
2. **Base de datos** sincronizada con `FORCE_SYNC_DB=true`
3. **Insomnia** con la colección importada desde `beauty_control_insomnia_complete.json`

## 🚀 Flujo de Testing Paso a Paso

### 🔍 Paso 1: Verificar Estado Inicial del Sistema

**Endpoint:** `📊 Estadísticas del Sistema`
```http
GET /api/test/auto-renewal/stats
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Estadísticas de auto-renovación obtenidas",
  "data": {
    "total": 0,
    "active": 0,
    "trial": 0,
    "suspended": 0,
    "cancelled": 0,
    "overdue": 0,
    "expiringNextWeek": 0,
    "savedPaymentMethods": 0,
    "autoRenewed": 0
  }
}
```

✅ **Confirmación:** Sistema limpio y funcionando

---

### ➕ Paso 2: Crear Suscripción de Prueba

**Endpoint:** `➕ Crear Suscripción de Prueba`
```http
POST /api/test/auto-renewal/create-subscription
```

**Body (JSON):**
```json
{
  "daysUntilExpiry": 1,
  "businessId": null,
  "planId": null
}
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Suscripción de prueba creada exitosamente",
  "data": {
    "subscription": {
      "id": "abc-123-def",
      "businessId": "business-id",
      "planId": "plan-id",
      "status": "TRIAL",
      "startDate": "2025-09-12T00:00:00.000Z",
      "endDate": "2025-09-13T00:00:00.000Z",
      "price": 50000
    },
    "business": {
      "id": "business-id",
      "name": "Business de Prueba",
      "email": "test@example.com"
    },
    "plan": {
      "id": "plan-id",
      "name": "Plan de Prueba",
      "price": 50000
    }
  }
}
```

✅ **Confirmación:** Suscripción creada que vence en 1 día

---

### 📊 Paso 3: Verificar Estadísticas Actualizadas

**Endpoint:** `📊 Estadísticas del Sistema`
```http
GET /api/test/auto-renewal/stats
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "total": 1,        // ← Incrementado
    "trial": 1,        // ← Nueva suscripción TRIAL
    "expiringNextWeek": 1  // ← Próxima a vencer
  }
}
```

✅ **Confirmación:** Estadísticas reflejan la nueva suscripción

---

### ⏰ Paso 4: Forzar Expiración para Mañana

**Endpoint:** `⏰ Forzar Expiración Pronta`
```http
POST /api/test/auto-renewal/force-expire-soon
```

**Body (JSON):**
```json
{
  "subscriptionId": null
}
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Suscripción configurada para vencer pronto",
  "data": {
    "id": "abc-123-def",
    "newEndDate": "2025-09-13T23:59:59.000Z",
    "status": "TRIAL"
  }
}
```

✅ **Confirmación:** Suscripción configurada para vencer mañana

---

### 📅 Paso 5: Ver Suscripciones Próximas a Vencer

**Endpoint:** `📅 Ver Suscripciones Próximas a Vencer`
```http
GET /api/test/auto-renewal/expiring
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Suscripciones próximas a vencer obtenidas",
  "data": [
    {
      "id": "abc-123-def",
      "businessId": "business-id",
      "status": "TRIAL",
      "endDate": "2025-09-13T23:59:59.000Z",
      "price": 50000,
      "business": {
        "name": "Business de Prueba",
        "email": "test@example.com"
      },
      "plan": {
        "name": "Plan de Prueba"
      }
    }
  ]
}
```

✅ **Confirmación:** Suscripción aparece en lista de próximas a vencer

---

### 💳 Paso 6: Crear Método de Pago de Prueba

**Endpoint:** `💳 Crear Método de Pago de Prueba`
```http
POST /api/test/auto-renewal/payment-method
```

**Body (JSON):**
```json
{
  "businessId": 1,
  "cardLastFour": "1234",
  "cardBrand": "VISA"
}
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Método de pago de prueba creado",
  "data": {
    "id": "payment-method-id",
    "businessId": "business-id",
    "cardLastFour": "1234",
    "cardBrand": "VISA",
    "isActive": true
  }
}
```

✅ **Confirmación:** Método de pago disponible para auto-renovación

---

### 🚀 Paso 7: Procesar Renovación Manual

**Endpoint:** `🚀 Procesar Renovaciones Manualmente`
```http
POST /api/test/auto-renewal/run
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Auto-renovación ejecutada manualmente",
  "data": {
    "processed": 1,
    "successful": 1,
    "failed": 0,
    "results": [
      {
        "subscriptionId": "abc-123-def",
        "status": "SUCCESS",
        "message": "Renovación exitosa",
        "newEndDate": "2025-10-13T23:59:59.000Z"
      }
    ]
  }
}
```

✅ **Confirmación:** Renovación procesada exitosamente

---

### 📊 Paso 8: Verificar Resultado Final

**Endpoint:** `📊 Estadísticas del Sistema`
```http
GET /api/test/auto-renewal/stats
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "total": 1,
    "active": 1,        // ← Suscripción renovada a ACTIVE
    "trial": 0,         // ← Ya no está en TRIAL
    "autoRenewed": 1,   // ← Procesada por auto-renovación
    "expiringNextWeek": 0  // ← Ya no vence pronto
  }
}
```

✅ **Confirmación:** Sistema funcionando correctamente

---

## 🔄 Testing de Reintentos

### Paso A: Forzar Fallo de Pago
```http
POST /api/test/auto-renewal/force-expire-soon
```

### Paso B: Procesar con Método de Pago Inválido
```http
POST /api/test/auto-renewal/run
```

### Paso C: Ejecutar Reintentos
```http
POST /api/test/auto-renewal/retries
```

---

## 📧 Testing de Notificaciones

### Ejecutar Notificaciones Manuales
```http
POST /api/test/auto-renewal/notifications
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Notificaciones enviadas",
  "data": {
    "sent": 1,
    "failed": 0
  }
}
```

---

## 🚨 Casos de Error Comunes

### Error: "No se encontraron suscripciones activas"
**Solución:** Ejecutar primero `Crear Suscripción de Prueba`

### Error: "Método de pago no encontrado"
**Solución:** Ejecutar `Crear Método de Pago de Prueba`

### Error: "Ruta no encontrada"
**Solución:** Verificar que `NODE_ENV=development`

### Error: "Database connection failed"
**Solución:** Verificar PostgreSQL y ejecutar con `FORCE_SYNC_DB=true`

---

## 📝 Checklist de Testing Completo

- [ ] ✅ **Paso 1:** Estadísticas iniciales (sistema limpio)
- [ ] ✅ **Paso 2:** Crear suscripción de prueba
- [ ] ✅ **Paso 3:** Verificar estadísticas actualizadas
- [ ] ✅ **Paso 4:** Forzar expiración pronta
- [ ] ✅ **Paso 5:** Ver suscripciones próximas a vencer
- [ ] ✅ **Paso 6:** Crear método de pago
- [ ] ✅ **Paso 7:** Procesar renovación manual
- [ ] ✅ **Paso 8:** Verificar resultado final
- [ ] 🔄 **Extra:** Testing de reintentos
- [ ] 📧 **Extra:** Testing de notificaciones

---

## 🎯 Resultados de Testing Exitoso

Al completar todos los pasos, deberías observar:

1. **Suscripción creada** → Estado TRIAL próximo a vencer
2. **Método de pago configurado** → Listo para procesamiento
3. **Renovación procesada** → Estado cambió a ACTIVE
4. **Fecha extendida** → Nueva fecha de vencimiento (30 días)
5. **Estadísticas actualizadas** → Reflejan el procesamiento
6. **Logs del sistema** → Muestran el flujo completo

---

**¡El sistema de auto-renovación está funcionando correctamente!** 🎉