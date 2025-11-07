# Rule Templates - Ejemplos de Uso

## Ejemplos Completos de Uso de Rule Templates

### 1. Owner Creando Plantillas de Reglas

#### Ejemplo 1: Política de Pago Flexible
```bash
POST http://localhost:3001/api/rule-templates/owner/rule-templates
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "name": "Pago Posterior Autorizado",
  "description": "Permite a clientes premium pagar después del servicio",
  "category": "PAYMENT_POLICY",
  "ruleKey": "allowDeferredPayment",
  "ruleValue": {
    "enabled": true,
    "maxDeferredAmount": 150000,
    "maxDeferredDays": 3,
    "requiresClientHistory": true,
    "minimumPreviousAppointments": 5
  },
  "businessTypes": ["SALON", "SPA", "CLINIC"],
  "planTypes": ["PREMIUM", "ENTERPRISE"],
  "tags": ["payment", "premium", "flexibility"],
  "validationRules": {
    "maxDeferredAmount": {
      "type": "number",
      "min": 0,
      "max": 500000
    },
    "maxDeferredDays": {
      "type": "number",
      "min": 1,
      "max": 30
    }
  }
}
```

#### Ejemplo 2: Política de Cancelación
```bash
POST http://localhost:3001/api/rule-templates/owner/rule-templates
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "name": "Cancelación Flexible",
  "description": "Permite cancelaciones con diferentes políticas de reembolso",
  "category": "CANCELLATION_POLICY",
  "ruleKey": "flexibleCancellation",
  "ruleValue": {
    "enabled": true,
    "hoursBeforeService": 24,
    "refundPercentage": 80,
    "allowRescheduling": true,
    "maxReschedulesPerMonth": 2
  },
  "businessTypes": ["SALON", "SPA"],
  "planTypes": ["BASIC", "PREMIUM", "ENTERPRISE"],
  "tags": ["cancellation", "refund", "flexibility"]
}
```

### 2. Negocio Explorando y Asignando Plantillas

#### Listar Plantillas Disponibles
```bash
GET http://localhost:3001/api/rule-templates/business/rule-templates/available
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
X-Subdomain: salon-bella-maria

# Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid-template-1",
      "name": "Pago Posterior Autorizado",
      "description": "Permite a clientes premium pagar después del servicio",
      "category": "PAYMENT_POLICY",
      "ruleValue": {
        "enabled": true,
        "maxDeferredAmount": 150000,
        "maxDeferredDays": 3
      },
      "tags": ["payment", "premium", "flexibility"],
      "compatibility": {
        "businessType": "SALON",
        "planType": "PREMIUM",
        "compatible": true
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

#### Asignar Plantilla con Personalización
```bash
POST http://localhost:3001/api/rule-templates/business/rule-templates/uuid-template-1/assign
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
X-Subdomain: salon-bella-maria
Content-Type: application/json

{
  "customValue": {
    "enabled": true,
    "maxDeferredAmount": 100000,
    "maxDeferredDays": 2,
    "requiresClientHistory": true,
    "minimumPreviousAppointments": 3
  },
  "notes": "Reducido el monto y días según políticas internas del salón"
}
```

### 3. Gestión de Reglas Asignadas

#### Ver Reglas Asignadas al Negocio
```bash
GET http://localhost:3001/api/rule-templates/business/rule-assignments
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
X-Subdomain: salon-bella-maria

# Response:
{
  "success": true,
  "data": [
    {
      "id": "assignment-uuid-1",
      "ruleTemplate": {
        "id": "template-uuid-1",
        "name": "Pago Posterior Autorizado",
        "category": "PAYMENT_POLICY",
        "ruleKey": "allowDeferredPayment"
      },
      "isActive": true,
      "isCustomized": true,
      "customValue": {
        "enabled": true,
        "maxDeferredAmount": 100000,
        "maxDeferredDays": 2
      },
      "originalValue": {
        "enabled": true,
        "maxDeferredAmount": 150000,
        "maxDeferredDays": 3
      },
      "notes": "Reducido según políticas internas",
      "assignedAt": "2024-09-12T10:00:00Z",
      "lastModifiedAt": "2024-09-12T11:30:00Z"
    }
  ]
}
```

#### Personalizar Regla Existente
```bash
PUT http://localhost:3001/api/rule-templates/business/rule-assignments/assignment-uuid-1/customize
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
X-Subdomain: salon-bella-maria
Content-Type: application/json

{
  "customValue": {
    "enabled": true,
    "maxDeferredAmount": 80000,
    "maxDeferredDays": 1,
    "requiresClientHistory": true,
    "minimumPreviousAppointments": 5
  },
  "notes": "Ajustado después de revisar estadísticas de cobro"
}
```

#### Desactivar Regla Temporalmente
```bash
PATCH http://localhost:3001/api/rule-templates/business/rule-assignments/assignment-uuid-1/toggle
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
X-Subdomain: salon-bella-maria
Content-Type: application/json

{
  "isActive": false
}
```

### 4. Administración y Estadísticas

#### Sincronizar Reglas cuando se Actualiza Plantilla
```bash
POST http://localhost:3001/api/rule-templates/admin/rule-templates/sync
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "templateId": "template-uuid-1",
  "updateMode": "merge",
  "notifyBusinesses": true,
  "dryRun": false
}

# Response:
{
  "success": true,
  "data": {
    "templateId": "template-uuid-1",
    "affectedAssignments": 15,
    "updatedAssignments": 12,
    "conflictingAssignments": 3,
    "details": [
      {
        "assignmentId": "assignment-uuid-1",
        "businessId": "business-uuid-1",
        "status": "updated",
        "conflicts": []
      }
    ]
  }
}
```

#### Obtener Estadísticas Completas
```bash
GET http://localhost:3001/api/rule-templates/admin/rule-templates/stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

# Response:
{
  "success": true,
  "data": {
    "overview": {
      "totalTemplates": 25,
      "activeTemplates": 20,
      "totalAssignments": 150,
      "activeAssignments": 135,
      "customizedAssignments": 89
    },
    "byCategory": {
      "PAYMENT_POLICY": {
        "templates": 8,
        "assignments": 45,
        "averageCustomization": 65.5
      },
      "CANCELLATION_POLICY": {
        "templates": 5,
        "assignments": 30,
        "averageCustomization": 40.2
      }
    },
    "topUsedTemplates": [
      {
        "templateId": "template-uuid-1",
        "name": "Pago Posterior Autorizado",
        "assignmentCount": 45,
        "customizationRate": 80.0
      }
    ],
    "businessAdoption": {
      "totalBusinesses": 100,
      "businessesUsingTemplates": 75,
      "adoptionRate": 75.0
    }
  }
}
```

### 5. Casos de Uso Avanzados

#### Owner Actualizando Plantilla Existente
```bash
PUT http://localhost:3001/api/rule-templates/owner/rule-templates/template-uuid-1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "name": "Pago Posterior Autorizado - V2",
  "description": "Nueva versión con mejores controles de riesgo",
  "ruleValue": {
    "enabled": true,
    "maxDeferredAmount": 200000,
    "maxDeferredDays": 5,
    "requiresClientHistory": true,
    "minimumPreviousAppointments": 3,
    "requiresManagerApproval": true
  },
  "version": "2.0.0",
  "changeLog": "Añadida aprobación de manager y aumentado límite"
}
```

#### Negocio Buscando Plantillas por Categoría
```bash
GET http://localhost:3001/api/rule-templates/business/rule-templates/available?category=PAYMENT_POLICY&businessType=SALON&planType=PREMIUM
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
X-Subdomain: salon-bella-maria
```

#### Owner Viendo Plantillas con Filtros
```bash
GET http://localhost:3001/api/rule-templates/owner/rule-templates?active=true&category=PAYMENT_POLICY&search=pago&page=1&limit=5
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Flujo Completo de Trabajo

### Paso 1: Owner Crea Plantilla
1. Owner identifica regla común entre negocios
2. Crea plantilla con configuración base
3. Define compatibilidad con tipos de negocio y planes
4. Establece reglas de validación

### Paso 2: Negocio Descubre y Asigna
1. Negocio explora plantillas disponibles
2. Revisa compatibilidad con su tipo y plan
3. Asigna plantilla con o sin personalización
4. Activa la regla en su sistema

### Paso 3: Uso y Gestión Continua
1. Negocio utiliza regla en operaciones diarias
2. Puede personalizar valores según necesidades
3. Puede activar/desactivar temporalmente
4. Owner actualiza plantillas según feedback

### Paso 4: Sincronización y Mantenimiento
1. Owner actualiza plantillas con nuevas versiones
2. Admin sincroniza cambios con negocios
3. Se manejan conflictos con personalizaciones
4. Se genera reporte de adopción y uso

## Códigos de Error Comunes

### 400 - Bad Request
```json
{
  "success": false,
  "error": "Validation error",
  "details": {
    "ruleValue.maxDeferredAmount": "Must be between 0 and 500000",
    "businessTypes": "At least one business type is required"
  }
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "error": "Template not compatible with your business type or plan",
  "details": {
    "businessType": "CLINIC",
    "planType": "BASIC",
    "requiredBusinessTypes": ["SALON", "SPA"],
    "requiredPlanTypes": ["PREMIUM", "ENTERPRISE"]
  }
}
```

### 409 - Conflict
```json
{
  "success": false,
  "error": "Rule template already assigned to this business",
  "details": {
    "existingAssignmentId": "assignment-uuid-1",
    "assignedAt": "2024-09-12T10:00:00Z"
  }
}
```