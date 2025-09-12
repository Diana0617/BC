/**
 * Hook personalizado para la Gestión de Negocios del Owner
 * Proporciona acceso fácil a todas las funcionalidades de gestión de negocios
 */

import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect, useMemo } from 'react';
import {
  // Actions
  fetchAllBusinesses,
  createBusinessManually,
  toggleBusinessStatus,
  getBusinessDetails,
  updateBusinessInfo,
  getBusinessStats,
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
  reset,
  
  // Selectors
  selectBusinesses,
  selectSelectedBusiness,
  selectBusinessStats,
  selectBusinessesPagination,
  selectBusinessesFilters,
  selectBusinessesLoading,
  selectBusinessesErrors,
  selectBusinessesUI
} from '../store/slices/ownerBusinessSlice';

export const useOwnerBusinesses = () => {
  const dispatch = useDispatch();

  // ====== SELECTORS ======
  const businesses = useSelector(selectBusinesses);
  const selectedBusiness = useSelector(selectSelectedBusiness);
  const businessStats = useSelector(selectBusinessStats);
  const pagination = useSelector(selectBusinessesPagination);
  const filters = useSelector(selectBusinessesFilters);
  const loading = useSelector(selectBusinessesLoading);
  const errors = useSelector(selectBusinessesErrors);
  const ui = useSelector(selectBusinessesUI);

  // ====== ACTIONS ======
  const actions = useMemo(() => ({
    // Data fetching
    fetchBusinesses: (params) => dispatch(fetchAllBusinesses(params)),
    createBusiness: (businessData) => dispatch(createBusinessManually(businessData)),
    changeBusinessStatus: (businessId, status, reason) => 
      dispatch(toggleBusinessStatus({ businessId, status, reason })),
    getDetails: (businessId) => dispatch(getBusinessDetails(businessId)),
    updateBusiness: (businessId, updateData) => 
      dispatch(updateBusinessInfo({ businessId, updateData })),
    getStats: () => dispatch(getBusinessStats()),
    
    // Pagination
    setPage: (page) => dispatch(setPage(page)),
    setLimit: (limit) => dispatch(setLimit(limit)),
    
    // Filters
    setStatus: (status) => dispatch(setStatus(status)),
    setSearch: (search) => dispatch(setSearch(search)),
    setSorting: (sortBy, sortOrder) => dispatch(setSorting({ sortBy, sortOrder })),
    clearFilters: () => dispatch(clearFilters()),
    
    // UI actions
    openCreateModal: () => dispatch(openCreateModal()),
    closeCreateModal: () => dispatch(closeCreateModal()),
    setCreateFormStep: (step) => dispatch(setCreateFormStep(step)),
    nextCreateStep: () => dispatch(nextCreateStep()),
    prevCreateStep: () => dispatch(prevCreateStep()),
    openDetailsModal: (business) => dispatch(openDetailsModal(business)),
    closeDetailsModal: () => dispatch(closeDetailsModal()),
    setDetailsTab: (tab) => dispatch(setDetailsTab(tab)),
    openStatusChangeModal: (business) => dispatch(openStatusChangeModal(business)),
    closeStatusChangeModal: () => dispatch(closeStatusChangeModal()),
    toggleAutoRefresh: () => dispatch(toggleAutoRefresh()),
    setRefreshInterval: (interval) => dispatch(setRefreshInterval(interval)),
    
    // Business management
    selectBusiness: (business) => dispatch(selectBusiness(business)),
    updateBusinessInList: (business) => dispatch(updateBusinessInList(business)),
    removeBusinessFromList: (businessId) => dispatch(removeBusinessFromList(businessId)),
    
    // Error handling
    clearErrors: () => dispatch(clearErrors()),
    clearError: (errorType) => dispatch(clearError(errorType)),
    
    // Reset
    reset: () => dispatch(reset())
  }), [dispatch]);

  // ====== COMPUTED VALUES ======
  const computed = useMemo(() => ({
    // Pagination info
    hasNextPage: pagination.page < pagination.totalPages,
    hasPrevPage: pagination.page > 1,
    totalBusinesses: pagination.totalItems,
    currentPage: pagination.page,
    totalPages: pagination.totalPages,
    
    // Filter info
    hasActiveFilters: !!(filters.status || filters.search),
    isFiltered: filters.status !== '' || filters.search !== '',
    
    // Business data
    hasBusinesses: businesses.length > 0,
    businessCount: businesses.length,
    
    // Status distribution
    statusCounts: businesses.reduce((acc, business) => {
      acc[business.status] = (acc[business.status] || 0) + 1;
      return acc;
    }, {}),
    
    // Active businesses
    activeBusinesses: businesses.filter(b => b.status === 'ACTIVE'),
    inactiveBusinesses: businesses.filter(b => b.status === 'INACTIVE'),
    suspendedBusinesses: businesses.filter(b => b.status === 'SUSPENDED'),
    
    // Loading states
    isAnyLoading: Object.values(loading).some(l => l),
    isLoadingBusinesses: loading.businesses,
    isCreating: loading.creating,
    isUpdating: loading.updating,
    isChangingStatus: loading.changingStatus,
    
    // Error states
    hasErrors: Object.values(errors).some(e => e !== null),
    hasBusinessesError: !!errors.businesses,
    hasCreateError: !!errors.create,
    hasUpdateError: !!errors.update,
    hasStatusError: !!errors.status,
    
    // UI states
    isCreateModalOpen: ui.showCreateModal,
    isDetailsModalOpen: ui.showDetailsModal,
    isStatusChangeModalOpen: ui.showStatusChangeModal,
    currentCreateStep: ui.createForm.step,
    totalCreateSteps: ui.createForm.totalSteps,
    canGoNextStep: ui.createForm.step < ui.createForm.totalSteps,
    canGoPrevStep: ui.createForm.step > 1,
    currentDetailsTab: ui.detailsTab,
    
    // Business being modified
    businessForStatusChange: ui.selectedBusinessForStatus,
    
    // Selected business info
    hasSelectedBusiness: !!selectedBusiness,
    selectedBusinessId: selectedBusiness?.id,
    selectedBusinessName: selectedBusiness?.name,
    selectedBusinessStatus: selectedBusiness?.status,
    
    // Stats info
    hasStats: !!businessStats,
    
    // Auto refresh
    isAutoRefreshEnabled: ui.autoRefresh,
    refreshInterval: ui.refreshInterval
  }), [
    businesses, 
    selectedBusiness, 
    businessStats, 
    pagination, 
    filters, 
    loading, 
    errors, 
    ui
  ]);

  // ====== HELPERS ======
  const helpers = useMemo(() => ({
    // Load businesses with current filters
    loadBusinesses: async () => {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      await actions.fetchBusinesses(params);
    },

    // Refresh current page
    refresh: async () => {
      await helpers.loadBusinesses();
    },

    // Load businesses with new params
    loadWithParams: async (newParams) => {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        ...newParams
      };
      await actions.fetchBusinesses(params);
    },

    // Go to specific page
    goToPage: async (page) => {
      actions.setPage(page);
      await helpers.loadWithParams({ page });
    },

    // Go to next page
    nextPage: async () => {
      if (computed.hasNextPage) {
        await helpers.goToPage(pagination.page + 1);
      }
    },

    // Go to previous page
    prevPage: async () => {
      if (computed.hasPrevPage) {
        await helpers.goToPage(pagination.page - 1);
      }
    },

    // Change page size
    changePageSize: async (newLimit) => {
      actions.setLimit(newLimit);
      await helpers.loadWithParams({ page: 1, limit: newLimit });
    },

    // Search businesses
    searchBusinesses: async (searchTerm) => {
      actions.setSearch(searchTerm);
      await helpers.loadWithParams({ page: 1, search: searchTerm });
    },

    // Filter by status
    filterByStatus: async (status) => {
      actions.setStatus(status);
      await helpers.loadWithParams({ page: 1, status });
    },

    // Sort businesses
    sortBusinesses: async (sortBy, sortOrder = 'DESC') => {
      actions.setSorting(sortBy, sortOrder);
      await helpers.loadWithParams({ page: 1, sortBy, sortOrder });
    },

    // Clear all filters and reload
    clearAllFilters: async () => {
      actions.clearFilters();
      await helpers.loadWithParams({ 
        page: 1, 
        status: '', 
        search: '', 
        sortBy: 'createdAt', 
        sortOrder: 'DESC' 
      });
    },

    // Business status helpers
    activateBusiness: async (businessId, reason = 'Activado por administrador') => {
      await actions.changeBusinessStatus(businessId, 'ACTIVE', reason);
    },

    deactivateBusiness: async (businessId, reason = 'Desactivado por administrador') => {
      await actions.changeBusinessStatus(businessId, 'INACTIVE', reason);
    },

    suspendBusiness: async (businessId, reason = 'Suspendido por administrador') => {
      await actions.changeBusinessStatus(businessId, 'SUSPENDED', reason);
    },

    // Modal helpers
    viewBusinessDetails: (business) => {
      actions.openDetailsModal(business);
      actions.getDetails(business.id);
    },

    editBusiness: (business) => {
      actions.selectBusiness(business);
      actions.openDetailsModal(business);
      actions.setDetailsTab('general');
    },

    changeBusinessStatusModal: (business) => {
      actions.openStatusChangeModal(business);
    },

    // Create business helpers
    startBusinessCreation: () => {
      actions.openCreateModal();
    },

    cancelBusinessCreation: () => {
      actions.closeCreateModal();
    },

    goToNextCreateStep: () => {
      actions.nextCreateStep();
    },

    goToPrevCreateStep: () => {
      actions.prevCreateStep();
    },

    completeBusinessCreation: async (businessData) => {
      await actions.createBusiness(businessData);
    },

    // Format helpers
    formatBusinessStatus: (status) => {
      const statusMap = {
        'ACTIVE': { label: 'Activo', color: 'green' },
        'INACTIVE': { label: 'Inactivo', color: 'gray' },
        'SUSPENDED': { label: 'Suspendido', color: 'red' },
        'TRIAL': { label: 'Prueba', color: 'blue' }
      };
      return statusMap[status] || { label: status, color: 'gray' };
    },

    formatDate: (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    formatDateTime: (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    // Error helpers
    getError: (errorType) => {
      return errors[errorType];
    },

    clearSpecificError: (errorType) => {
      actions.clearError(errorType);
    },

    // Business selection helpers
    isBusinessSelected: (businessId) => {
      return selectedBusiness?.id === businessId;
    },

    getBusinessById: (businessId) => {
      return businesses.find(b => b.id === businessId);
    },

    getBusinessesByStatus: (status) => {
      return businesses.filter(b => b.status === status);
    }
  }), [actions, pagination, filters, computed, errors, businesses, selectedBusiness]);

  // ====== AUTO REFRESH EFFECT ======
  useEffect(() => {
    let intervalId;
    
    if (ui.autoRefresh && ui.refreshInterval > 0) {
      intervalId = setInterval(() => {
        helpers.refresh();
      }, ui.refreshInterval);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [ui.autoRefresh, ui.refreshInterval, helpers]);

  return {
    // State
    businesses,
    selectedBusiness,
    businessStats,
    pagination,
    filters,
    
    // Loading states
    loading,
    isLoading: computed.isAnyLoading,
    
    // Error states
    errors,
    hasErrors: computed.hasErrors,
    
    // UI state
    ui,
    
    // Actions
    actions,
    
    // Computed values
    computed,
    
    // Helpers
    helpers
  };
};