import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';

// ==================== ASYNC THUNKS ====================

/**
 * Obtener configuración de comisiones del negocio
 */
export const fetchCommissionConfig = createAsyncThunk(
  'specialistCommissions/fetchConfig',
  async ({ businessId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/api/business/${businessId}/commission-config`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener configuración');
    }
  }
);

/**
 * Obtener resumen de comisiones por especialista
 */
export const fetchSpecialistsSummary = createAsyncThunk(
  'specialistCommissions/fetchSummary',
  async ({ businessId, month, year }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);

      const response = await apiClient.get(
        `/api/business/${businessId}/commissions/specialists-summary?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener resumen');
    }
  }
);

/**
 * Obtener detalle de comisiones de un especialista
 */
export const fetchSpecialistDetails = createAsyncThunk(
  'specialistCommissions/fetchDetails',
  async ({ businessId, specialistId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiClient.get(
        `/api/business/${businessId}/commissions/specialist/${specialistId}/details?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener detalles');
    }
  }
);

/**
 * Registrar pago de comisión
 */
export const registerCommissionPayment = createAsyncThunk(
  'specialistCommissions/registerPayment',
  async ({ businessId, paymentData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/api/business/${businessId}/commissions/pay`,
        paymentData
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al registrar pago');
    }
  }
);

// ==================== SLICE ====================

const initialState = {
  config: {
    commissionsEnabled: true,
    calculationType: 'POR_SERVICIO',
    generalPercentage: 50.00,
    notes: null
  },
  specialists: [],
  selectedSpecialistDetails: {
    specialist: null,
    period: {
      start: null,
      end: null
    },
    commissionDetails: [],
    totals: {
      generated: 0,
      paid: 0,
      pending: 0
    },
    paymentHistory: []
  },
  filters: {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  },
  period: {
    start: null,
    end: null,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  },
  loading: false,
  configLoading: false,
  detailsLoading: false,
  paymentLoading: false,
  error: null
};

const specialistCommissionsSlice = createSlice({
  name: 'specialistCommissions',
  initialState,
  reducers: {
    setCommissionFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCommissionFilters: (state) => {
      state.filters = {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      };
    },
    clearSpecialistDetails: (state) => {
      state.selectedSpecialistDetails = initialState.selectedSpecialistDetails;
    },
    clearSpecialists: (state) => {
      state.specialists = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Config
      .addCase(fetchCommissionConfig.pending, (state) => {
        state.configLoading = true;
        state.error = null;
      })
      .addCase(fetchCommissionConfig.fulfilled, (state, action) => {
        state.configLoading = false;
        state.config = action.payload;
      })
      .addCase(fetchCommissionConfig.rejected, (state, action) => {
        state.configLoading = false;
        state.error = action.payload;
      })

      // Fetch Specialists Summary
      .addCase(fetchSpecialistsSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpecialistsSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.specialists = action.payload.data?.specialists || [];
        state.period = action.payload.data?.period || state.period;
      })
      .addCase(fetchSpecialistsSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Specialist Details
      .addCase(fetchSpecialistDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchSpecialistDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedSpecialistDetails = action.payload;
      })
      .addCase(fetchSpecialistDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })

      // Register Payment
      .addCase(registerCommissionPayment.pending, (state) => {
        state.paymentLoading = true;
        state.error = null;
      })
      .addCase(registerCommissionPayment.fulfilled, (state, action) => {
        state.paymentLoading = false;
        // Actualizar estadísticas del especialista pagado
        const specialistIndex = state.specialists.findIndex(
          s => s.specialistId === action.payload.paymentRequest.specialistId
        );
        if (specialistIndex !== -1) {
          const paidAmount = parseFloat(action.payload.paymentRequest.totalAmount);
          state.specialists[specialistIndex].stats.paid += paidAmount;
          state.specialists[specialistIndex].stats.pending -= paidAmount;
        }
      })
      .addCase(registerCommissionPayment.rejected, (state, action) => {
        state.paymentLoading = false;
        state.error = action.payload;
      });
  }
});

// ==================== ACTIONS & SELECTORS ====================

export const {
  setCommissionFilters,
  clearCommissionFilters,
  clearSpecialistDetails,
  clearSpecialists
} = specialistCommissionsSlice.actions;

// Selectors
export const selectCommissionConfig = (state) => state.specialistCommissions.config;
export const selectSpecialists = (state) => state.specialistCommissions.specialists;
export const selectSpecialistDetails = (state) => state.specialistCommissions.selectedSpecialistDetails;
export const selectCommissionFilters = (state) => state.specialistCommissions.filters;
export const selectCommissionPeriod = (state) => state.specialistCommissions.period;
export const selectCommissionsLoading = (state) => state.specialistCommissions.loading;
export const selectConfigLoading = (state) => state.specialistCommissions.configLoading;
export const selectDetailsLoading = (state) => state.specialistCommissions.detailsLoading;
export const selectPaymentLoading = (state) => state.specialistCommissions.paymentLoading;
export const selectCommissionError = (state) => state.specialistCommissions.error;

export default specialistCommissionsSlice.reducer;
