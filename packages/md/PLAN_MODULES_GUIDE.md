# Guía: Asociación de Módulos en Planes de Suscripción

## Resumen
El sistema Beauty Control permite asociar módulos específicos a cada plan de suscripción a través de la tabla intermedia `PlanModule`. Esto te permite controlar exactamente qué funcionalidades incluye cada plan y cómo se comportan.

## Workflow para Crear un Plan Completo

1. **Crear los módulos necesarios** (si no existen):
   ```
   POST /api/modules
   ```

2. **Obtener módulos disponibles**:
   ```
   GET /api/modules
   ```

3. **Crear el plan** con la configuración de módulos:
   ```
   POST /api/owner/plans
   ```

4. **Verificar el plan creado** (incluirá los módulos asociados):
   ```
   GET /api/owner/plans/{planId}
   ```

## Estructura del Body para Crear Plan con Módulos

```json
{
  "name": "Plan Premium",
  "description": "Plan completo con todas las funcionalidades",
  "price": 89900,
  "currency": "COP",
  "duration": 1,
  "durationType": "MONTHS",
  "maxUsers": 10,
  "maxClients": 500,
  "maxAppointments": 1000,
  "storageLimit": 5368709120,
  "trialDays": 7,
  "features": {
    "advancedReports": true,
    "multiLocation": true,
    "customBranding": true
  },
  "limitations": {},
  "isPopular": true,
  "modules": [
    {
      "moduleId": "appointment-booking-uuid",
      "isIncluded": true,
      "limitQuantity": null,
      "additionalPrice": 0,
      "configuration": {
        "allowOnlineBooking": true,
        "advanceBookingDays": 60
      }
    },
    {
      "moduleId": "client-management-uuid",
      "isIncluded": true,
      "limitQuantity": 500,
      "additionalPrice": 0,
      "configuration": {
        "maxClients": 500,
        "allowExport": true
      }
    },
    {
      "moduleId": "inventory-management-uuid",
      "isIncluded": false,
      "limitQuantity": null,
      "additionalPrice": 15000,
      "configuration": {}
    }
  ]
}
```

## Campos del Array `modules`

### `moduleId` (requerido)
- **Tipo**: `string`
- **Descripción**: UUID del módulo que quieres asociar al plan
- **Obtener IDs**: Usa el endpoint `GET /api/modules` para obtener la lista de módulos disponibles

### `isIncluded` (opcional, default: `true`)
- **Tipo**: `boolean`
- **Descripción**: Indica si el módulo está incluido en el plan
- **Valores**:
  - `true`: El módulo está incluido sin costo adicional
  - `false`: El módulo está disponible como addon por precio adicional

### `limitQuantity` (opcional, default: `null`)
- **Tipo**: `number | null`
- **Descripción**: Límite de cantidad para funciones específicas del módulo
- **Ejemplos**:
  - `null`: Sin límite
  - `100`: Máximo 100 clientes si es el módulo de gestión de clientes
  - `50`: Máximo 50 citas por mes si es el módulo de citas

### `additionalPrice` (opcional, default: `0`)
- **Tipo**: `number`
- **Descripción**: Precio adicional por el módulo (útil cuando `isIncluded: false`)
- **Formato**: Precio en centavos (ej: `15000` = $150.00 COP)

### `configuration` (opcional, default: `{}`)
- **Tipo**: `object`
- **Descripción**: Configuración específica del módulo para este plan
- **Ejemplos**:
  ```json
  {
    "maxClients": 500,
    "allowExport": true,
    "reportTypes": ["basic", "advanced"]
  }
  ```

## Notas Importantes

- Los `moduleId` deben existir en la base de datos, de lo contrario obtendrás un error 400
- Si no incluyes el array `modules`, el plan se creará sin módulos asociados
- Puedes agregar/quitar módulos después usando el endpoint de actualización de planes
- La respuesta del plan creado incluirá los módulos asociados con toda su configuración
- Los módulos CORE suelen ser gratuitos y estar incluidos en todos los planes
- Los módulos PREMIUM pueden tener costo adicional o requerir planes específicos

## Endpoints Relacionados

- `GET /api/modules` - Listar todos los módulos disponibles
- `POST /api/modules` - Crear nuevo módulo (Solo OWNER)
- `POST /api/owner/plans` - Crear plan con módulos
- `GET /api/owner/plans/{id}` - Ver plan con sus módulos
- `PUT /api/owner/plans/{id}` - Actualizar plan (incluyendo módulos)

## Comandos Útiles

### Inicializar módulos base:
```bash
node scripts/seed-modules.js
```

### Inicializar planes con módulos:
```bash
node scripts/seed-plans.js
```

## Ejemplos de Uso

### Plan Básico
```json
{
  "name": "Plan Básico",
  "description": "Plan inicial para salones pequeños",
  "price": 29900,
  "currency": "COP",
  "duration": 1,
  "durationType": "MONTHS",
  "maxUsers": 3,
  "maxClients": 100,
  "maxAppointments": 200,
  "modules": [
    {
      "moduleId": "appointment-booking-uuid",
      "isIncluded": true,
      "limitQuantity": 200,
      "configuration": {
        "allowOnlineBooking": false,
        "advanceBookingDays": 15
      }
    },
    {
      "moduleId": "client-management-uuid",
      "isIncluded": true,
      "limitQuantity": 100,
      "configuration": {
        "maxClients": 100,
        "allowExport": false
      }
    },
    {
      "moduleId": "financial-reports-uuid",
      "isIncluded": false,
      "additionalPrice": 10000,
      "configuration": {
        "reportTypes": ["basic"]
      }
    }
  ]
}
```

### Plan Premium
```json
{
  "name": "Plan Premium",
  "description": "Plan completo para salones establecidos",
  "price": 89900,
  "currency": "COP",
  "duration": 1,
  "durationType": "MONTHS",
  "maxUsers": 10,
  "maxClients": 1000,
  "maxAppointments": null,
  "modules": [
    {
      "moduleId": "appointment-booking-uuid",
      "isIncluded": true,
      "limitQuantity": null,
      "configuration": {
        "allowOnlineBooking": true,
        "advanceBookingDays": 60,
        "requiresConfirmation": true
      }
    },
    {
      "moduleId": "appointment-reminders-uuid",
      "isIncluded": true,
      "configuration": {
        "emailReminders": true,
        "smsReminders": true,
        "reminderHoursBefore": 24
      }
    },
    {
      "moduleId": "client-management-uuid",
      "isIncluded": true,
      "limitQuantity": null,
      "configuration": {
        "maxClients": 1000,
        "allowExport": true,
        "advancedProfiles": true
      }
    },
    {
      "moduleId": "financial-reports-uuid",
      "isIncluded": true,
      "configuration": {
        "reportTypes": ["basic", "advanced", "custom"],
        "autoExport": true
      }
    },
    {
      "moduleId": "inventory-management-uuid",
      "isIncluded": true,
      "configuration": {
        "trackStock": true,
        "lowStockAlerts": true
      }
    }
  ]
}
```

### Plan Enterprise
```json
{
  "name": "Plan Enterprise",
  "description": "Plan para cadenas de salones",
  "price": 149900,
  "currency": "COP",
  "duration": 1,
  "durationType": "MONTHS",
  "maxUsers": null,
  "maxClients": null,
  "maxAppointments": null,
  "modules": [
    {
      "moduleId": "appointment-booking-uuid",
      "isIncluded": true,
      "limitQuantity": null,
      "configuration": {
        "allowOnlineBooking": true,
        "advanceBookingDays": 90,
        "multiLocation": true
      }
    },
    {
      "moduleId": "appointment-reminders-uuid",
      "isIncluded": true,
      "configuration": {
        "emailReminders": true,
        "smsReminders": true,
        "whatsappReminders": true
      }
    },
    {
      "moduleId": "advanced-scheduling-uuid",
      "isIncluded": true,
      "configuration": {
        "resourceManagement": true,
        "staffScheduling": true,
        "multiServiceBooking": true
      }
    },
    {
      "moduleId": "multi-location-uuid",
      "isIncluded": true,
      "configuration": {
        "maxLocations": 10,
        "centralizedReporting": true
      }
    },
    {
      "moduleId": "api-access-uuid",
      "isIncluded": true,
      "configuration": {
        "rateLimit": 10000,
        "webhooks": true
      }
    }
  ]
}
```

## Módulos Disponibles en el Sistema

### Módulos CORE (Gratuitos)
- `authentication` - Sistema de autenticación
- `dashboard` - Panel de control principal
- `user-management` - Gestión de usuarios

### Módulos de CITAS
- `appointment-booking` - Reserva básica de citas
- `appointment-reminders` - Recordatorios automáticos
- `advanced-scheduling` - Programación avanzada
- `online-booking` - Reservas online

### Módulos de CLIENTES  
- `client-management` - Gestión básica de clientes
- `client-history` - Historial de servicios
- `client-loyalty` - Programa de fidelización

### Módulos FINANCIEROS
- `payment-processing` - Procesamiento de pagos
- `financial-reports` - Reportes financieros
- `inventory-management` - Gestión de inventario
- `commission-tracking` - Seguimiento de comisiones

### Módulos PREMIUM
- `multi-location` - Multi-sucursales
- `api-access` - Acceso a API
- `custom-branding` - Marca personalizada
- `advanced-analytics` - Analytics avanzados

## Campos del Array `modules`