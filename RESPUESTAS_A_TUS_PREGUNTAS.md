# ❓ RESPUESTAS A TUS PREGUNTAS ESPECÍFICAS

## Pregunta 1: ¿Es posible que los tenants envíen mensajes por WhatsApp con plantillas?

### Respuesta: ✅ SÍ, COMPLETAMENTE POSIBLE

**Lo que está hecho:**
- ✅ Servicio de WhatsApp (`WhatsAppService.js`) - Listo
- ✅ Gestión de tokens (`WhatsAppTokenManager.js`) - Listo
- ✅ Modelos de templates en BD - Listo
- ✅ **NUEVO HECHO HOY:** Endpoints de envío de mensajes

**Lo que falta:**
- UI para que los usuarios disparen el envío (botón/modal)
- Verificación de app en Meta (para producción)

---

## Pregunta 2: ¿Cómo responden los webhooks de Meta?

### Respuesta: El webhook YA ESTÁ FUNCIONANDO

**URL correcta para Meta:**
```
https://tudominio.com/api/webhooks/whatsapp
```

**Cómo funciona:**

#### 1️⃣ **Verificación Inicial** (Una sola vez en Meta Dashboard)
```
Meta envía:
GET /api/webhooks/whatsapp?
  hub.mode=subscribe&
  hub.verify_token=beauty_control_whatsapp_verify&
  hub.challenge=abc123

Backend responde:
200 OK
abc123

Meta valida: ✅ Correcto
```

#### 2️⃣ **Eventos del Webhook** (Después, cada vez que pasa algo)
```
Meta envía:
POST /api/webhooks/whatsapp
Headers:
  X-Hub-Signature-256: sha256=xxxxx

Body (ejemplo: mensaje entregado):
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "123456",
      "changes": [
        {
          "field": "message_status",
          "value": {
            "statuses": [
              {
                "id": "wamid_xxx",
                "status": "delivered",
                "timestamp": 1674818000,
                "recipient_id": "573001234567"
              }
            ]
          }
        }
      ]
    }
  ]
}

Backend:
1. Valida firma (X-Hub-Signature-256)
2. Responde inmediatamente: 200 OK
3. Procesa el evento de forma asincrónica
4. Actualiza estado en BD
```

**Status actualizados por webhook:**
- ✅ `sent` → Mensaje enviado a Meta
- ✅ `delivered` → Cliente recibió mensaje
- ✅ `read` → Cliente leyó mensaje
- ❌ `failed` → Fallo al enviar

**Tu estado actual:**
✅ El webhook recibe eventos correctamente
✅ Backend responde correctamente
✅ Los eventos se procesan en BD

---

## Pregunta 3: ¿Necesito verificar la app en Meta?

### Respuesta: DEPENDE DEL ESTADO

#### 🟢 DESARROLLO (Ahora)
```
¿Necesitas verificación? NO
¿Puedes usar? SÍ, pero solo:
  - Con usuarios de prueba en Meta
  - Con tokens manuales (se renuevan cada 24h)
  - En ambiente de desarrollo

Pasos:
1. Crear app en Meta Developers
2. Habilitar WhatsApp Business API
3. Copiar credenciales
4. Pegar en Beauty Control (método manual)
5. ✅ Listo para probar
```

#### 🟠 STAGING (Testing antes de producción)
```
¿Necesitas verificación? RECOMENDADO
¿Puedes usar? SÍ, pero con limitaciones
  - Webhooks más lentos
  - Algunos eventos pueden no llegar
  - Tokens expiran en 24h

Pasos:
1. Hacer verificación básica (agregar números de test)
2. Usar con números registrados
3. Probar flujo completo
```

#### 🔴 PRODUCCIÓN (Clientes reales)
```
¿Necesitas verificación? OBLIGATORIO ✅
¿Puedes usar? NO sin verificación

Pasos para verificar:
1. Meta Developers → Tu App → Settings → Basic
2. Busca "App Review" o "Submit for Review"
3. Responde preguntas de seguridad/privacidad
4. Meta revisa (2-5 días)
5. Una vez aprobada:
   - Webhooks funcionan 100%
   - Tokens permanentes (no expiran)
   - Límite inicial: 1000 msgs/día
```

**¿Qué preguntas hace Meta?**
```
- ¿Qué es tu app?
- ¿Qué datos de usuario recopila?
- ¿Cómo protege datos?
- ¿Tiene política de privacidad?
- ¿Quién es tu empresa?
- ¿Pasaste security scan?
```

---

## Pregunta 4: ¿Cuál es la URI del webhook y la de respuesta?

### Respuesta CLARA:

#### ✅ URI DEL WEBHOOK (Lo que configuras en Meta)

```
En Meta Business Dashboard:
  Webhook URL: https://tudominio.com/api/webhooks/whatsapp
  Verify Token: beauty_control_whatsapp_verify
```

#### ✅ CÓMO RESPONDE BACKEND

**Para Verificación (GET):**
```
Request:
GET /api/webhooks/whatsapp?
  hub.mode=subscribe&
  hub.verify_token=beauty_control_whatsapp_verify&
  hub.challenge=abc123

Response:
Status: 200 OK
Body: abc123
```

**Para Eventos (POST):**
```
Request:
POST /api/webhooks/whatsapp
Headers:
  X-Hub-Signature-256: sha256=xxx
Body: { event data }

Response:
Status: 200 OK
Body: {} (Empty)

Nota: Backend procesa evento DESPUÉS de responder
```

#### ✅ ENDPOINTS DE ENVÍO (Lo nuevo que creamos)

```
Para enviar un mensaje desde la app:

POST /api/business/{businessId}/whatsapp/send-template-message
  Body: { recipientPhone, templateName, variables }
  
POST /api/business/{businessId}/whatsapp/send-text-message
  Body: { recipientPhone, message }
```

#### ✅ ENDPOINTS DE ADMINISTRACIÓN

```
Tokens:
POST /api/admin/whatsapp/businesses/{businessId}/tokens
GET  /api/admin/whatsapp/businesses/{businessId}/tokens

Templates:
POST /api/admin/whatsapp/businesses/{businessId}/templates
GET  /api/admin/whatsapp/businesses/{businessId}/templates

Historial:
GET  /api/admin/whatsapp/businesses/{businessId}/messages
```

---

## Pregunta 5: ¿Qué debe hacer el usuario en el componente?

### Respuesta: 3 PASOS SIMPLES

#### PASO 1: Conectar WhatsApp (Una sola vez)

**Ubicación:** Perfil → WhatsApp → Conexión

**Opción A: Automática (cuando esté lista)**
```
User: Click "Conectar con Meta Business"
  → Se abre ventana de Facebook
  → Usuario selecciona su WABA
  → Facebook autoriza
  → Vuelve a Beauty Control
  → ✅ Conectado automáticamente
```

**Opción B: Manual (Ahora disponible)**
```
User: Va a Perfil → WhatsApp → Método Manual
  
  1. Va a Meta Business → WhatsApp → Settings
  2. Copia: Access Token, Phone Number ID, WABA ID
  3. Vuelve a Beauty Control
  4. Pega credenciales
  5. Click "Guardar y Verificar"
  6. Backend valida con Meta
  7. ✅ Conectado
```

#### PASO 2: Crear Plantillas

**Ubicación:** Perfil → WhatsApp → Plantillas

```
User:
1. Click "Nueva Plantilla"
2. Completa formulario:
   - Nombre: "recordatorio_cita"
   - Idioma: "Español"
   - Categoría: "UTILITY"
   - Cuerpo: "Hola {{1}}, tu cita es {{2}} a las {{3}}"
3. Ve preview en tiempo real
4. Click "Guardar"
5. ✅ Plantilla creada (status=DRAFT)

6. Luego: Click "Enviar a Meta para Aprobación"
7. Espera 24-48 horas
8. ✅ Meta aprueba (status=APPROVED)
```

#### PASO 3: Enviar Mensajes

**Ubicación: Múltiples lugares**

```
OPCIÓN A: Desde cliente
  - Ve a Clientes → Selecciona cliente
  - Click "📱 Enviar WhatsApp"
  - Selecciona plantilla
  - Completa variables
  - Click "Enviar"
  - ✅ Enviado

OPCIÓN B: Desde cita
  - Ve a Calendario → Click cita
  - Click "Recordatorio por WhatsApp"
  - Sistema automáticamente envía
  - ✅ Enviado

OPCIÓN C: Automático (futuro)
  - Configurar en Perfil → WhatsApp
  - "Enviar recordatorio 24h antes"
  - Sistema hace todo
```

---

## Pregunta 6: ¿Qué significa "logueandose con Meta"?

### Respuesta: OAuth Flow con Facebook

```
┌──────────────────────────────────────────────────┐
│         EMBEDDED SIGNUP (Cuando esté listo)      │
└──────────────────────────────────────────────────┘

User en Beauty Control:
  ↓
  Click "Conectar con Meta Business"
  ↓
  [Facebook OAuth Window Abre]
  ├─ User: Email y password de Meta
  ├─ Facebook valida
  ├─ Pide permiso: "Beauty Control quiere acceso a..."
  │   - whatsapp_business_messaging
  │   - whatsapp_business_management
  ├─ User: "Autorizar"
  │   ↓
  │   [Selecciona WABA y Phone Number]
  │   ↓
  │   Facebook retorna: access_token
  │
  └─ [Ventana Cierra]
  ↓
  Backend Beauty Control:
    1. Recibe authorization code
    2. Intercambia por access_token
    3. Encripta y guarda en BD
    4. ✅ Usuario conectado
  ↓
  User en Beauty Control:
    ✅ "WhatsApp Conectado"
    ✅ Puede usar templates
```

**AHORA (mientras se activa Embedded):**
```
El componente muestra: "En proceso de activación"
Usuario usa: Método Manual (copiar/pegar credenciales)
Backend: Todavía validar código pero usar método manual first
```

---

## RESUMEN: RESPUESTAS DIRECTAS

| Pregunta | Respuesta |
|----------|-----------|
| ¿Tenants pueden enviar por WhatsApp? | ✅ SÍ, 100% posible |
| ¿Webhook funciona? | ✅ SÍ, completamente |
| ¿Necesito verificar app? | 🟡 Solo si voy a producción |
| ¿Cuál es la URI del webhook? | `https://dominio.com/api/webhooks/whatsapp` |
| ¿Qué debe hacer usuario? | 3 pasos: Conectar → Crear Templates → Enviar |
| ¿Meta OAuth automatizado? | ⏳ En proceso, usa método manual por ahora |

---

## 🎯 SIGUIENTE PASO

Hoy creamos:
1. ✅ Endpoint de envío: `POST /api/business/{id}/whatsapp/send-template-message`
2. ✅ Documentación completa del flujo
3. ✅ APIs en frontend

**Próximo paso más importante:**
- [ ] Crear botón/modal en UI para disparar `sendTemplateMessage`
- [ ] Integrar con clientes/citas
- [ ] Test con un tenant real

¿Necesitas que implemente la UI ahora?

