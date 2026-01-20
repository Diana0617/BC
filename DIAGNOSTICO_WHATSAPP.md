# 🔍 DIAGNÓSTICO COMPLETO - WhatsApp Business Platform

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### 1. CONFIGURACIÓN EN META FOR DEVELOPERS

#### 1.1 App de Meta (COMPLETADO ✅)
- **App ID**: `1928881431390804`
- **App Secret**: `793aa3cfe4cfbadd8c2268478d4f99af`
- **Estado**: ✅ Configurado en .env

#### 1.2 Producto WhatsApp Business Platform
- [ ] **WhatsApp Business API agregado a la app**
- [ ] **Número de teléfono configurado y verificado**
- [ ] **Cuenta WABA (WhatsApp Business Account) creada**

#### 1.3 Webhook Configuration
- **URL del Webhook**: `https://beautycontrol-api.azurewebsites.net/api/webhooks/whatsapp`
- **Verify Token**: `beauty_control_webhook_verify_2024`
- **Campos suscritos necesarios**:
  - [x] `messages` - Mensajes entrantes
  - [x] `message_status` - Estados de mensajes enviados
  - [ ] Verificar que estén activados en Meta

#### 1.4 Permisos de la App
Permisos necesarios en Meta:
- [ ] `whatsapp_business_messaging` - Enviar y recibir mensajes
- [ ] `whatsapp_business_management` - Gestionar cuenta de negocio
- [ ] `business_management` - Gestionar información del negocio

---

### 2. CONFIGURACIÓN DE BACKEND (COMPLETADO ✅)

#### 2.1 Variables de Entorno (.env)
```bash
✅ META_APP_ID=1928881431390804
✅ META_APP_SECRET=793aa3cfe4cfbadd8c2268478d4f99af
✅ WHATSAPP_CONFIG_ID=884984130753544
✅ WHATSAPP_WEBHOOK_VERIFY_TOKEN=beauty_control_webhook_verify_2024
✅ WHATSAPP_ENCRYPTION_KEY=f2ca5316d90d0019c8a3babd497211bf57619106acdda82a3355f890fcf87590
```

#### 2.2 Modelos de Base de Datos
- ✅ `WhatsAppToken` - Almacena tokens encriptados
- ✅ `WhatsAppMessage` - Historial de mensajes
- ✅ `WhatsAppMessageTemplate` - Plantillas de mensajes
- ✅ `WhatsAppWebhookEvent` - Log de eventos del webhook

#### 2.3 Servicios
- ✅ `WhatsAppService` - Envío de mensajes
- ✅ `WhatsAppTokenManager` - Gestión segura de tokens
- ✅ `EncryptionService` - Encriptación AES-256-GCM

#### 2.4 Controladores
- ✅ `WhatsAppAdminController` - Gestión de tokens y plantillas
- ✅ `WhatsAppWebhookController` - Recepción de eventos de Meta

#### 2.5 Rutas Registradas
- ✅ `/api/admin/whatsapp/*` - Administración (requiere auth)
- ✅ `/api/webhooks/whatsapp` - Webhook público

---

### 3. FLUJO DE CONFIGURACIÓN INICIAL

#### Paso 1: Almacenar Token Manualmente
```bash
POST https://beautycontrol-api.azurewebsites.net/api/admin/whatsapp/businesses/{businessId}/tokens
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "accessToken": "EAAb...",  // Token de Meta
  "phoneNumberId": "123456789",  // Phone Number ID de Meta
  "wabaId": "987654321",  // WABA ID (opcional)
  "phoneNumber": "+573001234567",  // Número de WhatsApp
  "metadata": {
    "displayName": "Beauty Control",
    "qualityRating": "GREEN"
  }
}
```

#### Paso 2: Verificar Token
```bash
GET https://beautycontrol-api.azurewebsites.net/api/admin/whatsapp/businesses/{businessId}/tokens
Authorization: Bearer {JWT_TOKEN}
```

#### Paso 3: Probar Conexión
```bash
POST https://beautycontrol-api.azurewebsites.net/api/admin/whatsapp/businesses/{businessId}/test-connection
Authorization: Bearer {JWT_TOKEN}
```

---

### 4. PROBLEMAS COMUNES Y SOLUCIONES

#### 4.1 Webhook No se Verifica
**Síntoma**: Meta no puede verificar el webhook

**Posibles causas**:
1. ❌ URL no accesible públicamente
2. ❌ Verify token no coincide
3. ❌ Endpoint GET no responde correctamente

**Solución**:
```bash
# Probar el endpoint manualmente
curl "https://beautycontrol-api.azurewebsites.net/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=beauty_control_webhook_verify_2024&hub.challenge=test123"

# Debe responder: test123
```

#### 4.2 No Llegan Eventos del Webhook
**Síntoma**: El webhook se verificó pero no llegan eventos

**Posibles causas**:
1. ❌ Campos no suscritos en Meta
2. ❌ Validación de firma falla
3. ❌ App no tiene permisos

**Solución**:
- Revisar en Meta Developer Console > WhatsApp > Configuration
- Verificar que `messages` y `message_status` estén activados
- Revisar logs del servidor para ver si llegan peticiones POST

#### 4.3 No Se Pueden Enviar Mensajes
**Síntoma**: Error al intentar enviar mensajes

**Posibles causas**:
1. ❌ Token no configurado o expirado
2. ❌ Phone Number ID incorrecto
3. ❌ Número de destino no está en lista de prueba (modo desarrollo)
4. ❌ Plantilla no aprobada (para mensajes con plantilla)

**Solución**:
```bash
# 1. Verificar token
GET /api/admin/whatsapp/businesses/{businessId}/tokens

# 2. Probar conexión
POST /api/admin/whatsapp/businesses/{businessId}/test-connection

# 3. Enviar mensaje de prueba (solo funciona con números de prueba en desarrollo)
```

#### 4.4 App en Modo Desarrollo
**Limitaciones**:
- ✅ Solo puedes enviar mensajes a números de prueba agregados en Meta
- ✅ Límite de 250 conversaciones por día
- ✅ Plantillas deben ser pre-aprobadas

**Para modo producción**:
1. Completar App Review en Meta
2. Verificar negocio en Meta Business Manager
3. Aprobar plantillas de mensajes
4. Solicitar aumento de límites

---

### 5. VERIFICACIÓN PASO A PASO

#### ✅ BACKEND
```bash
# 1. Verificar que el servidor está corriendo
curl https://beautycontrol-api.azurewebsites.net/health

# 2. Verificar endpoint de webhook (GET)
curl "https://beautycontrol-api.azurewebsites.net/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=beauty_control_webhook_verify_2024&hub.challenge=test123"
# Debe responder: test123

# 3. Verificar que puedes acceder a admin endpoints (requiere autenticación)
curl -H "Authorization: Bearer {JWT}" https://beautycontrol-api.azurewebsites.net/api/admin/whatsapp/embedded-signup/config
```

#### ⚙️ META CONFIGURATION
1. **Ir a**: https://developers.facebook.com/apps/1928881431390804
2. **Verificar**:
   - WhatsApp > Configuration > Webhook:
     - Callback URL: `https://beautycontrol-api.azurewebsites.net/api/webhooks/whatsapp`
     - Verify token: `beauty_control_webhook_verify_2024`
     - Campos: `messages`, `message_status` ✅
3. **Revisar**:
   - WhatsApp > Getting Started > Phone Number Status
   - Business > Business Verification Status
   - App Review > Permissions and Features

#### 🔐 TOKEN CONFIGURATION
1. **Obtener Token de Acceso**:
   - Ir a WhatsApp > Getting Started
   - Copiar el "Temporary access token" (válido por 24 horas)
   - O usar "System User Token" (permanente)

2. **Obtener Phone Number ID**:
   - En WhatsApp > Getting Started
   - Buscar "Phone number ID" debajo del número de teléfono

3. **Almacenar en Beauty Control**:
   ```bash
   POST /api/admin/whatsapp/businesses/{businessId}/tokens
   ```

---

### 6. NEXT STEPS - CONFIGURACIÓN COMPLETA

#### Opción A: Configuración Manual (Actual)
1. [ ] Obtener token temporal de Meta (válido 24h)
2. [ ] Almacenar token via API
3. [ ] Probar conexión
4. [ ] Configurar webhook en Meta
5. [ ] Enviar mensaje de prueba

#### Opción B: Embedded Signup (Recomendado)
1. [ ] Implementar botón "Conectar WhatsApp" en frontend
2. [ ] Usar OAuth flow para obtener tokens automáticamente
3. [ ] No requiere copiar/pegar tokens manualmente

---

### 7. COMANDOS DE PRUEBA

#### Probar Webhook Localmente (si tienes ngrok)
```bash
# 1. Instalar ngrok
npm install -g ngrok

# 2. Exponer puerto local
ngrok http 3001

# 3. Usar URL de ngrok en Meta
# https://{random}.ngrok.io/api/webhooks/whatsapp
```

#### Enviar Mensaje de Prueba (desde backend)
```javascript
const whatsappService = require('./services/WhatsAppService');

// Enviar mensaje simple
await whatsappService.sendTextMessage(
  'businessId-aqui',
  '+573001234567',  // Número debe estar en lista de prueba
  'Hola desde Beauty Control! 🎉'
);
```

---

### 8. MONITOREO Y DEBUGGING

#### Logs a Revisar
1. **Servidor Backend**:
   - Ver logs de Azure App Service
   - Buscar errores de WhatsApp

2. **Meta Developer Console**:
   - WhatsApp > Webhooks > Ver eventos recibidos
   - Revisar errores de validación

3. **Base de Datos**:
   ```sql
   -- Ver mensajes enviados
   SELECT * FROM whatsapp_messages ORDER BY created_at DESC LIMIT 10;
   
   -- Ver eventos del webhook
   SELECT * FROM whatsapp_webhook_events ORDER BY received_at DESC LIMIT 10;
   
   -- Ver token configurado
   SELECT business_id, token_type, is_active, expires_at, metadata 
   FROM whatsapp_tokens WHERE is_active = true;
   ```

---

### 9. ERRORES COMUNES Y CÓDIGOS

| Error | Causa | Solución |
|-------|-------|----------|
| `(#100) No matching user found` | Número no está en lista de prueba | Agregar número en Meta > WhatsApp > Getting Started |
| `(#131030) Recipient phone number not in allowed list` | App en modo desarrollo | Agregar número a lista de prueba o aprobar app |
| `(#131031) Message Template is in PENDING or REJECTED status` | Plantilla no aprobada | Esperar aprobación o usar mensaje de sesión abierta |
| `(#190) Invalid OAuth access token` | Token expirado o inválido | Obtener nuevo token y guardarlo |
| `(#33) This object does not exist or does not support this action` | Phone Number ID incorrecto | Verificar ID en Meta console |

---

### 10. ESTADO ACTUAL - TAREAS PENDIENTES

#### ⏳ TODO:
1. [ ] Verificar webhook en Meta Developer Console
2. [ ] Confirmar que campos `messages` y `message_status` están suscritos
3. [ ] Obtener y almacenar token de acceso para un negocio
4. [ ] Agregar número de prueba en Meta (para testing)
5. [ ] Probar envío de mensaje simple
6. [ ] Verificar que llegan eventos al webhook
7. [ ] Crear plantillas de mensajes básicas
8. [ ] Enviar plantillas para aprobación

#### 🎯 PRIORIDAD ALTA:
1. **Configurar webhook correctamente en Meta**
2. **Almacenar token de acceso**
3. **Probar con número de prueba**

---

## 📞 SUPPORT

Si necesitas ayuda:
1. Meta Developer Support: https://developers.facebook.com/support/
2. WhatsApp Business API Documentation: https://developers.facebook.com/docs/whatsapp
3. Beauty Control Technical Docs: /docs/GUIA_CONFIGURACION_WHATSAPP_META.pdf
