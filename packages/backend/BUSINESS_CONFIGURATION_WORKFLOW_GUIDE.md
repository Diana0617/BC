# Business Configuration Workflow Guide

## Guía Completa de Configuración de Negocios Post-Creación

Esta guía proporciona un flujo paso a paso para configurar un negocio después de su creación, incluyendo especialistas, servicios, reglas de negocio, horarios y configuración de pagos.

## Índice

1. [Configuración de Reglas de Negocio](#1-configuración-de-reglas-de-negocio)
2. [Gestión de Especialistas](#2-gestión-de-especialistas)
3. [Gestión de Servicios](#3-gestión-de-servicios)
4. [Configuración de Horarios](#4-configuración-de-horarios)
5. [Gestión de Slots de Tiempo](#5-gestión-de-slots-de-tiempo)
6. [Configuración de Pagos](#6-configuración-de-pagos)
7. [Gestión de Inventario y Proveedores](#7-gestión-de-inventario-y-proveedores)
8. [Testing con Insomnia](#8-testing-con-insomnia)

---

## Prerrequisitos

- Tener un negocio creado con un usuario BUSINESS o OWNER
- Token de autenticación válido
- `businessId` del negocio a configurar

### Headers Requeridos para Todas las Requests

```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

---

## 1. Configuración de Reglas de Negocio

> **⚠️ Importante**: Existen DOS sistemas de reglas en BC:
> 1. **Business Rules Básicas** - Configuración directa (este endpoint)
> 2. **Rule Templates** - Sistema avanzado con plantillas del Owner

### 1.1 Obtener Reglas Básicas del Negocio

**GET** `/api/business/{businessId}/config/rules`

> **Nota**: Si es la primera vez que se consultan, se crean automáticamente con valores predeterminados.

```json
// Response
{
  "success": true,
  "data": {
    "id": "business-rules-uuid",
    "businessId": "business-uuid",
    "appointmentCancellation": {
      "enabled": true,
      "hoursBeforeAppointment": 24,
      "allowedReasons": ["emergency", "illness", "personal"],
      "penaltyFee": 0,
      "autoRefundOnCancel": false,
      "createVoucherOnCancel": true,
      "cancellationPolicy": "Política de cancelaciones del negocio"
    },
    "workingHours": {
      "enabled": true,
      "schedule": {
        "monday": { "enabled": true, "shifts": [...] },
        "tuesday": { "enabled": true, "shifts": [...] },
        // ... otros días
        "sunday": { "enabled": false, "shifts": [] }
      },
      "timezone": "America/Bogota"
    },
    "appointmentConfirmation": {
      "enabled": true,
      "autoConfirm": false,
      "confirmationWindow": 2,
      "reminderSettings": {
        "enabled": true,
        "reminderTimes": [24, 2],
        "methods": ["email", "sms"]
      }
    },
    "paymentPolicy": {
      "enabled": true,
      "allowCloseWithoutPayment": false,
      "requiresManagerApproval": true,
      "allowPartialPayments": true,
      "defaultPaymentMethod": "CASH"
    }
  }
}
```

### 1.2 Actualizar Reglas Básicas del Negocio

**PUT** `/api/business/{businessId}/config/rules`

> **Nota**: Este endpoint actualiza directamente las reglas del negocio. Para un sistema más avanzado con plantillas del Owner, usar el sistema de Rule Templates.

```json
{
  "appointmentCancellation": {
    "enabled": true,
    "hoursBeforeAppointment": 24,
    "allowedReasons": ["emergency", "illness", "personal"],
    "penaltyFee": 5000,
    "autoRefundOnCancel": false,
    "createVoucherOnCancel": true,
    "cancellationPolicy": "Política de cancelaciones actualizada"
  },
  "workingHours": {
    "enabled": true,
    "schedule": {
      "monday": {
        "enabled": true,
        "shifts": [
          {
            "start": "09:00",
            "end": "18:00",
            "breakStart": "12:00",
            "breakEnd": "13:00"
          }
        ]
      },
      "tuesday": {
        "enabled": true,
        "shifts": [
          {
            "start": "09:00",
            "end": "18:00",
            "breakStart": "12:00",
            "breakEnd": "13:00"
          }
        ]
      },
      // ... configurar todos los días
      "sunday": {
        "enabled": false,
        "shifts": []
      }
    },
    "timezone": "America/Bogota"
  },
  "appointmentConfirmation": {
    "enabled": true,
    "autoConfirm": false,
    "confirmationWindow": 2,
    "reminderSettings": {
      "enabled": true,
      "reminderTimes": [24, 2],
      "methods": ["email", "sms"]
    }
  },
  "paymentPolicy": {
    "enabled": true,
    "allowCloseWithoutPayment": false,
    "requiresManagerApproval": true,
    "allowPartialPayments": true,
    "defaultPaymentMethod": "CASH"
  }
}
```

### 1.3 Sistema Avanzado de Rule Templates (Opcional)

Si quieres usar el sistema avanzado donde el **Owner de BC** crea plantillas que los negocios pueden asignar:

#### 1.3.1 Owner Crea Plantillas de Reglas

**POST** `/api/rule-templates/owner/rule-templates`

> **Solo usuarios con rol OWNER pueden crear plantillas**

```json
{
  "name": "Cierre sin comprobante de pago",
  "description": "Permite cerrar citas sin validar el pago",
  "category": "PAYMENT_POLICY",
  "ruleKey": "allowCloseWithoutPayment",
  "ruleValue": {
    "enabled": false,
    "requiresManagerApproval": true,
    "maxAmount": 50000
  },
  "businessTypes": ["SALON", "SPA", "CLINIC"],
  "planTypes": ["PREMIUM", "ENTERPRISE"],
  "tags": ["payment", "closure", "validation"],
  "allowCustomization": true,
  "isDefault": false,
  "priority": 100
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

#### 1.3.2 Owner Gestiona Sus Plantillas

**GET** `/api/rule-templates/owner/rule-templates`

**Query Parameters:**
- `category` (opcional): Filtrar por categoría
- `active` (opcional): Solo plantillas activas (true/false)
- `businessType` (opcional): Filtrar por tipo de negocio
- `search` (opcional): Búsqueda por nombre o descripción

**PUT** `/api/rule-templates/owner/rule-templates/{templateId}`

#### 1.3.3 Ver Plantillas Disponibles (Business)
**GET** `/api/rule-templates/business/rule-templates/available`

#### 1.3.4 Asignar Plantilla al Negocio
**POST** `/api/rule-templates/business/rule-templates/{templateId}/assign`

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

#### 1.3.5 Ver Reglas Asignadas desde Plantillas
**GET** `/api/rule-templates/business/rule-assignments`

> **Para más detalles del sistema de Rule Templates**, consulta: `RULE_TEMPLATES_API.md` y `RULE_TEMPLATES_EXAMPLES.md`

---

## 2. Gestión de Especialistas

### 2.1 Obtener Especialistas del Negocio

**GET** `/api/business/{businessId}/config/specialists`

**Query Parameters:**
- `includeInactive` (boolean): Incluir especialistas inactivos
- `serviceId` (UUID): Filtrar por servicio específico

### 2.2 Crear Nuevo Especialista

**POST** `/api/business/{businessId}/config/specialists`

```json
{
  "email": "especialista@ejemplo.com",
  "firstName": "Ana",
  "lastName": "García",
  "phone": "+57300123456",
  "specialties": ["manicure", "pedicure", "uñas_gel"],
  "certification": "Certificación en belleza y estética",
  "experience": "5 años de experiencia",
  "bio": "Especialista en cuidado de uñas con amplia experiencia",
  "profileImage": "https://ejemplo.com/imagen.jpg",
  "schedule": {
    "monday": {
      "isWorkingDay": true,
      "shifts": [
        {
          "startTime": "09:00",
          "endTime": "12:00"
        },
        {
          "startTime": "14:00",
          "endTime": "18:00"
        }
      ]
    },
    "tuesday": {
      "isWorkingDay": true,
      "shifts": [
        {
          "startTime": "09:00",
          "endTime": "12:00"
        },
        {
          "startTime": "14:00",
          "endTime": "18:00"
        }
      ]
    },
    // ... configurar todos los días
    "sunday": {
      "isWorkingDay": false,
      "shifts": []
    }
  },
  "isActive": true
}
```

### 2.3 Actualizar Especialista

**PUT** `/api/business/{businessId}/config/specialists/{specialistId}`

```json
{
  "specialties": ["manicure", "pedicure", "uñas_gel", "nail_art"],
  "certification": "Certificación actualizada en nail art",
  "experience": "6 años de experiencia",
  "bio": "Especialista en cuidado de uñas y nail art",
  "schedule": {
    // ... nuevo horario si es necesario
  }
}
```

### 2.4 Desactivar Especialista

**DELETE** `/api/business/{businessId}/config/specialists/{specialistId}`

---

## 3. Gestión de Servicios

### 3.1 Obtener Servicios del Negocio

**GET** `/api/business/{businessId}/config/services`

**Query Parameters:**
- `category` (string): Filtrar por categoría
- `isActive` (boolean): Filtrar por estado activo/inactivo
- `specialistId` (UUID): Servicios de un especialista específico

### 3.2 Crear Nuevo Servicio

**POST** `/api/business/{businessId}/config/services`

```json
{
  "name": "Manicure Clásico",
  "description": "Manicure tradicional con esmaltado clásico",
  "category": "NAILS",
  "subcategory": "manicure",
  "duration": 60,
  "price": 25000,
  "currency": "COP",
  "requiresConsent": false,
  "consentTemplate": "",
  "color": "#FF6B9D",
  "preparationTime": 5,
  "cleanupTime": 10,
  "maxConcurrent": 1,
  "requiresEquipment": ["mesa_manicure", "lampara_uv"],
  "specialistIds": ["SPECIALIST_UUID_1", "SPECIALIST_UUID_2"],
  "isActive": true,
  "metadata": {
    "difficulty": "easy",
    "seasonality": "all_year",
    "targetAudience": "general"
  }
}
```

### 3.3 Actualizar Servicio

**PUT** `/api/business/{businessId}/config/services/{serviceId}`

```json
{
  "price": 30000,
  "duration": 75,
  "description": "Manicure clásico con tratamiento hidratante incluido",
  "requiresEquipment": ["mesa_manicure", "lampara_uv", "kit_hidratacion"]
}
```

### 3.4 Desactivar Servicio

**DELETE** `/api/business/{businessId}/config/services/{serviceId}`

---

## 4. Configuración de Horarios

### 4.1 Obtener Horarios

**GET** `/api/business/{businessId}/config/schedules`

**Query Parameters:**
- `specialistId` (UUID): Horarios de un especialista específico

### 4.2 Crear Horario de Negocio (General)

**POST** `/api/business/{businessId}/config/schedules`

```json
{
  "name": "Horario General del Negocio",
  "type": "BUSINESS_DEFAULT",
  "specialistId": null,
  "isDefault": true,
  "isActive": true,
  "priority": 100,
  "weeklySchedule": {
    "monday": {
      "enabled": true,
      "shifts": [
        {
          "start": "09:00",
          "end": "18:00",
          "breakStart": "12:00",
          "breakEnd": "13:00"
        }
      ]
    },
    "tuesday": {
      "enabled": true,
      "shifts": [
        {
          "start": "09:00",
          "end": "18:00",
          "breakStart": "12:00",
          "breakEnd": "13:00"
        }
      ]
    },
    "wednesday": {
      "enabled": true,
      "shifts": [
        {
          "start": "09:00",
          "end": "18:00",
          "breakStart": "12:00",
          "breakEnd": "13:00"
        }
      ]
    },
    "thursday": {
      "enabled": true,
      "shifts": [
        {
          "start": "09:00",
          "end": "18:00",
          "breakStart": "12:00",
          "breakEnd": "13:00"
        }
      ]
    },
    "friday": {
      "enabled": true,
      "shifts": [
        {
          "start": "09:00",
          "end": "18:00",
          "breakStart": "12:00",
          "breakEnd": "13:00"
        }
      ]
    },
    "saturday": {
      "enabled": true,
      "shifts": [
        {
          "start": "09:00",
          "end": "16:00",
          "breakStart": null,
          "breakEnd": null
        }
      ]
    },
    "sunday": {
      "enabled": false,
      "shifts": []
    }
  },
  "slotDuration": 30,
  "bufferTime": 5,
  "timezone": "America/Bogota",
  "validFrom": "2024-01-01",
  "validUntil": null
}
```

### 4.3 Crear Horario Personalizado para Especialista

**POST** `/api/business/{businessId}/config/schedules`

```json
{
  "name": "Horario de Ana García",
  "type": "SPECIALIST_CUSTOM",
  "specialistId": "SPECIALIST_UUID",
  "isDefault": true,
  "isActive": true,
  "priority": 90,
  "weeklySchedule": {
    "monday": {
      "enabled": true,
      "shifts": [
        {
          "start": "10:00",
          "end": "14:00",
          "breakStart": null,
          "breakEnd": null
        },
        {
          "start": "15:00",
          "end": "19:00",
          "breakStart": null,
          "breakEnd": null
        }
      ]
    },
    // ... otros días según disponibilidad del especialista
    "sunday": {
      "enabled": false,
      "shifts": []
    }
  },
  "slotDuration": 30,
  "bufferTime": 10,
  "timezone": "America/Bogota"
}
```

### 4.4 Actualizar Horario

**PUT** `/api/business/{businessId}/config/schedules/{scheduleId}`

```json
{
  "slotDuration": 45,
  "bufferTime": 15,
  "weeklySchedule": {
    "monday": {
      "enabled": true,
      "shifts": [
        {
          "start": "08:00",
          "end": "17:00",
          "breakStart": "12:00",
          "breakEnd": "13:00"
        }
      ]
    }
    // ... actualizar días específicos
  }
}
```

### 4.5 Eliminar Horario

**DELETE** `/api/business/{businessId}/config/schedules/{scheduleId}`

> **Nota:** No se puede eliminar el horario marcado como `isDefault: true`

---

## 5. Gestión de Slots de Tiempo

### 5.1 Obtener Slots Disponibles

**GET** `/api/business/{businessId}/config/slots/available`

**Query Parameters (Requeridos):**
- `specialistId` (UUID): ID del especialista
- `date` (YYYY-MM-DD): Fecha para consultar slots

**Query Parameters (Opcionales):**
- `serviceId` (UUID): Para filtrar por compatibilidad de duración

```bash
GET /api/business/123e4567-e89b-12d3-a456-426614174000/config/slots/available?specialistId=456e7890-e89b-12d3-a456-426614174000&date=2024-01-15&serviceId=789e0123-e89b-12d3-a456-426614174000
```

### 5.2 Bloquear Slot

**POST** `/api/business/{businessId}/config/slots/{slotId}/block`

```json
{
  "reason": "Mantenimiento de equipo",
  "internalNotes": "Revisión programada de lámpara UV"
}
```

### 5.3 Desbloquear Slot

**POST** `/api/business/{businessId}/config/slots/{slotId}/unblock`

```json
{
  "reason": "Mantenimiento completado"
}
```

---

## 6. Configuración de Pagos

### 6.1 Obtener Configuración Actual

**GET** `/api/business/{businessId}/config/payments`

### 6.2 Configurar Wompi

**PUT** `/api/business/{businessId}/config/payments`

```json
{
  "provider": "wompi",
  "config": {
    "publicKey": "pub_test_your_public_key",
    "privateKey": "prv_test_your_private_key",
    "environment": "test",
    "webhookUrl": "https://your-domain.com/webhooks/wompi"
  },
  "isActive": true,
  "acceptedMethods": [
    "CARD",
    "PSE",
    "NEQUI",
    "BANCOLOMBIA_TRANSFER"
  ],
  "currency": "COP",
  "fees": {
    "fixedFee": 0,
    "percentageFee": 0.029
  }
}
```

### 6.3 Configurar Stripe

**PUT** `/api/business/{businessId}/config/payments`

```json
{
  "provider": "stripe",
  "config": {
    "publicKey": "pk_test_your_stripe_public_key",
    "secretKey": "sk_test_your_stripe_secret_key",
    "webhookSecret": "whsec_your_webhook_secret",
    "environment": "test"
  },
  "isActive": true,
  "acceptedMethods": [
    "CARD",
    "BANK_TRANSFER"
  ],
  "currency": "USD",
  "fees": {
    "fixedFee": 30,
    "percentageFee": 0.029
  }
}
```

### 6.4 Probar Configuración de Pagos

**POST** `/api/business/{businessId}/config/payments/test`

---

## 7. Gestión de Inventario y Proveedores

### 7.1 Gestión de Productos

#### Obtener Productos
**GET** `/api/business/{businessId}/config/products`

#### Crear Producto
**POST** `/api/business/{businessId}/config/products`

```json
{
  "name": "Esmalte OPI Classic Red",
  "description": "Esmalte de uñas color rojo clásico",
  "category": "SUPPLIES",
  "subcategory": "nail_polish",
  "sku": "OPI-CR-001",
  "barcode": "123456789012",
  "brand": "OPI",
  "unitPrice": 15000,
  "currency": "COP",
  "unit": "bottle",
  "minStock": 5,
  "maxStock": 50,
  "currentStock": 20,
  "isActive": true,
  "metadata": {
    "color": "#FF0000",
    "volume": "15ml",
    "finish": "glossy"
  }
}
```

### 7.2 Gestión de Proveedores

#### Obtener Proveedores
**GET** `/api/business/{businessId}/config/suppliers`

#### Crear Proveedor
**POST** `/api/business/{businessId}/config/suppliers`

```json
{
  "name": "Beauty Supply Co.",
  "legalName": "Beauty Supply Company S.A.S.",
  "taxId": "900123456-7",
  "type": "DISTRIBUTOR",
  "category": "BEAUTY_SUPPLIES",
  "address": {
    "street": "Calle 123 #45-67",
    "city": "Bogotá",
    "state": "Cundinamarca",
    "country": "Colombia",
    "zipCode": "110111"
  },
  "paymentTerms": "NET_30",
  "currency": "COP",
  "isActive": true,
  "contacts": [
    {
      "name": "María González",
      "role": "Sales Manager",
      "email": "maria@beautysupply.com",
      "phone": "+57312345678",
      "isPrimary": true
    }
  ]
}
```

---

## 8. Testing con Insomnia

### 8.1 Configuración del Environment

Crear un environment en Insomnia con las siguientes variables:

```json
{
  "base_url": "http://localhost:3000",
  "business_id": "YOUR_BUSINESS_UUID",
  "auth_token": "YOUR_JWT_TOKEN",
  "owner_token": "OWNER_JWT_TOKEN",
  "specialist_id": "SPECIALIST_UUID",
  "service_id": "SERVICE_UUID",
  "schedule_id": "SCHEDULE_UUID",
  "template_id": "RULE_TEMPLATE_UUID"
}
```

### 8.2 Orden de Testing Recomendado

#### Para Testing Básico (Reglas Simples):
1. **Autenticación** - Obtener token JWT como usuario BUSINESS/OWNER
2. **Configuración de Reglas Básicas** - GET y PUT en `/config/rules`
3. **Crear Especialistas** - Agregar al menos 2 especialistas
4. **Crear Servicios** - Agregar servicios que ofrecerán los especialistas
5. **Configurar Horarios** - Crear horario general y horarios específicos
6. **Verificar Slots** - Confirmar que se generan slots de tiempo correctamente
7. **Configurar Pagos** - Establecer método de pago (Wompi o Stripe)
8. **Gestión de Inventario** - Agregar productos y proveedores si es necesario

#### Para Testing Avanzado (Rule Templates):
1. **Autenticación Owner** - Token JWT como usuario OWNER
2. **Crear Plantillas** - POST en `/api/rule-templates/owner/rule-templates`
3. **Autenticación Business** - Token JWT como usuario BUSINESS
4. **Ver Plantillas Disponibles** - GET en `/rule-templates/available`
5. **Asignar Plantillas** - POST en `/rule-templates/{templateId}/assign`
6. **Continuar con especialistas, servicios, etc.**

### 8.3 Requests Base para Insomnia

#### Headers Globales
```json
{
  "Authorization": "Bearer {{ auth_token }}",
  "Content-Type": "application/json"
}
```

#### URL Base
```
{{ base_url }}/api/business/{{ business_id }}/config
```

### 8.4 Validaciones Importantes

- **Permisos**: Verificar que solo usuarios con rol BUSINESS, OWNER o SPECIALIST pueden acceder
- **Relaciones**: Confirmar que especialistas están asociados correctamente a servicios
- **Horarios**: Validar que los slots se generen según la configuración de horarios
- **Fechas**: Verificar que las fechas futuras tengan slots disponibles
- **Pagos**: Probar la configuración con transacciones de prueba

---

## 9. Troubleshooting Común

### 9.1 Error: "No tienes permisos"
- Verificar que el token JWT sea válido
- Confirmar que el usuario tenga el rol correcto (BUSINESS, OWNER, SPECIALIST)
- Validar que el `businessId` corresponda al negocio del usuario

### 9.2 Error: "Especialista no encontrado"
- Verificar que el `specialistId` existe en la base de datos
- Confirmar que el especialista pertenece al negocio correcto
- Validar que el especialista esté activo (`isActive: true`)

### 9.3 Error: "No se generaron slots"
- Verificar que el horario tenga días habilitados (`enabled: true`)
- Confirmar que los turnos estén correctamente configurados
- Validar que `slotDuration` sea mayor a 0
- Verificar que la fecha esté en el futuro

### 9.4 Error en configuración de pagos
- Verificar las credenciales del proveedor de pagos
- Confirmar que el ambiente (test/production) sea correcto
- Validar que las URLs de webhook sean accesibles

---

## 10. Notas Importantes

- Los horarios se generan automáticamente para 30 días a futuro
- Los slots de tiempo se crean automáticamente cuando se configura un horario
- Un especialista puede tener múltiples horarios, pero solo uno puede ser por defecto
- Los servicios deben estar asociados a especialistas para aparecer en las citas
- La configuración de pagos debe probarse antes de activarse en producción
- Los productos y proveedores son opcionales pero recomendados para negocios que manejan inventario

---

Esta guía proporciona el flujo completo para configurar un negocio después de su creación. Sigue el orden recomendado para garantizar que todas las dependencias estén correctamente establecidas.