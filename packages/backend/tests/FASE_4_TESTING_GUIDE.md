# FASE 4: Testing de Integración - WhatsApp Admin API

## 📋 Resumen

Este documento detalla el proceso de testing completo para los 22 endpoints del WhatsAppAdminController.

**Estado actual**: Testing manual listo - Testing automatizado requiere setup adicional de DB

---

## 🎯 Estrategia de Testing

### Fase 4A: Testing Manual (READY ✅)
- Usar Insomnia/Postman con colección proporcionada
- Validar todos los endpoints manualmente
- Verificar autenticación y autorización
- Documentar resultados

### Fase 4B: Testing Automatizado (PENDING ⏳)
- Configurar base de datos de prueba
- Implementar tests con Jest + Supertest
- Configurar CI/CD pipeline
- Coverage report

---

## 📦 Archivos Creados

| Archivo | Propósito |
|---------|-----------|
| `jest.config.js` | Configuración de Jest para el proyecto |
| `tests/setup.js` | Setup global para todos los tests |
| `tests/integration/WhatsAppAdmin.manual-tests.js` | Guía de testing manual con cURL |
| `tests/integration/whatsapp-admin-insomnia-collection.json` | Colección completa de Insomnia |
| `tests/integration/WhatsAppAdminController.test.js` | Tests automatizados (requiere DB setup) |
| `FASE_4_TESTING_GUIDE.md` | Este documento |

---

## 🚀 Testing Manual - Paso a Paso

### Prerequisitos

1. **Backend corriendo**:
   ```bash
   cd packages/backend
   npm run dev
   ```

2. **Variables de entorno configuradas** en `.env`:
   ```env
   JWT_SECRET=your-secret-key
   WHATSAPP_ENCRYPTION_KEY=64-hex-characters
   META_APP_ID=your-meta-app-id
   META_CONFIGURATION_ID=your-config-id
   FRONTEND_URL=http://localhost:3000
   ```

3. **Importar colección en Insomnia**:
   - Archivo: `tests/integration/whatsapp-admin-insomnia-collection.json`
   - Import → From File → Seleccionar archivo

4. **Obtener token de autenticación**:
   ```bash
   curl -X POST "http://localhost:5000/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "tu-email@example.com", "password": "tu-password"}'
   ```
   
   Copiar el token de la respuesta y configurarlo en Insomnia:
   - Manage Environments → Base Environment
   - Actualizar `auth_token` con el token obtenido
   - Actualizar `business_id` con tu ID de negocio

---

## ✅ Checklist de Testing Manual

### 1. Token Management (7 endpoints)

#### 1.1 Get Token Info
```
GET /api/business/:businessId/admin/whatsapp/token
```
**Expected**: 
- ✅ Status 200
- ✅ Retorna `phoneNumber`, `wabaId`, `hasToken`, `source`, `createdAt`
- ✅ No expone el token encriptado

**Test Cases**:
- [ ] Con token configurado
- [ ] Sin token configurado
- [ ] Sin autenticación (debe fallar 401)
- [ ] Con businessId diferente (debe fallar 403)

---

#### 1.2 Store Token (Manual)
```
POST /api/business/:businessId/admin/whatsapp/token
Body: {
  "accessToken": "EAAtest...",
  "phoneNumberId": "123456789012345",
  "wabaId": "098765432109876"
}
```
**Expected**:
- ✅ Status 200
- ✅ Token encriptado en BD
- ✅ Auditoría creada
- ✅ Mensaje de éxito

**Test Cases**:
- [ ] Con datos válidos
- [ ] Sin accessToken (debe fallar 400)
- [ ] Sin phoneNumberId (debe fallar 400)
- [ ] Sin wabaId (debe fallar 400)
- [ ] accessToken inválido (debe fallar)

---

#### 1.3 Rotate Token
```
POST /api/business/:businessId/admin/whatsapp/token/rotate
Body: { "newAccessToken": "EAAnew..." }
```
**Expected**:
- ✅ Status 200
- ✅ Token anterior guardado en historial
- ✅ Nuevo token encriptado
- ✅ Auditoría de rotación

**Test Cases**:
- [ ] Con token existente
- [ ] Sin token existente (debe fallar 404)
- [ ] Sin newAccessToken (debe fallar 400)

---

#### 1.4 Delete Token
```
DELETE /api/business/:businessId/admin/whatsapp/token
```
**Expected**:
- ✅ Status 200
- ✅ Token eliminado de BD
- ✅ Auditoría de eliminación
- ✅ Campos relacionados limpiados (phoneNumberId, wabaId, source)

**Test Cases**:
- [ ] Con token existente
- [ ] Sin token (debe retornar éxito igualmente)

---

#### 1.5 Test Connection
```
GET /api/business/:businessId/admin/whatsapp/token/test
```
**Expected**:
- ✅ Status 200
- ✅ Prueba conexión con Meta API
- ✅ Retorna estado de la prueba
- ✅ Detalles de error si falla

**Test Cases**:
- [ ] Con token válido (debe conectar)
- [ ] Con token inválido/expirado (debe fallar)
- [ ] Sin token configurado (debe fallar 400)

---

#### 1.6 Get Token History
```
GET /api/business/:businessId/admin/whatsapp/token/history?page=1&limit=10
```
**Expected**:
- ✅ Status 200
- ✅ Lista de cambios históricos
- ✅ Paginación correcta
- ✅ Tokens no expuestos (solo metadatos)

**Test Cases**:
- [ ] Con historial existente
- [ ] Sin historial (retorna array vacío)
- [ ] Con paginación (page=2)

---

#### 1.7 Get Token Audit
```
GET /api/business/:businessId/admin/whatsapp/token/audit?page=1&limit=20
```
**Expected**:
- ✅ Status 200
- ✅ Log de todas las operaciones
- ✅ Incluye: acción, timestamp, userId, IP
- ✅ Paginación correcta

**Test Cases**:
- [ ] Con auditoría existente
- [ ] Sin auditoría (retorna array vacío)

---

### 2. Embedded Signup (2 endpoints)

#### 2.1 Get Embedded Signup Config
```
GET /api/business/:businessId/admin/whatsapp/embedded-signup/config
```
**Expected**:
- ✅ Status 200
- ✅ Retorna `appId`, `configurationId`, `redirectUri`, `state`
- ✅ State incluye businessId encriptado

**Test Cases**:
- [ ] Con env variables configuradas
- [ ] Sin META_APP_ID (debe fallar 500)
- [ ] Sin META_CONFIGURATION_ID (debe fallar 500)

---

#### 2.2 Handle Embedded Signup Callback
```
POST /api/business/:businessId/admin/whatsapp/embedded-signup/callback
Body: {
  "code": "auth-code-from-meta",
  "state": "whatsapp_signup_1_1234567890"
}
```
**Expected**:
- ✅ Status 200
- ✅ Intercambia código por token
- ✅ Token guardado encriptado
- ✅ Auditoría de signup

**Test Cases**:
- [ ] Con código y state válidos
- [ ] Con state inválido (debe fallar 400)
- [ ] Sin code (debe fallar 400)
- [ ] Con código ya usado (debe fallar)

---

### 3. Template Management (6 endpoints)

#### 3.1 List Templates
```
GET /api/business/:businessId/admin/whatsapp/templates?page=1&limit=10&status=APPROVED
```
**Expected**:
- ✅ Status 200
- ✅ Array de templates con paginación
- ✅ Filtrado por status funciona
- ✅ Filtrado por category funciona

**Test Cases**:
- [ ] Sin filtros
- [ ] Con status=APPROVED
- [ ] Con status=DRAFT
- [ ] Con category=UTILITY
- [ ] Con paginación (page=2, limit=5)

---

#### 3.2 Create Template (Draft)
```
POST /api/business/:businessId/admin/whatsapp/templates
Body: { name, language, category, components }
```
**Expected**:
- ✅ Status 201
- ✅ Template creado con status=DRAFT
- ✅ Componentes guardados correctamente
- ✅ Retorna ID del template

**Test Cases**:
- [ ] Template válido con BODY
- [ ] Template con HEADER + BODY + FOOTER
- [ ] Template con BUTTONS
- [ ] Name con espacios (debe fallar)
- [ ] Language inválido (debe fallar)
- [ ] Category inválido (debe fallar)
- [ ] Sin components (debe fallar)

---

#### 3.3 Update Template
```
PUT /api/business/:businessId/admin/whatsapp/templates/:templateId
Body: { name, components }
```
**Expected**:
- ✅ Status 200
- ✅ Template actualizado
- ✅ Solo permite editar DRAFT o REJECTED

**Test Cases**:
- [ ] Actualizar template DRAFT (debe funcionar)
- [ ] Actualizar template REJECTED (debe funcionar)
- [ ] Actualizar template APPROVED (debe fallar 400)
- [ ] Actualizar template PENDING (debe fallar 400)
- [ ] Template no existe (debe fallar 404)

---

#### 3.4 Submit Template to Meta
```
POST /api/business/:businessId/admin/whatsapp/templates/:templateId/submit
```
**Expected**:
- ✅ Status 200
- ✅ Template enviado a Meta
- ✅ Status cambia a PENDING
- ✅ Retorna Meta template ID

**Test Cases**:
- [ ] Submit template DRAFT (debe funcionar)
- [ ] Submit template REJECTED (debe funcionar)
- [ ] Submit template APPROVED (debe fallar)
- [ ] Sin token configurado (debe fallar 400)

---

#### 3.5 Delete Template
```
DELETE /api/business/:businessId/admin/whatsapp/templates/:templateId
```
**Expected**:
- ✅ Status 200
- ✅ Template eliminado de BD
- ✅ Solo permite eliminar DRAFT o REJECTED

**Test Cases**:
- [ ] Eliminar template DRAFT (debe funcionar)
- [ ] Eliminar template REJECTED (debe funcionar)
- [ ] Eliminar template APPROVED (debe fallar 400)
- [ ] Template no existe (debe fallar 404)

---

#### 3.6 Sync Templates with Meta
```
GET /api/business/:businessId/admin/whatsapp/templates/sync
```
**Expected**:
- ✅ Status 200
- ✅ Consulta templates desde Meta
- ✅ Actualiza BD local
- ✅ Retorna cantidad sincronizada

**Test Cases**:
- [ ] Con token válido (debe sincronizar)
- [ ] Sin token (debe fallar 400)
- [ ] Con token expirado (debe fallar)

---

### 4. Message History (2 endpoints)

#### 4.1 List Messages
```
GET /api/business/:businessId/admin/whatsapp/messages?status=SENT&startDate=2025-01-01&endDate=2025-12-31
```
**Expected**:
- ✅ Status 200
- ✅ Array de mensajes con paginación
- ✅ Filtrado por status funciona
- ✅ Filtrado por fecha funciona
- ✅ Filtrado por clientId funciona

**Test Cases**:
- [ ] Sin filtros
- [ ] Con status=SENT
- [ ] Con status=FAILED
- [ ] Con rango de fechas
- [ ] Con clientId específico
- [ ] Con paginación

---

#### 4.2 Get Message Detail
```
GET /api/business/:businessId/admin/whatsapp/messages/:messageId
```
**Expected**:
- ✅ Status 200
- ✅ Detalles completos del mensaje
- ✅ Incluye cliente, teléfono, contenido, status, fechas
- ✅ Incluye Meta Message ID si existe

**Test Cases**:
- [ ] Mensaje existente
- [ ] Mensaje no existe (debe fallar 404)
- [ ] Mensaje de otro negocio (debe fallar 403)

---

### 5. Webhook Events (3 endpoints)

#### 5.1 List Webhook Events
```
GET /api/business/:businessId/admin/whatsapp/webhooks/events?eventType=message_status
```
**Expected**:
- ✅ Status 200
- ✅ Array de eventos con paginación
- ✅ Filtrado por eventType funciona
- ✅ Filtrado por fecha funciona

**Test Cases**:
- [ ] Sin filtros
- [ ] Con eventType=message_status
- [ ] Con eventType=message_received
- [ ] Con rango de fechas
- [ ] Con paginación

---

#### 5.2 Get Webhook Event Detail
```
GET /api/business/:businessId/admin/whatsapp/webhooks/events/:eventId
```
**Expected**:
- ✅ Status 200
- ✅ Detalles completos del evento
- ✅ Incluye payload original
- ✅ Incluye estado de procesamiento

**Test Cases**:
- [ ] Evento existente
- [ ] Evento no existe (debe fallar 404)

---

#### 5.3 Replay Webhook Event
```
POST /api/business/:businessId/admin/whatsapp/webhooks/events/:eventId/replay
```
**Expected**:
- ✅ Status 200
- ✅ Evento re-procesado
- ✅ Estado actualizado
- ✅ Mensaje de resultado

**Test Cases**:
- [ ] Re-procesar evento fallido
- [ ] Re-procesar evento exitoso
- [ ] Evento no existe (debe fallar 404)

---

### 6. Health & Stats (2 endpoints)

#### 6.1 Health Check
```
GET /api/business/:businessId/admin/whatsapp/health
```
**Expected**:
- ✅ Status 200
- ✅ Estado general de la integración
- ✅ Incluye: hasToken, config, lastSync

**Test Cases**:
- [ ] Con integración configurada
- [ ] Sin integración configurada

---

#### 6.2 Get Statistics
```
GET /api/business/:businessId/admin/whatsapp/stats
```
**Expected**:
- ✅ Status 200
- ✅ Estadísticas de templates (total, por status)
- ✅ Estadísticas de messages (total, por status)
- ✅ Estadísticas de webhooks (total, por tipo)

**Test Cases**:
- [ ] Con datos existentes
- [ ] Sin datos (retorna counters en 0)

---

## 🔒 Security Testing

### Authentication
- [ ] Request sin header Authorization (debe fallar 401)
- [ ] Request con token inválido (debe fallar 401)
- [ ] Request con token expirado (debe fallar 401)

### Authorization
- [ ] Request a endpoint de otro negocio (debe fallar 403)
- [ ] Request sin permisos de admin (debe fallar 403)

### Validation
- [ ] Campos requeridos faltantes (debe fallar 400)
- [ ] Tipos de datos incorrectos (debe fallar 400)
- [ ] Valores fuera de rango (debe fallar 400)
- [ ] Caracteres especiales no permitidos (debe fallar 400)

### Encryption
- [ ] Token almacenado encriptado en BD
- [ ] Token no expuesto en respuestas
- [ ] Historial de tokens encriptados

---

## 📊 Resultados Esperados

Al completar todos los tests manuales, deberías tener:

✅ **22/22 endpoints funcionando**
✅ **Autenticación y autorización correctas**
✅ **Validaciones funcionando**
✅ **Encriptación de tokens confirmada**
✅ **Auditoría de operaciones activa**
✅ **Paginación y filtros correctos**
✅ **Error handling apropiado**

---

## 🚧 Testing Automatizado (Próximos Pasos)

Para implementar testing automatizado con Jest + Supertest:

### 1. Configurar Base de Datos de Prueba
```bash
# Crear DB de test
createdb beauty_control_test

# Configurar env test
cp .env .env.test
# Actualizar DATABASE_URL con beauty_control_test
```

### 2. Migrar modelos a usar DB de test
```javascript
// test/setup.js
process.env.DATABASE_URL = 'postgresql://..._test'
```

### 3. Ejecutar tests
```bash
npm test
```

### 4. Coverage report
```bash
npm test -- --coverage
```

---

## 📝 Notas

- Los tests automatizados están preparados pero requieren setup de DB de prueba
- La colección de Insomnia está lista para usar inmediatamente
- Todos los endpoints tienen validaciones implementadas
- La auditoría está activa en operaciones sensibles (token management)
- Los tokens se encriptan automáticamente con AES-256-GCM

---

## ✅ Conclusión FASE 4A

**Testing Manual**: COMPLETO Y LISTO ✅
- Colección Insomnia creada con 22 endpoints
- Guía de testing manual con cURL
- Checklist completo de casos de prueba
- Documentación de respuestas esperadas

**Próxima Fase**: 
- Opción B: Configuración de Sandbox Meta & E2E
- Opción C: Production Deployment
- O continuar con FASE 4B: Testing Automatizado (requiere setup DB)

