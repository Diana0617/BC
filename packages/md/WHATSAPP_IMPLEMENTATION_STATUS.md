# WhatsApp Business Platform - Estado de Implementación

**Branch:** `feature/whatsapp-platform`  
**Fecha:** 5 de Noviembre de 2025  
**Estado:** En progreso - FASE 1 a 4 completadas

---

## ✅ Completado

### FASE 1: Migraciones de Base de Datos
**Commit:** `771872f` - "feat(whatsapp): FASE 1 - Add WhatsApp Business Platform migrations"

Migraciones creadas en `packages/backend/src/migrations/`:
- ✅ `20251105000001-add-whatsapp-platform-fields-to-businesses.js`
  - Campos: `whatsapp_enabled`, `whatsapp_phone_number`, `whatsapp_phone_number_id`, `whatsapp_platform_metadata`
- ✅ `20251105000002-create-whatsapp-message-templates.js`
  - Tabla para tracking de templates y aprobaciones de Meta
- ✅ `20251105000003-create-whatsapp-messages.js`
  - Tabla para tracking de mensajes enviados y estados de entrega
- ✅ `20251105000004-create-whatsapp-webhook-events.js`
  - Tabla para audit trail de webhooks de WhatsApp
- ✅ `20251105000005-create-whatsapp-opt-ins.js`
  - Tabla para compliance con GDPR y preferencias de clientes
- ✅ `20251105000006-create-whatsapp-tokens.js`
  - Tabla para almacenar tokens encriptados por negocio

### FASE 2: Servicios de Encriptación y Gestión de Tokens
**Commit:** `33ec230` - "feat(whatsapp): Add EncryptionService and WhatsAppTokenManager"

Servicios implementados:
- ✅ **EncryptionService** (`packages/backend/src/services/EncryptionService.js`)
  - Encriptación AES-256-GCM
  - Métodos: `encrypt()`, `decrypt()`, `validateEncryptedData()`, `generateKey()`
  - Authentication tag para detección de manipulación
  - IV único por cada encriptación
- ✅ **WhatsAppTokenManager** (`packages/backend/src/services/WhatsAppTokenManager.js`)
  - Métodos: `storeToken()`, `getToken()`, `rotateToken()`, `deactivateToken()`, `deleteToken()`
  - Tracking de expiración de tokens
  - Cleanup automático de tokens expirados
- ✅ **WhatsAppToken Model** (`packages/backend/src/models/WhatsAppToken.js`)
- ✅ **Tests unitarios** (`packages/backend/tests/unit/services/EncryptionService.test.js`)
  - Roundtrip encryption/decryption
  - Tamper detection
  - Edge cases (empty, long, unicode)

### FASE 3 & 4: Refactor de WhatsAppService
**Commit:** `7add2a6` - "feat(whatsapp): Refactor WhatsAppService with token manager and message tracking"

Cambios implementados:
- ✅ **WhatsAppMessage Model** (`packages/backend/src/models/WhatsAppMessage.js`)
- ✅ **WhatsAppService refactorizado** con:
  - Soporte dual: nuevo sistema de tokens encriptados + legacy (backward compatible)
  - `getBusinessConfig()` intenta TokenManager primero, fallback a `business.settings`
  - Message tracking en todos los métodos de envío
  - Método `_trackMessage()` para persistir mensajes en DB
  - Método `updateMessageStatus()` para webhooks
  - Feature flag `WHATSAPP_USE_NEW_TOKEN_SYSTEM`
  - Todos los métodos actualizados: `sendTextMessage`, `sendAppointmentReminder`, `sendAppointmentConfirmation`, `sendAppointmentCancellation`, `sendPaymentReceipt`
  - Logger en lugar de console.log

### Documentación
- ✅ `WHATSAPP_BUSINESS_PLATFORM_PLAN.md` - Plan ejecutivo
- ✅ `WHATSAPP_REFACTORING_PLAN.md` - Plan técnico detallado
- ✅ `.env.example` actualizado con variables de WhatsApp:
  - `WHATSAPP_ENCRYPTION_KEY` (32 bytes hex)
  - `WHATSAPP_USE_NEW_TOKEN_SYSTEM` (feature flag)

---

## 🚧 En Progreso

### FASE 5: Webhook Endpoints y Event Processing
**Estado:** Pendiente

Tareas por completar:
- [ ] Crear `POST /api/webhooks/whatsapp` endpoint
- [ ] Validación de firma de webhook (Meta app secret)
- [ ] Persistir eventos en `whatsapp_webhook_events`
- [ ] Procesar eventos y actualizar estados de mensajes
- [ ] Tests de integración para webhooks
- [ ] Herramienta de replay de eventos

---

## 📋 Pendiente

### FASE 6: Tests y Validación
- [ ] Actualizar cron `appointmentReminders` (ya compatible, no requiere cambios)
- [ ] Tests de integración con tokens mock
- [ ] Simulación de webhooks locales
- [ ] Validar que sistema legacy sigue funcionando

### FASE 7: Sandbox y Rollout
- [ ] Configurar Meta sandbox app
- [ ] Configurar WhatsApp Business Platform test account
- [ ] E2E tests en sandbox
- [ ] Plan de rollout por negocio (feature flags)
- [ ] Documentación de migración para negocios existentes
- [ ] Runbook de deployment

---

## 🔧 Instrucciones de Uso

### Ejecutar Migraciones (Dev)
```bash
cd packages/backend
npx sequelize-cli db:migrate
```

### Generar Encryption Key
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Variables de Entorno Requeridas
```bash
# .env
WHATSAPP_ENCRYPTION_KEY=<generar con comando arriba>
WHATSAPP_USE_NEW_TOKEN_SYSTEM=false  # true para activar nuevo sistema
```

### Migrar un Negocio al Nuevo Sistema

1. **Obtener token de WhatsApp Business Platform** (vía Embedded Signup o manual)
2. **Almacenar token encriptado:**
```javascript
const whatsappTokenManager = require('./services/WhatsAppTokenManager');

await whatsappTokenManager.storeToken(businessId, token, {
  tokenType: 'USER_ACCESS_TOKEN',
  expiresAt: null, // o fecha de expiración
  metadata: {
    wabaId: '123456789',
    permissions: ['messages', 'webhooks']
  }
});
```

3. **Actualizar campos del negocio:**
```javascript
await business.update({
  whatsapp_enabled: true,
  whatsapp_phone_number: '+573001234567',
  whatsapp_phone_number_id: 'phone_number_id_from_meta'
});
```

4. **Verificar funcionamiento:**
```javascript
const result = await whatsappService.testConnection(businessId);
console.log(result.usingNewSystem); // true si usa nuevo sistema
```

---

## 🔐 Seguridad

- ✅ Tokens encriptados con AES-256-GCM antes de almacenar en DB
- ✅ IV único por cada encriptación
- ✅ Authentication tag para detección de manipulación
- ✅ Clave de encriptación nunca commiteada (env var)
- ⚠️ **IMPORTANTE:** Rotar `WHATSAPP_ENCRYPTION_KEY` periódicamente en producción
- ⚠️ **PENDIENTE:** Implementar key rotation strategy

---

## 🎯 Próximos Pasos Inmediatos

1. **Implementar webhook endpoint** (FASE 5)
2. **Crear tests de integración** para flujo completo
3. **Configurar sandbox de Meta** para testing
4. **Documentar proceso de onboarding** para nuevos negocios
5. **Plan de migración** para negocios con sistema legacy

---

## 📊 Compatibilidad

**✅ Backward Compatible:**
- Negocios con `business.settings.communications.whatsapp` configurado siguen funcionando sin cambios
- El cron de recordatorios (`appointmentReminders.js`) funciona con ambos sistemas
- No se requiere migración inmediata

**🔄 Migración Gradual:**
- Feature flag permite activar por negocio
- Ambos sistemas pueden coexistir
- Rollout controlado y reversible

---

## 🐛 Testing

### Tests Unitarios
```bash
cd packages/backend
npm test tests/unit/services/EncryptionService.test.js
```

### Tests de Integración (Pendiente)
```bash
npm test tests/integration/whatsapp/
```

---

## 📞 Soporte

Para preguntas o issues, contactar al equipo de backend.

**Branch activo:** `feature/whatsapp-platform`  
**Merge to:** `main` (después de completar FASE 5-7 y testing)
