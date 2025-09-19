# Beauty Control - Pruebas de 3D Secure v2
# Guía Completa para Probar 3DS v2 en Entorno Sandbox

## ✅ Configuración Base
- **Servidor**: http://localhost:3001
- **Entorno**: Sandbox Wompi (test)
- **Credenciales**: Configuradas en .env
- **Autenticación**: JWT Bearer Token (nivel OWNER)

## 🚀 Configuración en Insomnia

### Paso 1: Importar Colección
1. Abre Insomnia
2. Importa el archivo `INSOMNIA_COLLECTION_3DS.json`
3. La colección incluye todos los endpoints y variables

### Paso 2: Configurar Variables de Entorno
```json
{
  "baseUrl": "http://localhost:3001",
  "jwt_token": "", // Se llenará después del login
  "business_id": "", // Se obtendrá de la lista de businesses  
  "subscription_id": "", // Se obtendrá de la lista de suscripciones
  "transaction_id": "" // Se obtendrá después de crear transacción
}
```

## 📋 Flujo de Pruebas

### 1. Autenticación de Usuario Owner

**Endpoint**: `POST /api/auth/login`

```json
{
  "email": "admin@beautycontrol.com",
  "password": "AdminPassword123!"
}
```

**Respuesta**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...", // Copiar a jwt_token
  "user": {
    "id": "uuid",
    "email": "admin@beautycontrol.com",
    "role": "OWNER"
  }
}
```

### 2. Obtener Lista de Negocios

**Endpoint**: `GET /api/owner/businesses`
**Headers**: `Authorization: Bearer {{jwt_token}}`

Copiar uno de los `business.id` a la variable `business_id`

### 3. Obtener Lista de Suscripciones

**Endpoint**: `GET /api/owner/businesses/{{business_id}}/subscriptions`
**Headers**: `Authorization: Bearer {{jwt_token}}`

Copiar uno de los `subscription.id` a la variable `subscription_id`

## 🔐 Endpoints 3DS v2 Disponibles

### 1. Crear Transacción 3DS v2

**Endpoint**: `POST /api/owner/payments/3ds/create`

**Headers**: `Authorization: Bearer {{jwt_token}}`

**Body**:
```json
{
  "businessId": "{{business_id}}",
  "subscriptionId": "{{subscription_id}}", 
  "amount": 50000,
  "currency": "COP",
  "description": "Pago de suscripción - Prueba 3DS v2",
  "customerEmail": "test@test.com",
  "browserInfo": {
    "colorDepth": 24,
    "javaEnabled": false,
    "language": "es-CO", 
    "screenHeight": 1080,
    "screenWidth": 1920,
    "timeZoneOffset": 300,
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  },
  "paymentMethod": {
    "type": "CARD",
    "installments": 1,
    "card": {
      "number": "4111111111111111", // Tarjeta de prueba
      "cvc": "123",
      "exp_month": "12",
      "exp_year": "2025", 
      "card_holder": "Juan Perez"
    }
  }
}
```

**Respuesta Esperada**:
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid-transaction",
    "status": "PENDING_3DS",
    "threeDsData": {
      "currentStep": "SUPPORTED_VERSION",
      "authType": "challenge_v2",
      "methodData": "base64-encoded-iframe-html"
    },
    "wompiResponse": {
      "id": "wompi-transaction-id",
      "status": "PENDING",
      "three_ds_auth": { /* datos 3DS */ }
    }
  }
}
```

### 2. Consultar Estado de Transacción

**Endpoint**: `GET /api/owner/payments/3ds/status/{{transaction_id}}`
**Headers**: `Authorization: Bearer {{jwt_token}}`

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "status": "PENDING_3DS", // PENDING_3DS, APPROVED, DECLINED, ERROR
    "currentStep": "AUTHENTICATION",
    "stepStatus": "COMPLETED",
    "amount": 50000,
    "currency": "COP",
    "lastUpdated": "2025-09-19T10:30:00Z"
  }
}
```

### 3. Obtener Estadísticas 3DS

**Endpoint**: `GET /api/owner/payments/3ds/stats?businessId={{business_id}}&period=7d`
**Headers**: `Authorization: Bearer {{jwt_token}}`

**Parámetros de consulta**:
- `businessId`: ID del negocio (opcional para owner)
- `period`: 7d, 30d, 90d (por defecto: 7d)

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "totalTransactions": 15,
    "successfulTransactions": 12,
    "failedTransactions": 3,
    "successRate": 80.0,
    "averageAmount": 75000,
    "totalAmount": 1125000,
    "byAuthType": {
      "no_challenge_success": 8,
      "challenge_v2": 4,
      "challenge_denied": 2, 
      "authentication_error": 1
    },
    "byStep": {
      "SUPPORTED_VERSION": 15,
      "AUTHENTICATION": 12,
      "CHALLENGE": 4
    }
  }
}
```

## 🧪 Tarjetas de Prueba Wompi

### Para 3D Secure Challenge
```json
{
  "number": "4111111111111111",
  "cvc": "123", 
  "exp_month": "12",
  "exp_year": "2025",
  "expected": "challenge_v2"
}
```

### Para 3DS Sin Challenge (Éxito)
```json
{
  "number": "4242424242424242",
  "cvc": "123",
  "exp_month": "12", 
  "exp_year": "2025",
  "expected": "no_challenge_success"
}
```

### Para 3DS Denegado
```json
{
  "number": "4000000000000002",
  "cvc": "123",
  "exp_month": "12",
  "exp_year": "2025",
  "expected": "challenge_denied"
}
```

## 🔍 Verificación de Resultados

### Campos Clave en Base de Datos
La tabla `subscription_payments` ahora incluye:

- `browserInfo`: Información del navegador (JSONB)
- `threeDsAuthType`: Tipo de autenticación 3DS
- `threeDsMethodData`: Data del iframe challenge
- `currentStep`: Paso actual (SUPPORTED_VERSION, AUTHENTICATION, CHALLENGE)
- `currentStepStatus`: Estado del paso (PENDING, COMPLETED, ERROR)

### Logs del Servidor
Monitorea los logs para ver:
```
🔐 Iniciando proceso 3DS v2 para transacción: xxx
📊 Browser info validado correctamente
🎯 Respuesta de Wompi 3DS: { status: "PENDING", three_ds_auth: {...} }
✅ Transacción 3DS creada exitosamente
```

## ⚠️ Troubleshooting

### Error: "businessId not found"
- Verifica que el `business_id` exista
- Usuario OWNER tiene acceso a todos los negocios

### Error: "subscriptionId not found" 
- Verifica que la suscripción exista y esté activa
- La suscripción debe pertenecer al negocio especificado

### Error: "Invalid browser info"
- Todos los campos de `browserInfo` son requeridos
- `timeZoneOffset` debe ser un número (minutos)
- `colorDepth` debe ser 8, 15, 16, 24, 30, 32, 48

### Error de Autenticación
- Token JWT expirado: hacer login nuevamente  
- Usuario sin permisos OWNER

## 📝 Documentación Técnica

### Arquitectura 3DS v2
1. **Paso 1**: Verificación de versión soportada
2. **Paso 2**: Autenticación del titular
3. **Paso 3**: Challenge del banco (si es requerido)

### Flujo de Estados
```
PENDING_3DS → AUTHENTICATION → CHALLENGE → APPROVED/DECLINED
```

### Integración Frontend
Para integrar en el frontend, decodificar `threeDsMethodData`:
```javascript
const decodedHtml = atob(threeDsMethodData);
// Renderizar iframe con el HTML decodificado
```
  "data": {
    "paymentId": "uuid-pago",
    "transactionId": "wompi-transaction-id",
    "reference": "BC_payment_reference",
    "status": "THREEDS_PENDING",
    "step": "method" | "challenge",
    "challengeUrl": "base64-encoded-iframe"
  }
}
```

## 2. Endpoint: Consultar Estado de Transacción

### GET /api/payments/3ds/status/:transactionId

```bash
curl -X GET http://localhost:3001/api/payments/3ds/status/TRANSACTION_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "transactionId": "wompi-transaction-id",
    "status": "APPROVED" | "DECLINED" | "PENDING",
    "step": "completed" | "challenge" | "method",
    "authType": "no_challenge_success" | "challenge_v2" | etc,
    "eci": "05",
    "cavv": "authentication-value",
    "liabilityShift": true
  }
}
```

## 3. Endpoint: Estadísticas de Pagos 3DS

### GET /api/payments/3ds/stats

```bash
curl -X GET http://localhost:3001/api/payments/3ds/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "byStatus": {
      "APPROVED": 8,
      "DECLINED": 1,
      "PENDING": 1
    },
    "byAuthType": {
      "no_challenge_success": 6,
      "challenge_v2": 2,
      "challenge_denied": 1,
      "authentication_error": 1
    },
    "successRate": 80.0,
    "liabilityShiftRate": 90.0
  }
}
```

## Tarjetas de Prueba Wompi (Sandbox)

### Para 3DS v2 Testing:
- **4242424242424242** - Visa (No challenge)
- **4000000000003220** - Visa (Requiere challenge)
- **5555555555554444** - Mastercard (No challenge)
- **5200000000000007** - Mastercard (Requiere challenge)

### Browser Info Requerido (3DS v2):
```json
{
  "user_agent": "String del user agent del navegador",
  "accept_header": "Accept header HTTP completo",
  "language": "es-CO",
  "color_depth": 24,
  "screen_height": 1080,
  "screen_width": 1920,
  "timezone_offset": -300,
  "java_enabled": false,
  "javascript_enabled": true
}
```

## Flujo Completo de Testing:

1. **Crear transacción** con POST /create
2. Si responde con `step: "challenge"`:
   - Decodificar el `challengeUrl` (base64)
   - Renderizar iframe en frontend
   - Completar challenge manualmente
3. **Consultar estado** con GET /status/:id hasta que esté `APPROVED`/`DECLINED`
4. **Verificar estadísticas** con GET /stats

## Notas Importantes:

- Los endpoints requieren autenticación JWT válida
- El `businessSubscriptionId` debe existir en la base de datos
- En sandbox, puedes simular diferentes escenarios 3DS usando tarjetas específicas
- El campo `browserInfo` es **obligatorio** para 3DS v2
- Los challenges se completan automáticamente en sandbox después de unos segundos

## Próximos Pasos:

1. ✅ Probar creación de transacciones 3DS
2. ✅ Verificar flujo de challenge/no-challenge  
3. ✅ Validar que se guarden correctamente los datos 3DS
4. 📋 Integrar con frontend (React)
5. 📋 Solicitar activación en producción a Wompi