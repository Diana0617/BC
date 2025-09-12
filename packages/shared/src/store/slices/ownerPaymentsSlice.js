/**
 * Slice de Redux para la Gestión de Pagos del Owner
 * Gestiona pagos, reembolsos, disputas y transacciones financieras
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ownerPaymentsApi } from '../../api/ownerPaymentsApi';

// ====== ASYNC THUNKS ======

export const fetchAllPayments = createAsyncThunk(
  'ownerPayments/fetchAllPayments',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await ownerPaymentsApi.getAllPayments(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar pagos');
    }
  }
);

export const processPayment = createAsyncThunk(
  'ownerPayments/processPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      return await ownerPaymentsApi.processPayment(paymentData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al procesar pago');
    }
  }
);

export const processRefund = createAsyncThunk(
  'ownerPayments/processRefund',
  async ({ paymentId, amount, reason }, { rejectWithValue }) => {
    try {
      return await ownerPaymentsApi.processRefund(paymentId, amount, reason);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al procesar reembolso');
    }
  }
);

export const updatePaymentStatus = createAsyncThunk(
  'ownerPayments/updatePaymentStatus',
  async ({ paymentId, status, notes }, { rejectWithValue }) => {
    try {
      return await ownerPaymentsApi.updatePaymentStatus(paymentId, status, notes);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar estado del pago');
    }
  }
);

export const getPaymentDetails = createAsyncThunk(
  'ownerPayments/getPaymentDetails',
  async (paymentId, { rejectWithValue }) => {
    try {
      return await ownerPaymentsApi.getPaymentDetails(paymentId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar detalles del pago');
    }
  }
);

export const getPaymentStats = createAsyncThunk(
  'ownerPayments/getPaymentStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await ownerPaymentsApi.getPaymentStats(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar estadísticas de pagos');
    }
  }
);

export const getRevenueAnalytics = createAsyncThunk(
  'ownerPayments/getRevenueAnalytics',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await ownerPaymentsApi.getRevenueAnalytics(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar analytics de ingresos');
    }
  }
);

export const handlePaymentDispute = createAsyncThunk(
  'ownerPayments/handlePaymentDispute',
  async ({ paymentId, action, notes, evidence }, { rejectWithValue }) => {
    try {
      return await ownerPaymentsApi.handlePaymentDispute(paymentId, action, notes, evidence);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al gestionar disputa');
    }
  }
);

export const getCommissionDetails = createAsyncThunk(
  'ownerPayments/getCommissionDetails',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await ownerPaymentsApi.getCommissionDetails(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar detalles de comisiones');
    }
  }
);

export const processCommissionPayment = createAsyncThunk(
  'ownerPayments/processCommissionPayment',
  async (commissionData, { rejectWithValue }) => {
    try {
      return await ownerPaymentsApi.processCommissionPayment(commissionData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al procesar pago de comisión');
    }
  }
);

// ====== INITIAL STATE ======

const initialState = {
  // Payment data
  payments: [],
  selectedPayment: null,
  paymentStats: null,
  revenueAnalytics: null,
  commissionDetails: [],
  
  // Pagination
  pagination: {
    page: 1,
    limit: 15,
    totalPages: 0,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  
  // Filters
  filters: {
    status: '', // successful, pending, failed, refunded, disputed
    method: '', // wompi, cash, bank_transfer
    businessId: '',
    subscriptionId: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    currency: 'COP',
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  },
  
  // Loading states
  loading: {
    payments: false,
    processing: false,
    refunding: false,
    updating: false,
    details: false,
    stats: false,
    analytics: false,
    dispute: false,
    commission: false,
    commissionPayment: false
  },
  
  // Error states
  errors: {
    payments: null,
    process: null,
    refund: null,
    update: null,
    details: null,
    stats: null,
    analytics: null,
    dispute: null,
    commission: null,
    commissionPayment: null
  },
  
  // UI State
  ui: {
    showProcessModal: false,
    showRefundModal: false,
    showDetailsModal: false,
    showDisputeModal: false,
    showCommissionModal: false,
    selectedPaymentForAction: null,
    processForm: {
      step: 1,
      totalSteps: 3
    },
    refundForm: {
      amount: '',
      reason: '',
      fullRefund: true
    },
    detailsTab: 'general', // general, transactions, refunds, disputes
    autoRefresh: false,
    refreshInterval: 180000, // 3 minutes
    viewMode: 'list' // list, analytics, commissions
  }
};

// ====== SLICE ======

const ownerPaymentsSlice = createSlice({
  name: 'ownerPayments',
  initialState,
  reducers: {
    // Pagination
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1; // Reset to first page
    },
    
    // Filters
    setStatus: (state, action) => {
      state.filters.status = action.payload;
      state.pagination.page = 1; // Reset to first page
    },
    
    setMethod: (state, action) => {
      state.filters.method = action.payload;
      state.pagination.page = 1; // Reset to first page
    },
    
    setBusinessId: (state, action) => {
      state.filters.businessId = action.payload;
      state.pagination.page = 1; // Reset to first page
    },
    
    setSubscriptionId: (state, action) => {
      state.filters.subscriptionId = action.payload;
      state.pagination.page = 1; // Reset to first page
    },
    
    setDateRange: (state, action) => {
      const { startDate, endDate } = action.payload;
      state.filters.startDate = startDate;
      state.filters.endDate = endDate;
      state.pagination.page = 1; // Reset to first page
    },
    
    setAmountRange: (state, action) => {
      const { minAmount, maxAmount } = action.payload;
      state.filters.minAmount = minAmount;
      state.filters.maxAmount = maxAmount;
      state.pagination.page = 1; // Reset to first page
    },
    
    setCurrency: (state, action) => {
      state.filters.currency = action.payload;
      state.pagination.page = 1; // Reset to first page
    },
    
    setSorting: (state, action) => {
      const { sortBy, sortOrder } = action.payload;
      state.filters.sortBy = sortBy;
      state.filters.sortOrder = sortOrder;
      state.pagination.page = 1; // Reset to first page
    },
    
    clearFilters: (state) => {
      state.filters = {
        status: '',
        method: '',
        businessId: '',
        subscriptionId: '',
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: '',
        currency: 'COP',
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      };
      state.pagination.page = 1;
    },
    
    // UI actions
    openProcessModal: (state) => {
      state.ui.showProcessModal = true;
      state.ui.processForm.step = 1;
    },
    
    closeProcessModal: (state) => {
      state.ui.showProcessModal = false;
      state.ui.processForm.step = 1;
    },
    
    setProcessFormStep: (state, action) => {
      state.ui.processForm.step = action.payload;
    },
    
    nextProcessStep: (state) => {
      if (state.ui.processForm.step < state.ui.processForm.totalSteps) {
        state.ui.processForm.step += 1;
      }
    },
    
    prevProcessStep: (state) => {
      if (state.ui.processForm.step > 1) {
        state.ui.processForm.step -= 1;
      }
    },
    
    openRefundModal: (state, action) => {
      state.ui.showRefundModal = true;
      state.ui.selectedPaymentForAction = action.payload;
      state.ui.refundForm.amount = action.payload?.amount || '';
      state.ui.refundForm.reason = '';
      state.ui.refundForm.fullRefund = true;
    },
    
    closeRefundModal: (state) => {
      state.ui.showRefundModal = false;
      state.ui.selectedPaymentForAction = null;
      state.ui.refundForm = {
        amount: '',
        reason: '',
        fullRefund: true
      };
    },
    
    setRefundForm: (state, action) => {
      state.ui.refundForm = { ...state.ui.refundForm, ...action.payload };
    },
    
    openDetailsModal: (state, action) => {
      state.ui.showDetailsModal = true;
      state.selectedPayment = action.payload;
      state.ui.detailsTab = 'general';
    },
    
    closeDetailsModal: (state) => {
      state.ui.showDetailsModal = false;
      state.selectedPayment = null;
      state.ui.detailsTab = 'general';
    },
    
    setDetailsTab: (state, action) => {
      state.ui.detailsTab = action.payload;
    },
    
    openDisputeModal: (state, action) => {
      state.ui.showDisputeModal = true;
      state.ui.selectedPaymentForAction = action.payload;
    },
    
    closeDisputeModal: (state) => {
      state.ui.showDisputeModal = false;
      state.ui.selectedPaymentForAction = null;
    },
    
    openCommissionModal: (state) => {
      state.ui.showCommissionModal = true;
    },
    
    closeCommissionModal: (state) => {
      state.ui.showCommissionModal = false;
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
    
    // Payment management
    selectPayment: (state, action) => {
      state.selectedPayment = action.payload;
    },
    
    updatePaymentInList: (state, action) => {
      const updatedPayment = action.payload;
      const index = state.payments.findIndex(p => p.id === updatedPayment.id);
      if (index !== -1) {
        state.payments[index] = { ...state.payments[index], ...updatedPayment };
      }
    },
    
    removePaymentFromList: (state, action) => {
      const paymentId = action.payload;
      state.payments = state.payments.filter(p => p.id !== paymentId);
    },
    
    // Error handling
    clearErrors: (state) => {
      state.errors = {
        payments: null,
        process: null,
        refund: null,
        update: null,
        details: null,
        stats: null,
        analytics: null,
        dispute: null,
        commission: null,
        commissionPayment: null
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
    // ====== FETCH ALL PAYMENTS ======
    builder
      .addCase(fetchAllPayments.pending, (state) => {
        state.loading.payments = true;
        state.errors.payments = null;
      })
      .addCase(fetchAllPayments.fulfilled, (state, action) => {
        state.loading.payments = false;
        state.payments = action.payload.payments;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.loading.payments = false;
        state.errors.payments = action.payload;
      })
      
    // ====== PROCESS PAYMENT ======
      .addCase(processPayment.pending, (state) => {
        state.loading.processing = true;
        state.errors.process = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.loading.processing = false;
        // Add new payment to the beginning of the list
        state.payments.unshift(action.payload);
        // Close modal
        state.ui.showProcessModal = false;
        state.ui.processForm.step = 1;
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading.processing = false;
        state.errors.process = action.payload;
      })
      
    // ====== PROCESS REFUND ======
      .addCase(processRefund.pending, (state) => {
        state.loading.refunding = true;
        state.errors.refund = null;
      })
      .addCase(processRefund.fulfilled, (state, action) => {
        state.loading.refunding = false;
        const updatedPayment = action.payload;
        
        // Update payment in list
        const index = state.payments.findIndex(p => p.id === updatedPayment.id);
        if (index !== -1) {
          state.payments[index] = { ...state.payments[index], ...updatedPayment };
        }
        
        // Update selected payment if it's the same
        if (state.selectedPayment?.id === updatedPayment.id) {
          state.selectedPayment = { ...state.selectedPayment, ...updatedPayment };
        }
        
        // Close modal
        state.ui.showRefundModal = false;
        state.ui.selectedPaymentForAction = null;
        state.ui.refundForm = {
          amount: '',
          reason: '',
          fullRefund: true
        };
      })
      .addCase(processRefund.rejected, (state, action) => {
        state.loading.refunding = false;
        state.errors.refund = action.payload;
      })
      
    // ====== UPDATE PAYMENT STATUS ======
      .addCase(updatePaymentStatus.pending, (state) => {
        state.loading.updating = true;
        state.errors.update = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.loading.updating = false;
        const updatedPayment = action.payload;
        
        // Update payment in list
        const index = state.payments.findIndex(p => p.id === updatedPayment.id);
        if (index !== -1) {
          state.payments[index] = { ...state.payments[index], ...updatedPayment };
        }
        
        // Update selected payment if it's the same
        if (state.selectedPayment?.id === updatedPayment.id) {
          state.selectedPayment = { ...state.selectedPayment, ...updatedPayment };
        }
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.loading.updating = false;
        state.errors.update = action.payload;
      })
      
    // ====== GET PAYMENT DETAILS ======
      .addCase(getPaymentDetails.pending, (state) => {
        state.loading.details = true;
        state.errors.details = null;
      })
      .addCase(getPaymentDetails.fulfilled, (state, action) => {
        state.loading.details = false;
        state.selectedPayment = action.payload;
      })
      .addCase(getPaymentDetails.rejected, (state, action) => {
        state.loading.details = false;
        state.errors.details = action.payload;
      })
      
    // ====== GET PAYMENT STATS ======
      .addCase(getPaymentStats.pending, (state) => {
        state.loading.stats = true;
        state.errors.stats = null;
      })
      .addCase(getPaymentStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.paymentStats = action.payload;
      })
      .addCase(getPaymentStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.errors.stats = action.payload;
      })
      
    // ====== GET REVENUE ANALYTICS ======
      .addCase(getRevenueAnalytics.pending, (state) => {
        state.loading.analytics = true;
        state.errors.analytics = null;
      })
      .addCase(getRevenueAnalytics.fulfilled, (state, action) => {
        state.loading.analytics = false;
        state.revenueAnalytics = action.payload;
      })
      .addCase(getRevenueAnalytics.rejected, (state, action) => {
        state.loading.analytics = false;
        state.errors.analytics = action.payload;
      })
      
    // ====== HANDLE PAYMENT DISPUTE ======
      .addCase(handlePaymentDispute.pending, (state) => {
        state.loading.dispute = true;
        state.errors.dispute = null;
      })
      .addCase(handlePaymentDispute.fulfilled, (state, action) => {
        state.loading.dispute = false;
        const updatedPayment = action.payload;
        
        // Update payment in list
        const index = state.payments.findIndex(p => p.id === updatedPayment.id);
        if (index !== -1) {
          state.payments[index] = { ...state.payments[index], ...updatedPayment };
        }
        
        // Update selected payment if it's the same
        if (state.selectedPayment?.id === updatedPayment.id) {
          state.selectedPayment = { ...state.selectedPayment, ...updatedPayment };
        }
        
        // Close modal
        state.ui.showDisputeModal = false;
        state.ui.selectedPaymentForAction = null;
      })
      .addCase(handlePaymentDispute.rejected, (state, action) => {
        state.loading.dispute = false;
        state.errors.dispute = action.payload;
      })
      
    // ====== GET COMMISSION DETAILS ======
      .addCase(getCommissionDetails.pending, (state) => {
        state.loading.commission = true;
        state.errors.commission = null;
      })
      .addCase(getCommissionDetails.fulfilled, (state, action) => {
        state.loading.commission = false;
        state.commissionDetails = action.payload;
      })
      .addCase(getCommissionDetails.rejected, (state, action) => {
        state.loading.commission = false;
        state.errors.commission = action.payload;
      })
      
    // ====== PROCESS COMMISSION PAYMENT ======
      .addCase(processCommissionPayment.pending, (state) => {
        state.loading.commissionPayment = true;
        state.errors.commissionPayment = null;
      })
      .addCase(processCommissionPayment.fulfilled, (state, action) => {
        state.loading.commissionPayment = false;
        // Update commission details if needed
        const updatedCommission = action.payload;
        const index = state.commissionDetails.findIndex(c => c.id === updatedCommission.id);
        if (index !== -1) {
          state.commissionDetails[index] = updatedCommission;
        }
        
        // Close modal
        state.ui.showCommissionModal = false;
      })
      .addCase(processCommissionPayment.rejected, (state, action) => {
        state.loading.commissionPayment = false;
        state.errors.commissionPayment = action.payload;
      });
  }
});

// ====== ACTIONS EXPORT ======
export const {
  setPage,
  setLimit,
  setStatus,
  setMethod,
  setBusinessId,
  setSubscriptionId,
  setDateRange,
  setAmountRange,
  setCurrency,
  setSorting,
  clearFilters,
  openProcessModal,
  closeProcessModal,
  setProcessFormStep,
  nextProcessStep,
  prevProcessStep,
  openRefundModal,
  closeRefundModal,
  setRefundForm,
  openDetailsModal,
  closeDetailsModal,
  setDetailsTab,
  openDisputeModal,
  closeDisputeModal,
  openCommissionModal,
  closeCommissionModal,
  setViewMode,
  toggleAutoRefresh,
  setRefreshInterval,
  selectPayment,
  updatePaymentInList,
  removePaymentFromList,
  clearErrors,
  clearError,
  reset
} = ownerPaymentsSlice.actions;

// ====== SELECTORS ======
export const selectPayments = (state) => state.ownerPayments.payments;
export const selectSelectedPayment = (state) => state.ownerPayments.selectedPayment;
export const selectPaymentStats = (state) => state.ownerPayments.paymentStats;
export const selectRevenueAnalytics = (state) => state.ownerPayments.revenueAnalytics;
export const selectCommissionDetails = (state) => state.ownerPayments.commissionDetails;
export const selectPaymentsPagination = (state) => state.ownerPayments.pagination;
export const selectPaymentsFilters = (state) => state.ownerPayments.filters;
export const selectPaymentsLoading = (state) => state.ownerPayments.loading;
export const selectPaymentsErrors = (state) => state.ownerPayments.errors;
export const selectPaymentsUI = (state) => state.ownerPayments.ui;

export default ownerPaymentsSlice.reducer;