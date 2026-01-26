# 🔗 URIs y Endpoints WhatsApp - Referencia Rápida

## 📱 WEBHOOK CONFIGURATION (Meta Dashboard)

### Para verificar en Meta Business:
```
Webhook URL:
  https://tudominio.com/api/webhooks/whatsapp

Verify Token:
  beauty_control_whatsapp_verify

Webhook Fields to Subscribe:
  ✅ messages
  ✅ message_status
  ✅ message_template_status_update
  ✅ account_alerts
```

**Métodos soportados:**
- `GET /api/webhooks/whatsapp` - Para verificación inicial de Meta
- `POST /api/webhooks/whatsapp` - Para recibir eventos de Meta

---

## 🔐 TOKENS Y ADMINISTRACIÓN

### Guardar Token Manual
```
Method: POST
URL: /api/admin/whatsapp/businesses/{businessId}/tokens

Headers:
  Authorization: Bearer {jwt_token}
  Content-Type: application/json

Body:
{
  "accessToken": "EAABxxxxxx...",
  "phoneNumberId": "113xxx...",
  "wabaId": "112xxx...",
  "phoneNumber": "+573001234567",
  "metadata": {
    "source": "manual"
  }
}

Response:
{
  "success": true,
  "message": "Token guardado correctamente",
  "data": {
    "id": "uuid",
    "businessId": "uuid",
    "tokenType": "USER_ACCESS_TOKEN",
    "isActive": true,
    "created": true
  }
}
```

### Obtener Info de Token (Sin exponer token)
```
Method: GET
URL: /api/admin/whatsapp/businesses/{businessId}/tokens

Headers:
  Authorization: Bearer {jwt_token}

Response:
{
  "success": true,
  "data": {
    "hasToken": true,
    "isActive": true,
    "tokenType": "USER_ACCESS_TOKEN",
    "expiresAt": "2026-02-15T10:00:00.000Z",
    "lastRotatedAt": "2026-01-26T10:00:00.000Z",
    "createdAt": "2026-01-20T10:00:00.000Z",
    "phoneNumber": "+573001234567",
    "phoneNumberId": "113xxx",
    "wabaId": "112xxx",
    "permissions": ["whatsapp_business_messaging"],
    "source": "manual"
  }
}
```

### Rotar Token
```
Method: POST
URL: /api/admin/whatsapp/businesses/{businessId}/tokens/rotate

Headers:
  Authorization: Bearer {jwt_token}
  Content-Type: application/json

Body:
{
  "newAccessToken": "EAABxxxxxx..."
}
```

### Eliminar Token (Desconectar WhatsApp)
```
Method: DELETE
URL: /api/admin/whatsapp/businesses/{businessId}/tokens

Headers:
  Authorization: Bearer {jwt_token}

Response:
{
  "success": true,
  "message": "Token eliminado correctamente"
}
```

### Test Conexión
```
Method: POST
URL: /api/admin/whatsapp/businesses/{businessId}/test-connection

Headers:
  Authorization: Bearer {jwt_token}

Response:
{
  "success": true,
  "message": "Conexión exitosa",
  "data": {
    "phoneNumberId": "113xxx",
    "phoneNumber": "+573001234567",
    "status": "connected",
    "messageStatus": "Connected"
  }
}
```

---

## 📋 PLANTILLAS (Templates)

### Crear Plantilla
```
Method: POST
URL: /api/admin/whatsapp/businesses/{businessId}/templates

Headers:
  Authorization: Bearer {jwt_token}
  Content-Type: application/json

Body:
{
  "name": "appointment_reminder_v1",
  "language": "es",
  "category": "UTILITY",
  "components": {
    "header": "Recordatorio de Cita",
    "body": "Hola {{1}}, tu cita es el {{2}} a las {{3}}",
    "footer": "Beauty Control",
    "buttons": [
      { "type": "QUICK_REPLY", "text": "Confirmar" },
      { "type": "QUICK_REPLY", "text": "Reprogramar" }
    ]
  }
}

Response:
{
  "success": true,
  "message": "Plantilla creada correctamente",
  "data": {
    "id": "uuid",
    "businessId": "uuid",
    "templateName": "appointment_reminder_v1",
    "status": "DRAFT",
    "language": "es",
    "category": "UTILITY",
    "body": "Hola {{1}}, tu cita es el {{2}} a las {{3}}",
    "header": "Recordatorio de Cita",
    "footer": "Beauty Control"
  }
}
```

### Listar Plantillas
```
Method: GET
URL: /api/admin/whatsapp/businesses/{businessId}/templates?status=APPROVED&limit=10&offset=0

Headers:
  Authorization: Bearer {jwt_token}

Response:
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "uuid",
        "templateName": "appointment_reminder_v1",
        "status": "APPROVED",
        "language": "es",
        "category": "UTILITY",
        "metaTemplateId": "xxx",
        "approvedAt": "2026-01-25T10:00:00.000Z"
      }
    ],
    "pagination": {
      "limit": 10,
      "offset": 0,
      "total": 5
    }
  }
}
```

### Enviar Template a Meta para Aprobación
```
Method: POST
URL: /api/admin/whatsapp/businesses/{businessId}/templates/{templateId}/submit

Headers:
  Authorization: Bearer {jwt_token}

Response:
{
  "success": true,
  "message": "Plantilla enviada a Meta para aprobación",
  "data": {
    "id": "uuid",
    "status": "PENDING_APPROVAL",
    "submittedAt": "2026-01-26T10:00:00.000Z"
  }
}
```

### Actualizar Plantilla (Solo si está en DRAFT)
```
Method: PUT
URL: /api/admin/whatsapp/businesses/{businessId}/templates/{templateId}

Headers:
  Authorization: Bearer {jwt_token}
  Content-Type: application/json

Body:
{
  "name": "appointment_reminder_v2",
  "components": {
    "body": "Nuevo cuerpo del mensaje..."
  }
}
```

### Eliminar Plantilla (Solo si está en DRAFT)
```
Method: DELETE
URL: /api/admin/whatsapp/businesses/{businessId}/templates/{templateId}

Headers:
  Authorization: Bearer {jwt_token}

Response:
{
  "success": true,
  "message": "Plantilla eliminada"
}
```

### Sincronizar Plantillas desde Meta
```
Method: GET
URL: /api/admin/whatsapp/businesses/{businessId}/templates/sync

Headers:
  Authorization: Bearer {jwt_token}

Response:
{
  "success": true,
  "message": "Plantillas sincronizadas",
  "data": {
    "synced": 5,
    "templates": [...]
  }
}
```

---

## 📤 ENVIAR MENSAJES (NUEVO)

### Enviar Mensaje con Template
```
Method: POST
URL: /api/business/{businessId}/whatsapp/send-template-message

Headers:
  Authorization: Bearer {jwt_token}
  Content-Type: application/json

Body:
{
  "recipientPhone": "+573001234567",
  "templateName": "appointment_reminder_v1",
  "variables": {
    "clientName": "Juan",
    "appointmentDate": "2026-01-30",
    "appointmentTime": "14:00"
  },
  "clientId": "uuid-opcional",
  "appointmentId": "uuid-opcional"
}

Response:
{
  "success": true,
  "message": "Mensaje enviado correctamente",
  "data": {
    "messageId": "wamid_ABCDEFxxx",
    "status": "SENT",
    "to": "+573001234567",
    "template": "appointment_reminder_v1"
  }
}
```

### Enviar Mensaje de Texto Simple
```
Method: POST
URL: /api/business/{businessId}/whatsapp/send-text-message

Headers:
  Authorization: Bearer {jwt_token}
  Content-Type: application/json

Body:
{
  "recipientPhone": "+573001234567",
  "message": "Hola Juan, esto es un mensaje de prueba",
  "clientId": "uuid-opcional"
}

Response:
{
  "success": true,
  "message": "Mensaje enviado correctamente",
  "data": {
    "messageId": "wamid_ABCDEFxxx",
    "status": "SENT",
    "to": "+573001234567"
  }
}
```

### Enviar Recordatorio de Cita
```
Method: POST
URL: /api/business/{businessId}/whatsapp/send-appointment-reminder

Headers:
  Authorization: Bearer {jwt_token}
  Content-Type: application/json

Body:
{
  "appointmentId": "uuid-de-la-cita"
}

Response:
{
  "success": true,
  "message": "Recordatorio enviado correctamente",
  "data": {
    "messageId": "wamid_ABCDEFxxx",
    "status": "SENT"
  }
}
```

### Enviar Confirmación de Cita
```
Method: POST
URL: /api/business/{businessId}/whatsapp/send-appointment-confirmation

Headers:
  Authorization: Bearer {jwt_token}
  Content-Type: application/json

Body:
{
  "appointmentId": "uuid-de-la-cita"
}

Response:
{
  "success": true,
  "message": "Confirmación enviada correctamente",
  "data": {
    "messageId": "wamid_ABCDEFxxx",
    "status": "SENT"
  }
}
```

### Enviar Recibo de Pago
```
Method: POST
URL: /api/business/{businessId}/whatsapp/send-payment-receipt

Headers:
  Authorization: Bearer {jwt_token}
  Content-Type: application/json

Body:
{
  "receiptId": "uuid-del-recibo"
}

Response:
{
  "success": true,
  "message": "Recibo enviado correctamente",
  "data": {
    "messageId": "wamid_ABCDEFxxx",
    "status": "SENT"
  }
}
```

### Obtener Estado de Mensaje
```
Method: GET
URL: /api/business/{businessId}/whatsapp/message-status/{messageId}

Headers:
  Authorization: Bearer {jwt_token}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "to": "+573001234567",
    "status": "DELIVERED",  // SENT, DELIVERED, READ, FAILED
    "sentAt": "2026-01-26T10:00:00.000Z",
    "messageType": "template",
    "errorMessage": null
  }
}
```

---

## 📊 HISTORIAL Y EVENTOS

### Obtener Historial de Mensajes
```
Method: GET
URL: /api/admin/whatsapp/businesses/{businessId}/messages?limit=50&offset=0&status=SENT

Headers:
  Authorization: Bearer {jwt_token}

Response:
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "to": "+573001234567",
        "messageType": "template",
        "status": "DELIVERED",
        "sentAt": "2026-01-26T10:00:00.000Z",
        "clientName": "Juan",
        "templateName": "appointment_reminder_v1"
      }
    ],
    "pagination": {
      "limit": 50,
      "offset": 0,
      "total": 125
    }
  }
}
```

### Obtener Mensaje por ID
```
Method: GET
URL: /api/admin/whatsapp/businesses/{businessId}/messages/{messageId}

Headers:
  Authorization: Bearer {jwt_token}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "to": "+573001234567",
    "status": "DELIVERED",
    "sentAt": "2026-01-26T10:00:00.000Z",
    "content": "Hola Juan, tu cita es el 30-01 a las 14:00",
    "messageType": "template"
  }
}
```

### Obtener Eventos de Webhook
```
Method: GET
URL: /api/admin/whatsapp/businesses/{businessId}/webhook-events?limit=50&offset=0

Headers:
  Authorization: Bearer {jwt_token}

Response:
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "uuid",
        "field": "message_status",
        "messageId": "wamid_xxx",
        "status": "DELIVERED",
        "timestamp": "2026-01-26T10:00:00.000Z",
        "processed": true
      }
    ]
  }
}
```

---

## 🎓 GUÍA DE FLUJO USUARIO FINAL

### Para un Negocio que quiere enviar WhatsApp

```
1. CONECTAR WhatsApp (Una sola vez)
   ├─ Ir a: Perfil → WhatsApp → Método Manual
   ├─ Pegar credenciales de Meta
   ├─ POST /api/admin/whatsapp/businesses/{id}/tokens
   └─ ✅ Conectado

2. CREAR PLANTILLAS
   ├─ Ir a: Perfil → WhatsApp → Templates
   ├─ Crear plantilla
   ├─ POST /api/admin/whatsapp/businesses/{id}/templates
   ├─ Enviar a Meta para aprobación
   ├─ POST /api/admin/whatsapp/businesses/{id}/templates/{id}/submit
   ├─ Esperar 24-48h
   └─ ✅ Template aprobada

3. ENVIAR MENSAJES
   ├─ Opción A (Manual): Click "Enviar WhatsApp" en cliente
   ├─ Opción B (Automático): Sistema envía cuando se crea cita
   ├─ POST /api/business/{id}/whatsapp/send-template-message
   └─ ✅ Mensaje enviado

4. MONITOREAR
   ├─ Ver historial: GET /api/admin/whatsapp/businesses/{id}/messages
   ├─ Ver estado: GET /api/business/{id}/whatsapp/message-status/{id}
   └─ ✅ Status actualizado por webhook
```

---

## 🔑 NOTAS IMPORTANTES

### Variables en URLs
- `{businessId}` = UUID del negocio (ej: 550e8400-e29b-41d4-a716-446655440000)
- `{templateId}` = UUID de la plantilla
- `{messageId}` = UUID o Meta Message ID (wamid_xxx)
- `{recipientPhone}` = Formato: +5733001234567 (con +57 y sin espacios)

### Headers Requeridos
```
Authorization: Bearer {jwt_token}
  - Obtenido al loguear: POST /api/auth/login

Content-Type: application/json
  - Requerido en POST/PUT

X-Hub-Signature-256: sha256=xxx
  - Solo para validar webhooks (automático)
```

### Errores Comunes
```
401 Unauthorized
  → Token JWT inválido o expirado

403 Forbidden
  → No tienes acceso a este negocio

400 Bad Request
  → Template no aprobada o teléfono inválido

500 Internal Server Error
  → WhatsApp no conectado o Meta API error
```

---

## 🎯 RESUMEN: Flujo de URLs

```
┌─────────────────────────────────────────┐
│   META DASHBOARD / WEBHOOK EVENTS        │
│   POST /api/webhooks/whatsapp           │
│   GET  /api/webhooks/whatsapp           │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│   BUSINESS ADMIN (Token & Templates)     │
│   POST /api/admin/whatsapp/.../tokens   │
│   POST /api/admin/whatsapp/.../templates│
│   POST /api/admin/whatsapp/.../submit   │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│   SEND MESSAGES (Lo nuevo hoy!)          │
│   POST /api/business/{id}/whatsapp/send-*
│   GET  /api/business/{id}/whatsapp/msg- │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│   META GRAPH API                         │
│   Envía/recibe mensajes de WhatsApp     │
└─────────────────────────────────────────┘
```

