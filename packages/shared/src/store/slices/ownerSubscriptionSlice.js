/**
 * Slice de Redux para la Gestión de Suscripciones del Owner
 * Gestiona creación, cancelación y estados de suscripciones
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ownerSubscriptionsApi } from '../../api/ownerSubscriptionsApi';

// ====== ASYNC THUNKS ======

export const fetchAllSubscriptions = createAsyncThunk(
  'ownerSubscriptions/fetchAllSubscriptions',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await ownerSubscriptionsApi.getAllSubscriptions(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar suscripciones');
    }
  }
);

export const createNewSubscription = createAsyncThunk(
  'ownerSubscriptions/createNewSubscription',
  async (subscriptionData, { rejectWithValue }) => {
    try {
      return await ownerSubscriptionsApi.createSubscription(subscriptionData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear suscripción');
    }
  }
);

export const cancelExistingSubscription = createAsyncThunk(
  'ownerSubscriptions/cancelExistingSubscription',
  async ({ subscriptionId, reason }, { rejectWithValue }) => {
    try {
      return await ownerSubscriptionsApi.cancelSubscription(subscriptionId, reason);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cancelar suscripción');
    }
  }
);

export const updateSubscriptionStatus = createAsyncThunk(
  'ownerSubscriptions/updateSubscriptionStatus',
  async ({ subscriptionId, status, reason }, { rejectWithValue }) => {
    try {
      return await ownerSubscriptionsApi.updateSubscriptionStatus(subscriptionId, status, reason);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar estado de suscripción');
    }
  }
);

export const extendSubscription = createAsyncThunk(
  'ownerSubscriptions/extendSubscription',
  async ({ subscriptionId, duration, durationType }, { rejectWithValue }) => {
    try {
      return await ownerSubscriptionsApi.extendSubscription(subscriptionId, duration, durationType);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al extender suscripción');
    }
  }
);

export const getSubscriptionDetails = createAsyncThunk(
  'ownerSubscriptions/getSubscriptionDetails',
  async (subscriptionId, { rejectWithValue }) => {
    try {
      return await ownerSubscriptionsApi.getSubscriptionDetails(subscriptionId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar detalles de suscripción');
    }
  }
);

export const getSubscriptionStats = createAsyncThunk(
  'ownerSubscriptions/getSubscriptionStats',
  async (_, { rejectWithValue }) => {
    try {
      return await ownerSubscriptionsApi.getSubscriptionStats();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar estadísticas de suscripciones');
    }
  }
);

export const renewSubscription = createAsyncThunk(
  'ownerSubscriptions/renewSubscription',
  async ({ subscriptionId, planId }, { rejectWithValue }) => {
    try {
      return await ownerSubscriptionsApi.renewSubscription(subscriptionId, planId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al renovar suscripción');
    }
  }
);

// ====== INITIAL STATE ======

const initialState = {
  // Subscription data
  subscriptions: [],
  selectedSubscription: null,
  subscriptionStats: null,
  
  // Pagination
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 0,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  
  // Filters
  filters: {
    status: '',
    planId: '',
    businessId: '',
    startDate: '',
    endDate: '',
    expiring: false, // próximas a vencer
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  },
  
  // Loading states
  loading: {
    subscriptions: false,
    creating: false,
    updating: false,
    cancelling: false,
    extending: false,
    renewing: false,
    details: false,
    stats: false
  },
  
  // Error states
  errors: {
    subscriptions: null,
    create: null,
    update: null,
    cancel: null,
    extend: null,
    renew: null,
    details: null,
    stats: null
  },
  
  // UI State
  ui: {
    showCreateModal: false,
    showDetailsModal: false,
    showCancelModal: false,
    showExtendModal: false,
    showRenewModal: false,
    selectedSubscriptionForAction: null,
    createForm: {
      step: 1,
      totalSteps: 2
    },
    detailsTab: 'general', // general, payments, history
    autoRefresh: false,
    refreshInterval: 120000 // 2 minutes
  }
};

// ====== SLICE ======

const ownerSubscriptionSlice = createSlice({
  name: 'ownerSubscriptions',
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
    
    setPlanId: (state, action) => {
      state.filters.planId = action.payload;
      state.pagination.page = 1; // Reset to first page
    },
    
    setBusinessId: (state, action) => {
      state.filters.businessId = action.payload;
      state.pagination.page = 1; // Reset to first page
    },
    
    setDateRange: (state, action) => {
      const { startDate, endDate } = action.payload;
      state.filters.startDate = startDate;
      state.filters.endDate = endDate;
      state.pagination.page = 1; // Reset to first page
    },
    
    setExpiring: (state, action) => {
      state.filters.expiring = action.payload;
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
        planId: '',
        businessId: '',
        startDate: '',
        endDate: '',
        expiring: false,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      };
      state.pagination.page = 1;
    },
    
    // UI actions
    openCreateModal: (state) => {
      state.ui.showCreateModal = true;
      state.ui.createForm.step = 1;
    },
    
    closeCreateModal: (state) => {
      state.ui.showCreateModal = false;
      state.ui.createForm.step = 1;
    },
    
    setCreateFormStep: (state, action) => {
      state.ui.createForm.step = action.payload;
    },
    
    nextCreateStep: (state) => {
      if (state.ui.createForm.step < state.ui.createForm.totalSteps) {
        state.ui.createForm.step += 1;
      }
    },
    
    prevCreateStep: (state) => {
      if (state.ui.createForm.step > 1) {
        state.ui.createForm.step -= 1;
      }
    },
    
    openDetailsModal: (state, action) => {
      state.ui.showDetailsModal = true;
      state.selectedSubscription = action.payload;
      state.ui.detailsTab = 'general';
    },
    
    closeDetailsModal: (state) => {
      state.ui.showDetailsModal = false;
      state.selectedSubscription = null;
      state.ui.detailsTab = 'general';
    },
    
    setDetailsTab: (state, action) => {
      state.ui.detailsTab = action.payload;
    },
    
    openCancelModal: (state, action) => {
      state.ui.showCancelModal = true;
      state.ui.selectedSubscriptionForAction = action.payload;
    },
    
    closeCancelModal: (state) => {
      state.ui.showCancelModal = false;
      state.ui.selectedSubscriptionForAction = null;
    },
    
    openExtendModal: (state, action) => {
      state.ui.showExtendModal = true;
      state.ui.selectedSubscriptionForAction = action.payload;
    },
    
    closeExtendModal: (state) => {
      state.ui.showExtendModal = false;
      state.ui.selectedSubscriptionForAction = null;
    },
    
    openRenewModal: (state, action) => {
      state.ui.showRenewModal = true;
      state.ui.selectedSubscriptionForAction = action.payload;
    },
    
    closeRenewModal: (state) => {
      state.ui.showRenewModal = false;
      state.ui.selectedSubscriptionForAction = null;
    },
    
    toggleAutoRefresh: (state) => {
      state.ui.autoRefresh = !state.ui.autoRefresh;
    },
    
    setRefreshInterval: (state, action) => {
      state.ui.refreshInterval = action.payload;
    },
    
    // Subscription management
    selectSubscription: (state, action) => {
      state.selectedSubscription = action.payload;
    },
    
    updateSubscriptionInList: (state, action) => {
      const updatedSubscription = action.payload;
      const index = state.subscriptions.findIndex(s => s.id === updatedSubscription.id);
      if (index !== -1) {
        state.subscriptions[index] = { ...state.subscriptions[index], ...updatedSubscription };
      }
    },
    
    removeSubscriptionFromList: (state, action) => {
      const subscriptionId = action.payload;
      state.subscriptions = state.subscriptions.filter(s => s.id !== subscriptionId);
    },
    
    // Error handling
    clearErrors: (state) => {
      state.errors = {
        subscriptions: null,
        create: null,
        update: null,
        cancel: null,
        extend: null,
        renew: null,
        details: null,
        stats: null
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
    // ====== FETCH ALL SUBSCRIPTIONS ======
    builder
      .addCase(fetchAllSubscriptions.pending, (state) => {
        state.loading.subscriptions = true;
        state.errors.subscriptions = null;
      })
      .addCase(fetchAllSubscriptions.fulfilled, (state, action) => {
        state.loading.subscriptions = false;
        state.subscriptions = action.payload.subscriptions;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllSubscriptions.rejected, (state, action) => {
        state.loading.subscriptions = false;
        state.errors.subscriptions = action.payload;
      })
      
    // ====== CREATE NEW SUBSCRIPTION ======
      .addCase(createNewSubscription.pending, (state) => {
        state.loading.creating = true;
        state.errors.create = null;
      })
      .addCase(createNewSubscription.fulfilled, (state, action) => {
        state.loading.creating = false;
        // Add new subscription to the beginning of the list
        state.subscriptions.unshift(action.payload);
        // Close modal
        state.ui.showCreateModal = false;
        state.ui.createForm.step = 1;
      })
      .addCase(createNewSubscription.rejected, (state, action) => {
        state.loading.creating = false;
        state.errors.create = action.payload;
      })
      
    // ====== CANCEL EXISTING SUBSCRIPTION ======
      .addCase(cancelExistingSubscription.pending, (state) => {
        state.loading.cancelling = true;
        state.errors.cancel = null;
      })
      .addCase(cancelExistingSubscription.fulfilled, (state, action) => {
        state.loading.cancelling = false;
        const updatedSubscription = action.payload;
        
        // Update subscription in list
        const index = state.subscriptions.findIndex(s => s.id === updatedSubscription.id);
        if (index !== -1) {
          state.subscriptions[index] = { ...state.subscriptions[index], ...updatedSubscription };
        }
        
        // Update selected subscription if it's the same
        if (state.selectedSubscription?.id === updatedSubscription.id) {
          state.selectedSubscription = { ...state.selectedSubscription, ...updatedSubscription };
        }
        
        // Close modal
        state.ui.showCancelModal = false;
        state.ui.selectedSubscriptionForAction = null;
      })
      .addCase(cancelExistingSubscription.rejected, (state, action) => {
        state.loading.cancelling = false;
        state.errors.cancel = action.payload;
      })
      
    // ====== UPDATE SUBSCRIPTION STATUS ======
      .addCase(updateSubscriptionStatus.pending, (state) => {
        state.loading.updating = true;
        state.errors.update = null;
      })
      .addCase(updateSubscriptionStatus.fulfilled, (state, action) => {
        state.loading.updating = false;
        const updatedSubscription = action.payload;
        
        // Update subscription in list
        const index = state.subscriptions.findIndex(s => s.id === updatedSubscription.id);
        if (index !== -1) {
          state.subscriptions[index] = { ...state.subscriptions[index], ...updatedSubscription };
        }
        
        // Update selected subscription if it's the same
        if (state.selectedSubscription?.id === updatedSubscription.id) {
          state.selectedSubscription = { ...state.selectedSubscription, ...updatedSubscription };
        }
      })
      .addCase(updateSubscriptionStatus.rejected, (state, action) => {
        state.loading.updating = false;
        state.errors.update = action.payload;
      })
      
    // ====== EXTEND SUBSCRIPTION ======
      .addCase(extendSubscription.pending, (state) => {
        state.loading.extending = true;
        state.errors.extend = null;
      })
      .addCase(extendSubscription.fulfilled, (state, action) => {
        state.loading.extending = false;
        const updatedSubscription = action.payload;
        
        // Update subscription in list
        const index = state.subscriptions.findIndex(s => s.id === updatedSubscription.id);
        if (index !== -1) {
          state.subscriptions[index] = { ...state.subscriptions[index], ...updatedSubscription };
        }
        
        // Update selected subscription if it's the same
        if (state.selectedSubscription?.id === updatedSubscription.id) {
          state.selectedSubscription = { ...state.selectedSubscription, ...updatedSubscription };
        }
        
        // Close modal
        state.ui.showExtendModal = false;
        state.ui.selectedSubscriptionForAction = null;
      })
      .addCase(extendSubscription.rejected, (state, action) => {
        state.loading.extending = false;
        state.errors.extend = action.payload;
      })
      
    // ====== RENEW SUBSCRIPTION ======
      .addCase(renewSubscription.pending, (state) => {
        state.loading.renewing = true;
        state.errors.renew = null;
      })
      .addCase(renewSubscription.fulfilled, (state, action) => {
        state.loading.renewing = false;
        const renewedSubscription = action.payload;
        
        // Add or update subscription in list
        const index = state.subscriptions.findIndex(s => s.id === renewedSubscription.id);
        if (index !== -1) {
          state.subscriptions[index] = renewedSubscription;
        } else {
          state.subscriptions.unshift(renewedSubscription);
        }
        
        // Close modal
        state.ui.showRenewModal = false;
        state.ui.selectedSubscriptionForAction = null;
      })
      .addCase(renewSubscription.rejected, (state, action) => {
        state.loading.renewing = false;
        state.errors.renew = action.payload;
      })
      
    // ====== GET SUBSCRIPTION DETAILS ======
      .addCase(getSubscriptionDetails.pending, (state) => {
        state.loading.details = true;
        state.errors.details = null;
      })
      .addCase(getSubscriptionDetails.fulfilled, (state, action) => {
        state.loading.details = false;
        state.selectedSubscription = action.payload;
      })
      .addCase(getSubscriptionDetails.rejected, (state, action) => {
        state.loading.details = false;
        state.errors.details = action.payload;
      })
      
    // ====== GET SUBSCRIPTION STATS ======
      .addCase(getSubscriptionStats.pending, (state) => {
        state.loading.stats = true;
        state.errors.stats = null;
      })
      .addCase(getSubscriptionStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.subscriptionStats = action.payload;
      })
      .addCase(getSubscriptionStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.errors.stats = action.payload;
      });
  }
});

// ====== ACTIONS EXPORT ======
export const {
  setPage,
  setLimit,
  setStatus,
  setPlanId,
  setBusinessId,
  setDateRange,
  setExpiring,
  setSorting,
  clearFilters,
  openCreateModal,
  closeCreateModal,
  setCreateFormStep,
  nextCreateStep,
  prevCreateStep,
  openDetailsModal,
  closeDetailsModal,
  setDetailsTab,
  openCancelModal,
  closeCancelModal,
  openExtendModal,
  closeExtendModal,
  openRenewModal,
  closeRenewModal,
  toggleAutoRefresh,
  setRefreshInterval,
  selectSubscription,
  updateSubscriptionInList,
  removeSubscriptionFromList,
  clearErrors,
  clearError,
  reset
} = ownerSubscriptionSlice.actions;

// ====== SELECTORS ======
export const selectSubscriptions = (state) => state.ownerSubscriptions.subscriptions;
export const selectSelectedSubscription = (state) => state.ownerSubscriptions.selectedSubscription;
export const selectSubscriptionStats = (state) => state.ownerSubscriptions.subscriptionStats;
export const selectSubscriptionsPagination = (state) => state.ownerSubscriptions.pagination;
export const selectSubscriptionsFilters = (state) => state.ownerSubscriptions.filters;
export const selectSubscriptionsLoading = (state) => state.ownerSubscriptions.loading;
export const selectSubscriptionsErrors = (state) => state.ownerSubscriptions.errors;
export const selectSubscriptionsUI = (state) => state.ownerSubscriptions.ui;

export default ownerSubscriptionSlice.reducer;