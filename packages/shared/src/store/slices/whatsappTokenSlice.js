import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import whatsappApi from '../../api/whatsappApi.js';

// ================================
// ASYNC THUNKS
// ================================

/**
 * Obtener información del token de WhatsApp
 */
export const fetchTokenInfo = createAsyncThunk(
  'whatsappToken/fetchTokenInfo',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const businessId = state.business?.currentBusiness?.id;
      
      if (!businessId) {
        throw new Error('Business ID no disponible');
      }
      
      const response = await whatsappApi.getTokenInfo(businessId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Almacenar token de WhatsApp manualmente
 */
export const storeToken = createAsyncThunk(
  'whatsappToken/storeToken',
  async (tokenData, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const businessId = state.business?.currentBusiness?.id;
      
      if (!businessId) {
        throw new Error('Business ID no disponible');
      }
      
      const response = await whatsappApi.storeToken(businessId, tokenData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Rotar token de WhatsApp
 */
export const rotateToken = createAsyncThunk(
  'whatsappToken/rotateToken',
  async (newAccessToken, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const businessId = state.business?.currentBusiness?.id;
      
      if (!businessId) {
        throw new Error('Business ID no disponible');
      }
      
      const response = await whatsappApi.rotateToken(businessId, newAccessToken);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Eliminar token de WhatsApp (desconectar)
 */
export const deleteToken = createAsyncThunk(
  'whatsappToken/deleteToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const businessId = state.business?.currentBusiness?.id;
      
      if (!businessId) {
        throw new Error('Business ID no disponible');
      }
      
      const response = await whatsappApi.deleteToken(businessId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Probar conexión de WhatsApp
 */
export const testConnection = createAsyncThunk(
  'whatsappToken/testConnection',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const businessId = state.business?.currentBusiness?.id;
      
      if (!businessId) {
        throw new Error('Business ID no disponible');
      }
      
      const response = await whatsappApi.testConnection(businessId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Obtener configuración de Embedded Signup
 */
export const getEmbeddedSignupConfig = createAsyncThunk(
  'whatsappToken/getEmbeddedSignupConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await whatsappApi.getEmbeddedSignupConfig();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Procesar callback de Embedded Signup
 */
export const handleEmbeddedSignupCallback = createAsyncThunk(
  'whatsappToken/handleEmbeddedSignupCallback',
  async (callbackData, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const businessId = state.business?.currentBusiness?.id;
      
      if (!businessId) {
        throw new Error('Business ID no disponible');
      }
      
      const response = await whatsappApi.handleEmbeddedSignupCallback({
        ...callbackData,
        businessId
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// ================================
// INITIAL STATE
// ================================

const initialState = {
  // Token data
  tokenInfo: {
    hasToken: false,
    isActive: false,
    tokenType: null,
    expiresAt: null,
    lastRotatedAt: null,
    createdAt: null,
    phoneNumber: null,
    phoneNumberId: null,
    wabaId: null,
    permissions: [],
    source: null
  },
  
  // Connection test data
  connectionTest: {
    success: null,
    phoneNumber: null,
    verifiedName: null,
    quality: null,
    status: null
  },
  
  // Embedded Signup config
  embeddedSignupConfig: {
    appId: null,
    redirectUri: null,
    state: null,
    scope: null
  },
  
  // Loading states
  isLoading: false,
  isStoring: false,
  isRotating: false,
  isDeleting: false,
  isTesting: false,
  isHandlingCallback: false,
  
  // Error states
  error: null,
  storeError: null,
  rotateError: null,
  deleteError: null,
  testError: null,
  callbackError: null,
  
  // Success messages
  successMessage: null,
  
  // Metadata
  lastFetched: null
};

// ================================
// SLICE
// ================================

const whatsappTokenSlice = createSlice({
  name: 'whatsappToken',
  initialState,
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.error = null;
      state.storeError = null;
      state.rotateError = null;
      state.deleteError = null;
      state.testError = null;
      state.callbackError = null;
    },
    
    // Clear success message
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    
    // Reset connection test
    resetConnectionTest: (state) => {
      state.connectionTest = {
        success: null,
        phoneNumber: null,
        verifiedName: null,
        quality: null,
        status: null
      };
      state.testError = null;
    },
    
    // Reset state
    resetState: () => initialState
  },
  extraReducers: (builder) => {
    // ==================== FETCH TOKEN INFO ====================
    builder
      .addCase(fetchTokenInfo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTokenInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tokenInfo = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchTokenInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    
    // ==================== STORE TOKEN ====================
    builder
      .addCase(storeToken.pending, (state) => {
        state.isStoring = true;
        state.storeError = null;
        state.successMessage = null;
      })
      .addCase(storeToken.fulfilled, (state, action) => {
        state.isStoring = false;
        state.tokenInfo = {
          ...state.tokenInfo,
          hasToken: true,
          isActive: action.payload.isActive,
          phoneNumber: action.payload.phoneNumber,
          phoneNumberId: action.payload.phoneNumberId,
          expiresAt: action.payload.expiresAt,
          createdAt: action.payload.createdAt
        };
        state.successMessage = action.payload.message || 'Token almacenado correctamente';
      })
      .addCase(storeToken.rejected, (state, action) => {
        state.isStoring = false;
        state.storeError = action.payload;
      });
    
    // ==================== ROTATE TOKEN ====================
    builder
      .addCase(rotateToken.pending, (state) => {
        state.isRotating = true;
        state.rotateError = null;
        state.successMessage = null;
      })
      .addCase(rotateToken.fulfilled, (state, action) => {
        state.isRotating = false;
        state.tokenInfo = {
          ...state.tokenInfo,
          isActive: action.payload.isActive,
          expiresAt: action.payload.expiresAt,
          lastRotatedAt: action.payload.lastRotatedAt
        };
        state.successMessage = action.payload.message || 'Token rotado correctamente';
      })
      .addCase(rotateToken.rejected, (state, action) => {
        state.isRotating = false;
        state.rotateError = action.payload;
      });
    
    // ==================== DELETE TOKEN ====================
    builder
      .addCase(deleteToken.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
        state.successMessage = null;
      })
      .addCase(deleteToken.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.tokenInfo = initialState.tokenInfo;
        state.successMessage = action.payload.message || 'WhatsApp desconectado correctamente';
      })
      .addCase(deleteToken.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload;
      });
    
    // ==================== TEST CONNECTION ====================
    builder
      .addCase(testConnection.pending, (state) => {
        state.isTesting = true;
        state.testError = null;
        state.connectionTest = initialState.connectionTest;
      })
      .addCase(testConnection.fulfilled, (state, action) => {
        state.isTesting = false;
        state.connectionTest = {
          success: true,
          ...action.payload
        };
      })
      .addCase(testConnection.rejected, (state, action) => {
        state.isTesting = false;
        state.testError = action.payload;
        state.connectionTest = {
          ...initialState.connectionTest,
          success: false
        };
      });
    
    // ==================== GET EMBEDDED SIGNUP CONFIG ====================
    builder
      .addCase(getEmbeddedSignupConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getEmbeddedSignupConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.embeddedSignupConfig = action.payload;
      })
      .addCase(getEmbeddedSignupConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    
    // ==================== HANDLE EMBEDDED SIGNUP CALLBACK ====================
    builder
      .addCase(handleEmbeddedSignupCallback.pending, (state) => {
        state.isHandlingCallback = true;
        state.callbackError = null;
        state.successMessage = null;
      })
      .addCase(handleEmbeddedSignupCallback.fulfilled, (state, action) => {
        state.isHandlingCallback = false;
        state.tokenInfo = {
          ...state.tokenInfo,
          hasToken: true,
          isActive: true,
          phoneNumber: action.payload.phoneNumber,
          source: 'embedded_signup'
        };
        state.successMessage = action.payload.message || 'WhatsApp conectado correctamente';
      })
      .addCase(handleEmbeddedSignupCallback.rejected, (state, action) => {
        state.isHandlingCallback = false;
        state.callbackError = action.payload;
      });
  }
});

// ================================
// ACTIONS
// ================================

export const {
  clearErrors,
  clearSuccessMessage,
  resetConnectionTest,
  resetState
} = whatsappTokenSlice.actions;

// ================================
// SELECTORS
// ================================

export const selectTokenInfo = (state) => state.whatsappToken.tokenInfo;
export const selectHasToken = (state) => state.whatsappToken.tokenInfo.hasToken;
export const selectIsTokenActive = (state) => state.whatsappToken.tokenInfo.isActive;
export const selectConnectionTest = (state) => state.whatsappToken.connectionTest;
export const selectEmbeddedSignupConfig = (state) => state.whatsappToken.embeddedSignupConfig;
export const selectIsLoading = (state) => state.whatsappToken.isLoading;
export const selectIsStoring = (state) => state.whatsappToken.isStoring;
export const selectIsRotating = (state) => state.whatsappToken.isRotating;
export const selectIsDeleting = (state) => state.whatsappToken.isDeleting;
export const selectIsTesting = (state) => state.whatsappToken.isTesting;
export const selectIsHandlingCallback = (state) => state.whatsappToken.isHandlingCallback;
export const selectError = (state) => state.whatsappToken.error;
export const selectStoreError = (state) => state.whatsappToken.storeError;
export const selectRotateError = (state) => state.whatsappToken.rotateError;
export const selectDeleteError = (state) => state.whatsappToken.deleteError;
export const selectTestError = (state) => state.whatsappToken.testError;
export const selectCallbackError = (state) => state.whatsappToken.callbackError;
export const selectSuccessMessage = (state) => state.whatsappToken.successMessage;

// ================================
// EXPORT REDUCER
// ================================

export default whatsappTokenSlice.reducer;
