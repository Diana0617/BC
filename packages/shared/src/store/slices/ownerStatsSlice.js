import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ownerApi } from '../../api/ownerApi';

// AsyncThunks
export const fetchPlatformStats = createAsyncThunk(
  'ownerStats/fetchPlatformStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ownerApi.getPlatformStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  stats: {
    users: {
      byRole: [],
      total: 0
    },
    businesses: {
      byStatus: [],
      total: 0
    },
    subscriptions: {
      byStatus: [],
      total: 0,
      activeCount: 0
    },
    plans: {
      total: 0
    },
    modules: {
      total: 0
    },
    platform: {
      lastUpdated: null
    }
  },
  loading: false,
  error: null,
  lastFetched: null
};

const ownerStatsSlice = createSlice({
  name: 'ownerStats',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetStats: (state) => {
      state.stats = initialState.stats;
      state.error = null;
      state.lastFetched = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Platform Stats
      .addCase(fetchPlatformStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlatformStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
        state.lastFetched = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchPlatformStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, resetStats } = ownerStatsSlice.actions;

// Selectors
export const selectOwnerStats = (state) => state.ownerStats.stats;
export const selectOwnerStatsLoading = (state) => state.ownerStats.loading;
export const selectOwnerStatsError = (state) => state.ownerStats.error;
export const selectOwnerStatsLastFetched = (state) => state.ownerStats.lastFetched;

// Derived selectors
export const selectTotalUsers = (state) => state.ownerStats.stats.users.total;
export const selectTotalBusinesses = (state) => state.ownerStats.stats.businesses.total;
export const selectActiveSubscriptions = (state) => state.ownerStats.stats.subscriptions.activeCount;
export const selectTotalPlans = (state) => state.ownerStats.stats.plans.total;
export const selectTotalModules = (state) => state.ownerStats.stats.modules.total;

export default ownerStatsSlice.reducer;