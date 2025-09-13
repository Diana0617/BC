import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import businessRuleApi from '../../api/businessRuleApi';

// ================================
// ASYNC THUNKS - Business Rule Management
// ================================

/**
 * Obtener plantillas disponibles para el negocio
 */
export const getAvailableTemplates = createAsyncThunk(
  'businessRule/getAvailableTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await businessRuleApi.getAvailableTemplates();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al obtener plantillas disponibles'
      );
    }
  }
);

/**
 * Asignar plantilla de regla al negocio
 */
export const assignRuleTemplate = createAsyncThunk(
  'businessRule/assignRuleTemplate',
  async ({ templateId, options = {} }, { rejectWithValue }) => {
    try {
      const response = await businessRuleApi.assignRuleTemplate(templateId, options);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al asignar regla'
      );
    }
  }
);

/**
 * Obtener reglas asignadas al negocio
 */
export const getBusinessAssignedRules = createAsyncThunk(
  'businessRule/getBusinessAssignedRules',
  async (includeInactive = false, { rejectWithValue }) => {
    try {
      const response = await businessRuleApi.getBusinessAssignedRules(includeInactive);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al obtener reglas asignadas'
      );
    }
  }
);

/**
 * Personalizar regla asignada
 */
export const customizeAssignedRule = createAsyncThunk(
  'businessRule/customizeAssignedRule',
  async ({ assignmentId, customValue, notes }, { rejectWithValue }) => {
    try {
      const response = await businessRuleApi.customizeAssignedRule(assignmentId, {
        customValue,
        notes
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al personalizar regla'
      );
    }
  }
);

/**
 * Activar/desactivar regla asignada
 */
export const toggleRuleAssignment = createAsyncThunk(
  'businessRule/toggleRuleAssignment',
  async ({ assignmentId, isActive }, { rejectWithValue }) => {
    try {
      const response = await businessRuleApi.toggleRuleAssignment(assignmentId, { isActive });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al cambiar estado de regla'
      );
    }
  }
);

/**
 * Remover regla asignada
 */
export const removeRuleAssignment = createAsyncThunk(
  'businessRule/removeRuleAssignment',
  async (assignmentId, { rejectWithValue }) => {
    try {
      await businessRuleApi.removeRuleAssignment(assignmentId);
      return assignmentId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al remover regla'
      );
    }
  }
);

// ================================
// INITIAL STATE
// ================================

const initialState = {
  // Available templates
  availableTemplates: [],
  availableTemplatesLoaded: false,
  
  // Assigned rules
  assignedRules: [],
  assignedRulesLoaded: false,
  
  // Current items
  currentRule: null,
  currentTemplate: null,
  
  // Filters and views
  filters: {
    category: '',
    isActive: null,
    isCustomized: null,
    search: ''
  },
  
  groupBy: 'category', // 'category', 'priority', 'none'
  showInactive: false,
  
  // UI State
  loading: {
    availableTemplates: false,
    assignedRules: false,
    assign: false,
    customize: false,
    toggle: false,
    remove: false
  },
  
  // Errors
  errors: {
    availableTemplates: null,
    assignedRules: null,
    assign: null,
    customize: null,
    toggle: null,
    remove: null
  },
  
  // Success messages
  success: {
    assign: null,
    customize: null,
    toggle: null,
    remove: null
  },
  
  // Modal states
  modals: {
    assignRule: false,
    customizeRule: false,
    removeRule: false,
    viewRuleDetails: false,
    templatePreview: false
  },
  
  // Assignment form data
  assignmentForm: {
    templateId: null,
    priority: 1,
    notes: '',
    effectiveFrom: null,
    effectiveTo: null
  },
  
  // Customization form data
  customizationForm: {
    assignmentId: null,
    customValue: {},
    notes: '',
    originalValue: {}
  }
};

// ================================
// SLICE
// ================================

const businessRuleSlice = createSlice({
  name: 'businessRule',
  initialState,
  reducers: {
    // UI Actions
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    setGroupBy: (state, action) => {
      state.groupBy = action.payload;
    },
    
    setShowInactive: (state, action) => {
      state.showInactive = action.payload;
    },
    
    setCurrentRule: (state, action) => {
      state.currentRule = action.payload;
    },
    
    setCurrentTemplate: (state, action) => {
      state.currentTemplate = action.payload;
    },
    
    clearCurrentItems: (state) => {
      state.currentRule = null;
      state.currentTemplate = null;
    },
    
    // Modal actions
    openModal: (state, action) => {
      const { modal, data } = action.payload;
      state.modals[modal] = true;
      
      if (modal === 'assignRule' && data) {
        state.currentTemplate = data;
        state.assignmentForm.templateId = data.id;
      } else if (modal === 'customizeRule' && data) {
        state.currentRule = data;
        state.customizationForm = {
          assignmentId: data.id,
          customValue: data.customValue || data.BusinessRuleTemplate?.ruleValue || {},
          notes: data.notes || '',
          originalValue: data.originalValue || data.BusinessRuleTemplate?.ruleValue || {}
        };
      } else if (modal === 'removeRule' && data) {
        state.currentRule = data;
      } else if (modal === 'viewRuleDetails' && data) {
        state.currentRule = data;
      } else if (modal === 'templatePreview' && data) {
        state.currentTemplate = data;
      }
    },
    
    closeModal: (state, action) => {
      const modal = action.payload;
      state.modals[modal] = false;
      
      if (modal === 'assignRule') {
        state.currentTemplate = null;
        state.assignmentForm = initialState.assignmentForm;
      } else if (modal === 'customizeRule') {
        state.currentRule = null;
        state.customizationForm = initialState.customizationForm;
      } else if (modal === 'removeRule' || modal === 'viewRuleDetails') {
        state.currentRule = null;
      } else if (modal === 'templatePreview') {
        state.currentTemplate = null;
      }
    },
    
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modal => {
        state.modals[modal] = false;
      });
      state.currentRule = null;
      state.currentTemplate = null;
      state.assignmentForm = initialState.assignmentForm;
      state.customizationForm = initialState.customizationForm;
    },
    
    // Form actions
    updateAssignmentForm: (state, action) => {
      state.assignmentForm = { ...state.assignmentForm, ...action.payload };
    },
    
    updateCustomizationForm: (state, action) => {
      state.customizationForm = { ...state.customizationForm, ...action.payload };
    },
    
    resetAssignmentForm: (state) => {
      state.assignmentForm = initialState.assignmentForm;
    },
    
    resetCustomizationForm: (state) => {
      state.customizationForm = initialState.customizationForm;
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
    
    // Rule actions
    updateRuleInList: (state, action) => {
      const updatedRule = action.payload;
      const index = state.assignedRules.findIndex(r => r.id === updatedRule.id);
      if (index !== -1) {
        state.assignedRules[index] = updatedRule;
      }
    },
    
    removeRuleFromList: (state, action) => {
      const ruleId = action.payload;
      state.assignedRules = state.assignedRules.filter(r => r.id !== ruleId);
    }
  },
  
  extraReducers: (builder) => {
    // Get Available Templates
    builder
      .addCase(getAvailableTemplates.pending, (state) => {
        state.loading.availableTemplates = true;
        state.errors.availableTemplates = null;
      })
      .addCase(getAvailableTemplates.fulfilled, (state, action) => {
        state.loading.availableTemplates = false;
        state.availableTemplates = action.payload;
        state.availableTemplatesLoaded = true;
      })
      .addCase(getAvailableTemplates.rejected, (state, action) => {
        state.loading.availableTemplates = false;
        state.errors.availableTemplates = action.payload;
      });
    
    // Assign Rule Template
    builder
      .addCase(assignRuleTemplate.pending, (state) => {
        state.loading.assign = true;
        state.errors.assign = null;
        state.success.assign = null;
      })
      .addCase(assignRuleTemplate.fulfilled, (state, action) => {
        state.loading.assign = false;
        state.assignedRules.unshift(action.payload.data);
        state.success.assign = action.payload.message;
        state.modals.assignRule = false;
        state.currentTemplate = null;
        state.assignmentForm = initialState.assignmentForm;
        
        // Remove from available templates if assigned
        const templateId = action.payload.data.ruleTemplateId;
        state.availableTemplates = state.availableTemplates.filter(t => t.id !== templateId);
      })
      .addCase(assignRuleTemplate.rejected, (state, action) => {
        state.loading.assign = false;
        state.errors.assign = action.payload;
      });
    
    // Get Business Assigned Rules
    builder
      .addCase(getBusinessAssignedRules.pending, (state) => {
        state.loading.assignedRules = true;
        state.errors.assignedRules = null;
      })
      .addCase(getBusinessAssignedRules.fulfilled, (state, action) => {
        state.loading.assignedRules = false;
        state.assignedRules = action.payload;
        state.assignedRulesLoaded = true;
      })
      .addCase(getBusinessAssignedRules.rejected, (state, action) => {
        state.loading.assignedRules = false;
        state.errors.assignedRules = action.payload;
      });
    
    // Customize Assigned Rule
    builder
      .addCase(customizeAssignedRule.pending, (state) => {
        state.loading.customize = true;
        state.errors.customize = null;
        state.success.customize = null;
      })
      .addCase(customizeAssignedRule.fulfilled, (state, action) => {
        state.loading.customize = false;
        const updatedRule = action.payload.data;
        const index = state.assignedRules.findIndex(r => r.id === updatedRule.id);
        if (index !== -1) {
          state.assignedRules[index] = updatedRule;
        }
        state.success.customize = action.payload.message;
        state.modals.customizeRule = false;
        state.currentRule = null;
        state.customizationForm = initialState.customizationForm;
      })
      .addCase(customizeAssignedRule.rejected, (state, action) => {
        state.loading.customize = false;
        state.errors.customize = action.payload;
      });
    
    // Toggle Rule Assignment
    builder
      .addCase(toggleRuleAssignment.pending, (state) => {
        state.loading.toggle = true;
        state.errors.toggle = null;
        state.success.toggle = null;
      })
      .addCase(toggleRuleAssignment.fulfilled, (state, action) => {
        state.loading.toggle = false;
        const updatedRule = action.payload.data;
        const index = state.assignedRules.findIndex(r => r.id === updatedRule.id);
        if (index !== -1) {
          state.assignedRules[index] = updatedRule;
        }
        state.success.toggle = action.payload.message;
      })
      .addCase(toggleRuleAssignment.rejected, (state, action) => {
        state.loading.toggle = false;
        state.errors.toggle = action.payload;
      });
    
    // Remove Rule Assignment
    builder
      .addCase(removeRuleAssignment.pending, (state) => {
        state.loading.remove = true;
        state.errors.remove = null;
        state.success.remove = null;
      })
      .addCase(removeRuleAssignment.fulfilled, (state, action) => {
        state.loading.remove = false;
        const ruleId = action.payload;
        state.assignedRules = state.assignedRules.filter(r => r.id !== ruleId);
        state.success.remove = 'Regla removida exitosamente';
        state.modals.removeRule = false;
        state.currentRule = null;
      })
      .addCase(removeRuleAssignment.rejected, (state, action) => {
        state.loading.remove = false;
        state.errors.remove = action.payload;
      });
  }
});

// ================================
// ACTIONS
// ================================

export const {
  setFilters,
  clearFilters,
  setGroupBy,
  setShowInactive,
  setCurrentRule,
  setCurrentTemplate,
  clearCurrentItems,
  openModal,
  closeModal,
  closeAllModals,
  updateAssignmentForm,
  updateCustomizationForm,
  resetAssignmentForm,
  resetCustomizationForm,
  clearErrors,
  clearSuccess,
  clearMessages,
  updateRuleInList,
  removeRuleFromList
} = businessRuleSlice.actions;

// ================================
// SELECTORS
// ================================

// Basic selectors
export const selectAvailableTemplates = (state) => state.businessRule.availableTemplates;
export const selectAssignedRules = (state) => state.businessRule.assignedRules;
export const selectCurrentRule = (state) => state.businessRule.currentRule;
export const selectCurrentTemplate = (state) => state.businessRule.currentTemplate;
export const selectFilters = (state) => state.businessRule.filters;
export const selectGroupBy = (state) => state.businessRule.groupBy;
export const selectShowInactive = (state) => state.businessRule.showInactive;

// Loading selectors
export const selectAvailableTemplatesLoading = (state) => state.businessRule.loading.availableTemplates;
export const selectAssignedRulesLoading = (state) => state.businessRule.loading.assignedRules;
export const selectAssignLoading = (state) => state.businessRule.loading.assign;
export const selectCustomizeLoading = (state) => state.businessRule.loading.customize;
export const selectToggleLoading = (state) => state.businessRule.loading.toggle;
export const selectRemoveLoading = (state) => state.businessRule.loading.remove;

// Error selectors
export const selectAvailableTemplatesError = (state) => state.businessRule.errors.availableTemplates;
export const selectAssignedRulesError = (state) => state.businessRule.errors.assignedRules;
export const selectAssignError = (state) => state.businessRule.errors.assign;
export const selectCustomizeError = (state) => state.businessRule.errors.customize;
export const selectToggleError = (state) => state.businessRule.errors.toggle;
export const selectRemoveError = (state) => state.businessRule.errors.remove;

// Success selectors
export const selectAssignSuccess = (state) => state.businessRule.success.assign;
export const selectCustomizeSuccess = (state) => state.businessRule.success.customize;
export const selectToggleSuccess = (state) => state.businessRule.success.toggle;
export const selectRemoveSuccess = (state) => state.businessRule.success.remove;

// Modal selectors
export const selectModals = (state) => state.businessRule.modals;
export const selectAssignModalOpen = (state) => state.businessRule.modals.assignRule;
export const selectCustomizeModalOpen = (state) => state.businessRule.modals.customizeRule;
export const selectRemoveModalOpen = (state) => state.businessRule.modals.removeRule;
export const selectRuleDetailsModalOpen = (state) => state.businessRule.modals.viewRuleDetails;
export const selectTemplatePreviewModalOpen = (state) => state.businessRule.modals.templatePreview;

// Form selectors
export const selectAssignmentForm = (state) => state.businessRule.assignmentForm;
export const selectCustomizationForm = (state) => state.businessRule.customizationForm;

// Data status selectors
export const selectAvailableTemplatesLoaded = (state) => state.businessRule.availableTemplatesLoaded;
export const selectAssignedRulesLoaded = (state) => state.businessRule.assignedRulesLoaded;

// Computed selectors
export const selectFilteredAssignedRules = (state) => {
  const rules = selectAssignedRules(state);
  const filters = selectFilters(state);
  const showInactive = selectShowInactive(state);
  
  return rules.filter(rule => {
    // Active filter
    if (!showInactive && !rule.isActive) {
      return false;
    }
    
    // Category filter
    if (filters.category && rule.BusinessRuleTemplate?.category !== filters.category) {
      return false;
    }
    
    // Active filter
    if (filters.isActive !== null && rule.isActive !== filters.isActive) {
      return false;
    }
    
    // Customized filter
    if (filters.isCustomized !== null && rule.isCustomized !== filters.isCustomized) {
      return false;
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        rule.BusinessRuleTemplate?.name.toLowerCase().includes(searchLower) ||
        rule.BusinessRuleTemplate?.description.toLowerCase().includes(searchLower) ||
        rule.BusinessRuleTemplate?.ruleKey.toLowerCase().includes(searchLower) ||
        rule.notes?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
};

export const selectGroupedAssignedRules = (state) => {
  const rules = selectFilteredAssignedRules(state);
  const groupBy = selectGroupBy(state);
  
  if (groupBy === 'none') {
    return { 'Todas las reglas': rules };
  }
  
  return rules.reduce((acc, rule) => {
    let groupKey;
    
    switch (groupBy) {
      case 'category':
        groupKey = rule.BusinessRuleTemplate?.category || 'Sin categoría';
        break;
      case 'priority':
        groupKey = `Prioridad ${rule.priority}`;
        break;
      default:
        groupKey = 'Todas las reglas';
    }
    
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(rule);
    return acc;
  }, {});
};

export const selectAvailableTemplatesByCategory = (state) => {
  const templates = selectAvailableTemplates(state);
  
  return templates.reduce((acc, template) => {
    const category = template.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {});
};

export const selectActiveRulesCount = (state) => {
  const rules = selectAssignedRules(state);
  return rules.filter(r => r.isActive).length;
};

export const selectCustomizedRulesCount = (state) => {
  const rules = selectAssignedRules(state);
  return rules.filter(r => r.isCustomized).length;
};

export const selectRulesByCategory = (state) => {
  const rules = selectAssignedRules(state);
  
  return rules.reduce((acc, rule) => {
    const category = rule.BusinessRuleTemplate?.category || 'Sin categoría';
    if (!acc[category]) {
      acc[category] = { total: 0, active: 0 };
    }
    acc[category].total += 1;
    if (rule.isActive) {
      acc[category].active += 1;
    }
    return acc;
  }, {});
};

export default businessRuleSlice.reducer;