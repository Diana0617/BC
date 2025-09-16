import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchOwnerPlans,
  fetchOwnerPlanById,
  createOwnerPlan,
  updateOwnerPlan,
  toggleOwnerPlanStatus,
  fetchOwnerPlanStats,
  deleteOwnerPlan,
  setFilters,
  resetFilters,
  setSearch,
  setPage,
  setShowCreateModal,
  setShowEditModal,
  setShowDeleteModal,
  setShowViewModal,
  setEditingPlan,
  clearErrors,
  clearSelectedPlan,
  resetOwnerPlans,
  validatePlansState
} from '../store/slices/ownerPlansSlice';

/**
 * Hook personalizado para gestión de planes (OWNER)
 */
export const useOwnerPlans = () => {
  const dispatch = useDispatch();
  
  // Selectors
  const {
    plans,
    totalPlans,
    selectedPlan,
    selectedPlanStats,
    pagination,
    filters,
    loading,
    selectedPlanLoading,
    createLoading,
    updateLoading,
    deleteLoading,
    statsLoading,
    error,
    selectedPlanError,
    createError,
    updateError,
    deleteError,
    statsError,
    showCreateModal,
    showEditModal,
    showDeleteModal,
    showViewModal,
    editingPlan
  } = useSelector(state => state.ownerPlans);

  // Auto-validate plans state and repair if needed
  React.useEffect(() => {
    if (plans && !Array.isArray(plans)) {
      console.warn('🔧 Auto-repairing invalid plans state');
      dispatch(validatePlansState());
    }
  }, [plans, dispatch]);

  // Extract actual plans array from the object structure
  // Handle case where plans might be {plans: Array, pagination: ...} or just Array
  let actualPlans = [];
  if (Array.isArray(plans)) {
    actualPlans = plans;
  } else if (plans && typeof plans === 'object' && Array.isArray(plans.plans)) {
    actualPlans = plans.plans;
    console.warn('🔧 Plans was an object, extracted array:', plans);
  } else if (plans) {
    console.warn('🚨 Unexpected plans structure:', plans, typeof plans);
  }

  // Ensure plans is always an array to prevent map errors
  const safePlans = actualPlans || [];
  
  // Debug log to help identify when plans is not an array
  if (process.env.NODE_ENV === 'development' && plans && !Array.isArray(plans)) {
    console.warn('🚨 ownerPlans.plans is not an array:', plans, typeof plans);
  }

  // Actions
  const actions = {
    // Fetch operations
    fetchPlans: useCallback((params) => dispatch(fetchOwnerPlans(params)), [dispatch]),
    fetchPlanById: useCallback((planId) => dispatch(fetchOwnerPlanById(planId)), [dispatch]),
    fetchPlanStats: useCallback((planId) => dispatch(fetchOwnerPlanStats(planId)), [dispatch]),
    
    // CRUD operations
    createPlan: useCallback((planData) => dispatch(createOwnerPlan(planData)), [dispatch]),
    updatePlan: useCallback((planId, planData) => dispatch(updateOwnerPlan({ planId, planData })), [dispatch]),
    deletePlan: useCallback((planId) => dispatch(deleteOwnerPlan(planId)), [dispatch]),
    togglePlanStatus: useCallback((planId, status) => dispatch(toggleOwnerPlanStatus({ planId, status })), [dispatch]),
    
    // Filters and search
    setFilters: useCallback((filters) => dispatch(setFilters(filters)), [dispatch]),
    resetFilters: useCallback(() => dispatch(resetFilters()), [dispatch]),
    setSearch: useCallback((search) => dispatch(setSearch(search)), [dispatch]),
    setPage: useCallback((page) => dispatch(setPage(page)), [dispatch]),
    
    // UI State
    setShowCreateModal: useCallback((show) => dispatch(setShowCreateModal(show)), [dispatch]),
    setShowEditModal: useCallback((show) => dispatch(setShowEditModal(show)), [dispatch]),
    setShowDeleteModal: useCallback((show) => dispatch(setShowDeleteModal(show)), [dispatch]),
    setShowViewModal: useCallback((show) => dispatch(setShowViewModal(show)), [dispatch]),
    setEditingPlan: useCallback((plan) => dispatch(setEditingPlan(plan)), [dispatch]),
    
    // Cleanup
    clearErrors: useCallback(() => dispatch(clearErrors()), [dispatch]),
    clearSelectedPlan: useCallback(() => dispatch(clearSelectedPlan()), [dispatch]),
    reset: useCallback(() => dispatch(resetOwnerPlans()), [dispatch]),
    validateState: useCallback(() => dispatch(validatePlansState()), [dispatch])
  };

  // Computed values
  const computed = {
    hasPlans: safePlans.length > 0,
    hasSelectedPlan: !!selectedPlan,
    hasErrors: !!(error || selectedPlanError || createError || updateError || deleteError || statsError),
    isAnyLoading: loading || selectedPlanLoading || createLoading || updateLoading || deleteLoading || statsLoading,
    canCreatePlan: !createLoading,
    canEditPlan: !!editingPlan && !updateLoading,
    canDeletePlan: !!editingPlan && !deleteLoading,
    hasNextPage: pagination.page < pagination.totalPages,
    hasPrevPage: pagination.page > 1
  };

  // Helper functions
  const helpers = {
    // Navegar a una página específica
    goToPage: (page) => {
      actions.setPage(page);
      actions.fetchPlans({ ...filters, page });
    },
    
    // Buscar planes
    searchPlans: (searchTerm) => {
      actions.setSearch(searchTerm);
      actions.fetchPlans({ ...filters, search: searchTerm, page: 1 });
    },
    
    // Filtrar planes
    filterPlans: (newFilters) => {
      const updatedFilters = { ...filters, ...newFilters, page: 1 };
      actions.setFilters(updatedFilters);
      actions.fetchPlans(updatedFilters);
    },
    
    // Abrir modal de creación
    openCreateModal: () => {
      actions.clearErrors();
      actions.setShowCreateModal(true);
    },
    
    // Abrir modal de edición
    openEditModal: (plan) => {
      actions.clearErrors();
      actions.setEditingPlan(plan);
      actions.setShowEditModal(true);
    },
    
    // Abrir modal de eliminación
    openDeleteModal: (plan) => {
      actions.clearErrors();
      actions.setEditingPlan(plan);
      actions.setShowDeleteModal(true);
    },
    
    // Abrir modal de vista
    openViewModal: (plan) => {
      actions.clearErrors();
      actions.fetchPlanById(plan.id);
      actions.fetchPlanStats(plan.id);
      actions.setShowViewModal(true);
    },
    
    // Cerrar modales
    closeModals: () => {
      actions.setShowCreateModal(false);
      actions.setShowEditModal(false);
      actions.setShowDeleteModal(false);
      actions.setShowViewModal(false);
      actions.setEditingPlan(null);
      actions.clearErrors();
    },
    
    // Refrescar lista
    refresh: () => {
      actions.fetchPlans(filters);
    },
    
    // Seleccionar plan y cargar detalles
    selectPlan: (planId) => {
      // Buscar el plan en el array actual
      const plan = safePlans.find(p => p.id === planId);
      if (plan) {
        helpers.openViewModal(plan);
      }
    }
  };

  return {
    // State
    plans: safePlans,
    totalPlans,
    selectedPlan,
    selectedPlanStats,
    pagination,
    filters,
    
    // Loading states
    loading,
    selectedPlanLoading,
    createLoading,
    updateLoading,
    deleteLoading,
    statsLoading,
    
    // Error states
    error,
    selectedPlanError,
    createError,
    updateError,
    deleteError,
    statsError,
    
    // UI State
    showCreateModal,
    showEditModal,
    showDeleteModal,
    showViewModal,
    editingPlan,
    
    // Actions
    actions,
    
    // Computed
    computed,
    
    // Helpers
    helpers
  };
};