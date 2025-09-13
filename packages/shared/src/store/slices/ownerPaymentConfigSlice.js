import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ownerPaymentConfigApi } from '../../api/ownerPaymentConfigApi';

// 💳 CONFIGURACIÓN DE PAGOS OWNER - Async Thunks

/**
 * Obtener todas las configuraciones de pago
 */
export const getAllPaymentConfigurations = createAsyncThunk(
  'ownerPaymentConfig/getAllPaymentConfigurations',
  async ({ provider, isActive, environment, page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await ownerPaymentConfigApi.getAllConfigurations({
        provider,
        isActive,
        environment,
        page,
        limit
      });
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error obteniendo configuraciones',
        status: error.response?.status
      });
    }
  }
);

/**
 * Crear nueva configuración de pago
 */
export const createPaymentConfiguration = createAsyncThunk(
  'ownerPaymentConfig/createPaymentConfiguration',
  async (configData, { rejectWithValue }) => {
    try {
      const response = await ownerPaymentConfigApi.createConfiguration(configData);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error creando configuración',
        status: error.response?.status,
        details: error.response?.data?.details
      });
    }
  }
);

/**
 * Obtener configuración específica por ID
 */
export const getPaymentConfigurationById = createAsyncThunk(
  'ownerPaymentConfig/getPaymentConfigurationById',
  async (configId, { rejectWithValue }) => {
    try {
      const response = await ownerPaymentConfigApi.getConfigurationById(configId);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error obteniendo configuración',
        status: error.response?.status
      });
    }
  }
);

/**
 * Actualizar configuración de pago
 */
export const updatePaymentConfiguration = createAsyncThunk(
  'ownerPaymentConfig/updatePaymentConfiguration',
  async ({ configId, updates }, { rejectWithValue }) => {
    try {
      const response = await ownerPaymentConfigApi.updateConfiguration(configId, updates);
      return { configId, data: response.data };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error actualizando configuración',
        status: error.response?.status,
        configId
      });
    }
  }
);

/**
 * Eliminar configuración de pago
 */
export const deletePaymentConfiguration = createAsyncThunk(
  'ownerPaymentConfig/deletePaymentConfiguration',
  async (configId, { rejectWithValue }) => {
    try {
      const response = await ownerPaymentConfigApi.deleteConfiguration(configId);
      return { configId, data: response.data };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error eliminando configuración',
        status: error.response?.status,
        configId
      });
    }
  }
);

/**
 * Activar/Desactivar configuración
 */
export const togglePaymentConfiguration = createAsyncThunk(
  'ownerPaymentConfig/togglePaymentConfiguration',
  async ({ configId, isActive }, { rejectWithValue }) => {
    try {
      const response = await ownerPaymentConfigApi.toggleConfiguration(configId, isActive);
      return { configId, isActive, data: response.data };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error cambiando estado',
        status: error.response?.status,
        configId
      });
    }
  }
);

/**
 * Probar configuración de pago
 */
export const testPaymentConfiguration = createAsyncThunk(
  'ownerPaymentConfig/testPaymentConfiguration',
  async (configId, { rejectWithValue }) => {
    try {
      const response = await ownerPaymentConfigApi.testConfiguration(configId);
      return { configId, result: response.data };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error probando configuración',
        status: error.response?.status,
        configId
      });
    }
  }
);

/**
 * Obtener proveedores de pago disponibles
 */
export const getAvailableProviders = createAsyncThunk(
  'ownerPaymentConfig/getAvailableProviders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ownerPaymentConfigApi.getAvailableProviders();
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error obteniendo proveedores',
        status: error.response?.status
      });
    }
  }
);

/**
 * Obtener estadísticas de configuraciones
 */
export const getConfigurationStats = createAsyncThunk(
  'ownerPaymentConfig/getConfigurationStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ownerPaymentConfigApi.getConfigurationStats();
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error obteniendo estadísticas',
        status: error.response?.status
      });
    }
  }
);

// Estado inicial
const initialState = {
  // Lista de configuraciones
  configurations: [],
  configurationsPagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  isLoadingConfigurations: false,
  
  // Filtros
  filters: {
    provider: null,
    isActive: null,
    environment: null
  },
  
  // Configuración seleccionada
  selectedConfiguration: null,
  isLoadingConfiguration: false,
  
  // Creación/Edición
  isCreatingConfiguration: false,
  isUpdatingConfiguration: false,
  createdConfiguration: null,
  
  // Acciones
  actionInProgress: {}, // { configId: 'testing' | 'toggling' | 'deleting' }
  testResults: {}, // { configId: testResult }
  
  // Proveedores disponibles
  availableProviders: [],
  isLoadingProviders: false,
  
  // Estadísticas
  configurationStats: null,
  isLoadingStats: false,
  
  // Estados globales
  error: null,
  lastUpdated: null,
  
  // UI States
  showCreateModal: false,
  showEditModal: false,
  showTestModal: false
};

// Slice
const ownerPaymentConfigSlice = createSlice({
  name: 'ownerPaymentConfig',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setShowCreateModal: (state, action) => {
      state.showCreateModal = action.payload;
    },
    setShowEditModal: (state, action) => {
      state.showEditModal = action.payload;
    },
    setShowTestModal: (state, action) => {
      state.showTestModal = action.payload;
    },
    clearSelectedConfiguration: (state) => {
      state.selectedConfiguration = null;
    },
    clearCreatedConfiguration: (state) => {
      state.createdConfiguration = null;
    },
    resetConfigurations: (state) => {
      state.configurations = [];
      state.configurationsPagination = initialState.configurationsPagination;
    },
    clearTestResults: (state) => {
      state.testResults = {};
    },
    clearTestResult: (state, action) => {
      const configId = action.payload;
      delete state.testResults[configId];
    }
  },
  extraReducers: (builder) => {
    builder
      // Get All Configurations
      .addCase(getAllPaymentConfigurations.pending, (state) => {
        state.isLoadingConfigurations = true;
        state.error = null;
      })
      .addCase(getAllPaymentConfigurations.fulfilled, (state, action) => {
        state.isLoadingConfigurations = false;
        const { items, pagination } = action.payload;
        
        if (pagination.currentPage === 1) {
          state.configurations = items;
        } else {
          state.configurations = [...state.configurations, ...items];
        }
        
        state.configurationsPagination = pagination;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getAllPaymentConfigurations.rejected, (state, action) => {
        state.isLoadingConfigurations = false;
        state.error = action.payload;
      })

      // Create Configuration
      .addCase(createPaymentConfiguration.pending, (state) => {
        state.isCreatingConfiguration = true;
        state.error = null;
      })
      .addCase(createPaymentConfiguration.fulfilled, (state, action) => {
        state.isCreatingConfiguration = false;
        state.createdConfiguration = action.payload;
        // Agregar al inicio de la lista
        state.configurations.unshift(action.payload);
        state.showCreateModal = false;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(createPaymentConfiguration.rejected, (state, action) => {
        state.isCreatingConfiguration = false;
        state.error = action.payload;
      })

      // Get Configuration by ID
      .addCase(getPaymentConfigurationById.pending, (state) => {
        state.isLoadingConfiguration = true;
        state.error = null;
      })
      .addCase(getPaymentConfigurationById.fulfilled, (state, action) => {
        state.isLoadingConfiguration = false;
        state.selectedConfiguration = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getPaymentConfigurationById.rejected, (state, action) => {
        state.isLoadingConfiguration = false;
        state.error = action.payload;
      })

      // Update Configuration
      .addCase(updatePaymentConfiguration.pending, (state) => {
        state.isUpdatingConfiguration = true;
        state.error = null;
      })
      .addCase(updatePaymentConfiguration.fulfilled, (state, action) => {
        state.isUpdatingConfiguration = false;
        const { configId, data } = action.payload;
        
        // Actualizar en la lista
        const index = state.configurations.findIndex(config => config.id === configId);
        if (index !== -1) {
          state.configurations[index] = { ...state.configurations[index], ...data };
        }
        
        // Actualizar configuración seleccionada si es la misma
        if (state.selectedConfiguration?.id === configId) {
          state.selectedConfiguration = { ...state.selectedConfiguration, ...data };
        }
        
        state.showEditModal = false;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updatePaymentConfiguration.rejected, (state, action) => {
        state.isUpdatingConfiguration = false;
        state.error = action.payload;
      })

      // Delete Configuration
      .addCase(deletePaymentConfiguration.pending, (state, action) => {
        const configId = action.meta.arg;
        state.actionInProgress[configId] = 'deleting';
        state.error = null;
      })
      .addCase(deletePaymentConfiguration.fulfilled, (state, action) => {
        const { configId } = action.payload;
        delete state.actionInProgress[configId];
        
        // Remover de la lista
        state.configurations = state.configurations.filter(config => config.id !== configId);
        
        // Limpiar si es la configuración seleccionada
        if (state.selectedConfiguration?.id === configId) {
          state.selectedConfiguration = null;
        }
        
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(deletePaymentConfiguration.rejected, (state, action) => {
        const { configId } = action.payload;
        delete state.actionInProgress[configId];
        state.error = action.payload;
      })

      // Toggle Configuration
      .addCase(togglePaymentConfiguration.pending, (state, action) => {
        const { configId } = action.meta.arg;
        state.actionInProgress[configId] = 'toggling';
        state.error = null;
      })
      .addCase(togglePaymentConfiguration.fulfilled, (state, action) => {
        const { configId, isActive } = action.payload;
        delete state.actionInProgress[configId];
        
        // Actualizar en la lista
        const index = state.configurations.findIndex(config => config.id === configId);
        if (index !== -1) {
          state.configurations[index].isActive = isActive;
        }
        
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(togglePaymentConfiguration.rejected, (state, action) => {
        const { configId } = action.payload;
        delete state.actionInProgress[configId];
        state.error = action.payload;
      })

      // Test Configuration
      .addCase(testPaymentConfiguration.pending, (state, action) => {
        const configId = action.meta.arg;
        state.actionInProgress[configId] = 'testing';
        state.error = null;
      })
      .addCase(testPaymentConfiguration.fulfilled, (state, action) => {
        const { configId, result } = action.payload;
        delete state.actionInProgress[configId];
        state.testResults[configId] = result;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(testPaymentConfiguration.rejected, (state, action) => {
        const { configId } = action.payload;
        delete state.actionInProgress[configId];
        state.error = action.payload;
      })

      // Available Providers
      .addCase(getAvailableProviders.pending, (state) => {
        state.isLoadingProviders = true;
        state.error = null;
      })
      .addCase(getAvailableProviders.fulfilled, (state, action) => {
        state.isLoadingProviders = false;
        state.availableProviders = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getAvailableProviders.rejected, (state, action) => {
        state.isLoadingProviders = false;
        state.error = action.payload;
      })

      // Configuration Stats
      .addCase(getConfigurationStats.pending, (state) => {
        state.isLoadingStats = true;
        state.error = null;
      })
      .addCase(getConfigurationStats.fulfilled, (state, action) => {
        state.isLoadingStats = false;
        state.configurationStats = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getConfigurationStats.rejected, (state, action) => {
        state.isLoadingStats = false;
        state.error = action.payload;
      });
  }
});

// Actions
export const {
  clearError,
  setFilters,
  clearFilters,
  setShowCreateModal,
  setShowEditModal,
  setShowTestModal,
  clearSelectedConfiguration,
  clearCreatedConfiguration,
  resetConfigurations,
  clearTestResults,
  clearTestResult
} = ownerPaymentConfigSlice.actions;

// Selectors
export const selectOwnerPaymentConfig = (state) => state.ownerPaymentConfig;
export const selectConfigurations = (state) => state.ownerPaymentConfig.configurations;
export const selectConfigurationsPagination = (state) => state.ownerPaymentConfig.configurationsPagination;
export const selectSelectedConfiguration = (state) => state.ownerPaymentConfig.selectedConfiguration;
export const selectAvailableProviders = (state) => state.ownerPaymentConfig.availableProviders;
export const selectConfigurationStats = (state) => state.ownerPaymentConfig.configurationStats;
export const selectFilters = (state) => state.ownerPaymentConfig.filters;
export const selectTestResults = (state) => state.ownerPaymentConfig.testResults;
export const selectActionInProgress = (state) => state.ownerPaymentConfig.actionInProgress;
export const selectOwnerPaymentConfigError = (state) => state.ownerPaymentConfig.error;

// Computed Selectors
export const selectActiveConfigurations = (state) => {
  return selectConfigurations(state).filter(config => config.isActive);
};

export const selectConfigurationsByProvider = (state) => {
  const configurations = selectConfigurations(state);
  return configurations.reduce((acc, config) => {
    if (!acc[config.provider]) {
      acc[config.provider] = [];
    }
    acc[config.provider].push(config);
    return acc;
  }, {});
};

export const selectIsConfigurationActionInProgress = (state, configId) => {
  return !!state.ownerPaymentConfig.actionInProgress[configId];
};

export const selectTestResultForConfiguration = (state, configId) => {
  return state.ownerPaymentConfig.testResults[configId];
};

export default ownerPaymentConfigSlice.reducer;