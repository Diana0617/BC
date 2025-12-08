import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import whatsappApi from '../../api/whatsappApi.js';

// ================================
// ASYNC THUNKS
// ================================

/**
 * Obtener lista de plantillas de mensajes
 */
export const fetchTemplates = createAsyncThunk(
  'whatsappTemplates/fetchTemplates',
  async (filters = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const businessId = state.business?.currentBusiness?.id;
      
      if (!businessId) {
        throw new Error('Business ID no disponible');
      }
      
      const response = await whatsappApi.getTemplates(businessId, filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Crear nueva plantilla de mensaje
 */
export const createTemplate = createAsyncThunk(
  'whatsappTemplates/createTemplate',
  async (templateData, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const businessId = state.business?.currentBusiness?.id;
      
      if (!businessId) {
        throw new Error('Business ID no disponible');
      }
      
      const response = await whatsappApi.createTemplate(businessId, templateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Actualizar plantilla de mensaje (solo DRAFT)
 */
export const updateTemplate = createAsyncThunk(
  'whatsappTemplates/updateTemplate',
  async ({ templateId, updateData }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const businessId = state.business?.currentBusiness?.id;
      
      if (!businessId) {
        throw new Error('Business ID no disponible');
      }
      
      const response = await whatsappApi.updateTemplate(businessId, templateId, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Eliminar plantilla de mensaje
 */
export const deleteTemplate = createAsyncThunk(
  'whatsappTemplates/deleteTemplate',
  async (templateId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const businessId = state.business?.currentBusiness?.id;
      
      if (!businessId) {
        throw new Error('Business ID no disponible');
      }
      
      const response = await whatsappApi.deleteTemplate(businessId, templateId);
      return { templateId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Enviar plantilla a Meta para aprobación
 */
export const submitTemplate = createAsyncThunk(
  'whatsappTemplates/submitTemplate',
  async (templateId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const businessId = state.business?.currentBusiness?.id;
      
      if (!businessId) {
        throw new Error('Business ID no disponible');
      }
      
      const response = await whatsappApi.submitTemplate(businessId, templateId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Sincronizar plantillas desde Meta
 */
export const syncTemplates = createAsyncThunk(
  'whatsappTemplates/syncTemplates',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const businessId = state.business?.currentBusiness?.id;
      
      if (!businessId) {
        throw new Error('Business ID no disponible');
      }
      
      const response = await whatsappApi.syncTemplates(businessId);
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
  // Templates data
  templates: [],
  selectedTemplate: null,
  
  // Pagination
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  
  // Filters
  filters: {
    status: null, // DRAFT, PENDING, APPROVED, REJECTED
    category: null // UTILITY, MARKETING, AUTHENTICATION
  },
  
  // Loading states
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isSubmitting: false,
  isSyncing: false,
  
  // Error states
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  submitError: null,
  syncError: null,
  
  // Success messages
  successMessage: null,
  
  // Metadata
  lastFetched: null,
  lastSynced: null
};

// ================================
// SLICE
// ================================

const whatsappTemplatesSlice = createSlice({
  name: 'whatsappTemplates',
  initialState,
  reducers: {
    // Set selected template
    setSelectedTemplate: (state, action) => {
      state.selectedTemplate = action.payload;
    },
    
    // Clear selected template
    clearSelectedTemplate: (state) => {
      state.selectedTemplate = null;
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
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.submitError = null;
      state.syncError = null;
    },
    
    // Clear success message
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    
    // Reset state
    resetState: () => initialState
  },
  extraReducers: (builder) => {
    // ==================== FETCH TEMPLATES ====================
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.templates = action.payload.templates;
        state.pagination = action.payload.pagination;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    
    // ==================== CREATE TEMPLATE ====================
    builder
      .addCase(createTemplate.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
        state.successMessage = null;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.isCreating = false;
        state.templates = [action.payload, ...state.templates];
        state.pagination.total += 1;
        state.successMessage = action.payload.message || 'Plantilla creada correctamente';
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload;
      });
    
    // ==================== UPDATE TEMPLATE ====================
    builder
      .addCase(updateTemplate.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
        state.successMessage = null;
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.templates.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.templates[index] = action.payload;
        }
        if (state.selectedTemplate?.id === action.payload.id) {
          state.selectedTemplate = action.payload;
        }
        state.successMessage = action.payload.message || 'Plantilla actualizada correctamente';
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload;
      });
    
    // ==================== DELETE TEMPLATE ====================
    builder
      .addCase(deleteTemplate.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
        state.successMessage = null;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.templates = state.templates.filter(t => t.id !== action.payload.templateId);
        state.pagination.total -= 1;
        if (state.selectedTemplate?.id === action.payload.templateId) {
          state.selectedTemplate = null;
        }
        state.successMessage = action.payload.message || 'Plantilla eliminada correctamente';
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload;
      });
    
    // ==================== SUBMIT TEMPLATE ====================
    builder
      .addCase(submitTemplate.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
        state.successMessage = null;
      })
      .addCase(submitTemplate.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.templates.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.templates[index] = action.payload;
        }
        if (state.selectedTemplate?.id === action.payload.id) {
          state.selectedTemplate = action.payload;
        }
        state.successMessage = action.payload.message || 'Plantilla enviada para aprobación';
      })
      .addCase(submitTemplate.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError = action.payload;
      });
    
    // ==================== SYNC TEMPLATES ====================
    builder
      .addCase(syncTemplates.pending, (state) => {
        state.isSyncing = true;
        state.syncError = null;
        state.successMessage = null;
      })
      .addCase(syncTemplates.fulfilled, (state, action) => {
        state.isSyncing = false;
        state.lastSynced = new Date().toISOString();
        state.successMessage = action.payload.message || `${action.payload.synced} plantillas sincronizadas`;
      })
      .addCase(syncTemplates.rejected, (state, action) => {
        state.isSyncing = false;
        state.syncError = action.payload;
      });
  }
});

// ================================
// ACTIONS
// ================================

export const {
  setSelectedTemplate,
  clearSelectedTemplate,
  setFilters,
  clearFilters,
  setPagination,
  clearErrors,
  clearSuccessMessage,
  resetState
} = whatsappTemplatesSlice.actions;

// ================================
// SELECTORS
// ================================

export const selectTemplates = (state) => state.whatsappTemplates.templates;
export const selectSelectedTemplate = (state) => state.whatsappTemplates.selectedTemplate;
export const selectPagination = (state) => state.whatsappTemplates.pagination;
export const selectFilters = (state) => state.whatsappTemplates.filters;
export const selectIsLoading = (state) => state.whatsappTemplates.isLoading;
export const selectIsCreating = (state) => state.whatsappTemplates.isCreating;
export const selectIsUpdating = (state) => state.whatsappTemplates.isUpdating;
export const selectIsDeleting = (state) => state.whatsappTemplates.isDeleting;
export const selectIsSubmitting = (state) => state.whatsappTemplates.isSubmitting;
export const selectIsSyncing = (state) => state.whatsappTemplates.isSyncing;
export const selectError = (state) => state.whatsappTemplates.error;
export const selectCreateError = (state) => state.whatsappTemplates.createError;
export const selectUpdateError = (state) => state.whatsappTemplates.updateError;
export const selectDeleteError = (state) => state.whatsappTemplates.deleteError;
export const selectSubmitError = (state) => state.whatsappTemplates.submitError;
export const selectSyncError = (state) => state.whatsappTemplates.syncError;
export const selectSuccessMessage = (state) => state.whatsappTemplates.successMessage;
export const selectLastSynced = (state) => state.whatsappTemplates.lastSynced;

// Computed selectors
export const selectTemplatesByStatus = (status) => (state) => 
  state.whatsappTemplates.templates.filter(t => t.status === status);

export const selectDraftTemplates = (state) => 
  state.whatsappTemplates.templates.filter(t => t.status === 'DRAFT');

export const selectApprovedTemplates = (state) => 
  state.whatsappTemplates.templates.filter(t => t.status === 'APPROVED');

export const selectPendingTemplates = (state) => 
  state.whatsappTemplates.templates.filter(t => t.status === 'PENDING');

// ================================
// EXPORT REDUCER
// ================================

export default whatsappTemplatesSlice.reducer;
