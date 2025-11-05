# 🎉 Sistema de Tratamientos Multi-Sesión - Implementación Base de Datos Completa

**Fecha:** 19 de Octubre, 2025  
**Branch:** FM-28  
**Estado:** ✅ Base de datos y modelos completados

---

## 📋 Resumen de Implementación

### ✅ Completado

#### 1. **Migraciones de Base de Datos** (3 archivos)

##### **20251019000001-add-package-fields-to-services.js**
Extiende la tabla `services` para soportar paquetes multi-sesión:
- `isPackage` (BOOLEAN) - Indica si es un paquete
- `packageType` (ENUM) - SINGLE, MULTI_SESSION, WITH_MAINTENANCE
- `packageConfig` (JSONB) - Configuración flexible del paquete
- `totalPrice` (DECIMAL) - Precio total del paquete
- `allowPartialPayment` (BOOLEAN) - Permite pago por sesión
- `pricePerSession` (DECIMAL) - Precio individual por sesión

##### **20251019000002-create-treatment-plans.js**
Tabla para gestionar planes de tratamiento completos:
- Control de progreso: `totalSessions`, `completedSessions`
- Estados: ACTIVE, COMPLETED, CANCELLED, PAUSED
- Gestión de pagos: `totalPrice`, `paidAmount`, `paymentPlan`
- Fechas: `startDate`, `expectedEndDate`, `actualEndDate`
- Relaciones: clientId, serviceId, businessId, specialistId
- **5 índices** para optimizar consultas

##### **20251019000003-create-treatment-sessions.js**
Tabla para sesiones individuales dentro de un tratamiento:
- `sessionNumber` - Número correlativo (1, 2, 3...)
- `appointmentId` (nullable) - Permite sesiones pendientes sin agendar
- Estados: PENDING, SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
- Control de pago por sesión: `price`, `paid`, `paymentDate`
- `photosUrls` (JSONB) - Fotos de progreso antes/después
- **Índice único** (treatmentPlanId, sessionNumber) - Previene duplicados
- **5 índices** para optimizar consultas

**Estado:** ✅ Todas las migraciones ejecutadas exitosamente

---

#### 2. **Modelos de Sequelize** (3 archivos)

##### **TreatmentPlan.js**
Modelo completo con métodos útiles:
- `isCompleted()` - Verifica si todas las sesiones están completadas
- `getProgress()` - Retorna { completed, total, percentage }
- `getPaymentProgress()` - Retorna { paid, total, remaining, percentage }
- `canScheduleNextSession()` - Verifica si se puede agendar otra sesión

**Ejemplo de uso:**
```javascript
const plan = await TreatmentPlan.findByPk(planId);
console.log(plan.getProgress()); 
// { completed: 2, total: 3, percentage: 67 }
```

##### **TreatmentSession.js**
Modelo con métodos de control de estado:
- `isScheduled()` - Verifica si tiene turno asignado
- `isPending()` - Verifica si está pendiente de agendar
- `isCompleted()` - Verifica si fue completada
- `canSchedule()` - Verifica si se puede agendar
- `canComplete()` - Verifica si se puede marcar como completada
- `addPhoto(url)` - Agrega foto al progreso del tratamiento

**Ejemplo de uso:**
```javascript
const session = await TreatmentSession.findByPk(sessionId);
if (session.canSchedule()) {
  session.appointmentId = appointmentId;
  session.status = 'SCHEDULED';
  await session.save();
}
```

##### **Service.js (actualizado)**
Nuevos campos y métodos para paquetes:
- `isMultiSession()` - Verifica si es paquete multi-sesión
- `hasMaintenanceSessions()` - Verifica si tiene mantenimientos
- `getTotalSessions()` - Calcula total de sesiones según configuración
- `calculatePackagePrice()` - Calcula precio total del paquete

**Ejemplo de packageConfig:**
```javascript
// MULTI_SESSION (3 sesiones de keratina)
{
  sessions: 3,
  sessionInterval: 30, // días entre sesiones
  pricing: {
    perSession: 15000,
    discount: 10 // % descuento por paquete completo
  }
}

// WITH_MAINTENANCE (láser + 6 mantenimientos)
{
  maintenanceSessions: 6,
  maintenanceInterval: 30, // días entre mantenimientos
  pricing: {
    mainSession: 50000,
    maintenancePrice: 10000
  }
}
```

---

#### 3. **Asociaciones de Modelos**

Todas las relaciones establecidas en `index.js`:

```
Service (1) ──→ (N) TreatmentPlan
Client (1) ──→ (N) TreatmentPlan
Business (1) ──→ (N) TreatmentPlan
User/Specialist (1) ──→ (N) TreatmentPlan

TreatmentPlan (1) ──→ (N) TreatmentSession
Appointment (1) ──→ (1) TreatmentSession (opcional)
User/Specialist (1) ──→ (N) TreatmentSession
```

**Ejemplo de consulta con relaciones:**
```javascript
const plan = await TreatmentPlan.findByPk(planId, {
  include: [
    { model: Client, as: 'client' },
    { model: Service, as: 'service' },
    { 
      model: TreatmentSession, 
      as: 'sessions',
      include: [
        { model: Appointment, as: 'appointment' }
      ]
    }
  ]
});
```

---

#### 4. **Configuración de Sequelize CLI**

Archivo `.sequelizerc` creado para que Sequelize CLI encuentre las migraciones:
```javascript
{
  'config': 'config/config.json',
  'models-path': 'src/models',
  'seeders-path': 'src/seeders',
  'migrations-path': 'src/migrations'
}
```

---

## 🔄 Próximos Pasos

### Paso 5: **Backend - Controladores y Rutas**
- [ ] Crear `TreatmentPlanController.js`
  - POST `/api/treatment-plans` - Crear nuevo plan
  - GET `/api/treatment-plans/:id` - Obtener plan con sesiones
  - PATCH `/api/treatment-plans/:id` - Actualizar plan
  - DELETE `/api/treatment-plans/:id` - Cancelar plan
  - GET `/api/clients/:clientId/treatment-plans` - Planes de un cliente
  
- [ ] Crear `TreatmentSessionController.js`
  - POST `/api/treatment-sessions/:sessionId/schedule` - Agendar sesión
  - PATCH `/api/treatment-sessions/:sessionId/complete` - Completar sesión
  - POST `/api/treatment-sessions/:sessionId/photos` - Subir foto de progreso
  - PATCH `/api/treatment-sessions/:sessionId/payment` - Registrar pago

- [ ] Actualizar `ClientController.js`
  - Incluir treatment plans en el historial del cliente
  - Endpoint para ver todos los tratamientos de un cliente

- [ ] Actualizar `AppointmentController.js`
  - Al completar turno, verificar si es parte de un tratamiento
  - Actualizar progreso del tratamiento automáticamente

### Paso 6: **Frontend - Componentes de UI**
- [ ] `ServiceFormModal` - Agregar configuración de paquetes
- [ ] `TreatmentPlanCard` - Card para mostrar progreso del plan
- [ ] `TreatmentSessionList` - Lista de sesiones con estados
- [ ] `TreatmentProgressBar` - Barra visual de progreso
- [ ] `TreatmentPaymentTracker` - Seguimiento de pagos
- [ ] Integrar en `ClientHistory` - Mostrar tratamientos activos

### Paso 7: **Testing**
- [ ] Crear tratamiento multi-sesión (keratina 3 sesiones)
- [ ] Crear tratamiento con mantenimientos (láser + 6 meses)
- [ ] Agendar sesiones
- [ ] Completar sesiones y verificar progreso
- [ ] Registrar pagos parciales
- [ ] Verificar historial del cliente

---

## 📊 Estructura de Datos Completa

### Ejemplo Real: Keratina 3 Sesiones

**1. Servicio (Service)**
```json
{
  "id": "uuid",
  "name": "Keratina Brasileña - Paquete 3 Sesiones",
  "isPackage": true,
  "packageType": "MULTI_SESSION",
  "packageConfig": {
    "sessions": 3,
    "sessionInterval": 30,
    "pricing": {
      "perSession": 15000,
      "discount": 10
    }
  },
  "totalPrice": 40500,
  "allowPartialPayment": true,
  "pricePerSession": 15000
}
```

**2. Plan de Tratamiento (TreatmentPlan)**
```json
{
  "id": "uuid",
  "clientId": "uuid",
  "serviceId": "uuid",
  "planType": "MULTI_SESSION",
  "status": "ACTIVE",
  "totalSessions": 3,
  "completedSessions": 1,
  "totalPrice": 40500,
  "paidAmount": 15000,
  "paymentPlan": "PER_SESSION",
  "startDate": "2025-10-01",
  "expectedEndDate": "2025-12-01"
}
```

**3. Sesiones (TreatmentSession[])**
```json
[
  {
    "id": "uuid",
    "treatmentPlanId": "uuid",
    "sessionNumber": 1,
    "status": "COMPLETED",
    "appointmentId": "uuid",
    "completedDate": "2025-10-01",
    "paid": true,
    "price": 15000
  },
  {
    "id": "uuid",
    "treatmentPlanId": "uuid",
    "sessionNumber": 2,
    "status": "SCHEDULED",
    "appointmentId": "uuid",
    "scheduledDate": "2025-11-01",
    "paid": false,
    "price": 15000
  },
  {
    "id": "uuid",
    "treatmentPlanId": "uuid",
    "sessionNumber": 3,
    "status": "PENDING",
    "appointmentId": null,
    "paid": false,
    "price": 15000
  }
]
```

---

## 🎯 Casos de Uso Cubiertos

### ✅ Tratamientos Multi-Sesión
- Keratina (3 sesiones)
- Microblading (2-3 sesiones)
- Tatuajes (múltiples sesiones según tamaño)
- Tratamientos faciales (paquetes de 6, 10, 12 sesiones)

### ✅ Tratamientos con Mantenimiento
- Depilación láser + mantenimientos mensuales
- Lash lift + retoque a los 2 meses
- Pestañas pelo a pelo + rellenos semanales
- Uñas esculpidas + mantenimientos cada 3 semanas

### ✅ Flexibilidad de Pagos
- Pago completo upfront (con descuento)
- Pago por sesión individual
- Pago en cuotas (3, 6, 12 pagos)

---

## 🔧 Configuración Técnica

### Variables de Entorno (ya configuradas)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=7754
DB_NAME=beauty_control_dev
```

### Comandos Útiles
```bash
# Ejecutar migraciones
cd packages/backend && npx sequelize-cli db:migrate

# Ver estado de migraciones
cd packages/backend && npx sequelize-cli db:migrate:status

# Revertir última migración
cd packages/backend && npx sequelize-cli db:migrate:undo

# Revertir todas las migraciones
cd packages/backend && npx sequelize-cli db:migrate:undo:all
```

### Verificar Tablas en PostgreSQL
```sql
-- Ver estructura de treatment_plans
\d+ treatment_plans

-- Ver estructura de treatment_sessions
\d+ treatment_sessions

-- Ver campos nuevos en services
\d+ services
```

---

## 📝 Notas Importantes

### Distinción Clave: Historial vs Tratamiento
- **Historial del Cliente**: Muestra TODOS los turnos (servicios simples + sesiones de tratamientos)
- **Vista de Tratamiento**: Muestra solo las sesiones de UN tratamiento específico con su progreso

### Integridad de Datos
- **treatmentPlanId + sessionNumber** tienen índice único (no duplicados)
- **appointmentId** puede ser NULL (sesiones pendientes sin agendar)
- **specialistId** en TreatmentSession permite que cada sesión tenga diferente especialista

### Performance
- 10 índices totales creados para optimizar consultas frecuentes
- JSONB para datos flexibles sin impacto en rendimiento
- Relaciones configuradas con onDelete apropiados

---

## ✨ Próxima Sesión

Comenzaremos con:
1. Crear el `TreatmentPlanController.js` 
2. Definir los endpoints de la API
3. Implementar la lógica de creación de planes

¿Quieres revisar alguna parte de la implementación o seguimos con los controladores? 🚀
