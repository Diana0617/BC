# 🚀 QUICK START - WhatsApp Configuration

## ¿QUÉ FALTA CONFIGURAR?

Basado en tu implementación actual, estos son los pasos que necesitas completar:

---

## 1️⃣ VERIFICAR WEBHOOK EN META (CRÍTICO)

### Ve a Meta Developer Console:
🔗 https://developers.facebook.com/apps/1928881431390804/whatsapp-business/wa-settings/

### Configuración del Webhook:
```
✅ Callback URL: https://beautycontrol-api.azurewebsites.net/api/webhooks/whatsapp
✅ Verify Token: beauty_control_webhook_verify_2024
```

### Campos a suscribir (ambos obligatorios):
- ✅ `messages` - Para recibir mensajes entrantes
- ✅ `message_status` - Para recibir estados de mensajes enviados

### Verificar manualmente:
Abre en tu navegador:
```
https://beautycontrol-api.azurewebsites.net/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=beauty_control_webhook_verify_2024&hub.challenge=test123
```

**Debe mostrar**: `test123`

Si no funciona, el problema está en:
- [ ] Servidor backend no está corriendo
- [ ] Ruta no está registrada
- [ ] Variable de entorno incorrecta

---

## 2️⃣ OBTENER Y CONFIGURAR TOKEN DE ACCESO

### Paso A: Obtener Token de Meta

1. Ve a: https://developers.facebook.com/apps/1928881431390804/whatsapp-business/wa-getting-started/
2. Busca la sección **"Temporary access token"**
3. Copia el token (válido por 24 horas)
4. También copia el **"Phone number ID"** (lo encuentras debajo del número de teléfono)

### Paso B: Almacenar Token en Beauty Control

Necesitas hacer un POST a tu API. Opciones:

#### Opción 1: Con Postman/Insomnia
```http
POST https://beautycontrol-api.azurewebsites.net/api/admin/whatsapp/businesses/{BUSINESS_ID}/tokens
Authorization: Bearer {TU_JWT_TOKEN}
Content-Type: application/json

{
  "accessToken": "EAAb...",  // Token copiado de Meta
  "phoneNumberId": "123456789",  // Phone Number ID de Meta
  "phoneNumber": "+573001234567",  // Tu número de WhatsApp
  "metadata": {
    "displayName": "Beauty Control",
    "qualityRating": "GREEN"
  }
}
```

#### Opción 2: Con curl
```bash
curl -X POST "https://beautycontrol-api.azurewebsites.net/api/admin/whatsapp/businesses/{BUSINESS_ID}/tokens" \
  -H "Authorization: Bearer {TU_JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "EAAb...",
    "phoneNumberId": "123456789",
    "phoneNumber": "+573001234567",
    "metadata": {
      "displayName": "Beauty Control"
    }
  }'
```

### ¿Dónde obtengo BUSINESS_ID y JWT_TOKEN?

**BUSINESS_ID**: Es el UUID de tu negocio en la tabla `businesses`
```sql
SELECT id, name FROM businesses LIMIT 1;
```

**JWT_TOKEN**: 
1. Inicia sesión en tu app web
2. Abre DevTools > Application > Local Storage
3. Busca el token JWT guardado
4. O haz login via API:
```http
POST https://beautycontrol-api.azurewebsites.net/api/auth/login
Content-Type: application/json

{
  "email": "tu@email.com",
  "password": "tu_password"
}
```

---

## 3️⃣ AGREGAR NÚMEROS DE PRUEBA (Solo si app está en Development)

### En Meta Developer Console:
1. Ve a: WhatsApp > Getting Started
2. Scroll hasta **"Send and receive messages"**
3. Click en **"Add phone number"**
4. Agrega números de teléfono de prueba (max 5 en desarrollo)

**IMPORTANTE**: En modo desarrollo, SOLO puedes enviar mensajes a estos números

---

## 4️⃣ PROBAR EL ENVÍO DE MENSAJES

### Opción A: Desde la web app
(Si tienes UI implementada)

### Opción B: Directo desde backend
```javascript
// En node o script de prueba
const whatsappService = require('./packages/backend/src/services/WhatsAppService');

// Enviar mensaje simple
await whatsappService.sendTextMessage(
  'business-id-aqui',
  '+573001234567',  // Debe estar en lista de prueba
  'Hola desde Beauty Control! 🎉'
);
```

### Opción C: Endpoint directo (si existe)
```http
POST /api/whatsapp/send
{
  "businessId": "...",
  "recipientPhone": "+573001234567",
  "message": "Hola!"
}
```

---

## 5️⃣ VERIFICAR QUE TODO FUNCIONA

### ✅ Checklist de Verificación:

1. **Webhook verificado en Meta**
   ```bash
   curl "https://beautycontrol-api.azurewebsites.net/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=beauty_control_webhook_verify_2024&hub.challenge=test"
   # Debe responder: test
   ```

2. **Token almacenado**
   ```http
   GET /api/admin/whatsapp/businesses/{businessId}/tokens
   Authorization: Bearer {JWT}
   
   # Debe responder: { hasToken: true, isActive: true }
   ```

3. **Conexión funciona**
   ```http
   POST /api/admin/whatsapp/businesses/{businessId}/test-connection
   Authorization: Bearer {JWT}
   
   # Debe responder con info del número de WhatsApp
   ```

4. **Mensaje enviado**
   ```http
   # Envía un mensaje de prueba
   # Verifica en tu teléfono que llegó
   ```

5. **Webhook recibe eventos**
   ```sql
   -- Ver últimos eventos recibidos
   SELECT * FROM whatsapp_webhook_events 
   ORDER BY received_at DESC LIMIT 5;
   ```

---

## ⚠️ PROBLEMAS COMUNES

### "No matching user found"
- **Causa**: El número no está en la lista de prueba
- **Solución**: Agrega el número en Meta > WhatsApp > Getting Started

### "Invalid OAuth access token"
- **Causa**: Token expirado (24 horas)
- **Solución**: Genera nuevo token y actualízalo:
  ```http
  POST /api/admin/whatsapp/businesses/{businessId}/tokens/rotate
  { "newAccessToken": "nuevo_token..." }
  ```

### Webhook no se verifica
- **Causa**: URL no accesible o verify token incorrecto
- **Solución**: Verifica que el servidor esté corriendo en Azure y la URL sea accesible

### No llegan mensajes
- **Causa**: Campos del webhook no están suscritos
- **Solución**: Ve a Meta > WhatsApp > Configuration > Webhook fields y activa `messages` y `message_status`

---

## 🎯 PRÓXIMO PASO INMEDIATO

**AHORA MISMO, haz esto:**

1. Abre: https://developers.facebook.com/apps/1928881431390804/whatsapp-business/wa-settings/
2. Verifica que el webhook esté configurado con:
   - URL: `https://beautycontrol-api.azurewebsites.net/api/webhooks/whatsapp`
   - Token: `beauty_control_webhook_verify_2024`
3. Click en "Verify and save"
4. Si falla, avísame el error exacto que muestra

---

## 📞 ¿NECESITAS AYUDA?

Dime cuál de estos escenarios aplica:

**A)** ✅ El webhook se verificó correctamente → Pasamos al paso 2 (configurar token)
**B)** ❌ El webhook no se verifica → Necesitamos debuggear la URL/servidor
**C)** ⚠️  Ya tengo token configurado pero no envía mensajes → Verificamos configuración de Meta
**D)** 🤔 No sé cómo hacer login para obtener JWT → Te ayudo con el flujo de auth

**Dime qué opción aplica y continuamos desde ahí!** 🚀
