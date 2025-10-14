import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

/**
 * @slice commissionSlice
 * @description Redux slice para gestión de comisiones a nivel de negocio y servicios
 * @feature FM-26
 */

// =====================================================
// THUNKS - Acciones Asíncronas
// =====================================================

/**
 * Obtener configuración de comisiones del negocio
 * GET /api/business/:businessId/commission-config
 */
export const fetchBusinessCommissionConfig = createAsyncThunk(
  'commission/fetchBusinessConfig',
  async ({ businessId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/business/${businessId}/commission-config`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al obtener configuración de comisiones'
      );
    }
  }
);

/**
 * Actualizar configuración de comisiones del negocio
 * PUT /api/business/:businessId/commission-config
 */
export const updateBusinessCommissionConfig = createAsyncThunk(
  'commission/updateBusinessConfig',
  async ({ businessId, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(
        `/business/${businessId}/commission-config`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al actualizar configuración de comisiones'
      );
    }
  }
);

/**
 * Obtener comisión de un servicio específico
 * GET /api/business/:businessId/services/:serviceId/commission
 */
export const fetchServiceCommission = createAsyncThunk(
  'commission/fetchServiceCommission',
  async ({ businessId, serviceId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/business/${businessId}/services/${serviceId}/commission`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al obtener comisión del servicio'
      );
    }
  }
);

/**
 * Crear o actualizar comisión de un servicio
 * PUT /api/business/:businessId/services/:serviceId/commission
 */
export const upsertServiceCommission = createAsyncThunk(
  'commission/upsertServiceCommission',
  async ({ businessId, serviceId, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(
        `/business/${businessId}/services/${serviceId}/commission`,
        data
      );
      return { serviceId, commission: response.data.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al actualizar comisión del servicio'
      );
    }
  }
);

/**
 * Eliminar comisión específica de un servicio
 * DELETE /api/business/:businessId/services/:serviceId/commission
 */
export const deleteServiceCommission = createAsyncThunk(
  'commission/deleteServiceCommission',
  async ({ businessId, serviceId }, { rejectWithValue }) => {
    try {
      await apiClient.delete(
        `/business/${businessId}/services/${serviceId}/commission`
      );
      return serviceId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al eliminar comisión del servicio'
      );
    }
  }
);

/**
 * Calcular comisión para un monto específico
 * POST /api/business/:businessId/services/:serviceId/commission/calculate
 */
export const calculateCommission = createAsyncThunk(
  'commission/calculateCommission',
  async ({ businessId, serviceId, amount }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/business/${businessId}/services/${serviceId}/commission/calculate`,
        { amount }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al calcular comisión'
      );
    }
  }
);

// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {
  // Configuración del negocio
  businessConfig: null,
  businessConfigLoading: false,
  businessConfigError: null,

  // Comisiones por servicio
  serviceCommissions: {}, // { serviceId: commissionData }
  serviceCommissionLoading: {},
  serviceCommissionError: {},

  // Cálculo de comisión
  calculatedCommission: null,
  calculationLoading: false,
  calculationError: null,

  // UI State
  lastUpdated: null,
};

// =====================================================
// SLICE
// =====================================================

const commissionSlice = createSlice({
  name: 'commission',
  initialState,
  reducers: {
    // Limpiar estado de cálculo
    clearCalculation: (state) => {
      state.calculatedCommission = null;
      state.calculationError = null;
    },

    // Limpiar error de configuración del negocio
    clearBusinessConfigError: (state) => {
      state.businessConfigError = null;
    },

    // Limpiar error de servicio
    clearServiceCommissionError: (state, action) => {
      if (action.payload) {
        delete state.serviceCommissionError[action.payload];
      } else {
        state.serviceCommissionError = {};
      }
    },

    // Reset completo
    resetCommissionState: () => initialState,
  },

  extraReducers: (builder) => {
    // ============ FETCH BUSINESS CONFIG ============
    builder
      .addCase(fetchBusinessCommissionConfig.pending, (state) => {
        state.businessConfigLoading = true;
        state.businessConfigError = null;
      })
      .addCase(fetchBusinessCommissionConfig.fulfilled, (state, action) => {
        state.businessConfigLoading = false;
        state.businessConfig = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchBusinessCommissionConfig.rejected, (state, action) => {
        state.businessConfigLoading = false;
        state.businessConfigError = action.payload;
      });

    // ============ UPDATE BUSINESS CONFIG ============
    builder
      .addCase(updateBusinessCommissionConfig.pending, (state) => {
        state.businessConfigLoading = true;
        state.businessConfigError = null;
      })
      .addCase(updateBusinessCommissionConfig.fulfilled, (state, action) => {
        state.businessConfigLoading = false;
        state.businessConfig = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateBusinessCommissionConfig.rejected, (state, action) => {
        state.businessConfigLoading = false;
        state.businessConfigError = action.payload;
      });

    // ============ FETCH SERVICE COMMISSION ============
    builder
      .addCase(fetchServiceCommission.pending, (state, action) => {
        const { serviceId } = action.meta.arg;
        state.serviceCommissionLoading[serviceId] = true;
        delete state.serviceCommissionError[serviceId];
      })
      .addCase(fetchServiceCommission.fulfilled, (state, action) => {
        const { serviceId } = action.meta.arg;
        state.serviceCommissionLoading[serviceId] = false;
        state.serviceCommissions[serviceId] = action.payload;
      })
      .addCase(fetchServiceCommission.rejected, (state, action) => {
        const { serviceId } = action.meta.arg;
        state.serviceCommissionLoading[serviceId] = false;
        state.serviceCommissionError[serviceId] = action.payload;
      });

    // ============ UPSERT SERVICE COMMISSION ============
    builder
      .addCase(upsertServiceCommission.pending, (state, action) => {
        const { serviceId } = action.meta.arg;
        state.serviceCommissionLoading[serviceId] = true;
        delete state.serviceCommissionError[serviceId];
      })
      .addCase(upsertServiceCommission.fulfilled, (state, action) => {
        const { serviceId, commission } = action.payload;
        state.serviceCommissionLoading[serviceId] = false;
        state.serviceCommissions[serviceId] = commission;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(upsertServiceCommission.rejected, (state, action) => {
        const { serviceId } = action.meta.arg;
        state.serviceCommissionLoading[serviceId] = false;
        state.serviceCommissionError[serviceId] = action.payload;
      });

    // ============ DELETE SERVICE COMMISSION ============
    builder
      .addCase(deleteServiceCommission.pending, (state, action) => {
        const { serviceId } = action.meta.arg;
        state.serviceCommissionLoading[serviceId] = true;
        delete state.serviceCommissionError[serviceId];
      })
      .addCase(deleteServiceCommission.fulfilled, (state, action) => {
        const serviceId = action.payload;
        state.serviceCommissionLoading[serviceId] = false;
        delete state.serviceCommissions[serviceId];
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(deleteServiceCommission.rejected, (state, action) => {
        const { serviceId } = action.meta.arg;
        state.serviceCommissionLoading[serviceId] = false;
        state.serviceCommissionError[serviceId] = action.payload;
      });

    // ============ CALCULATE COMMISSION ============
    builder
      .addCase(calculateCommission.pending, (state) => {
        state.calculationLoading = true;
        state.calculationError = null;
      })
      .addCase(calculateCommission.fulfilled, (state, action) => {
        state.calculationLoading = false;
        state.calculatedCommission = action.payload;
      })
      .addCase(calculateCommission.rejected, (state, action) => {
        state.calculationLoading = false;
        state.calculationError = action.payload;
      });
  },
});

// =====================================================
// ACTIONS
// =====================================================

export const {
  clearCalculation,
  clearBusinessConfigError,
  clearServiceCommissionError,
  resetCommissionState,
} = commissionSlice.actions;

// =====================================================
// SELECTORS
// =====================================================

// Business Config Selectors
export const selectBusinessCommissionConfig = (state) => state.commission.businessConfig;
export const selectBusinessConfigLoading = (state) => state.commission.businessConfigLoading;
export const selectBusinessConfigError = (state) => state.commission.businessConfigError;

// Service Commission Selectors
export const selectServiceCommission = (serviceId) => (state) =>
  state.commission.serviceCommissions[serviceId] || null;

export const selectServiceCommissionLoading = (serviceId) => (state) =>
  state.commission.serviceCommissionLoading[serviceId] || false;

export const selectServiceCommissionError = (serviceId) => (state) =>
  state.commission.serviceCommissionError[serviceId] || null;

export const selectAllServiceCommissions = (state) => state.commission.serviceCommissions;

// Calculation Selectors
export const selectCalculatedCommission = (state) => state.commission.calculatedCommission;
export const selectCalculationLoading = (state) => state.commission.calculationLoading;
export const selectCalculationError = (state) => state.commission.calculationError;

// Utility Selectors
export const selectCommissionLastUpdated = (state) => state.commission.lastUpdated;

// Memoized selector para verificar si comisiones están habilitadas
export const selectCommissionsEnabled = (state) => 
  state.commission.businessConfig?.commissionsEnabled ?? false;

export const selectCalculationType = (state) =>
  state.commission.businessConfig?.calculationType ?? null;

export const selectGeneralPercentage = (state) =>
  state.commission.businessConfig?.generalPercentage ?? null;

// =====================================================
// REDUCER
// =====================================================

export default commissionSlice.reducer;
