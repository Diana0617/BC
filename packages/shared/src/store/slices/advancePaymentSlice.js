import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import advancePaymentApi from '../../api/advancePaymentApi';

// ================================
// ASYNC THUNKS - Advance Payment Management
// ================================

/**
 * Verificar si se requiere pago adelantado para una cita
 */
export const checkAdvancePaymentRequired = createAsyncThunk(
  'advancePayment/checkAdvancePaymentRequired',
  async ({ businessId, serviceId, appointmentDate }, { rejectWithValue }) => {
    try {
      const response = await advancePaymentApi.checkAdvancePaymentRequired({
        businessId,
        serviceId,
        appointmentDate
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error verificando pago adelantado requerido'
      );
    }
  }
);

/**
 * Iniciar proceso de pago adelantado con Wompi
 */
export const initiateAdvancePayment = createAsyncThunk(
  'advancePayment/initiateAdvancePayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await advancePaymentApi.initiateAdvancePayment(paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error iniciando pago adelantado'
      );
    }
  }
);

/**
 * Confirmar pago adelantado (webhook o manual)
 */
export const confirmAdvancePayment = createAsyncThunk(
  'advancePayment/confirmAdvancePayment',
  async ({ transactionId, wompiData }, { rejectWithValue }) => {
    try {
      const response = await advancePaymentApi.confirmAdvancePayment({
        transactionId,
        wompiData
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error confirmando pago adelantado'
      );
    }
  }
);

/**
 * Verificar estado de transacción de pago adelantado
 */
export const checkAdvancePaymentStatus = createAsyncThunk(
  'advancePayment/checkAdvancePaymentStatus',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await advancePaymentApi.checkAdvancePaymentStatus(transactionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error verificando estado de pago'
      );
    }
  }
);

// ================================
// INITIAL STATE
// ================================

const initialState = {
  // Payment requirement check
  paymentRequired: false,
  paymentRequiredLoaded: false,
  requirementDetails: null,
  
  // Payment process
  currentPayment: null,
  paymentUrl: null,
  transactionId: null,
  
  // Payment status
  paymentStatus: null, // 'pending', 'approved', 'declined', 'error'
  paymentConfirmed: false,
  
  // Wompi integration
  wompiData: null,
  publicKey: null,
  
  // UI State
  loading: {
    checkRequired: false,
    initiate: false,
    confirm: false,
    status: false
  },
  
  // Errors
  errors: {
    checkRequired: null,
    initiate: null,
    confirm: null,
    status: null
  },
  
  // Success messages
  success: {
    initiate: null,
    confirm: null
  },
  
  // Modal states
  modals: {
    paymentRequired: false,
    paymentProcess: false,
    paymentConfirmation: false
  },
  
  // Flow control
  canProceedWithAppointment: false,
  paymentStep: 'check', // 'check', 'required', 'process', 'confirm', 'complete'
  
  // Payment details for current transaction
  paymentDetails: {
    amount: 0,
    currency: 'COP',
    description: '',
    reference: '',
    businessId: null,
    serviceId: null,
    appointmentDate: null
  }
};

// ================================
// SLICE
// ================================

const advancePaymentSlice = createSlice({
  name: 'advancePayment',
  initialState,
  reducers: {
    // UI Actions
    setPaymentStep: (state, action) => {
      state.paymentStep = action.payload;
    },
    
    setCanProceedWithAppointment: (state, action) => {
      state.canProceedWithAppointment = action.payload;
    },
    
    updatePaymentDetails: (state, action) => {
      state.paymentDetails = { ...state.paymentDetails, ...action.payload };
    },
    
    clearPaymentDetails: (state) => {
      state.paymentDetails = initialState.paymentDetails;
    },
    
    // Modal actions
    openModal: (state, action) => {
      const { modal, data } = action.payload;
      state.modals[modal] = true;
      
      if (modal === 'paymentRequired' && data) {
        state.requirementDetails = data;
      } else if (modal === 'paymentProcess' && data) {
        state.currentPayment = data;
      }
    },
    
    closeModal: (state, action) => {
      const modal = action.payload;
      state.modals[modal] = false;
      
      if (modal === 'paymentRequired') {
        state.requirementDetails = null;
      } else if (modal === 'paymentProcess') {
        state.currentPayment = null;
      }
    },
    
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modal => {
        state.modals[modal] = false;
      });
      state.requirementDetails = null;
      state.currentPayment = null;
    },
    
    // Payment flow actions
    resetPaymentFlow: (state) => {
      state.paymentRequired = false;
      state.paymentRequiredLoaded = false;
      state.requirementDetails = null;
      state.currentPayment = null;
      state.paymentUrl = null;
      state.transactionId = null;
      state.paymentStatus = null;
      state.paymentConfirmed = false;
      state.wompiData = null;
      state.canProceedWithAppointment = false;
      state.paymentStep = 'check';
      state.paymentDetails = initialState.paymentDetails;
    },
    
    setWompiData: (state, action) => {
      state.wompiData = action.payload;
    },
    
    setPublicKey: (state, action) => {
      state.publicKey = action.payload;
    },
    
    updatePaymentStatus: (state, action) => {
      state.paymentStatus = action.payload;
    },
    
    // Clear messages
    clearErrors: (state) => {
      Object.keys(state.errors).forEach(key => {
        state.errors[key] = null;
      });
    },
    
    clearSuccess: (state) => {
      Object.keys(state.success).forEach(key => {
        state.success[key] = null;
      });
    },
    
    clearMessages: (state) => {
      Object.keys(state.errors).forEach(key => {
        state.errors[key] = null;
      });
      Object.keys(state.success).forEach(key => {
        state.success[key] = null;
      });
    }
  },
  
  extraReducers: (builder) => {
    // Check Advance Payment Required
    builder
      .addCase(checkAdvancePaymentRequired.pending, (state) => {
        state.loading.checkRequired = true;
        state.errors.checkRequired = null;
      })
      .addCase(checkAdvancePaymentRequired.fulfilled, (state, action) => {
        state.loading.checkRequired = false;
        state.paymentRequired = action.payload.required;
        state.paymentRequiredLoaded = true;
        state.requirementDetails = action.payload;
        
        if (!action.payload.required) {
          state.canProceedWithAppointment = true;
          state.paymentStep = 'complete';
        } else {
          state.paymentStep = 'required';
        }
      })
      .addCase(checkAdvancePaymentRequired.rejected, (state, action) => {
        state.loading.checkRequired = false;
        state.errors.checkRequired = action.payload;
        state.paymentRequiredLoaded = true;
      });
    
    // Initiate Advance Payment
    builder
      .addCase(initiateAdvancePayment.pending, (state) => {
        state.loading.initiate = true;
        state.errors.initiate = null;
        state.success.initiate = null;
      })
      .addCase(initiateAdvancePayment.fulfilled, (state, action) => {
        state.loading.initiate = false;
        state.currentPayment = action.payload.payment;
        state.paymentUrl = action.payload.paymentUrl;
        state.transactionId = action.payload.transactionId;
        state.publicKey = action.payload.publicKey;
        state.success.initiate = action.payload.message;
        state.paymentStep = 'process';
      })
      .addCase(initiateAdvancePayment.rejected, (state, action) => {
        state.loading.initiate = false;
        state.errors.initiate = action.payload;
      });
    
    // Confirm Advance Payment
    builder
      .addCase(confirmAdvancePayment.pending, (state) => {
        state.loading.confirm = true;
        state.errors.confirm = null;
        state.success.confirm = null;
      })
      .addCase(confirmAdvancePayment.fulfilled, (state, action) => {
        state.loading.confirm = false;
        state.paymentConfirmed = true;
        state.paymentStatus = action.payload.status;
        state.canProceedWithAppointment = action.payload.status === 'approved';
        state.success.confirm = action.payload.message;
        state.paymentStep = action.payload.status === 'approved' ? 'complete' : 'error';
      })
      .addCase(confirmAdvancePayment.rejected, (state, action) => {
        state.loading.confirm = false;
        state.errors.confirm = action.payload;
        state.paymentStep = 'error';
      });
    
    // Check Advance Payment Status
    builder
      .addCase(checkAdvancePaymentStatus.pending, (state) => {
        state.loading.status = true;
        state.errors.status = null;
      })
      .addCase(checkAdvancePaymentStatus.fulfilled, (state, action) => {
        state.loading.status = false;
        state.paymentStatus = action.payload.status;
        state.currentPayment = action.payload.payment;
        
        if (action.payload.status === 'approved') {
          state.paymentConfirmed = true;
          state.canProceedWithAppointment = true;
          state.paymentStep = 'complete';
        } else if (action.payload.status === 'declined' || action.payload.status === 'error') {
          state.paymentStep = 'error';
        }
      })
      .addCase(checkAdvancePaymentStatus.rejected, (state, action) => {
        state.loading.status = false;
        state.errors.status = action.payload;
      });
  }
});

// ================================
// ACTIONS
// ================================

export const {
  setPaymentStep,
  setCanProceedWithAppointment,
  updatePaymentDetails,
  clearPaymentDetails,
  openModal,
  closeModal,
  closeAllModals,
  resetPaymentFlow,
  setWompiData,
  setPublicKey,
  updatePaymentStatus,
  clearErrors,
  clearSuccess,
  clearMessages
} = advancePaymentSlice.actions;

// ================================
// SELECTORS
// ================================

// Basic selectors
export const selectPaymentRequired = (state) => state.advancePayment.paymentRequired;
export const selectPaymentRequiredLoaded = (state) => state.advancePayment.paymentRequiredLoaded;
export const selectRequirementDetails = (state) => state.advancePayment.requirementDetails;
export const selectCurrentPayment = (state) => state.advancePayment.currentPayment;
export const selectPaymentUrl = (state) => state.advancePayment.paymentUrl;
export const selectTransactionId = (state) => state.advancePayment.transactionId;
export const selectPaymentStatus = (state) => state.advancePayment.paymentStatus;
export const selectPaymentConfirmed = (state) => state.advancePayment.paymentConfirmed;
export const selectWompiData = (state) => state.advancePayment.wompiData;
export const selectPublicKey = (state) => state.advancePayment.publicKey;
export const selectCanProceedWithAppointment = (state) => state.advancePayment.canProceedWithAppointment;
export const selectPaymentStep = (state) => state.advancePayment.paymentStep;
export const selectPaymentDetails = (state) => state.advancePayment.paymentDetails;

// Loading selectors
export const selectCheckRequiredLoading = (state) => state.advancePayment.loading.checkRequired;
export const selectInitiateLoading = (state) => state.advancePayment.loading.initiate;
export const selectConfirmLoading = (state) => state.advancePayment.loading.confirm;
export const selectStatusLoading = (state) => state.advancePayment.loading.status;

// Error selectors
export const selectCheckRequiredError = (state) => state.advancePayment.errors.checkRequired;
export const selectInitiateError = (state) => state.advancePayment.errors.initiate;
export const selectConfirmError = (state) => state.advancePayment.errors.confirm;
export const selectStatusError = (state) => state.advancePayment.errors.status;

// Success selectors
export const selectInitiateSuccess = (state) => state.advancePayment.success.initiate;
export const selectConfirmSuccess = (state) => state.advancePayment.success.confirm;

// Modal selectors
export const selectModals = (state) => state.advancePayment.modals;
export const selectPaymentRequiredModalOpen = (state) => state.advancePayment.modals.paymentRequired;
export const selectPaymentProcessModalOpen = (state) => state.advancePayment.modals.paymentProcess;
export const selectPaymentConfirmationModalOpen = (state) => state.advancePayment.modals.paymentConfirmation;

// Computed selectors
export const selectIsPaymentInProgress = (state) => {
  const step = selectPaymentStep(state);
  return ['required', 'process', 'confirm'].includes(step);
};

export const selectIsPaymentComplete = (state) => {
  return selectPaymentStep(state) === 'complete' && selectCanProceedWithAppointment(state);
};

export const selectHasPaymentError = (state) => {
  return selectPaymentStep(state) === 'error' || Object.values(state.advancePayment.errors).some(error => error !== null);
};

export const selectPaymentSummary = (state) => {
  const details = selectPaymentDetails(state);
  const currentPayment = selectCurrentPayment(state);
  const status = selectPaymentStatus(state);
  
  return {
    amount: details.amount || currentPayment?.amount || 0,
    currency: details.currency || 'COP',
    description: details.description || currentPayment?.description || '',
    status: status || 'pending',
    canProceed: selectCanProceedWithAppointment(state)
  };
};

export default advancePaymentSlice.reducer;