# Sistema de Comisiones y Consentimientos - Implementación Completa

**Fecha:** 14 de Octubre, 2025  
**Feature:** FM-26  
**Estado:** ✅ IMPLEMENTADO (Pendiente sincronización de base de datos)

---

## 📋 Resumen Ejecutivo

Se implementó un sistema completo de gestión de comisiones y consentimientos médicos con las siguientes características:

### ✅ **Comisiones**
- Configuración a nivel de negocio (global)
- Sobrescritura por servicio (opcional)
- Tres modos de cálculo: GENERAL, POR_SERVICIO, MIXTO
- Validación automática de porcentajes
- Calculadora de comisiones

### ✅ **Consentimientos**
- Plantillas reutilizables con versionado
- Sistema de placeholders automático
- Campos editables configurables (alergias, medicamentos)
- Trazabilidad legal completa
- Soporte para generación de PDF (pendiente implementar)

---

## 🗂️ Archivos Creados

### **Modelos** (4 archivos)
```
packages/backend/src/models/
├── BusinessCommissionConfig.js   (66 líneas)
├── ServiceCommission.js          (98 líneas)
├── ConsentTemplate.js            (122 líneas)
└── ConsentSignature.js           (188 líneas)
```

### **Controladores** (2 archivos)
```
packages/backend/src/controllers/
├── commissionController.js       (421 líneas)
└── consentController.js          (612 líneas)
```

### **Rutas** (2 archivos)
```
packages/backend/src/routes/
├── commissionRoutes.js           (78 líneas)
└── consentRoutes.js              (107 líneas)
```

### **Archivos Modificados**
- `packages/backend/src/models/Service.js` - Removido `commission` y `consentTemplate`, agregado `consentTemplateId`
- `packages/backend/src/models/index.js` - Agregadas relaciones (12 nuevas asociaciones)
- `packages/backend/server.js` - Agregados modelos a sincronización
- `packages/backend/src/app.js` - Registradas nuevas rutas
- `packages/backend/scripts/seed-rule-templates.js` - Actualizadas reglas de comisiones

---

## 📊 Estructura de Base de Datos

### Tabla: `business_commission_configs`
Configuración global de comisiones por negocio (1 por negocio)

| Campo               | Tipo           | Descripción                                    |
|---------------------|----------------|------------------------------------------------|
| id                  | UUID           | PK                                             |
| businessId          | UUID           | FK → businesses (UNIQUE)                       |
| commissionsEnabled  | BOOLEAN        | ¿Comisiones habilitadas? (default: true)       |
| calculationType     | ENUM           | GENERAL \| POR_SERVICIO \| MIXTO               |
| generalPercentage   | DECIMAL(5,2)   | % general (0-100)                              |
| notes               | TEXT           | Notas adicionales                              |

### Tabla: `service_commissions`
Configuración específica por servicio (opcional)

| Campo                | Tipo           | Descripción                                    |
|----------------------|----------------|------------------------------------------------|
| id                   | UUID           | PK                                             |
| serviceId            | UUID           | FK → services (UNIQUE)                         |
| type                 | ENUM           | PERCENTAGE \| FIXED                            |
| specialistPercentage | DECIMAL(5,2)   | % para especialista (0-100)                    |
| businessPercentage   | DECIMAL(5,2)   | % para negocio (auto-calculado)                |
| fixedAmount          | DECIMAL(10,2)  | Monto fijo alternativo                         |
| notes                | TEXT           | Notas adicionales                              |

**Hook de validación:** Si `type = PERCENTAGE`, la suma de `specialistPercentage + businessPercentage` debe ser 100.

### Tabla: `consent_templates`
Plantillas de consentimiento reutilizables

| Campo          | Tipo     | Descripción                                          |
|----------------|----------|------------------------------------------------------|
| id             | UUID     | PK                                                   |
| businessId     | UUID     | FK → businesses                                      |
| name           | STRING   | Nombre de la plantilla                               |
| code           | STRING   | Código único por negocio (ej: CONSENT_BOTOX_V1)      |
| content        | TEXT     | HTML con placeholders                                |
| version        | STRING   | Versión semántica (ej: 1.0.0)                        |
| editableFields | JSONB    | Campos que el cliente completa al firmar             |
| pdfConfig      | JSONB    | Configuración para generación de PDF                 |
| category       | STRING   | Categoría (ESTETICO, MEDICO, etc.)                   |
| isActive       | BOOLEAN  | Activa/Inactiva (soft delete)                        |
| metadata       | JSONB    | Datos adicionales                                    |

**Placeholders soportados:**
```html
<!-- Datos del negocio (auto-llenado) -->
{{negocio_nombre}}
{{negocio_logo}}
{{negocio_direccion}}
{{negocio_telefono}}
{{negocio_email}}

<!-- Datos del cliente (auto-llenado desde Customer) -->
{{cliente_nombre}}
{{cliente_email}}
{{cliente_telefono}}
{{cliente_documento}}
{{cliente_fecha_nacimiento}}

<!-- Datos contextuales -->
{{servicio_nombre}}
{{fecha_firma}}
{{fecha_cita}}
```

**Ejemplo de editableFields:**
```json
[
  {
    "name": "alergias",
    "label": "Alergias",
    "type": "textarea",
    "required": true
  },
  {
    "name": "medicamentos",
    "label": "Medicamentos Actuales",
    "type": "textarea",
    "required": false
  },
  {
    "name": "condiciones_medicas",
    "label": "Condiciones Médicas Preexistentes",
    "type": "textarea",
    "required": false
  }
]
```

### Tabla: `consent_signatures`
Firmas de consentimiento con trazabilidad legal

| Campo               | Tipo      | Descripción                                       |
|---------------------|-----------|---------------------------------------------------|
| id                  | UUID      | PK                                                |
| businessId          | UUID      | FK → businesses                                   |
| consentTemplateId   | UUID      | FK → consent_templates                            |
| customerId          | UUID      | FK → clients                                      |
| appointmentId       | UUID      | FK → appointments (nullable)                      |
| serviceId           | UUID      | FK → services (nullable)                          |
| **templateVersion** | STRING    | Snapshot de la versión                            |
| **templateContent** | TEXT      | Snapshot del HTML con placeholders reemplazados   |
| signatureData       | TEXT      | Firma en base64 o path a imagen                   |
| signatureType       | ENUM      | DIGITAL \| UPLOADED \| TYPED                      |
| signedAt            | DATE      | Timestamp exacto de la firma                      |
| signedBy            | STRING    | Nombre completo del firmante                      |
| editableFieldsData  | JSONB     | Valores completados: `{"alergias": "Penicilina"}` |
| pdfUrl              | STRING    | Path al PDF generado                              |
| pdfGeneratedAt      | DATE      | Cuándo se generó el PDF                           |
| **ipAddress**       | STRING    | IP del dispositivo que firmó                      |
| **userAgent**       | TEXT      | User agent del navegador                          |
| **location**        | JSONB     | Coordenadas GPS si disponibles                    |
| **device**          | JSONB     | Info del dispositivo                              |
| status              | ENUM      | ACTIVE \| REVOKED \| EXPIRED                      |
| revokedAt           | DATE      | Cuándo se revocó                                  |
| revokedReason       | TEXT      | Razón de la revocación                            |
| revokedBy           | UUID      | FK → users (quien revocó)                         |

**Trazabilidad legal:** Los campos marcados en **negrita** proporcionan evidencia legal de la firma.

---

## 🔗 Relaciones Configuradas

```javascript
// COMISIONES
Business.hasOne(BusinessCommissionConfig)
BusinessCommissionConfig.belongsTo(Business)

Service.hasOne(ServiceCommission)
ServiceCommission.belongsTo(Service)

// CONSENTIMIENTOS
Business.hasMany(ConsentTemplate)
ConsentTemplate.belongsTo(Business)

Service.belongsTo(ConsentTemplate, as: 'defaultConsentTemplate') // Opcional
ConsentTemplate.hasMany(Service, as: 'servicesUsingAsDefault')

ConsentTemplate.hasMany(ConsentSignature)
ConsentSignature.belongsTo(ConsentTemplate, as: 'template')

Business.hasMany(ConsentSignature)
ConsentSignature.belongsTo(Business)

Client.hasMany(ConsentSignature)
ConsentSignature.belongsTo(Client, as: 'customer')

Service.hasMany(ConsentSignature)
ConsentSignature.belongsTo(Service)

Appointment.hasMany(ConsentSignature)
ConsentSignature.belongsTo(Appointment)

User.hasMany(ConsentSignature, foreignKey: 'revokedBy')
ConsentSignature.belongsTo(User, as: 'revoker')
```

---

## 🛣️ Rutas de API

### **Comisiones**

#### Configuración del Negocio
```
GET    /api/business/:businessId/commission-config
PUT    /api/business/:businessId/commission-config
```

#### Comisiones por Servicio
```
GET    /api/business/:businessId/services/:serviceId/commission
PUT    /api/business/:businessId/services/:serviceId/commission
DELETE /api/business/:businessId/services/:serviceId/commission
POST   /api/business/:businessId/services/:serviceId/commission/calculate
```

### **Consentimientos**

#### Plantillas
```
GET    /api/business/:businessId/consent-templates
       ?category=ESTETICO&activeOnly=true&search=botox

GET    /api/business/:businessId/consent-templates/:templateId
POST   /api/business/:businessId/consent-templates
PUT    /api/business/:businessId/consent-templates/:templateId
DELETE /api/business/:businessId/consent-templates/:templateId
       ?hardDelete=true
```

#### Firmas
```
POST   /api/business/:businessId/consent-signatures
GET    /api/business/:businessId/consent-signatures/customer/:customerId
       ?status=ACTIVE

GET    /api/business/:businessId/consent-signatures/:signatureId
POST   /api/business/:businessId/consent-signatures/:signatureId/revoke
GET    /api/business/:businessId/consent-signatures/:signatureId/pdf
```

---

## 🔧 Controladores Implementados

### **commissionController.js** (6 métodos)

1. **getBusinessCommissionConfig** - Obtener o crear configuración del negocio
2. **updateBusinessCommissionConfig** - Actualizar configuración del negocio
3. **getServiceCommission** - Obtener comisión efectiva de un servicio
4. **upsertServiceCommission** - Crear/actualizar comisión de servicio
5. **deleteServiceCommission** - Eliminar comisión de servicio
6. **calculateCommission** - Calcular comisión para un monto

### **consentController.js** (9 métodos)

1. **getTemplates** - Listar plantillas con filtros
2. **getTemplate** - Obtener plantilla específica
3. **createTemplate** - Crear nueva plantilla
4. **updateTemplate** - Actualizar plantilla (incrementa versión si cambia content)
5. **deleteTemplate** - Desactivar plantilla (soft delete)
6. **signConsent** - Firmar consentimiento (reemplaza placeholders, valida campos)
7. **getCustomerSignatures** - Obtener firmas de un cliente
8. **getSignature** - Obtener firma específica con todas las relaciones
9. **revokeSignature** - Revocar firma
10. **getSignaturePDF** - Generar/obtener PDF (**Pendiente implementación**)

---

## 🎯 Lógica de Negocio

### **Comisiones**

#### Flujo de Validación al Crear/Actualizar Servicio

```javascript
// 1. Verificar si las comisiones están habilitadas
const config = await BusinessCommissionConfig.findOne({ where: { businessId } });

if (!config || !config.commissionsEnabled) {
  // ❌ Comisiones deshabilitadas → Forzar commission = null
  service.commission = null;
  // No crear ServiceCommission
}

// 2. Si están habilitadas, validar según el tipo
if (config.commissionsEnabled) {
  switch (config.calculationType) {
    case 'GENERAL':
      // ✅ Usar porcentaje general del negocio
      // ❌ Ignorar input de comisión específica
      // ❌ No crear ServiceCommission
      commission = {
        specialistPercentage: config.generalPercentage,
        businessPercentage: 100 - config.generalPercentage
      };
      break;

    case 'POR_SERVICIO':
      // ✅ REQUERIR comisión específica
      if (!serviceCommissionInput) {
        throw new Error('Este negocio requiere configuración de comisión por servicio');
      }
      // ✅ Crear/actualizar ServiceCommission
      await ServiceCommission.upsert({ serviceId, ...serviceCommissionInput });
      break;

    case 'MIXTO':
      // ✅ Comisión específica es OPCIONAL
      if (serviceCommissionInput) {
        await ServiceCommission.upsert({ serviceId, ...serviceCommissionInput });
      } else {
        // Usar general como fallback
        commission = {
          specialistPercentage: config.generalPercentage,
          businessPercentage: 100 - config.generalPercentage
        };
      }
      break;
  }
}
```

#### Cálculo de Comisión

```javascript
// Endpoint: POST /api/business/:businessId/services/:serviceId/commission/calculate
// Body: { amount: 100000 }

// Respuesta:
{
  "success": true,
  "data": {
    "amount": 100000,
    "commissionsEnabled": true,
    "specialistAmount": 60000,    // 60%
    "businessAmount": 40000,      // 40%
    "specialistPercentage": 60,
    "businessPercentage": 40
  }
}
```

### **Consentimientos**

#### Flujo de Firma

```javascript
// 1. Validar que la plantilla existe y está activa
const template = await ConsentTemplate.findOne({
  where: { id: consentTemplateId, businessId, isActive: true }
});

// 2. Validar que el cliente existe
const customer = await Client.findOne({ where: { id: customerId, businessId } });

// 3. Validar campos requeridos
for (const field of template.editableFields.filter(f => f.required)) {
  if (!editableFieldsData[field.name]) {
    throw new Error(`El campo "${field.label}" es requerido`);
  }
}

// 4. Reemplazar placeholders
let processedContent = template.content;

// Datos del negocio
const business = await Business.findByPk(businessId);
processedContent = processedContent
  .replace(/\{\{negocio_nombre\}\}/g, business.name)
  .replace(/\{\{negocio_direccion\}\}/g, business.address)
  // ... otros placeholders

// Datos del cliente
processedContent = processedContent
  .replace(/\{\{cliente_nombre\}\}/g, customer.name)
  .replace(/\{\{cliente_email\}\}/g, customer.email)
  // ... otros placeholders

// 5. Crear firma con snapshot
await ConsentSignature.create({
  businessId,
  consentTemplateId,
  customerId,
  templateVersion: template.version,        // Snapshot
  templateContent: processedContent,        // Snapshot
  editableFieldsData: { alergias: "..." }, // Valores completados
  signatureData: "data:image/png;base64...",
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  status: 'ACTIVE'
});
```

#### Trazabilidad Legal

Cada firma almacena:
- ✅ **Snapshot del contenido** (templateContent) → HTML exacto que firmó el cliente
- ✅ **Versión de la plantilla** (templateVersion) → Qué versión se usó
- ✅ **Metadata de firma:**
  - IP del dispositivo
  - User Agent del navegador
  - Ubicación GPS (si disponible)
  - Info del dispositivo
  - Timestamp exacto
  - Nombre del firmante

**Esto permite demostrar legalmente:**
- Qué documento firmó el cliente
- Cuándo lo firmó
- Desde dónde lo firmó
- Cómo lo firmó

---

## 📝 Reglas de Negocio Actualizadas

En `packages/backend/scripts/seed-rule-templates.js`:

```javascript
// ❌ REMOVIDO:
{
  key: 'ESPECIALISTA_USAR_COMISIONES',
  category: 'PAYMENT_POLICY',
  dataType: 'BOOLEAN'
},
{
  key: 'ESPECIALISTA_PORCENTAJE_COMISION',
  category: 'PAYMENT_POLICY',
  dataType: 'NUMBER'
}

// ✅ AGREGADO:
{
  key: 'COMISIONES_HABILITADAS',
  category: 'SERVICE_POLICY',
  dataType: 'BOOLEAN',
  label: '¿En tu negocio se manejan comisiones?',
  description: 'Habilitar o deshabilitar el sistema de comisiones',
  defaultValue: true
},
{
  key: 'COMISIONES_TIPO_CALCULO',
  category: 'SERVICE_POLICY',
  dataType: 'STRING',
  label: 'Tipo de cálculo de comisiones',
  description: 'GENERAL: mismo % para todos, POR_SERVICIO: % por servicio, MIXTO: combinación',
  defaultValue: 'GENERAL',
  validationRules: {
    enum: ['GENERAL', 'POR_SERVICIO', 'MIXTO']
  }
},
{
  key: 'COMISIONES_PORCENTAJE_GENERAL',
  category: 'SERVICE_POLICY',
  dataType: 'NUMBER',
  label: 'Porcentaje general de comisión (%)',
  description: 'Porcentaje que recibe el especialista cuando se usa cálculo GENERAL',
  defaultValue: 50,
  validationRules: {
    min: 0,
    max: 100,
    step: 0.5
  }
}
```

---

## 🚀 Instrucciones de Sincronización

### Opción 1: Sincronizar todas las tablas con force (⚠️ BORRA DATOS)

```bash
cd packages/backend
FORCE_SYNC_DB=true npm run dev
```

### Opción 2: Sincronizar solo las nuevas tablas

```bash
cd packages/backend
node -e "
const { sequelize, BusinessCommissionConfig, ServiceCommission, ConsentTemplate, ConsentSignature } = require('./src/models');

async function sync() {
  await sequelize.authenticate();
  
  await BusinessCommissionConfig.sync({ force: true });
  console.log('✅ business_commission_configs creada');
  
  await ServiceCommission.sync({ force: true });
  console.log('✅ service_commissions creada');
  
  await ConsentTemplate.sync({ force: true });
  console.log('✅ consent_templates creada');
  
  await ConsentSignature.sync({ force: true });
  console.log('✅ consent_signatures creada');
  
  console.log('🎉 Todas las tablas nuevas sincronizadas');
  process.exit(0);
}

sync().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
"
```

### Opción 3: Usar el script creado anteriormente

```bash
cd packages/backend
node scripts/sync-commission-consent-tables.js
```

---

## 🧪 Testing

### Test de Comisiones

```bash
# 1. Crear configuración de negocio
PUT /api/business/123/commission-config
{
  "commissionsEnabled": true,
  "calculationType": "MIXTO",
  "generalPercentage": 60
}

# 2. Crear comisión específica para un servicio
PUT /api/business/123/services/456/commission
{
  "type": "PERCENTAGE",
  "specialistPercentage": 70
}

# 3. Calcular comisión
POST /api/business/123/services/456/commission/calculate
{ "amount": 100000 }

# Respuesta esperada:
{
  "specialistAmount": 70000,
  "businessAmount": 30000
}
```

### Test de Consentimientos

```bash
# 1. Crear plantilla
POST /api/business/123/consent-templates
{
  "name": "Consentimiento Botox",
  "code": "CONSENT_BOTOX_V1",
  "content": "<p>Yo, {{cliente_nombre}}, autorizo...</p>",
  "editableFields": [
    { "name": "alergias", "label": "Alergias", "type": "textarea", "required": true }
  ],
  "category": "ESTETICO"
}

# 2. Firmar consentimiento
POST /api/business/123/consent-signatures
{
  "consentTemplateId": "template-uuid",
  "customerId": "customer-uuid",
  "editableFieldsData": {
    "alergias": "Ninguna"
  },
  "signatureData": "data:image/png;base64,...",
  "signedBy": "Juan Pérez",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}

# 3. Obtener firmas del cliente
GET /api/business/123/consent-signatures/customer/customer-uuid?status=ACTIVE
```

---

## ⏭️ Próximos Pasos

### 🔴 **ALTA PRIORIDAD**

1. **Sincronizar base de datos** con force o script
2. **Actualizar seed de reglas** ejecutando:
   ```bash
   node scripts/seed-rule-templates.js
   ```
3. **Implementar generación de PDF** en `consentController.getSignaturePDF()`
   - Usar `pdfmake` o `puppeteer`
   - Convertir HTML con placeholders a PDF
   - Agregar firma digital
   - Almacenar en S3 o local storage

### 🟡 **MEDIA PRIORIDAD**

4. **Modificar ServiceController** para validar comisiones según reglas del negocio
5. **Frontend - Editor de Plantillas**
   - Integrar TinyMCE
   - Botones para insertar placeholders
   - Panel de configuración de campos editables
6. **Frontend - Firma de Consentimientos**
   - Componente de firma digital (react-signature-canvas)
   - Form para campos editables
   - Captura de metadata (IP, GPS, device)

### 🟢 **BAJA PRIORIDAD**

7. **Testing automatizado** (Jest/Supertest)
8. **Documentación de API** (Swagger/OpenAPI)
9. **Versionado de plantillas** automático al editar
10. **Sistema de notificaciones** cuando un consentimiento está próximo a expirar

---

## 📚 Referencias

- **Propuesta Técnica:** `SERVICIOS_Y_ESPECIALISTAS_PROPUESTA.md`
- **Modelos:**
  - `packages/backend/src/models/BusinessCommissionConfig.js`
  - `packages/backend/src/models/ServiceCommission.js`
  - `packages/backend/src/models/ConsentTemplate.js`
  - `packages/backend/src/models/ConsentSignature.js`
- **Controladores:**
  - `packages/backend/src/controllers/commissionController.js`
  - `packages/backend/src/controllers/consentController.js`
- **Rutas:**
  - `packages/backend/src/routes/commissionRoutes.js`
  - `packages/backend/src/routes/consentRoutes.js`

---

## ✅ Checklist de Implementación

- [x] Modelos creados (4)
- [x] Relaciones configuradas (12)
- [x] Controladores implementados (2)
- [x] Rutas creadas (2)
- [x] Rutas registradas en app.js
- [x] Modelos agregados a server.js
- [x] Reglas de negocio actualizadas
- [x] Modelo Service modificado
- [ ] **Base de datos sincronizada** ⬅️ **PENDIENTE**
- [ ] **Seed de reglas ejecutado** ⬅️ **PENDIENTE**
- [ ] **PDF generation implementado** ⬅️ **PENDIENTE**
- [ ] Frontend implementado ⬅️ PENDIENTE

---

**Desarrollado por:** Beauty Control Team  
**Última actualización:** 14 de Octubre, 2025
