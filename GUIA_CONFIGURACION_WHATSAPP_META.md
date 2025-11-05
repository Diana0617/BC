# 🚀 Guía Completa: Configuración WhatsApp Business Platform

## Guía Paso a Paso para Gestionar Credenciales de Meta y Alta de Negocios

**Versión:** 1.0  
**Fecha:** 5 de Noviembre de 2025  
**Proyecto:** Beauty Control - WhatsApp Business Platform Migration

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#1-requisitos-previos)
2. [Configuración Inicial de Meta](#2-configuración-inicial-de-meta)
3. [Obtener Credenciales de la Aplicación Meta](#3-obtener-credenciales-de-la-aplicación-meta)
4. [Configuración del Sistema Beauty Control](#4-configuración-del-sistema-beauty-control)
5. [Dar de Alta un Negocio Nuevo](#5-dar-de-alta-un-negocio-nuevo)
6. [Checklist por Negocio](#6-checklist-por-negocio)
7. [Troubleshooting](#7-troubleshooting)
8. [Anexos](#8-anexos)

---

## 1. Requisitos Previos

### 1.1 Cuentas Necesarias

- [ ] **Cuenta Meta for Developers**
  - URL: https://developers.facebook.com/
  - Requiere: Cuenta de Facebook personal verificada
  - Verificación: Autenticación de dos factores (2FA) activada

- [ ] **Cuenta Meta Business Manager** (opcional pero recomendado)
  - URL: https://business.facebook.com/
  - Beneficios: Gestión centralizada de múltiples negocios

### 1.2 Permisos Requeridos

| Rol | Permisos Necesarios | Quién lo Necesita |
|-----|-------------------|------------------|
| **Administrador** | Admin de la App Meta | Desarrollador Backend |
| **Negocio** | Dueño/Admin de WhatsApp Business Account | Cliente Final |
| **Sistema** | API de WhatsApp Business Platform | Servidor Beauty Control |

### 1.3 Información que Debes Tener Lista

- Dominio verificado del servidor (ej: `api.beautycontrol.com`)
- Certificado SSL válido (HTTPS obligatorio para webhooks)
- URL pública del webhook (ej: `https://api.beautycontrol.com/api/webhooks/whatsapp`)

---

## 2. Configuración Inicial de Meta

### 2.1 Crear Aplicación en Meta for Developers

#### Paso 1: Acceder al Panel de Desarrolladores

```
1. Ve a: https://developers.facebook.com/apps
2. Haz clic en "Crear app" (botón verde superior derecho)
```

#### Paso 2: Seleccionar Tipo de Aplicación

```
1. Tipo: "Empresa" (Business)
2. Haz clic en "Siguiente"
```

![Selección de tipo de app](docs/images/meta-app-type.png)

#### Paso 3: Configuración Básica

```
Nombre de la app: Beauty Control WhatsApp
Email de contacto: [tu-email@beautycontrol.com]
Cuenta de empresa: [Selecciona o crea una]

✅ Haz clic en "Crear app"
```

#### Paso 4: Agregar Producto WhatsApp

```
1. En el panel izquierdo, busca "WhatsApp"
2. Haz clic en "Configurar" junto a WhatsApp
3. Selecciona "API" (NO Business Manager)
```

### 2.2 Configurar Webhooks en Meta

#### Paso 1: Acceder a Configuración de Webhooks

```
1. Panel izquierdo: WhatsApp > Configuración
2. Sección: Webhooks
3. Haz clic en "Configurar webhooks"
```

#### Paso 2: Ingresar URL del Webhook

```
URL de devolución de llamada:
https://api.beautycontrol.com/api/webhooks/whatsapp

Token de verificación:
beauty_control_verify_token
(debe coincidir con WHATSAPP_WEBHOOK_VERIFY_TOKEN en .env)

✅ Haz clic en "Verificar y guardar"
```

**⚠️ IMPORTANTE:** El servidor **DEBE** estar ejecutándose y respondiendo al GET de verificación antes de hacer clic en "Verificar y guardar".

#### Paso 3: Suscribirse a Eventos

Selecciona los siguientes campos de webhook:

- [x] **messages** - Mensajes entrantes
- [x] **message_status** - Estados de entrega (sent, delivered, read)
- [ ] message_template_status_update - Opcional (para templates)
- [ ] account_alerts - Opcional (alertas de cuenta)

```
✅ Haz clic en "Guardar"
```

### 2.3 Configuración de Números de Prueba (Sandbox)

#### Paso 1: Obtener Número de Prueba

```
1. WhatsApp > Primeros pasos
2. Sección: "Números de teléfono de prueba"
3. Copia el número de prueba proporcionado por Meta
   Ejemplo: +1 555 0100 (ficticio)
```

#### Paso 2: Agregar Números Receptores

```
1. En la misma sección, haz clic en "Administrar números de teléfono"
2. Haz clic en "Agregar número de teléfono"
3. Ingresa tu número personal con código de país
   Ejemplo: +57 300 123 4567
4. Recibirás un mensaje de WhatsApp con código de verificación
5. Ingresa el código
✅ Número agregado para testing
```

**Límite:** Máximo 5 números de prueba en sandbox.

---

## 3. Obtener Credenciales de la Aplicación Meta

### 3.1 App ID y App Secret

#### Ubicación

```
1. Panel izquierdo: Configuración > Básica
2. Busca los siguientes campos:
```

| Credencial | Ejemplo | Dónde se Usa |
|-----------|---------|--------------|
| **App ID** | `123456789012345` | Identificación de la app |
| **App Secret** | `abc123...` (Haz clic en "Mostrar") | Validación de webhooks (WHATSAPP_APP_SECRET) |

**⚠️ SEGURIDAD:** NUNCA commitees el App Secret a Git.

#### Copiar Credenciales

```bash
# Ejemplo de cómo guardar temporalmente (seguro):
App ID: 123456789012345
App Secret: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# Guardar en gestor de contraseñas:
- 1Password
- LastPass
- Azure Key Vault
```

### 3.2 Access Token de Sistema (System User Token)

#### ¿Por Qué se Necesita?

Los Access Tokens de usuario expiran. Un **System User Token** es permanente y no depende de la sesión de un usuario.

#### Paso 1: Crear Usuario de Sistema

```
1. Ve a: https://business.facebook.com/settings/system-users
   (Requiere Meta Business Manager)
2. Haz clic en "Agregar" (botón azul)
3. Nombre: "Beauty Control Backend System"
4. Rol: Administrador
✅ Crear
```

#### Paso 2: Generar Token

```
1. Haz clic en el usuario recién creado
2. Haz clic en "Generar nuevo token"
3. Selecciona la app: "Beauty Control WhatsApp"
4. Selecciona permisos:
   - [x] whatsapp_business_management
   - [x] whatsapp_business_messaging
5. Duración: Nunca expira (Never Expires)
✅ Generar token
```

**⚠️ COPIA EL TOKEN AHORA:** Solo se muestra una vez.

```
Ejemplo de token generado:
EAABsbCS1iHgBO...ZD (muy largo, ~200 caracteres)
```

#### Paso 3: Guardar Token Encriptado

**NO** guardes este token directamente en `.env`. Se almacenará **encriptado** en la base de datos por negocio.

---

## 4. Configuración del Sistema Beauty Control

### 4.1 Variables de Entorno del Servidor

#### Archivo: `packages/backend/.env`

```env
# ============================================
# WHATSAPP BUSINESS PLATFORM - CONFIGURACIÓN
# ============================================

# Clave de encriptación (32 bytes en hexadecimal)
# Generar con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
WHATSAPP_ENCRYPTION_KEY=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2

# Feature Flag - Activar nuevo sistema de tokens
# false = usa configuración legacy (business.settings)
# true = usa WhatsAppTokenManager con tokens encriptados
WHATSAPP_USE_NEW_TOKEN_SYSTEM=false

# Token de verificación del webhook (debe coincidir con Meta)
WHATSAPP_WEBHOOK_VERIFY_TOKEN=beauty_control_verify_token

# App Secret de la aplicación Meta (para validar firma de webhooks)
WHATSAPP_APP_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# ============================================
# CONFIGURACIÓN LEGACY (mantener por compatibilidad)
# ============================================
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_waba_id_here
WHATSAPP_ACCESS_TOKEN=your_legacy_token_here
```

### 4.2 Generar Clave de Encriptación

```bash
# Ejecutar en terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Salida ejemplo:
# f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3

# Copiar y pegar en .env como WHATSAPP_ENCRYPTION_KEY
```

**⚠️ IMPORTANTE:** 
- Guarda esta clave en un gestor de secretos (Azure Key Vault, AWS Secrets Manager)
- Si pierdes esta clave, NO podrás desencriptar los tokens almacenados

### 4.3 Ejecutar Migraciones de Base de Datos

```bash
cd packages/backend

# Verificar migraciones pendientes
npx sequelize-cli db:migrate:status

# Ejecutar migraciones
npx sequelize-cli db:migrate

# Salida esperada:
# == 20251105000001-add-whatsapp-platform-fields-to-businesses: migrating =======
# == 20251105000001-add-whatsapp-platform-fields-to-businesses: migrated (0.123s)
# == 20251105000002-create-whatsapp-message-templates: migrating =======
# == 20251105000002-create-whatsapp-message-templates: migrated (0.098s)
# ... (6 migraciones en total)
```

### 4.4 Iniciar Servidor y Verificar Webhook

```bash
# Iniciar servidor
npm run dev

# En otra terminal, verificar que el webhook responde:
curl "http://localhost:5000/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=beauty_control_verify_token&hub.challenge=test123"

# Salida esperada:
# test123
```

**✅ Si ves "test123", el webhook está configurado correctamente.**

---

## 5. Dar de Alta un Negocio Nuevo

### 5.1 Información a Solicitar al Cliente

#### Checklist de Información Requerida

```
DATOS DEL NEGOCIO
─────────────────────────────────────────────
□ Nombre del negocio: _______________________________
□ RUT/NIT/CUIT: _____________________________________
□ Email de contacto: ________________________________
□ Sitio web (opcional): _____________________________

WHATSAPP BUSINESS
─────────────────────────────────────────────
□ Número de WhatsApp Business: +__ _________________
  (Debe ser un número verificado en WhatsApp Business)
  
□ ¿Ya tiene WhatsApp Business API activo? 
  ○ Sí (pasar a 5.2B - Migración)
  ○ No (pasar a 5.2A - Alta Nueva)

RESPONSABLE TÉCNICO
─────────────────────────────────────────────
□ Nombre: ___________________________________________
□ Email: ____________________________________________
□ Teléfono: _________________________________________
□ ¿Tiene acceso a Meta Business Manager? ○ Sí ○ No
```

### 5.2A Proceso de Alta - Negocio Nuevo (Sin API Activa)

#### Opción Recomendada: Embedded Signup

El **Embedded Signup** permite que el cliente se conecte a tu aplicación sin necesidad de configuración manual.

##### Paso 1: Implementar Botón de Conexión (Ya implementado en el código)

```javascript
// El cliente verá un botón en el panel de Beauty Control:
"Conectar WhatsApp Business"

// Al hacer clic, se abre ventana de Meta con flujo guiado
```

##### Paso 2: Cliente Completa el Flujo

```
1. Cliente hace clic en "Conectar WhatsApp Business"
2. Se abre ventana de Meta
3. Cliente inicia sesión con su cuenta de Facebook
4. Cliente selecciona o crea WhatsApp Business Account
5. Cliente selecciona el número de teléfono a usar
6. Cliente acepta permisos
7. Meta redirige de vuelta a Beauty Control con código de autorización
8. Beauty Control intercambia código por access token
9. Token se almacena encriptado en DB automáticamente
✅ Conexión completada
```

##### Paso 3: Verificar Alta en Sistema

```bash
# Conectar a base de datos (psql, pgAdmin, etc.)
SELECT 
  id,
  name,
  whatsapp_enabled,
  whatsapp_phone_number,
  whatsapp_phone_number_id
FROM businesses
WHERE id = 'uuid-del-negocio';

# Verificar token encriptado
SELECT 
  business_id,
  token_type,
  is_active,
  expires_at,
  created_at
FROM whatsapp_tokens
WHERE business_id = 'uuid-del-negocio';
```

**✅ Si ambas queries retornan datos, el alta fue exitosa.**

### 5.2B Proceso de Alta - Negocio Existente (Migración desde API Actual)

Si el cliente **ya tiene** WhatsApp Business API activo en otro sistema.

#### Paso 1: Obtener Credenciales Actuales del Cliente

Solicitar al cliente:

```
1. Access Token actual
2. Phone Number ID
3. WhatsApp Business Account ID (WABA ID)
4. Verificar que el token tiene permisos:
   - whatsapp_business_messaging
   - whatsapp_business_management
```

#### Paso 2: Migrar Token al Sistema Beauty Control

**Opción A: Mediante Script Manual**

```javascript
// packages/backend/scripts/migrate-business-whatsapp.js
const whatsappTokenManager = require('../src/services/WhatsAppTokenManager');
const { Business } = require('../src/models');

async function migrateBusiness(businessId, accessToken, phoneNumberId, wabaId) {
  try {
    // 1. Actualizar business
    const business = await Business.findByPk(businessId);
    await business.update({
      whatsapp_enabled: true,
      whatsapp_phone_number: '+57300123456', // Obtener del cliente
      whatsapp_phone_number_id: phoneNumberId,
      whatsapp_platform_metadata: {
        wabaId: wabaId,
        migratedAt: new Date(),
        migratedFrom: 'manual'
      }
    });

    // 2. Almacenar token encriptado
    await whatsappTokenManager.storeToken(businessId, accessToken, {
      metadata: {
        wabaId: wabaId,
        permissions: ['whatsapp_business_messaging', 'whatsapp_business_management']
      }
    });

    console.log('✅ Negocio migrado exitosamente');
  } catch (error) {
    console.error('❌ Error migrando negocio:', error);
  }
}

// Ejecutar:
// migrateBusiness('uuid-del-negocio', 'EAABsbCS1iHg...', '123456789', '987654321');
```

**Opción B: Mediante Endpoint de Admin (Recomendado)**

```bash
# POST /api/admin/whatsapp/businesses/:businessId/migrate-token
curl -X POST http://localhost:5000/api/admin/whatsapp/businesses/uuid-del-negocio/migrate-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin-token-here" \
  -d '{
    "accessToken": "EAABsbCS1iHg...",
    "phoneNumberId": "123456789",
    "wabaId": "987654321",
    "phoneNumber": "+573001234567"
  }'

# Respuesta esperada:
# {
#   "success": true,
#   "message": "Token migrated successfully",
#   "businessId": "uuid-del-negocio",
#   "usingNewSystem": true
# }
```

#### Paso 3: Probar Conexión

```bash
# POST /api/admin/whatsapp/businesses/:businessId/test-connection
curl -X POST http://localhost:5000/api/admin/whatsapp/businesses/uuid-del-negocio/test-connection \
  -H "Authorization: Bearer admin-token-here"

# Respuesta esperada:
# {
#   "success": true,
#   "usingNewSystem": true,
#   "phoneNumberId": "123456789",
#   "businessName": "Salón de Belleza XYZ"
# }
```

### 5.3 Configuración de Templates de Mensajes

#### ¿Qué son los Templates?

WhatsApp **requiere** que los mensajes salientes iniciados por el negocio usen **plantillas pre-aprobadas** por Meta.

#### Paso 1: Crear Template en Meta

```
1. Ve a: https://business.facebook.com/wa/manage/message-templates/
2. Selecciona tu WABA (WhatsApp Business Account)
3. Haz clic en "Crear plantilla"
```

#### Paso 2: Configurar Template para Recordatorio de Cita

```
Nombre de plantilla: appointment_reminder_v1
Categoría: UTILITY (Utilidad)
Idioma: Spanish (Español)

Encabezado: 
  [Tipo: Texto]
  "Recordatorio de Cita - {{1}}"

Cuerpo:
  Hola {{1}}, 
  
  Te recordamos tu cita para {{2}} el {{3}} a las {{4}}.
  
  📍 Ubicación: {{5}}
  
  Si necesitas reprogramar, por favor contáctanos.

Pie de página:
  {{1}} - Beauty Control

Botones (opcional):
  [Respuesta rápida] Confirmar
  [Respuesta rápida] Reprogramar

✅ Enviar para revisión
```

**⏱️ Tiempo de aprobación:** 1-24 horas (generalmente 1-2 horas).

#### Paso 3: Agregar Template a Base de Datos

Una vez aprobado:

```sql
-- Insertar template en la DB
INSERT INTO whatsapp_message_templates (
  id,
  business_id,
  template_name,
  template_language,
  template_category,
  status,
  components,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  'uuid-del-negocio',
  'appointment_reminder_v1',
  'es',
  'UTILITY',
  'APPROVED',
  '{
    "header": {"type": "TEXT", "text": "Recordatorio de Cita - {{1}}"},
    "body": {"type": "TEXT", "text": "Hola {{1}}, \n\nTe recordamos tu cita para {{2}} el {{3}} a las {{4}}.\n\n📍 Ubicación: {{5}}\n\nSi necesitas reprogramar, por favor contáctanos."},
    "footer": {"type": "TEXT", "text": "{{1}} - Beauty Control"},
    "buttons": [
      {"type": "QUICK_REPLY", "text": "Confirmar"},
      {"type": "QUICK_REPLY", "text": "Reprogramar"}
    ]
  }'::jsonb,
  NOW(),
  NOW()
);
```

---

## 6. Checklist por Negocio

### 📋 Checklist de Alta Completa

Usa esta checklist para **cada negocio** que des de alta:

```
NEGOCIO: _________________________________ FECHA: __________

□ PASO 1: INFORMACIÓN RECOLECTADA
  □ Datos del negocio obtenidos
  □ Número de WhatsApp Business verificado
  □ Responsable técnico identificado
  
□ PASO 2: CONFIGURACIÓN EN META
  □ WhatsApp Business Account (WABA) creado o identificado
  □ Número de teléfono agregado al WABA
  □ Permisos otorgados a la app Beauty Control
  
□ PASO 3: ALTA EN BEAUTY CONTROL
  □ Registro en tabla `businesses` creado/actualizado
  □ Token almacenado encriptado en `whatsapp_tokens`
  □ Campos whatsapp_* populados correctamente
  
□ PASO 4: VERIFICACIÓN
  □ Test de conexión exitoso
  □ Mensaje de prueba enviado
  □ Webhook recibiendo eventos correctamente
  
□ PASO 5: TEMPLATES
  □ Template de recordatorio creado
  □ Template de confirmación creado
  □ Template de cancelación creado
  □ Templates aprobados por Meta
  □ Templates agregados a la DB
  
□ PASO 6: PRUEBAS E2E
  □ Envío de recordatorio de cita funcionando
  □ Envío de confirmación funcionando
  □ Envío de recibo de pago funcionando
  □ Recepción de respuestas del cliente
  □ Actualización de estados (delivered, read)
  
□ PASO 7: DOCUMENTACIÓN
  □ Credenciales guardadas en gestor de secretos
  □ Información del negocio documentada
  □ Responsable notificado
  □ Cliente capacitado en uso básico

✅ ALTA COMPLETADA
Firma: _________________ Fecha: __________
```

---

## 7. Troubleshooting

### Problema 1: Webhook No Verifica

**Síntoma:**
```
Error al configurar webhook en Meta:
"The URL couldn't be validated. Response does not match challenge"
```

**Solución:**

```bash
# 1. Verificar que el servidor está corriendo
curl http://localhost:5000/health

# 2. Verificar que el endpoint responde
curl "http://localhost:5000/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=beauty_control_verify_token&hub.challenge=test123"

# Debe devolver: test123

# 3. Verificar que el token coincide
# En .env:
WHATSAPP_WEBHOOK_VERIFY_TOKEN=beauty_control_verify_token

# En Meta debe ser EXACTAMENTE igual (case-sensitive)

# 4. Verificar que el servidor es accesible públicamente
# Usar ngrok para testing:
ngrok http 5000

# Usar URL de ngrok en Meta:
# https://abc123.ngrok.io/api/webhooks/whatsapp
```

### Problema 2: Token Inválido o Expirado

**Síntoma:**
```
Error al enviar mensaje:
{
  "error": {
    "message": "Invalid OAuth access token",
    "code": 190
  }
}
```

**Solución:**

```javascript
// 1. Verificar token en DB
const token = await whatsappTokenManager.getToken('business-id');
console.log('Token expires at:', token.expiresAt);
console.log('Token is active:', token.isActive);

// 2. Rotar token si está expirado
await whatsappTokenManager.rotateToken('business-id', 'nuevo-token-aqui');

// 3. Verificar permisos del token
// Usar Graph API Explorer:
// https://developers.facebook.com/tools/explorer/
// GET /me/permissions
```

### Problema 3: Mensaje No Se Envía

**Síntoma:**
```
El mensaje se guarda en DB como "QUEUED" pero nunca pasa a "SENT"
```

**Solución:**

```bash
# 1. Verificar logs del servidor
tail -f logs/app.log | grep WhatsApp

# 2. Verificar que el número está en formato E.164
# ✅ Correcto: +573001234567
# ❌ Incorrecto: 300 123 4567

# 3. Verificar que el template existe y está aprobado
SELECT * FROM whatsapp_message_templates 
WHERE business_id = 'uuid' AND status = 'APPROVED';

# 4. Verificar rate limits de Meta
# Límites por tier:
# - Tier 1: 1,000 mensajes/día
# - Tier 2: 10,000 mensajes/día
# - Tier 3: 100,000 mensajes/día
```

### Problema 4: Webhook Recibe Eventos Duplicados

**Síntoma:**
```
El mismo mensaje aparece múltiples veces en whatsapp_webhook_events
```

**Solución:**

```javascript
// Verificar idempotencia en WhatsAppWebhookController.js
// El código ya maneja esto con event.id único

// 1. Verificar que no hay múltiples servidores procesando
ps aux | grep node

// 2. Verificar que Meta no está configurado con múltiples webhooks
// Meta > WhatsApp > Configuración > Webhooks
// Debe haber SOLO UNA URL configurada

// 3. Implementar deduplicación adicional si es necesario
const existingEvent = await WhatsAppWebhookEvent.findOne({
  where: { provider_event_id: entry.id }
});
if (existingEvent) return; // Skip duplicado
```

---

## 8. Anexos

### Anexo A: Glosario de Términos

| Término | Significado |
|---------|------------|
| **WABA** | WhatsApp Business Account - Cuenta empresarial en WhatsApp |
| **Phone Number ID** | ID único del número de teléfono en Meta |
| **Access Token** | Token de autenticación para API de Meta |
| **Template** | Plantilla pre-aprobada para mensajes salientes |
| **Webhook** | Endpoint que recibe notificaciones de Meta |
| **Embedded Signup** | Flujo de conexión guiado por Meta |
| **System User** | Usuario técnico con token permanente |
| **Graph API** | API de Meta para enviar mensajes |

### Anexo B: Endpoints de API de Meta

```
# Enviar mensaje con template
POST https://graph.facebook.com/v18.0/{phone-number-id}/messages
Authorization: Bearer {access-token}
Content-Type: application/json

{
  "messaging_product": "whatsapp",
  "to": "+573001234567",
  "type": "template",
  "template": {
    "name": "appointment_reminder_v1",
    "language": { "code": "es" },
    "components": [...]
  }
}

# Obtener información del número
GET https://graph.facebook.com/v18.0/{phone-number-id}
Authorization: Bearer {access-token}

# Listar templates
GET https://graph.facebook.com/v18.0/{waba-id}/message_templates
Authorization: Bearer {access-token}
```

### Anexo C: Formato de Números E.164

El formato **E.164** es el estándar internacional para números de teléfono.

```
Formato: +[código país][número sin espacios ni caracteres especiales]

Ejemplos:
✅ +573001234567 (Colombia)
✅ +5491123456789 (Argentina)
✅ +525512345678 (México)
✅ +34612345678 (España)

❌ 300 123 4567 (falta código de país y tiene espacios)
❌ 0300-123-4567 (tiene guiones)
❌ (300) 123-4567 (tiene paréntesis)
```

### Anexo D: Límites y Quotas de WhatsApp Business API

| Concepto | Límite | Notas |
|----------|--------|-------|
| **Mensajes por día (Tier 1)** | 1,000 | Tier inicial para cuentas nuevas |
| **Mensajes por día (Tier 2)** | 10,000 | Después de enviar 1,000 mensajes en 7 días |
| **Mensajes por día (Tier 3)** | 100,000 | Después de enviar 10,000 mensajes en 7 días |
| **Mensajes por segundo** | 80 | Rate limit global |
| **Templates pendientes** | 250 | Por WABA |
| **Números de prueba (sandbox)** | 5 | Números para testing |
| **Ventana de conversación** | 24 horas | Después de último mensaje del cliente |

### Anexo E: Códigos de Estado de Mensajes

| Estado | Descripción | Cuándo Ocurre |
|--------|-------------|---------------|
| `QUEUED` | En cola | Mensaje guardado, pendiente de envío |
| `SENT` | Enviado | Meta recibió el mensaje |
| `DELIVERED` | Entregado | WhatsApp del cliente recibió el mensaje |
| `READ` | Leído | Cliente abrió el mensaje |
| `FAILED` | Fallido | Error en el envío (ver error_code) |

### Anexo F: Plantilla de Email para Cliente

```
Asunto: Activación de WhatsApp Business en Beauty Control

Estimado/a [NOMBRE DEL CLIENTE],

Para activar WhatsApp Business en su cuenta de Beauty Control, necesitamos 
la siguiente información:

DATOS DEL NEGOCIO:
- Nombre comercial: _____________________
- Número de WhatsApp Business: +__ ______________
  (Debe ser un número verificado en WhatsApp Business)
- Email de contacto: _____________________

RESPONSABLE TÉCNICO:
- Nombre: _____________________
- Email: _____________________
- ¿Tiene acceso a Meta Business Manager? Sí / No

PRÓXIMOS PASOS:

1. Si aún no tiene WhatsApp Business API, le enviaremos un enlace para 
   conectarse a través de nuestro sistema (proceso guiado de 5 minutos).

2. Si ya tiene WhatsApp Business API activo, necesitaremos que nos comparta 
   temporalmente sus credenciales para realizar la migración.

3. Una vez conectado, configuraremos las plantillas de mensajes para:
   - Recordatorios de citas
   - Confirmaciones
   - Recibos de pago

¿Tiene alguna pregunta? Estamos disponibles para ayudarle.

Saludos,
Equipo de Beauty Control
soporte@beautycontrol.com
```

---

## 📞 Contacto y Soporte

**Equipo de Desarrollo:**
- Email: dev@beautycontrol.com
- Slack: #whatsapp-platform

**Documentación Técnica:**
- `WHATSAPP_EXECUTIVE_SUMMARY.md`
- `WHATSAPP_IMPLEMENTATION_STATUS.md`
- `FEATURE_BRANCH_README.md`

**Recursos Externos:**
- [Meta for Developers](https://developers.facebook.com/)
- [WhatsApp Business Platform Docs](https://developers.facebook.com/docs/whatsapp/business-platform)
- [Graph API Reference](https://developers.facebook.com/docs/graph-api)

---

## ✅ Checklist Final de Revisión

Antes de considerar un negocio "listo para producción":

- [ ] Credenciales almacenadas de forma segura
- [ ] Token encriptado en base de datos
- [ ] Test de conexión exitoso
- [ ] Al menos 3 templates aprobados
- [ ] Webhook verificado y funcionando
- [ ] Mensaje de prueba enviado y recibido
- [ ] Estados de mensaje actualizándose correctamente
- [ ] Responsable del negocio capacitado
- [ ] Documentación interna actualizada
- [ ] Rollback plan preparado

---

**Versión del documento:** 1.0  
**Última actualización:** 5 de Noviembre de 2025  
**Autor:** Equipo Beauty Control Backend

---

