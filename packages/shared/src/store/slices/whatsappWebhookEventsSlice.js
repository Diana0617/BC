import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import whatsappApi from '../../api/whatsappApi.js';

// ================================
// ASYNC THUNKS
// ================================

/**
 * Obtener log de eventos de webhook
 */
export const fetchWebhookEvents = createAsyncThunk(
  'whatsappWebhookEvents/fetchWebhookEvents',
  async (filters = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const businessId = state.business?.currentBusiness?.id;
      
      if (!businessId) {
        throw new Error('Business ID no disponible');
      }
      
      const response = await whatsappApi.getWebhookEvents(businessId, filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Obtener detalle de evento de webhook por ID
 */
export const fetchWebhookEventById = createAsyncThunk(
  'whatsappWebhookEvents/fetchWebhookEventById',
  async (eventId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const businessId = state.business?.currentBusiness?.id;
      
      if (!businessId) {
        throw new Error('Business ID no disponible');
      }
      
      const response = await whatsappApi.getWebhookEventById(businessId, eventId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Re-procesar evento de webhook
 */
export const replayWebhookEvent = createAsyncThunk(
  'whatsappWebhookEvents/replayWebhookEvent',
  async (eventId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const businessId = state.business?.currentBusiness?.id;
      
      if (!businessId) {
        throw new Error('Business ID no disponible');
      }
      
      const response = await whatsappApi.replayWebhookEvent(businessId, eventId);
      return { eventId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// ================================
// INITIAL STATE
// ================================

const initialState = {
  // Events data
  events: [],
  selectedEvent: null,
  
  // Pagination
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  
  // Filters
  filters: {
    eventType: null, // message_status, message_received, template_status, etc.
    startDate: null,
    endDate: null
  },
  
  // Loading states
  isLoading: false,
  isLoadingDetail: false,
  isReplaying: false,
  
  // Error states
  error: null,
  detailError: null,
  replayError: null,
  
  // Success messages
  successMessage: null,
  
  // Metadata
  lastFetched: null
};

// ================================
// SLICE
// ================================

const whatsappWebhookEventsSlice = createSlice({
  name: 'whatsappWebhookEvents',
  initialState,
  reducers: {
    // Set selected event
    setSelectedEvent: (state, action) => {
      state.selectedEvent = action.payload;
    },
    
    // Clear selected event
    clearSelectedEvent: (state) => {
      state.selectedEvent = null;
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
      state.replayError = null;
    },
    
    // Clear success message
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    
    // Reset state
    resetState: () => initialState
  },
  extraReducers: (builder) => {
    // ==================== FETCH WEBHOOK EVENTS ====================
    builder
      .addCase(fetchWebhookEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWebhookEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload.events;
        state.pagination = action.payload.pagination;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchWebhookEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    
    // ==================== FETCH WEBHOOK EVENT BY ID ====================
    builder
      .addCase(fetchWebhookEventById.pending, (state) => {
        state.isLoadingDetail = true;
        state.detailError = null;
      })
      .addCase(fetchWebhookEventById.fulfilled, (state, action) => {
        state.isLoadingDetail = false;
        state.selectedEvent = action.payload;
      })
      .addCase(fetchWebhookEventById.rejected, (state, action) => {
        state.isLoadingDetail = false;
        state.detailError = action.payload;
      });
    
    // ==================== REPLAY WEBHOOK EVENT ====================
    builder
      .addCase(replayWebhookEvent.pending, (state) => {
        state.isReplaying = true;
        state.replayError = null;
        state.successMessage = null;
      })
      .addCase(replayWebhookEvent.fulfilled, (state, action) => {
        state.isReplaying = false;
        state.successMessage = action.payload.message || 'Evento re-procesado correctamente';
      })
      .addCase(replayWebhookEvent.rejected, (state, action) => {
        state.isReplaying = false;
        state.replayError = action.payload;
      });
  }
});

// ================================
// ACTIONS
// ================================

export const {
  setSelectedEvent,
  clearSelectedEvent,
  setFilters,
  clearFilters,
  setPagination,
  clearErrors,
  clearSuccessMessage,
  resetState
} = whatsappWebhookEventsSlice.actions;

// ================================
// SELECTORS
// ================================

export const selectEvents = (state) => state.whatsappWebhookEvents.events;
export const selectSelectedEvent = (state) => state.whatsappWebhookEvents.selectedEvent;
export const selectPagination = (state) => state.whatsappWebhookEvents.pagination;
export const selectFilters = (state) => state.whatsappWebhookEvents.filters;
export const selectIsLoading = (state) => state.whatsappWebhookEvents.isLoading;
export const selectIsLoadingDetail = (state) => state.whatsappWebhookEvents.isLoadingDetail;
export const selectIsReplaying = (state) => state.whatsappWebhookEvents.isReplaying;
export const selectError = (state) => state.whatsappWebhookEvents.error;
export const selectDetailError = (state) => state.whatsappWebhookEvents.detailError;
export const selectReplayError = (state) => state.whatsappWebhookEvents.replayError;
export const selectSuccessMessage = (state) => state.whatsappWebhookEvents.successMessage;
export const selectLastFetched = (state) => state.whatsappWebhookEvents.lastFetched;

// Computed selectors
export const selectEventsByType = (eventType) => (state) => 
  state.whatsappWebhookEvents.events.filter(e => e.event_type === eventType);

export const selectMessageStatusEvents = (state) => 
  state.whatsappWebhookEvents.events.filter(e => e.event_type === 'message_status');

export const selectMessageReceivedEvents = (state) => 
  state.whatsappWebhookEvents.events.filter(e => e.event_type === 'message_received');

export const selectTemplateStatusEvents = (state) => 
  state.whatsappWebhookEvents.events.filter(e => e.event_type === 'template_status');

// ================================
// EXPORT REDUCER
// ================================

export default whatsappWebhookEventsSlice.reducer;
