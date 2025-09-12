/**
 * Slice de Redux para la Gestión de Negocios del Owner
 * Gestiona listado, creación, activación/desactivación de negocios
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ownerBusinessesApi } from '../../api/ownerBusinessesApi';

// ====== ASYNC THUNKS ======

export const fetchAllBusinesses = createAsyncThunk(
  'ownerBusinesses/fetchAllBusinesses',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await ownerBusinessesApi.getAllBusinesses(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar negocios');
    }
  }
);

export const createBusinessManually = createAsyncThunk(
  'ownerBusinesses/createBusinessManually',
  async (businessData, { rejectWithValue }) => {
    try {
      return await ownerBusinessesApi.createBusinessManually(businessData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear negocio');
    }
  }
);

export const toggleBusinessStatus = createAsyncThunk(
  'ownerBusinesses/toggleBusinessStatus',
  async ({ businessId, status, reason }, { rejectWithValue }) => {
    try {
      return await ownerBusinessesApi.toggleBusinessStatus(businessId, status, reason);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cambiar estado del negocio');
    }
  }
);

export const getBusinessDetails = createAsyncThunk(
  'ownerBusinesses/getBusinessDetails',
  async (businessId, { rejectWithValue }) => {
    try {
      return await ownerBusinessesApi.getBusinessDetails(businessId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar detalles del negocio');
    }
  }
);

export const updateBusinessInfo = createAsyncThunk(
  'ownerBusinesses/updateBusinessInfo',
  async ({ businessId, updateData }, { rejectWithValue }) => {
    try {
      return await ownerBusinessesApi.updateBusinessInfo(businessId, updateData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar negocio');
    }
  }
);

export const getBusinessStats = createAsyncThunk(
  'ownerBusinesses/getBusinessStats',
  async (_, { rejectWithValue }) => {
    try {
      return await ownerBusinessesApi.getBusinessStats();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar estadísticas de negocios');
    }
  }
);

// ====== INITIAL STATE ======

const initialState = {
  // Business data
  businesses: [],
  selectedBusiness: null,
  businessStats: null,
  
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
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  },
  
  // Loading states
  loading: {
    businesses: false,
    creating: false,
    updating: false,
    changingStatus: false,
    details: false,
    stats: false
  },
  
  // Error states
  errors: {
    businesses: null,
    create: null,
    update: null,
    status: null,
    details: null,
    stats: null
  },
  
  // UI State
  ui: {
    showCreateModal: false,
    showDetailsModal: false,
    showStatusChangeModal: false,
    selectedBusinessForStatus: null,
    createForm: {
      step: 1,
      totalSteps: 3
    },
    detailsTab: 'general', // general, subscription, users, activity
    autoRefresh: false,
    refreshInterval: 60000 // 1 minute
  }
};

// ====== SLICE ======

const ownerBusinessesSlice = createSlice({
  name: 'ownerBusinesses',
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
    
    setSearch: (state, action) => {
      state.filters.search = action.payload;
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
        search: '',
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
      state.selectedBusiness = action.payload;
      state.ui.detailsTab = 'general';
    },
    
    closeDetailsModal: (state) => {
      state.ui.showDetailsModal = false;
      state.selectedBusiness = null;
      state.ui.detailsTab = 'general';
    },
    
    setDetailsTab: (state, action) => {
      state.ui.detailsTab = action.payload;
    },
    
    openStatusChangeModal: (state, action) => {
      state.ui.showStatusChangeModal = true;
      state.ui.selectedBusinessForStatus = action.payload;
    },
    
    closeStatusChangeModal: (state) => {
      state.ui.showStatusChangeModal = false;
      state.ui.selectedBusinessForStatus = null;
    },
    
    toggleAutoRefresh: (state) => {
      state.ui.autoRefresh = !state.ui.autoRefresh;
    },
    
    setRefreshInterval: (state, action) => {
      state.ui.refreshInterval = action.payload;
    },
    
    // Business management
    selectBusiness: (state, action) => {
      state.selectedBusiness = action.payload;
    },
    
    updateBusinessInList: (state, action) => {
      const updatedBusiness = action.payload;
      const index = state.businesses.findIndex(b => b.id === updatedBusiness.id);
      if (index !== -1) {
        state.businesses[index] = { ...state.businesses[index], ...updatedBusiness };
      }
    },
    
    removeBusinessFromList: (state, action) => {
      const businessId = action.payload;
      state.businesses = state.businesses.filter(b => b.id !== businessId);
    },
    
    // Error handling
    clearErrors: (state) => {
      state.errors = {
        businesses: null,
        create: null,
        update: null,
        status: null,
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
    // ====== FETCH ALL BUSINESSES ======
    builder
      .addCase(fetchAllBusinesses.pending, (state) => {
        state.loading.businesses = true;
        state.errors.businesses = null;
      })
      .addCase(fetchAllBusinesses.fulfilled, (state, action) => {
        state.loading.businesses = false;
        state.businesses = action.payload.businesses;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllBusinesses.rejected, (state, action) => {
        state.loading.businesses = false;
        state.errors.businesses = action.payload;
      })
      
    // ====== CREATE BUSINESS MANUALLY ======
      .addCase(createBusinessManually.pending, (state) => {
        state.loading.creating = true;
        state.errors.create = null;
      })
      .addCase(createBusinessManually.fulfilled, (state, action) => {
        state.loading.creating = false;
        // Add new business to the beginning of the list
        state.businesses.unshift(action.payload.business);
        // Close modal
        state.ui.showCreateModal = false;
        state.ui.createForm.step = 1;
      })
      .addCase(createBusinessManually.rejected, (state, action) => {
        state.loading.creating = false;
        state.errors.create = action.payload;
      })
      
    // ====== TOGGLE BUSINESS STATUS ======
      .addCase(toggleBusinessStatus.pending, (state) => {
        state.loading.changingStatus = true;
        state.errors.status = null;
      })
      .addCase(toggleBusinessStatus.fulfilled, (state, action) => {
        state.loading.changingStatus = false;
        const updatedBusiness = action.payload;
        
        // Update business in list
        const index = state.businesses.findIndex(b => b.id === updatedBusiness.id);
        if (index !== -1) {
          state.businesses[index] = { ...state.businesses[index], ...updatedBusiness };
        }
        
        // Update selected business if it's the same
        if (state.selectedBusiness?.id === updatedBusiness.id) {
          state.selectedBusiness = { ...state.selectedBusiness, ...updatedBusiness };
        }
        
        // Close modal
        state.ui.showStatusChangeModal = false;
        state.ui.selectedBusinessForStatus = null;
      })
      .addCase(toggleBusinessStatus.rejected, (state, action) => {
        state.loading.changingStatus = false;
        state.errors.status = action.payload;
      })
      
    // ====== GET BUSINESS DETAILS ======
      .addCase(getBusinessDetails.pending, (state) => {
        state.loading.details = true;
        state.errors.details = null;
      })
      .addCase(getBusinessDetails.fulfilled, (state, action) => {
        state.loading.details = false;
        state.selectedBusiness = action.payload;
      })
      .addCase(getBusinessDetails.rejected, (state, action) => {
        state.loading.details = false;
        state.errors.details = action.payload;
      })
      
    // ====== UPDATE BUSINESS INFO ======
      .addCase(updateBusinessInfo.pending, (state) => {
        state.loading.updating = true;
        state.errors.update = null;
      })
      .addCase(updateBusinessInfo.fulfilled, (state, action) => {
        state.loading.updating = false;
        const updatedBusiness = action.payload;
        
        // Update business in list
        const index = state.businesses.findIndex(b => b.id === updatedBusiness.id);
        if (index !== -1) {
          state.businesses[index] = { ...state.businesses[index], ...updatedBusiness };
        }
        
        // Update selected business
        if (state.selectedBusiness?.id === updatedBusiness.id) {
          state.selectedBusiness = { ...state.selectedBusiness, ...updatedBusiness };
        }
      })
      .addCase(updateBusinessInfo.rejected, (state, action) => {
        state.loading.updating = false;
        state.errors.update = action.payload;
      })
      
    // ====== GET BUSINESS STATS ======
      .addCase(getBusinessStats.pending, (state) => {
        state.loading.stats = true;
        state.errors.stats = null;
      })
      .addCase(getBusinessStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.businessStats = action.payload;
      })
      .addCase(getBusinessStats.rejected, (state, action) => {
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
  setSearch,
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
  openStatusChangeModal,
  closeStatusChangeModal,
  toggleAutoRefresh,
  setRefreshInterval,
  selectBusiness,
  updateBusinessInList,
  removeBusinessFromList,
  clearErrors,
  clearError,
  reset
} = ownerBusinessesSlice.actions;

// ====== SELECTORS ======
export const selectBusinesses = (state) => state.ownerBusinesses.businesses;
export const selectSelectedBusiness = (state) => state.ownerBusinesses.selectedBusiness;
export const selectBusinessStats = (state) => state.ownerBusinesses.businessStats;
export const selectBusinessesPagination = (state) => state.ownerBusinesses.pagination;
export const selectBusinessesFilters = (state) => state.ownerBusinesses.filters;
export const selectBusinessesLoading = (state) => state.ownerBusinesses.loading;
export const selectBusinessesErrors = (state) => state.ownerBusinesses.errors;
export const selectBusinessesUI = (state) => state.ownerBusinesses.ui;

export default ownerBusinessesSlice.reducer;