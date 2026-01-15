import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';

/**
 * Cash Register Redux Slice
 * Gestión de turnos de caja para recepcionistas y especialistas
 */

// ==================== ASYNC THUNKS ====================

/**
 * Verificar si el usuario debe usar gestión de caja
 */
export const checkShouldUseCashRegister = createAsyncThunk(
  'cashRegister/checkShouldUse',
  async ({ businessId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/api/cash-register/should-use', { businessId });
      return response.data.data;
    } catch (error) {
      return rejectWithValue({ error: error.message || 'Error al verificar acceso' });
    }
  }
);

/**
 * Obtener turno activo
 */
export const getActiveShift = createAsyncThunk(
  'cashRegister/getActiveShift',
  async ({ businessId, branchId }, { rejectWithValue }) => {
    try {
      const params = { businessId };
      if (branchId) {
        params.branchId = branchId;
      }
      const response = await apiClient.get('/api/cash-register/active-shift', params);
      return response.data.data;
    } catch (error) {
      // Si no hay turno activo, retornar null (no es un error)
      if (error.message && error.message.includes('404')) {
        return null;
      }
      return rejectWithValue({ error: error.message || 'Error al obtener turno' });
    }
  }
);

/**
 * Abrir nuevo turno
 */
export const openShift = createAsyncThunk(
  'cashRegister/openShift',
  async ({ businessId, branchId, openingBalance, openingNotes }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/api/cash-register/open-shift', {
        businessId,
        branchId,
        openingBalance,
        openingNotes
      });
      return response.data.data.shift;
    } catch (error) {
      return rejectWithValue({ error: error.message || 'Error al abrir turno' });
    }
  }
);

/**
 * Obtener resumen del turno actual
 */
export const getShiftSummary = createAsyncThunk(
  'cashRegister/getShiftSummary',
  async ({ businessId, branchId }, { rejectWithValue }) => {
    try {
      const params = { businessId };
      if (branchId) {
        params.branchId = branchId;
      }
      const response = await apiClient.get('/api/cash-register/shift-summary', params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue({ error: error.message || 'Error al obtener resumen' });
    }
  }
);

/**
 * Generar PDF de cierre (antes de cerrar turno)
 * Nota: Este thunk solo valida que el PDF se puede generar.
 * El PDF real se descarga directamente desde el componente.
 */
export const generateClosingPDF = createAsyncThunk(
  'cashRegister/generateClosingPDF',
  async ({ businessId, branchId }, { rejectWithValue }) => {
    try {
      // Para PDFs, necesitamos hacer fetch directo con blob response
      const token = await apiClient.getAuthToken();
      let url = `${apiClient.baseURL}/api/cash-register/generate-closing-pdf?businessId=${businessId}`;
      if (branchId) {
        url += `&branchId=${branchId}`;
      }
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Error al generar PDF');
      }
      
      // No retornamos el blob para evitar problemas de serialización en Redux
      // Solo indicamos que la generación fue exitosa
      return { success: true, url };
    } catch (error) {
      return rejectWithValue({ error: error.message || 'Error al generar PDF' });
    }
  }
);

/**
 * Cerrar turno
 */
export const closeShift = createAsyncThunk(
  'cashRegister/closeShift',
  async ({ businessId, actualClosingBalance, closingNotes }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/api/cash-register/close-shift', {
        businessId,
        actualClosingBalance,
        closingNotes
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue({ error: error.message || 'Error al cerrar turno' });
    }
  }
);

/**
 * Obtener historial de turnos
 */
export const getShiftsHistory = createAsyncThunk(
  'cashRegister/getShiftsHistory',
  async ({ businessId, branchId, page = 1, limit = 20, status, startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = {
        businessId,
        page,
        limit,
        status,
        startDate,
        endDate
      };
      if (branchId) {
        params.branchId = branchId;
      }
      const response = await apiClient.get('/api/cash-register/shifts-history', params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue({ error: error.message || 'Error al obtener historial' });
    }
  }
);
export const getLastClosedShift = createAsyncThunk(
  'cashRegister/getLastClosedShift',
  async ({ businessId, branchId }, { rejectWithValue }) => {
    try {
      const params = { businessId };
      if (branchId) {
        params.branchId = branchId;
      }
      const response = await apiClient.get('/api/cash-register/last-closed-shift', params);
      return response.data.data;
    } catch (error) {
      // Si no hay turno anterior, retornar null (no es un error)
      if (error.message && error.message.includes('404')) {
        return null;
      }
      return rejectWithValue({ error: error.message || 'Error al obtener último turno' });
    }
  }
);

// ==================== SLICE ====================

const initialState = {
  // Permisos
  shouldUse: false,
  shouldUseReason: '',
  userRole: null,
  
  // Turno actual
  activeShift: null,
  
  // Resumen del turno
  summary: null,
  
  // Último turno cerrado (para balance inicial)
  lastClosedShift: null,
  
  // Historial
  shiftsHistory: [],
  historyPagination: {
    currentPage: 1,
    totalPages: 0,
    totalShifts: 0,
    limit: 20
  },
  
  // Estados de carga
  loading: {
    checkingAccess: false,
    fetchingActiveShift: false,
    openingShift: false,
    closingShift: false,
    fetchingSummary: false,
    generatingPDF: false,
    fetchingHistory: false,
    fetchingLastClosed: false
  },
  
  // Errores
  error: null
};

const cashRegisterSlice = createSlice({
  name: 'cashRegister',
  initialState,
  reducers: {
    // Limpiar errores
    clearError: (state) => {
      state.error = null;
    },
    
    // Limpiar turno activo (al cerrar sesión)
    clearActiveShift: (state) => {
      state.activeShift = null;
      state.summary = null;
    },
    
    // Limpiar historial
    clearHistory: (state) => {
      state.shiftsHistory = [];
      state.historyPagination = initialState.historyPagination;
    },
    
    // Reset completo
    resetCashRegister: () => initialState
  },
  extraReducers: (builder) => {
    // ========== CHECK SHOULD USE ==========
    builder
      .addCase(checkShouldUseCashRegister.pending, (state) => {
        state.loading.checkingAccess = true;
        state.error = null;
      })
      .addCase(checkShouldUseCashRegister.fulfilled, (state, action) => {
        state.loading.checkingAccess = false;
        state.shouldUse = action.payload.shouldUse;
        state.shouldUseReason = action.payload.reason;
        state.userRole = action.payload.userRole;
      })
      .addCase(checkShouldUseCashRegister.rejected, (state, action) => {
        state.loading.checkingAccess = false;
        state.error = action.payload?.error || 'Error al verificar acceso';
      });

    // ========== GET ACTIVE SHIFT ==========
    builder
      .addCase(getActiveShift.pending, (state) => {
        state.loading.fetchingActiveShift = true;
        state.error = null;
      })
      .addCase(getActiveShift.fulfilled, (state, action) => {
        state.loading.fetchingActiveShift = false;
        state.activeShift = action.payload?.activeShift || null;
        state.summary = action.payload?.summary || null;
      })
      .addCase(getActiveShift.rejected, (state, action) => {
        state.loading.fetchingActiveShift = false;
        state.error = action.payload?.error || 'Error al obtener turno activo';
      });

    // ========== OPEN SHIFT ==========
    builder
      .addCase(openShift.pending, (state) => {
        state.loading.openingShift = true;
        state.error = null;
      })
      .addCase(openShift.fulfilled, (state, action) => {
        state.loading.openingShift = false;
        state.activeShift = action.payload;
        state.summary = null; // Resumen vacío al inicio
      })
      .addCase(openShift.rejected, (state, action) => {
        state.loading.openingShift = false;
        state.error = action.payload?.error || 'Error al abrir turno';
      });

    // ========== GET SHIFT SUMMARY ==========
    builder
      .addCase(getShiftSummary.pending, (state) => {
        state.loading.fetchingSummary = true;
        state.error = null;
      })
      .addCase(getShiftSummary.fulfilled, (state, action) => {
        state.loading.fetchingSummary = false;
        // Guardar todo el payload que incluye openingBalance, shiftId, etc.
        state.summary = {
          ...action.payload.summary,
          openingBalance: action.payload.openingBalance,
          shiftId: action.payload.shiftId,
          openedAt: action.payload.openedAt
        };
      })
      .addCase(getShiftSummary.rejected, (state, action) => {
        state.loading.fetchingSummary = false;
        state.error = action.payload?.error || 'Error al obtener resumen';
      });

    // ========== GENERATE CLOSING PDF ==========
    builder
      .addCase(generateClosingPDF.pending, (state) => {
        state.loading.generatingPDF = true;
        state.error = null;
      })
      .addCase(generateClosingPDF.fulfilled, (state) => {
        state.loading.generatingPDF = false;
        // PDF se maneja en el componente (descarga)
      })
      .addCase(generateClosingPDF.rejected, (state, action) => {
        state.loading.generatingPDF = false;
        state.error = action.payload?.error || 'Error al generar PDF';
      });

    // ========== CLOSE SHIFT ==========
    builder
      .addCase(closeShift.pending, (state) => {
        state.loading.closingShift = true;
        state.error = null;
      })
      .addCase(closeShift.fulfilled, (state, action) => {
        state.loading.closingShift = false;
        state.activeShift = null; // Turno cerrado
        state.summary = null;
        state.lastClosedShift = action.payload.shift; // Guardar como último cerrado
      })
      .addCase(closeShift.rejected, (state, action) => {
        state.loading.closingShift = false;
        state.error = action.payload?.error || 'Error al cerrar turno';
      });

    // ========== GET SHIFTS HISTORY ==========
    builder
      .addCase(getShiftsHistory.pending, (state) => {
        state.loading.fetchingHistory = true;
        state.error = null;
      })
      .addCase(getShiftsHistory.fulfilled, (state, action) => {
        state.loading.fetchingHistory = false;
        state.shiftsHistory = action.payload.shifts;
        state.historyPagination = {
          currentPage: action.payload.pagination.currentPage,
          totalPages: action.payload.pagination.totalPages,
          totalShifts: action.payload.pagination.totalShifts,
          limit: action.payload.pagination.limit
        };
      })
      .addCase(getShiftsHistory.rejected, (state, action) => {
        state.loading.fetchingHistory = false;
        state.error = action.payload?.error || 'Error al obtener historial';
      });

    // ========== GET LAST CLOSED SHIFT ==========
    builder
      .addCase(getLastClosedShift.pending, (state) => {
        state.loading.fetchingLastClosed = true;
        state.error = null;
      })
      .addCase(getLastClosedShift.fulfilled, (state, action) => {
        state.loading.fetchingLastClosed = false;
        state.lastClosedShift = action.payload?.lastShift || null;
      })
      .addCase(getLastClosedShift.rejected, (state, action) => {
        state.loading.fetchingLastClosed = false;
        state.error = action.payload?.error || 'Error al obtener último turno';
      });
  }
});

// ==================== EXPORTS ====================

export const {
  clearError,
  clearActiveShift,
  clearHistory,
  resetCashRegister
} = cashRegisterSlice.actions;

export default cashRegisterSlice.reducer;

// ==================== SELECTORS ====================

export const selectShouldUseCashRegister = (state) => state.cashRegister.shouldUse;
export const selectActiveShift = (state) => state.cashRegister.activeShift;
export const selectShiftSummary = (state) => state.cashRegister.summary;
export const selectLastClosedShift = (state) => state.cashRegister.lastClosedShift;
export const selectShiftsHistory = (state) => state.cashRegister.shiftsHistory;
export const selectHistoryPagination = (state) => state.cashRegister.historyPagination;
export const selectCashRegisterLoading = (state) => state.cashRegister.loading;
export const selectCashRegisterError = (state) => state.cashRegister.error;
