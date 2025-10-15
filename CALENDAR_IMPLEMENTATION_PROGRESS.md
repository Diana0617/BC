# 📅 Sistema de Calendario - Progreso de Implementación

## ✅ FASE 1 COMPLETADA: Backend Core

### Archivos Creados

#### 1. **AvailabilityService.js** ✅
**Ubicación**: `packages/backend/src/services/AvailabilityService.js`

**Funciones principales**:
- ✅ `generateAvailableSlots()` - Genera slots disponibles para un día específico
  - Valida horarios de sucursal (Branch.businessHours)
  - Valida disponibilidad del especialista (SpecialistBranchSchedule)
  - Calcula intersección de horarios
  - Obtiene duración del servicio
  - Excluye citas existentes
  - Retorna slots disponibles con metadata completa

- ✅ `getAvailabilityRange()` - Disponibilidad de múltiples días
  - Rango de fechas (startDate → endDate)
  - Retorna solo días con slots disponibles

- ✅ `getAvailableSpecialists()` - Especialistas disponibles para fecha/hora
  - Dado un servicio, fecha y hora específicos
  - Retorna lista de especialistas sin conflictos

- ✅ `validateSlotAvailability()` - Validar slot antes de crear cita
  - Verifica que no haya conflictos
  - Útil para validación previa a reserva

**Helpers implementados**:
- `generateTimeSlots()` - Genera slots en rango horario
- `isSlotOccupied()` - Detecta solapamiento de citas
- `getDayOfWeekName()` - Convierte fecha a nombre de día
- `parseTime()`, `formatTime()` - Manejo de horas
- `addMinutes()` - Suma minutos a Date
- `maxTime()`, `minTime()` - Comparación de horarios
- `getDateRange()` - Array de fechas entre dos fechas

**Lógica de negocio clave**:
```javascript
// Intersección de horarios (lo más restrictivo gana)
workStart = max(branchHours.open, specialistSchedule.startTime)
workEnd = min(branchHours.close, specialistSchedule.endTime)

// Slots = Dividir rango en intervalos de X minutos (duración del servicio)
// Filtrar = Excluir slots con citas existentes (CONFIRMED, IN_PROGRESS, etc.)
```

---

#### 2. **CalendarController.js** ✅
**Ubicación**: `packages/backend/src/controllers/CalendarController.js`

**Endpoints implementados**:

##### `getBusinessCalendar()` - Vista completa del negocio
- **Ruta**: `GET /api/calendar/business/:businessId`
- **Roles**: OWNER, BUSINESS_ADMIN
- **Parámetros**:
  - `startDate` (required): YYYY-MM-DD
  - `endDate` (required): YYYY-MM-DD
  - `branchId` (optional): Filtrar por sucursal
  - `specialistId` (optional): Filtrar por especialista
  - `status` (optional): Filtrar por estado
- **Retorna**:
  ```javascript
  {
    events: [{ id, title, start, end, status, backgroundColor, extendedProps }],
    stats: {
      total, 
      byStatus: { PENDING: 5, CONFIRMED: 10, ... },
      byBranch: { "Sucursal Centro": 8, ... },
      totalRevenue: 1250000
    },
    dateRange: { startDate, endDate }
  }
  ```

##### `getBranchCalendar()` - Vista de sucursal
- **Ruta**: `GET /api/calendar/branch/:branchId`
- **Roles**: OWNER, BUSINESS_ADMIN, RECEPTIONIST, SPECIALIST_RECEPTIONIST
- **Parámetros**:
  - `startDate` (required)
  - `endDate` (required)
  - `specialistId` (optional)
  - `status` (optional)
- **Retorna**: Eventos + metadata de sucursal

##### `getSpecialistCombinedCalendar()` - Agenda combinada
- **Ruta**: `GET /api/calendar/specialist/:specialistId`
- **Roles**: OWNER, BUSINESS_ADMIN, SPECIALIST, SPECIALIST_RECEPTIONIST
- **Parámetros**:
  - `startDate` (required)
  - `endDate` (required)
  - `branchId` (optional): Filtrar por sucursal específica
  - `status` (optional)
- **Retorna**: Todas las citas del especialista en todas sus sucursales
- **Incluye**: Agrupación por sucursal (byBranch)

##### `getAvailableSlots()` - Slots disponibles
- **Ruta**: `GET /api/calendar/available-slots`
- **Roles**: Puede ser pública (para reserva online)
- **Parámetros**:
  - `businessId` (required)
  - `branchId` (required)
  - `specialistId` (required)
  - `serviceId` (required)
  - `date` (required): YYYY-MM-DD
- **Retorna**:
  ```javascript
  {
    date: "2024-01-15",
    dayOfWeek: "monday",
    branch: { id, name, hours },
    specialist: { id, name, schedule },
    service: { id, name, duration, price },
    workingHours: { start: "09:00", end: "18:00" },
    totalSlots: 18,
    availableSlots: 12,
    occupiedSlots: 6,
    slots: [
      { startTime: "09:00", endTime: "10:00", available: true },
      { startTime: "10:00", endTime: "11:00", available: true },
      ...
    ]
  }
  ```

##### `getAvailabilityRange()` - Rango de disponibilidad
- **Ruta**: `GET /api/calendar/availability-range`
- **Parámetros**:
  - Todos los de `available-slots` +
  - `startDate` y `endDate` en lugar de `date`
- **Retorna**: Array de disponibilidad por día (solo días con slots)

##### `getBranchSpecialists()` - Especialistas de sucursal
- **Ruta**: `GET /api/calendar/branch/:branchId/specialists`
- **Parámetros opcionales**:
  - `serviceId`: Para filtrar por servicio
  - `date`: YYYY-MM-DD
  - `time`: HH:MM
- **Comportamiento**:
  - **Con serviceId, date, time**: Retorna solo especialistas disponibles en ese horario
  - **Sin parámetros**: Retorna todos los especialistas de la sucursal
- **Retorna**:
  ```javascript
  {
    specialists: [
      {
        id, firstName, lastName, email,
        specialization, bio,
        schedule: { startTime, endTime }, // Si se pidió para horario específico
        available: true
      }
    ],
    total: 3
  }
  ```

**Helper**:
- `getStatusColor(status)` - Mapeo de colores para calendario
  - PENDING: #FFA500 (Naranja)
  - CONFIRMED: #4CAF50 (Verde)
  - IN_PROGRESS: #2196F3 (Azul)
  - COMPLETED: #9E9E9E (Gris)
  - CANCELED: #F44336 (Rojo)
  - NO_SHOW: #FF6347 (Rojo tomate)
  - RESCHEDULED: #FFD700 (Dorado)

---

#### 3. **calendar.js** (Routes) ✅
**Ubicación**: `packages/backend/src/routes/calendar.js`

**Rutas registradas**:
```javascript
router.get('/business/:businessId', authorizeRole(['OWNER', 'BUSINESS_ADMIN']), ...)
router.get('/branch/:branchId', authorizeRole(['OWNER', 'BUSINESS_ADMIN', 'RECEPTIONIST', 'SPECIALIST_RECEPTIONIST']), ...)
router.get('/specialist/:specialistId', authorizeRole(['OWNER', 'BUSINESS_ADMIN', 'SPECIALIST', 'SPECIALIST_RECEPTIONIST']), ...)
router.get('/available-slots', ...) // Puede ser pública
router.get('/availability-range', ...)
router.get('/branch/:branchId/specialists', ...)
```

**Todas las rutas**:
- ✅ Requieren autenticación (`authenticateToken`)
- ✅ Tienen control de roles específico por vista
- ✅ Documentadas con JSDoc/comentarios

---

#### 4. **app.js** (Actualizado) ✅
**Ubicación**: `packages/backend/src/app.js`

**Cambios**:
```javascript
// Línea ~220 - Import
const calendarRoutes = require('./routes/calendar');

// Línea ~237 - Registro de ruta
app.use('/api/calendar', calendarRoutes);
```

---

## 🎯 Funcionalidades Implementadas

### ✅ Cálculo de Disponibilidad
- [x] Intersección de horarios (sucursal + especialista)
- [x] Generación de slots basada en duración de servicio
- [x] Exclusión de slots ocupados
- [x] Validación de día cerrado
- [x] Validación de especialista no trabaja ese día
- [x] Soporte multi-sucursal (especialista en varias sucursales)

### ✅ Vistas por Rol
- [x] **Business/Owner**: Vista completa con todas las sucursales
- [x] **Receptionist**: Vista filtrada por sucursal(es) asignadas
- [x] **Specialist**: Agenda combinada de todas sus sucursales
- [x] **Cliente/Público**: Slots disponibles para reserva

### ✅ Filtros Avanzados
- [x] Por rango de fechas
- [x] Por sucursal
- [x] Por especialista
- [x] Por estado de cita
- [x] Por servicio (para obtener especialistas disponibles)

### ✅ Estadísticas
- [x] Total de citas
- [x] Agrupación por estado
- [x] Agrupación por sucursal
- [x] Ingresos totales (solo CONFIRMED y COMPLETED)

### ✅ Validaciones
- [x] Validar slot antes de crear cita
- [x] Detectar conflictos de horario
- [x] Verificar disponibilidad de especialista
- [x] Verificar horarios de sucursal

---

## 📋 Próximos Pasos

### Fase 2A: Completar AppointmentController (Pendiente)
Endpoints que actualmente retornan 501:

1. **updateAppointment()** - `PUT /api/appointments/:id`
   - Actualizar datos de cita
   - Validar disponibilidad si cambia horario
   - Recalcular totalAmount si cambia servicio

2. **completeAppointment()** - `PATCH /api/appointments/:id/complete`
   - Cambiar status a COMPLETED
   - Calcular comisión (si está configurada)
   - Registrar fecha de completado

3. **rescheduleAppointment()** - `POST /api/appointments/:id/reschedule`
   - Validar disponibilidad del nuevo horario
   - Actualizar startTime/endTime
   - Agregar a rescheduleHistory JSONB
   - Mantener o cambiar status

4. **uploadEvidence()** - `POST /api/appointments/:id/evidence`
   - Subir fotos antes/después
   - Actualizar evidence JSONB
   - Validar que sea el especialista asignado

### Fase 2B: Frontend Web (Solo para Business/Owner)
Recordatorio: Mobile app manejará Specialist/Receptionist views

1. **Redux Slices**:
   - `calendarSlice.js` - State para vista de calendario
   - `appointmentSlice.js` - State para CRUD de citas

2. **API Clients**:
   - `calendarApi.js` - Cliente HTTP para calendar endpoints
   - `appointmentApi.js` - Cliente HTTP para appointment endpoints

3. **Componentes UI** (para web-app):
   - `CalendarView.jsx` - Vista principal con FullCalendar
   - `AppointmentModal.jsx` - Crear/editar citas
   - `CalendarFilters.jsx` - Filtros por sucursal/especialista/fecha

4. **Dependencias**:
   ```bash
   npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction date-fns
   ```

### Fase 3: Testing
- [ ] Tests de AvailabilityService
  - Intersección de horarios
  - Generación de slots
  - Detección de conflictos
- [ ] Tests de CalendarController
  - Vistas por rol
  - Filtros
  - Estadísticas
- [ ] Tests de integración
  - Crear cita → Verificar slot ocupado
  - Cancelar cita → Verificar slot disponible
  - Multi-sucursal → Especialista en 2 sucursales

### Fase 4: Optimizaciones
- [ ] Caché de disponibilidad con Redis
- [ ] Invalidación de caché al crear/cancelar citas
- [ ] Paginación para calendarios con muchas citas
- [ ] WebSockets para actualización en tiempo real

---

## 🧪 Testing Manual Sugerido

### Test 1: Disponibilidad Básica
```http
GET /api/calendar/available-slots?businessId={id}&branchId={id}&specialistId={id}&serviceId={id}&date=2024-01-15
```
**Validar**:
- Retorna slots según horario de sucursal
- Respeta horario del especialista
- Duración de slots = duración del servicio
- Excluye citas existentes

### Test 2: Vista de Negocio
```http
GET /api/calendar/business/{businessId}?startDate=2024-01-01&endDate=2024-01-31
```
**Validar**:
- Retorna citas de todas las sucursales
- Estadísticas correctas
- Eventos formateados para calendario

### Test 3: Especialista Multi-sucursal
```http
GET /api/calendar/specialist/{specialistId}?startDate=2024-01-01&endDate=2024-01-31
```
**Validar**:
- Retorna citas de todas las sucursales del especialista
- Agrupación por sucursal (byBranch)

### Test 4: Especialistas Disponibles
```http
GET /api/calendar/branch/{branchId}/specialists?serviceId={id}&date=2024-01-15&time=10:00
```
**Validar**:
- Solo retorna especialistas sin conflictos en ese horario
- Filtra por horario del especialista

---

## 📦 Archivos del Proyecto

```
packages/backend/
├── src/
│   ├── controllers/
│   │   └── CalendarController.js ✅ NUEVO
│   ├── services/
│   │   └── AvailabilityService.js ✅ NUEVO
│   ├── routes/
│   │   └── calendar.js ✅ NUEVO
│   └── app.js ✅ ACTUALIZADO
```

---

## 🚀 ¿Cómo Continuar?

### Opción A: Completar Backend (Recomendado primero)
Completar los endpoints faltantes en `AppointmentController`:
- `updateAppointment()`
- `completeAppointment()`
- `rescheduleAppointment()`
- `uploadEvidence()`

### Opción B: Comenzar Frontend Web
Crear Redux slices y componentes para la vista web del Business/Owner.

### Opción C: Testing
Crear tests para validar toda la lógica implementada.

---

**Estado actual**: Backend core del sistema de calendario ✅ COMPLETADO
**Siguiente paso sugerido**: Completar AppointmentController o comenzar con Frontend Web

---

**Fecha**: Octubre 15, 2025  
**Versión**: 1.0  
**Autor**: Beauty Control Development Team
