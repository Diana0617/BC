# 📊 WhatsApp Admin API - Expected Responses Reference

## 🔑 Authentication Endpoints

### 1. POST /api/auth/login
**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "Maria",
      "lastName": "Lobeto",
      "email": "mercedeslobeto@gmail.com",
      "role": "BUSINESS",
      "businessId": "d7af77b9-09cf-4d6b-b159-6249be87935e"
    },
    "tokens": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "eyJhbGci...",
      "expiresIn": "24h"
    }
  }
}
```

## 📱 Token Management Endpoints

### 2. GET /api/admin/whatsapp/businesses/:businessId/tokens
**Expected Response WITHOUT WhatsApp Token (200 OK)**:
```json
{
  "success": true,
  "data": {
    "hasToken": false,
    "isActive": false,
    "phoneNumber": null,
    "phoneNumberId": null
  }
}
```

**Expected Response WITH WhatsApp Token (200 OK)**:
```json
{
  "success": true,
  "data": {
    "hasToken": true,
    "isActive": true,
    "phoneNumber": "+573001234567",
    "phoneNumberId": "123456789",
    "tokenStatus": "ACTIVE",
    "expiresAt": "2025-12-05T17:00:00.000Z"
  }
}
```

### 3. POST /api/admin/whatsapp/businesses/:businessId/tokens
**Request Body**:
```json
{
  "accessToken": "EAAxxxxxxxx",
  "phoneNumberId": "123456789",
  "wabaId": "987654321",
  "phoneNumber": "+573001234567"
}
```

**Expected Response (201 Created)**:
```json
{
  "success": true,
  "message": "Token de WhatsApp guardado exitosamente",
  "data": {
    "id": "uuid",
    "phoneNumber": "+573001234567",
    "phoneNumberId": "123456789",
    "status": "ACTIVE"
  }
}
```

### 4. POST /api/admin/whatsapp/businesses/:businessId/tokens/test-connection
**Expected Response WITH Valid Token (200 OK)**:
```json
{
  "success": true,
  "message": "Conexión exitosa con WhatsApp Business API",
  "data": {
    "phoneNumber": "+573001234567",
    "verified": true,
    "quality": "GREEN"
  }
}
```

**Expected Response WITH Invalid Token (400 Bad Request)**:
```json
{
  "success": false,
  "error": "Token inválido o expirado"
}
```

### 5. DELETE /api/admin/whatsapp/businesses/:businessId/tokens
**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Token eliminado exitosamente"
}
```

## 🔗 Embedded Signup Endpoints

### 6. POST /api/admin/whatsapp/businesses/:businessId/signup/initialize
**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "signupUrl": "https://www.facebook.com/v18.0/dialog/oauth?...",
    "state": "unique_state_token_here"
  }
}
```

### 7. POST /api/admin/whatsapp/businesses/:businessId/signup/complete
**Request Body**:
```json
{
  "code": "oauth_code_from_meta",
  "state": "state_token_from_initialize"
}
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Configuración de WhatsApp completada",
  "data": {
    "phoneNumber": "+573001234567",
    "phoneNumberId": "123456789",
    "wabaId": "987654321",
    "tokenStored": true
  }
}
```

## 📝 Template Management Endpoints

### 8. GET /api/admin/whatsapp/businesses/:businessId/templates
**Expected Response WITHOUT WhatsApp Token (500 Error)**:
```json
{
  "success": false,
  "error": "Error al obtener plantillas"
}
```

**Expected Response WITH WhatsApp Token (200 OK)**:
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "uuid",
        "name": "appointment_reminder",
        "language": "es",
        "category": "UTILITY",
        "status": "APPROVED",
        "components": [...],
        "createdAt": "2025-11-05T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1
    }
  }
}
```

### 9. POST /api/admin/whatsapp/businesses/:businessId/templates
**Request Body**:
```json
{
  "name": "appointment_reminder",
  "language": "es",
  "category": "UTILITY",
  "components": [
    {
      "type": "HEADER",
      "format": "TEXT",
      "text": "Recordatorio de Cita"
    },
    {
      "type": "BODY",
      "text": "Hola {{1}}, te recordamos tu cita el {{2}} a las {{3}} en {{4}}."
    },
    {
      "type": "FOOTER",
      "text": "Gracias por preferirnos"
    },
    {
      "type": "BUTTONS",
      "buttons": [
        {
          "type": "QUICK_REPLY",
          "text": "Confirmar"
        },
        {
          "type": "QUICK_REPLY",
          "text": "Cancelar"
        }
      ]
    }
  ]
}
```

**Expected Response (201 Created)**:
```json
{
  "success": true,
  "message": "Plantilla creada exitosamente",
  "data": {
    "id": "uuid",
    "name": "appointment_reminder",
    "language": "es",
    "category": "UTILITY",
    "status": "DRAFT",
    "components": [...]
  }
}
```

### 10. GET /api/admin/whatsapp/businesses/:businessId/templates/:templateId
**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "appointment_reminder",
    "language": "es",
    "category": "UTILITY",
    "status": "APPROVED",
    "components": [...],
    "metaTemplateId": "123456789",
    "approvedAt": "2025-11-05T12:00:00.000Z",
    "createdAt": "2025-11-05T10:00:00.000Z",
    "updatedAt": "2025-11-05T12:00:00.000Z"
  }
}
```

### 11. PUT /api/admin/whatsapp/businesses/:businessId/templates/:templateId
**Request Body**:
```json
{
  "components": [
    {
      "type": "BODY",
      "text": "Hola {{1}}, tu cita es el {{2}} a las {{3}}. ¡Te esperamos!"
    }
  ]
}
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Plantilla actualizada exitosamente",
  "data": {
    "id": "uuid",
    "name": "appointment_reminder",
    "status": "DRAFT",
    "components": [...]
  }
}
```

### 12. DELETE /api/admin/whatsapp/businesses/:businessId/templates/:templateId
**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Plantilla eliminada exitosamente"
}
```

### 13. POST /api/admin/whatsapp/businesses/:businessId/templates/:templateId/submit
**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Plantilla enviada a Meta para revisión",
  "data": {
    "id": "uuid",
    "status": "PENDING",
    "metaTemplateId": "123456789",
    "submittedAt": "2025-11-05T15:00:00.000Z"
  }
}
```

## 💬 Message History Endpoints

### 14. GET /api/admin/whatsapp/businesses/:businessId/messages
**Expected Response WITHOUT Messages (200 OK)**:
```json
{
  "success": false,
  "error": "Error al obtener mensajes"
}
```

**Expected Response WITH Messages (200 OK)**:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "to": "+573001234567",
        "templateName": "appointment_reminder",
        "status": "DELIVERED",
        "metaMessageId": "wamid.xxx",
        "sentAt": "2025-11-05T14:00:00.000Z",
        "deliveredAt": "2025-11-05T14:01:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1
    }
  }
}
```

### 15. GET /api/admin/whatsapp/businesses/:businessId/messages/:messageId
**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "to": "+573001234567",
    "templateName": "appointment_reminder",
    "templateParams": ["Juan", "10 Nov", "15:00", "Salon Bella"],
    "status": "READ",
    "metaMessageId": "wamid.xxx",
    "sentAt": "2025-11-05T14:00:00.000Z",
    "deliveredAt": "2025-11-05T14:01:00.000Z",
    "readAt": "2025-11-05T14:05:00.000Z"
  }
}
```

## 🔔 Webhook Events Endpoints

### 16. GET /api/admin/whatsapp/businesses/:businessId/webhook-events
**Expected Response (200 OK - Empty)**:
```json
{
  "success": true,
  "data": {
    "events": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0
    }
  }
}
```

**Expected Response (200 OK - With Events)**:
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "uuid",
        "eventType": "message_status",
        "metaEventId": "event_123",
        "metaMessageId": "wamid.xxx",
        "processed": true,
        "processedAt": "2025-11-05T14:01:00.000Z",
        "createdAt": "2025-11-05T14:01:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1
    }
  }
}
```

### 17. GET /api/admin/whatsapp/businesses/:businessId/webhook-events/:eventId
**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "eventType": "message_status",
    "payload": {
      "object": "whatsapp_business_account",
      "entry": [...]
    },
    "metaEventId": "event_123",
    "metaMessageId": "wamid.xxx",
    "processed": true,
    "processedAt": "2025-11-05T14:01:00.000Z",
    "retryCount": 0,
    "createdAt": "2025-11-05T14:01:00.000Z"
  }
}
```

### 18. POST /api/admin/whatsapp/businesses/:businessId/webhook-events/:eventId/replay
**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Evento reprocesado exitosamente",
  "data": {
    "eventId": "uuid",
    "processed": true,
    "retryCount": 1
  }
}
```

## 🪝 Meta Webhook Endpoints (Called by Meta)

### 19. GET /api/webhooks/whatsapp/verify
**Query Params**: `hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=12345`

**Expected Response (200 OK)**:
```
12345
```
(Returns the challenge value)

### 20. POST /api/webhooks/whatsapp
**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Webhook recibido correctamente"
}
```

## ❌ Common Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Token de acceso requerido"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "No tienes acceso a este negocio"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Plantilla no encontrada"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Error al procesar la solicitud"
}
```

---

**💡 Tip**: Usa este documento como referencia mientras pruebas en Insomnia para validar que las respuestas sean las esperadas.
