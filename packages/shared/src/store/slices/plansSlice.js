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
  error: null,
  selectedPlanError: null
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
export const selectPlansError = (state) => state.plans.error;
export const selectSelectedPlanError = (state) => state.plans.selectedPlanError;

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