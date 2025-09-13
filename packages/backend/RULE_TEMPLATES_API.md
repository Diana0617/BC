# Rule Templates API Documentation

## Descripción General

El sistema de **Rule Templates** permite al Owner crear plantillas de reglas de negocio que pueden ser utilizadas por múltiples negocios. Esto centraliza la gestión de reglas comunes y permite personalización a nivel de negocio.

## Arquitectura del Sistema

### Componentes Principales

1. **BusinessRuleTemplate**: Plantillas creadas por el Owner
2. **BusinessRuleAssignment**: Asignación de plantillas a negocios específicos
3. **BusinessRules**: Reglas específicas del negocio (pueden derivar de plantillas)

### Flujo de Trabajo

1. **Owner** crea plantillas de reglas con configuraciones base
2. **Negocios** pueden explorar plantillas disponibles según su tipo y plan
3. **Negocios** asignan plantillas y las personalizan según sus necesidades
4. **Admin** puede sincronizar reglas cuando las plantillas se actualizan

---

## Endpoints API

### 👑 Owner - Gestión de Plantillas

#### POST `/api/rule-templates/owner/rule-templates`
Crear nueva plantilla de regla (solo Owner)

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Body:**
```json
{
  "name": "Cierre sin comprobante de pago",
  "description": "Permite cerrar citas sin validar el pago",
  "category": "PAYMENT_POLICY",
  "ruleKey": "allowCloseWithoutPayment",
  "ruleValue": {
    "enabled": false,
    "requiresManagerApproval": true
  },
  "businessTypes": ["SALON", "SPA"],
  "planTypes": ["PREMIUM", "ENTERPRISE"],
  "tags": ["payment", "closure", "validation"]
}
```

**Categorías Disponibles:**
- `PAYMENT_POLICY` - Políticas de pago
- `CANCELLATION_POLICY` - Políticas de cancelación
- `BOOKING_POLICY` - Políticas de reserva
- `WORKING_HOURS` - Horarios de trabajo
- `NOTIFICATION_POLICY` - Políticas de notificación
- `REFUND_POLICY` - Políticas de reembolso
- `SERVICE_POLICY` - Políticas de servicio
- `GENERAL` - Reglas generales

#### GET `/api/rule-templates/owner/rule-templates`
Obtener plantillas del Owner con filtros opcionales

**Headers:**
- `Authorization: Bearer {token}`

**Query Parameters:**
- `category` (opcional): Filtrar por categoría
- `active` (opcional): Solo plantillas activas (true/false)
- `businessType` (opcional): Filtrar por tipo de negocio
- `planType` (opcional): Filtrar por tipo de plan
- `search` (opcional): Búsqueda por nombre o descripción
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)

#### PUT `/api/rule-templates/owner/rule-templates/{templateId}`
Actualizar plantilla específica

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Body:**
```json
{
  "name": "Nombre actualizado",
  "description": "Nueva descripción",
  "ruleValue": {
    "enabled": true,
    "requiresManagerApproval": false
  },
  "isActive": true
}
```

#### DELETE `/api/rule-templates/owner/rule-templates/{templateId}`
Eliminar plantilla específica

**Headers:**
- `Authorization: Bearer {token}`

---

### 🏢 Business - Uso de Plantillas

#### GET `/api/rule-templates/business/rule-templates/available`
Obtener plantillas disponibles para el negocio

**Headers:**
- `Authorization: Bearer {token}`
- `X-Subdomain: {subdomain}` (opcional para validación)

**Middleware aplicado:**
- `authenticateToken`: Verificación de JWT
- `validateSubdomain`: Validación de subdominio
- `tenancy`: Aislamiento de datos por negocio
- `roleCheck(['ADMIN', 'MANAGER'])`: Solo admin y manager

#### POST `/api/rule-templates/business/rule-templates/{templateId}/assign`
Asignar plantilla de regla al negocio

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`
- `X-Subdomain: {subdomain}`

**Body:**
```json
{
  "customValue": {
    "enabled": true,
    "requiresManagerApproval": false,
    "maxAmount": 100000
  },
  "notes": "Personalizado para nuestro negocio"
}
```

#### GET `/api/rule-templates/business/rule-assignments`
Obtener reglas asignadas al negocio

**Headers:**
- `Authorization: Bearer {token}`
- `X-Subdomain: {subdomain}`

#### PUT `/api/rule-templates/business/rule-assignments/{assignmentId}/customize`
Personalizar regla asignada

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`
- `X-Subdomain: {subdomain}`

**Body:**
```json
{
  "customValue": {
    "enabled": false,
    "requiresManagerApproval": true,
    "maxAmount": 50000
  },
  "notes": "Ajustado según políticas internas"
}
```

#### PATCH `/api/rule-templates/business/rule-assignments/{assignmentId}/toggle`
Activar/desactivar regla asignada

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`
- `X-Subdomain: {subdomain}`

**Body:**
```json
{
  "isActive": false
}
```

---

### ⚙️ Admin - Administración

#### POST `/api/rule-templates/admin/rule-templates/sync`
Sincronizar reglas con plantillas actualizadas

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Body:**
```json
{
  "templateId": "uuid-template-id",
  "updateMode": "merge"
}
```

**Modos de actualización:**
- `merge`: Fusionar cambios manteniendo personalizaciones
- `overwrite`: Sobrescribir completamente
- `notify`: Solo notificar sin actualizar

#### GET `/api/rule-templates/admin/rule-templates/stats`
Obtener estadísticas de uso de plantillas

**Headers:**
- `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTemplates": 25,
    "activeTemplates": 20,
    "totalAssignments": 150,
    "activeAssignments": 135,
    "byCategory": {
      "PAYMENT_POLICY": 8,
      "CANCELLATION_POLICY": 5,
      "BOOKING_POLICY": 7
    },
    "topUsedTemplates": [
      {
        "templateId": "uuid",
        "name": "Template Name",
        "assignmentCount": 45
      }
    ]
  }
}
```

---

## Seguridad y Tenancy

### Middleware de Seguridad

1. **authenticateToken**: Verificación de JWT en todas las rutas
2. **ownerOnly**: Solo Owner para rutas de gestión de plantillas
3. **roleCheck**: Verificación de roles específicos para rutas de negocio
4. **validateSubdomain**: Validación de subdominio para rutas de negocio
5. **tenancy**: Aislamiento de datos por negocio

### Separación de Datos

- **Owner**: Acceso completo a sus plantillas
- **Business**: Solo acceso a plantillas disponibles según su tipo y plan
- **Tenancy**: Cada negocio solo ve sus propias asignaciones
- **Roles**: ADMIN y MANAGER pueden gestionar reglas del negocio

---

## Ejemplos de Uso

### Ejemplo 1: Owner crea plantilla de política de pago

```bash
curl -X POST http://localhost:3001/api/rule-templates/owner/rule-templates \
  -H "Authorization: Bearer {owner_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pago flexible en servicios premium",
    "description": "Permite pago posterior en servicios de alta gama",
    "category": "PAYMENT_POLICY",
    "ruleKey": "flexiblePaymentPremium",
    "ruleValue": {
      "enabled": true,
      "maxDeferredAmount": 200000,
      "maxDeferredDays": 7
    },
    "businessTypes": ["SALON", "SPA"],
    "planTypes": ["PREMIUM", "ENTERPRISE"]
  }'
```

### Ejemplo 2: Negocio asigna y personaliza plantilla

```bash
# 1. Ver plantillas disponibles
curl -X GET http://localhost:3001/api/rule-templates/business/rule-templates/available \
  -H "Authorization: Bearer {business_token}"

# 2. Asignar plantilla con personalización
curl -X POST http://localhost:3001/api/rule-templates/business/rule-templates/{templateId}/assign \
  -H "Authorization: Bearer {business_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "customValue": {
      "enabled": true,
      "maxDeferredAmount": 150000,
      "maxDeferredDays": 5
    },
    "notes": "Reducido según nuestras políticas internas"
  }'
```

### Ejemplo 3: Admin obtiene estadísticas

```bash
curl -X GET http://localhost:3001/api/rule-templates/admin/rule-templates/stats \
  -H "Authorization: Bearer {admin_token}"
```

---

## Base de Datos

### Modelos

**BusinessRuleTemplate**
- Plantillas creadas por el Owner
- Configuración base para reglas de negocio
- Compatibilidad con tipos de negocio y planes

**BusinessRuleAssignment**
- Asignación de plantilla a negocio específico
- Valores personalizados por el negocio
- Estado de activación individual

**BusinessRules**
- Reglas específicas del negocio
- Pueden derivar de plantillas o ser independientes
- Campos de integración con system de templates

### Relaciones

```
Owner (User) ----< BusinessRuleTemplate
BusinessRuleTemplate ----< BusinessRuleAssignment >---- Business
BusinessRuleAssignment ----< BusinessRules
```

---

## Redux Integration

### Slices Disponibles

1. **ruleTemplateSlice**: Gestión de plantillas para Owner
2. **businessRuleSlice**: Gestión de reglas para Business

### APIs Disponibles

1. **ruleTemplateApi**: Endpoints para Owner
2. **businessRuleApi**: Endpoints para Business

Consultar archivos específicos en `packages/shared/` para implementación completa.