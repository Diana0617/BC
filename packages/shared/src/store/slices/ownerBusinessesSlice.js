import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ownerApi } from '../../api/ownerApi';

// AsyncThunks
export const fetchBusinesses = createAsyncThunk(
  'ownerBusinesses/fetchBusinesses',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await ownerApi.getAllBusinesses(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createBusiness = createAsyncThunk(
  'ownerBusinesses/createBusiness',
  async (businessData, { rejectWithValue }) => {
    try {
      const response = await ownerApi.createBusinessManually(businessData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const toggleBusinessStatus = createAsyncThunk(
  'ownerBusinesses/toggleBusinessStatus',
  async ({ businessId, status, reason }, { rejectWithValue }) => {
    try {
      const response = await ownerApi.toggleBusinessStatus(businessId, { status, reason });
      return { businessId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  businesses: [],
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10
  },
  filters: {
    search: '',
    status: '',
    page: 1,
    limit: 10
  },
  loading: false,
  creating: false,
  updating: false,
  error: null,
  createError: null,
  updateError: null
};

const ownerBusinessesSlice = createSlice({
  name: 'ownerBusinesses',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        status: '',
        page: 1,
        limit: 10
      };
    },
    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
    },
    resetBusinesses: (state) => {
      state.businesses = [];
      state.pagination = initialState.pagination;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Businesses
      .addCase(fetchBusinesses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusinesses.fulfilled, (state, action) => {
        state.loading = false;
        state.businesses = action.payload.data.businesses;
        state.pagination = action.payload.data.pagination;
        state.error = null;
      })
      .addCase(fetchBusinesses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Business
      .addCase(createBusiness.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createBusiness.fulfilled, (state, action) => {
        state.creating = false;
        // Add the new business to the list if we're on the first page
        if (state.filters.page === 1) {
          state.businesses.unshift(action.payload.data.business);
        }
        state.createError = null;
      })
      .addCase(createBusiness.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload;
      })

      // Toggle Business Status
      .addCase(toggleBusinessStatus.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(toggleBusinessStatus.fulfilled, (state, action) => {
        state.updating = false;
        const { businessId } = action.payload;
        const businessIndex = state.businesses.findIndex(b => b.id === businessId);
        if (businessIndex !== -1) {
          state.businesses[businessIndex] = { ...state.businesses[businessIndex], ...action.payload.data.business };
        }
        state.updateError = null;
      })
      .addCase(toggleBusinessStatus.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload;
      });
  }
});

export const { setFilters, clearFilters, clearErrors, resetBusinesses } = ownerBusinessesSlice.actions;

// Selectors
export const selectBusinesses = (state) => state.ownerBusinesses.businesses;
export const selectBusinessesPagination = (state) => state.ownerBusinesses.pagination;
export const selectBusinessesFilters = (state) => state.ownerBusinesses.filters;
export const selectBusinessesLoading = (state) => state.ownerBusinesses.loading;
export const selectBusinessesCreating = (state) => state.ownerBusinesses.creating;
export const selectBusinessesUpdating = (state) => state.ownerBusinesses.updating;
export const selectBusinessesError = (state) => state.ownerBusinesses.error;
export const selectBusinessesCreateError = (state) => state.ownerBusinesses.createError;
export const selectBusinessesUpdateError = (state) => state.ownerBusinesses.updateError;

// Derived selectors
export const selectBusinessById = (state, businessId) => 
  state.ownerBusinesses.businesses.find(business => business.id === businessId);

export const selectActiveBusinesses = (state) => 
  state.ownerBusinesses.businesses.filter(business => business.status === 'ACTIVE');

export const selectBusinessesByStatus = (state, status) => 
  state.ownerBusinesses.businesses.filter(business => business.status === status);

export default ownerBusinessesSlice.reducer;