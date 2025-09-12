/**
 * Slice de Redux para el Dashboard del Owner
 * Gestiona métricas, gráficos y estadísticas principales de la plataforma
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ownerDashboardApi } from '../../api/ownerDashboardApi';

// ====== ASYNC THUNKS ======

export const fetchMainMetrics = createAsyncThunk(
  'ownerDashboard/fetchMainMetrics',
  async (period = 'thisMonth', { rejectWithValue }) => {
    try {
      return await ownerDashboardApi.getMainMetrics(period);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar métricas principales');
    }
  }
);

export const fetchRevenueChart = createAsyncThunk(
  'ownerDashboard/fetchRevenueChart',
  async (months = 6, { rejectWithValue }) => {
    try {
      return await ownerDashboardApi.getRevenueChart(months);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar gráfico de ingresos');
    }
  }
);

export const fetchPlanDistribution = createAsyncThunk(
  'ownerDashboard/fetchPlanDistribution',
  async (_, { rejectWithValue }) => {
    try {
      return await ownerDashboardApi.getPlanDistribution();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar distribución de planes');
    }
  }
);

export const fetchTopBusinesses = createAsyncThunk(
  'ownerDashboard/fetchTopBusinesses',
  async (limit = 10, { rejectWithValue }) => {
    try {
      return await ownerDashboardApi.getTopBusinesses(limit);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar top negocios');
    }
  }
);

export const fetchGrowthStats = createAsyncThunk(
  'ownerDashboard/fetchGrowthStats',
  async (period = 'thisMonth', { rejectWithValue }) => {
    try {
      return await ownerDashboardApi.getGrowthStats(period);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar estadísticas de crecimiento');
    }
  }
);

export const fetchQuickSummary = createAsyncThunk(
  'ownerDashboard/fetchQuickSummary',
  async (_, { rejectWithValue }) => {
    try {
      return await ownerDashboardApi.getQuickSummary();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar resumen rápido');
    }
  }
);

export const exportDashboardData = createAsyncThunk(
  'ownerDashboard/exportDashboardData',
  async ({ format = 'json', period = 'thisMonth' }, { rejectWithValue }) => {
    try {
      return await ownerDashboardApi.exportData(format, period);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al exportar datos');
    }
  }
);

// ====== INITIAL STATE ======

const initialState = {
  // Main metrics data
  mainMetrics: null,
  currentPeriod: 'thisMonth',
  
  // Revenue chart data
  revenueChart: {
    data: [],
    period: 6,
    totalDataPoints: 0
  },
  
  // Plan distribution (pie chart)
  planDistribution: {
    distribution: [],
    totalPlans: 0,
    totalSubscriptions: 0
  },
  
  // Top businesses
  topBusinesses: {
    businesses: [],
    totalShown: 0,
    requestedLimit: 10
  },
  
  // Growth statistics
  growthStats: {
    conversionRate: null,
    businessGrowth: null,
    revenueTrend: null
  },
  
  // Quick summary widgets
  quickSummary: {
    widgets: []
  },
  
  // Loading states
  loading: {
    mainMetrics: false,
    revenueChart: false,
    planDistribution: false,
    topBusinesses: false,
    growthStats: false,
    quickSummary: false,
    exporting: false
  },
  
  // Error states
  errors: {
    mainMetrics: null,
    revenueChart: null,
    planDistribution: null,
    topBusinesses: null,
    growthStats: null,
    quickSummary: null,
    export: null
  },
  
  // UI State
  ui: {
    selectedWidget: null,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    lastRefresh: null,
    showExportModal: false,
    selectedExportFormat: 'json',
    selectedExportPeriod: 'thisMonth'
  },
  
  // Filters and preferences
  filters: {
    period: 'thisMonth',
    chartMonths: 6,
    topBusinessesLimit: 10
  }
};

// ====== SLICE ======

const ownerDashboardSlice = createSlice({
  name: 'ownerDashboard',
  initialState,
  reducers: {
    // UI Actions
    setSelectedWidget: (state, action) => {
      state.ui.selectedWidget = action.payload;
    },
    
    toggleAutoRefresh: (state) => {
      state.ui.autoRefresh = !state.ui.autoRefresh;
    },
    
    setRefreshInterval: (state, action) => {
      state.ui.refreshInterval = action.payload;
    },
    
    updateLastRefresh: (state) => {
      state.ui.lastRefresh = new Date().toISOString();
    },
    
    openExportModal: (state) => {
      state.ui.showExportModal = true;
    },
    
    closeExportModal: (state) => {
      state.ui.showExportModal = false;
    },
    
    setExportFormat: (state, action) => {
      state.ui.selectedExportFormat = action.payload;
    },
    
    setExportPeriod: (state, action) => {
      state.ui.selectedExportPeriod = action.payload;
    },
    
    // Filter actions
    setPeriod: (state, action) => {
      state.currentPeriod = action.payload;
      state.filters.period = action.payload;
    },
    
    setChartMonths: (state, action) => {
      state.filters.chartMonths = action.payload;
    },
    
    setTopBusinessesLimit: (state, action) => {
      state.filters.topBusinessesLimit = action.payload;
    },
    
    // Clear errors
    clearErrors: (state) => {
      state.errors = {
        mainMetrics: null,
        revenueChart: null,
        planDistribution: null,
        topBusinesses: null,
        growthStats: null,
        quickSummary: null,
        export: null
      };
    },
    
    clearError: (state, action) => {
      const errorType = action.payload;
      if (state.errors[errorType]) {
        state.errors[errorType] = null;
      }
    },
    
    // Reset state
    reset: (state) => {
      Object.assign(state, initialState);
    }
  },
  
  extraReducers: (builder) => {
    // ====== MAIN METRICS ======
    builder
      .addCase(fetchMainMetrics.pending, (state) => {
        state.loading.mainMetrics = true;
        state.errors.mainMetrics = null;
      })
      .addCase(fetchMainMetrics.fulfilled, (state, action) => {
        state.loading.mainMetrics = false;
        state.mainMetrics = action.payload;
        state.ui.lastRefresh = new Date().toISOString();
      })
      .addCase(fetchMainMetrics.rejected, (state, action) => {
        state.loading.mainMetrics = false;
        state.errors.mainMetrics = action.payload;
      })
      
    // ====== REVENUE CHART ======
      .addCase(fetchRevenueChart.pending, (state) => {
        state.loading.revenueChart = true;
        state.errors.revenueChart = null;
      })
      .addCase(fetchRevenueChart.fulfilled, (state, action) => {
        state.loading.revenueChart = false;
        state.revenueChart = action.payload;
      })
      .addCase(fetchRevenueChart.rejected, (state, action) => {
        state.loading.revenueChart = false;
        state.errors.revenueChart = action.payload;
      })
      
    // ====== PLAN DISTRIBUTION ======
      .addCase(fetchPlanDistribution.pending, (state) => {
        state.loading.planDistribution = true;
        state.errors.planDistribution = null;
      })
      .addCase(fetchPlanDistribution.fulfilled, (state, action) => {
        state.loading.planDistribution = false;
        state.planDistribution = action.payload;
      })
      .addCase(fetchPlanDistribution.rejected, (state, action) => {
        state.loading.planDistribution = false;
        state.errors.planDistribution = action.payload;
      })
      
    // ====== TOP BUSINESSES ======
      .addCase(fetchTopBusinesses.pending, (state) => {
        state.loading.topBusinesses = true;
        state.errors.topBusinesses = null;
      })
      .addCase(fetchTopBusinesses.fulfilled, (state, action) => {
        state.loading.topBusinesses = false;
        state.topBusinesses = action.payload;
      })
      .addCase(fetchTopBusinesses.rejected, (state, action) => {
        state.loading.topBusinesses = false;
        state.errors.topBusinesses = action.payload;
      })
      
    // ====== GROWTH STATS ======
      .addCase(fetchGrowthStats.pending, (state) => {
        state.loading.growthStats = true;
        state.errors.growthStats = null;
      })
      .addCase(fetchGrowthStats.fulfilled, (state, action) => {
        state.loading.growthStats = false;
        state.growthStats = action.payload;
      })
      .addCase(fetchGrowthStats.rejected, (state, action) => {
        state.loading.growthStats = false;
        state.errors.growthStats = action.payload;
      })
      
    // ====== QUICK SUMMARY ======
      .addCase(fetchQuickSummary.pending, (state) => {
        state.loading.quickSummary = true;
        state.errors.quickSummary = null;
      })
      .addCase(fetchQuickSummary.fulfilled, (state, action) => {
        state.loading.quickSummary = false;
        state.quickSummary = action.payload;
      })
      .addCase(fetchQuickSummary.rejected, (state, action) => {
        state.loading.quickSummary = false;
        state.errors.quickSummary = action.payload;
      })
      
    // ====== EXPORT DATA ======
      .addCase(exportDashboardData.pending, (state) => {
        state.loading.exporting = true;
        state.errors.export = null;
      })
      .addCase(exportDashboardData.fulfilled, (state, action) => {
        state.loading.exporting = false;
        // Trigger download or success message
        state.ui.showExportModal = false;
      })
      .addCase(exportDashboardData.rejected, (state, action) => {
        state.loading.exporting = false;
        state.errors.export = action.payload;
      });
  }
});

// ====== ACTIONS EXPORT ======
export const {
  setSelectedWidget,
  toggleAutoRefresh,
  setRefreshInterval,
  updateLastRefresh,
  openExportModal,
  closeExportModal,
  setExportFormat,
  setExportPeriod,
  setPeriod,
  setChartMonths,
  setTopBusinessesLimit,
  clearErrors,
  clearError,
  reset
} = ownerDashboardSlice.actions;

// ====== SELECTORS ======
export const selectMainMetrics = (state) => state.ownerDashboard.mainMetrics;
export const selectRevenueChart = (state) => state.ownerDashboard.revenueChart;
export const selectPlanDistribution = (state) => state.ownerDashboard.planDistribution;
export const selectTopBusinesses = (state) => state.ownerDashboard.topBusinesses;
export const selectGrowthStats = (state) => state.ownerDashboard.growthStats;
export const selectQuickSummary = (state) => state.ownerDashboard.quickSummary;
export const selectDashboardLoading = (state) => state.ownerDashboard.loading;
export const selectDashboardErrors = (state) => state.ownerDashboard.errors;
export const selectDashboardUI = (state) => state.ownerDashboard.ui;
export const selectDashboardFilters = (state) => state.ownerDashboard.filters;

export default ownerDashboardSlice.reducer;