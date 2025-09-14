import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import advancePaymentApi from '../../api/advancePaymentApi';

// 🎯 ASYNC THUNKS

// Verificar si una cita requiere pago adelantado
export const checkAdvancePaymentRequired = createAsyncThunk(
  'advancePayment/checkRequired',
  async ({ appointmentId, businessId }, { rejectWithValue }) => {
    try {
      const response = await advancePaymentApi.checkAdvancePaymentRequired(appointmentId, businessId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Iniciar proceso de pago adelantado con Wompi
export const initiateAdvancePayment = createAsyncThunk(
  'advancePayment/initiate',
  async ({ appointmentId, businessId, customerData }, { rejectWithValue }) => {
    try {
      const response = await advancePaymentApi.initiateAdvancePayment(appointmentId, businessId, customerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Consultar estado del pago adelantado
export const checkAdvancePaymentStatus = createAsyncThunk(
  'advancePayment/checkStatus',
  async ({ appointmentId, businessId }, { rejectWithValue }) => {
    try {
      const response = await advancePaymentApi.checkAdvancePaymentStatus(appointmentId, businessId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Obtener configuración de pagos adelantados del negocio
export const getBusinessAdvancePaymentConfig = createAsyncThunk(
  'advancePayment/getBusinessConfig',
  async ({ businessId }, { rejectWithValue }) => {
    try {
      const response = await advancePaymentApi.getBusinessAdvancePaymentConfig(businessId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🏪 INITIAL STATE
const initialState = {
  // Estados de carga
  loading: {
    checkingRequired: false,
    initiating: false,
    checkingStatus: false,
    loadingConfig: false
  },
  
  // Errores
  errors: {
    checkRequired: null,
    initiate: null,
    checkStatus: null,
    config: null
  },
  
  // Datos de pago adelantado actual
  currentPayment: {
    appointmentId: null,
    required: false,
    amount: 0,
    percentage: 0,
    status: 'NOT_REQUIRED', // NOT_REQUIRED, PENDING, PAID, FAILED, REFUNDED
    wompiReference: null,
    paymentLink: null,
    wompiPublicKey: null,
    paidAt: null,
    transactionData: null
  },
  
  // Configuración del negocio
  businessConfig: {
    requireDeposit: false,
    depositPercentage: 50,
    depositMinAmount: 20000,
    allowPartialPayments: true,
    autoRefundCancellations: false
  },
  
  // Historial de pagos (para caché)
  paymentsHistory: {},
  
  // Estado de la UI
  ui: {
    showPaymentModal: false,
    selectedAppointmentId: null,
    paymentInProgress: false
  }
};

// 🍰 SLICE
const advancePaymentSlice = createSlice({
  name: 'advancePayment',
  initialState,
  reducers: {
    // Limpiar errores
    clearErrors: (state) => {
      state.errors = {
        checkRequired: null,
        initiate: null,
        checkStatus: null,
        config: null
      };
    },
    
    // Limpiar pago actual
    clearCurrentPayment: (state) => {
      state.currentPayment = initialState.currentPayment;
    },
    
    // UI Actions
    showPaymentModal: (state, action) => {
      state.ui.showPaymentModal = true;
      state.ui.selectedAppointmentId = action.payload.appointmentId;
    },
    
    hidePaymentModal: (state) => {
      state.ui.showPaymentModal = false;
      state.ui.selectedAppointmentId = null;
      state.ui.paymentInProgress = false;
    },
    
    setPaymentInProgress: (state, action) => {
      state.ui.paymentInProgress = action.payload;
    },
    
    // Actualizar estado desde webhook (para cuando llegue confirmación)
    updatePaymentFromWebhook: (state, action) => {
      const { appointmentId, status, transactionData, paidAt } = action.payload;
      
      // Actualizar pago actual si coincide
      if (state.currentPayment.appointmentId === appointmentId) {
        state.currentPayment.status = status;
        state.currentPayment.transactionData = transactionData;
        state.currentPayment.paidAt = paidAt;
      }
      
      // Actualizar en historial
      if (state.paymentsHistory[appointmentId]) {
        state.paymentsHistory[appointmentId] = {
          ...state.paymentsHistory[appointmentId],
          status,
          transactionData,
          paidAt
        };
      }
    },
    
    // Cachear información de pago
    cachePaymentInfo: (state, action) => {
      const { appointmentId, paymentInfo } = action.payload;
      state.paymentsHistory[appointmentId] = paymentInfo;
    }
  },
  
  extraReducers: (builder) => {
    // 🔍 CHECK ADVANCE PAYMENT REQUIRED
    builder
      .addCase(checkAdvancePaymentRequired.pending, (state) => {
        state.loading.checkingRequired = true;
        state.errors.checkRequired = null;
      })
      .addCase(checkAdvancePaymentRequired.fulfilled, (state, action) => {
        state.loading.checkingRequired = false;
        state.currentPayment = {
          ...state.currentPayment,
          appointmentId: action.meta.arg.appointmentId,
          required: action.payload.required,
          amount: action.payload.amount,
          percentage: action.payload.percentage,
          status: action.payload.currentStatus || 'NOT_REQUIRED'
        };
        
        // Cachear información
        state.paymentsHistory[action.meta.arg.appointmentId] = action.payload;
      })
      .addCase(checkAdvancePaymentRequired.rejected, (state, action) => {
        state.loading.checkingRequired = false;
        state.errors.checkRequired = action.payload;
      });
    
    // 🚀 INITIATE ADVANCE PAYMENT
    builder
      .addCase(initiateAdvancePayment.pending, (state) => {
        state.loading.initiating = true;
        state.errors.initiate = null;
        state.ui.paymentInProgress = true;
      })
      .addCase(initiateAdvancePayment.fulfilled, (state, action) => {
        state.loading.initiating = false;
        state.currentPayment = {
          ...state.currentPayment,
          status: 'PENDING',
          wompiReference: action.payload.wompiReference,
          paymentLink: action.payload.paymentLink,
          wompiPublicKey: action.payload.wompiPublicKey
        };
        
        // Actualizar historial
        const appointmentId = action.meta.arg.appointmentId;
        state.paymentsHistory[appointmentId] = {
          ...state.paymentsHistory[appointmentId],
          ...action.payload
        };
      })
      .addCase(initiateAdvancePayment.rejected, (state, action) => {
        state.loading.initiating = false;
        state.errors.initiate = action.payload;
        state.ui.paymentInProgress = false;
      });
    
    // ✅ CHECK ADVANCE PAYMENT STATUS
    builder
      .addCase(checkAdvancePaymentStatus.pending, (state) => {
        state.loading.checkingStatus = true;
        state.errors.checkStatus = null;
      })
      .addCase(checkAdvancePaymentStatus.fulfilled, (state, action) => {
        state.loading.checkingStatus = false;
        
        const appointmentId = action.meta.arg.appointmentId;
        const statusData = action.payload;
        
        // Actualizar pago actual si coincide
        if (state.currentPayment.appointmentId === appointmentId) {
          state.currentPayment = {
            ...state.currentPayment,
            status: statusData.status,
            paidAt: statusData.paidAt,
            transactionData: statusData.transactionData
          };
        }
        
        // Actualizar historial
        state.paymentsHistory[appointmentId] = {
          ...state.paymentsHistory[appointmentId],
          ...statusData
        };
      })
      .addCase(checkAdvancePaymentStatus.rejected, (state, action) => {
        state.loading.checkingStatus = false;
        state.errors.checkStatus = action.payload;
      });
    
    // ⚙️ GET BUSINESS ADVANCE PAYMENT CONFIG
    builder
      .addCase(getBusinessAdvancePaymentConfig.pending, (state) => {
        state.loading.loadingConfig = true;
        state.errors.config = null;
      })
      .addCase(getBusinessAdvancePaymentConfig.fulfilled, (state, action) => {
        state.loading.loadingConfig = false;
        state.businessConfig = action.payload.depositSettings;
      })
      .addCase(getBusinessAdvancePaymentConfig.rejected, (state, action) => {
        state.loading.loadingConfig = false;
        state.errors.config = action.payload;
      });
  }
});

// 📤 ACTIONS EXPORT
export const {
  clearErrors,
  clearCurrentPayment,
  showPaymentModal,
  hidePaymentModal,
  setPaymentInProgress,
  updatePaymentFromWebhook,
  cachePaymentInfo
} = advancePaymentSlice.actions;

// 🎯 SELECTORS
export const selectAdvancePaymentState = (state) => state.advancePayment;
export const selectAdvancePaymentLoading = (state) => state.advancePayment.loading;
export const selectAdvancePaymentErrors = (state) => state.advancePayment.errors;
export const selectCurrentPayment = (state) => state.advancePayment.currentPayment;
export const selectBusinessConfig = (state) => state.advancePayment.businessConfig;
export const selectPaymentsHistory = (state) => state.advancePayment.paymentsHistory;
export const selectAdvancePaymentUI = (state) => state.advancePayment.ui;

// Selector para obtener información de pago de una cita específica
export const selectPaymentForAppointment = (appointmentId) => (state) => {
  if (state.advancePayment.currentPayment.appointmentId === appointmentId) {
    return state.advancePayment.currentPayment;
  }
  return state.advancePayment.paymentsHistory[appointmentId] || null;
};

// Selector para verificar si una cita tiene pago requerido
export const selectIsPaymentRequired = (appointmentId) => (state) => {
  const payment = selectPaymentForAppointment(appointmentId)(state);
  return payment?.required || false;
};

// Selector para verificar si una cita está pagada
export const selectIsPaymentPaid = (appointmentId) => (state) => {
  const payment = selectPaymentForAppointment(appointmentId)(state);
  return payment?.status === 'PAID';
};

// Selector para verificar si se puede proceder con una cita
export const selectCanProceedWithAppointment = (appointmentId) => (state) => {
  const payment = selectPaymentForAppointment(appointmentId)(state);
  if (!payment?.required) return true; // No requiere pago, se puede proceder
  return payment?.status === 'PAID'; // Requiere pago y está pagado
};

export default advancePaymentSlice.reducer;