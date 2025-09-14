import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import businessValidationApi from '../../api/businessValidationApi';

// 🎯 ASYNC THUNKS

// Validar acceso a un business específico
export const validateBusinessAccess = createAsyncThunk(
  'businessValidation/validateAccess',
  async ({ businessId, userId }, { rejectWithValue }) => {
    try {
      const response = await businessValidationApi.validateBusinessAccess(businessId, userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Obtener businesses accesibles para el usuario actual
export const getAccessibleBusinesses = createAsyncThunk(
  'businessValidation/getAccessible',
  async (_, { rejectWithValue }) => {
    try {
      const response = await businessValidationApi.getAccessibleBusinesses();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Cambiar business activo
export const switchActiveBusiness = createAsyncThunk(
  'businessValidation/switchActive',
  async ({ businessId }, { rejectWithValue, getState }) => {
    try {
      // Primero validar acceso
      const state = getState();
      const userId = state.auth.user?.id;
      
      const response = await businessValidationApi.validateBusinessAccess(businessId, userId);
      
      if (response.data.hasAccess) {
        return {
          businessId,
          businessData: response.data.businessData,
          permissions: response.data.permissions
        };
      } else {
        return rejectWithValue('No tienes acceso a este negocio');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Verificar permisos específicos en el business actual
export const checkBusinessPermission = createAsyncThunk(
  'businessValidation/checkPermission',
  async ({ permission, businessId }, { rejectWithValue }) => {
    try {
      const response = await businessValidationApi.checkBusinessPermission(businessId, permission);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🏪 INITIAL STATE
const initialState = {
  // Estados de carga
  loading: {
    validatingAccess: false,
    loadingBusinesses: false,
    switchingBusiness: false,
    checkingPermission: false
  },
  
  // Errores
  errors: {
    validation: null,
    businesses: null,
    switching: null,
    permission: null
  },
  
  // Business activo
  activeBusiness: {
    id: null,
    name: null,
    hasAccess: false,
    permissions: [],
    role: null, // 'OWNER', 'ADMIN', 'SPECIALIST', 'RECEPTIONIST'
    isOwner: false
  },
  
  // Lista de businesses accesibles
  accessibleBusinesses: [],
  
  // Caché de validaciones
  validationCache: {},
  
  // Configuración de multitenancy
  multitenancy: {
    enabled: true,
    strictValidation: true,
    allowCrossBusiness: false
  },
  
  // Estado de la UI
  ui: {
    showBusinessSelector: false,
    businessSelectorLoading: false,
    selectedBusinessId: null
  }
};

// 🍰 SLICE
const businessValidationSlice = createSlice({
  name: 'businessValidation',
  initialState,
  reducers: {
    // Limpiar errores
    clearErrors: (state) => {
      state.errors = {
        validation: null,
        businesses: null,
        switching: null,
        permission: null
      };
    },
    
    // Limpiar caché de validaciones
    clearValidationCache: (state) => {
      state.validationCache = {};
    },
    
    // Limpiar business activo (logout)
    clearActiveBusiness: (state) => {
      state.activeBusiness = initialState.activeBusiness;
      state.accessibleBusinesses = [];
      state.validationCache = {};
    },
    
    // UI Actions
    showBusinessSelector: (state) => {
      state.ui.showBusinessSelector = true;
    },
    
    hideBusinessSelector: (state) => {
      state.ui.showBusinessSelector = false;
      state.ui.selectedBusinessId = null;
    },
    
    selectBusinessForSwitch: (state, action) => {
      state.ui.selectedBusinessId = action.payload;
    },
    
    // Configurar multitenancy
    updateMultitenancyConfig: (state, action) => {
      state.multitenancy = {
        ...state.multitenancy,
        ...action.payload
      };
    },
    
    // Cachear resultado de validación
    cacheValidationResult: (state, action) => {
      const { businessId, userId, result } = action.payload;
      const cacheKey = `${businessId}-${userId}`;
      state.validationCache[cacheKey] = {
        ...result,
        cachedAt: Date.now()
      };
    },
    
    // Obtener validación desde caché
    getCachedValidation: (state, action) => {
      const { businessId, userId } = action.payload;
      const cacheKey = `${businessId}-${userId}`;
      const cached = state.validationCache[cacheKey];
      
      if (cached && (Date.now() - cached.cachedAt) < 5 * 60 * 1000) { // 5 minutos de caché
        return cached;
      }
      return null;
    },
    
    // Invalidar caché específico
    invalidateBusinessCache: (state, action) => {
      const { businessId } = action.payload;
      Object.keys(state.validationCache).forEach(key => {
        if (key.startsWith(`${businessId}-`)) {
          delete state.validationCache[key];
        }
      });
    }
  },
  
  extraReducers: (builder) => {
    // 🔍 VALIDATE BUSINESS ACCESS
    builder
      .addCase(validateBusinessAccess.pending, (state) => {
        state.loading.validatingAccess = true;
        state.errors.validation = null;
      })
      .addCase(validateBusinessAccess.fulfilled, (state, action) => {
        state.loading.validatingAccess = false;
        const { businessId, userId } = action.meta.arg;
        const result = action.payload;
        
        // Actualizar business activo si es el que se está validando
        if (businessId === state.activeBusiness.id || !state.activeBusiness.id) {
          state.activeBusiness = {
            id: businessId,
            name: result.businessData?.name || '',
            hasAccess: result.hasAccess,
            permissions: result.permissions || [],
            role: result.userRole,
            isOwner: result.userRole === 'OWNER'
          };
        }
        
        // Cachear resultado
        const cacheKey = `${businessId}-${userId}`;
        state.validationCache[cacheKey] = {
          ...result,
          cachedAt: Date.now()
        };
      })
      .addCase(validateBusinessAccess.rejected, (state, action) => {
        state.loading.validatingAccess = false;
        state.errors.validation = action.payload;
        
        // Si falló la validación, limpiar acceso
        state.activeBusiness.hasAccess = false;
      });
    
    // 🏢 GET ACCESSIBLE BUSINESSES
    builder
      .addCase(getAccessibleBusinesses.pending, (state) => {
        state.loading.loadingBusinesses = true;
        state.errors.businesses = null;
      })
      .addCase(getAccessibleBusinesses.fulfilled, (state, action) => {
        state.loading.loadingBusinesses = false;
        state.accessibleBusinesses = action.payload.businesses || [];
        
        // Si no hay business activo y hay businesses disponibles, seleccionar el primero
        if (!state.activeBusiness.id && state.accessibleBusinesses.length > 0) {
          const firstBusiness = state.accessibleBusinesses[0];
          state.activeBusiness = {
            id: firstBusiness.id,
            name: firstBusiness.name,
            hasAccess: true,
            permissions: firstBusiness.permissions || [],
            role: firstBusiness.role,
            isOwner: firstBusiness.role === 'OWNER'
          };
        }
      })
      .addCase(getAccessibleBusinesses.rejected, (state, action) => {
        state.loading.loadingBusinesses = false;
        state.errors.businesses = action.payload;
      });
    
    // 🔄 SWITCH ACTIVE BUSINESS
    builder
      .addCase(switchActiveBusiness.pending, (state) => {
        state.loading.switchingBusiness = true;
        state.errors.switching = null;
        state.ui.businessSelectorLoading = true;
      })
      .addCase(switchActiveBusiness.fulfilled, (state, action) => {
        state.loading.switchingBusiness = false;
        state.ui.businessSelectorLoading = false;
        state.ui.showBusinessSelector = false;
        
        const { businessId, businessData, permissions } = action.payload;
        
        state.activeBusiness = {
          id: businessId,
          name: businessData?.name || '',
          hasAccess: true,
          permissions: permissions || [],
          role: businessData?.userRole,
          isOwner: businessData?.userRole === 'OWNER'
        };
      })
      .addCase(switchActiveBusiness.rejected, (state, action) => {
        state.loading.switchingBusiness = false;
        state.ui.businessSelectorLoading = false;
        state.errors.switching = action.payload;
      });
    
    // ✅ CHECK BUSINESS PERMISSION
    builder
      .addCase(checkBusinessPermission.pending, (state) => {
        state.loading.checkingPermission = true;
        state.errors.permission = null;
      })
      .addCase(checkBusinessPermission.fulfilled, (state, action) => {
        state.loading.checkingPermission = false;
        // Los permisos se manejan en el resultado de la acción
      })
      .addCase(checkBusinessPermission.rejected, (state, action) => {
        state.loading.checkingPermission = false;
        state.errors.permission = action.payload;
      });
  }
});

// 📤 ACTIONS EXPORT
export const {
  clearErrors,
  clearValidationCache,
  clearActiveBusiness,
  showBusinessSelector,
  hideBusinessSelector,
  selectBusinessForSwitch,
  updateMultitenancyConfig,
  cacheValidationResult,
  getCachedValidation,
  invalidateBusinessCache
} = businessValidationSlice.actions;

// 🎯 SELECTORS
export const selectBusinessValidationState = (state) => state.businessValidation;
export const selectBusinessValidationLoading = (state) => state.businessValidation.loading;
export const selectBusinessValidationErrors = (state) => state.businessValidation.errors;
export const selectActiveBusiness = (state) => state.businessValidation.activeBusiness;
export const selectAccessibleBusinesses = (state) => state.businessValidation.accessibleBusinesses;
export const selectValidationCache = (state) => state.businessValidation.validationCache;
export const selectMultitenancyConfig = (state) => state.businessValidation.multitenancy;
export const selectBusinessValidationUI = (state) => state.businessValidation.ui;

// Selector para verificar si el usuario tiene acceso al business actual
export const selectHasBusinessAccess = (state) => {
  return state.businessValidation.activeBusiness.hasAccess;
};

// Selector para verificar si el usuario es owner del business actual
export const selectIsBusinessOwner = (state) => {
  return state.businessValidation.activeBusiness.isOwner;
};

// Selector para obtener el ID del business activo
export const selectActiveBusinessId = (state) => {
  return state.businessValidation.activeBusiness.id;
};

// Selector para verificar si el usuario tiene un permiso específico
export const selectHasBusinessPermission = (permission) => (state) => {
  const permissions = state.businessValidation.activeBusiness.permissions;
  return permissions.includes(permission) || state.businessValidation.activeBusiness.isOwner;
};

// Selector para verificar si el usuario puede acceder a múltiples businesses
export const selectCanAccessMultipleBusinesses = (state) => {
  return state.businessValidation.accessibleBusinesses.length > 1;
};

// Selector para obtener validación cacheada
export const selectCachedValidation = (businessId, userId) => (state) => {
  const cacheKey = `${businessId}-${userId}`;
  const cached = state.businessValidation.validationCache[cacheKey];
  
  if (cached && (Date.now() - cached.cachedAt) < 5 * 60 * 1000) { // 5 minutos
    return cached;
  }
  return null;
};

// Selector para verificar si se necesita cambiar de business
export const selectNeedsBusinessSwitch = (targetBusinessId) => (state) => {
  const currentBusinessId = state.businessValidation.activeBusiness.id;
  return currentBusinessId !== targetBusinessId;
};

export default businessValidationSlice.reducer;