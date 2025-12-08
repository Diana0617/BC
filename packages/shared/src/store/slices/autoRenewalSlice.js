import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { autoRenewalApi } from '../../api/autoRenewalApi';

// 🔄 AUTO-RENOVACIÓN - Async Thunks

/**
 * Ejecutar auto-renovación manual para testing
 */
export const runManualAutoRenewal = createAsyncThunk(
  'autoRenewal/runManualAutoRenewal',
  async (_, { rejectWithValue }) => {
    try {
      const response = await autoRenewalApi.runManualAutoRenewal();
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error ejecutando auto-renovación',
        status: error.response?.status
      });
    }
  }
);

/**
 * Obtener estadísticas de auto-renovación
 */
export const getAutoRenewalStats = createAsyncThunk(
  'autoRenewal/getAutoRenewalStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await autoRenewalApi.getAutoRenewalStats();
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error obteniendo estadísticas',
        status: error.response?.status
      });
    }
  }
);

/**
 * Obtener configuración de cron jobs
 */
export const getCronJobsConfig = createAsyncThunk(
  'autoRenewal/getCronJobsConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await autoRenewalApi.getCronJobsConfig();
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error obteniendo configuración',
        status: error.response?.status
      });
    }
  }
);

/**
 * Ejecutar notificaciones de expiración manual
 */
export const runExpirationNotifications = createAsyncThunk(
  'autoRenewal/runExpirationNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await autoRenewalApi.runExpirationNotifications();
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error enviando notificaciones',
        status: error.response?.status
      });
    }
  }
);

/**
 * Procesar reintentos de pagos fallidos
 */
export const processFailedPaymentRetries = createAsyncThunk(
  'autoRenewal/processFailedPaymentRetries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await autoRenewalApi.processFailedPaymentRetries();
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error procesando reintentos',
        status: error.response?.status
      });
    }
  }
);

/**
 * Obtener lista de suscripciones que vencen pronto
 */
export const getExpiringSubscriptions = createAsyncThunk(
  'autoRenewal/getExpiringSubscriptions',
  async (daysAhead = 7, { rejectWithValue }) => {
    try {
      const response = await autoRenewalApi.getExpiringSubscriptions(daysAhead);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error obteniendo suscripciones',
        status: error.response?.status
      });
    }
  }
);

/**
 * Obtener historial de renovaciones
 */
export const getRenewalHistory = createAsyncThunk(
  'autoRenewal/getRenewalHistory',
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await autoRenewalApi.getRenewalHistory(page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error obteniendo historial',
        status: error.response?.status
      });
    }
  }
);

// Estado inicial
const initialState = {
  // Ejecución Manual
  isRunningManualRenewal: false,
  manualRenewalResult: null,
  
  // Estadísticas
  stats: null,
  isLoadingStats: false,
  
  // Configuración Cron Jobs
  cronConfig: null,
  isLoadingCronConfig: false,
  
  // Notificaciones
  isRunningNotifications: false,
  notificationResult: null,
  
  // Reintentos de Pagos
  isProcessingRetries: false,
  retryResult: null,
  
  // Suscripciones por Vencer
  expiringSubscriptions: [],
  isLoadingExpiring: false,
  
  // Historial de Renovaciones
  renewalHistory: [],
  historyPagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  isLoadingHistory: false,
  
  // Estados globales
  error: null,
  lastUpdated: null
};

// Slice
const autoRenewalSlice = createSlice({
  name: 'autoRenewal',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetManualRenewalResult: (state) => {
      state.manualRenewalResult = null;
    },
    resetNotificationResult: (state) => {
      state.notificationResult = null;
    },
    resetRetryResult: (state) => {
      state.retryResult = null;
    },
    clearExpiringSubscriptions: (state) => {
      state.expiringSubscriptions = [];
    },
    clearRenewalHistory: (state) => {
      state.renewalHistory = [];
      state.historyPagination = initialState.historyPagination;
    }
  },
  extraReducers: (builder) => {
    builder
      // Manual Auto-Renewal
      .addCase(runManualAutoRenewal.pending, (state) => {
        state.isRunningManualRenewal = true;
        state.error = null;
      })
      .addCase(runManualAutoRenewal.fulfilled, (state, action) => {
        state.isRunningManualRenewal = false;
        state.manualRenewalResult = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(runManualAutoRenewal.rejected, (state, action) => {
        state.isRunningManualRenewal = false;
        state.error = action.payload;
      })

      // Stats
      .addCase(getAutoRenewalStats.pending, (state) => {
        state.isLoadingStats = true;
        state.error = null;
      })
      .addCase(getAutoRenewalStats.fulfilled, (state, action) => {
        state.isLoadingStats = false;
        state.stats = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getAutoRenewalStats.rejected, (state, action) => {
        state.isLoadingStats = false;
        state.error = action.payload;
      })

      // Cron Config
      .addCase(getCronJobsConfig.pending, (state) => {
        state.isLoadingCronConfig = true;
        state.error = null;
      })
      .addCase(getCronJobsConfig.fulfilled, (state, action) => {
        state.isLoadingCronConfig = false;
        state.cronConfig = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getCronJobsConfig.rejected, (state, action) => {
        state.isLoadingCronConfig = false;
        state.error = action.payload;
      })

      // Notifications
      .addCase(runExpirationNotifications.pending, (state) => {
        state.isRunningNotifications = true;
        state.error = null;
      })
      .addCase(runExpirationNotifications.fulfilled, (state, action) => {
        state.isRunningNotifications = false;
        state.notificationResult = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(runExpirationNotifications.rejected, (state, action) => {
        state.isRunningNotifications = false;
        state.error = action.payload;
      })

      // Payment Retries
      .addCase(processFailedPaymentRetries.pending, (state) => {
        state.isProcessingRetries = true;
        state.error = null;
      })
      .addCase(processFailedPaymentRetries.fulfilled, (state, action) => {
        state.isProcessingRetries = false;
        state.retryResult = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(processFailedPaymentRetries.rejected, (state, action) => {
        state.isProcessingRetries = false;
        state.error = action.payload;
      })

      // Expiring Subscriptions
      .addCase(getExpiringSubscriptions.pending, (state) => {
        state.isLoadingExpiring = true;
        state.error = null;
      })
      .addCase(getExpiringSubscriptions.fulfilled, (state, action) => {
        state.isLoadingExpiring = false;
        state.expiringSubscriptions = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getExpiringSubscriptions.rejected, (state, action) => {
        state.isLoadingExpiring = false;
        state.error = action.payload;
      })

      // Renewal History
      .addCase(getRenewalHistory.pending, (state) => {
        state.isLoadingHistory = true;
        state.error = null;
      })
      .addCase(getRenewalHistory.fulfilled, (state, action) => {
        state.isLoadingHistory = false;
        const { items, pagination } = action.payload;
        
        if (pagination.currentPage === 1) {
          state.renewalHistory = items;
        } else {
          state.renewalHistory = [...state.renewalHistory, ...items];
        }
        
        state.historyPagination = pagination;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getRenewalHistory.rejected, (state, action) => {
        state.isLoadingHistory = false;
        state.error = action.payload;
      });
  }
});

// Actions
export const {
  clearError,
  resetManualRenewalResult,
  resetNotificationResult,
  resetRetryResult,
  clearExpiringSubscriptions,
  clearRenewalHistory
} = autoRenewalSlice.actions;

// Selectors
export const selectAutoRenewal = (state) => state.autoRenewal;
export const selectManualRenewalResult = (state) => state.autoRenewal.manualRenewalResult;
export const selectAutoRenewalStats = (state) => state.autoRenewal.stats;
export const selectCronConfig = (state) => state.autoRenewal.cronConfig;
export const selectExpiringSubscriptions = (state) => state.autoRenewal.expiringSubscriptions;
export const selectRenewalHistory = (state) => state.autoRenewal.renewalHistory;
export const selectAutoRenewalError = (state) => state.autoRenewal.error;
export const selectIsRunningManualRenewal = (state) => state.autoRenewal.isRunningManualRenewal;
export const selectIsLoadingStats = (state) => state.autoRenewal.isLoadingStats;

export default autoRenewalSlice.reducer;