import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { ruleTemplateApi } from '../../api/ruleTemplateApi';

// ================================
// ASYNC THUNKS - Rule Template Management
// ================================

// ================================
// ASYNC THUNKS - Rule Template Management
// ================================

/**
 * Crear nueva plantilla de regla
 */
export const createRuleTemplate = createAsyncThunk(
  'ruleTemplate/createRuleTemplate',
  async (templateData, { rejectWithValue }) => {
    try {
      const response = await ruleTemplateApi.createRuleTemplate(templateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al crear plantilla de regla'
      );
    }
  }
);

/**
 * Obtener plantillas del Owner
 */
export const getOwnerRuleTemplates = createAsyncThunk(
  'ruleTemplate/getOwnerRuleTemplates',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await ruleTemplateApi.getOwnerRuleTemplates(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al obtener plantillas'
      );
    }
  }
);

/**
 * Actualizar plantilla existente
 */
export const updateRuleTemplate = createAsyncThunk(
  'ruleTemplate/updateRuleTemplate',
  async ({ templateId, updateData }, { rejectWithValue }) => {
    try {
      const response = await ruleTemplateApi.updateRuleTemplate(templateId, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al actualizar plantilla'
      );
    }
  }
);

/**
 * Eliminar plantilla
 */
export const deleteRuleTemplate = createAsyncThunk(
  'ruleTemplate/deleteRuleTemplate',
  async (templateId, { rejectWithValue }) => {
    try {
      await ruleTemplateApi.deleteRuleTemplate(templateId);
      return templateId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al eliminar plantilla'
      );
    }
  }
);

/**
 * Obtener estadísticas de plantillas - NO IMPLEMENTADO EN BACKEND
 */
// export const getRuleTemplateStats = createAsyncThunk(
//   'ruleTemplate/getRuleTemplateStats',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await ruleTemplateApi.getRuleTemplateStats();
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || 'Error al obtener estadísticas'
//       );
//     }
//   }
// );

/**
 * Sincronizar reglas con plantillas - NO IMPLEMENTADO EN BACKEND
 */
// export const syncRulesWithTemplates = createAsyncThunk(
//   'ruleTemplate/syncRulesWithTemplates',
//   async (businessId = null, { rejectWithValue }) => {
//     try {
//       const response = await ruleTemplateApi.syncRulesWithTemplates(businessId);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || 'Error al sincronizar reglas'
//       );
//     }
//   }
// );

// ================================
// INITIAL STATE
// ================================

const initialState = {
  // Templates data
  templates: [],
  currentTemplate: null,
  
  // Filters and pagination
  filters: {
    category: '',
    isActive: null,
    businessType: '',
    search: ''
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },
  
  // Statistics
  stats: {
    totalTemplates: 0,
    activeTemplates: 0,
    totalUsage: 0,
    categoriesStats: [],
    businessTypesStats: []
  },
  
  // UI State
  loading: {
    templates: false,
    create: false,
    update: false,
    delete: false,
    stats: false,
    sync: false
  },
  
  // Errors
  errors: {
    templates: null,
    create: null,
    update: null,
    delete: null,
    stats: null,
    sync: null
  },
  
  // Success messages
  success: {
    create: null,
    update: null,
    delete: null,
    sync: null
  },
  
  // Modal states
  modals: {
    createTemplate: false,
    editTemplate: false,
    deleteTemplate: false,
    viewStats: false
  }
};

// ================================
// SLICE
// ================================

const ruleTemplateSlice = createSlice({
  name: 'ruleTemplate',
  initialState,
  reducers: {
    // UI Actions
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    setCurrentTemplate: (state, action) => {
      state.currentTemplate = action.payload;
    },
    
    clearCurrentTemplate: (state) => {
      state.currentTemplate = null;
    },
    
    // Modal actions
    openModal: (state, action) => {
      const { modal, data } = action.payload;
      state.modals[modal] = true;
      if (data) {
        state.currentTemplate = data;
      }
    },
    
    closeModal: (state, action) => {
      const modal = action.payload;
      state.modals[modal] = false;
      if (modal === 'editTemplate' || modal === 'deleteTemplate') {
        state.currentTemplate = null;
      }
    },
    
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modal => {
        state.modals[modal] = false;
      });
      state.currentTemplate = null;
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
    },
    
    // Template actions
    updateTemplateInList: (state, action) => {
      const updatedTemplate = action.payload;
      const index = state.templates.findIndex(t => t.id === updatedTemplate.id);
      if (index !== -1) {
        state.templates[index] = updatedTemplate;
      }
    },
    
    removeTemplateFromList: (state, action) => {
      const templateId = action.payload;
      state.templates = state.templates.filter(t => t.id !== templateId);
    }
  },
  
  extraReducers: (builder) => {
    // Create Rule Template
    builder
      .addCase(createRuleTemplate.pending, (state) => {
        state.loading.create = true;
        state.errors.create = null;
        state.success.create = null;
      })
      .addCase(createRuleTemplate.fulfilled, (state, action) => {
        state.loading.create = false;
        // Handle response structure: { success: true, data: {...}, message: "..." }
        const newTemplate = action.payload?.data || action.payload;
        if (newTemplate) {
          state.templates.unshift(newTemplate);
        }
        state.success.create = action.payload?.message || 'Plantilla creada exitosamente';
        state.modals.createTemplate = false;
      })
      .addCase(createRuleTemplate.rejected, (state, action) => {
        state.loading.create = false;
        state.errors.create = action.payload;
      });
    
    // Get Owner Rule Templates
    builder
      .addCase(getOwnerRuleTemplates.pending, (state) => {
        state.loading.templates = true;
        state.errors.templates = null;
      })
      .addCase(getOwnerRuleTemplates.fulfilled, (state, action) => {
        state.loading.templates = false;
        // Ensure we handle the response structure correctly
        // Backend might return { success: true, data: [...] } or just [...]
        const templates = action.payload?.data || action.payload;
        state.templates = Array.isArray(templates) ? templates : [];
      })
      .addCase(getOwnerRuleTemplates.rejected, (state, action) => {
        state.loading.templates = false;
        state.errors.templates = action.payload;
      });
    
    // Update Rule Template
    builder
      .addCase(updateRuleTemplate.pending, (state) => {
        state.loading.update = true;
        state.errors.update = null;
        state.success.update = null;
      })
      .addCase(updateRuleTemplate.fulfilled, (state, action) => {
        state.loading.update = false;
        // Handle response structure: { success: true, data: {...}, message: "..." }
        const updatedTemplate = action.payload?.data || action.payload;
        if (updatedTemplate && updatedTemplate.id) {
          const index = state.templates.findIndex(t => t.id === updatedTemplate.id);
          if (index !== -1) {
            state.templates[index] = updatedTemplate;
          }
          state.currentTemplate = updatedTemplate;
        }
        state.success.update = action.payload?.message || 'Plantilla actualizada exitosamente';
        state.modals.editTemplate = false;
      })
      .addCase(updateRuleTemplate.rejected, (state, action) => {
        state.loading.update = false;
        state.errors.update = action.payload;
      });
    
    // Delete Rule Template
    builder
      .addCase(deleteRuleTemplate.pending, (state) => {
        state.loading.delete = true;
        state.errors.delete = null;
        state.success.delete = null;
      })
      .addCase(deleteRuleTemplate.fulfilled, (state, action) => {
        state.loading.delete = false;
        const templateId = action.payload;
        state.templates = state.templates.filter(t => t.id !== templateId);
        state.success.delete = 'Plantilla eliminada exitosamente';
        state.modals.deleteTemplate = false;
        state.currentTemplate = null;
      })
      .addCase(deleteRuleTemplate.rejected, (state, action) => {
        state.loading.delete = false;
        state.errors.delete = action.payload;
      });
    
    // Get Rule Template Stats - NO IMPLEMENTADO EN BACKEND
    // builder
    //   .addCase(getRuleTemplateStats.pending, (state) => {
    //     state.loading.stats = true;
    //     state.errors.stats = null;
    //   })
    //   .addCase(getRuleTemplateStats.fulfilled, (state, action) => {
    //     state.loading.stats = false;
    //     state.stats = action.payload;
    //   })
    //   .addCase(getRuleTemplateStats.rejected, (state, action) => {
    //     state.loading.stats = false;
    //     state.errors.stats = action.payload;
    //   });
    
    // Sync Rules with Templates - NO IMPLEMENTADO EN BACKEND
    // builder
    //   .addCase(syncRulesWithTemplates.pending, (state) => {
    //     state.loading.sync = true;
    //     state.errors.sync = null;
    //     state.success.sync = null;
    //   })
    //   .addCase(syncRulesWithTemplates.fulfilled, (state, action) => {
    //     state.loading.sync = false;
    //     state.success.sync = action.payload.message;
    //   })
    //   .addCase(syncRulesWithTemplates.rejected, (state, action) => {
    //     state.loading.sync = false;
    //     state.errors.sync = action.payload;
    //   });
  }
});

// ================================
// ACTIONS
// ================================

export const {
  setFilters,
  clearFilters,
  setPagination,
  setCurrentTemplate,
  clearCurrentTemplate,
  openModal,
  closeModal,
  closeAllModals,
  clearErrors,
  clearSuccess,
  clearMessages,
  updateTemplateInList,
  removeTemplateFromList
} = ruleTemplateSlice.actions;

// ================================
// SELECTORS
// ================================

// Basic selectors
export const selectRuleTemplates = (state) => state.ruleTemplate.templates;
export const selectCurrentTemplate = (state) => state.ruleTemplate.currentTemplate;
// export const selectRuleTemplateStats = (state) => state.ruleTemplate.stats; // NO IMPLEMENTADO
export const selectFilters = (state) => state.ruleTemplate.filters;
export const selectPagination = (state) => state.ruleTemplate.pagination;

// Loading selectors
export const selectTemplatesLoading = (state) => state.ruleTemplate.loading.templates;
export const selectCreateLoading = (state) => state.ruleTemplate.loading.create;
export const selectUpdateLoading = (state) => state.ruleTemplate.loading.update;
export const selectDeleteLoading = (state) => state.ruleTemplate.loading.delete;
// export const selectStatsLoading = (state) => state.ruleTemplate.loading.stats; // NO IMPLEMENTADO
// export const selectSyncLoading = (state) => state.ruleTemplate.loading.sync; // NO IMPLEMENTADO

// Error selectors
export const selectTemplatesError = (state) => state.ruleTemplate.errors.templates;
export const selectCreateError = (state) => state.ruleTemplate.errors.create;
export const selectUpdateError = (state) => state.ruleTemplate.errors.update;
export const selectDeleteError = (state) => state.ruleTemplate.errors.delete;
// export const selectStatsError = (state) => state.ruleTemplate.errors.stats; // NO IMPLEMENTADO
// export const selectSyncError = (state) => state.ruleTemplate.errors.sync; // NO IMPLEMENTADO

// Success selectors
export const selectCreateSuccess = (state) => state.ruleTemplate.success.create;
export const selectUpdateSuccess = (state) => state.ruleTemplate.success.update;
export const selectDeleteSuccess = (state) => state.ruleTemplate.success.delete;
// export const selectSyncSuccess = (state) => state.ruleTemplate.success.sync; // NO IMPLEMENTADO

// Modal selectors
export const selectModals = (state) => state.ruleTemplate.modals;
export const selectCreateModalOpen = (state) => state.ruleTemplate.modals.createTemplate;
export const selectEditModalOpen = (state) => state.ruleTemplate.modals.editTemplate;
export const selectDeleteModalOpen = (state) => state.ruleTemplate.modals.deleteTemplate;
export const selectStatsModalOpen = (state) => state.ruleTemplate.modals.viewStats;

// Computed selectors with memoization
export const selectFilteredTemplates = createSelector(
  [selectRuleTemplates, selectFilters],
  (templates, filters) => {
    // Ensure templates is an array
    if (!Array.isArray(templates)) {
      return [];
    }
    
    return templates.filter(template => {
      // Category filter
      if (filters.category && template.category !== filters.category) {
        return false;
      }
      
      // Active filter
      if (filters.isActive !== null && template.isActive !== filters.isActive) {
        return false;
      }
      
      // Business type filter
      if (filters.businessType && !template.businessTypes?.includes(filters.businessType)) {
        return false;
      }
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          template.name?.toLowerCase().includes(searchLower) ||
          template.description?.toLowerCase().includes(searchLower) ||
          template.ruleKey?.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  }
);

export const selectTemplatesByCategory = createSelector(
  [selectRuleTemplates],
  (templates) => {
    // Ensure templates is an array
    if (!Array.isArray(templates)) {
      return {};
    }
    
    return templates.reduce((acc, template) => {
      const category = template.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(template);
      return acc;
    }, {});
  }
);

export const selectActiveTemplatesCount = createSelector(
  [selectRuleTemplates],
  (templates) => {
    // Ensure templates is an array
    if (!Array.isArray(templates)) {
      return 0;
    }
    return templates.filter(t => t.isActive).length;
  }
);

export const selectTotalUsageCount = createSelector(
  [selectRuleTemplates],
  (templates) => {
    // Ensure templates is an array
    if (!Array.isArray(templates)) {
      return 0;
    }
    return templates.reduce((total, template) => total + (template.usageCount || 0), 0);
  }
);

export default ruleTemplateSlice.reducer;