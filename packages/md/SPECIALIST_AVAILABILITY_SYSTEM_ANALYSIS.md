# 📅 Sistema de Disponibilidad del Especialista - Plan de Implementación

**Fecha**: 18 de Octubre 2025
**Estado**: Análisis completo - Listo para implementar

---

## 🎯 Objetivo Confirmado

El especialista debe **marcar su disponibilidad semanal** con las siguientes restricciones:

1. ✅ **Respetar horario del negocio**: Los slots del especialista deben estar DENTRO del horario general del business
2. ✅ **Multi-sucursal**: Si el plan incluye >1 sucursal, puede tener horarios diferentes por sucursal
3. ✅ **Anticipación**: Marcar disponibilidad con **1 mes de anticipación**
4. ✅ **Slots**: Sistema genera slots automáticamente basado en el horario definido

---

## 📊 Arquitectura Existente (COMPLETA)

### **Modelos Relevantes**:

#### 1. **Schedule** - Horario general del business/especialista
```javascript
// packages/backend/src/models/Schedule.js
{
  id: UUID,
  businessId: UUID,
  specialistId: UUID (nullable),
  type: 'BUSINESS_DEFAULT' | 'SPECIALIST_CUSTOM' | 'TEMPORARY_OVERRIDE',
  weeklySchedule: JSONB {
    monday: { enabled, shifts: [{ start, end, breakStart, breakEnd }] },
    // ... otros días
  },
  slotDuration: 30 (minutos),
  bufferTime: 5 (minutos),
  isActive: boolean,
  isDefault: boolean
}
```

#### 2. **SpecialistBranchSchedule** - Horario del especialista POR sucursal ⭐
```javascript
// packages/backend/src/models/SpecialistBranchSchedule.js
{
  id: UUID,
  specialistId: UUID (specialist_profiles),
  branchId: UUID,
  dayOfWeek: 'monday' | 'tuesday' | ... | 'sunday',
  startTime: TIME,
  endTime: TIME,
  isActive: boolean,
  priority: integer
}
```

#### 3. **TimeSlot** - Slots generados automáticamente
```javascript
// packages/backend/src/models/TimeSlot.js
{
  id: UUID,
  businessId: UUID,
  specialistId: UUID,
  scheduleId: UUID,
  date: DATEONLY,
  startTime: TIME,
  endTime: TIME,
  startDateTime: TIMESTAMP,
  endDateTime: TIMESTAMP,
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | 'BREAK' | 'UNAVAILABLE',
  appointmentId: UUID (si está reservado),
  duration: 30 (minutos),
  allowOnlineBooking: boolean
}
```

---

## 🛣️ Rutas Existentes

### **Para Sucursales** (`/api/business/:businessId/branches/:branchId/schedules`)
**Archivo**: `packages/backend/src/routes/branches.js`

```javascript
// Ver horarios de especialistas en una sucursal
GET /api/business/:businessId/branches/:branchId/schedules

// Crear horario de especialista en sucursal
POST /api/business/:businessId/branches/:branchId/schedules
Body: { specialistId, dayOfWeek, startTime, endTime }

// Actualizar horario
PUT /api/business/:businessId/branches/:branchId/schedules/:scheduleId

// Eliminar horario
DELETE /api/business/:businessId/branches/:branchId/schedules/:scheduleId
```

### **Para Calendar** (`/api/calendar`)
```javascript
// Slots disponibles para un día
GET /api/calendar/available-slots
Query: businessId, branchId, specialistId, serviceId, date

// Agenda del especialista
GET /api/calendar/specialist/:specialistId
Query: startDate, endDate, branchId?, status?
```

---

## 🚀 Plan de Implementación

### **Fase 1: Backend - Endpoints para Mobile del Especialista** ✅

Necesitamos crear endpoints específicos en `SpecialistController.js`:

```javascript
// 1. Ver mis horarios por sucursal
GET /api/specialists/me/schedules
Response: [
  {
    branchId,
    branchName,
    weekSchedule: {
      monday: { enabled, startTime, endTime },
      tuesday: { enabled, startTime, endTime },
      ...
    }
  }
]

// 2. Actualizar mi horario para una sucursal específica
PUT /api/specialists/me/schedules/:branchId
Body: {
  weekSchedule: {
    monday: { enabled: true, startTime: '09:00', endTime: '18:00' },
    tuesday: { enabled: true, startTime: '09:00', endTime: '18:00' },
    ...
  }
}

// 3. Ver mis slots generados (próximo mes)
GET /api/specialists/me/availability
Query: startDate, endDate, branchId?
Response: [
  {
    date: '2025-10-20',
    slots: [
      { id, startTime, endTime, status, appointmentId? }
    ]
  }
]

// 4. Bloquear slot específico
POST /api/specialists/me/slots/block
Body: { slotId, reason }

// 5. Desbloquear slot
DELETE /api/specialists/me/slots/unblock/:slotId

// 6. Ver restricciones del business
GET /api/specialists/me/business-constraints
Response: {
  businessSchedule: { monday: {...}, ... },
  slotDuration: 30,
  maxAdvanceBooking: 30 // días
}
```

---

### **Fase 2: Frontend Mobile - Componentes** 📱

#### **2.1 Redux Slice** (`specialistScheduleSlice.js`)

```javascript
// packages/shared/src/store/slices/specialistScheduleSlice.js

const initialState = {
  // Horarios por sucursal
  schedules: [], // [{ branchId, branchName, weekSchedule }]
  
  // Slots del próximo mes
  upcomingSlots: {}, // { '2025-10-20': [slots] }
  
  // Restricciones del business
  businessConstraints: null,
  
  // UI state
  loading: false,
  error: null
};

// Thunks
- fetchMySchedules()
- updateBranchSchedule(branchId, weekSchedule)
- fetchUpcomingAvailability(startDate, endDate)
- blockTimeSlot(slotId, reason)
- unblockTimeSlot(slotId)
- fetchBusinessConstraints()
```

#### **2.2 Pantalla Principal** (`SpecialistScheduleScreen.js`)

**Navegación**: Desde el Dashboard → Botón "Mi Horario" o icono de calendario

**Secciones**:

1. **Selector de Sucursal** (si tiene >1)
   - Tabs horizontales o dropdown
   - Muestra horario de la sucursal seleccionada

2. **Vista Semanal** (Configuración base)
   - 7 cards (Lun-Dom)
   - Cada card: Switch ON/OFF + Hora inicio + Hora fin
   - Validación: Debe estar dentro del horario del business
   - Botón "Guardar Cambios"

3. **Vista de Disponibilidad** (Próximos 30 días)
   - Calendario mensual con:
     - Días con slots disponibles (verde)
     - Días bloqueados (rojo)
     - Días con citas (azul)
   - Al tocar un día → Modal con slots del día
   - Opción para bloquear slots individuales

4. **Mis Bloqueos**
   - Lista de slots bloqueados con razón
   - Opción para desbloquear

---

### **Fase 3: Integración y Validaciones** 🔗

#### **3.1 Generación Automática de Slots**

Cuando el especialista guarda su horario:

```javascript
// Backend process
1. Recibir weekSchedule del especialista
2. Validar que esté dentro del businessSchedule
3. Guardar en SpecialistBranchSchedule (por día)
4. Generar TimeSlots para próximos 30 días
   - Estado inicial: AVAILABLE
   - Duración: según slotDuration del business
   - Considerar breaks automáticos
```

#### **3.2 Validaciones en Creación de Cita**

```javascript
// AppointmentController.createAppointment()
1. Verificar que existe TimeSlot AVAILABLE
2. Verificar que specialistId coincide
3. Verificar que no esté bloqueado
4. Cambiar status de slot a BOOKED
5. Asociar appointmentId
```

#### **3.3 Sincronización**

- Al crear cita → Slot pasa a BOOKED
- Al cancelar cita → Slot vuelve a AVAILABLE
- Al bloquear slot → Status BLOCKED (no se puede agendar)
- Al cambiar horario → Regenerar slots futuros

---

## 📝 Modelo de Datos - Ejemplo Práctico

### **Caso: Felipe, especialista en Beauty Control**

```javascript
// 1. Business tiene horario general
Schedule {
  businessId: 'mas3d',
  specialistId: null, // null = horario del business
  type: 'BUSINESS_DEFAULT',
  weeklySchedule: {
    monday: { enabled: true, shifts: [{ start: '08:00', end: '20:00' }] },
    tuesday: { enabled: true, shifts: [{ start: '08:00', end: '20:00' }] },
    ...
  }
}

// 2. Felipe define su disponibilidad en Sucursal A
SpecialistBranchSchedule [
  { 
    specialistId: 'felipe-id',
    branchId: 'sucursal-a',
    dayOfWeek: 'monday',
    startTime: '09:00',
    endTime: '18:00' // Dentro del horario del business (08:00-20:00)
  },
  {
    specialistId: 'felipe-id',
    branchId: 'sucursal-a',
    dayOfWeek: 'tuesday',
    startTime: '10:00',
    endTime: '16:00'
  }
]

// 3. Sistema genera slots automáticamente
TimeSlot [
  {
    specialistId: 'felipe-id',
    branchId: 'sucursal-a',
    date: '2025-10-20',
    startTime: '09:00',
    endTime: '09:30',
    status: 'AVAILABLE'
  },
  {
    specialistId: 'felipe-id',
    branchId: 'sucursal-a',
    date: '2025-10-20',
    startTime: '09:30',
    endTime: '10:00',
    status: 'AVAILABLE'
  },
  // ... más slots hasta las 18:00
]

// 4. Cliente agenda cita
TimeSlot {
  ...
  startTime: '10:00',
  endTime: '10:30',
  status: 'BOOKED',
  appointmentId: 'appointment-123'
}

// 5. Felipe bloquea un slot (almuerzo extendido)
TimeSlot {
  ...
  startTime: '13:00',
  endTime: '13:30',
  status: 'BLOCKED',
  blockReason: 'Almuerzo extendido'
}
```

---

## 🎨 Flujo de Usuario - Especialista Mobile

### **Escenario 1: Primera vez configurando horario**

1. Especialista abre app → Dashboard
2. Click en "Configurar Horario" (alerta si no lo ha hecho)
3. Sistema muestra horario del business como referencia
4. Selecciona sucursal (si tiene >1)
5. Para cada día:
   - Activa/desactiva día
   - Define hora inicio (dentro de horario business)
   - Define hora fin (dentro de horario business)
6. Presiona "Guardar"
7. Sistema genera slots para próximos 30 días
8. Mensaje: "¡Horario guardado! Tus slots están disponibles para agendamiento"

### **Escenario 2: Bloquear día específico (vacaciones)**

1. Dashboard → "Mi Disponibilidad"
2. Vista de calendario mensual
3. Selecciona día (ej: 25 de octubre)
4. Modal muestra todos los slots del día
5. Presiona "Bloquear día completo"
6. Ingresa razón: "Día personal"
7. Confirma
8. Sistema marca todos los slots como BLOCKED
9. Clientes no pueden agendar ese día

### **Escenario 3: Bloquear horas específicas**

1. Dashboard → "Mi Disponibilidad"
2. Selecciona día
3. Ve lista de slots
4. Selecciona slots 14:00-16:00
5. "Bloquear slots seleccionados"
6. Ingresa razón: "Capacitación"
7. Solo esos slots quedan BLOCKED

---

## ⚠️ Validaciones Críticas

### **Backend**:

```javascript
// 1. Horario dentro de business
validateSpecialistSchedule(specialistSchedule, businessSchedule) {
  // Verificar que startTime >= business.startTime
  // Verificar que endTime <= business.endTime
}

// 2. No conflictos con citas existentes
async validateScheduleChange(specialistId, newSchedule) {
  // Si reduce horario, verificar que no hay citas en horarios eliminados
  // Si las hay, bloquear cambio o ofrecer reagendar
}

// 3. Máximo 30 días anticipación
validateSlotGeneration(date) {
  const maxDate = addDays(new Date(), 30);
  return date <= maxDate;
}
```

### **Frontend**:

```javascript
// 1. UI en selector de horario
- Deshabilitar horas fuera del rango del business
- Mostrar horario del business como referencia
- Validar que endTime > startTime

// 2. Confirmación antes de cambios
- Si tiene citas futuras en horarios que va a eliminar:
  "Tienes 3 citas en este horario. ¿Reagendar o cancelar?"
```

---

## 🔄 Flujo Técnico Completo

```mermaid
1. Especialista define horario
   ↓
2. POST /api/specialists/me/schedules/:branchId
   ↓
3. Backend valida contra businessSchedule
   ↓
4. Guarda en SpecialistBranchSchedule (7 registros, uno por día)
   ↓
5. Trigger: Generar TimeSlots (próximos 30 días)
   ↓
6. TimeSlotService.generateSlots()
   - Por cada día habilitado
   - Crear slots cada 30min (o slotDuration configurado)
   - Estado inicial: AVAILABLE
   ↓
7. Slots disponibles para:
   - Agendamiento online (clientes)
   - Agendamiento admin (recepcionista)
   - Vista en calendario business
   ↓
8. Cliente/Admin agenda cita
   ↓
9. Slot.status → BOOKED
   Slot.appointmentId → appointment.id
   ↓
10. Si especialista bloquea slot:
    Slot.status → BLOCKED
    Slot.blockReason → "razón"
```

---

## 📋 Tareas Priorizadas

### **Sprint 1: Backend Endpoints** (2-3 días)

- [ ] Crear endpoints en `SpecialistController.js`
  - [ ] `getMySchedules()`
  - [ ] `updateBranchSchedule()`
  - [ ] `getMyUpcomingAvailability()`
  - [ ] `getBusinessConstraints()`
  - [ ] `blockTimeSlot()`
  - [ ] `unblockTimeSlot()`
- [ ] Agregar validaciones en `ScheduleService.js`
  - [ ] `validateAgainstBusinessSchedule()`
  - [ ] `checkConflictsWithAppointments()`
- [ ] Modificar `TimeSlotService.js`
  - [ ] `generateSlotsFromBranchSchedule()`
  - [ ] `regenerateFutureSlots()`
- [ ] Testing de endpoints

### **Sprint 2: Frontend Mobile - Redux** (1-2 días)

- [ ] Crear `specialistScheduleSlice.js`
- [ ] Implementar thunks
- [ ] Configurar en store
- [ ] Testing de Redux

### **Sprint 3: Frontend Mobile - UI** (3-4 días)

- [ ] Crear `SpecialistScheduleScreen.js`
- [ ] Implementar vista semanal (configuración)
