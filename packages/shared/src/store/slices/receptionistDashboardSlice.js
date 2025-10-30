import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { appointmentApi } from '../../api/appointmentApi.js';
import { getApiUrl } from '../../constants/api';
import { StorageHelper } from '../../utils/storage.js';
import { STORAGE_KEYS } from '../../constants/api.js';

// Helper para obtener headers con token
const getAuthHeaders = async () => {
  const token = await StorageHelper.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper para calcular rangos de fechas basándose en el período
const calculateDateRange = (date, period) => {
  const baseDate = new Date(date);
  
  switch (period) {
    case 'day':
      return {
        startDate: date,
        endDate: date
      };
      
    case 'week':
      const startOfWeek = new Date(baseDate);
      startOfWeek.setDate(baseDate.getDate() - baseDate.getDay()); // Domingo
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Sábado
      
      return {
        startDate: startOfWeek.toISOString().split('T')[0],
        endDate: endOfWeek.toISOString().split('T')[0]
      };
      
    case 'month':
      const startOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      const endOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
      
      return {
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0]
      };
      
    default:
      return {
        startDate: date,
        endDate: date
      };
  }
};

// ===================================
// ASYNC THUNKS
// ===================================

/**
 * Obtener todas las citas del negocio para recepcionista
 * GET /api/appointments?businessId={businessId}
 */
export const fetchReceptionistAppointments = createAsyncThunk(
  'receptionistDashboard/fetchAppointments',
  async (params, { rejectWithValue }) => {
    try {
      const { businessId, date, period = 'day', branchId, specialistId, status, page = 1, limit = 50 } = params;
      
      console.log('📡 Fetching receptionist appointments:', params);
      
      // Calcular rango de fechas basándose en el período
      const dateRange = calculateDateRange(date || new Date().toISOString().split('T')[0], period);
      console.log('📅 Date range calculated:', dateRange);
      
      const queryParams = new URLSearchParams({
        businessId,
        page: page.toString(),
        limit: limit.toString(),
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      // Filtros opcionales adicionales
      if (branchId) queryParams.append('branchId', branchId);
      if (specialistId) queryParams.append('specialistId', specialistId);
      if (status) queryParams.append('status', status);

      const url = `${getApiUrl()}/api/appointments?${queryParams.toString()}`;
      const headers = await getAuthHeaders();
      
      console.log('📡 Making receptionist appointments request:', { url, period, dateRange });
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar las citas');
      }

      const data = await response.json();
      console.log('✅ Receptionist appointments response:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Error fetching appointments');
      }

      return {
        appointments: data.data.appointments || [],
        pagination: data.data.pagination || {},
        stats: data.data.stats || {}
      };
    } catch (error) {
      console.error('❌ Error fetching receptionist appointments:', error);
      return rejectWithValue(error.message || 'Error al cargar las citas');
    }
  }
);

/**
 * Obtener estadísticas del negocio para recepcionista
 */
export const fetchReceptionistStats = createAsyncThunk(
  'receptionistDashboard/fetchStats',
  async (params, { rejectWithValue }) => {
    try {
      const { businessId, date, branchId } = params;
      
      console.log('📊 Fetching receptionist stats:', params);
      
      const queryParams = new URLSearchParams({
        businessId,
        date: date || new Date().toISOString().split('T')[0]
      });

      if (branchId) queryParams.append('branchId', branchId);

      // Para las estadísticas, podemos usar los datos que ya vienen en fetchReceptionistAppointments
      // o hacer una llamada simplificada. Por ahora simularemos las stats básicas
      const url = `${getApiUrl()}/api/appointments?${queryParams.toString()}`;
      const headers = await getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar estadísticas');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error fetching stats');
      }

      // Calcular estadísticas básicas de las citas
      const appointments = data.data.appointments || [];
      const totalAppointments = appointments.length;
      const confirmed = appointments.filter(apt => apt.status === 'CONFIRMED').length;
      const completed = appointments.filter(apt => apt.status === 'COMPLETED').length;
      const cancelled = appointments.filter(apt => apt.status === 'CANCELLED').length;

      return {
        totalAppointments,
        confirmed,
        completed,
        cancelled,
        pendingRevenue: appointments
          .filter(apt => apt.status === 'CONFIRMED')
          .reduce((sum, apt) => sum + (apt.totalAmount || 0), 0),
        completedRevenue: appointments
          .filter(apt => apt.status === 'COMPLETED')
          .reduce((sum, apt) => sum + (apt.totalAmount || 0), 0)
      };
    } catch (error) {
      console.error('❌ Error fetching receptionist stats:', error);
      return rejectWithValue(error.message || 'Error al cargar estadísticas');
    }
  }
);

/**
 * Crear nueva cita (para cualquier especialista)
 */
export const createAppointmentForSpecialist = createAsyncThunk(
  'receptionistDashboard/createAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      console.log('📝 Creating appointment for specialist:', appointmentData);
      
      const url = `${getApiUrl()}/api/appointments`;
      const headers = await getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la cita');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error creating appointment');
      }

      return data.data;
    } catch (error) {
      console.error('❌ Error creating appointment:', error);
      return rejectWithValue(error.message || 'Error al crear la cita');
    }
  }
);

/**
 * Actualizar estado de cita
 */
export const updateAppointmentStatus = createAsyncThunk(
  'receptionistDashboard/updateAppointmentStatus',
  async ({ appointmentId, status, notes }, { rejectWithValue }) => {
    try {
      console.log('🔄 Updating appointment status:', { appointmentId, status });
      
      const url = `${getApiUrl()}/api/appointments/${appointmentId}`;
      const headers = await getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status, notes })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar la cita');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error updating appointment');
      }

      return data.data;
    } catch (error) {
      console.error('❌ Error updating appointment:', error);
      return rejectWithValue(error.message || 'Error al actualizar la cita');
    }
  }
);

// ===================================
// INITIAL STATE
// ===================================

const initialState = {
  // Datos
  appointments: [],
  stats: {
    total: 0,
    completed: 0,
    inProgress: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    totalEarnings: 0,
    appointmentsBySpecialist: []
  },
  specialists: [], // Lista de especialistas del negocio
  
  // Filtros
  filters: {
    date: new Date().toISOString().split('T')[0], // Hoy por defecto
    branchId: null,
    specialistId: null,
    status: null,
    period: 'day' // day, week, month
  },
  
  // UI State
  selectedAppointment: null,
  viewMode: 'list', // list, calendar
  
  // Loading states
  loading: false,
  statsLoading: false,
  actionLoading: false,
  
  // Error states
  error: null,
  actionError: null,
  
  // Pagination
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  }
};

// ===================================
// SLICE
// ===================================

const receptionistDashboardSlice = createSlice({
  name: 'receptionistDashboard',
  initialState,
  reducers: {
    // Filtros
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    setDate: (state, action) => {
      state.filters.date = action.payload;
    },
    
    setBranchFilter: (state, action) => {
      state.filters.branchId = action.payload;
    },
    
    setSpecialistFilter: (state, action) => {
      state.filters.specialistId = action.payload;
    },
    
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },
    
    setPeriod: (state, action) => {
      state.filters.period = action.payload;
    },
    
    // UI
    setSelectedAppointment: (state, action) => {
      state.selectedAppointment = action.payload;
    },
    
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
      state.actionError = null;
    },
    
    // Reset
    resetState: (state) => {
      Object.assign(state, initialState);
    }
  },
  
  extraReducers: (builder) => {
    // fetchReceptionistAppointments
    builder
      .addCase(fetchReceptionistAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReceptionistAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.appointments;
        state.pagination = action.payload.pagination;
        if (action.payload.stats) {
          state.stats = { ...state.stats, ...action.payload.stats };
        }
      })
      .addCase(fetchReceptionistAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchReceptionistStats
      .addCase(fetchReceptionistStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchReceptionistStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = { ...state.stats, ...action.payload };
      })
      .addCase(fetchReceptionistStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      })
      
      // createAppointmentForSpecialist
      .addCase(createAppointmentForSpecialist.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(createAppointmentForSpecialist.fulfilled, (state, action) => {
        state.actionLoading = false;
        // Agregar la nueva cita al inicio de la lista
        state.appointments.unshift(action.payload);
      })
      .addCase(createAppointmentForSpecialist.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      
      // updateAppointmentStatus
      .addCase(updateAppointmentStatus.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        // Actualizar la cita en la lista
        const index = state.appointments.findIndex(app => app.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = { ...state.appointments[index], ...action.payload };
        }
      })
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  }
});

// ===================================
// EXPORTS
// ===================================

export const {
  setFilters,
  setDate,
  setBranchFilter,
  setSpecialistFilter,
  setStatusFilter,
  setPeriod,
  setSelectedAppointment,
  setViewMode,
  clearError,
  resetState
} = receptionistDashboardSlice.actions;

// Selectors
export const selectReceptionistAppointments = (state) => state.receptionistDashboard.appointments;
export const selectReceptionistStats = (state) => state.receptionistDashboard.stats;
export const selectReceptionistFilters = (state) => state.receptionistDashboard.filters;
export const selectReceptionistSelectedAppointment = (state) => state.receptionistDashboard.selectedAppointment;
export const selectReceptionistViewMode = (state) => state.receptionistDashboard.viewMode;
export const selectReceptionistDashboardLoading = (state) => state.receptionistDashboard.loading;
export const selectReceptionistStatsLoading = (state) => state.receptionistDashboard.statsLoading;
export const selectReceptionistActionLoading = (state) => state.receptionistDashboard.actionLoading;
export const selectReceptionistDashboardError = (state) => state.receptionistDashboard.error;
export const selectReceptionistActionError = (state) => state.receptionistDashboard.actionError;
export const selectReceptionistPagination = (state) => state.receptionistDashboard.pagination;

export default receptionistDashboardSlice.reducer;