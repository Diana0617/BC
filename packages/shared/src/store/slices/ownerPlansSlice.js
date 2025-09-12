import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ownerPlansApi } from '../../api/ownerPlansApi';

// AsyncThunks para gestión de planes (OWNER)

/**
 * Obtener todos los planes con estadísticas (OWNER)
 */
export const fetchOwnerPlans = createAsyncThunk(
  'ownerPlans/fetchPlans',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await ownerPlansApi.getAllPlans(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Obtener un plan específico con sus módulos (OWNER)
 */
export const fetchOwnerPlanById = createAsyncThunk(
  'ownerPlans/fetchPlanById',
  async (planId, { rejectWithValue }) => {
    try {
      const response = await ownerPlansApi.getPlanById(planId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Crear un nuevo plan con módulos
 */
export const createOwnerPlan = createAsyncThunk(
  'ownerPlans/createPlan',
  async (planData, { rejectWithValue }) => {
    try {
      const response = await ownerPlansApi.createPlan(planData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Actualizar un plan existente
 */
export const updateOwnerPlan = createAsyncThunk(
  'ownerPlans/updatePlan',
  async ({ planId, planData }, { rejectWithValue }) => {
    try {
      const response = await ownerPlansApi.updatePlan(planId, planData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Cambiar estado de un plan (activar/desactivar)
 */
export const toggleOwnerPlanStatus = createAsyncThunk(
  'ownerPlans/toggleStatus',
  async ({ planId, status }, { rejectWithValue }) => {
    try {
      const response = await ownerPlansApi.updatePlanStatus(planId, status);
      return { planId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Obtener estadísticas de un plan específico
 */
export const fetchOwnerPlanStats = createAsyncThunk(
  'ownerPlans/fetchPlanStats',
  async (planId, { rejectWithValue }) => {
    try {
      const response = await ownerPlansApi.getPlanStats(planId);
      return { planId, stats: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Eliminar un plan (soft delete)
 */
export const deleteOwnerPlan = createAsyncThunk(
  'ownerPlans/deletePlan',
  async (planId, { rejectWithValue }) => {
    try {
      await ownerPlansApi.deletePlan(planId);
      return planId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  // Lista de planes
  plans: [],
  totalPlans: 0,
  
  // Plan seleccionado
  selectedPlan: null,
  selectedPlanStats: null,
  
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
    status: 'all', // 'all', 'ACTIVE', 'INACTIVE'
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    search: ''
  },
  
  // Estados de carga
  loading: false,
  selectedPlanLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  statsLoading: false,
  
  // Errores
  error: null,
  selectedPlanError: null,
  createError: null,
  updateError: null,
  deleteError: null,
  statsError: null,
  
  // UI State
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
  editingPlan: null
};

const ownerPlansSlice = createSlice({
  name: 'ownerPlans',
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
        state.editingPlan = null;
      }
    },
    setShowDeleteModal: (state, action) => {
      state.showDeleteModal = action.payload;
    },
    setEditingPlan: (state, action) => {
      state.editingPlan = action.payload;
    },
    
    // Limpiar errores
    clearErrors: (state) => {
      state.error = null;
      state.selectedPlanError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.statsError = null;
    },
    
    // Limpiar plan seleccionado
    clearSelectedPlan: (state) => {
      state.selectedPlan = null;
      state.selectedPlanStats = null;
      state.selectedPlanError = null;
    },
    
    // Reset completo
    resetOwnerPlans: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Plans
      .addCase(fetchOwnerPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOwnerPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload.data || [];
        
        // Actualizar paginación si viene en la respuesta
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
          state.totalPlans = action.payload.pagination.totalItems;
        }
      })
      .addCase(fetchOwnerPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error cargando planes';
      })
      
      // Fetch Plan by ID
      .addCase(fetchOwnerPlanById.pending, (state) => {
        state.selectedPlanLoading = true;
        state.selectedPlanError = null;
      })
      .addCase(fetchOwnerPlanById.fulfilled, (state, action) => {
        state.selectedPlanLoading = false;
        state.selectedPlan = action.payload.data;
      })
      .addCase(fetchOwnerPlanById.rejected, (state, action) => {
        state.selectedPlanLoading = false;
        state.selectedPlanError = action.payload?.message || 'Error cargando plan';
      })
      
      // Create Plan
      .addCase(createOwnerPlan.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createOwnerPlan.fulfilled, (state, action) => {
        state.createLoading = false;
        state.plans.unshift(action.payload.data); // Agregar al inicio
        state.totalPlans += 1;
        state.showCreateModal = false;
      })
      .addCase(createOwnerPlan.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload?.message || 'Error creando plan';
      })
      
      // Update Plan
      .addCase(updateOwnerPlan.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateOwnerPlan.fulfilled, (state, action) => {
        state.updateLoading = false;
        
        // Actualizar en la lista
        const index = state.plans.findIndex(plan => plan.id === action.payload.data.id);
        if (index !== -1) {
          state.plans[index] = action.payload.data;
        }
        
        // Actualizar plan seleccionado si es el mismo
        if (state.selectedPlan?.id === action.payload.data.id) {
          state.selectedPlan = action.payload.data;
        }
        
        state.showEditModal = false;
        state.editingPlan = null;
      })
      .addCase(updateOwnerPlan.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload?.message || 'Error actualizando plan';
      })
      
      // Toggle Plan Status
      .addCase(toggleOwnerPlanStatus.pending, (state) => {
        state.updateLoading = true;
      })
      .addCase(toggleOwnerPlanStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        
        // Actualizar en la lista
        const index = state.plans.findIndex(plan => plan.id === action.payload.planId);
        if (index !== -1) {
          state.plans[index] = { ...state.plans[index], ...action.payload.data };
        }
        
        // Actualizar plan seleccionado si es el mismo
        if (state.selectedPlan?.id === action.payload.planId) {
          state.selectedPlan = { ...state.selectedPlan, ...action.payload.data };
        }
      })
      .addCase(toggleOwnerPlanStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload?.message || 'Error cambiando estado del plan';
      })
      
      // Fetch Plan Stats
      .addCase(fetchOwnerPlanStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchOwnerPlanStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.selectedPlanStats = action.payload.stats;
      })
      .addCase(fetchOwnerPlanStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload?.message || 'Error cargando estadísticas';
      })
      
      // Delete Plan
      .addCase(deleteOwnerPlan.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteOwnerPlan.fulfilled, (state, action) => {
        state.deleteLoading = false;
        
        // Remover de la lista
        state.plans = state.plans.filter(plan => plan.id !== action.payload);
        state.totalPlans -= 1;
        
        // Limpiar plan seleccionado si es el mismo
        if (state.selectedPlan?.id === action.payload) {
          state.selectedPlan = null;
          state.selectedPlanStats = null;
        }
        
        state.showDeleteModal = false;
      })
      .addCase(deleteOwnerPlan.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload?.message || 'Error eliminando plan';
      });
  }
});

export const {
  setFilters,
  resetFilters,
  setSearch,
  setPage,
  setShowCreateModal,
  setShowEditModal,
  setShowDeleteModal,
  setEditingPlan,
  clearErrors,
  clearSelectedPlan,
  resetOwnerPlans
} = ownerPlansSlice.actions;

export default ownerPlansSlice.reducer;