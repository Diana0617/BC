import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { publicInvitationApi } from '../../api/publicInvitationApi';

// 📧 INVITACIONES PÚBLICAS - Async Thunks

/**
 * Validar token de invitación
 */
export const validateInvitationToken = createAsyncThunk(
  'publicInvitation/validateInvitationToken',
  async (token, { rejectWithValue }) => {
    try {
      const response = await publicInvitationApi.validateInvitation(token);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Token de invitación inválido',
        status: error.response?.status,
        errorType: error.response?.status === 404 ? 'NOT_FOUND' : 
                  error.response?.status === 410 ? 'EXPIRED' : 'INVALID'
      });
    }
  }
);

/**
 * Procesar pago de invitación
 */
export const processInvitationPayment = createAsyncThunk(
  'publicInvitation/processInvitationPayment',
  async ({ token, paymentData }, { rejectWithValue }) => {
    try {
      const response = await publicInvitationApi.processPayment(token, paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error procesando pago',
        status: error.response?.status,
        details: error.response?.data?.details
      });
    }
  }
);

/**
 * Obtener estado de invitación
 */
export const getInvitationStatus = createAsyncThunk(
  'publicInvitation/getInvitationStatus',
  async (token, { rejectWithValue }) => {
    try {
      const response = await publicInvitationApi.getInvitationStatus(token);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error obteniendo estado',
        status: error.response?.status
      });
    }
  }
);

/**
 * Obtener información de éxito después del pago
 */
export const getSuccessInfo = createAsyncThunk(
  'publicInvitation/getSuccessInfo',
  async (token, { rejectWithValue }) => {
    try {
      const response = await publicInvitationApi.getSuccessInfo(token);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error obteniendo información',
        status: error.response?.status
      });
    }
  }
);

/**
 * Verificar disponibilidad de email
 */
export const checkEmailAvailability = createAsyncThunk(
  'publicInvitation/checkEmailAvailability',
  async (email, { rejectWithValue }) => {
    try {
      const response = await publicInvitationApi.checkEmailAvailability(email);
      return { email, available: response.data.available };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error verificando email',
        status: error.response?.status
      });
    }
  }
);

// Estado inicial
const initialState = {
  // Token y validación
  currentToken: null,
  isValidatingToken: false,
  
  // Información de la invitación
  invitationData: null,
  business: null,
  plan: null,
  
  // Estado de la invitación
  invitationStatus: null,
  isLoadingStatus: false,
  
  // Procesamiento de pago
  isProcessingPayment: false,
  paymentResult: null,
  
  // Información de éxito
  successInfo: null,
  isLoadingSuccessInfo: false,
  
  // Verificación de email
  emailCheckResults: {}, // { email: boolean }
  isCheckingEmail: false,
  
  // Estados de UI
  currentStep: 'validation', // 'validation', 'payment', 'processing', 'success', 'error'
  showPaymentForm: false,
  
  // Errores
  error: null,
  validationError: null,
  paymentError: null,
  
  // Configuración
  acceptedTerms: false,
  
  // Metadata
  lastUpdated: null
};

// Slice
const publicInvitationSlice = createSlice({
  name: 'publicInvitation',
  initialState,
  reducers: {
    setCurrentToken: (state, action) => {
      state.currentToken = action.payload;
    },
    clearInvitationData: (state) => {
      state.invitationData = null;
      state.business = null;
      state.plan = null;
      state.invitationStatus = null;
      state.currentToken = null;
    },
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    setShowPaymentForm: (state, action) => {
      state.showPaymentForm = action.payload;
    },
    setAcceptedTerms: (state, action) => {
      state.acceptedTerms = action.payload;
    },
    clearErrors: (state) => {
      state.error = null;
      state.validationError = null;
      state.paymentError = null;
    },
    clearValidationError: (state) => {
      state.validationError = null;
    },
    clearPaymentError: (state) => {
      state.paymentError = null;
    },
    clearPaymentResult: (state) => {
      state.paymentResult = null;
    },
    clearSuccessInfo: (state) => {
      state.successInfo = null;
    },
    resetInvitationFlow: (state) => {
      return {
        ...initialState,
        emailCheckResults: state.emailCheckResults // Mantener resultados de email
      };
    },
    addEmailCheckResult: (state, action) => {
      const { email, available } = action.payload;
      state.emailCheckResults[email] = available;
    }
  },
  extraReducers: (builder) => {
    builder
      // Validate Invitation Token
      .addCase(validateInvitationToken.pending, (state) => {
        state.isValidatingToken = true;
        state.validationError = null;
        state.error = null;
        state.currentStep = 'validation';
      })
      .addCase(validateInvitationToken.fulfilled, (state, action) => {
        state.isValidatingToken = false;
        state.invitationData = action.payload.data;
        state.business = action.payload.data.business;
        state.plan = action.payload.data.plan;
        state.invitationStatus = action.payload.data.invitation.status;
        state.currentStep = 'payment';
        state.showPaymentForm = true;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(validateInvitationToken.rejected, (state, action) => {
        state.isValidatingToken = false;
        state.validationError = action.payload;
        state.currentStep = 'error';
        
        // Limpiar datos si el token es inválido
        state.invitationData = null;
        state.business = null;
        state.plan = null;
      })

      // Process Payment
      .addCase(processInvitationPayment.pending, (state) => {
        state.isProcessingPayment = true;
        state.paymentError = null;
        state.error = null;
        state.currentStep = 'processing';
      })
      .addCase(processInvitationPayment.fulfilled, (state, action) => {
        state.isProcessingPayment = false;
        state.paymentResult = action.payload.data;
        state.currentStep = 'success';
        state.showPaymentForm = false;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(processInvitationPayment.rejected, (state, action) => {
        state.isProcessingPayment = false;
        state.paymentError = action.payload;
        state.currentStep = 'payment';
        state.showPaymentForm = true;
      })

      // Get Invitation Status
      .addCase(getInvitationStatus.pending, (state) => {
        state.isLoadingStatus = true;
        state.error = null;
      })
      .addCase(getInvitationStatus.fulfilled, (state, action) => {
        state.isLoadingStatus = false;
        state.invitationStatus = action.payload.status;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getInvitationStatus.rejected, (state, action) => {
        state.isLoadingStatus = false;
        state.error = action.payload;
      })

      // Get Success Info
      .addCase(getSuccessInfo.pending, (state) => {
        state.isLoadingSuccessInfo = true;
        state.error = null;
      })
      .addCase(getSuccessInfo.fulfilled, (state, action) => {
        state.isLoadingSuccessInfo = false;
        state.successInfo = action.payload.data;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getSuccessInfo.rejected, (state, action) => {
        state.isLoadingSuccessInfo = false;
        state.error = action.payload;
      })

      // Check Email Availability
      .addCase(checkEmailAvailability.pending, (state) => {
        state.isCheckingEmail = true;
      })
      .addCase(checkEmailAvailability.fulfilled, (state, action) => {
        state.isCheckingEmail = false;
        const { email, available } = action.payload;
        state.emailCheckResults[email] = available;
      })
      .addCase(checkEmailAvailability.rejected, (state, action) => {
        state.isCheckingEmail = false;
        state.error = action.payload;
      });
  }
});

// Actions
export const {
  setCurrentToken,
  clearInvitationData,
  setCurrentStep,
  setShowPaymentForm,
  setAcceptedTerms,
  clearErrors,
  clearValidationError,
  clearPaymentError,
  clearPaymentResult,
  clearSuccessInfo,
  resetInvitationFlow,
  addEmailCheckResult
} = publicInvitationSlice.actions;

// Selectors
export const selectPublicInvitation = (state) => state.publicInvitation;
export const selectCurrentToken = (state) => state.publicInvitation.currentToken;
export const selectInvitationData = (state) => state.publicInvitation.invitationData;
export const selectBusinessData = (state) => state.publicInvitation.business;
export const selectPlanData = (state) => state.publicInvitation.plan;
export const selectInvitationStatus = (state) => state.publicInvitation.invitationStatus;
export const selectCurrentStep = (state) => state.publicInvitation.currentStep;
export const selectShowPaymentForm = (state) => state.publicInvitation.showPaymentForm;
export const selectPaymentResult = (state) => state.publicInvitation.paymentResult;
export const selectSuccessInfo = (state) => state.publicInvitation.successInfo;
export const selectAcceptedTerms = (state) => state.publicInvitation.acceptedTerms;
export const selectIsValidatingToken = (state) => state.publicInvitation.isValidatingToken;
export const selectIsProcessingPayment = (state) => state.publicInvitation.isProcessingPayment;
export const selectValidationError = (state) => state.publicInvitation.validationError;
export const selectPaymentError = (state) => state.publicInvitation.paymentError;
export const selectPublicInvitationError = (state) => state.publicInvitation.error;
export const selectEmailCheckResults = (state) => state.publicInvitation.emailCheckResults;

// Computed Selectors
export const selectIsInvitationValid = (state) => {
  const invitationData = selectInvitationData(state);
  const status = selectInvitationStatus(state);
  
  return invitationData && ['SENT', 'VIEWED', 'PAYMENT_STARTED'].includes(status);
};

export const selectIsInvitationExpired = (state) => {
  const status = selectInvitationStatus(state);
  return status === 'EXPIRED';
};

export const selectIsInvitationCompleted = (state) => {
  const status = selectInvitationStatus(state);
  return status === 'COMPLETED';
};

export const selectCanProcessPayment = (state) => {
  const isValid = selectIsInvitationValid(state);
  const acceptedTerms = selectAcceptedTerms(state);
  const isProcessing = selectIsProcessingPayment(state);
  
  return isValid && acceptedTerms && !isProcessing;
};

export const selectFormattedPlanPrice = (state) => {
  const plan = selectPlanData(state);
  if (!plan || !plan.price) return null;
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(plan.price / 100);
};

export default publicInvitationSlice.reducer;