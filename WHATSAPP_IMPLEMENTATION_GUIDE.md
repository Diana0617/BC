# 📱 Guía Completa de Implementación WhatsApp Business Platform

**Beauty Control - Sistema Multi-Tenant**  
**Fecha:** Diciembre 2025  
**Versión:** 1.0

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Responsabilidades por Rol](#responsabilidades-por-rol)
3. [PARTE 1: Tareas del Desarrollador](#parte-1-tareas-del-desarrollador)
4. [PARTE 2: Configuración del Dueño de Plataforma (BC)](#parte-2-configuración-del-dueño-de-plataforma-bc)
5. [PARTE 3: Guía para cada Negocio](#parte-3-guía-para-cada-negocio)
6. [Testing y Validación](#testing-y-validación)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Resumen Ejecutivo

### ¿Qué es esto?
Sistema de WhatsApp Business Platform integrado en Beauty Control que permite a cada negocio:
- Conectar su WhatsApp Business de forma independiente
- Crear plantillas personalizadas con su branding
- Enviar mensajes automáticos a sus clientes
- Ver historial y métricas de sus mensajes

### Modelo de Implementación
**CENTRALIZADO** - BC crea UNA app en Meta que todos los negocios usan, pero cada uno con su token y configuración independiente.

---

## 👥 Responsabilidades por Rol

```
┌─────────────────────────────────────────────────────────┐
│                    DESARROLLADOR                        │
│  ✅ Completar código faltante                          │
│  ✅ Configurar variables de entorno                    │
│  ✅ Crear migraciones de base de datos                 │
│  ✅ Desplegar a producción                             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              DUEÑO DE PLATAFORMA (BC)                   │
│  ✅ Crear app en Meta (UNA VEZ)                        │
│  ✅ Configurar webhook                                  │
│  ✅ Obtener credenciales                               │
│  ✅ Dar soporte a negocios                             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              NEGOCIO (SPA/SALÓN)                        │
│  ✅ Conectar su WhatsApp Business (self-service)       │
│  ✅ Crear plantillas personalizadas                    │
│  ✅ Configurar mensajes automáticos                    │
│  ✅ Enviar mensajes a clientes                         │
└─────────────────────────────────────────────────────────┘
```

---

# 🔨 PARTE 1: Tareas del Desarrollador

## ✅ Checklist General

- [ ] **1.1** Verificar código backend completo
- [ ] **1.2** Verificar código frontend completo
- [ ] **1.3** Crear migraciones de base de datos
- [ ] **1.4** Configurar variables de entorno (dev)
- [ ] **1.5** Probar localmente
- [ ] **1.6** Configurar variables de entorno (prod)
- [ ] **1.7** Desplegar a producción
- [ ] **1.8** Verificar webhook en producción

---

## 📝 1.1 Verificar Código Backend

### Archivos que deben existir:

```bash
# Modelos
packages/backend/src/models/
├── WhatsAppToken.js          ✅
├── WhatsAppMessage.js         ✅
├── WhatsAppMessageTemplate.js ✅
└── WhatsAppWebhookEvent.js    ✅

# Controladores
packages/backend/src/controllers/
├── WhatsAppAdminController.js     ✅
└── WhatsAppWebhookController.js   ✅

# Servicios
packages/backend/src/services/
├── WhatsAppService.js         ✅
├── WhatsAppTokenManager.js    ✅
└── EncryptionService.js       ✅

# Rutas
packages/backend/src/routes/
├── whatsappAdminRoutes.js     ✅
└── whatsappWebhookRoutes.js   ✅
```

### Verificar que las rutas están registradas en `app.js`:

```javascript
// packages/backend/src/app.js

// Línea ~251
const whatsappAdminRoutes = require('./routes/whatsappAdminRoutes');
const whatsappWebhookRoutes = require('./routes/whatsappWebhookRoutes');

// Línea ~337
app.use('/api/admin/whatsapp', whatsappAdminRoutes);
app.use('/api/webhooks/whatsapp', whatsappWebhookRoutes);
```

### Verificar modelos en `index.js`:

```javascript
// packages/backend/src/models/index.js

// Debe incluir:
const WhatsAppToken = require('./WhatsAppToken');
const WhatsAppMessage = require('./WhatsAppMessage');
const WhatsAppMessageTemplate = require('./WhatsAppMessageTemplate');
const WhatsAppWebhookEvent = require('./WhatsAppWebhookEvent');

// Y definir relaciones:
Business.hasOne(WhatsAppToken, { foreignKey: 'business_id' });
WhatsAppToken.belongsTo(Business, { foreignKey: 'business_id' });

Business.hasMany(WhatsAppMessage, { foreignKey: 'business_id' });
WhatsAppMessage.belongsTo(Business, { foreignKey: 'business_id' });

// etc...
```

---

## 📝 1.2 Verificar Código Frontend

### Archivos que deben existir:

```bash
# Redux Slices
packages/shared/src/store/slices/
├── whatsappTokenSlice.js      ✅
├── whatsappTemplatesSlice.js  ✅
├── whatsappMessagesSlice.js   ✅
└── whatsappWebhookEventsSlice.js ✅

# API
packages/shared/src/api/
└── whatsappApi.js             ✅

# Componentes Web
packages/web-app/src/pages/business/profile/sections/
├── WhatsAppConfigSection.jsx  ✅
└── whatsapp/
    ├── index.js                            ✅
    ├── WhatsAppConnectionTab.jsx           ✅
    ├── WhatsAppTemplatesTab.jsx            ✅
    ├── WhatsAppMessagesTab.jsx             ✅
    ├── WhatsAppWebhooksTab.jsx             ✅
    ├── WhatsAppEmbeddedSignup.jsx          ✅
    ├── WhatsAppTokenManagement.jsx         ✅
    ├── WhatsAppConnectionCard.jsx          ✅
    ├── WhatsAppTemplateEditor.jsx          ✅
    ├── WhatsAppTemplatePreview.jsx         ✅
    ├── WhatsAppTemplatesList.jsx           ✅
    ├── WhatsAppMessagesHistory.jsx         ✅
    ├── WhatsAppWebhookEvents.jsx           ✅
    └── shared/
        ├── index.js                        ✅
        ├── WhatsAppLoadingState.jsx        ✅
        ├── WhatsAppErrorState.jsx          ✅
        ├── WhatsAppEmptyState.jsx          ✅
        ├── MessageStatusBadge.jsx          ✅
        └── TemplateStatusBadge.jsx         ✅
```

### Verificar que está agregado en BusinessProfile:

```javascript
// packages/web-app/src/pages/business/profile/BusinessProfile.jsx

import WhatsAppConfigSection from './sections/WhatsAppConfigSection'

// En el array de sections:
{
  id: 'whatsapp',
  label: 'WhatsApp',
  icon: ChatBubbleLeftRightIcon,
  component: WhatsAppConfigSection,
  badge: whatsappBadge
}
```

---

## 📝 1.3 Crear Migraciones de Base de Datos

### Crear archivo de migración:

```bash
cd packages/backend
touch src/migrations/20251209000001-create-whatsapp-tables.js
```

### Contenido de la migración:

```javascript
// packages/backend/src/migrations/20251209000001-create-whatsapp-tables.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Tabla whatsapp_tokens
    await queryInterface.createTable('whatsapp_tokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      business_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      encrypted_token: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      token_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'USER_ACCESS_TOKEN'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      last_rotated_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Índices para whatsapp_tokens
    await queryInterface.addIndex('whatsapp_tokens', ['business_id'], { unique: true });
    await queryInterface.addIndex('whatsapp_tokens', ['is_active']);
    await queryInterface.addIndex('whatsapp_tokens', ['expires_at']);

    // 2. Tabla whatsapp_message_templates
    await queryInterface.createTable('whatsapp_message_templates', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      business_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      template_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Template name (lowercase, underscores only)'
      },
      language: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'es',
        comment: 'Language code (es, en, pt_BR, etc.)'
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'TRANSACTIONAL',
        comment: 'Template category'
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Template body text'
      },
      header: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Optional header text'
      },
      footer: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Optional footer text'
      },
      buttons: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Optional buttons configuration'
      },
      status: {
        type: Sequelize.STRING(20),
        defaultValue: 'PENDING',
        allowNull: false,
        comment: 'Template approval status'
      },
      meta_template_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Template ID assigned by Meta after submission'
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Reason for rejection if status is REJECTED'
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When template was approved by Meta'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Índices para whatsapp_message_templates
    await queryInterface.addIndex('whatsapp_message_templates', ['business_id']);
    await queryInterface.addIndex('whatsapp_message_templates', ['status']);
    await queryInterface.addIndex('whatsapp_message_templates', ['business_id', 'template_name'], { unique: true });

    // 3. Tabla whatsapp_messages
    await queryInterface.createTable('whatsapp_messages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      business_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      client_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'clients',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      appointment_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'appointments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      to: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'Recipient phone number'
      },
      phone_number_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'WhatsApp phone number ID'
      },
      message_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Type of message (template, text, etc.)'
      },
      payload: {
        type: Sequelize.JSONB,
        allowNull: false,
        comment: 'Message payload sent to Meta'
      },
      provider_message_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Message ID from Meta'
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'QUEUED',
        comment: 'Message status (QUEUED, SENT, DELIVERED, READ, FAILED)'
      },
      error_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Error code if failed'
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Error message if failed'
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      delivered_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      read_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Índices para whatsapp_messages
    await queryInterface.addIndex('whatsapp_messages', ['business_id']);
    await queryInterface.addIndex('whatsapp_messages', ['client_id']);
    await queryInterface.addIndex('whatsapp_messages', ['appointment_id']);
    await queryInterface.addIndex('whatsapp_messages', ['provider_message_id']);
    await queryInterface.addIndex('whatsapp_messages', ['status']);
    await queryInterface.addIndex('whatsapp_messages', ['created_at']);

    // 4. Tabla whatsapp_webhook_events
    await queryInterface.createTable('whatsapp_webhook_events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      business_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      event_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Type of webhook event'
      },
      phone_number_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Phone number ID from webhook'
      },
      message_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Message ID if event is message-related'
      },
      payload: {
        type: Sequelize.JSONB,
        allowNull: false,
        comment: 'Full webhook payload from Meta'
      },
      processed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'Whether event has been processed successfully'
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When event was processed'
      },
      processing_error: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Error message if processing failed'
      },
      received_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'When webhook was received'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Índices para whatsapp_webhook_events
    await queryInterface.addIndex('whatsapp_webhook_events', ['business_id']);
    await queryInterface.addIndex('whatsapp_webhook_events', ['event_type']);
    await queryInterface.addIndex('whatsapp_webhook_events', ['processed']);
    await queryInterface.addIndex('whatsapp_webhook_events', ['message_id']);
    await queryInterface.addIndex('whatsapp_webhook_events', ['received_at']);

    // 5. Agregar columnas a tabla businesses (si no existen)
    const tableInfo = await queryInterface.describeTable('businesses');
    
    if (!tableInfo.whatsapp_phone_number_id) {
      await queryInterface.addColumn('businesses', 'whatsapp_phone_number_id', {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'WhatsApp Business Phone Number ID'
      });
    }

    if (!tableInfo.whatsapp_enabled) {
      await queryInterface.addColumn('businesses', 'whatsapp_enabled', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether WhatsApp is enabled for this business'
      });
    }

    console.log('✅ WhatsApp tables created successfully');
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order (respecting foreign keys)
    await queryInterface.dropTable('whatsapp_webhook_events');
    await queryInterface.dropTable('whatsapp_messages');
    await queryInterface.dropTable('whatsapp_message_templates');
    await queryInterface.dropTable('whatsapp_tokens');

    // Remove columns from businesses table
    await queryInterface.removeColumn('businesses', 'whatsapp_phone_number_id');
    await queryInterface.removeColumn('businesses', 'whatsapp_enabled');

    console.log('✅ WhatsApp tables dropped successfully');
  }
};
```

### Ejecutar migración:

```bash
cd packages/backend

# Desarrollo
npx sequelize-cli db:migrate

# Producción (cuando esté listo)
NODE_ENV=production npx sequelize-cli db:migrate
```

---

## 📝 1.4 Variables de Entorno (Desarrollo)

### Backend - `.env`:

```env
# ==================== WHATSAPP BUSINESS PLATFORM ====================

# Feature flag - activar nuevo sistema
WHATSAPP_USE_NEW_TOKEN_SYSTEM=true

# Credenciales de la App de Meta (obtenidas en Parte 2)
WHATSAPP_APP_ID=
WHATSAPP_APP_SECRET=
WHATSAPP_CONFIG_ID=

# Webhook verification token (debe coincidir con Meta)
WHATSAPP_WEBHOOK_VERIFY_TOKEN=beauty_control_webhook_verify_2024

# Encryption key para tokens (32 caracteres - GENERALA!)
ENCRYPTION_KEY=

# ====================================================================
```

### Generar ENCRYPTION_KEY:

```bash
# Opción 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Opción 2: OpenSSL
openssl rand -base64 32

# Ejemplo de resultado:
# 8vK2mN9pQ3rT5uY7wX1zA4bC6dE0fG2h
```

### Frontend - `.env`:

```env
# WhatsApp App ID (público)
VITE_WHATSAPP_APP_ID=

# API URL
VITE_API_URL=http://localhost:3001
```

---

## 📝 1.5 Prueba Local

### Paso 1: Iniciar Backend

```bash
cd packages/backend
npm install
npm start

# Debe mostrar:
# ✅ Servidor corriendo en puerto 3001
# ✅ Base de datos conectada
```

### Paso 2: Iniciar Frontend

```bash
cd packages/web-app
npm install
npm run dev

# Debe mostrar:
# ✅ Vite corriendo en http://localhost:3000
```

### Paso 3: Verificar Endpoint de Webhook

```bash
# Test del endpoint de verificación
curl "http://localhost:3001/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=beauty_control_webhook_verify_2024&hub.challenge=test123"

# Debe retornar: test123
```

### Paso 4: Verificar UI

1. Abrir http://localhost:3000
2. Login como Business
3. Ir a Perfil del Negocio
4. Click en tab "WhatsApp"
5. Debe ver: WhatsAppConfigSection con tabs

---

## 📝 1.6 Variables de Entorno (Producción)

### En Render/Railway/Heroku:

```env
# Backend
WHATSAPP_USE_NEW_TOKEN_SYSTEM=true
WHATSAPP_APP_ID=<obtenido en Parte 2>
WHATSAPP_APP_SECRET=<obtenido en Parte 2>
WHATSAPP_CONFIG_ID=<obtenido en Parte 2>
WHATSAPP_WEBHOOK_VERIFY_TOKEN=beauty_control_webhook_verify_2024
ENCRYPTION_KEY=<generada en 1.4>
DATABASE_URL=<tu database url>
```

### En Vercel (Frontend):

```env
VITE_WHATSAPP_APP_ID=<mismo que backend>
VITE_API_URL=https://tu-backend.onrender.com
```

---

## 📝 1.7 Desplegar a Producción

```bash
# 1. Commit y push
git add .
git commit -m "feat: Add WhatsApp Business Platform integration"
git push origin main

# 2. Deploy backend (automático en Render/Railway)
# - Verificar que las variables de entorno estén configuradas
# - Verificar que las migraciones se ejecuten

# 3. Deploy frontend (automático en Vercel)
# - Verificar que las variables de entorno estén configuradas

# 4. Verificar que todo funcione
curl https://tu-backend.onrender.com/health
```

---

## 📝 1.8 Verificar Webhook en Producción

```bash
# Test del webhook
curl "https://tu-backend.onrender.com/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=beauty_control_webhook_verify_2024&hub.challenge=test123"

# Debe retornar: test123
```

---

# 🎓 PARTE 2: Configuración del Dueño de Plataforma (BC)

**Tiempo estimado:** 30-45 minutos  
**Frecuencia:** UNA SOLA VEZ

---

## ✅ Checklist

- [ ] **2.1** Crear cuenta Meta for Developers
- [ ] **2.2** Crear App de WhatsApp Business
- [ ] **2.3** Configurar Webhook
- [ ] **2.4** Obtener credenciales
- [ ] **2.5** Configurar en producción
- [ ] **2.6** Verificar conexión

---

## 📝 2.1 Crear Cuenta Meta for Developers

### Requisitos previos:
- ✅ Cuenta de Facebook personal
- ✅ Verificación de 2 factores activada

### Pasos:

1. Ir a https://developers.facebook.com
2. Click en "Comenzar" (o "Get Started")
3. Aceptar términos y condiciones
4. Verificar cuenta (SMS o email)
5. Completar información de perfil

---

## 📝 2.2 Crear App de WhatsApp Business

### Paso 1: Crear la App

1. En https://developers.facebook.com/apps
2. Click en **"Crear App"**
3. Seleccionar tipo: **"Empresa"** o **"Consumidor"** (recomendado: Empresa)
4. Llenar formulario:
   - **Nombre de la app:** Beauty Control Platform
   - **Email de contacto:** tu@email.com
   - **Business Manager:** Crear uno nuevo o usar existente
5. Click **"Crear App"**

### Paso 2: Agregar Producto WhatsApp

1. En el panel de la app, buscar **"WhatsApp"**
2. Click en **"Configurar"**
3. Seleccionar una cuenta de WhatsApp Business:
   - Si no tienes: Click en "Crear nueva cuenta"
   - Nombre: "Beauty Control Platform"
4. Click **"Continuar"**

### Paso 3: Configurar Números de Teléfono

**⚠️ IMPORTANTE:** Esta es una cuenta de PRUEBAS de Meta, no es tu número real.

1. Meta te da un número de prueba automáticamente
2. Este número solo sirve para testing con máximo 5 números de prueba
3. **Para producción:** Los negocios usarán sus propios números

---

## 📝 2.3 Configurar Webhook

### Paso 1: Ir a Configuración de Webhook

1. En el panel de WhatsApp
2. Click en **"Configuración"** (Configuration)
3. Buscar sección **"Webhook"**

### Paso 2: Configurar URL del Webhook

```
URL del Callback:
https://tu-backend.onrender.com/api/webhooks/whatsapp

Token de Verificación:
beauty_control_webhook_verify_2024
```

4. Click en **"Verificar y guardar"**
5. Debe aparecer ✅ "Webhook verificado"

### Paso 3: Suscribirse a Campos

Activar las siguientes suscripciones:
- ✅ **messages** (mensajes entrantes)
- ✅ **message_status** (estado de mensajes: entregado, leído, fallido)

---

## 📝 2.4 Obtener Credenciales

### Credenciales necesarias:

```
1. WHATSAPP_APP_ID
2. WHATSAPP_APP_SECRET
3. WHATSAPP_CONFIG_ID
```

### Dónde encontrarlas:

#### 1. App ID y App Secret

1. Ir a **"Configuración"** → **"Básica"** (Settings → Basic)
2. Copiar:
   - **App ID** (ID de la app)
   - **App Secret** (Clave secreta de la app)
     - Click en "Mostrar" para verla

#### 2. Config ID (Configuration ID)

1. En el panel de WhatsApp
2. Ir a **"Configuración"** → **"Embedded Signup"**
3. Copiar el **"Configuration ID"**

---

## 📝 2.5 Configurar en Producción

### Actualizar variables de entorno en Render/Railway:

```env
WHATSAPP_APP_ID=123456789012345
WHATSAPP_APP_SECRET=abcdef1234567890abcdef1234567890
WHATSAPP_CONFIG_ID=987654321098765
```

### Actualizar en Vercel (Frontend):

```env
VITE_WHATSAPP_APP_ID=123456789012345
```

### Reiniciar servicios:

```bash
# Backend se reiniciará automáticamente
# Frontend se reiniciará automáticamente

# Verificar logs
```

---

## 📝 2.6 Verificar Conexión

### Test 1: Webhook verificación

```bash
curl "https://tu-backend.onrender.com/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=beauty_control_webhook_verify_2024&hub.challenge=test123"

# Debe retornar: test123
```

### Test 2: API de administración

```bash
# En el navegador, ir a:
https://tu-app.vercel.app

# Login como business
# Ir a Perfil → WhatsApp
# Debe cargar sin errores
```

---

# 👔 PARTE 3: Guía para cada Negocio

**Tiempo estimado:** 10-15 minutos por negocio  
**Frecuencia:** Una vez por negocio

---

## 🎯 Objetivo

Cada negocio (spa, salón, clínica) conectará su propio WhatsApp Business para enviar mensajes a sus clientes.

---

## ✅ Checklist

- [ ] **3.1** Tener WhatsApp Business configurado
- [ ] **3.2** Conectar WhatsApp a Beauty Control
- [ ] **3.3** Crear plantillas de mensajes
- [ ] **3.4** Probar envío de mensajes
- [ ] **3.5** Configurar mensajes automáticos

---

## 📝 3.1 Requisitos Previos

### El negocio debe tener:

1. ✅ **WhatsApp Business App** instalada en su teléfono
   - Descargar: https://wa.me/business
   - Configurar con el número del negocio
   - Verificar el número

2. ✅ **Cuenta de Facebook** vinculada
   - Vincular WhatsApp Business con Facebook
   - Ir a Configuración → Herramientas empresariales

3. ✅ **Meta Business Suite** configurado
   - Ir a https://business.facebook.com
   - Vincular WhatsApp Business Account

---

## 📝 3.2 Conectar WhatsApp a Beauty Control

### Método 1: Embedded Signup (RECOMENDADO - MÁS FÁCIL)

#### Paso 1: Ir a la sección de WhatsApp

1. Login en Beauty Control
2. Ir a **Perfil del Negocio**
3. Click en tab **"WhatsApp"**

#### Paso 2: Conectar con Meta

1. Click en botón **"Conectar con Meta"**
2. Se abre popup de Facebook
3. Login con tu cuenta de Facebook (la vinculada a WhatsApp Business)
4. Seleccionar tu **WhatsApp Business Account**
5. Dar permisos solicitados:
   - ✅ Enviar mensajes
   - ✅ Leer información de la cuenta
   - ✅ Recibir notificaciones
6. Click **"Continuar"**

#### Paso 3: Verificar conexión

- Debe aparecer mensaje: **"✅ Conexión exitosa"**
- Ver estado: **"Conectado"** en verde
- Ver tu número de WhatsApp Business

### Método 2: Token Manual (AVANZADO)

Si el Embedded Signup no funciona, usar token manual:

#### Paso 1: Obtener Token de Meta

1. Ir a https://business.facebook.com
2. Configuración del sistema
3. WhatsApp Business Platform
4. Click en tu número
5. Generar token permanente
6. Copiar el token

#### Paso 2: Pegar en Beauty Control

1. En Beauty Control, ir a tab WhatsApp
2. Buscar sección **"Configuración Manual"**
3. Click en **"Agregar Token Manualmente"**
4. Pegar:
   - **Access Token:** (el que copiaste)
   - **Phone Number ID:** (lo ves en Meta)
   - **WABA ID:** (opcional)
5. Click **"Guardar"**

---

## 📝 3.3 Crear Plantillas de Mensajes

### ¿Qué son las plantillas?

- Mensajes pre-aprobados por Meta
- Puedes personalizarlos con variables (nombre, fecha, hora, etc.)
- Meta las revisa antes de aprobarlas (toma 24-48 horas)

### Tipos de plantillas recomendadas:

1. **Recordatorio de cita**
2. **Confirmación de cita**
3. **Mensaje de bienvenida**
4. **Promoción especial**

---

### Ejemplo 1: Recordatorio de Cita

#### Paso 1: Crear plantilla

1. En tab WhatsApp, ir a **"Plantillas"**
2. Click **"+ Nueva Plantilla"**
3. Llenar formulario:

```
Nombre de plantilla: recordatorio_cita_spa
(solo minúsculas y guiones bajos)

Categoría: TRANSACTIONAL
(mensajes relacionados con el servicio)

Idioma: es (Español)

Header (opcional):
📅 Recordatorio de Cita

Body (requerido):
Hola {{1}}, te recordamos tu cita en {{2}} el día {{3}} a las {{4}}.

¿Confirmas tu asistencia?

Footer (opcional):
{{5}} - Tu belleza es nuestra pasión

Botones (opcional):
[Botón 1] Confirmar Asistencia → URL
[Botón 2] Cancelar Cita → URL
```

#### Variables explicadas:

- `{{1}}` = Nombre del cliente
- `{{2}}` = Nombre del negocio
- `{{3}}` = Fecha de la cita
- `{{4}}` = Hora de la cita
- `{{5}}` = Nombre del negocio (en footer)

#### Paso 2: Vista previa

- Ver preview en tiempo real en panel derecho
- Ajustar si es necesario

#### Paso 3: Enviar a aprobación

1. Click **"Enviar a Meta para Aprobación"**
2. Esperar 24-48 horas
3. Recibirás notificación cuando esté aprobada

---

### Ejemplo 2: Confirmación de Cita

```
Nombre: confirmacion_cita_spa

Categoría: TRANSACTIONAL

Header:
✅ Cita Confirmada

Body:
¡Perfecto {{1}}! Tu cita ha sido confirmada.

📍 Servicio: {{2}}
📅 Fecha: {{3}}
⏰ Hora: {{4}}
👤 Especialista: {{5}}

Te esperamos en {{6}}.

Footer:
{{7}} - Llámanos al {{8}}

Botones:
[Ver en Google Maps] → URL de tu ubicación
```

---

### Ejemplo 3: Promoción Especial

```
Nombre: promocion_mes_spa

Categoría: MARKETING
(⚠️ Límite de mensajes marketing: ~1,000/día)

Header:
🎉 Promoción Especial

Body:
¡Hola {{1}}! 

Este mes tenemos una promoción increíble para ti:

{{2}}

Válido hasta el {{3}}.

¡No te lo pierdas! Agenda tu cita ahora.

Footer:
{{4}} - WhatsApp: {{5}}

Botones:
[Agendar Ahora] → URL de tu booking
```

---

## 📝 3.4 Probar Envío de Mensajes

### Método 1: Envío Manual (Testing)

1. En tab WhatsApp, ir a **"Mensajes"**
2. Click **"+ Enviar Mensaje de Prueba"**
3. Seleccionar:
   - **Plantilla:** recordatorio_cita_spa
   - **Destinatario:** Tu número de prueba
   - **Variables:**
     - {{1}}: "María"
     - {{2}}: "Spa Bella"
     - {{3}}: "15 de Diciembre"
     - {{4}}: "3:00 PM"
     - {{5}}: "Spa Bella"
4. Click **"Enviar"**
5. Verificar que llega el mensaje

### Método 2: Envío Automático (Producción)

Cuando crees una cita en el sistema:
1. En el formulario de cita, activar:
   - ✅ **"Enviar confirmación por WhatsApp"**
2. Seleccionar plantilla: **confirmacion_cita_spa**
3. Guardar cita
4. El mensaje se enviará automáticamente

---

## 📝 3.5 Configurar Mensajes Automáticos

### En Beauty Control:

1. Ir a **Perfil del Negocio** → **Configuración de Citas**
2. Buscar sección **"Notificaciones WhatsApp"**
3. Activar:

```
✅ Confirmación de cita
   Plantilla: confirmacion_cita_spa
   Enviar: Inmediatamente después de agendar

✅ Recordatorio 24 horas antes
   Plantilla: recordatorio_cita_spa
   Enviar: 24 horas antes de la cita
   
✅ Recordatorio 1 hora antes
   Plantilla: recordatorio_cita_spa
   Enviar: 1 hora antes de la cita

❌ Mensaje de agradecimiento post-cita
   (Crear plantilla primero)
```

4. Click **"Guardar Configuración"**

---

# 🧪 Testing y Validación

## ✅ Checklist Completo

### Desarrollador:
- [ ] Código backend desplegado
- [ ] Código frontend desplegado
- [ ] Migraciones ejecutadas
- [ ] Variables de entorno configuradas
- [ ] Webhook respondiendo correctamente

### Dueño de Plataforma:
- [ ] App de Meta creada
- [ ] Webhook configurado y verificado
- [ ] Credenciales agregadas a producción
- [ ] Test de conexión exitoso

### Negocio (Piloto):
- [ ] WhatsApp Business configurado
- [ ] Conectado a Beauty Control
- [ ] Plantilla de prueba creada
- [ ] Plantilla aprobada por Meta
- [ ] Mensaje de prueba enviado exitosamente
- [ ] Mensaje automático funcionando

---

# 🔧 Troubleshooting

## Problema 1: Webhook no verifica

**Síntoma:** Error al configurar webhook en Meta

**Soluciones:**
```bash
# 1. Verificar que el endpoint responde
curl "https://tu-backend.com/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=beauty_control_webhook_verify_2024&hub.challenge=test"

# 2. Verificar variable de entorno
echo $WHATSAPP_WEBHOOK_VERIFY_TOKEN

# 3. Verificar logs del backend
```

## Problema 2: "Error de encriptación"

**Síntoma:** Error al guardar token

**Solución:**
```bash
# Verificar que ENCRYPTION_KEY tiene 32 caracteres
echo $ENCRYPTION_KEY | wc -c
# Debe retornar: 33 (32 + newline)

# Regenerar si es necesario
openssl rand -base64 32
```

## Problema 3: Plantilla rechazada por Meta

**Síntomas comunes de rechazo:**
- Usar palabras prohibidas (gratis, premio, gana)
- Texto muy largo (>1024 caracteres)
- Formato incorrecto

**Solución:**
- Revisar políticas de Meta
- Simplificar el mensaje
- Re-enviar plantilla modificada

## Problema 4: Embedded Signup no funciona

**Solución:**
```javascript
// Verificar WHATSAPP_CONFIG_ID
console.log(process.env.VITE_WHATSAPP_APP_ID)

// Verificar que el dominio está whitelistado en Meta
// Meta Business Manager → App Settings → Basic → App Domains
```

## Problema 5: "Token expirado"

**Solución:**
1. Los tokens de Meta no expiran si son "permanentes"
2. Si expira, el negocio debe reconectar
3. O rotar token manualmente en panel

---

# 📊 Métricas de Éxito

## KPIs a monitorear:

```
✅ Negocios conectados: X/Y
✅ Plantillas aprobadas: X
✅ Mensajes enviados: X (últimos 7 días)
✅ Tasa de entrega: X% (delivered/sent)
✅ Tasa de lectura: X% (read/delivered)
✅ Tasa de error: X% (failed/sent)
```

## Dashboard recomendado:

```
WhatsApp Analytics
├── Mensajes Totales
├── Por Estado
│   ├── Enviados
│   ├── Entregados
│   ├── Leídos
│   └── Fallidos
├── Por Tipo
│   ├── Confirmaciones
│   ├── Recordatorios
│   └── Marketing
└── Por Negocio
    ├── Negocio A: X mensajes
    ├── Negocio B: Y mensajes
    └── ...
```

---

# 🎉 ¡Listo para Producción!

Si completaste todas las partes:

✅ **Desarrollador** - Código deployado y funcionando  
✅ **BC Platform** - App configurada en Meta  
✅ **Negocio Piloto** - Conectado y enviando mensajes  

**¡El sistema está listo para escalar! 🚀**

---

## 📞 Soporte

**Para BC (internos):**
- Ver logs en Render/Railway
- Monitorear webhook events en base de datos
- Revisar tabla `whatsapp_webhook_events`

**Para Negocios:**
- Documentación en panel de ayuda
- Video tutorial (grabar uno siguiendo Parte 3)
- Chat de soporte

---

**Versión:** 1.0  
**Última actualización:** Diciembre 2025  
**Siguiente revisión:** Post first 10 business connections
