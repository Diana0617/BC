# 📅 Sistema de Calendario y Turnos - Plan de Implementación

## 🎯 Objetivo
Implementar un sistema completo de calendario para gestión de turnos con soporte multi-sucursal, disponibilidad de especialistas y reservas online.

---

## 📊 Estado Actual (Infraestructura Existente)

### ✅ Modelos Backend Disponibles

#### 1. **Appointment** (Completo)
```javascript
{
  businessId: UUID,          // Multi-tenant ✅
  branchId: UUID,            // Multi-sucursal ✅
  specialistId: UUID,        // Asignación de especialista ✅
  serviceId: UUID,           // Servicio a realizar ✅
  clientId: UUID,            // Cliente ✅
  startTime: DATE,           // Inicio del turno ✅
  endTime: DATE,             // Fin del turno ✅
  status: ENUM,              // Estado de la cita ✅
  hasConsent: BOOLEAN,       // Integración con FM-26 ✅
  evidence: JSONB,           // Fotos antes/después ✅
  rescheduleHistory: JSONB   // Historial de reprogramaciones ✅
}
```

#### 2. **Branch** (Completo)
```javascript
{
  businessId: UUID,
  name: STRING,
  businessHours: JSONB,      // Horarios por día ✅
  // Ejemplo:
  {
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    // ...
  },
  timezone: STRING,          // 'America/Bogota' ✅
  status: ENUM               // ACTIVE, INACTIVE, MAINTENANCE ✅
}
```

#### 3. **SpecialistBranchSchedule** (Completo)
```javascript
{
  specialistId: UUID,
  branchId: UUID,
  dayOfWeek: ENUM,           // monday, tuesday, etc. ✅
  startTime: TIME,           // Hora inicio ✅
  endTime: TIME,             // Hora fin ✅
  isActive: BOOLEAN,         // Estado del horario ✅
  priority: INTEGER          // Para resolver conflictos ✅
}
```
- **Índice único**: `(specialistId, branchId, dayOfWeek)`

#### 4. **TimeSlot** (Completo)
```javascript
{
  businessId: UUID,
  specialistId: UUID,
  date: DATE,
  startTime: TIME,
  endTime: TIME,
  duration: INTEGER,         // En minutos
  status: ENUM,              // AVAILABLE, BOOKED, BLOCKED
  appointmentId: UUID        // Si está reservado
}
```

#### 5. **Schedule** (Completo)
```javascript
{
  name: STRING,
  type: ENUM,                // REGULAR, SPECIAL, TEMPORARY
  specialistId: UUID,
  weeklySchedule: JSONB,
  slotDuration: INTEGER,
  bufferTime: INTEGER,
  maxAdvanceBooking: INTEGER
}
```

### ✅ Servicios Backend Disponibles

#### **TimeSlotService** (packages/backend/src/services/TimeSlotService.js)
- `getAvailability()` - Consultar disponibilidad de slots
- `getNextAvailable()` - Encontrar próximo slot disponible
- `getBusinessAvailability()` - Disponibilidad de todo el negocio para una fecha
- `getSlotDetail()` - Detalle de un slot específico
- `groupSlotsByDateAndSpecialist()` - Agrupar slots

### ✅ Rutas Backend Existentes

#### **appointments.js**
- `GET /api/appointments` - Lista de citas (con filtros)
- `POST /api/appointments` - Crear cita
- `GET /api/appointments/:id` - Detalle de cita
- `PATCH /api/appointments/:id/cancel` - Cancelar cita
- ⚠️ `PUT /api/appointments/:id` - Actualizar (501 - No implementado)
- ⚠️ `PATCH /api/appointments/:id/complete` - Completar (501 - No implementado)
- ⚠️ `POST /api/appointments/:id/evidence` - Subir evidencia (501 - No implementado)

#### **schedules.js**
- `POST /api/schedules` - Crear horario
- `POST /api/schedules/:scheduleId/generate-slots` - Generar slots

---

## 🚨 Brechas Identificadas (Lo que falta)

### ❌ Backend

1. **Endpoints de Calendario Agregado**
   - No existe: `GET /api/calendar/business/:businessId` (vista completa del negocio)
   - No existe: `GET /api/calendar/specialist/:specialistId/combined` (agenda combinada multi-sucursal)
   - No existe: `GET /api/calendar/branch/:branchId` (vista de una sucursal)
   - No existe: `GET /api/calendar/available-slots` (slots disponibles para reserva online)

2. **Filtrado por Roles**
   - Los endpoints actuales tienen lógica básica de roles, pero:
     - Falta middleware específico para calendar views
     - No hay restricciones por permisos de módulo (online booking)
     - No hay validación de acceso multi-sucursal para recepcionistas

3. **Lógica de Negocio Faltante**
   - ❌ Algoritmo para combinar horarios de sucursal + disponibilidad de especialista
   - ❌ Validación de conflictos al crear citas
   - ❌ Generación automática de slots basada en `Service.duration`
   - ❌ Manejo de excepciones (días feriados, cierres especiales)
   - ❌ Reprogramación de citas con validación de disponibilidad

4. **Endpoints Faltantes**
   - `PUT /api/appointments/:id` - Actualizar cita (completar implementación)
   - `PATCH /api/appointments/:id/complete` - Marcar como completada
   - `POST /api/appointments/:id/evidence` - Subir evidencia
   - `POST /api/appointments/:id/reschedule` - Reprogramar cita
   - `GET /api/branches/:branchId/specialists` - Especialistas disponibles en sucursal
   - `GET /api/specialists/:id/schedule` - Horario de un especialista

### ❌ Frontend

1. **Componentes de Calendario**
   - ❌ CalendarView - Vista principal del calendario
   - ❌ DayView, WeekView, MonthView - Vistas alternativas
   - ❌ AppointmentCard - Tarjeta de cita
   - ❌ AppointmentModal - Modal para crear/editar citas
   - ❌ AvailabilitySlotPicker - Selector de horarios disponibles
   - ❌ SpecialistScheduleManager - Gestor de disponibilidad de especialistas

2. **Redux State Management**
   - ❌ calendarSlice.js - State para calendario
   - ❌ appointmentSlice.js - State para citas
   - ❌ availabilitySlice.js - State para disponibilidad

3. **API Clients**
   - ❌ calendarApi.js - Cliente HTTP para calendario
   - ❌ appointmentApi.js - Cliente HTTP para citas
   - ❌ availabilityApi.js - Cliente HTTP para disponibilidad

---

## 🛠️ Plan de Implementación

### Fase 1: Completar Backend (Alta Prioridad)

#### 1.1 Crear CalendarController
**Archivo**: `packages/backend/src/controllers/CalendarController.js`

```javascript
class CalendarController {
  // Vista completa del negocio (Owner/Admin)
  static async getBusinessCalendar(req, res) {
    // Parámetros: businessId, startDate, endDate, branchId (opcional)
    // Retorna: Todas las citas de todas las sucursales
  }

  // Vista de sucursal específica (Recepcionista)
  static async getBranchCalendar(req, res) {
    // Parámetros: branchId, startDate, endDate
    // Retorna: Citas de la sucursal
  }

  // Agenda combinada de especialista (Especialista)
  static async getSpecialistCombinedCalendar(req, res) {
    // Parámetros: specialistId, startDate, endDate
    // Retorna: Citas del especialista en todas sus sucursales
  }

  // Slots disponibles para reserva online (Cliente)
  static async getAvailableSlots(req, res) {
    // Parámetros: businessId, branchId, specialistId, serviceId, date
    // Lógica:
    // 1. Obtener horarios de la sucursal (Branch.businessHours)
    // 2. Obtener disponibilidad del especialista (SpecialistBranchSchedule)
    // 3. Obtener duración del servicio (Service.duration)
    // 4. Generar slots cada X minutos (basado en duración)
    // 5. Excluir citas existentes
    // 6. Retornar slots disponibles
  }

  // Obtener especialistas disponibles en sucursal
  static async getBranchSpecialists(req, res) {
    // Parámetros: branchId, serviceId (opcional), date, time
    // Retorna: Lista de especialistas con disponibilidad
  }
}
```

#### 1.2 Crear AvailabilityService
**Archivo**: `packages/backend/src/services/AvailabilityService.js`

```javascript
class AvailabilityService {
  /**
   * Generar slots disponibles para un día
   * @param {Object} params
   * @param {UUID} params.businessId
   * @param {UUID} params.branchId
   * @param {UUID} params.specialistId
   * @param {UUID} params.serviceId
   * @param {Date} params.date
   * @returns {Array} slots disponibles
   */
  static async generateAvailableSlots({
    businessId,
    branchId,
    specialistId,
    serviceId,
    date
  }) {
    // 1. Validar que la sucursal esté abierta ese día
    const branch = await Branch.findByPk(branchId);
    const dayOfWeek = this.getDayName(date); // 'monday', 'tuesday', etc.
    const branchHours = branch.businessHours[dayOfWeek];
    
    if (branchHours.closed) {
      return []; // Sucursal cerrada
    }

    // 2. Obtener horario del especialista para ese día/sucursal
    const specialistSchedule = await SpecialistBranchSchedule.findOne({
      where: {
        specialistId,
        branchId,
        dayOfWeek,
        isActive: true
      }
    });

    if (!specialistSchedule) {
      return []; // Especialista no trabaja ese día en esa sucursal
    }

    // 3. Obtener duración del servicio
    const service = await Service.findByPk(serviceId);
    const slotDuration = service.duration; // En minutos

    // 4. Calcular intersección de horarios
    const workStart = this.maxTime(branchHours.open, specialistSchedule.startTime);
    const workEnd = this.minTime(branchHours.close, specialistSchedule.endTime);

    // 5. Generar slots cada X minutos
    const slots = this.generateTimeSlots(workStart, workEnd, slotDuration);

    // 6. Obtener citas existentes del especialista ese día
    const existingAppointments = await Appointment.findAll({
      where: {
        specialistId,
        startTime: {
          [Op.gte]: new Date(`${date}T00:00:00`),
          [Op.lt]: new Date(`${date}T23:59:59`)
        },
        status: {
          [Op.notIn]: ['CANCELED', 'NO_SHOW']
        }
      }
    });

    // 7. Filtrar slots ocupados
    const availableSlots = slots.filter(slot => {
      return !this.isSlotOccupied(slot, existingAppointments);
    });

    return availableSlots;
  }

  static generateTimeSlots(startTime, endTime, duration) {
    const slots = [];
    let current = this.parseTime(startTime);
    const end = this.parseTime(endTime);

    while (current < end) {
      const slotEnd = this.addMinutes(current, duration);
      if (slotEnd <= end) {
        slots.push({
          startTime: this.formatTime(current),
          endTime: this.formatTime(slotEnd),
          available: true
        });
      }
      current = slotEnd;
    }

    return slots;
  }

  static isSlotOccupied(slot, appointments) {
    const slotStart = this.parseTime(slot.startTime);
    const slotEnd = this.parseTime(slot.endTime);

    return appointments.some(apt => {
      const aptStart = new Date(apt.startTime);
      const aptEnd = new Date(apt.endTime);
      
      // Hay conflicto si hay solapamiento
      return (slotStart < aptEnd && slotEnd > aptStart);
    });
  }

  // Helper functions
  static getDayName(date) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date(date).getDay()];
  }

  static parseTime(timeString) {
    // Convertir "09:00" a Date object
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  static formatTime(date) {
    return date.toTimeString().slice(0, 5); // "09:00"
  }

  static addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
  }

  static maxTime(time1, time2) {
    return this.parseTime(time1) > this.parseTime(time2) ? time1 : time2;
  }

  static minTime(time1, time2) {
    return this.parseTime(time1) < this.parseTime(time2) ? time1 : time2;
  }
}
```

#### 1.3 Crear Rutas de Calendario
**Archivo**: `packages/backend/src/routes/calendar.js`

```javascript
const express = require('express');
const router = express.Router();
const CalendarController = require('../controllers/CalendarController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.use(authenticateToken);

// Vista completa del negocio (Owner/Admin)
router.get('/business/:businessId',
  authorizeRole(['OWNER', 'BUSINESS_ADMIN']),
  CalendarController.getBusinessCalendar
);

// Vista de sucursal (Recepcionista)
router.get('/branch/:branchId',
  authorizeRole(['OWNER', 'BUSINESS_ADMIN', 'RECEPTIONIST']),
  CalendarController.getBranchCalendar
);

// Agenda combinada de especialista
router.get('/specialist/:specialistId',
  authorizeRole(['OWNER', 'BUSINESS_ADMIN', 'SPECIALIST', 'SPECIALIST_RECEPTIONIST']),
  CalendarController.getSpecialistCombinedCalendar
);

// Slots disponibles (puede ser público si online booking está activo)
router.get('/available-slots',
  CalendarController.getAvailableSlots
);

// Especialistas disponibles en sucursal
router.get('/branch/:branchId/specialists',
  CalendarController.getBranchSpecialists
);

module.exports = router;
```

#### 1.4 Completar AppointmentController
**Archivo**: `packages/backend/src/controllers/AppointmentController.js`

Implementar los métodos faltantes:

```javascript
// Actualizar cita
static async updateAppointment(req, res) {
  const { id } = req.params;
  const { startTime, endTime, serviceId, specialistId, notes } = req.body;

  // 1. Validar permisos (solo owner, admin, receptionist o el especialista asignado)
  // 2. Si cambia horario, validar disponibilidad
  // 3. Actualizar la cita
  // 4. Si cambia servicio, recalcular totalAmount
}

// Completar cita
static async completeAppointment(req, res) {
  const { id } = req.params;
  
  // 1. Cambiar status a COMPLETED
  // 2. Registrar fecha de completado
  // 3. Si tiene comisión configurada, calcular y guardar
}

// Reprogramar cita
static async rescheduleAppointment(req, res) {
  const { id } = req.params;
  const { newStartTime, reason } = req.body;

  // 1. Validar disponibilidad del nuevo horario
  // 2. Calcular newEndTime basado en duración del servicio
  // 3. Actualizar startTime y endTime
  // 4. Agregar a rescheduleHistory JSONB:
  //    { oldStartTime, newStartTime, reason, rescheduledBy, rescheduledAt }
  // 5. Cambiar status a RESCHEDULED (opcional) o mantener CONFIRMED
}

// Subir evidencia
static async uploadEvidence(req, res) {
  const { id } = req.params;
  const { type } = req.body; // 'before' o 'after'
  const files = req.files; // multer

  // 1. Validar que la cita existe y pertenece al negocio
  // 2. Validar que el usuario es el especialista asignado
  // 3. Guardar archivos en storage (S3 o local)
  // 4. Actualizar evidence JSONB:
  //    { before: [url1, url2], after: [url3, url4], documents: [] }
}
```

#### 1.5 Registrar Rutas en server.js
**Archivo**: `packages/backend/server.js`

```javascript
// Agregar después de las rutas existentes
const calendarRoutes = require('./src/routes/calendar');
app.use('/api/calendar', calendarRoutes);
```

---

### Fase 2: Frontend - Redux & API (Alta Prioridad)

#### 2.1 Crear appointmentSlice.js
**Archivo**: `packages/shared/src/redux/slices/appointmentSlice.js`

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

// Thunks
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAll',
  async ({ businessId, filters }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        businessId,
        ...filters // page, limit, status, specialistId, branchId, date, etc.
      });
      const response = await apiClient.get(`/appointments?${params}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchAppointmentDetail = createAsyncThunk(
  'appointments/fetchDetail',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/appointments/${appointmentId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/create',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/appointments', appointmentData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/appointments/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const rescheduleAppointment = createAsyncThunk(
  'appointments/reschedule',
  async ({ id, newStartTime, reason }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/appointments/${id}/reschedule`, {
        newStartTime,
        reason
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancel',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`/appointments/${id}/cancel`, { reason });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const completeAppointment = createAsyncThunk(
  'appointments/complete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`/appointments/${id}/complete`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState: {
    appointments: [],
    currentAppointment: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    },
    loading: false,
    error: null,
    filters: {
      status: null,
      specialistId: null,
      branchId: null,
      date: null,
      startDate: null,
      endDate: null
    }
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentAppointment: (state) => {
      state.currentAppointment = null;
    },
    resetAppointments: (state) => {
      state.appointments = [];
      state.pagination = { total: 0, page: 1, limit: 10, totalPages: 0 };
    }
  },
  extraReducers: (builder) => {
    // fetchAppointments
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.appointments;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al cargar citas';
      });

    // fetchAppointmentDetail
    builder
      .addCase(fetchAppointmentDetail.fulfilled, (state, action) => {
        state.currentAppointment = action.payload;
      });

    // createAppointment
    builder
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.appointments.unshift(action.payload);
      });

    // updateAppointment
    builder
      .addCase(updateAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        if (state.currentAppointment?.id === action.payload.id) {
          state.currentAppointment = action.payload;
        }
      });

    // cancelAppointment
    builder
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index].status = 'CANCELED';
        }
      });
  }
});

export const { setFilters, clearCurrentAppointment, resetAppointments } = appointmentSlice.actions;
export default appointmentSlice.reducer;
```

#### 2.2 Crear calendarSlice.js
**Archivo**: `packages/shared/src/redux/slices/calendarSlice.js`

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

// Thunks
export const fetchBusinessCalendar = createAsyncThunk(
  'calendar/fetchBusiness',
  async ({ businessId, startDate, endDate, branchId }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        ...(branchId && { branchId })
      });
      const response = await apiClient.get(`/calendar/business/${businessId}?${params}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchBranchCalendar = createAsyncThunk(
  'calendar/fetchBranch',
  async ({ branchId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ startDate, endDate });
      const response = await apiClient.get(`/calendar/branch/${branchId}?${params}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchSpecialistCalendar = createAsyncThunk(
  'calendar/fetchSpecialist',
  async ({ specialistId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ startDate, endDate });
      const response = await apiClient.get(`/calendar/specialist/${specialistId}?${params}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchAvailableSlots = createAsyncThunk(
  'calendar/fetchAvailableSlots',
  async ({ businessId, branchId, specialistId, serviceId, date }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        businessId,
        branchId,
        specialistId,
        serviceId,
        date
      });
      const response = await apiClient.get(`/calendar/available-slots?${params}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const calendarSlice = createSlice({
  name: 'calendar',
  initialState: {
    events: [], // Citas formateadas para calendario
    availableSlots: [],
    view: 'month', // 'day', 'week', 'month'
    currentDate: new Date().toISOString().split('T')[0],
    selectedEvent: null,
    loading: false,
    error: null
  },
  reducers: {
    setView: (state, action) => {
      state.view = action.payload;
    },
    setCurrentDate: (state, action) => {
      state.currentDate = action.payload;
    },
    setSelectedEvent: (state, action) => {
      state.selectedEvent = action.payload;
    },
    clearAvailableSlots: (state) => {
      state.availableSlots = [];
    }
  },
  extraReducers: (builder) => {
    // fetchBusinessCalendar
    builder
      .addCase(fetchBusinessCalendar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusinessCalendar.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchBusinessCalendar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al cargar calendario';
      });

    // fetchAvailableSlots
    builder
      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
        state.availableSlots = action.payload;
      });
  }
});

export const { setView, setCurrentDate, setSelectedEvent, clearAvailableSlots } = calendarSlice.actions;
export default calendarSlice.reducer;
```

#### 2.3 Crear API Clients
**Archivo**: `packages/shared/src/api/appointmentApi.js`

```javascript
import apiClient from './client';

export const appointmentApi = {
  // Obtener lista de citas
  getAppointments: (businessId, filters = {}) => {
    const params = new URLSearchParams({ businessId, ...filters });
    return apiClient.get(`/appointments?${params}`);
  },

  // Obtener detalle de cita
  getAppointment: (appointmentId) => {
    return apiClient.get(`/appointments/${appointmentId}`);
  },

  // Crear cita
  createAppointment: (data) => {
    return apiClient.post('/appointments', data);
  },

  // Actualizar cita
  updateAppointment: (appointmentId, data) => {
    return apiClient.put(`/appointments/${appointmentId}`, data);
  },

  // Reprogramar cita
  rescheduleAppointment: (appointmentId, newStartTime, reason) => {
    return apiClient.post(`/appointments/${appointmentId}/reschedule`, {
      newStartTime,
      reason
    });
  },

  // Cancelar cita
  cancelAppointment: (appointmentId, reason) => {
    return apiClient.patch(`/appointments/${appointmentId}/cancel`, { reason });
  },

  // Completar cita
  completeAppointment: (appointmentId) => {
    return apiClient.patch(`/appointments/${appointmentId}/complete`);
  },

  // Subir evidencia
  uploadEvidence: (appointmentId, type, files) => {
    const formData = new FormData();
    formData.append('type', type);
    files.forEach((file) => {
      formData.append('files', file);
    });
    return apiClient.post(`/appointments/${appointmentId}/evidence`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export default appointmentApi;
```

**Archivo**: `packages/shared/src/api/calendarApi.js`

```javascript
import apiClient from './client';

export const calendarApi = {
  // Vista completa del negocio
  getBusinessCalendar: (businessId, startDate, endDate, branchId = null) => {
    const params = new URLSearchParams({
      startDate,
      endDate,
      ...(branchId && { branchId })
    });
    return apiClient.get(`/calendar/business/${businessId}?${params}`);
  },

  // Vista de sucursal
  getBranchCalendar: (branchId, startDate, endDate) => {
    const params = new URLSearchParams({ startDate, endDate });
    return apiClient.get(`/calendar/branch/${branchId}?${params}`);
  },

  // Agenda de especialista
  getSpecialistCalendar: (specialistId, startDate, endDate) => {
    const params = new URLSearchParams({ startDate, endDate });
    return apiClient.get(`/calendar/specialist/${specialistId}?${params}`);
  },

  // Slots disponibles
  getAvailableSlots: (businessId, branchId, specialistId, serviceId, date) => {
    const params = new URLSearchParams({
      businessId,
      branchId,
      specialistId,
      serviceId,
      date
    });
    return apiClient.get(`/calendar/available-slots?${params}`);
  },

  // Especialistas disponibles en sucursal
  getBranchSpecialists: (branchId, serviceId = null, date = null, time = null) => {
    const params = new URLSearchParams({
      ...(serviceId && { serviceId }),
      ...(date && { date }),
      ...(time && { time })
    });
    return apiClient.get(`/calendar/branch/${branchId}/specialists?${params}`);
  }
};

export default calendarApi;
```

#### 2.4 Registrar en Redux Store
**Archivo**: `packages/shared/src/redux/store/index.js`

```javascript
import appointmentReducer from '../slices/appointmentSlice';
import calendarReducer from '../slices/calendarSlice';

// ...

const store = configureStore({
  reducer: {
    // ... reducers existentes
    appointments: appointmentReducer,
    calendar: calendarReducer
  }
});
```

---

### Fase 3: Frontend - Componentes de UI (Media Prioridad)

#### 3.1 Dependencias a Instalar

```bash
cd packages/web-app
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
npm install date-fns
```

#### 3.2 CalendarView Component
**Archivo**: `packages/web-app/src/components/Calendar/CalendarView.jsx`

```javascript
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { fetchBusinessCalendar } from '../../redux/slices/calendarSlice';
import AppointmentModal from './AppointmentModal';

const CalendarView = ({ businessId, branchId = null }) => {
  const dispatch = useDispatch();
  const { events, loading } = useSelector((state) => state.calendar);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadCalendar();
  }, [businessId, branchId]);

  const loadCalendar = () => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    dispatch(fetchBusinessCalendar({
      businessId,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      branchId
    }));
  };

  const handleEventClick = (info) => {
    setSelectedAppointment(info.event.extendedProps.appointment);
    setShowModal(true);
  };

  const handleDateClick = (info) => {
    // Abrir modal para crear nueva cita
    setSelectedAppointment(null);
    setShowModal(true);
  };

  // Formatear eventos para FullCalendar
  const calendarEvents = events.map(apt => ({
    id: apt.id,
    title: `${apt.client?.firstName} ${apt.client?.lastName} - ${apt.service?.name}`,
    start: apt.startTime,
    end: apt.endTime,
    backgroundColor: getStatusColor(apt.status),
    extendedProps: {
      appointment: apt
    }
  }));

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#FFA500',
      CONFIRMED: '#4CAF50',
      IN_PROGRESS: '#2196F3',
      COMPLETED: '#9E9E9E',
      CANCELED: '#F44336',
      NO_SHOW: '#FF6347',
      RESCHEDULED: '#FFD700'
    };
    return colors[status] || '#000';
  };

  return (
    <div className="calendar-view">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={calendarEvents}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        slotMinTime="07:00:00"
        slotMaxTime="21:00:00"
        slotDuration="00:30:00"
        locale="es"
        timeZone="America/Bogota"
        height="auto"
      />

      {showModal && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => setShowModal(false)}
          onSuccess={loadCalendar}
        />
      )}
    </div>
  );
};

export default CalendarView;
```

#### 3.3 AppointmentModal Component
**Archivo**: `packages/web-app/src/components/Calendar/AppointmentModal.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  createAppointment,
  updateAppointment,
  cancelAppointment
} from '../../redux/slices/appointmentSlice';
import AvailabilitySlotPicker from './AvailabilitySlotPicker';

const AppointmentModal = ({ appointment, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    branchId: '',
    clientId: '',
    specialistId: '',
    serviceId: '',
    startTime: '',
    endTime: '',
    notes: ''
  });

  useEffect(() => {
    if (appointment) {
      setFormData({
        branchId: appointment.branchId || '',
        clientId: appointment.clientId || '',
        specialistId: appointment.specialistId || '',
        serviceId: appointment.serviceId || '',
        startTime: appointment.startTime || '',
        endTime: appointment.endTime || '',
        notes: appointment.notes || ''
      });
    }
  }, [appointment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (appointment) {
        await dispatch(updateAppointment({ id: appointment.id, data: formData }));
      } else {
        await dispatch(createAppointment(formData));
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error guardando cita:', error);
    }
  };

  const handleCancel = async () => {
    if (window.confirm('¿Está seguro de cancelar esta cita?')) {
      await dispatch(cancelAppointment({ id: appointment.id, reason: 'Cancelado por usuario' }));
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{appointment ? 'Editar Cita' : 'Nueva Cita'}</h2>

        <form onSubmit={handleSubmit}>
          {/* Seleccionar sucursal */}
          <div className="form-group">
            <label>Sucursal</label>
            <select
              value={formData.branchId}
              onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              required
            >
              <option value="">Seleccione sucursal</option>
              {/* Cargar desde Redux */}
            </select>
          </div>

          {/* Seleccionar cliente */}
          <div className="form-group">
            <label>Cliente</label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              required
            >
              <option value="">Seleccione cliente</option>
              {/* Cargar desde Redux */}
            </select>
          </div>

          {/* Seleccionar servicio */}
          <div className="form-group">
            <label>Servicio</label>
            <select
              value={formData.serviceId}
              onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
              required
            >
              <option value="">Seleccione servicio</option>
              {/* Cargar desde Redux */}
            </select>
          </div>

          {/* Seleccionar especialista */}
          <div className="form-group">
            <label>Especialista</label>
            <select
              value={formData.specialistId}
              onChange={(e) => setFormData({ ...formData, specialistId: e.target.value })}
              required
            >
              <option value="">Seleccione especialista</option>
              {/* Cargar desde Redux */}
            </select>
          </div>

          {/* Selector de horario disponible */}
          {formData.branchId && formData.specialistId && formData.serviceId && (
            <AvailabilitySlotPicker
              branchId={formData.branchId}
              specialistId={formData.specialistId}
              serviceId={formData.serviceId}
              selectedSlot={formData.startTime}
              onSelectSlot={(startTime, endTime) => {
                setFormData({ ...formData, startTime, endTime });
              }}
            />
          )}

          {/* Notas */}
          <div className="form-group">
            <label>Notas</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
            />
          </div>

          {/* Botones */}
          <div className="modal-actions">
            {appointment && (
              <button type="button" onClick={handleCancel} className="btn-danger">
                Cancelar Cita
              </button>
            )}
            <button type="button" onClick={onClose} className="btn-secondary">
              Cerrar
            </button>
            <button type="submit" className="btn-primary">
              {appointment ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;
```

#### 3.4 AvailabilitySlotPicker Component
**Archivo**: `packages/web-app/src/components/Calendar/AvailabilitySlotPicker.jsx`

```javascript
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAvailableSlots } from '../../redux/slices/calendarSlice';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

const AvailabilitySlotPicker = ({
  branchId,
  specialistId,
  serviceId,
  selectedSlot,
  onSelectSlot
}) => {
  const dispatch = useDispatch();
  const { availableSlots, loading } = useSelector((state) => state.calendar);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadSlots();
  }, [branchId, specialistId, serviceId, selectedDate]);

  const loadSlots = () => {
    const businessId = localStorage.getItem('businessId'); // O desde Redux
    dispatch(fetchAvailableSlots({
      businessId,
      branchId,
      specialistId,
      serviceId,
      date: format(selectedDate, 'yyyy-MM-dd')
    }));
  };

  // Generar próximos 7 días
  const nextDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  return (
    <div className="availability-slot-picker">
      <h4>Seleccionar Horario</h4>

      {/* Selector de fecha */}
      <div className="date-selector">
        {nextDays.map((date) => (
          <button
            key={date.toISOString()}
            className={`date-btn ${
              format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                ? 'active'
                : ''
            }`}
            onClick={() => setSelectedDate(date)}
          >
            <div className="day-name">{format(date, 'EEE', { locale: es })}</div>
            <div className="day-number">{format(date, 'd')}</div>
          </button>
        ))}
      </div>

      {/* Lista de slots */}
      <div className="slots-container">
        {loading ? (
          <p>Cargando horarios disponibles...</p>
        ) : availableSlots.length === 0 ? (
          <p>No hay horarios disponibles para esta fecha</p>
        ) : (
          <div className="slots-grid">
            {availableSlots.map((slot) => (
              <button
                key={`${slot.startTime}-${slot.endTime}`}
                className={`slot-btn ${
                  selectedSlot === slot.startTime ? 'selected' : ''
                }`}
                onClick={() => onSelectSlot(slot.startTime, slot.endTime)}
              >
                {slot.startTime} - {slot.endTime}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilitySlotPicker;
```

---

### Fase 4: Testing y Validación

#### 4.1 Tests Backend (Insomnia/Postman)

Crear colección de tests para:

1. **Calendar Endpoints**
   ```
   GET /api/calendar/business/:businessId?startDate=2024-01-01&endDate=2024-01-31
   GET /api/calendar/branch/:branchId?startDate=2024-01-01&endDate=2024-01-31
   GET /api/calendar/specialist/:specialistId?startDate=2024-01-01&endDate=2024-01-31
   GET /api/calendar/available-slots?businessId=xxx&branchId=xxx&specialistId=xxx&serviceId=xxx&date=2024-01-15
   ```

2. **Appointment Endpoints**
   ```
   POST /api/appointments
   PUT /api/appointments/:id
   POST /api/appointments/:id/reschedule
   PATCH /api/appointments/:id/cancel
   PATCH /api/appointments/:id/complete
   ```

#### 4.2 Tests Frontend

- Verificar que el calendario carga correctamente
- Probar creación de citas desde el calendario
- Verificar que los slots disponibles se muestran correctamente
- Probar reprogramación de citas (drag & drop)
- Validar filtros por sucursal/especialista
- Probar vistas: día, semana, mes

#### 4.3 Tests de Integración

- Crear cita → Verificar que aparece en calendario
- Reprogramar cita → Verificar actualización en calendario
- Cancelar cita → Verificar que desaparece o cambia estado
- Verificar multi-sucursal: especialista en 2 sucursales
- Verificar roles: Owner ve todo, Receptionist solo su sucursal

---

### Fase 5: Optimizaciones y Features Avanzadas

#### 5.1 Caché de Disponibilidad
- Implementar Redis para cachear slots disponibles
- Invalidar caché al crear/cancelar/reprogramar citas

#### 5.2 Notificaciones
- Enviar email/SMS de confirmación de cita
- Recordatorios automáticos 24h antes
- Notificación de reprogramación

#### 5.3 Reservas Online (Cliente)
- Widget de reserva embebible
- Vista pública de disponibilidad (si módulo activo)
- Confirmación por email

#### 5.4 Reportes y Estadísticas
- Dashboard de utilización de agenda
- Tasa de no-show por especialista
- Horarios pico
- Gráficos de ocupación

---

## 📋 Checklist de Implementación

### Backend
- [ ] Crear `CalendarController.js`
- [ ] Crear `AvailabilityService.js`
- [ ] Crear `routes/calendar.js`
- [ ] Completar `AppointmentController.js` (update, complete, reschedule, evidence)
- [ ] Registrar rutas en `server.js`
- [ ] Tests de endpoints con Insomnia

### Frontend - Redux
- [ ] Crear `appointmentSlice.js`
- [ ] Crear `calendarSlice.js`
- [ ] Crear `appointmentApi.js`
- [ ] Crear `calendarApi.js`
- [ ] Registrar reducers en store

### Frontend - UI
- [ ] Instalar dependencias (`@fullcalendar`, `date-fns`)
- [ ] Crear `CalendarView.jsx`
- [ ] Crear `AppointmentModal.jsx`
- [ ] Crear `AvailabilitySlotPicker.jsx`
- [ ] Crear estilos CSS para calendario

### Testing
- [ ] Tests de disponibilidad (AvailabilityService)
- [ ] Tests de creación de citas
- [ ] Tests de reprogramación
- [ ] Tests de cancelación
- [ ] Tests de roles (Owner, Recep, Specialist)
- [ ] Tests de multi-sucursal

### Documentación
- [ ] Documentar API de Calendar
- [ ] Documentar componentes de Calendar
- [ ] Guía de uso para usuarios finales
- [ ] Ejemplos de integración

---

## 🚀 Próximos Pasos

1. **Revisar y aprobar este plan** con el equipo
2. **Priorizar fases** según necesidades del negocio
3. **Asignar tareas** a desarrolladores
4. **Definir sprint** para implementación
5. **Configurar entorno de pruebas** con datos de ejemplo

---

## 📞 Soporte

Para dudas o sugerencias sobre la implementación del sistema de calendario, contactar al equipo de desarrollo.

---

**Última actualización**: {{ FECHA }}
**Versión**: 1.0
**Estado**: Planificación
