# 📋 Solicitud de App Review en Meta (Para Activar Embedded Signup)

**Destinatario:** Dueño de la Plataforma Beauty Control  
**Objetivo:** Aprobar la app para que los negocios conecten WhatsApp automáticamente  
**Tiempo estimado:** 20 minutos + espera de aprobación (1-3 días)

---

## 🎯 ¿Por Qué Necesitas Esto?

Actualmente, el **botón "Conectar con Meta Business"** está **deshabilitado** en el frontend porque tu app de Meta necesita aprobación como **Business Solution Provider (BSP)**.

**Después de la aprobación:**
- ✅ Los negocios conectarán WhatsApp en **1 clic** (Embedded Signup)
- ✅ TODO automático: tokens, webhooks, configuración
- ✅ Sin copiar/pegar nada manualmente

---

## 📝 Paso 1: Acceder a tu App de Meta

1. Ve a https://developers.facebook.com/
2. Inicia sesión con tu cuenta de Facebook
3. Clic en **"Mis aplicaciones"** (esquina superior derecha)
4. Selecciona: **"WhatsApp - Beauty Control"** (o el nombre de tu app)
   - App ID: `1928881431390804`

---

## 🔐 Paso 2: Solicitar Permisos de WhatsApp

### 2.1 Navegar a App Review

En el panel izquierdo:
1. Clic en **"App Review"**
2. Clic en **"Permissions and Features"**

### 2.2 Buscar Permiso de WhatsApp

1. En el buscador, escribe: `whatsapp_business_management`
2. Verás la tarjeta: **"whatsapp_business_management"**
3. Clic en **"Request Advanced Access"** (o "Get Advanced Access")

---

## 📄 Paso 3: Completar Formulario de Solicitud

Meta te pedirá información sobre cómo usarás WhatsApp:

### 3.1 Detalles del Negocio

**Business Verification:**
- Si no tienes verificación de negocio, Meta te pedirá documentos:
  - Registro mercantil o certificado de existencia
  - NIT/RUT de la empresa
  - Documento de identidad del representante legal
  - Comprobante de domicilio comercial

**Nota:** Este proceso puede tomar 1-3 días adicionales.

### 3.2 Caso de Uso (Use Case)

**Pregunta:** "¿Cómo usará tu app WhatsApp Business Platform?"

**Respuesta sugerida (en inglés):**

```
Our platform, Beauty Control, is a SaaS solution for beauty salons and spas 
to manage their businesses. We use WhatsApp Business Platform to enable our 
clients to:

1. Send automated appointment reminders to their customers
2. Send appointment confirmations when customers book services
3. Send digital receipts after service completion
4. Send promotional messages about special offers (with customer consent)
5. Receive and respond to customer inquiries

Our clients (beauty salons) will connect their own WhatsApp Business accounts 
through our platform using Embedded Signup. Each salon manages their own 
customer conversations and messaging independently.

We will not send spam. All messages are transactional or marketing messages 
with explicit customer opt-in. We comply with WhatsApp Business Policy and 
messaging guidelines.
```

**Traducción:**

```
Nuestra plataforma, Beauty Control, es una solución SaaS para salones de 
belleza y spas para administrar sus negocios. Usamos WhatsApp Business 
Platform para permitir que nuestros clientes:

1. Envíen recordatorios automáticos de citas a sus clientes
2. Envíen confirmaciones cuando los clientes agendan servicios
3. Envíen recibos digitales después de la prestación del servicio
4. Envíen mensajes promocionales sobre ofertas especiales (con consentimiento)
5. Reciban y respondan consultas de clientes

Nuestros clientes (salones de belleza) conectarán sus propias cuentas de 
WhatsApp Business a través de nuestra plataforma usando Embedded Signup. 
Cada salón administra sus propias conversaciones independientemente.

No enviaremos spam. Todos los mensajes son transaccionales o de marketing 
con opt-in explícito. Cumplimos con WhatsApp Business Policy.
```

### 3.3 Explicación Técnica

**Pregunta:** "¿Cómo funciona técnicamente tu integración?"

**Respuesta sugerida:**

```
Technical Implementation:

1. Embedded Signup Flow:
   - Clients click "Connect WhatsApp" button in Beauty Control
   - Facebook SDK initiates OAuth flow with config_id
   - Client authorizes WhatsApp Business access
   - Our backend receives webhook callback with access tokens
   - Tokens are encrypted (AES-256-GCM) and stored securely

2. Message Sending:
   - Our platform uses Cloud API to send messages on behalf of clients
   - Each client's messages use their own WhatsApp Business Account tokens
   - Messages are sent through https://graph.facebook.com/v18.0/

3. Webhook Configuration:
   - Webhook URL: https://beautycontrol-api.azurewebsites.net/api/webhooks/whatsapp
   - We receive message_status and messages webhooks
   - All webhooks are verified with secure token

4. Security & Compliance:
   - All access tokens encrypted at rest
   - HTTPS for all API communications
   - Rate limiting implemented
   - Customer data protected per GDPR/CCPA
   - Clients can disconnect WhatsApp anytime

We are a legitimate business solution provider enabling small businesses 
to use WhatsApp professionally.
```

### 3.4 Capturas de Pantalla (Screenshots)

Meta puede pedir capturas mostrando cómo se usa WhatsApp en tu plataforma:

**Screenshot 1: Conexión de WhatsApp**
- Captura: Página "Mi Negocio → Perfil → WhatsApp"
- Muestra: Botón "Conectar con Meta Business"

**Screenshot 2: Envío de Mensajes**
- Captura: Pantalla de envío de recordatorios
- Muestra: Cómo los negocios envían mensajes a clientes

**Screenshot 3: Configuración de Mensajes**
- Captura: Configuración de mensajes automáticos
- Muestra: Opciones de opt-in y personalización

**Screenshot 4: Listado de Mensajes Enviados**
- Captura: Historial de mensajes WhatsApp
- Muestra: Transparencia y trazabilidad

### 3.5 Video Demo (Opcional pero recomendado)

Graba video de 2-3 minutos mostrando:
1. Cómo un negocio conecta WhatsApp (Embedded Signup flow)
2. Cómo se envía un mensaje de recordatorio
3. Cómo se configura opt-in/opt-out

Sube a YouTube (puede ser unlisted) y pega el link.

---

## 🎥 Paso 4: Grabar Video de Verificación (Si lo Piden)

Meta puede solicitar video verificando tu identidad:

**Requisitos del video:**
1. Grabar con celular o webcam
2. Mostrar tu rostro claramente
3. Decir en voz alta:
   - Tu nombre completo
   - Nombre de tu empresa
   - App ID: `1928881431390804`
   - Caso de uso: "Beauty salon management platform with WhatsApp messaging"
4. Mostrar documento de identidad (cédula/pasaporte)
5. Duración: 30-60 segundos máximo

**Formato:** MP4, MOV, o AVI (máx 25MB)

---

## 📧 Paso 5: Información de Contacto

Asegúrate de tener configurado:

**En App Settings → Basic:**
- ✅ **Email de contacto** válido (recibirás notificaciones)
- ✅ **Privacy Policy URL**: Tu política de privacidad
- ✅ **Terms of Service URL**: Términos y condiciones

**Ejemplo URLs:**
- Privacy Policy: `https://www.controldenegocios.com/privacy`
- Terms of Service: `https://www.controldenegocios.com/terms`

**Nota:** Estas páginas DEBEN existir. Si no las tienes, créalas (puedo ayudarte con templates).

---

## ⏳ Paso 6: Enviar y Esperar

1. Revisa toda la información
2. Clic en **"Submit for Review"** o **"Enviar para revisión"**
3. Recibirás confirmación por email

**Tiempos de espera:**
- ✅ **Business Verification:** 1-3 días hábiles
- ✅ **App Review:** 1-3 días hábiles adicionales
- 🎯 **Total:** ~3-7 días hábiles

**Durante la espera:**
- Revisa tu email diariamente (Meta puede pedir información adicional)
- Si piden más info, responde rápido (en menos de 24 hrs)

---

## ✅ Paso 7: Después de la Aprobación

Una vez aprobado:

1. Recibirás email: **"Your access to whatsapp_business_management has been approved"**
2. El permiso aparecerá como **"Approved"** en App Review
3. **Verifica que esté activo:**
   - App Review → Permissions and Features
   - `whatsapp_business_management` → **Status: Approved** ✅

4. **Actualiza variables de entorno en Azure:**
   - Confirma que `META_APP_ID` y `WHATSAPP_CONFIG_ID` estén correctos
   - No necesitas cambiar nada más

5. **El botón se activará automáticamente** en el frontend para todos los negocios

---

## 🆘 Problemas Comunes

### "App Review rechazada"

**Causas comunes:**
- Caso de uso no claro
- Sin business verification
- Screenshots no muestran funcionalidad real
- Privacy Policy no accesible

**Solución:**
- Lee el motivo del rechazo en el email
- Corrige lo solicitado
- Vuelve a enviar

### "Solicitan más información"

**Responde en menos de 24 horas** con:
- Explicación más detallada del caso de uso
- Screenshots adicionales
- Video demo si lo piden
- Documentos de la empresa

### "Verificación de negocio pendiente"

**Solución:**
- Completa Business Verification en Meta Business Suite
- Sube documentos solicitados (RUT, cámara de comercio, etc.)
- Espera aprobación (1-3 días)

---

## 📋 Checklist Final

Antes de enviar, verifica:

```
□ Solicitud completada: whatsapp_business_management
□ Caso de uso explicado claramente (en inglés)
□ Screenshots subidos (mínimo 2-3)
□ Video demo (opcional pero recomendado)
□ Email de contacto válido en App Settings
□ Privacy Policy URL funcionando
□ Terms of Service URL funcionando
□ Business Verification completada (si aplica)
```

---

## 📞 Soporte

**Soporte Meta for Developers:**
- 🌐 https://developers.facebook.com/support/
- 📧 A través del formulario en tu Developer Dashboard

**Documentación:**
- Embedded Signup: https://developers.facebook.com/docs/whatsapp/embedded-signup
- Business Verification: https://www.facebook.com/business/help/

**Comunidad:**
- WhatsApp Business API Discussion: https://developers.facebook.com/community/

---

## 🎯 Después de la Aprobación

Comunica a tus usuarios (negocios):

1. **Publica anuncio** en Beauty Control:
   ```
   🎉 ¡WhatsApp ya disponible!
   
   Ahora puedes conectar WhatsApp en 1 clic desde:
   Mi Negocio → Perfil → WhatsApp
   
   Solo necesitas:
   - Cuenta de Facebook
   - Número de WhatsApp Business
   - Método de pago en Meta (primeros 1000 mensajes gratis)
   ```

2. **Envía email** a todos los negocios registrados

3. **Actualiza documentación** (la guía para negocios ya está lista en `CONECTAR_WHATSAPP_5MIN.md`)

---

## 💡 Tips para Acelerar Aprobación

✅ **Responde rápido** si Meta pide información adicional
✅ **Sé específico** en el caso de uso (no seas vago)
✅ **Muestra funcionalidad real** con screenshots/videos
✅ **Completa business verification** antes de solicitar permisos
✅ **Usa inglés** en las respuestas (Meta es empresa global)
✅ **Política de privacidad completa** (menciona WhatsApp específicamente)

---

**Última actualización:** Enero 2026  
**Versión:** 1.0  
**Estado actual:** Embedded Signup implementado, pendiente aprobación Meta
