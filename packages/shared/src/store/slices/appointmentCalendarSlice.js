import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';

/**
 * 📆 APPOINTMENT CALENDAR SLICE
 * Gestión de citas con vista de calendario multi-especialista
 */

// ==================== ASYNC THUNKS ====================

// Obtener citas (con filtros para calendario)
export const getAppointments = createAsyncThunk(
  'appointmentCalendar/getAppointments',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/appointments', { params: filters });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al obtener citas' });
    }
  }
);

// Obtener cita por ID
export const getAppointmentById = createAsyncThunk(
  'appointmentCalendar/getAppointmentById',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al obtener cita' });
    }
  }
);

// Crear cita
export const createAppointment = createAsyncThunk(
  'appointmentCalendar/createAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al crear cita' });
    }
  }
);

// Actualizar cita
export const updateAppointment = createAsyncThunk(
  'appointmentCalendar/updateAppointment',
  async ({ appointmentId, updateData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al actualizar cita' });
    }
  }
);

// Cambiar estado de cita
export const updateAppointmentStatus = createAsyncThunk(
  'appointmentCalendar/updateAppointmentStatus',
  async ({ appointmentId, status, reason }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}/status`, { status, reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al cambiar estado' });
    }
  }
);

// Cancelar cita
export const cancelAppointment = createAsyncThunk(
  'appointmentCalendar/cancelAppointment',
  async ({ appointmentId, reason }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/appointments/${appointmentId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al cancelar cita' });
    }
  }
);

// Obtener citas por rango de fechas (para vista calendario)
export const getAppointmentsByDateRange = createAsyncThunk(
  'appointmentCalendar/getAppointmentsByDateRange',
  async ({ startDate, endDate, branchId, specialistId }, { rejectWithValue }) => {
    try {
      const params = { startDate, endDate };
      if (branchId) params.branchId = branchId;
      if (specialistId) params.specialistId = specialistId;
      
      const response = await api.get('/appointments', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al obtener citas' });
    }
  }
);

// ==================== INITIAL STATE ====================

const initialState = {
  appointments: [], // Lista de citas
  calendarAppointments: [], // Citas para vista calendario
  selectedAppointment: null, // Cita seleccionada
  filters: {
    startDate: null,
    endDate: null,
    branchId: null,
    specialistId: null,
    status: null
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  },
  loading: false,
  error: null,
  success: false,
  message: null
};

// ==================== SLICE ====================

const appointmentCalendarSlice = createSlice({
  name: 'appointmentCalendar',
  initialState,
  reducers: {
    clearAppointmentError: (state) => {
      state.error = null;
    },
    clearAppointmentSuccess: (state) => {
      state.success = false;
      state.message = null;
    },
    resetAppointmentState: (state) => {
      Object.assign(state, initialState);
    },
    setSelectedAppointment: (state, action) => {
      state.selectedAppointment = action.payload;
    },
    setAppointmentFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearAppointmentFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCalendarView: (state, action) => {
      // action.payload = { startDate, endDate }
      state.filters.startDate = action.payload.startDate;
      state.filters.endDate = action.payload.endDate;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Appointments
      .addCase(getAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.data?.appointments || [];
        if (action.payload.data?.pagination) {
          state.pagination = action.payload.data.pagination;
        }
      })
      .addCase(getAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al obtener citas';
      })

      // Get Appointment by ID
      .addCase(getAppointmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppointmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAppointment = action.payload.data;
      })
      .addCase(getAppointmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al obtener cita';
      })

      // Create Appointment
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Cita creada exitosamente';
        if (action.payload.data) {
          state.appointments.unshift(action.payload.data);
          state.calendarAppointments.push(action.payload.data);
        }
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al crear cita';
        state.success = false;
      })

      // Update Appointment
      .addCase(updateAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Cita actualizada exitosamente';
        if (action.payload.data) {
          const index = state.appointments.findIndex(a => a.id === action.payload.data.id);
          if (index !== -1) {
            state.appointments[index] = action.payload.data;
          }
          const calIndex = state.calendarAppointments.findIndex(a => a.id === action.payload.data.id);
          if (calIndex !== -1) {
            state.calendarAppointments[calIndex] = action.payload.data;
          }
          if (state.selectedAppointment?.id === action.payload.data.id) {
            state.selectedAppointment = action.payload.data;
          }
        }
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al actualizar cita';
        state.success = false;
      })

      // Update Appointment Status
      .addCase(updateAppointmentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Estado actualizado exitosamente';
        if (action.payload.data) {
          const index = state.appointments.findIndex(a => a.id === action.payload.data.id);
          if (index !== -1) {
            state.appointments[index] = action.payload.data;
          }
          const calIndex = state.calendarAppointments.findIndex(a => a.id === action.payload.data.id);
          if (calIndex !== -1) {
            state.calendarAppointments[calIndex] = action.payload.data;
          }
        }
      })
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al cambiar estado';
        state.success = false;
      })

      // Cancel Appointment
      .addCase(cancelAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Cita cancelada exitosamente';
        if (action.payload.data) {
          const index = state.appointments.findIndex(a => a.id === action.payload.data.id);
          if (index !== -1) {
            state.appointments[index] = action.payload.data;
          }
          const calIndex = state.calendarAppointments.findIndex(a => a.id === action.payload.data.id);
          if (calIndex !== -1) {
            state.calendarAppointments[calIndex] = action.payload.data;
          }
        }
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al cancelar cita';
        state.success = false;
      })

      // Get Appointments by Date Range (Calendar View)
      .addCase(getAppointmentsByDateRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppointmentsByDateRange.fulfilled, (state, action) => {
        state.loading = false;
        state.calendarAppointments = action.payload.data?.appointments || [];
      })
      .addCase(getAppointmentsByDateRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al obtener citas';
      });
  }
});

export const {
  clearAppointmentError,
  clearAppointmentSuccess,
  resetAppointmentState,
  setSelectedAppointment,
  setAppointmentFilters,
  clearAppointmentFilters,
  setCalendarView
} = appointmentCalendarSlice.actions;

export default appointmentCalendarSlice.reducer;
