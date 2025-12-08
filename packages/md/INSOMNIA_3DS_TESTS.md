# Pruebas 3D Secure v2 en Insomnia

## 🔧 Configuración Inicial

### Base URL
```
http://localhost:3001
```

### Headers para todas las peticiones:
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlZWE0Y2QwZi00YTViLTQ4M2QtYjdlZC02OTQ0ZTk5NmNkYWQiLCJlbWFpbCI6ImFkbWluQGJlYXV0eWNvbnRyb2wuY29tIiwicm9sZSI6Ik9XTkVSIiwiYnVzaW5lc3NJZCI6bnVsbCwiaWF0IjoxNzU4MjgzMjE4LCJleHAiOjE3NTgzNjk2MTh9.5BvkoShvumxfQzbppnKPVn0L61VRSxaQX6CK4_C1UoU
```

---

## 🧪 Peticiones de Prueba

### 1. 🎯 Crear Transacción 3DS v2

**POST** `/api/owner/payments/3ds/create`

**Body (JSON):**
```json
{
  "businessSubscriptionId": "d87f5aa8-9565-41f7-a2af-3b5d3ff0317b",
  "cardToken": "tok_test_12345_card",
  "customerEmail": "test@beautycontrol.co",
  "acceptanceToken": "test_acceptance_token",
  "browserInfo": {
    "browser_color_depth": 24,
    "browser_screen_height": 1080,
    "browser_screen_width": 1920,
    "browser_language": "es-CO",
    "browser_user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    "browser_tz": -300
  },
  "threeDsAuthType": "challenge_v2",
  "autoRenewalEnabled": true
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "paymentId": "uuid-del-pago",
    "transactionId": "wompi-transaction-id",
    "reference": "BC_payment_reference",
    "status": "THREEDS_PENDING",
    "step": "challenge",
    "challengeUrl": "base64-encoded-iframe-html"
  }
}
```

---

### 2. 📊 Consultar Estado de Transacción

**GET** `/api/owner/payments/3ds/status/{{transactionId}}`

*Reemplaza `{{transactionId}}` con el valor obtenido de la respuesta anterior*

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "transactionId": "wompi-transaction-id",
    "status": "APPROVED",
    "step": "completed",
    "authType": "challenge_v2",
    "eci": "05",
    "cavv": "authentication-value",
    "liabilityShift": true
  }
}
```

---

### 3. 📈 Estadísticas de Pagos 3DS

**GET** `/api/owner/payments/3ds/stats`

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "total3DSPayments": 1,
    "completedPayments": 1,
    "pendingPayments": 0,
    "failedPayments": 0,
    "successRate": 100.0
  }
}
```

---

## 🎲 Variaciones de Prueba

### Prueba 2: No Challenge (Éxito directo)
```json
{
  "businessSubscriptionId": "d87f5aa8-9565-41f7-a2af-3b5d3ff0317b",
  "cardToken": "tok_test_visa_no_challenge",
  "customerEmail": "test@beautycontrol.co",
  "acceptanceToken": "test_acceptance_token",
  "browserInfo": {
    "browser_color_depth": 24,
    "browser_screen_height": 1080,
    "browser_screen_width": 1920,
    "browser_language": "es-CO",
    "browser_user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "browser_tz": -300
  },
  "threeDsAuthType": "no_challenge_success",
  "autoRenewalEnabled": false
}
```

### Prueba 3: Challenge Denegado
```json
{
  "businessSubscriptionId": "d87f5aa8-9565-41f7-a2af-3b5d3ff0317b",
  "cardToken": "tok_test_challenge_denied",
  "customerEmail": "test@beautycontrol.co",
  "acceptanceToken": "test_acceptance_token",
  "browserInfo": {
    "browser_color_depth": 24,
    "browser_screen_height": 1080,
    "browser_screen_width": 1920,
    "browser_language": "es-CO",
    "browser_user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "browser_tz": -300
  },
  "threeDsAuthType": "challenge_denied",
  "autoRenewalEnabled": false
}
```

---

## ✅ Checklist de Pruebas

- [ ] **Prueba 1**: Crear transacción con challenge v2 ✅
- [ ] **Prueba 2**: Consultar estado de transacción ⏳
- [ ] **Prueba 3**: Verificar estadísticas ⏳
- [ ] **Prueba 4**: Crear transacción sin challenge ⏳
- [ ] **Prueba 5**: Crear transacción con challenge denegado ⏳

---

## 🚀 Instrucciones Paso a Paso

1. **Reinicia el servidor** para cargar las nuevas rutas
2. **Abre Insomnia** y crea una nueva colección "Beauty Control 3DS v2"
3. **Configura el Environment** con la base URL
4. **Crea las 3 peticiones** principales usando los datos de arriba
5. **Ejecuta las pruebas** en orden:
   - Primero: Crear transacción
   - Segundo: Consultar estado (usa el transactionId de la respuesta)
   - Tercero: Ver estadísticas
6. **Guarda los resultados** para documentación

---

## 🐛 Debugging

Si alguna petición falla, verifica:

- ✅ **Servidor corriendo** en puerto 3001
- ✅ **Token JWT válido** (no expirado)
- ✅ **Headers correctos** (Content-Type y Authorization)
- ✅ **businessSubscriptionId existe** en la BD
- ✅ **Campos browserInfo completos** (todos los 6 campos)

---

## 📝 Notas Importantes

- **Token JWT**: Expira en 24h, renuévalo si es necesario
- **Sandbox**: Estamos en modo testing con Wompi
- **browserInfo**: Todos los campos son obligatorios para 3DS v2
- **threeDsAuthType**: Solo para sandbox/testing, simula diferentes escenarios

¿Todo listo para las pruebas en Insomnia? 🚀