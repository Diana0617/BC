import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl } from '../../constants/api';
import { StorageHelper } from '../../utils/storage.js';
import { STORAGE_KEYS } from '../../constants/api.js';
import { getTodayColombia } from '../../utils/timezone.js';

// Helper para obtener headers con token
const getAuthHeaders = async () => {
  const token = await StorageHelper.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Async thunks
export const fetchSpecialistAppointments = createAsyncThunk(
  'specialistDashboard/fetchAppointments',
  async ({ date, startDate, endDate, branchId, status, businessId, period = 'day' }, { rejectWithValue }) => {
    try {
      console.log('🚀 fetchSpecialistAppointments START', { date, startDate, endDate, branchId, status, businessId, period });
      
      const params = new URLSearchParams();
      
      // Si se provee un rango explícito, usarlo
      if (startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      } 
      // Si no, calcular según el período
      else if (date) {
        const baseDate = new Date(date);
        
        if (period === 'week') {
          // Calcular inicio y fin de la semana
          const dayOfWeek = baseDate.getDay();
          const diff = baseDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Lunes
          const monday = new Date(baseDate.setDate(diff));
          monday.setHours(0, 0, 0, 0);
          
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          sunday.setHours(23, 59, 59, 999);
          
          params.append('startDate', monday.toISOString());
          params.append('endDate', sunday.toISOString());
          console.log('📅 Periodo SEMANA:', { monday: monday.toISOString(), sunday: sunday.toISOString() });
        } else if (period === 'month') {
          // Calcular inicio y fin del mes
          const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
          firstDay.setHours(0, 0, 0, 0);
          
          const lastDay = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
          lastDay.setHours(23, 59, 59, 999);
          
          params.append('startDate', firstDay.toISOString());
          params.append('endDate', lastDay.toISOString());
          console.log('📅 Periodo MES:', { firstDay: firstDay.toISOString(), lastDay: lastDay.toISOString() });
        } else {
          // Día único (por defecto)
          params.append('date', date);
          console.log('📅 Periodo DIA:', date);
        }
      }
      
      if (branchId) params.append('branchId', branchId);
      if (status) params.append('status', status);
      if (businessId) params.append('businessId', businessId);

      const queryString = params.toString();
      const apiBaseUrl = getApiUrl();
      const url = `${apiBaseUrl}/api/specialists/me/dashboard/appointments${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 Specialist Dashboard API Call:', {
        apiBaseUrl,
        fullUrl: url,
        hasToken: !!(await StorageHelper.getItemAsync(STORAGE_KEYS.AUTH_TOKEN))
      });
      
      const headers = await getAuthHeaders();
      console.log('📤 Making fetch request...');
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      console.log('📥 Response received:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ Error response data:', errorData);
        throw new Error(errorData.message || 'Error al cargar las citas');
      }

      const data = await response.json();
      console.log('✅ Success data:', data);
      
      // El backend devuelve: { success: true, data: { appointments, stats } }
      if (data.success && data.data) {
        return data.data; // Retorna { appointments, stats }
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Error al cargar las citas del especialista'
      );
    }
  }
);

export const updateAppointmentStatus = createAsyncThunk(
  'specialistDashboard/updateStatus',
  async ({ appointmentId, status }, { rejectWithValue }) => {
    try {
      const url = `${getApiUrl()}/api/specialists/me/appointments/${appointmentId}/status`;
      const headers = await getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar estado');
      }

      const data = await response.json();
      
      // El backend devuelve: { success: true, data: appointment }
      if (data.success && data.data) {
        return data.data;
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Error al actualizar el estado de la cita'
      );
    }
  }
);

export const confirmAppointment = createAsyncThunk(
  'specialistDashboard/confirm',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const url = `${getApiUrl()}/api/specialists/me/appointments/${appointmentId}/confirm`;
      const headers = await getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'POST',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al confirmar');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data;
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Error al confirmar la cita'
      );
    }
  }
);

export const startAppointment = createAsyncThunk(
  'specialistDashboard/start',
  async (appointmentId, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const businessId = state.auth.user?.businessId;
      
      const url = `${getApiUrl()}/api/appointments/${appointmentId}/start?businessId=${businessId}`;
      const headers = await getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'POST',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Error al iniciar');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data;
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Error al iniciar la cita'
      );
    }
  }
);

export const completeAppointment = createAsyncThunk(
  'specialistDashboard/complete',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const url = `${getApiUrl()}/api/specialists/me/appointments/${appointmentId}/complete`;
      const headers = await getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'POST',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al completar');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data;
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Error al completar la cita'
      );
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'specialistDashboard/cancel',
  async ({ appointmentId, reason }, { rejectWithValue }) => {
    try {
      const url = `${getApiUrl()}/api/specialists/me/appointments/${appointmentId}/cancel`;
      const headers = await getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cancelar');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data;
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Error al cancelar la cita'
      );
    }
  }
);

// Initial state
const initialState = {
  appointments: [],
  stats: {
    total: 0,
    completed: 0,
    confirmed: 0,
    inProgress: 0,
    cancelled: 0,
    totalEarnings: 0,
    totalCommissions: 0,
    pendingCommissions: 0,
  },
  filters: {
    date: getTodayColombia(), // Hoy en hora de Colombia
    period: 'day', // 'day', 'week', 'month'
    branchId: null,
    status: null,
  },
  selectedAppointment: null,
  loading: false,
  error: null,
  actionLoading: false,
  actionError: null,
};

// Slice
const specialistDashboardSlice = createSlice({
  name: 'specialistDashboard',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedAppointment: (state, action) => {
      state.selectedAppointment = action.payload;
    },
    clearSelectedAppointment: (state) => {
      state.selectedAppointment = null;
    },
    clearError: (state) => {
      state.error = null;
      state.actionError = null;
    },
    resetDashboard: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch appointments
    builder
      .addCase(fetchSpecialistAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpecialistAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.appointments || [];
        state.stats = action.payload.stats || initialState.stats;
      })
      .addCase(fetchSpecialistAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update status
    builder
      .addCase(updateAppointmentStatus.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        // Actualizar la cita en el array
        const index = state.appointments.findIndex(
          (apt) => apt.id === action.payload.id
        );
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });

    // Confirm appointment
    builder
      .addCase(confirmAppointment.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(confirmAppointment.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.appointments.findIndex(
          (apt) => apt.id === action.payload.id
        );
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      .addCase(confirmAppointment.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });

    // Start appointment
    builder
      .addCase(startAppointment.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(startAppointment.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.appointments.findIndex(
          (apt) => apt.id === action.payload.id
        );
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      .addCase(startAppointment.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });

    // Complete appointment
    builder
      .addCase(completeAppointment.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(completeAppointment.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.appointments.findIndex(
          (apt) => apt.id === action.payload.id
        );
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        // Actualizar stats
        if (state.stats) {
          state.stats.completed += 1;
          state.stats.inProgress -= 1;
        }
      })
      .addCase(completeAppointment.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });

    // Cancel appointment
    builder
      .addCase(cancelAppointment.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.appointments.findIndex(
          (apt) => apt.id === action.payload.id
        );
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        // Actualizar stats
        if (state.stats) {
          state.stats.cancelled += 1;
          const prevStatus = state.appointments[index]?.status;
          if (prevStatus === 'IN_PROGRESS') {
            state.stats.inProgress -= 1;
          }
        }
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  },
});

export const {
  setFilters,
  setSelectedAppointment,
  clearSelectedAppointment,
  clearError,
  resetDashboard,
} = specialistDashboardSlice.actions;

export default specialistDashboardSlice.reducer;
