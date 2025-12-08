import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import whatsappApi from '../../api/whatsappApi.js';

// ================================
// ASYNC THUNKS
// ================================

/**
 * Obtener historial de mensajes
 */
export const fetchMessages = createAsyncThunk(
  'whatsappMessages/fetchMessages',
  async (filters = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const businessId = state.business?.currentBusiness?.id;
      
      if (!businessId) {
        throw new Error('Business ID no disponible');
      }
      
      const response = await whatsappApi.getMessages(businessId, filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Obtener detalle de mensaje por ID
 */
export const fetchMessageById = createAsyncThunk(
  'whatsappMessages/fetchMessageById',
  async (messageId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const businessId = state.business?.currentBusiness?.id;
      
      if (!businessId) {
        throw new Error('Business ID no disponible');
      }
      
      const response = await whatsappApi.getMessageById(businessId, messageId);
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
  // Messages data
  messages: [],
  selectedMessage: null,
  
  // Pagination
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  
  // Filters
  filters: {
    status: null, // QUEUED, SENT, DELIVERED, READ, FAILED
    startDate: null,
    endDate: null,
    clientId: null
  },
  
  // Loading states
  isLoading: false,
  isLoadingDetail: false,
  
  // Error states
  error: null,
  detailError: null,
  
  // Metadata
  lastFetched: null
};

// ================================
// SLICE
// ================================

const whatsappMessagesSlice = createSlice({
  name: 'whatsappMessages',
  initialState,
  reducers: {
    // Set selected message
    setSelectedMessage: (state, action) => {
      state.selectedMessage = action.payload;
    },
    
    // Clear selected message
    clearSelectedMessage: (state) => {
      state.selectedMessage = null;
    },
    
    // Set filters
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // Set pagination
    setPagination: (state, action) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload
      };
    },
    
    // Clear errors
    clearErrors: (state) => {
      state.error = null;
      state.detailError = null;
    },
    
    // Reset state
    resetState: () => initialState
  },
  extraReducers: (builder) => {
    // ==================== FETCH MESSAGES ====================
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.messages;
        state.pagination = action.payload.pagination;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    
    // ==================== FETCH MESSAGE BY ID ====================
    builder
      .addCase(fetchMessageById.pending, (state) => {
        state.isLoadingDetail = true;
        state.detailError = null;
      })
      .addCase(fetchMessageById.fulfilled, (state, action) => {
        state.isLoadingDetail = false;
        state.selectedMessage = action.payload;
      })
      .addCase(fetchMessageById.rejected, (state, action) => {
        state.isLoadingDetail = false;
        state.detailError = action.payload;
      });
  }
});

// ================================
// ACTIONS
// ================================

export const {
  setSelectedMessage,
  clearSelectedMessage,
  setFilters,
  clearFilters,
  setPagination,
  clearErrors,
  resetState
} = whatsappMessagesSlice.actions;

// ================================
// SELECTORS
// ================================

export const selectMessages = (state) => state.whatsappMessages.messages;
export const selectSelectedMessage = (state) => state.whatsappMessages.selectedMessage;
export const selectPagination = (state) => state.whatsappMessages.pagination;
export const selectFilters = (state) => state.whatsappMessages.filters;
export const selectIsLoading = (state) => state.whatsappMessages.isLoading;
export const selectIsLoadingDetail = (state) => state.whatsappMessages.isLoadingDetail;
export const selectError = (state) => state.whatsappMessages.error;
export const selectDetailError = (state) => state.whatsappMessages.detailError;
export const selectLastFetched = (state) => state.whatsappMessages.lastFetched;

// Computed selectors
export const selectMessagesByStatus = (status) => (state) => 
  state.whatsappMessages.messages.filter(m => m.status === status);

export const selectSentMessages = (state) => 
  state.whatsappMessages.messages.filter(m => m.status === 'SENT');

export const selectDeliveredMessages = (state) => 
  state.whatsappMessages.messages.filter(m => m.status === 'DELIVERED');

export const selectReadMessages = (state) => 
  state.whatsappMessages.messages.filter(m => m.status === 'READ');

export const selectFailedMessages = (state) => 
  state.whatsappMessages.messages.filter(m => m.status === 'FAILED');

// ================================
// EXPORT REDUCER
// ================================

export default whatsappMessagesSlice.reducer;
