import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';

// ==================== ASYNC THUNKS ====================

/**
 * Obtener movimientos financieros con filtros
 */
export const fetchFinancialMovements = createAsyncThunk(
  'financialMovements/fetchMovements',
  async ({ businessId, startDate, endDate, type, category, status, paymentMethod, branchId }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        businessId,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(type && { type }),
        ...(category && { category }),
        ...(status && { status }),
        ...(paymentMethod && { paymentMethod }),
        ...(branchId && { branchId })
      });

      const response = await apiClient.get(`/api/financial/movements?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al obtener movimientos');
    }
  }
);

/**
 * Obtener resumen de movimientos financieros
 */
export const fetchMovementsSummary = createAsyncThunk(
  'financialMovements/fetchSummary',
  async ({ businessId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        businessId,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await apiClient.get(`/api/financial/movements/summary?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al obtener resumen');
    }
  }
);

/**
 * Obtener resumen de turnos del día
 */
export const fetchTodayAppointmentsSummary = createAsyncThunk(
  'financialMovements/fetchTodayAppointments',
  async ({ businessId, date, branchId }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        businessId,
        ...(date && { date }),
        ...(branchId && { branchId })
      });

      const response = await apiClient.get(`/api/appointments/summary/today?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al obtener resumen de turnos');
    }
  }
);

// ==================== SLICE ====================

const initialState = {
  // Movimientos financieros
  movements: [],
  movementsLoading: false,
  movementsError: null,
  movementsTotals: {
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0
  },
  
  // Resumen de movimientos
  summary: null,
  summaryLoading: false,
  summaryError: null,
  
  // Resumen de turnos
  todayAppointments: null,
  todayAppointmentsLoading: false,
  todayAppointmentsError: null,
  
  // Filtros activos
  filters: {
    startDate: null,
    endDate: null,
    type: null,
    category: null,
    status: null,
    paymentMethod: null,
    branchId: null
  }
};

const financialMovementsSlice = createSlice({
  name: 'financialMovements',
  initialState,
  reducers: {
    setMovementFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearMovementFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearFinancialMovements: (state) => {
      state.movements = [];
      state.movementsTotals = initialState.movementsTotals;
      state.movementsError = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch movements
    builder
      .addCase(fetchFinancialMovements.pending, (state) => {
        state.movementsLoading = true;
        state.movementsError = null;
      })
      .addCase(fetchFinancialMovements.fulfilled, (state, action) => {
        console.log('✅ Redux - fetchFinancialMovements.fulfilled:', {
          movementsReceived: action.payload.data.movements?.length,
          totals: action.payload.data.totals,
          sampleMovements: action.payload.data.movements?.slice(0, 3).map(m => ({
            id: m.id,
            type: m.type,
            amount: m.amount,
            userId: m.userId,
            description: m.description
          }))
        });
        state.movementsLoading = false;
        state.movements = action.payload.data.movements;
        state.movementsTotals = action.payload.data.totals;
      })
      .addCase(fetchFinancialMovements.rejected, (state, action) => {
        console.error('❌ Redux - fetchFinancialMovements.rejected:', action.payload);
        state.movementsLoading = false;
        state.movementsError = action.payload;
      });

    // Fetch summary
    builder
      .addCase(fetchMovementsSummary.pending, (state) => {
        state.summaryLoading = true;
        state.summaryError = null;
      })
      .addCase(fetchMovementsSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summary = action.payload.data;
      })
      .addCase(fetchMovementsSummary.rejected, (state, action) => {
        state.summaryLoading = false;
        state.summaryError = action.payload;
      });

    // Fetch today appointments
    builder
      .addCase(fetchTodayAppointmentsSummary.pending, (state) => {
        state.todayAppointmentsLoading = true;
        state.todayAppointmentsError = null;
      })
      .addCase(fetchTodayAppointmentsSummary.fulfilled, (state, action) => {
        state.todayAppointmentsLoading = false;
        state.todayAppointments = action.payload.data;
      })
      .addCase(fetchTodayAppointmentsSummary.rejected, (state, action) => {
        state.todayAppointmentsLoading = false;
        state.todayAppointmentsError = action.payload;
      });
  }
});

// ==================== ACTIONS ====================
export const { setMovementFilters, clearMovementFilters, clearFinancialMovements } = financialMovementsSlice.actions;

// ==================== SELECTORS ====================
export const selectMovements = (state) => state.financialMovements.movements;
export const selectMovementsLoading = (state) => state.financialMovements.movementsLoading;
export const selectMovementsError = (state) => state.financialMovements.movementsError;
export const selectMovementsTotals = (state) => state.financialMovements.movementsTotals;

export const selectSummary = (state) => state.financialMovements.summary;
export const selectSummaryLoading = (state) => state.financialMovements.summaryLoading;

export const selectTodayAppointmentsSummary = (state) => state.financialMovements.todayAppointments;
export const selectTodayAppointmentsSummaryLoading = (state) => state.financialMovements.todayAppointmentsLoading;

export const selectFilters = (state) => state.financialMovements.filters;

export default financialMovementsSlice.reducer;
