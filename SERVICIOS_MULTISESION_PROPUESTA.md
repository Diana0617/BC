# 🔄 Sistema de Servicios Multi-Sesión y Mantenimientos

## 📊 Estructura de Base de Datos Propuesta

### 1. Tabla: `service_packages` (Paquetes de Servicio)
Agregar a la tabla `services` existente:

```javascript
// En Service model - Nuevos campos
{
  // ... campos existentes ...
  
  // NUEVO: Configuración de sesiones
  isPackage: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Indica si es un servicio con múltiples sesiones'
  },
  
  packageType: {
    type: DataTypes.ENUM('SINGLE', 'MULTI_SESSION', 'WITH_MAINTENANCE'),
    defaultValue: 'SINGLE',
    comment: 'Tipo de paquete: sesión única, múltiples sesiones, o con mantenimientos'
  },
  
  packageConfig: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: null,
    comment: 'Configuración del paquete',
    /* Ejemplo de estructura:
    {
      // Para MULTI_SESSION
      totalSessions: 3,
      sessionInterval: 7, // días entre sesiones
      sessionDuration: 60, // minutos por sesión (puede variar)
      sessionsConfig: [
        { sessionNumber: 1, name: 'Sesión inicial', duration: 90 },
        { sessionNumber: 2, name: 'Sesión intermedia', duration: 60 },
        { sessionNumber: 3, name: 'Sesión final', duration: 60 }
      ],
      
      // Para WITH_MAINTENANCE
      initialSession: {
        name: 'Procedimiento inicial',
        duration: 120
      },
      maintenanceSessions: {
        frequency: 'MONTHLY', // WEEKLY, BIWEEKLY, MONTHLY, QUARTERLY
        frequencyDays: 30,
        duration: 45,
        recommendedCount: 6, // mantenimientos recomendados
        name: 'Mantenimiento'
      }
    }
    */
  },
  
  // Precio total del paquete completo
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Precio total del paquete completo (suma de todas las sesiones)'
  },
  
  // Permitir pago parcial por sesión
  allowPartialPayment: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Permite pagar cada sesión por separado'
  },
  
  pricePerSession: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Precio individual por sesión (si se permite pago parcial)'
  }
}
```

### 2. Nueva Tabla: `treatment_plans` (Planes de Tratamiento)
Registra cuando un cliente inicia un paquete:

```javascript
const TreatmentPlan = sequelize.define('TreatmentPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'clients', key: 'id' }
  },
  
  serviceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'services', key: 'id' },
    comment: 'Servicio/paquete del tratamiento'
  },
  
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'businesses', key: 'id' }
  },
  
  specialistId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' },
    comment: 'Especialista asignado (opcional, puede variar por sesión)'
  },
  
  planType: {
    type: DataTypes.ENUM('MULTI_SESSION', 'WITH_MAINTENANCE'),
    allowNull: false
  },
  
  status: {
    type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'CANCELLED', 'PAUSED'),
    defaultValue: 'ACTIVE'
  },
  
  // Progreso
  totalSessions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Total de sesiones del plan'
  },
  
  completedSessions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Sesiones completadas'
  },
  
  // Precio y pagos
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Precio total del tratamiento'
  },
  
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Monto pagado hasta ahora'
  },
  
  paymentPlan: {
    type: DataTypes.ENUM('FULL_UPFRONT', 'PER_SESSION', 'INSTALLMENTS'),
    defaultValue: 'FULL_UPFRONT',
    comment: 'Modalidad de pago'
  },
  
  // Fechas
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha de inicio del plan'
  },
  
  expectedEndDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha estimada de finalización'
  },
  
  actualEndDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha real de finalización'
  },
  
  // Metadata
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  config: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Configuración específica del plan',
    /* Ejemplo:
    {
      sessionInterval: 7,
      autoScheduleNextSession: true,
      sendReminders: true,
      customSchedule: [
        { sessionNumber: 1, scheduledDate: '2025-10-20' },
        { sessionNumber: 2, scheduledDate: '2025-10-27' }
      ]
    }
    */
  }
}, {
  tableName: 'treatment_plans',
  timestamps: true
});
```

### 3. Nueva Tabla: `treatment_sessions` (Sesiones del Tratamiento)
Cada sesión individual dentro del plan:

```javascript
const TreatmentSession = sequelize.define('TreatmentSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  treatmentPlanId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'treatment_plans', key: 'id' }
  },
  
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'appointments', key: 'id' },
    comment: 'Cita asociada (null si aún no está agendada)'
  },
  
  sessionNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Número de sesión (1, 2, 3...)'
  },
  
  sessionType: {
    type: DataTypes.ENUM('INITIAL', 'INTERMEDIATE', 'FINAL', 'MAINTENANCE'),
    allowNull: false
  },
  
  name: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Nombre descriptivo (ej: "Sesión inicial", "Mantenimiento 1")'
  },
  
  status: {
    type: DataTypes.ENUM('PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'),
    defaultValue: 'PENDING'
  },
  
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha programada para esta sesión'
  },
  
  completedDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha en que se completó'
  },
  
  // Precio de esta sesión específica
  sessionPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Precio de esta sesión (si se paga por separado)'
  },
  
  isPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Notas específicas de la sesión
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  specialistNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas del especialista sobre esta sesión'
  },
  
  // Evidencia (fotos antes/después)
  evidence: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Fotos y documentación de la sesión'
  },
  
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Orden de ejecución'
  }
}, {
  tableName: 'treatment_sessions',
  timestamps: true,
  indexes: [
    { fields: ['treatmentPlanId', 'sessionNumber'], unique: true }
  ]
});
```

## 🔄 Flujo de Trabajo

### Escenario 1: Servicio Multi-Sesión (ej: Tratamiento de Keratina - 3 sesiones)

#### 1. Crear el Servicio
```javascript
POST /api/services
{
  "name": "Tratamiento de Keratina Completo",
  "description": "Tratamiento profesional en 3 sesiones",
  "category": "Tratamientos Capilares",
  "isPackage": true,
  "packageType": "MULTI_SESSION",
  "totalPrice": 450000, // Precio total del paquete
  "allowPartialPayment": true,
  "pricePerSession": 150000, // Precio por sesión individual
  "packageConfig": {
    "totalSessions": 3,
    "sessionInterval": 7, // 1 semana entre sesiones
    "sessionsConfig": [
      {
        "sessionNumber": 1,
        "name": "Sesión Inicial - Preparación",
        "duration": 120,
        "type": "INITIAL"
      },
      {
        "sessionNumber": 2,
        "name": "Sesión Intermedia - Aplicación",
        "duration": 90,
        "type": "INTERMEDIATE"
      },
      {
        "sessionNumber": 3,
        "name": "Sesión Final - Sellado",
        "duration": 90,
        "type": "FINAL"
      }
    ]
  }
}
```

#### 2. Cliente Agenda el Paquete
```javascript
POST /api/treatment-plans
{
  "clientId": "uuid-client",
  "serviceId": "uuid-servicio-keratina",
  "specialistId": "uuid-specialist",
  "paymentPlan": "PER_SESSION", // o "FULL_UPFRONT"
  "startDate": "2025-10-25T10:00:00",
  "config": {
    "sessionInterval": 7,
    "autoScheduleNextSession": false // El cliente agenda manualmente cada sesión
  }
}
```

**Backend crea automáticamente:**
- 1 `TreatmentPlan`
- 3 `TreatmentSession` (PENDING)
- 1 `Appointment` para la primera sesión (si se especifica fecha)

#### 3. Cliente Completa Primera Sesión
```javascript
PATCH /api/appointments/:appointmentId/complete

// Backend automáticamente:
// 1. Marca TreatmentSession como COMPLETED
// 2. Actualiza TreatmentPlan.completedSessions
// 3. Registra pago de esa sesión
// 4. Sugiere fecha para próxima sesión (startDate + 7 días)
```

### Escenario 2: Servicio con Mantenimientos (ej: Depilación Láser)

#### 1. Crear el Servicio
```javascript
POST /api/services
{
  "name": "Depilación Láser + Mantenimientos",
  "description": "Sesión completa + 6 mantenimientos mensuales",
  "category": "Depilación",
  "isPackage": true,
  "packageType": "WITH_MAINTENANCE",
  "totalPrice": 800000,
  "allowPartialPayment": true,
  "packageConfig": {
    "initialSession": {
      "name": "Procedimiento Completo",
      "duration": 120,
      "price": 500000
    },
    "maintenanceSessions": {
      "frequency": "MONTHLY",
      "frequencyDays": 30,
      "duration": 45,
      "recommendedCount": 6,
      "pricePerSession": 50000,
      "name": "Mantenimiento"
    }
  }
}
```

#### 2. Cliente Agenda
```javascript
POST /api/treatment-plans
{
  "clientId": "uuid-client",
  "serviceId": "uuid-depilacion-laser",
  "planType": "WITH_MAINTENANCE",
  "paymentPlan": "INSTALLMENTS", // Paga inicial + mantenimientos
  "startDate": "2025-10-25T15:00:00",
  "config": {
    "maintenanceCount": 6,
    "autoScheduleMaintenance": false
  }
}
```

**Backend crea:**
- 1 `TreatmentPlan`
- 1 `TreatmentSession` (INITIAL) → vinculada a Appointment
- 6 `TreatmentSession` (MAINTENANCE, PENDING)

## 📱 Interfaz de Usuario

### Vista para el Cliente en Agenda

```
┌─────────────────────────────────────────────┐
│ 📦 Tratamiento de Keratina Completo         │
│                                             │
│ Progreso: 1/3 sesiones completadas ████░░░  │
│ Precio: $450,000 | Pagado: $150,000        │
│                                             │
│ ✅ Sesión 1: Preparación - 25/Oct/2025     │
│ 📅 Sesión 2: Aplicación - Agendar          │
│ ⏳ Sesión 3: Sellado - Pendiente           │
│                                             │
│ [Ver Detalles] [Agendar Próxima]          │
└─────────────────────────────────────────────┘
```

### Vista para el Especialista

```
┌─────────────────────────────────────────────┐
│ Cliente: María González                     │
│ Tratamiento: Depilación Láser               │
│                                             │
│ Progreso: 3/7 sesiones (43%)               │
│                                             │
│ ✅ Procedimiento Inicial - 01/Sep/2025     │
│ ✅ Mantenimiento 1 - 01/Oct/2025           │
│ ✅ Mantenimiento 2 - 01/Nov/2025           │
│ 📅 Mantenimiento 3 - HOY 15:00             │
│ ⏳ Mantenimiento 4 - Sugerido: 01/Dic      │
│                                             │
│ [Ver Historial] [Agendar Siguiente]       │
└─────────────────────────────────────────────┘
```

## 🔌 Endpoints de API

```javascript
// ============================================
// PLANES DE TRATAMIENTO (Paquetes Multi-Sesión)
// ============================================

POST   /api/treatment-plans                          // Crear plan de tratamiento
GET    /api/treatment-plans                          // Listar planes activos
GET    /api/treatment-plans/:id                      // Detalle del plan específico
PATCH  /api/treatment-plans/:id                      // Actualizar plan
DELETE /api/treatment-plans/:id                      // Cancelar plan

// SESIONES DE UN TRATAMIENTO ESPECÍFICO
POST   /api/treatment-plans/:planId/sessions         // Agendar siguiente sesión del plan
GET    /api/treatment-plans/:planId/sessions         // Listar sesiones de ESTE plan
PATCH  /api/treatment-sessions/:sessionId/status     // Actualizar estado de sesión
POST   /api/treatment-sessions/:sessionId/reschedule // Reprogramar sesión

// ============================================
// HISTORIAL GENERAL DEL CLIENTE (Ya existe)
// ============================================

GET    /api/business/:bizId/clients/:clientId        // Detalle del cliente
// Retorna:
// - client: datos del cliente
// - appointments: TODAS las citas (completadas, canceladas, etc.)
// - vouchers: bonos y paquetes
// - blockHistory: historial de bloqueos
// - treatmentPlans: TODOS los planes de tratamiento del cliente (NUEVO)

// TRATAMIENTOS DEL CLIENTE (Filtrados por tipo)
GET    /api/clients/:clientId/treatment-plans        // Planes de tratamiento del cliente
GET    /api/clients/:clientId/active-treatments      // Solo tratamientos activos
GET    /api/clients/:clientId/completed-treatments   // Solo tratamientos completados

// ESTADÍSTICAS
GET    /api/specialists/me/active-treatments         // Tratamientos activos del especialista
GET    /api/business/:bizId/treatment-stats          // Estadísticas de tratamientos
```

## 💡 Ventajas de esta Solución

✅ **Flexibilidad**: Soporta múltiples tipos de paquetes
✅ **Trackeo completo**: Historial detallado por sesión
✅ **Pagos flexibles**: Permite pago completo o parcial
✅ **Automatización**: Puede sugerir fechas automáticamente
✅ **Reportes**: Fácil generar reportes de progreso
✅ **Escalable**: Fácil agregar nuevos tipos de paquetes

---

## 📚 Diferencia: Historial del Tratamiento vs Historial del Cliente

### 🔄 Historial del TRATAMIENTO (Nuevo - Específico)
```
TreatmentPlan: "Tratamiento de Keratina"
├── Session 1: ✅ Completada - 20/Oct/2025
├── Session 2: 📅 Agendada - 27/Oct/2025  
└── Session 3: ⏳ Pendiente

Muestra: Progreso de UN servicio multi-sesión específico
Usado en: Vista del plan de tratamiento activo
```

### 📋 Historial del CLIENTE (Existente - General)
```
Cliente: María González
├── 01/Sep/2025: Depilación Láser (Sesión inicial) - ✅
├── 15/Sep/2025: Corte de Cabello - ✅
├── 01/Oct/2025: Depilación Láser (Mantenimiento 1) - ✅
├── 20/Oct/2025: Tratamiento Keratina (Sesión 1) - ✅
├── 25/Oct/2025: Manicure - ✅
└── 27/Oct/2025: Tratamiento Keratina (Sesión 2) - 📅

Muestra: TODAS las citas del cliente (servicios simples + sesiones de tratamientos)
Usado en: Perfil del cliente, historial general
```

### 🔗 Relación
- Cada `TreatmentSession` crea una `Appointment`
- El historial del cliente incluye TODAS las appointments
- Pero puedes filtrar por `treatmentPlanId` para ver solo un tratamiento específico

### 📱 Ejemplo en la UI del Cliente

**Vista: Historial General del Cliente**
```
┌─────────────────────────────────────────────┐
│ 📋 Historial de María González              │
├─────────────────────────────────────────────┤
│ 📦 Tratamientos Activos (2)                 │
│   • Keratina Completa - 1/3 sesiones        │
│   • Depilación Láser - 3/7 sesiones         │
│                                             │
│ 📅 Todas las Citas (15)                     │
│   • 27 Oct - Keratina Sesión 2              │
│   • 25 Oct - Manicure                       │
│   • 20 Oct - Keratina Sesión 1              │
│   • 01 Oct - Depilación Mantenimiento       │
│   • 15 Sep - Corte                          │
│   ...                                       │
└─────────────────────────────────────────────┘
```

**Vista: Detalle de UN Tratamiento**
```
┌─────────────────────────────────────────────┐
│ 🔄 Tratamiento de Keratina Completo         │
├─────────────────────────────────────────────┤
│ Cliente: María González                     │
│ Progreso: 1/3 sesiones (33%) ███░░░░░       │
│ Precio: $450,000 | Pagado: $150,000        │
│                                             │
│ SESIONES DEL TRATAMIENTO:                   │
│                                             │
│ ✅ Sesión 1: Preparación                   │
│    20/Oct/2025 10:00 - Completada          │
│    💵 Pagado: $150,000                     │
│    📝 Notas: "Cliente satisfecha"          │
│    📸 2 fotos                               │
│                                             │
│ 📅 Sesión 2: Aplicación                    │
│    27/Oct/2025 10:00 - Agendada            │
│    💵 Pendiente: $150,000                  │
│                                             │
│ ⏳ Sesión 3: Sellado                       │
│    Pendiente de agendar                     │
│    💡 Sugerido: 03/Nov/2025                │
│                                             │
│ [Agendar Siguiente] [Ver Galería]         │
└─────────────────────────────────────────────┘
```

---

## 🎯 Próximos Pasos

¿Quieres que implemente esta solución? Puedo:

1. **Crear las migraciones** de base de datos
2. **Actualizar el modelo Service** con los nuevos campos
3. **Crear los modelos** TreatmentPlan y TreatmentSession
4. **Implementar los controladores** y endpoints
5. **Crear los componentes React** para la UI

¿Por dónde empezamos? 🚀
