/**
 * Redux Slice para el sistema de vouchers
 * Maneja el estado de vouchers, bloqueos y cancelaciones
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import voucherApi from '../../api/voucherApi';

/**
 * ========================================
 * ASYNC THUNKS - CLIENTE
 * ========================================
 */

/**
 * Cargar vouchers activos del cliente
 */
export const fetchMyVouchers = createAsyncThunk(
  'voucher/fetchMyVouchers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await voucherApi.getMyVouchers();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Error al cargar vouchers'
      );
    }
  }
);

/**
 * Validar un código de voucher
 */
export const validateVoucherCode = createAsyncThunk(
  'voucher/validateVoucherCode',
  async (voucherCode, { rejectWithValue }) => {
    try {
      const response = await voucherApi.validateVoucher(voucherCode);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Voucher no válido'
      );
    }
  }
);

/**
 * Aplicar voucher a una cita
 */
export const applyVoucherToBooking = createAsyncThunk(
  'voucher/applyVoucherToBooking',
  async ({ voucherCode, bookingId }, { rejectWithValue }) => {
    try {
      const response = await voucherApi.applyVoucher({ voucherCode, bookingId });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Error al aplicar voucher'
      );
    }
  }
);

/**
 * Verificar estado de bloqueo del cliente
 */
export const checkCustomerBlockStatus = createAsyncThunk(
  'voucher/checkCustomerBlockStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await voucherApi.checkBlockStatus();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Error al verificar bloqueo'
      );
    }
  }
);

/**
 * Obtener historial de cancelaciones
 */
export const fetchCancellationHistory = createAsyncThunk(
  'voucher/fetchCancellationHistory',
  async (days = 30, { rejectWithValue }) => {
    try {
      const response = await voucherApi.getCancellationHistory(days);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Error al cargar historial'
      );
    }
  }
);

/**
 * ========================================
 * ASYNC THUNKS - NEGOCIO
 * ========================================
 */

/**
 * Listar vouchers del negocio
 */
export const fetchBusinessVouchers = createAsyncThunk(
  'voucher/fetchBusinessVouchers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await voucherApi.listBusinessVouchers(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Error al cargar vouchers del negocio'
      );
    }
  }
);

/**
 * Cancelar voucher
 */
export const cancelBusinessVoucher = createAsyncThunk(
  'voucher/cancelBusinessVoucher',
  async ({ voucherId, reason }, { rejectWithValue }) => {
    try {
      const response = await voucherApi.cancelVoucher(voucherId, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Error al cancelar voucher'
      );
    }
  }
);

/**
 * Crear voucher manual
 */
export const createManualVoucher = createAsyncThunk(
  'voucher/createManualVoucher',
  async (data, { rejectWithValue }) => {
    try {
      const response = await voucherApi.createManualVoucher(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Error al crear voucher'
      );
    }
  }
);

/**
 * Listar clientes bloqueados
 */
export const fetchBlockedCustomers = createAsyncThunk(
  'voucher/fetchBlockedCustomers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await voucherApi.listBlockedCustomers(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Error al cargar clientes bloqueados'
      );
    }
  }
);

/**
 * Levantar bloqueo
 */
export const liftCustomerBlock = createAsyncThunk(
  'voucher/liftCustomerBlock',
  async ({ blockId, notes }, { rejectWithValue }) => {
    try {
      const response = await voucherApi.liftBlock(blockId, { notes });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Error al levantar bloqueo'
      );
    }
  }
);

/**
 * Obtener estadísticas de cliente
 */
export const fetchCustomerStats = createAsyncThunk(
  'voucher/fetchCustomerStats',
  async ({ customerId, days = 30 }, { rejectWithValue }) => {
    try {
      const response = await voucherApi.getCustomerStats(customerId, days);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Error al cargar estadísticas'
      );
    }
  }
);

/**
 * ========================================
 * ESTADO INICIAL
 * ========================================
 */

const initialState = {
  // Vouchers del cliente
  myVouchers: [],
  myVouchersLoading: false,
  myVouchersError: null,

  // Validación de voucher
  validatedVoucher: null,
  validationLoading: false,
  validationError: null,

  // Aplicación de voucher
  appliedVoucher: null,
  applyLoading: false,
  applyError: null,

  // Estado de bloqueo del cliente
  blockStatus: null,
  blockStatusLoading: false,
  blockStatusError: null,

  // Historial de cancelaciones del cliente
  cancellationHistory: [],
  historyLoading: false,
  historyError: null,

  // Vouchers del negocio (paginados)
  businessVouchers: {
    data: [],
    pagination: null,
    loading: false,
    error: null
  },

  // Clientes bloqueados
  blockedCustomers: {
    data: [],
    loading: false,
    error: null
  },

  // Estadísticas de cliente
  customerStats: null,
  customerStatsLoading: false,
  customerStatsError: null,

  // Estado de operaciones
  operationLoading: false,
  operationError: null,
  operationSuccess: null
};

/**
 * ========================================
 * SLICE
 * ========================================
 */

const voucherSlice = createSlice({
  name: 'voucher',
  initialState,
  reducers: {
    // Limpiar validación
    clearValidation: (state) => {
      state.validatedVoucher = null;
      state.validationError = null;
    },

    // Limpiar estado de aplicación
    clearApplyState: (state) => {
      state.appliedVoucher = null;
      state.applyError = null;
    },

    // Limpiar mensajes de operación
    clearOperationMessages: (state) => {
      state.operationError = null;
      state.operationSuccess = null;
    },

    // Reset completo del estado
    resetVoucherState: () => initialState
  },
  extraReducers: (builder) => {
    /**
     * FETCH MY VOUCHERS
     */
    builder
      .addCase(fetchMyVouchers.pending, (state) => {
        state.myVouchersLoading = true;
        state.myVouchersError = null;
      })
      .addCase(fetchMyVouchers.fulfilled, (state, action) => {
        state.myVouchersLoading = false;
        state.myVouchers = action.payload.vouchers || [];
      })
      .addCase(fetchMyVouchers.rejected, (state, action) => {
        state.myVouchersLoading = false;
        state.myVouchersError = action.payload;
      });

    /**
     * VALIDATE VOUCHER CODE
     */
    builder
      .addCase(validateVoucherCode.pending, (state) => {
        state.validationLoading = true;
        state.validationError = null;
        state.validatedVoucher = null;
      })
      .addCase(validateVoucherCode.fulfilled, (state, action) => {
        state.validationLoading = false;
        state.validatedVoucher = action.payload.voucher;
      })
      .addCase(validateVoucherCode.rejected, (state, action) => {
        state.validationLoading = false;
        state.validationError = action.payload;
      });

    /**
     * APPLY VOUCHER
     */
    builder
      .addCase(applyVoucherToBooking.pending, (state) => {
        state.applyLoading = true;
        state.applyError = null;
        state.appliedVoucher = null;
      })
      .addCase(applyVoucherToBooking.fulfilled, (state, action) => {
        state.applyLoading = false;
        state.appliedVoucher = action.payload.voucher;
        // Actualizar lista de vouchers (marcar como usado)
        state.myVouchers = state.myVouchers.filter(
          v => v.id !== action.payload.voucher.id
        );
      })
      .addCase(applyVoucherToBooking.rejected, (state, action) => {
        state.applyLoading = false;
        state.applyError = action.payload;
      });

    /**
     * CHECK BLOCK STATUS
     */
    builder
      .addCase(checkCustomerBlockStatus.pending, (state) => {
        state.blockStatusLoading = true;
        state.blockStatusError = null;
      })
      .addCase(checkCustomerBlockStatus.fulfilled, (state, action) => {
        state.blockStatusLoading = false;
        state.blockStatus = action.payload;
      })
      .addCase(checkCustomerBlockStatus.rejected, (state, action) => {
        state.blockStatusLoading = false;
        state.blockStatusError = action.payload;
      });

    /**
     * FETCH CANCELLATION HISTORY
     */
    builder
      .addCase(fetchCancellationHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchCancellationHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.cancellationHistory = action.payload.history || [];
      })
      .addCase(fetchCancellationHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload;
      });

    /**
     * FETCH BUSINESS VOUCHERS
     */
    builder
      .addCase(fetchBusinessVouchers.pending, (state) => {
        state.businessVouchers.loading = true;
        state.businessVouchers.error = null;
      })
      .addCase(fetchBusinessVouchers.fulfilled, (state, action) => {
        state.businessVouchers.loading = false;
        state.businessVouchers.data = action.payload.vouchers || [];
        state.businessVouchers.pagination = action.payload.pagination || null;
      })
      .addCase(fetchBusinessVouchers.rejected, (state, action) => {
        state.businessVouchers.loading = false;
        state.businessVouchers.error = action.payload;
      });

    /**
     * CANCEL BUSINESS VOUCHER
     */
    builder
      .addCase(cancelBusinessVoucher.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
        state.operationSuccess = null;
      })
      .addCase(cancelBusinessVoucher.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.operationSuccess = 'Voucher cancelado exitosamente';
        // Actualizar el voucher en la lista
        const index = state.businessVouchers.data.findIndex(
          v => v.id === action.payload.voucher.id
        );
        if (index !== -1) {
          state.businessVouchers.data[index] = action.payload.voucher;
        }
      })
      .addCase(cancelBusinessVoucher.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload;
      });

    /**
     * CREATE MANUAL VOUCHER
     */
    builder
      .addCase(createManualVoucher.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
        state.operationSuccess = null;
      })
      .addCase(createManualVoucher.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.operationSuccess = 'Voucher creado exitosamente';
        // Agregar el nuevo voucher a la lista
        state.businessVouchers.data.unshift(action.payload.voucher);
      })
      .addCase(createManualVoucher.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload;
      });

    /**
     * FETCH BLOCKED CUSTOMERS
     */
    builder
      .addCase(fetchBlockedCustomers.pending, (state) => {
        state.blockedCustomers.loading = true;
        state.blockedCustomers.error = null;
      })
      .addCase(fetchBlockedCustomers.fulfilled, (state, action) => {
        state.blockedCustomers.loading = false;
        state.blockedCustomers.data = action.payload.blocks || [];
      })
      .addCase(fetchBlockedCustomers.rejected, (state, action) => {
        state.blockedCustomers.loading = false;
        state.blockedCustomers.error = action.payload;
      });

    /**
     * LIFT CUSTOMER BLOCK
     */
    builder
      .addCase(liftCustomerBlock.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
        state.operationSuccess = null;
      })
      .addCase(liftCustomerBlock.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.operationSuccess = 'Bloqueo levantado exitosamente';
        // Actualizar el bloqueo en la lista
        const index = state.blockedCustomers.data.findIndex(
          b => b.id === action.payload.block.id
        );
        if (index !== -1) {
          state.blockedCustomers.data[index] = action.payload.block;
        }
      })
      .addCase(liftCustomerBlock.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload;
      });

    /**
     * FETCH CUSTOMER STATS
     */
    builder
      .addCase(fetchCustomerStats.pending, (state) => {
        state.customerStatsLoading = true;
        state.customerStatsError = null;
      })
      .addCase(fetchCustomerStats.fulfilled, (state, action) => {
        state.customerStatsLoading = false;
        state.customerStats = action.payload;
      })
      .addCase(fetchCustomerStats.rejected, (state, action) => {
        state.customerStatsLoading = false;
        state.customerStatsError = action.payload;
      });
  }
});

/**
 * ========================================
 * EXPORTS
 * ========================================
 */

// Actions
export const {
  clearValidation,
  clearApplyState,
  clearOperationMessages,
  resetVoucherState
} = voucherSlice.actions;

// Reducer
export default voucherSlice.reducer;
