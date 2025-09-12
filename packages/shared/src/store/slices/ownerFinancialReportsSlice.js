/**
 * Slice de Redux para Reportes Financieros del Owner
 * Gestiona reportes de ingresos, comisiones, análisis financiero y exportaciones
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ownerFinancialReportsApi } from '../../api/ownerFinancialReportsApi';

// ====== ASYNC THUNKS ======

export const generateRevenueReport = createAsyncThunk(
  'ownerFinancialReports/generateRevenueReport',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await ownerFinancialReportsApi.generateRevenueReport(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al generar reporte de ingresos');
    }
  }
);

export const generateCommissionReport = createAsyncThunk(
  'ownerFinancialReports/generateCommissionReport',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await ownerFinancialReportsApi.generateCommissionReport(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al generar reporte de comisiones');
    }
  }
);

export const generatePaymentReport = createAsyncThunk(
  'ownerFinancialReports/generatePaymentReport',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await ownerFinancialReportsApi.generatePaymentReport(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al generar reporte de pagos');
    }
  }
);

export const generateBusinessPerformanceReport = createAsyncThunk(
  'ownerFinancialReports/generateBusinessPerformanceReport',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await ownerFinancialReportsApi.generateBusinessPerformanceReport(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al generar reporte de rendimiento');
    }
  }
);

export const generateSubscriptionReport = createAsyncThunk(
  'ownerFinancialReports/generateSubscriptionReport',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await ownerFinancialReportsApi.generateSubscriptionReport(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al generar reporte de suscripciones');
    }
  }
);

export const generateTaxReport = createAsyncThunk(
  'ownerFinancialReports/generateTaxReport',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await ownerFinancialReportsApi.generateTaxReport(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al generar reporte fiscal');
    }
  }
);

export const getFinancialSummary = createAsyncThunk(
  'ownerFinancialReports/getFinancialSummary',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await ownerFinancialReportsApi.getFinancialSummary(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar resumen financiero');
    }
  }
);

export const getProfitAndLoss = createAsyncThunk(
  'ownerFinancialReports/getProfitAndLoss',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await ownerFinancialReportsApi.getProfitAndLoss(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar estado de pérdidas y ganancias');
    }
  }
);

export const getCashFlow = createAsyncThunk(
  'ownerFinancialReports/getCashFlow',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await ownerFinancialReportsApi.getCashFlow(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar flujo de caja');
    }
  }
);

export const getRevenueProjection = createAsyncThunk(
  'ownerFinancialReports/getRevenueProjection',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await ownerFinancialReportsApi.getRevenueProjection(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar proyección de ingresos');
    }
  }
);

export const exportReport = createAsyncThunk(
  'ownerFinancialReports/exportReport',
  async ({ reportType, params, format }, { rejectWithValue }) => {
    try {
      return await ownerFinancialReportsApi.exportReport(reportType, params, format);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al exportar reporte');
    }
  }
);

// ====== INITIAL STATE ======

const initialState = {
  // Report data
  revenueReport: null,
  commissionReport: null,
  paymentReport: null,
  businessPerformanceReport: null,
  subscriptionReport: null,
  taxReport: null,
  financialSummary: null,
  profitAndLoss: null,
  cashFlow: null,
  revenueProjection: null,
  
  // Report parameters
  reportParams: {
    startDate: '',
    endDate: '',
    businessId: '',
    currency: 'COP',
    granularity: 'monthly', // daily, weekly, monthly, yearly
    includeRefunds: true,
    includeDisputes: false,
    groupBy: 'business', // business, plan, method, date
    compareWithPrevious: false
  },
  
  // Loading states
  loading: {
    revenueReport: false,
    commissionReport: false,
    paymentReport: false,
    businessPerformanceReport: false,
    subscriptionReport: false,
    taxReport: false,
    financialSummary: false,
    profitAndLoss: false,
    cashFlow: false,
    revenueProjection: false,
    exporting: false
  },
  
  // Error states
  errors: {
    revenueReport: null,
    commissionReport: null,
    paymentReport: null,
    businessPerformanceReport: null,
    subscriptionReport: null,
    taxReport: null,
    financialSummary: null,
    profitAndLoss: null,
    cashFlow: null,
    revenueProjection: null,
    export: null
  },
  
  // UI State
  ui: {
    activeReport: 'revenue', // revenue, commission, payment, business, subscription, tax
    showParametersModal: false,
    showExportModal: false,
    showComparisonMode: false,
    selectedReportForExport: null,
    exportFormat: 'pdf', // pdf, excel, csv
    dateRange: 'month', // today, week, month, quarter, year, custom
    chartType: 'line', // line, bar, pie, area
    viewMode: 'chart', // chart, table, summary
    autoRefresh: false,
    refreshInterval: 300000, // 5 minutes
    comparisonPeriod: 'previous_period' // previous_period, previous_year, custom
  }
};

// ====== SLICE ======

const ownerFinancialReportsSlice = createSlice({
  name: 'ownerFinancialReports',
  initialState,
  reducers: {
    // Report parameters
    setReportParams: (state, action) => {
      state.reportParams = { ...state.reportParams, ...action.payload };
    },
    
    setStartDate: (state, action) => {
      state.reportParams.startDate = action.payload;
    },
    
    setEndDate: (state, action) => {
      state.reportParams.endDate = action.payload;
    },
    
    setBusinessId: (state, action) => {
      state.reportParams.businessId = action.payload;
    },
    
    setCurrency: (state, action) => {
      state.reportParams.currency = action.payload;
    },
    
    setGranularity: (state, action) => {
      state.reportParams.granularity = action.payload;
    },
    
    setGroupBy: (state, action) => {
      state.reportParams.groupBy = action.payload;
    },
    
    toggleIncludeRefunds: (state) => {
      state.reportParams.includeRefunds = !state.reportParams.includeRefunds;
    },
    
    toggleIncludeDisputes: (state) => {
      state.reportParams.includeDisputes = !state.reportParams.includeDisputes;
    },
    
    toggleCompareWithPrevious: (state) => {
      state.reportParams.compareWithPrevious = !state.reportParams.compareWithPrevious;
    },
    
    resetReportParams: (state) => {
      state.reportParams = {
        startDate: '',
        endDate: '',
        businessId: '',
        currency: 'COP',
        granularity: 'monthly',
        includeRefunds: true,
        includeDisputes: false,
        groupBy: 'business',
        compareWithPrevious: false
      };
    },
    
    // UI actions
    setActiveReport: (state, action) => {
      state.ui.activeReport = action.payload;
    },
    
    openParametersModal: (state) => {
      state.ui.showParametersModal = true;
    },
    
    closeParametersModal: (state) => {
      state.ui.showParametersModal = false;
    },
    
    openExportModal: (state, action) => {
      state.ui.showExportModal = true;
      state.ui.selectedReportForExport = action.payload;
    },
    
    closeExportModal: (state) => {
      state.ui.showExportModal = false;
      state.ui.selectedReportForExport = null;
    },
    
    setExportFormat: (state, action) => {
      state.ui.exportFormat = action.payload;
    },
    
    toggleComparisonMode: (state) => {
      state.ui.showComparisonMode = !state.ui.showComparisonMode;
    },
    
    setDateRange: (state, action) => {
      state.ui.dateRange = action.payload;
      
      // Auto-set start and end dates based on range
      const now = new Date();
      let startDate, endDate = now.toISOString().split('T')[0];
      
      switch (action.payload) {
        case 'today':
          startDate = endDate;
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          startDate = weekAgo.toISOString().split('T')[0];
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          startDate = monthAgo.toISOString().split('T')[0];
          break;
        case 'quarter':
          const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          startDate = quarterAgo.toISOString().split('T')[0];
          break;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          startDate = yearAgo.toISOString().split('T')[0];
          break;
        default:
          // Custom - don't auto-set
          return;
      }
      
      if (startDate) {
        state.reportParams.startDate = startDate;
        state.reportParams.endDate = endDate;
      }
    },
    
    setChartType: (state, action) => {
      state.ui.chartType = action.payload;
    },
    
    setViewMode: (state, action) => {
      state.ui.viewMode = action.payload;
    },
    
    toggleAutoRefresh: (state) => {
      state.ui.autoRefresh = !state.ui.autoRefresh;
    },
    
    setRefreshInterval: (state, action) => {
      state.ui.refreshInterval = action.payload;
    },
    
    setComparisonPeriod: (state, action) => {
      state.ui.comparisonPeriod = action.payload;
    },
    
    // Data management
    clearReport: (state, action) => {
      const reportType = action.payload;
      if (state[reportType]) {
        state[reportType] = null;
      }
    },
    
    clearAllReports: (state) => {
      state.revenueReport = null;
      state.commissionReport = null;
      state.paymentReport = null;
      state.businessPerformanceReport = null;
      state.subscriptionReport = null;
      state.taxReport = null;
      state.financialSummary = null;
      state.profitAndLoss = null;
      state.cashFlow = null;
      state.revenueProjection = null;
    },
    
    // Error handling
    clearErrors: (state) => {
      state.errors = {
        revenueReport: null,
        commissionReport: null,
        paymentReport: null,
        businessPerformanceReport: null,
        subscriptionReport: null,
        taxReport: null,
        financialSummary: null,
        profitAndLoss: null,
        cashFlow: null,
        revenueProjection: null,
        export: null
      };
    },
    
    clearError: (state, action) => {
      const errorType = action.payload;
      if (state.errors[errorType]) {
        state.errors[errorType] = null;
      }
    },
    
    // Reset
    reset: (state) => {
      Object.assign(state, initialState);
    }
  },
  
  extraReducers: (builder) => {
    // ====== GENERATE REVENUE REPORT ======
    builder
      .addCase(generateRevenueReport.pending, (state) => {
        state.loading.revenueReport = true;
        state.errors.revenueReport = null;
      })
      .addCase(generateRevenueReport.fulfilled, (state, action) => {
        state.loading.revenueReport = false;
        state.revenueReport = action.payload;
      })
      .addCase(generateRevenueReport.rejected, (state, action) => {
        state.loading.revenueReport = false;
        state.errors.revenueReport = action.payload;
      })
      
    // ====== GENERATE COMMISSION REPORT ======
      .addCase(generateCommissionReport.pending, (state) => {
        state.loading.commissionReport = true;
        state.errors.commissionReport = null;
      })
      .addCase(generateCommissionReport.fulfilled, (state, action) => {
        state.loading.commissionReport = false;
        state.commissionReport = action.payload;
      })
      .addCase(generateCommissionReport.rejected, (state, action) => {
        state.loading.commissionReport = false;
        state.errors.commissionReport = action.payload;
      })
      
    // ====== GENERATE PAYMENT REPORT ======
      .addCase(generatePaymentReport.pending, (state) => {
        state.loading.paymentReport = true;
        state.errors.paymentReport = null;
      })
      .addCase(generatePaymentReport.fulfilled, (state, action) => {
        state.loading.paymentReport = false;
        state.paymentReport = action.payload;
      })
      .addCase(generatePaymentReport.rejected, (state, action) => {
        state.loading.paymentReport = false;
        state.errors.paymentReport = action.payload;
      })
      
    // ====== GENERATE BUSINESS PERFORMANCE REPORT ======
      .addCase(generateBusinessPerformanceReport.pending, (state) => {
        state.loading.businessPerformanceReport = true;
        state.errors.businessPerformanceReport = null;
      })
      .addCase(generateBusinessPerformanceReport.fulfilled, (state, action) => {
        state.loading.businessPerformanceReport = false;
        state.businessPerformanceReport = action.payload;
      })
      .addCase(generateBusinessPerformanceReport.rejected, (state, action) => {
        state.loading.businessPerformanceReport = false;
        state.errors.businessPerformanceReport = action.payload;
      })
      
    // ====== GENERATE SUBSCRIPTION REPORT ======
      .addCase(generateSubscriptionReport.pending, (state) => {
        state.loading.subscriptionReport = true;
        state.errors.subscriptionReport = null;
      })
      .addCase(generateSubscriptionReport.fulfilled, (state, action) => {
        state.loading.subscriptionReport = false;
        state.subscriptionReport = action.payload;
      })
      .addCase(generateSubscriptionReport.rejected, (state, action) => {
        state.loading.subscriptionReport = false;
        state.errors.subscriptionReport = action.payload;
      })
      
    // ====== GENERATE TAX REPORT ======
      .addCase(generateTaxReport.pending, (state) => {
        state.loading.taxReport = true;
        state.errors.taxReport = null;
      })
      .addCase(generateTaxReport.fulfilled, (state, action) => {
        state.loading.taxReport = false;
        state.taxReport = action.payload;
      })
      .addCase(generateTaxReport.rejected, (state, action) => {
        state.loading.taxReport = false;
        state.errors.taxReport = action.payload;
      })
      
    // ====== GET FINANCIAL SUMMARY ======
      .addCase(getFinancialSummary.pending, (state) => {
        state.loading.financialSummary = true;
        state.errors.financialSummary = null;
      })
      .addCase(getFinancialSummary.fulfilled, (state, action) => {
        state.loading.financialSummary = false;
        state.financialSummary = action.payload;
      })
      .addCase(getFinancialSummary.rejected, (state, action) => {
        state.loading.financialSummary = false;
        state.errors.financialSummary = action.payload;
      })
      
    // ====== GET PROFIT AND LOSS ======
      .addCase(getProfitAndLoss.pending, (state) => {
        state.loading.profitAndLoss = true;
        state.errors.profitAndLoss = null;
      })
      .addCase(getProfitAndLoss.fulfilled, (state, action) => {
        state.loading.profitAndLoss = false;
        state.profitAndLoss = action.payload;
      })
      .addCase(getProfitAndLoss.rejected, (state, action) => {
        state.loading.profitAndLoss = false;
        state.errors.profitAndLoss = action.payload;
      })
      
    // ====== GET CASH FLOW ======
      .addCase(getCashFlow.pending, (state) => {
        state.loading.cashFlow = true;
        state.errors.cashFlow = null;
      })
      .addCase(getCashFlow.fulfilled, (state, action) => {
        state.loading.cashFlow = false;
        state.cashFlow = action.payload;
      })
      .addCase(getCashFlow.rejected, (state, action) => {
        state.loading.cashFlow = false;
        state.errors.cashFlow = action.payload;
      })
      
    // ====== GET REVENUE PROJECTION ======
      .addCase(getRevenueProjection.pending, (state) => {
        state.loading.revenueProjection = true;
        state.errors.revenueProjection = null;
      })
      .addCase(getRevenueProjection.fulfilled, (state, action) => {
        state.loading.revenueProjection = false;
        state.revenueProjection = action.payload;
      })
      .addCase(getRevenueProjection.rejected, (state, action) => {
        state.loading.revenueProjection = false;
        state.errors.revenueProjection = action.payload;
      })
      
    // ====== EXPORT REPORT ======
      .addCase(exportReport.pending, (state) => {
        state.loading.exporting = true;
        state.errors.export = null;
      })
      .addCase(exportReport.fulfilled, (state, action) => {
        state.loading.exporting = false;
        // Close export modal on success
        state.ui.showExportModal = false;
        state.ui.selectedReportForExport = null;
      })
      .addCase(exportReport.rejected, (state, action) => {
        state.loading.exporting = false;
        state.errors.export = action.payload;
      });
  }
});

// ====== ACTIONS EXPORT ======
export const {
  setReportParams,
  setStartDate,
  setEndDate,
  setBusinessId,
  setCurrency,
  setGranularity,
  setGroupBy,
  toggleIncludeRefunds,
  toggleIncludeDisputes,
  toggleCompareWithPrevious,
  resetReportParams,
  setActiveReport,
  openParametersModal,
  closeParametersModal,
  openExportModal,
  closeExportModal,
  setExportFormat,
  toggleComparisonMode,
  setDateRange,
  setChartType,
  setViewMode,
  toggleAutoRefresh,
  setRefreshInterval,
  setComparisonPeriod,
  clearReport,
  clearAllReports,
  clearErrors,
  clearError,
  reset
} = ownerFinancialReportsSlice.actions;

// ====== SELECTORS ======
export const selectRevenueReport = (state) => state.ownerFinancialReports.revenueReport;
export const selectCommissionReport = (state) => state.ownerFinancialReports.commissionReport;
export const selectPaymentReport = (state) => state.ownerFinancialReports.paymentReport;
export const selectBusinessPerformanceReport = (state) => state.ownerFinancialReports.businessPerformanceReport;
export const selectSubscriptionReport = (state) => state.ownerFinancialReports.subscriptionReport;
export const selectTaxReport = (state) => state.ownerFinancialReports.taxReport;
export const selectFinancialSummary = (state) => state.ownerFinancialReports.financialSummary;
export const selectProfitAndLoss = (state) => state.ownerFinancialReports.profitAndLoss;
export const selectCashFlow = (state) => state.ownerFinancialReports.cashFlow;
export const selectRevenueProjection = (state) => state.ownerFinancialReports.revenueProjection;
export const selectReportParams = (state) => state.ownerFinancialReports.reportParams;
export const selectFinancialReportsLoading = (state) => state.ownerFinancialReports.loading;
export const selectFinancialReportsErrors = (state) => state.ownerFinancialReports.errors;
export const selectFinancialReportsUI = (state) => state.ownerFinancialReports.ui;

export default ownerFinancialReportsSlice.reducer;