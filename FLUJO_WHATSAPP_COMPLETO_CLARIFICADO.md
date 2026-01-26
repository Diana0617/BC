# 📱 Flujo WhatsApp Completo - Guía Clarificada

## 🎯 Resumen Ejecutivo

**Pregunta:** ¿Pueden los tenants enviar mensajes por WhatsApp usando plantillas que crean en la interface?

**Respuesta:** ✅ **SÍ es posible** - Tienes el 80% implementado. Te faltan 3 pasos críticos.

---

## 📊 Estado Actual

### ✅ YA IMPLEMENTADO
- ✅ Webhook de Meta funcionando (recibe eventos)
- ✅ Estructura de tokens encriptados (`WhatsAppTokenManager`)
- ✅ Modelos y rutas de templates
- ✅ API de frontend para crear/editar/enviar templates
- ✅ Servicios backend para enviar mensajes

### ❌ INCOMPLETO / FALTANTE
- ❌ Embedded Signup no completamente configurado
- ❌ No hay endpoint para que los tenants ENVIEN mensajes (solo templates)
- ❌ Validación de app de Meta incompleta
- ❌ Documentación clara del flujo para usuarios finales

---

## 🔄 FLUJO COMPLETO EXPLICADO

### FASE 1: CONFIGURACIÓN INICIAL (Lo que hizo Meta)

```
[Meta Business Dashboard]
         ↓
    Crear App WhatsApp
         ↓
  Obtener credenciales:
  - App ID
  - App Secret
  - Business Account ID (WABA)
  - Phone Number ID
  - Access Token
         ↓
  ✅ Webhook configurado
  Endpoint: https://tudominio.com/api/webhooks/whatsapp
  Verify Token: beauty_control_whatsapp_verify
```

**Tu estado:** ✅ El webhook ya recibe eventos de Meta

---

### FASE 2: CONECTAR TENANT A WHATSAPP (Lo que debe hacer cada tenant)

#### Opción A: Embedded Signup (Recomendado - 1 click)
```
[Tenant]
  ↓
Log in a Beauty Control
  ↓
Ir a Perfil → WhatsApp → Conexión Rápida
  ↓
Click "Conectar con Meta Business"
  ↓
[Facebook OAuth]
Se abre ventana de Meta
Tenant selecciona su WABA y Phone Number
  ↓
Meta autoriza → Retorna al app
  ↓
Backend guarda token en WhatsAppToken table (encriptado)
  ↓
✅ Tenant conectado
```

**Tu estado:** ⚠️ Componente existe pero config falta
- Necesitas: `FACEBOOK_APP_ID` y `FACEBOOK_CONFIG_ID` en env vars
- Endpoint existe pero falta implementar exchange code → token

#### Opción B: Manual Token (Mientras se activa Embedded)
```
[Tenant en Meta Business]
  ↓
Obtiene su propio:
- Access Token
- Phone Number ID
- WABA ID
  ↓
Va a Beauty Control → Perfil → WhatsApp → Método Manual
  ↓
Pega credenciales
  ↓
POST /api/admin/whatsapp/businesses/:businessId/tokens
  Body: { accessToken, phoneNumberId, wabaId, phoneNumber }
  ↓
Backend valida token con Meta API
Backend encripta y guarda en BD
  ↓
✅ Tenant conectado
```

**Tu estado:** ✅ Completamente implementado

---

### FASE 3: CREAR PLANTILLAS (Lo que hace cada tenant)

```
[Tenant en Beauty Control]
  ↓
Perfil → WhatsApp → Templates
  ↓
Click "Nueva Plantilla"
  ↓
Completa formulario:
- Nombre: appointment_reminder_v1
- Idioma: Español
- Categoría: UTILITY
- Componentes:
  * Header: "Recordatorio de Cita"
  * Body: "Hola {{1}}, tienes cita el {{2}} a las {{3}}"
  * Footer: "Beauty Control"
  * Buttons: [Confirmar] [Reprogramar]
  ↓
Vista previa en tiempo real
  ↓
Click "Guardar Plantilla"
  ↓
POST /api/admin/whatsapp/businesses/:businessId/templates
  ↓
Backend crea en whatsapp_message_templates (status=DRAFT)
  ↓
✅ Plantilla creada localmente

Luego:
Click "Enviar a Meta para Aprobación"
  ↓
POST /api/admin/whatsapp/businesses/:businessId/templates/:templateId/submit
  ↓
Backend llama a Meta Graph API
  ↓
Meta revisa (24-48 horas)
  ↓
Webhook de Meta notifica aprobación/rechazo
  ↓
Backend actualiza status en BD a APPROVED/REJECTED
  ↓
✅ Plantilla lista para usar
```

**Tu estado:** ✅ Todo está implementado en backend

---

### FASE 4: ENVIAR MENSAJES (⚠️ ESTE FALTA)

**PROBLEMA IDENTIFICADO:** No hay endpoint para que los tenants envíen mensajes.

```
[Tenant quiere enviar recordatorio de cita]
  ↓
¿Qué debería pasar?
  ↓
Backend detecta cita próxima
  ↓
Llama a WhatsAppService.sendAppointmentReminder()
  ↓
WhatsAppService obtiene config del tenant
  ↓
Llama a Meta API con template aprobado
  ↓
Meta envía mensaje al cliente
  ↓
Webhook de Meta notifica: "delivered", "read", "failed"
  ↓
Backend actualiza status en WhatsAppMessage
  ↓
✅ Mensaje enviado
```

**Tu estado:** ❌ El servicio existe pero...
- No se llama desde ningún lugar
- No hay endpoint público para que los tenants lo disparen
- No hay lógica de triggers automáticos

---

## 🚀 LO QUE NECESITAS HACER

### PASO 1: Configurar Credenciales de Meta en tu Backend

```env
# .env backend
WHATSAPP_WEBHOOK_VERIFY_TOKEN=beauty_control_whatsapp_verify
WHATSAPP_APP_SECRET=tu_app_secret_aqui
FACEBOOK_APP_ID=tu_app_id_aqui
FACEBOOK_APP_SECRET=tu_app_secret_aqui

# Para Embedded Signup (Opcional, por ahora usa Manual)
FACEBOOK_EMBEDDED_SIGNUP_CONFIG_ID=tu_config_id_aqui
```

### PASO 2: Verificar tu App en Meta (CRÍTICO)

**¿Necesitas verificar la app?** SÍ, pero depende:

#### Si la app está en desarrollo:
- ✅ No necesitas verificación aún
- ✅ Puedes usar con tokens manuales
- ✅ Solo funciona con usuarios de prueba

#### Si la app está en producción:
- ❌ NECESITAS verificar la app en Meta
- ❌ Sin verificación, el webhook NO funcionará
- ❌ Los tokens expirarán en 24 horas

**¿Cómo verificar?**
1. Ve a Meta Developers → Tu App → Settings → Basic
2. Selecciona "App Type" → Verificación
3. Responde preguntas de seguridad
4. Meta revisa (2-5 días)
5. Una vez aprobada, todos los webhooks funcionan indefinidamente

### PASO 3: Crear Endpoint de Envío de Mensajes

**Tu problema:** El servicio existe pero nadie lo llama.

**Solución:** Crear un endpoint que los tenants puedan disparar:

```javascript
// Backend: POST /api/business/:businessId/whatsapp/send-message
router.post(
  '/business/:businessId/whatsapp/send-message',
  authenticateToken,
  async (req, res) => {
    const { clientPhone, templateName, variables, templateId } = req.body;
    const { businessId } = req.params;
    
    // Validar tenant
    if (req.user.businessId !== businessId) {
      return res.status(403).json({ success: false, error: 'No autorizado' });
    }
    
    // Enviar mensaje
    const result = await whatsappService.sendTemplateMessage(
      businessId,
      clientPhone,
      templateName,
      variables
    );
    
    return res.json(result);
  }
);
```

### PASO 4: Actualizar Componente Frontend

El componente `WhatsAppConnectionCard` ya existe, pero necesita:

```jsx
// Agregar botón "Enviar Mensaje de Prueba"
<button onClick={handleSendTestMessage}>
  📤 Enviar Mensaje de Prueba
</button>

const handleSendTestMessage = async () => {
  const result = await dispatch(sendMessage({
    clientPhone: '+573001234567',
    templateName: 'appointment_reminder_v1',
    variables: {
      clientName: 'Juan',
      appointmentDate: '2026-01-30',
      appointmentTime: '14:00'
    }
  }));
};
```

---

## 📋 REQUISITOS DE META PARA CADA TENANT

### Minimal (Desarrollo/Testing):
- ✅ App creada en Meta
- ✅ WABA creada
- ✅ Número de teléfono agregado
- ✅ Webhook configurado
- ✅ **NO requiere** verificación aún
- ⚠️ Solo funciona con usuarios de prueba

### Producción (Para enviar a clientes reales):
- ✅ App verificada en Meta
- ✅ WABA verificada
- ✅ Número de teléfono verificado con Meta
- ✅ Templates aprobados
- ✅ Límite de 1000 mensajes/día al inicio (aumenta según uso)

---

## 🔗 ESTRUCTURA DE CARPETAS RELEVANTE

```
Backend:
└── src/
    ├── controllers/
    │   ├── WhatsAppAdminController.js     ✅ Token & Template mgmt
    │   └── WhatsAppWebhookController.js   ✅ Recibe eventos de Meta
    ├── services/
    │   ├── WhatsAppService.js             ✅ Envía mensajes
    │   └── WhatsAppTokenManager.js        ✅ Maneja tokens encriptados
    ├── models/
    │   ├── WhatsAppToken.js               ✅ Tokens
    │   ├── WhatsAppMessage.js             ✅ Historial
    │   └── WhatsAppMessageTemplate.js     ✅ Templates
    └── routes/
        ├── whatsappWebhookRoutes.js       ✅ GET/POST /api/webhooks/whatsapp
        └── whatsappAdminRoutes.js         ✅ /api/admin/whatsapp/*

Frontend:
└── src/pages/business/profile/sections/whatsapp/
    ├── WhatsAppConnectionTab.jsx         ✅ Tab principal
    ├── WhatsAppConnectionCard.jsx        ✅ Estado actual
    ├── WhatsAppEmbeddedSignup.jsx        ⚠️ Necesita config
    ├── WhatsAppTokenManagement.jsx       ✅ Método manual
    ├── WhatsAppTemplateEditor.jsx        ✅ Editor de templates
    └── WhatsAppTemplatePreview.jsx       ✅ Preview
```

---

## 🧪 TESTING DEL FLUJO

### Test 1: Verificar Webhook (GET)
```bash
curl -X GET "http://localhost:5000/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=beauty_control_whatsapp_verify&hub.challenge=abc123"

Respuesta esperada: abc123 (mismo valor del challenge)
```

### Test 2: Guardar Token Manual
```bash
curl -X POST "http://localhost:5000/api/admin/whatsapp/businesses/{businessId}/tokens" \
  -H "Authorization: Bearer {token_del_tenant}" \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "EAABxxxxxx",
    "phoneNumberId": "113xxx",
    "wabaId": "112xxx",
    "phoneNumber": "+573001234567",
    "metadata": {
      "source": "manual"
    }
  }'

Respuesta esperada: { success: true, data: { token guardado encriptado } }
```

### Test 3: Crear Template
```bash
curl -X POST "http://localhost:5000/api/admin/whatsapp/businesses/{businessId}/templates" \
  -H "Authorization: Bearer {token_del_tenant}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test_template",
    "language": "es",
    "category": "UTILITY",
    "components": {
      "header": "Test Header",
      "body": "Hola {{1}}, esto es un test",
      "footer": "Beauty Control"
    }
  }'

Respuesta esperada: { success: true, data: { template creada con status=DRAFT } }
```

### Test 4: Enviar Mensaje (FALTA IMPLEMENTAR)
```bash
curl -X POST "http://localhost:5000/api/business/{businessId}/whatsapp/send-message" \
  -H "Authorization: Bearer {token_del_tenant}" \
  -H "Content-Type: application/json" \
  -d '{
    "clientPhone": "+573001234567",
    "templateName": "test_template",
    "variables": {
      "clientName": "Juan"
    }
  }'

Respuesta esperada: { success: true, messageId: "wamid_xxx" }
```

---

## 🎓 GUÍA PARA CADA USUARIO FINAL (Tenant)

### Para un Negocio (Salón/Spa):

#### 1️⃣ Conectar WhatsApp (5 minutos)
```
A. Si tienes Meta Business:
   - Ve a Perfil → WhatsApp
   - Click "Conectar con Meta Business" (cuando esté activo)
   - Autoriza a Beauty Control
   - ✅ Listo

B. Si no tienes Meta Business aún:
   - Crea cuenta en https://business.facebook.com
   - Crea WABA en Facebook
   - Agrega tu número de teléfono
   - Obtén Access Token
   - Ve a Beauty Control → Perfil → WhatsApp → Método Manual
   - Pega el token
   - Click "Guardar"
   - ✅ Listo
```

#### 2️⃣ Crear Plantillas (10 minutos por template)
```
- Ve a Perfil → WhatsApp → Templates
- Click "Nueva Plantilla"
- Nombre: appointment_reminder_v1
- Categoría: UTILITY
- Cuerpo: "Hola {{1}}, tu cita es el {{2}} a las {{3}}"
- Click "Guardar Plantilla"
- Click "Enviar a Meta para Aprobación"
- Espera 24-48 horas
- Cuando esté aprobada, ¡ya puedes usarla!
```

#### 3️⃣ Enviar Mensajes
```
Opción A: Automático (cuando se implemente)
- Al crear una cita, selecciona "Notificar por WhatsApp"
- Sistema envía automáticamente

Opción B: Manual
- Ve a Clientes
- Click en cliente
- Click "Enviar WhatsApp"
- Selecciona plantilla
- Completa variables
- Click "Enviar"
- ✅ Mensaje enviado
```

---

## ⚠️ LIMITACIONES Y CONSIDERACIONES

### Limitaciones de Meta:
1. **Templates deben estar aprobados** - No puedes enviar texto libre (solo templates)
2. **Límite de envío** - Empieza en 1000/día, aumenta según reputación
3. **Horario** - Meta tiene límites de velocidad (no más de 60 mensajes/minuto)
4. **Números verificados** - El número debe estar verificado con Meta para producción
5. **24h window** - Solo puedes responder dentro de 24h sin template

### Consideraciones técnicas:
1. **Tokens expiran** - Especialmente si la app no está verificada (24h)
2. **Webhook crítico** - Sin webhook, no sabes si se entregó/leyó
3. **Encriptación de tokens** - Están encriptados en BD, así que es seguro
4. **Rate limiting** - Backend debe respetar límites de Meta

---

## 📝 RESUMEN: QUÉ DEBES HACER AHORA

### Corto Plazo (Esta semana):
- [ ] Configurar env vars de Meta App
- [ ] Implementar endpoint de envío: POST `/api/business/:businessId/whatsapp/send-message`
- [ ] Probar flujo completo con método manual

### Mediano Plazo (2-4 semanas):
- [ ] Configurar Embedded Signup (OAuth con Meta)
- [ ] Implementar triggers automáticos (cita próxima → enviar recordatorio)
- [ ] Documentación de usuario final en panel

### Largo Plazo (Producción):
- [ ] Verificar app en Meta
- [ ] Verificar números de los tenants
- [ ] Aumentar límites de envío
- [ ] Analytics de delivery (abiertos, etc.)

---

## 📞 URLs Referencias

- **Meta Business Setup:** https://business.facebook.com
- **Graph API Docs:** https://developers.facebook.com/docs/graph-api
- **WhatsApp API:** https://developers.facebook.com/docs/whatsapp
- **Webhook Docs:** https://developers.facebook.com/docs/whatsapp/webhooks
- **Embedded Signup:** https://developers.facebook.com/docs/whatsapp/embedded-signup

