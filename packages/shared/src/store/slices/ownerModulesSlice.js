import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ownerModulesApi } from '../../api/ownerModulesApi';

// AsyncThunks para gestión de módulos (OWNER)

/**
 * Obtener todos los módulos con filtros
 */
export const fetchOwnerModules = createAsyncThunk(
  'ownerModules/fetchModules',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await ownerModulesApi.getAllModules(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Obtener un módulo específico por ID
 */
export const fetchOwnerModuleById = createAsyncThunk(
  'ownerModules/fetchModuleById',
  async (moduleId, { rejectWithValue }) => {
    try {
      const response = await ownerModulesApi.getModuleById(moduleId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Obtener módulos por categoría
 */
export const fetchOwnerModulesByCategory = createAsyncThunk(
  'ownerModules/fetchModulesByCategory',
  async ({ category, status = 'ACTIVE' }, { rejectWithValue }) => {
    try {
      const response = await ownerModulesApi.getModulesByCategory(category, { status });
      return { category, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Crear un nuevo módulo
 */
export const createOwnerModule = createAsyncThunk(
  'ownerModules/createModule',
  async (moduleData, { rejectWithValue }) => {
    try {
      const response = await ownerModulesApi.createModule(moduleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Actualizar un módulo existente
 */
export const updateOwnerModule = createAsyncThunk(
  'ownerModules/updateModule',
  async ({ moduleId, moduleData }, { rejectWithValue }) => {
    try {
      const response = await ownerModulesApi.updateModule(moduleId, moduleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Cambiar estado de un módulo
 */
export const updateOwnerModuleStatus = createAsyncThunk(
  'ownerModules/updateModuleStatus',
  async ({ moduleId, status }, { rejectWithValue }) => {
    try {
      const response = await ownerModulesApi.updateModuleStatus(moduleId, status);
      return { moduleId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Obtener dependencias de un módulo
 */
export const fetchOwnerModuleDependencies = createAsyncThunk(
  'ownerModules/fetchModuleDependencies',
  async (moduleId, { rejectWithValue }) => {
    try {
      const response = await ownerModulesApi.getModuleDependencies(moduleId);
      return { moduleId, dependencies: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Eliminar un módulo (marcar como DEPRECATED)
 */
export const deleteOwnerModule = createAsyncThunk(
  'ownerModules/deleteModule',
  async (moduleId, { rejectWithValue }) => {
    try {
      await ownerModulesApi.deleteModule(moduleId);
      return moduleId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  // Lista de módulos
  modules: [],
  totalModules: 0,
  
  // Módulos por categoría
  modulesByCategory: {
    CORE: [],
    APPOINTMENTS: [],
    CLIENTS: [],
    FINANCIAL: [],
    PREMIUM: [],
    INTEGRATIONS: [],
    ANALYTICS: []
  },
  
  // Módulo seleccionado
  selectedModule: null,
  selectedModuleDependencies: null,
  
  // Paginación
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 0,
    totalItems: 0
  },
  
  // Filtros y búsqueda
  filters: {
    page: 1,
    limit: 10,
    category: '', // 'CORE', 'APPOINTMENTS', 'CLIENTS', etc.
    status: 'all', // 'all', 'ACTIVE', 'DEVELOPMENT', 'DEPRECATED'
    search: ''
  },
  
  // Estados de carga
  loading: false,
  selectedModuleLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  categoryLoading: false,
  dependenciesLoading: false,
  
  // Errores
  error: null,
  selectedModuleError: null,
  createError: null,
  updateError: null,
  deleteError: null,
  categoryError: null,
  dependenciesError: null,
  
  // UI State
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
  showDependenciesModal: false,
  editingModule: null,
  
  // Categorías disponibles
  categories: [
    { value: 'CORE', label: 'Core', description: 'Módulos fundamentales del sistema' },
    { value: 'APPOINTMENTS', label: 'Citas', description: 'Gestión de citas y agenda' },
    { value: 'CLIENTS', label: 'Clientes', description: 'Gestión de clientes' },
    { value: 'FINANCIAL', label: 'Financiero', description: 'Módulos financieros y reportes' },
    { value: 'PREMIUM', label: 'Premium', description: 'Funcionalidades premium' },
    { value: 'INTEGRATIONS', label: 'Integraciones', description: 'Integraciones con terceros' },
    { value: 'ANALYTICS', label: 'Analytics', description: 'Análisis y estadísticas' }
  ],
  
  // Estados disponibles
  statuses: [
    { value: 'DEVELOPMENT', label: 'En Desarrollo', color: 'warning' },
    { value: 'ACTIVE', label: 'Activo', color: 'success' },
    { value: 'DEPRECATED', label: 'Deprecado', color: 'danger' },
    { value: 'MAINTENANCE', label: 'Mantenimiento', color: 'info' }
  ]
};

const ownerModulesSlice = createSlice({
  name: 'ownerModules',
  initialState,
  reducers: {
    // Filtros y búsqueda
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSearch: (state, action) => {
      state.filters.search = action.payload;
      state.filters.page = 1; // Reset página al buscar
    },
    setCategory: (state, action) => {
      state.filters.category = action.payload;
      state.filters.page = 1; // Reset página al cambiar categoría
    },
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
    
    // UI State
    setShowCreateModal: (state, action) => {
      state.showCreateModal = action.payload;
    },
    setShowEditModal: (state, action) => {
      state.showEditModal = action.payload;
      if (!action.payload) {
        state.editingModule = null;
      }
    },
    setShowDeleteModal: (state, action) => {
      state.showDeleteModal = action.payload;
    },
    setShowDependenciesModal: (state, action) => {
      state.showDependenciesModal = action.payload;
    },
    setEditingModule: (state, action) => {
      state.editingModule = action.payload;
    },
    
    // Limpiar errores
    clearErrors: (state) => {
      state.error = null;
      state.selectedModuleError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.categoryError = null;
      state.dependenciesError = null;
    },
    
    // Limpiar módulo seleccionado
    clearSelectedModule: (state) => {
      state.selectedModule = null;
      state.selectedModuleDependencies = null;
      state.selectedModuleError = null;
    },
    
    // Reset completo
    resetOwnerModules: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Modules
      .addCase(fetchOwnerModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOwnerModules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload.data || [];
        
        // Actualizar paginación si viene en la respuesta
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
          state.totalModules = action.payload.pagination.totalItems;
        }
      })
      .addCase(fetchOwnerModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error cargando módulos';
      })
      
      // Fetch Module by ID
      .addCase(fetchOwnerModuleById.pending, (state) => {
        state.selectedModuleLoading = true;
        state.selectedModuleError = null;
      })
      .addCase(fetchOwnerModuleById.fulfilled, (state, action) => {
        state.selectedModuleLoading = false;
        state.selectedModule = action.payload.data;
      })
      .addCase(fetchOwnerModuleById.rejected, (state, action) => {
        state.selectedModuleLoading = false;
        state.selectedModuleError = action.payload?.message || 'Error cargando módulo';
      })
      
      // Fetch Modules by Category
      .addCase(fetchOwnerModulesByCategory.pending, (state) => {
        state.categoryLoading = true;
        state.categoryError = null;
      })
      .addCase(fetchOwnerModulesByCategory.fulfilled, (state, action) => {
        state.categoryLoading = false;
        state.modulesByCategory[action.payload.category] = action.payload.data.data || [];
      })
      .addCase(fetchOwnerModulesByCategory.rejected, (state, action) => {
        state.categoryLoading = false;
        state.categoryError = action.payload?.message || 'Error cargando módulos por categoría';
      })
      
      // Create Module
      .addCase(createOwnerModule.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createOwnerModule.fulfilled, (state, action) => {
        state.createLoading = false;
        state.modules.unshift(action.payload.data); // Agregar al inicio
        state.totalModules += 1;
        
        // Agregar a la categoría correspondiente
        const category = action.payload.data.category;
        if (category && state.modulesByCategory[category]) {
          state.modulesByCategory[category].unshift(action.payload.data);
        }
        
        state.showCreateModal = false;
      })
      .addCase(createOwnerModule.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload?.message || 'Error creando módulo';
      })
      
      // Update Module
      .addCase(updateOwnerModule.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateOwnerModule.fulfilled, (state, action) => {
        state.updateLoading = false;
        
        // Actualizar en la lista
        const index = state.modules.findIndex(module => module.id === action.payload.data.id);
        if (index !== -1) {
          state.modules[index] = action.payload.data;
        }
        
        // Actualizar en categorías
        Object.keys(state.modulesByCategory).forEach(category => {
          const categoryIndex = state.modulesByCategory[category].findIndex(
            module => module.id === action.payload.data.id
          );
          if (categoryIndex !== -1) {
            state.modulesByCategory[category][categoryIndex] = action.payload.data;
          }
        });
        
        // Actualizar módulo seleccionado si es el mismo
        if (state.selectedModule?.id === action.payload.data.id) {
          state.selectedModule = action.payload.data;
        }
        
        state.showEditModal = false;
        state.editingModule = null;
      })
      .addCase(updateOwnerModule.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload?.message || 'Error actualizando módulo';
      })
      
      // Update Module Status
      .addCase(updateOwnerModuleStatus.pending, (state) => {
        state.updateLoading = true;
      })
      .addCase(updateOwnerModuleStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        
        // Actualizar en la lista
        const index = state.modules.findIndex(module => module.id === action.payload.moduleId);
        if (index !== -1) {
          state.modules[index] = { ...state.modules[index], ...action.payload.data };
        }
        
        // Actualizar módulo seleccionado si es el mismo
        if (state.selectedModule?.id === action.payload.moduleId) {
          state.selectedModule = { ...state.selectedModule, ...action.payload.data };
        }
      })
      .addCase(updateOwnerModuleStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload?.message || 'Error cambiando estado del módulo';
      })
      
      // Fetch Module Dependencies
      .addCase(fetchOwnerModuleDependencies.pending, (state) => {
        state.dependenciesLoading = true;
        state.dependenciesError = null;
      })
      .addCase(fetchOwnerModuleDependencies.fulfilled, (state, action) => {
        state.dependenciesLoading = false;
        state.selectedModuleDependencies = action.payload.dependencies;
      })
      .addCase(fetchOwnerModuleDependencies.rejected, (state, action) => {
        state.dependenciesLoading = false;
        state.dependenciesError = action.payload?.message || 'Error cargando dependencias';
      })
      
      // Delete Module
      .addCase(deleteOwnerModule.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteOwnerModule.fulfilled, (state, action) => {
        state.deleteLoading = false;
        
        // Marcar como DEPRECATED en lugar de remover
        const index = state.modules.findIndex(module => module.id === action.payload);
        if (index !== -1) {
          state.modules[index].status = 'DEPRECATED';
        }
        
        // Actualizar en categorías
        Object.keys(state.modulesByCategory).forEach(category => {
          const categoryIndex = state.modulesByCategory[category].findIndex(
            module => module.id === action.payload
          );
          if (categoryIndex !== -1) {
            state.modulesByCategory[category][categoryIndex].status = 'DEPRECATED';
          }
        });
        
        // Limpiar módulo seleccionado si es el mismo
        if (state.selectedModule?.id === action.payload) {
          state.selectedModule = null;
          state.selectedModuleDependencies = null;
        }
        
        state.showDeleteModal = false;
      })
      .addCase(deleteOwnerModule.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload?.message || 'Error eliminando módulo';
      });
  }
});

export const {
  setFilters,
  resetFilters,
  setSearch,
  setCategory,
  setPage,
  setShowCreateModal,
  setShowEditModal,
  setShowDeleteModal,
  setShowDependenciesModal,
  setEditingModule,
  clearErrors,
  clearSelectedModule,
  resetOwnerModules
} = ownerModulesSlice.actions;

export default ownerModulesSlice.reducer;