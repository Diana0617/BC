# 🔍 Diagnóstico y Solución: Conexión WhatsApp Business

## 📊 Estado Actual del Problema

**Síntomas:**
- ✅ Webhook recibe respuestas de Meta
- ❌ No se completa la conexión del negocio
- ❓ No está claro si el error es de configuración de Meta o del código

---

## ❌ Problemas Identificados

### 1. **Confusión con URLs de Redirect** ⚠️

**Lo que tienes configurado:**
```
https://www.controldenegocios.com/business/profile
```

**¿Es correcto?**
- ✅ **SÍ para el frontend:** Esta es la página donde está el botón de "Conectar"
- ⚠️ **PERO:** Para Embedded Signup con `FB.login()`, Meta **NO redirige a esta URL**
- 📱 El flujo OAuth ocurre en un **popup** y se cierra automáticamente

**¿Qué URL configurar en Meta Developer Dashboard?**
```javascript
// Opción 1: URL genérica de OAuth (recomendado)
https://www.controldenegocios.com/oauth/whatsapp/callback

// Opción 2: URL del dominio base (también válido para FB.login popup)
https://www.controldenegocios.com
```

**Variable de entorno necesaria:**
```bash
# En .env
WHATSAPP_REDIRECT_URI=https://www.controldenegocios.com/oauth/whatsapp/callback
```

---

### 2. **Configuración Faltante en Meta Developer Dashboard** 🔧

Ve a https://developers.facebook.com/apps/ y selecciona tu app:

#### A. **Settings → Basic**
```
✅ App ID: [Tu META_APP_ID]
✅ App Secret: [Tu WHATSAPP_APP_SECRET]  
✅ App Domains: controldenegocios.com
✅ Privacy Policy URL: https://www.controldenegocios.com/privacy
✅ Terms of Service URL: https://www.controldenegocios.com/terms
```

#### B. **Settings → Basic → OAuth Redirect URLs** (CRÍTICO)
```
Agregar estas URLs:
https://www.controldenegocios.com/oauth/whatsapp/callback
https://www.controldenegocios.com/business/profile
https://www.controldenegocios.com
```

#### C. **WhatsApp → Configuration**
```
✅ Configuration ID: [Copiar este ID]
   - Crear "WhatsApp Business Configuration" si no existe
   - Nombre: "Beauty Control Production"
   
✅ Webhook URL: https://www.controldenegocios.com/api/webhooks/whatsapp
✅ Verify Token: [Valor de WHATSAPP_WEBHOOK_VERIFY_TOKEN]

✅ Webhook Fields (marcar todos):
   - messages
   - message_status  
   - message_template_status_update
```

#### D. **Use Cases → Customize** (o "App Review → Permissions")
```
Solicitar permisos (si no están aprobados):
✅ whatsapp_business_management
✅ whatsapp_business_messaging

Estado: En modo "Development" no necesitas aprobación
```

---

### 3. **Verificar Variables de Entorno** 🔑

En tu archivo `.env` de producción (Render/Vercel):

```bash
# Meta/Facebook App
META_APP_ID=tu_app_id_aqui
WHATSAPP_APP_SECRET=tu_app_secret_aqui
WHATSAPP_CONFIG_ID=tu_configuration_id_aqui

# Webhook
WHATSAPP_WEBHOOK_VERIFY_TOKEN=beauty_control_whatsapp_verify

# Redirect URI
WHATSAPP_REDIRECT_URI=https://www.controldenegocios.com/oauth/whatsapp/callback
```

---

## 🔍 Cómo Diagnosticar el Problema

### Paso 1: Verificar que el SDK de Facebook se carga

Abre la consola del navegador en `/business/profile` y verifica:

```javascript
// ✅ Debe devolver un objeto, no undefined
console.log(window.FB)

// ✅ Debe mostrar tu App ID
console.log(window.FB && window.FB.getAppId && window.FB.getAppId())
```

---

### Paso 2: Probar el flujo de Embedded Signup manualmente

```javascript
// Ejecutar en consola del navegador
window.FB.login(
  (response) => {
    console.log('FB.login response:', response)
    if (response.authResponse) {
      console.log('✅ Código obtenido:', response.authResponse.code)
      console.log('Setup info:', response.authResponse.setup)
    } else {
      console.log('❌ Usuario canceló o error')
    }
  },
  {
    config_id: 'TU_WHATSAPP_CONFIG_ID',
    response_type: 'code',
    override_default_response_type: true,
    extras: { setup: {} }
  }
)
```

**Resultados esperados:**
- ✅ Se abre popup de Meta
- ✅ Usuario ve solicitud de permisos
- ✅ Después de autorizar, popup se cierra
- ✅ Console.log muestra `code` y `setup`

**Si falla:**
- ❌ Popup no se abre → Revisar `config_id`
- ❌ Error "Invalid OAuth Redirect URI" → Revisar configuración en Meta
- ❌ Error "App not configured" → Revisar que WhatsApp esté agregado a la app

---

### Paso 3: Verificar logs del backend

Cuando hagas clic en "Conectar con Meta", revisa los logs del backend:

```bash
# Logs esperados:
🔧 Embedded Signup Config requested { appId: '...', configId: '...', ... }
Exchanging code for token... { appId: '...', redirectUri: '...', codeLength: 380 }
Access token obtained successfully
Token debug info: { data: { ... } }
WABA and phone number found { wabaId: '...', phoneNumberId: '...', ... }
✅ WhatsApp connected via Embedded Signup for business abc-123
```

**Si no ves estos logs:**
- ❌ El frontend no está llamando al backend
- ❌ El código de autorización no se está enviando

---

## ✅ Cambios Aplicados al Código

### 1. Backend: URL de Redirect Dinámica

**Archivo:** `packages/backend/src/controllers/WhatsAppAdminController.js`

```javascript
// Antes (hardcoded):
const redirectUri = 'https://www.controldenegocios.com/business/profile';

// Ahora (configurable vía env var):
const redirectUri = process.env.WHATSAPP_REDIRECT_URI || 
  'https://www.controldenegocios.com/oauth/whatsapp/callback';
```

**Ubicaciones actualizadas:**
- `getEmbeddedSignupConfig()` (línea ~416)
- `_exchangeCodeForToken()` (línea ~548)

---

### 2. Backend: Logging Mejorado

Agregado logging detallado en:
- ✅ Solicitud de config de Embedded Signup
- ✅ Intercambio de código por token
- ✅ Obtención de WABA y phone number
- ✅ Errores específicos de Meta API

---

### 3. Backend: Validación de Variables de Entorno

```javascript
if (!appId || !configId) {
  return res.status(500).json({
    success: false,
    error: 'Configuración de WhatsApp incompleta',
    details: {
      missingAppId: !appId,
      missingConfigId: !configId
    }
  });
}
```

---

## 🧪 Cómo Probar la Conexión

### Test 1: Verificar Webhook

```bash
# Test desde terminal
curl -X GET "https://www.controldenegocios.com/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=beauty_control_whatsapp_verify&hub.challenge=test123"

# Respuesta esperada:
test123
```

---

### Test 2: Obtener Config de Embedded Signup

```bash
# Desde Insomnia/Postman con token de autenticación
GET https://www.controldenegocios.com/api/admin/whatsapp/embedded-signup/config
Authorization: Bearer YOUR_JWT_TOKEN

# Respuesta esperada:
{
  "success": true,
  "data": {
    "appId": "123456789",
    "configId": "987654321",
    "redirectUri": "https://www.controldenegocios.com/oauth/whatsapp/callback",
    "state": "eyJidXNpbmVzc0lkIjoiLi4uIn0=",
    "scope": "whatsapp_business_management,whatsapp_business_messaging"
  }
}
```

---

### Test 3: Flujo Completo desde UI

1. **Ir a** `https://www.controldenegocios.com/business/profile`
2. **Click en** "Conectar con Meta (Recomendado)"
3. **Verificar consola del navegador:**
   ```
   🔧 Embedded Signup Config: { appId: '...', configId: '...' }
   ```
4. **Se abre popup de Meta** → Autorizar permisos
5. **Popup se cierra automáticamente**
6. **Ver toast notification:** "✅ Conexión exitosa con WhatsApp Business"
7. **Verificar en BD:** Tabla `whatsapp_tokens` debe tener registro

---

## 🚨 Errores Comunes y Soluciones

### Error: "Invalid OAuth Redirect URI"

**Causa:** La URL configurada en el código no coincide con Meta Dashboard

**Solución:**
1. Ve a Meta Dashboard → Settings → Basic
2. Agregar **TODAS** estas URLs a "Valid OAuth Redirect URIs":
   ```
   https://www.controldenegocios.com
   https://www.controldenegocios.com/oauth/whatsapp/callback
   https://www.controldenegocios.com/business/profile
   ```
3. Guardar cambios (puede tardar 5-10 min en propagarse)

---

### Error: "Código o estado faltante"

**Causa:** El frontend no está enviando el `code` al backend

**Solución:**
Verificar en `WhatsAppEmbeddedSignup.jsx`:
```javascript
if (response.authResponse) {
  const { code } = response.authResponse;
  console.log('📱 Código recibido:', code); // DEBUG
  
  // Enviar al backend
  dispatch(handleEmbeddedSignupCallback({
    code,
    state: embeddedSignupConfig.state
  }));
}
```

---

### Error: "No WABA ID found in token scopes"

**Causa:** El usuario que autorizó no tiene WhatsApp Business Account

**Solución:**
1. Usuario debe tener cuenta de **Meta Business**
2. Crear un **WhatsApp Business Account (WABA)** en Meta Business
3. Agregar un número de teléfono al WABA
4. Volver a intentar la conexión

---

### Error: "Token inválido o Phone Number ID incorrecto"

**Causa:** El access token no tiene permisos suficientes

**Solución:**
1. Verificar en Meta Dashboard → App Review
2. Permisos requeridos:
   - `whatsapp_business_management`
   - `whatsapp_business_messaging`
3. En modo Development, estos permisos están auto-aprobados para admins

---

## 📝 Checklist Final

Antes de probar de nuevo, verifica:

### En Meta Developer Dashboard
- [ ] App ID y App Secret configurados
- [ ] WhatsApp agregado como producto
- [ ] Configuration ID creado
- [ ] Webhook URL configurada: `https://www.controldenegocios.com/api/webhooks/whatsapp`
- [ ] Verify Token configurado (igual que `WHATSAPP_WEBHOOK_VERIFY_TOKEN`)
- [ ] OAuth Redirect URLs incluyen todas las variantes
- [ ] App Domains incluye `controldenegocios.com`
- [ ] Permisos `whatsapp_business_management` y `whatsapp_business_messaging`

### En el Código (Backend)
- [ ] Variables de entorno configuradas:
  - `META_APP_ID`
  - `WHATSAPP_APP_SECRET`
  - `WHATSAPP_CONFIG_ID`
  - `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
  - `WHATSAPP_REDIRECT_URI`
- [ ] Código actualizado con redirect_uri dinámico
- [ ] Logging habilitado para debugging

### En el Frontend
- [ ] SDK de Facebook se carga correctamente (`window.FB` existe)
- [ ] Config de Embedded Signup se obtiene del backend
- [ ] Callback envía `code` y `state` al backend
- [ ] Toast notifications muestran errores/éxito

---

## 🎯 Próximos Pasos

1. **Revisar configuración en Meta Dashboard** (10 minutos)
2. **Agregar variables de entorno faltantes** (5 minutos)
3. **Hacer un test desde la UI** (2 minutos)
4. **Revisar logs del backend** para diagnosticar el error exacto

Si sigues teniendo problemas después de esto, comparte:
- ✅ Screenshot de OAuth Redirect URLs en Meta Dashboard
- ✅ Logs del backend cuando intentas conectar
- ✅ Logs de consola del navegador (con `window.FB` y el response de `FB.login`)

---

## 📚 Referencias

- [Meta Embedded Signup Documentation](https://developers.facebook.com/docs/whatsapp/embedded-signup)
- [Facebook Login for Web](https://developers.facebook.com/docs/facebook-login/web)
- [WhatsApp Business Platform API](https://developers.facebook.com/docs/whatsapp/business-platform)
