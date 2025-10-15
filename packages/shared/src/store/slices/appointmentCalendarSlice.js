import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import appointmentApi from '../../api/appointmentApi';

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
      const data = await appointmentApi.getAppointments(filters);
      return data;
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
      const data = await appointmentApi.getAppointmentById(appointmentId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al obtener cita' });
    }
  }
);

// Crear nueva cita
export const createAppointment = createAsyncThunk(
  'appointmentCalendar/createAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const data = await appointmentApi.createAppointment(appointmentData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al crear cita' });
    }
  }
);

// Actualizar cita existente
export const updateAppointment = createAsyncThunk(
  'appointmentCalendar/updateAppointment',
  async ({ appointmentId, updateData }, { rejectWithValue }) => {
    try {
      const data = await appointmentApi.updateAppointment(appointmentId, updateData);
      return data;
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
      const data = await appointmentApi.updateAppointmentStatus(appointmentId, { status, reason });
      return data;
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
      const data = await appointmentApi.cancelAppointment(appointmentId, { reason });
      return data;
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
      const filters = { startDate, endDate };
      if (branchId) filters.branchId = branchId;
      if (specialistId) filters.specialistId = specialistId;
      
      const data = await appointmentApi.getAppointmentsByDateRange(filters);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al obtener citas' });
    }
  }
);

// ==================== NUEVAS ACCIONES DE VALIDACIÓN ====================

// Completar cita (con validaciones de reglas de negocio)
export const completeAppointment = createAsyncThunk(
  'appointmentCalendar/completeAppointment',
  async ({ appointmentId, businessId, rating, feedback, finalAmount }, { rejectWithValue }) => {
    try {
      const data = await appointmentApi.completeAppointment(
        appointmentId,
        businessId,
        { rating, feedback, finalAmount }
      );
      return data;
    } catch (error) {
      // Capturar validationErrors específicos de las reglas de negocio
      return rejectWithValue({
        error: error.response?.data?.error || 'Error al completar cita',
        validationErrors: error.response?.data?.validationErrors || [],
        warnings: error.response?.data?.warnings || []
      });
    }
  }
);

// Reprogramar cita (con validaciones)
export const rescheduleAppointment = createAsyncThunk(
  'appointmentCalendar/rescheduleAppointment',
  async ({ appointmentId, businessId, newStartTime, newEndTime, reason }, { rejectWithValue }) => {
    try {
      const data = await appointmentApi.rescheduleAppointment(
        appointmentId,
        businessId,
        { newStartTime, newEndTime, reason }
      );
      return data;
    } catch (error) {
      return rejectWithValue({
        error: error.response?.data?.error || 'Error al reprogramar cita',
        validationErrors: error.response?.data?.validationErrors || [],
        warnings: error.response?.data?.warnings || []
      });
    }
  }
);

// Subir evidencia (fotos antes/después/documentos)
export const uploadEvidence = createAsyncThunk(
  'appointmentCalendar/uploadEvidence',
  async ({ appointmentId, businessId, type, files }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('type', type); // 'before', 'after', 'documents'
      
      // Agregar archivos al FormData
      if (Array.isArray(files)) {
        files.forEach((file) => {
          formData.append('files', file);
        });
      } else {
        formData.append('files', files);
      }

      const data = await appointmentApi.uploadEvidence(appointmentId, businessId, formData);
      return data;
    } catch (error) {
      return rejectWithValue({
        error: error.response?.data?.error || 'Error al subir evidencia'
      });
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
  message: null,
  // 👇 Nuevos campos para validaciones
  validationErrors: [],  // Errores de validación de reglas de negocio
  warnings: [],          // Advertencias (no bloquean la acción)
  uploadProgress: 0      // Progreso de subida de evidencia (0-100)
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
    clearValidationErrors: (state) => {
      state.validationErrors = [];
      state.warnings = [];
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
      })

      // ==================== NUEVOS REDUCERS DE VALIDACIÓN ====================

      // Complete Appointment
      .addCase(completeAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationErrors = [];
        state.warnings = [];
        state.success = false;
      })
      .addCase(completeAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Cita completada exitosamente';
        state.warnings = action.payload.warnings || []; // Guardar warnings aunque sea exitoso
        
        // Actualizar la cita en las listas
        if (action.payload.data) {
          const updatedAppointment = action.payload.data;
          
          // Actualizar en appointments
          const index = state.appointments.findIndex(a => a.id === updatedAppointment.id);
          if (index !== -1) {
            state.appointments[index] = updatedAppointment;
          }
          
          // Actualizar en calendarAppointments
          const calIndex = state.calendarAppointments.findIndex(a => a.id === updatedAppointment.id);
          if (calIndex !== -1) {
            state.calendarAppointments[calIndex] = updatedAppointment;
          }
          
          // Actualizar selectedAppointment si es la misma
          if (state.selectedAppointment?.id === updatedAppointment.id) {
            state.selectedAppointment = updatedAppointment;
          }
        }
      })
      .addCase(completeAppointment.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload?.error || 'Error al completar cita';
        // 👇 Guardar errores de validación específicos
        state.validationErrors = action.payload?.validationErrors || [];
        state.warnings = action.payload?.warnings || [];
      })

      // Reschedule Appointment
      .addCase(rescheduleAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationErrors = [];
        state.warnings = [];
        state.success = false;
      })
      .addCase(rescheduleAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Cita reprogramada exitosamente';
        state.warnings = action.payload.warnings || [];
        
        if (action.payload.data) {
          const updatedAppointment = action.payload.data;
          
          const index = state.appointments.findIndex(a => a.id === updatedAppointment.id);
          if (index !== -1) {
            state.appointments[index] = updatedAppointment;
          }
          
          const calIndex = state.calendarAppointments.findIndex(a => a.id === updatedAppointment.id);
          if (calIndex !== -1) {
            state.calendarAppointments[calIndex] = updatedAppointment;
          }
          
          if (state.selectedAppointment?.id === updatedAppointment.id) {
            state.selectedAppointment = updatedAppointment;
          }
        }
      })
      .addCase(rescheduleAppointment.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload?.error || 'Error al reprogramar cita';
        state.validationErrors = action.payload?.validationErrors || [];
        state.warnings = action.payload?.warnings || [];
      })

      // Upload Evidence
      .addCase(uploadEvidence.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadEvidence.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadProgress = 100;
        state.success = true;
        state.message = action.payload.message || 'Evidencia subida exitosamente';
        
        // Actualizar evidencia en la cita
        if (action.payload.data) {
          const appointmentId = action.payload.data.appointmentId;
          const evidence = action.payload.data.evidence;
          
          // Actualizar en appointments
          const index = state.appointments.findIndex(a => a.id === appointmentId);
          if (index !== -1) {
            state.appointments[index].evidence = evidence;
          }
          
          // Actualizar en calendarAppointments
          const calIndex = state.calendarAppointments.findIndex(a => a.id === appointmentId);
          if (calIndex !== -1) {
            state.calendarAppointments[calIndex].evidence = evidence;
          }
          
          // Actualizar selectedAppointment
          if (state.selectedAppointment?.id === appointmentId) {
            state.selectedAppointment.evidence = evidence;
          }
        }
      })
      .addCase(uploadEvidence.rejected, (state, action) => {
        state.loading = false;
        state.uploadProgress = 0;
        state.error = action.payload?.error || 'Error al subir evidencia';
      });
  }
});

export const {
  clearAppointmentError,
  clearAppointmentSuccess,
  clearValidationErrors,
  resetAppointmentState,
  setSelectedAppointment,
  setAppointmentFilters,
  clearAppointmentFilters,
  setCalendarView
} = appointmentCalendarSlice.actions;

export default appointmentCalendarSlice.reducer;
