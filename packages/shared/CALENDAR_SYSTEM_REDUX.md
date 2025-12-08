# 📅 CALENDAR SYSTEM - Redux Implementation Complete

## 🎯 Overview
Complete Redux state management for the Beauty Control calendar system including specialist schedules, time slots, and appointment management with multi-specialist views.

---

## 📦 Redux Slices Created

### 1️⃣ **scheduleSlice.js** - Schedule Management
Gestión de horarios recurrentes semanales de especialistas.

**Path:** `packages/shared/src/store/slices/scheduleSlice.js`

**Async Thunks (8):**
- `createSchedule(scheduleData)` - Crear horario semanal
- `getScheduleById(scheduleId)` - Obtener horario por ID
- `getSchedulesByBranch(branchId)` - Obtener horarios por sucursal
- `updateSchedule({ scheduleId, updateData })` - Actualizar horario
- `deleteSchedule(scheduleId)` - Eliminar horario
- `generateSlots({ scheduleId, startDate, endDate })` - Generar slots automáticos
- `getWeeklySchedule({ scheduleId, date })` - Vista semanal
- `getMonthlySchedule({ scheduleId, year, month })` - Vista mensual

**State Structure:**
```javascript
{
  schedules: [],           // Lista de horarios
  currentSchedule: null,   // Horario seleccionado
  weeklyView: [],          // Vista semanal actual
  monthlyView: [],         // Vista mensual actual
  generatedSlots: [],      // Slots generados automáticamente
  loading: false,
  error: null,
  success: false,
  message: null
}
```

**Special Reducers:**
- `setCurrentSchedule(schedule)` - Seleccionar horario actual
- `clearWeeklyView()` - Limpiar vista semanal
- `clearMonthlyView()` - Limpiar vista mensual
- `clearScheduleError()` - Limpiar error
- `clearScheduleSuccess()` - Limpiar mensaje de éxito
- `resetScheduleState()` - Resetear todo el estado

---

### 2️⃣ **appointmentCalendarSlice.js** - Appointment Calendar
Vista de calendario con gestión de citas y filtros multi-especialista.

**Path:** `packages/shared/src/store/slices/appointmentCalendarSlice.js`

**Async Thunks (7):**
- `getAppointments(params)` - Obtener citas con paginación
- `getAppointmentById(appointmentId)` - Obtener cita específica
- `createAppointment(appointmentData)` - Crear nueva cita
- `updateAppointment({ appointmentId, updateData })` - Actualizar cita
- `updateAppointmentStatus({ appointmentId, status, notes })` - Cambiar estado
- `cancelAppointment({ appointmentId, cancelReason })` - Cancelar cita
- `getAppointmentsByDateRange({ startDate, endDate, specialistId, branchId, status })` - Filtrar por rango

**State Structure:**
```javascript
{
  appointments: [],          // Lista completa de citas
  calendarAppointments: [],  // Citas filtradas para calendario
  selectedAppointment: null, // Cita seleccionada
  filters: {                 // Filtros activos
    startDate: null,
    endDate: null,
    branchId: null,
    specialistId: null,
    status: null
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0
  },
  loading: false,
  error: null,
  success: false,
  message: null
}
```

**Special Reducers:**
- `setCalendarView(appointments)` - Establecer vista de calendario
- `setAppointmentFilters(filters)` - Aplicar filtros
- `clearAppointmentFilters()` - Limpiar todos los filtros
- `setSelectedAppointment(appointment)` - Seleccionar cita

---

### 3️⃣ **timeSlotSlice.js** - Time Slot Management
Gestión de slots individuales y disponibilidad.

**Path:** `packages/shared/src/store/slices/timeSlotSlice.js`

**Async Thunks (7):**
- `getAvailableSlots({ specialistId, date, serviceId })` - Slots disponibles
- `getSlotsByDateRange({ startDate, endDate, specialistId, branchId })` - Slots por rango
- `createTimeSlot(slotData)` - Crear slot manual
- `updateTimeSlot({ slotId, updateData })` - Actualizar slot
- `blockTimeSlot({ slotId, reason })` - Bloquear slot
- `unblockTimeSlot(slotId)` - Desbloquear slot
- `deleteTimeSlot(slotId)` - Eliminar slot

**State Structure:**
```javascript
{
  slots: [],              // Todos los slots
  availableSlots: [],     // Solo slots disponibles
  selectedSlot: null,     // Slot seleccionado
  slotsByDate: {},        // Slots agrupados por fecha
  loading: false,
  error: null,
  success: false,
  message: null
}
```

**Special Reducers:**
- `setSelectedSlot(slot)` - Seleccionar slot
- `groupSlotsByDate()` - Agrupar slots por fecha

---

## 🎯 Selectors Created

### scheduleSelectors.js (24 selectors)

**Basic Selectors:**
- `selectSchedules` - Lista de horarios
- `selectCurrentSchedule` - Horario actual
- `selectWeeklyView` - Vista semanal
- `selectMonthlyView` - Vista mensual
- `selectGeneratedSlots` - Slots generados
- `selectScheduleLoading/Error/Success/Message` - Estados

**Memoized Selectors:**
- `selectSchedulesBySpecialist(specialistId)` - Filtrar por especialista
- `selectSchedulesByBranch(branchId)` - Filtrar por sucursal
- `selectActiveSchedules` - Solo horarios activos
- `selectSchedulesWithExceptions` - Con excepciones
- `selectSchedulesBySpecialistAndBranch(specialistId, branchId)` - Doble filtro
- `selectCurrentScheduleAvailableDays` - Días configurados
- `selectHasGeneratedSlots` - Verificar si tiene slots
- `selectTotalSchedules` - Contador total
- `selectGeneratedSlotsByDate` - Slots agrupados por fecha
- `selectProcessedWeeklyView` - Vista semanal procesada
- `selectMonthlyViewStats` - Estadísticas mensuales
- `selectCurrentScheduleHasDays` - Verificar días configurados
- `selectSchedulesOnVacation` - Horarios en vacaciones

---

### appointmentCalendarSelectors.js (30+ selectors)

**Basic Selectors:**
- `selectAppointments/CalendarAppointments/SelectedAppointment`
- `selectAppointmentFilters/Pagination`
- `selectAppointmentLoading/Error/Success/Message`

**Memoized Selectors:**
- `selectAppointmentsByDate(date)` - Citas de fecha específica
- `selectAppointmentsBySpecialist(specialistId)` - Por especialista
- `selectAppointmentsByBranch(branchId)` - Por sucursal
- `selectAppointmentsByStatus(status)` - Por estado
- `selectConfirmedAppointments` - Solo confirmadas
- `selectPendingAppointments` - Solo pendientes
- `selectCompletedAppointments` - Solo completadas
- `selectCancelledAppointments` - Solo canceladas
- `selectAppointmentsByDateGroup` - Agrupadas por fecha
- `selectAppointmentsBySpecialistGroup` - Agrupadas por especialista
- `selectFilteredAppointments` - Con filtros aplicados
- `selectAppointmentCountByStatus` - Contador por estado
- `selectCalendarStats` - Estadísticas completas
- `selectHasActiveFilters` - Verificar filtros activos
- `selectPaginationInfo` - Info de paginación completa
- `selectTodayAppointments` - Citas de hoy
- `selectUpcomingAppointments` - Citas futuras
- `selectPastAppointments` - Citas pasadas
- `selectThisWeekAppointments` - Citas de esta semana

---

### timeSlotSelectors.js (28 selectors)

**Basic Selectors:**
- `selectTimeSlots/AvailableSlots/SelectedSlot`
- `selectSlotsByDate`
- `selectTimeSlotLoading/Error/Success/Message`

**Memoized Selectors:**
- `selectSlotsBySpecificDate(date)` - Por fecha
- `selectAvailableSlotsByDate(date)` - Disponibles por fecha
- `selectSlotsBySpecialist(specialistId)` - Por especialista
- `selectSlotsByBranch(branchId)` - Por sucursal
- `selectSlotsByStatus(status)` - Por estado
- `selectBlockedSlots` - Solo bloqueados
- `selectBookedSlots` - Solo reservados
- `selectBreakSlots` - Solo descansos
- `selectSlotStats` - Estadísticas completas
- `selectDatesWithAvailableSlots` - Fechas con disponibilidad
- `selectDateHasAvailableSlots(date)` - Verificar disponibilidad
- `selectAvailableSlotsForSpecialistAndDate(specialistId, date)` - Doble filtro
- `selectSlotCountByStatus` - Contador por estado
- `selectTodaySlots` - Slots de hoy
- `selectFutureSlots` - Slots futuros
- `selectPastSlots` - Slots pasados
- `selectAverageSlotDuration` - Duración promedio
- `selectHasAvailableSlots` - Verificar disponibilidad
- `selectSlotsByTimeRange(startHour, endHour)` - Por rango horario
- `selectSlotAvailabilityBySpecialist` - Disponibilidad por especialista

---

## 🪝 Custom Hooks Created

### 1. useSchedule()
**Path:** `packages/shared/src/hooks/useSchedule.js`

**Usage:**
```javascript
import { useSchedule } from '@shared';

function SpecialistScheduleManager() {
  const {
    // State
    schedules,
    currentSchedule,
    weeklyView,
    monthlyView,
    loading,
    error,
    
    // Actions
    createSchedule,
    updateSchedule,
    generateSlots,
    getWeeklySchedule,
    
    // Helpers
    getSchedulesBySpecialist,
    currentScheduleHasDays
  } = useSchedule();
  
  // Crear horario
  const handleCreateSchedule = async () => {
    await createSchedule({
      specialistId: user.id,
      branchId: selectedBranch.id,
      mondayStart: '09:00',
      mondayEnd: '18:00',
      // ... otros días
    });
  };
  
  // Generar slots para el mes
  const handleGenerateSlots = async () => {
    await generateSlots({
      scheduleId: currentSchedule.id,
      startDate: '2025-06-01',
      endDate: '2025-06-30'
    });
  };
}
```

---

### 2. useAppointmentCalendar()
**Path:** `packages/shared/src/hooks/useAppointmentCalendar.js`

**Usage:**
```javascript
import { useAppointmentCalendar } from '@shared';

function MultiSpecialistCalendar() {
  const {
    // State
    calendarAppointments,
    filters,
    calendarStats,
    todayAppointments,
    loading,
    
    // Actions
    getByDateRange,
    createAppointment,
    updateStatus,
    setFilters,
    clearFilters,
    
    // Helpers
    getAppointmentsByDate,
    getAppointmentsBySpecialist,
    getAppointmentsByBranch
  } = useAppointmentCalendar();
  
  // Cargar citas del mes
  useEffect(() => {
    getByDateRange({
      startDate: '2025-06-01',
      endDate: '2025-06-30',
      branchId: selectedBranch?.id
    });
  }, [selectedBranch]);
  
  // Filtrar por especialista
  const handleSpecialistFilter = (specialistId) => {
    setFilters({ specialistId });
  };
  
  // Confirmar cita
  const handleConfirm = async (appointmentId) => {
    await updateStatus({
      appointmentId,
      status: 'CONFIRMED',
      notes: 'Confirmado por recepcionista'
    });
  };
}
```

---

### 3. useTimeSlot()
**Path:** `packages/shared/src/hooks/useTimeSlot.js`

**Usage:**
```javascript
import { useTimeSlot } from '@shared';

function AvailabilityPicker() {
  const {
    // State
    availableSlots,
    datesWithAvailableSlots,
    slotStats,
    loading,
    
    // Actions
    getAvailableSlots,
    getSlotsByDateRange,
    blockSlot,
    unblockSlot,
    
    // Helpers
    getAvailableSlotsByDate,
    getSlotsBySpecialist
  } = useTimeSlot();
  
  // Obtener slots disponibles para un día
  const handleDateSelect = async (date) => {
    await getAvailableSlots({
      specialistId: specialist.id,
      date: date,
      serviceId: selectedService?.id
    });
  };
  
  // Bloquear slot
  const handleBlockSlot = async (slotId) => {
    await blockSlot({
      slotId,
      reason: 'Reunión interna'
    });
  };
}
```

---

## 📋 Backend API Endpoints

### Schedule Endpoints
```
POST   /api/schedules                           - Crear horario
GET    /api/schedules/:id                       - Obtener horario
PUT    /api/schedules/:id                       - Actualizar horario
DELETE /api/schedules/:id                       - Eliminar horario
GET    /api/schedules/branch/:branchId          - Por sucursal
POST   /api/schedules/generate-slots            - Generar slots
GET    /api/schedules/:id/weekly?date=YYYY-MM-DD - Vista semanal
GET    /api/schedules/:id/monthly?year=2025&month=6 - Vista mensual
```

### Appointment Endpoints (Calendar)
```
GET    /api/appointments                        - Listar citas
GET    /api/appointments/:id                    - Obtener cita
POST   /api/appointments                        - Crear cita
PUT    /api/appointments/:id                    - Actualizar cita
PUT    /api/appointments/:id/status             - Cambiar estado
PUT    /api/appointments/:id/cancel             - Cancelar cita
GET    /api/appointments/range?startDate=...&endDate=... - Por rango
```

### Time Slot Endpoints
```
GET    /api/time-slots/available               - Slots disponibles
GET    /api/time-slots                         - Listar slots
POST   /api/time-slots                         - Crear slot
PUT    /api/time-slots/:id                     - Actualizar slot
PUT    /api/time-slots/:id/block               - Bloquear slot
PUT    /api/time-slots/:id/unblock             - Desbloquear slot
DELETE /api/time-slots/:id                     - Eliminar slot
```

---

## 🎨 UI Implementation Guide

### Mobile (React Native) - Specialist View

**1. Schedule Manager Component:**
```javascript
// packages/business-control-mobile/src/screens/specialist/ScheduleManager.js
import { useSchedule, useTimeSlot } from '@shared';

export default function ScheduleManager() {
  const { 
    currentSchedule, 
    createSchedule, 
    updateSchedule,
    generateSlots 
  } = useSchedule();
  
  const { availableSlots, getAvailableSlots } = useTimeSlot();
  
  // Configurar horario semanal
  const handleSaveSchedule = async (scheduleData) => {
    if (currentSchedule) {
      await updateSchedule({ 
        scheduleId: currentSchedule.id, 
        updateData: scheduleData 
      });
    } else {
      await createSchedule(scheduleData);
    }
  };
  
  // Generar slots para el próximo mes
  const handleGenerateMonth = async () => {
    const startDate = moment().startOf('month').format('YYYY-MM-DD');
    const endDate = moment().endOf('month').format('YYYY-MM-DD');
    
    await generateSlots({
      scheduleId: currentSchedule.id,
      startDate,
      endDate
    });
  };
  
  return (
    <View>
      <WeeklyScheduleForm 
        schedule={currentSchedule}
        onSave={handleSaveSchedule}
      />
      <Button onPress={handleGenerateMonth}>
        Generar Disponibilidad del Mes
      </Button>
    </View>
  );
}
```

---

### Web (React) - Multi-Specialist Calendar

**2. Multi-Specialist Calendar Component:**
```javascript
// packages/web-app/src/components/calendar/MultiSpecialistCalendar.js
import { useAppointmentCalendar, useUserBranch } from '@shared';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

export default function MultiSpecialistCalendar() {
  const { 
    calendarAppointments, 
    getByDateRange,
    setFilters,
    filters 
  } = useAppointmentCalendar();
  
  const { userBranches } = useUserBranch();
  
  // Cargar citas del rango visible
  const handleDatesSet = (dateInfo) => {
    getByDateRange({
      startDate: dateInfo.startStr,
      endDate: dateInfo.endStr,
      branchId: filters.branchId
    });
  };
  
  // Convertir citas a eventos de FullCalendar
  const events = calendarAppointments.map(apt => ({
    id: apt.id,
    title: `${apt.Client?.name} - ${apt.Service?.name}`,
    start: apt.appointmentDate,
    end: apt.endTime,
    backgroundColor: getBranchColor(apt.branchId),
    extendedProps: {
      specialist: apt.Specialist?.name,
      status: apt.status,
      branchId: apt.branchId
    }
  }));
  
  // Color coding por sucursal
  const getBranchColor = (branchId) => {
    const branch = userBranches.find(b => b.branchId === branchId);
    return branch?.color || '#3788d8';
  };
  
  return (
    <div>
      <BranchFilter 
        branches={userBranches}
        selectedBranch={filters.branchId}
        onSelect={(branchId) => setFilters({ branchId })}
      />
      
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="timeGridWeek"
        events={events}
        datesSet={handleDatesSet}
        eventClick={handleEventClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
      />
    </div>
  );
}
```

---

## ✅ Redux Infrastructure Checklist

### Slices
- ✅ scheduleSlice.js (8 async thunks)
- ✅ appointmentCalendarSlice.js (7 async thunks)
- ✅ timeSlotSlice.js (7 async thunks)

### Selectors
- ✅ scheduleSelectors.js (24 selectors)
- ✅ appointmentCalendarSelectors.js (30+ selectors)
- ✅ timeSlotSelectors.js (28 selectors)

### Hooks
- ✅ useSchedule.js
- ✅ useAppointmentCalendar.js
- ✅ useTimeSlot.js

### Store Configuration
- ✅ Added reducers to store/index.js
- ✅ Exported from store/slices/index.js
- ✅ Exported from store/selectors/index.js
- ✅ Exported from shared/index.js

---

## 🚀 Next Steps

### 1. Mobile UI (React Native)
- [ ] SpecialistScheduleManager screen
- [ ] WeeklyScheduleForm component
- [ ] AvailabilityCalendar component
- [ ] SlotBlocker component

### 2. Web UI (React)
- [ ] MultiSpecialistCalendar component
- [ ] BranchColorFilter component
- [ ] AppointmentModal component
- [ ] SpecialistSelector component

### 3. Integration Testing
- [ ] Test schedule creation flow
- [ ] Test slot generation
- [ ] Test appointment filtering
- [ ] Test multi-branch color coding

---

## 📝 Usage Examples

### Example 1: Specialist Creates Weekly Schedule
```javascript
const { createSchedule, generateSlots } = useSchedule();

// 1. Create weekly schedule
const schedule = await createSchedule({
  specialistId: user.id,
  branchId: selectedBranch.id,
  businessId: user.businessId,
  mondayStart: '09:00',
  mondayEnd: '18:00',
  tuesdayStart: '09:00',
  tuesdayEnd: '18:00',
  // ... rest of week
});

// 2. Generate time slots for June 2025
await generateSlots({
  scheduleId: schedule.data.id,
  startDate: '2025-06-01',
  endDate: '2025-06-30'
});
```

### Example 2: Receptionist Views Multi-Specialist Calendar
```javascript
const { 
  getByDateRange, 
  setFilters, 
  calendarAppointments 
} = useAppointmentCalendar();

// Load appointments for all specialists in branch
useEffect(() => {
  getByDateRange({
    startDate: '2025-06-01',
    endDate: '2025-06-30',
    branchId: user.branchIds[0] // Current branch
  });
}, []);

// Filter by specific specialist
const handleSpecialistClick = (specialistId) => {
  setFilters({ specialistId });
};
```

### Example 3: Client Sees Available Slots
```javascript
const { getAvailableSlots, availableSlots } = useTimeSlot();

// Get available slots for booking
const handleDateSelect = async (date) => {
  await getAvailableSlots({
    specialistId: selectedSpecialist.id,
    date: date,
    serviceId: selectedService.id
  });
};

// Display available times
{availableSlots.map(slot => (
  <TimeButton 
    key={slot.id}
    time={slot.startTime}
    onClick={() => handleBookSlot(slot.id)}
  />
))}
```

---

## 🎯 Key Features

1. **Weekly Recurring Schedules** - Specialists configure their availability once
2. **Automatic Slot Generation** - Backend generates individual slots from patterns
3. **Multi-Branch Filtering** - Filter calendar by branch with color coding
4. **Real-time Availability** - Check slot status (AVAILABLE, BOOKED, BLOCKED, BREAK)
5. **Flexible Views** - Daily, weekly, monthly calendar views
6. **Status Management** - PENDING → CONFIRMED → COMPLETED workflow
7. **Exception Handling** - Block specific dates (vacations, holidays)
8. **Custom Pricing Integration** - Works with SpecialistService pricing

---

## 📚 Documentation Files

- `CALENDAR_SYSTEM_REDUX.md` - This file (complete Redux documentation)
- `packages/backend/README.md` - Backend API documentation
- `MULTI_BRANCH_PRICING_IMPLEMENTATION.md` - Multi-branch and pricing docs

---

**Status:** ✅ REDUX INFRASTRUCTURE COMPLETE  
**Date:** June 2025  
**Version:** 1.0.0
