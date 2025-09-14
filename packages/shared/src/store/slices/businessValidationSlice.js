import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import businessValidationApi from '../../api/businessValidationApi';

// ================================
// ASYNC THUNKS - Business Validation Management
// ================================

/**
 * Validar acceso a un negocio específico
 */
export const validateBusinessAccess = createAsyncThunk(
  'businessValidation/validateBusinessAccess',
  async ({ businessId, userId, moduleId }, { rejectWithValue }) => {
    try {
      const response = await businessValidationApi.validateBusinessAccess({
        businessId,
        userId,
        moduleId
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error validando acceso al negocio'
      );
    }
  }
);

/**
 * Obtener negocios disponibles para el usuario
 */
export const getAvailableBusinesses = createAsyncThunk(
  'businessValidation/getAvailableBusinesses',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await businessValidationApi.getAvailableBusinesses(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error obteniendo negocios disponibles'
      );
    }
  }
);

/**
 * Cambiar negocio activo
 */
export const switchActiveBusiness = createAsyncThunk(
  'businessValidation/switchActiveBusiness',
  async (businessId, { rejectWithValue }) => {
    try {
      const response = await businessValidationApi.switchActiveBusiness(businessId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error cambiando negocio activo'
      );
    }
  }
);

/**
 * Verificar permisos específicos en un módulo
 */
export const checkModulePermissions = createAsyncThunk(
  'businessValidation/checkModulePermissions',
  async ({ businessId, moduleId, permissions }, { rejectWithValue }) => {
    try {
      const response = await businessValidationApi.checkModulePermissions({
        businessId,
        moduleId,
        permissions
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error verificando permisos del módulo'
      );
    }
  }
);

// ================================
// INITIAL STATE
// ================================

const initialState = {
  // Current business context
  activeBusiness: null,
  activeBusinessId: null,
  
  // Available businesses
  availableBusinesses: [],
  availableBusinessesLoaded: false,
  
  // Access validation
  hasBusinessAccess: false,
  accessValidated: false,
  accessDetails: null,
  
  // Module permissions
  modulePermissions: {},
  permissionsLoaded: {},
  
  // Business switching
  switchingBusiness: false,
  
  // Validation cache
  validationCache: {},
  cacheExpiry: {},
  
  // UI State
  loading: {
    validateAccess: false,
    availableBusinesses: false,
    switchBusiness: false,
    modulePermissions: false
  },
  
  // Errors
  errors: {
    validateAccess: null,
    availableBusinesses: null,
    switchBusiness: null,
    modulePermissions: null
  },
  
  // Success messages
  success: {
    validateAccess: null,
    switchBusiness: null
  },
  
  // Modal states
  modals: {
    businessSelector: false,
    accessDenied: false,
    permissionsRequired: false
  },
  
  // Validation settings
  autoValidate: true,
  cacheTimeout: 300000, // 5 minutes
  
  // User context
  userRole: null,
  userBusinessId: null,
  userPermissions: []
};

// ================================
// SLICE
// ================================

const businessValidationSlice = createSlice({
  name: 'businessValidation',
  initialState,
  reducers: {
    // Business context actions
    setActiveBusiness: (state, action) => {
      state.activeBusiness = action.payload;
      state.activeBusinessId = action.payload?.id || null;
    },
    
    setActiveBusinessId: (state, action) => {
      state.activeBusinessId = action.payload;
    },
    
    clearActiveBusiness: (state) => {
      state.activeBusiness = null;
      state.activeBusinessId = null;
      state.hasBusinessAccess = false;
      state.accessValidated = false;
    },
    
    // User context actions
    setUserContext: (state, action) => {
      const { role, businessId, permissions } = action.payload;
      state.userRole = role;
      state.userBusinessId = businessId;
      state.userPermissions = permissions || [];
    },
    
    clearUserContext: (state) => {
      state.userRole = null;
      state.userBusinessId = null;
      state.userPermissions = [];
    },
    
    // Access validation actions
    setBusinessAccess: (state, action) => {
      state.hasBusinessAccess = action.payload;
      state.accessValidated = true;
    },
    
    clearBusinessAccess: (state) => {
      state.hasBusinessAccess = false;
      state.accessValidated = false;
      state.accessDetails = null;
    },
    
    // Module permissions actions
    setModulePermissions: (state, action) => {
      const { moduleId, permissions } = action.payload;
      state.modulePermissions[moduleId] = permissions;
      state.permissionsLoaded[moduleId] = true;
    },
    
    clearModulePermissions: (state, action) => {
      const moduleId = action.payload;
      delete state.modulePermissions[moduleId];
      delete state.permissionsLoaded[moduleId];
    },
    
    clearAllModulePermissions: (state) => {
      state.modulePermissions = {};
      state.permissionsLoaded = {};
    },
    
    // Cache management
    setCacheData: (state, action) => {
      const { key, data, expiry } = action.payload;
      state.validationCache[key] = data;
      state.cacheExpiry[key] = expiry || Date.now() + state.cacheTimeout;
    },
    
    clearCacheData: (state, action) => {
      const key = action.payload;
      delete state.validationCache[key];
      delete state.cacheExpiry[key];
    },
    
    clearAllCache: (state) => {
      state.validationCache = {};
      state.cacheExpiry = {};
    },
    
    // Settings actions
    setAutoValidate: (state, action) => {
      state.autoValidate = action.payload;
    },
    
    setCacheTimeout: (state, action) => {
      state.cacheTimeout = action.payload;
    },
    
    // Modal actions
    openModal: (state, action) => {
      const { modal, data } = action.payload;
      state.modals[modal] = true;
      
      if (modal === 'accessDenied' && data) {
        state.accessDetails = data;
      }
    },
    
    closeModal: (state, action) => {
      const modal = action.payload;
      state.modals[modal] = false;
      
      if (modal === 'accessDenied') {
        state.accessDetails = null;
      }
    },
    
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modal => {
        state.modals[modal] = false;
      });
      state.accessDetails = null;
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
    
    // Reset actions
    resetValidation: (state) => {
      state.hasBusinessAccess = false;
      state.accessValidated = false;
      state.accessDetails = null;
      state.modulePermissions = {};
      state.permissionsLoaded = {};
      state.validationCache = {};
      state.cacheExpiry = {};
    }
  },
  
  extraReducers: (builder) => {
    // Validate Business Access
    builder
      .addCase(validateBusinessAccess.pending, (state) => {
        state.loading.validateAccess = true;
        state.errors.validateAccess = null;
        state.success.validateAccess = null;
      })
      .addCase(validateBusinessAccess.fulfilled, (state, action) => {
        state.loading.validateAccess = false;
        state.hasBusinessAccess = action.payload.hasAccess;
        state.accessValidated = true;
        state.accessDetails = action.payload;
        state.success.validateAccess = action.payload.message;
        
        // Cache the validation result
        const cacheKey = `access_${action.payload.businessId}_${action.payload.userId}`;
        state.validationCache[cacheKey] = action.payload;
        state.cacheExpiry[cacheKey] = Date.now() + state.cacheTimeout;
      })
      .addCase(validateBusinessAccess.rejected, (state, action) => {
        state.loading.validateAccess = false;
        state.errors.validateAccess = action.payload;
        state.hasBusinessAccess = false;
        state.accessValidated = true;
      });
    
    // Get Available Businesses
    builder
      .addCase(getAvailableBusinesses.pending, (state) => {
        state.loading.availableBusinesses = true;
        state.errors.availableBusinesses = null;
      })
      .addCase(getAvailableBusinesses.fulfilled, (state, action) => {
        state.loading.availableBusinesses = false;
        state.availableBusinesses = action.payload;
        state.availableBusinessesLoaded = true;
      })
      .addCase(getAvailableBusinesses.rejected, (state, action) => {
        state.loading.availableBusinesses = false;
        state.errors.availableBusinesses = action.payload;
        state.availableBusinessesLoaded = true;
      });
    
    // Switch Active Business
    builder
      .addCase(switchActiveBusiness.pending, (state) => {
        state.loading.switchBusiness = true;
        state.errors.switchBusiness = null;
        state.success.switchBusiness = null;
        state.switchingBusiness = true;
      })
      .addCase(switchActiveBusiness.fulfilled, (state, action) => {
        state.loading.switchBusiness = false;
        state.switchingBusiness = false;
        state.activeBusiness = action.payload.business;
        state.activeBusinessId = action.payload.business.id;
        state.success.switchBusiness = action.payload.message;
        
        // Clear previous validation data
        state.hasBusinessAccess = true;
        state.accessValidated = true;
        state.modulePermissions = {};
        state.permissionsLoaded = {};
      })
      .addCase(switchActiveBusiness.rejected, (state, action) => {
        state.loading.switchBusiness = false;
        state.switchingBusiness = false;
        state.errors.switchBusiness = action.payload;
      });
    
    // Check Module Permissions
    builder
      .addCase(checkModulePermissions.pending, (state) => {
        state.loading.modulePermissions = true;
        state.errors.modulePermissions = null;
      })
      .addCase(checkModulePermissions.fulfilled, (state, action) => {
        state.loading.modulePermissions = false;
        const { moduleId, permissions } = action.payload;
        state.modulePermissions[moduleId] = permissions;
        state.permissionsLoaded[moduleId] = true;
        
        // Cache the permissions result
        const cacheKey = `permissions_${state.activeBusinessId}_${moduleId}`;
        state.validationCache[cacheKey] = action.payload;
        state.cacheExpiry[cacheKey] = Date.now() + state.cacheTimeout;
      })
      .addCase(checkModulePermissions.rejected, (state, action) => {
        state.loading.modulePermissions = false;
        state.errors.modulePermissions = action.payload;
      });
  }
});

// ================================
// ACTIONS
// ================================

export const {
  setActiveBusiness,
  setActiveBusinessId,
  clearActiveBusiness,
  setUserContext,
  clearUserContext,
  setBusinessAccess,
  clearBusinessAccess,
  setModulePermissions,
  clearModulePermissions,
  clearAllModulePermissions,
  setCacheData,
  clearCacheData,
  clearAllCache,
  setAutoValidate,
  setCacheTimeout,
  openModal,
  closeModal,
  closeAllModals,
  clearErrors,
  clearSuccess,
  clearMessages,
  resetValidation
} = businessValidationSlice.actions;

// ================================
// SELECTORS
// ================================

// Basic selectors
export const selectActiveBusiness = (state) => state.businessValidation.activeBusiness;
export const selectActiveBusinessId = (state) => state.businessValidation.activeBusinessId;
export const selectAvailableBusinesses = (state) => state.businessValidation.availableBusinesses;
export const selectAvailableBusinessesLoaded = (state) => state.businessValidation.availableBusinessesLoaded;
export const selectHasBusinessAccess = (state) => state.businessValidation.hasBusinessAccess;
export const selectAccessValidated = (state) => state.businessValidation.accessValidated;
export const selectAccessDetails = (state) => state.businessValidation.accessDetails;
export const selectModulePermissions = (state) => state.businessValidation.modulePermissions;
export const selectPermissionsLoaded = (state) => state.businessValidation.permissionsLoaded;
export const selectSwitchingBusiness = (state) => state.businessValidation.switchingBusiness;
export const selectUserRole = (state) => state.businessValidation.userRole;
export const selectUserBusinessId = (state) => state.businessValidation.userBusinessId;
export const selectUserPermissions = (state) => state.businessValidation.userPermissions;

// Loading selectors
export const selectValidateAccessLoading = (state) => state.businessValidation.loading.validateAccess;
export const selectAvailableBusinessesLoading = (state) => state.businessValidation.loading.availableBusinesses;
export const selectSwitchBusinessLoading = (state) => state.businessValidation.loading.switchBusiness;
export const selectModulePermissionsLoading = (state) => state.businessValidation.loading.modulePermissions;

// Error selectors
export const selectValidateAccessError = (state) => state.businessValidation.errors.validateAccess;
export const selectAvailableBusinessesError = (state) => state.businessValidation.errors.availableBusinesses;
export const selectSwitchBusinessError = (state) => state.businessValidation.errors.switchBusiness;
export const selectModulePermissionsError = (state) => state.businessValidation.errors.modulePermissions;

// Success selectors
export const selectValidateAccessSuccess = (state) => state.businessValidation.success.validateAccess;
export const selectSwitchBusinessSuccess = (state) => state.businessValidation.success.switchBusiness;

// Modal selectors
export const selectModals = (state) => state.businessValidation.modals;
export const selectBusinessSelectorModalOpen = (state) => state.businessValidation.modals.businessSelector;
export const selectAccessDeniedModalOpen = (state) => state.businessValidation.modals.accessDenied;
export const selectPermissionsRequiredModalOpen = (state) => state.businessValidation.modals.permissionsRequired;

// Computed selectors
export const selectHasBusinessPermission = (state) => (moduleId, permission) => {
  const modulePermissions = state.businessValidation.modulePermissions[moduleId];
  if (!modulePermissions) return false;
  
  return modulePermissions.includes(permission) || 
         state.businessValidation.userPermissions.includes(permission) ||
         ['OWNER', 'BUSINESS'].includes(state.businessValidation.userRole);
};

export const selectCanAccessModule = (state) => (moduleId) => {
  if (!state.businessValidation.hasBusinessAccess) return false;
  if (!state.businessValidation.accessValidated) return false;
  
  const permissions = state.businessValidation.modulePermissions[moduleId];
  return permissions && permissions.length > 0;
};

export const selectBusinessOptions = (state) => {
  return state.businessValidation.availableBusinesses.map(business => ({
    value: business.id,
    label: business.name,
    disabled: business.status !== 'ACTIVE'
  }));
};

export const selectValidationCacheStatus = (state) => (key) => {
  const cached = state.businessValidation.validationCache[key];
  const expiry = state.businessValidation.cacheExpiry[key];
  
  if (!cached || !expiry) return { cached: false, expired: true };
  
  return {
    cached: true,
    expired: Date.now() > expiry,
    data: cached
  };
};

export default businessValidationSlice.reducer;