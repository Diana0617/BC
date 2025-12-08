import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentMethodsApi } from '../../api/paymentMethodsApi.js';

// ================================
// ASYNC THUNKS
// ================================

/**
 * Obtener todos los métodos de pago del negocio
 */
export const fetchPaymentMethods = createAsyncThunk(
  'paymentMethods/fetchPaymentMethods',
  async (activeOnly = false, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const businessId = state.business?.currentBusiness?.id;
      
      if (!businessId) {
        throw new Error('Business ID no disponible');
      }
      
      const response = await paymentMethodsApi.getPaymentMethods(businessId, activeOnly);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/**
 * Crear un nuevo método de pago
 */
export const createPaymentMethod = createAsyncThunk(
  'paymentMethods/createPaymentMethod',
  async (methodData, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const business = state.business?.currentBusiness;
      const businessId = business?.id;
      
      console.log('🔍 Debug createPaymentMethod:', {
        business,
        businessId,
        typeOfBusinessId: typeof businessId
      });
      
      if (!businessId) {
        throw new Error('Business ID no disponible');
      }
      
      const response = await paymentMethodsApi.createPaymentMethod(businessId, methodData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/**
 * Actualizar un método de pago existente
 */
export const updatePaymentMethod = createAsyncThunk(
  'paymentMethods/updatePaymentMethod',
  async ({ methodId, methodData }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const businessId = state.business?.currentBusiness?.id;
      
      if (!businessId) {
        throw new Error('Business ID no disponible');
      }
      
      const response = await paymentMethodsApi.updatePaymentMethod(businessId, methodId, methodData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/**
 * Activar/Desactivar un método de pago (toggle)
 */
export const togglePaymentMethod = createAsyncThunk(
  'paymentMethods/togglePaymentMethod',
  async (methodId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const businessId = state.business?.currentBusiness?.id;
      
      if (!businessId) {
        throw new Error('Business ID no disponible');
      }
      
      const response = await paymentMethodsApi.togglePaymentMethod(businessId, methodId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/**
 * Eliminar un método de pago
 */
export const deletePaymentMethod = createAsyncThunk(
  'paymentMethods/deletePaymentMethod',
  async (methodId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const businessId = state.business?.currentBusiness?.id;
      
      if (!businessId) {
        throw new Error('Business ID no disponible');
      }
      
      const response = await paymentMethodsApi.deletePaymentMethod(businessId, methodId);
      return { methodId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ================================
// INITIAL STATE
// ================================

const initialState = {
  // Data
  methods: [],
  
  // Loading states
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  
  // Error states
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  
  // Metadata
  lastFetched: null
};

// ================================
// SLICE
// ================================

const paymentMethodsSlice = createSlice({
  name: 'paymentMethods',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    clearPaymentMethods: (state) => {
      state.methods = [];
      state.lastFetched = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch payment methods
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.isLoading = false;
        state.methods = action.payload;
        state.lastFetched = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create payment method
      .addCase(createPaymentMethod.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createPaymentMethod.fulfilled, (state, action) => {
        state.isCreating = false;
        state.methods.push(action.payload);
        state.createError = null;
      })
      .addCase(createPaymentMethod.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload;
      })
      
      // Update payment method
      .addCase(updatePaymentMethod.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updatePaymentMethod.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.methods.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.methods[index] = action.payload;
        }
        state.updateError = null;
      })
      .addCase(updatePaymentMethod.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload;
      })
      
      // Toggle payment method
      .addCase(togglePaymentMethod.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(togglePaymentMethod.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.methods.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.methods[index] = action.payload;
        }
        state.updateError = null;
      })
      .addCase(togglePaymentMethod.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload;
      })
      
      // Delete payment method
      .addCase(deletePaymentMethod.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
      })
      .addCase(deletePaymentMethod.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.methods = state.methods.filter(m => m.id !== action.payload.methodId);
        state.deleteError = null;
      })
      .addCase(deletePaymentMethod.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload;
      });
  }
});

// ================================
// ACTIONS
// ================================

export const { clearErrors, clearPaymentMethods } = paymentMethodsSlice.actions;

// ================================
// SELECTORS
// ================================

export const selectPaymentMethods = (state) => state.paymentMethods.methods;
export const selectActivePaymentMethods = (state) => 
  state.paymentMethods.methods.filter(m => m.isActive);
export const selectPaymentMethodsLoading = (state) => state.paymentMethods.isLoading;
export const selectPaymentMethodsError = (state) => state.paymentMethods.error;
export const selectPaymentMethodsCreating = (state) => state.paymentMethods.isCreating;
export const selectPaymentMethodsUpdating = (state) => state.paymentMethods.isUpdating;
export const selectPaymentMethodsDeleting = (state) => state.paymentMethods.isDeleting;

// ================================
// REDUCER
// ================================

export default paymentMethodsSlice.reducer;
