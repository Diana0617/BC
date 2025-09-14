import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { plansApi } from '../../api/plansApi';

// AsyncThunks
export const fetchPlans = createAsyncThunk(
  'plans/fetchPlans',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await plansApi.getPlans(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPlanById = createAsyncThunk(
  'plans/fetchPlanById',
  async (planId, { rejectWithValue }) => {
    try {
      const response = await plansApi.getPlanById(planId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createPlan = createAsyncThunk(
  'plans/createPlan',
  async (planData, { rejectWithValue }) => {
    try {
      const response = await plansApi.createPlan(planData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePlan = createAsyncThunk(
  'plans/updatePlan',
  async ({ planId, planData }, { rejectWithValue }) => {
    try {
      const response = await plansApi.updatePlan(planId, planData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deletePlan = createAsyncThunk(
  'plans/deletePlan',
  async (planId, { rejectWithValue }) => {
    try {
      await plansApi.deletePlan(planId);
      return planId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const togglePlanStatus = createAsyncThunk(
  'plans/togglePlanStatus',
  async (planId, { rejectWithValue }) => {
    try {
      const response = await plansApi.togglePlanStatus(planId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  plans: [],
  selectedPlan: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10
  },
  filters: {
    search: '',
    status: 'ACTIVE',
    includeModules: false,
    page: 1,
    limit: 10
  },
  loading: false,
  selectedPlanLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  error: null,
  selectedPlanError: null,
  createError: null,
  updateError: null,
  deleteError: null
};

const plansSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        status: 'ACTIVE',
        includeModules: false,
        page: 1,
        limit: 10
      };
    },
    clearErrors: (state) => {
      state.error = null;
      state.selectedPlanError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    clearSelectedPlan: (state) => {
      state.selectedPlan = null;
      state.selectedPlanError = null;
    },
    resetPlans: (state) => {
      state.plans = [];
      state.pagination = initialState.pagination;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Plans
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Plan by ID
      .addCase(fetchPlanById.pending, (state) => {
        state.selectedPlanLoading = true;
        state.selectedPlanError = null;
      })
      .addCase(fetchPlanById.fulfilled, (state, action) => {
        state.selectedPlanLoading = false;
        state.selectedPlan = action.payload.data;
        state.selectedPlanError = null;
      })
      .addCase(fetchPlanById.rejected, (state, action) => {
        state.selectedPlanLoading = false;
        state.selectedPlanError = action.payload;
      })

      // Create Plan
      .addCase(createPlan.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createError = null;
        // Agregar el nuevo plan al inicio de la lista
        state.plans.unshift(action.payload.data);
        // Actualizar contadores de paginación
        state.pagination.totalItems += 1;
      })
      .addCase(createPlan.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })

      // Update Plan
      .addCase(updatePlan.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateError = null;
        // Actualizar el plan en la lista
        const planIndex = state.plans.findIndex(plan => plan.id === action.payload.data.id);
        if (planIndex !== -1) {
          state.plans[planIndex] = action.payload.data;
        }
        // Actualizar selectedPlan si es el mismo
        if (state.selectedPlan && state.selectedPlan.id === action.payload.data.id) {
          state.selectedPlan = action.payload.data;
        }
      })
      .addCase(updatePlan.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })

      // Delete Plan
      .addCase(deletePlan.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = null;
        // Remover el plan de la lista
        state.plans = state.plans.filter(plan => plan.id !== action.payload);
        // Limpiar selectedPlan si es el mismo que se eliminó
        if (state.selectedPlan && state.selectedPlan.id === action.payload) {
          state.selectedPlan = null;
        }
        // Actualizar contadores de paginación
        state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
      })
      .addCase(deletePlan.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      })

      // Toggle Plan Status
      .addCase(togglePlanStatus.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(togglePlanStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateError = null;
        // Actualizar el plan en la lista
        const planIndex = state.plans.findIndex(plan => plan.id === action.payload.data.id);
        if (planIndex !== -1) {
          state.plans[planIndex] = action.payload.data;
        }
        // Actualizar selectedPlan si es el mismo
        if (state.selectedPlan && state.selectedPlan.id === action.payload.data.id) {
          state.selectedPlan = action.payload.data;
        }
      })
      .addCase(togglePlanStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
  }
});

export const { 
  setFilters, 
  clearFilters, 
  clearErrors, 
  clearSelectedPlan, 
  resetPlans 
} = plansSlice.actions;

// Selectors
export const selectPlans = (state) => state.plans.plans;
export const selectSelectedPlan = (state) => state.plans.selectedPlan;
export const selectPlansPagination = (state) => state.plans.pagination;
export const selectPlansFilters = (state) => state.plans.filters;
export const selectPlansLoading = (state) => state.plans.loading;
export const selectSelectedPlanLoading = (state) => state.plans.selectedPlanLoading;
export const selectCreatePlanLoading = (state) => state.plans.createLoading;
export const selectUpdatePlanLoading = (state) => state.plans.updateLoading;
export const selectDeletePlanLoading = (state) => state.plans.deleteLoading;
export const selectPlansError = (state) => state.plans.error;
export const selectSelectedPlanError = (state) => state.plans.selectedPlanError;
export const selectCreatePlanError = (state) => state.plans.createError;
export const selectUpdatePlanError = (state) => state.plans.updateError;
export const selectDeletePlanError = (state) => state.plans.deleteError;

// Derived selectors
export const selectPlanById = (state, planId) => 
  state.plans.plans.find(plan => plan.id === planId);

export const selectActivePlans = (state) => 
  state.plans.plans.filter(plan => plan.status === 'ACTIVE');

export const selectPopularPlans = (state) => 
  state.plans.plans.filter(plan => plan.isPopular && plan.status === 'ACTIVE');

export const selectPlansByPriceRange = (state, minPrice, maxPrice) => 
  state.plans.plans.filter(plan => {
    const price = parseFloat(plan.price);
    return price >= minPrice && price <= maxPrice;
  });

export const selectCheapestPlan = (state) => 
  state.plans.plans
    .filter(plan => plan.status === 'ACTIVE')
    .reduce((cheapest, plan) => {
      if (!cheapest) return plan;
      return parseFloat(plan.price) < parseFloat(cheapest.price) ? plan : cheapest;
    }, null);

export const selectMostExpensivePlan = (state) => 
  state.plans.plans
    .filter(plan => plan.status === 'ACTIVE')
    .reduce((expensive, plan) => {
      if (!expensive) return plan;
      return parseFloat(plan.price) > parseFloat(expensive.price) ? plan : expensive;
    }, null);

export default plansSlice.reducer;