/**
 * Hook para Gestión de Suscripciones del Owner
 * Proporciona acceso fácil y funciones helper para el manejo de suscripciones
 */

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllSubscriptions,
  createNewSubscription,
  cancelExistingSubscription,
  updateSubscriptionStatus,
  extendSubscription,
  getSubscriptionDetails,
  getSubscriptionStats,
  renewSubscription,
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
  reset,
  selectSubscriptions,
  selectSelectedSubscription,
  selectSubscriptionStats,
  selectSubscriptionsPagination,
  selectSubscriptionsFilters,
  selectSubscriptionsLoading,
  selectSubscriptionsErrors,
  selectSubscriptionsUI
} from '../store/slices/ownerSubscriptionSlice';

export const useOwnerSubscriptions = () => {
  const dispatch = useDispatch();
  const intervalRef = useRef(null);

  // ====== SELECTORS ======
  const subscriptions = useSelector(selectSubscriptions);
  const selectedSubscription = useSelector(selectSelectedSubscription);
  const subscriptionStats = useSelector(selectSubscriptionStats);
  const pagination = useSelector(selectSubscriptionsPagination);
  const filters = useSelector(selectSubscriptionsFilters);
  const loading = useSelector(selectSubscriptionsLoading);
  const errors = useSelector(selectSubscriptionsErrors);
  const ui = useSelector(selectSubscriptionsUI);

  // ====== COMPUTED VALUES ======
  const computedValues = useMemo(() => ({
    hasSubscriptions: subscriptions.length > 0,
    totalSubscriptions: pagination.totalItems || 0,
    isFirstPage: pagination.page === 1,
    isLastPage: pagination.page >= pagination.totalPages,
    hasFiltersApplied: Boolean(
      filters.status ||
      filters.planId ||
      filters.businessId ||
      filters.startDate ||
      filters.endDate ||
      filters.expiring
    ),
    
    // Status-based counts
    activeSubscriptions: subscriptions.filter(s => s.status === 'ACTIVE').length,
    suspendedSubscriptions: subscriptions.filter(s => s.status === 'SUSPENDED').length,
    cancelledSubscriptions: subscriptions.filter(s => s.status === 'CANCELLED').length,
    expiredSubscriptions: subscriptions.filter(s => s.status === 'EXPIRED').length,
    
    // Subscription status groups
    healthySubscriptions: subscriptions.filter(s => 
      ['ACTIVE'].includes(s.status)
    ).length,
    
    problematicSubscriptions: subscriptions.filter(s => 
      ['SUSPENDED', 'EXPIRED'].includes(s.status)
    ).length,
    
    // Financial summary
    totalRevenueFromList: subscriptions
      .filter(s => s.status === 'ACTIVE')
      .reduce((sum, s) => sum + (s.amount || 0), 0),
    
    averageSubscriptionValue: subscriptions.length > 0 
      ? subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0) / subscriptions.length 
      : 0,
    
    // Expiring subscriptions (next 30 days)
    expiringSubscriptions: subscriptions.filter(s => {
      if (!s.endDate || s.status !== 'ACTIVE') return false;
      const endDate = new Date(s.endDate);
      const today = new Date();
      const diffTime = endDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    }),
    
    // Plan distribution
    planDistribution: subscriptions.reduce((acc, subscription) => {
      const planName = subscription.plan?.name || 'Sin Plan';
      acc[planName] = (acc[planName] || 0) + 1;
      return acc;
    }, {}),
    
    // Status distribution
    statusDistribution: subscriptions.reduce((acc, subscription) => {
      const status = subscription.status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {})
  }), [subscriptions, pagination, filters]);

  // ====== API ACTIONS ======
  const actions = useMemo(() => ({
    // Data fetching
    loadSubscriptions: (params) => dispatch(fetchAllSubscriptions(params)),
    loadSubscriptionStats: () => dispatch(getSubscriptionStats()),
    loadSubscriptionDetails: (id) => dispatch(getSubscriptionDetails(id)),
    
    // Subscription management
    createSubscription: (data) => dispatch(createNewSubscription(data)),
    cancelSubscription: (id, reason) => dispatch(cancelExistingSubscription({ subscriptionId: id, reason })),
    updateStatus: (id, status, reason) => dispatch(updateSubscriptionStatus({ subscriptionId: id, status, reason })),
    extendSubscription: (id, duration, durationType) => dispatch(extendSubscription({ subscriptionId: id, duration, durationType })),
    renewSubscription: (id, planId) => dispatch(renewSubscription({ subscriptionId: id, planId })),
    
    // Pagination
    changePage: (page) => dispatch(setPage(page)),
    changeLimit: (limit) => dispatch(setLimit(limit)),
    goToNextPage: () => {
      if (!computedValues.isLastPage) {
        dispatch(setPage(pagination.page + 1));
      }
    },
    goToPrevPage: () => {
      if (!computedValues.isFirstPage) {
        dispatch(setPage(pagination.page - 1));
      }
    },
    
    // Filters
    changeStatus: (status) => dispatch(setStatus(status)),
    changePlanId: (planId) => dispatch(setPlanId(planId)),
    changeBusinessId: (businessId) => dispatch(setBusinessId(businessId)),
    changeDateRange: (startDate, endDate) => dispatch(setDateRange({ startDate, endDate })),
    changeExpiring: (expiring) => dispatch(setExpiring(expiring)),
    changeSorting: (sortBy, sortOrder) => dispatch(setSorting({ sortBy, sortOrder })),
    resetFilters: () => dispatch(clearFilters()),
    
    // UI Management
    showCreateModal: () => dispatch(openCreateModal()),
    hideCreateModal: () => dispatch(closeCreateModal()),
    setFormStep: (step) => dispatch(setCreateFormStep(step)),
    nextStep: () => dispatch(nextCreateStep()),
    prevStep: () => dispatch(prevCreateStep()),
    
    showDetailsModal: (subscription) => dispatch(openDetailsModal(subscription)),
    hideDetailsModal: () => dispatch(closeDetailsModal()),
    changeDetailsTab: (tab) => dispatch(setDetailsTab(tab)),
    
    showCancelModal: (subscription) => dispatch(openCancelModal(subscription)),
    hideCancelModal: () => dispatch(closeCancelModal()),
    
    showExtendModal: (subscription) => dispatch(openExtendModal(subscription)),
    hideExtendModal: () => dispatch(closeExtendModal()),
    
    showRenewModal: (subscription) => dispatch(openRenewModal(subscription)),
    hideRenewModal: () => dispatch(closeRenewModal()),
    
    // Auto-refresh
    toggleRefresh: () => dispatch(toggleAutoRefresh()),
    setInterval: (interval) => dispatch(setRefreshInterval(interval)),
    
    // Selection
    selectSubscription: (subscription) => dispatch(selectSubscription(subscription)),
    
    // Error handling
    clearAllErrors: () => dispatch(clearErrors()),
    clearSpecificError: (errorType) => dispatch(clearError(errorType)),
    
    // Reset
    resetState: () => dispatch(reset())
  }), [dispatch, pagination.page, computedValues.isFirstPage, computedValues.isLastPage]);

  // ====== HELPER FUNCTIONS ======
  const helpers = useMemo(() => ({
    // Status helpers
    isActive: (subscription) => subscription.status === 'ACTIVE',
    isSuspended: (subscription) => subscription.status === 'SUSPENDED',
    isCancelled: (subscription) => subscription.status === 'CANCELLED',
    isExpired: (subscription) => subscription.status === 'EXPIRED',
    
    // Date helpers
    isExpiringSoon: (subscription, days = 30) => {
      if (!subscription.endDate || subscription.status !== 'ACTIVE') return false;
      const endDate = new Date(subscription.endDate);
      const today = new Date();
      const diffTime = endDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= days && diffDays > 0;
    },
    
    getDaysUntilExpiry: (subscription) => {
      if (!subscription.endDate) return null;
      const endDate = new Date(subscription.endDate);
      const today = new Date();
      const diffTime = endDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    },
    
    getSubscriptionDuration: (subscription) => {
      if (!subscription.startDate || !subscription.endDate) return null;
      const startDate = new Date(subscription.startDate);
      const endDate = new Date(subscription.endDate);
      const diffTime = endDate - startDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    },
    
    // Format helpers
    formatStatus: (status) => {
      const statusMap = {
        'ACTIVE': 'Activa',
        'SUSPENDED': 'Suspendida',
        'CANCELLED': 'Cancelada',
        'EXPIRED': 'Expirada',
        'PENDING': 'Pendiente'
      };
      return statusMap[status] || status;
    },
    
    getStatusColor: (status) => {
      const colorMap = {
        'ACTIVE': 'success',
        'SUSPENDED': 'warning',
        'CANCELLED': 'error',
        'EXPIRED': 'error',
        'PENDING': 'info'
      };
      return colorMap[status] || 'default';
    },
    
    formatCurrency: (amount) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount || 0);
    },
    
    formatDate: (date) => {
      if (!date) return '-';
      return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(new Date(date));
    },
    
    formatDateTime: (date) => {
      if (!date) return '-';
      return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(date));
    },
    
    // Search and filter helpers
    getFilteredSubscriptions: (searchTerm) => {
      if (!searchTerm) return subscriptions;
      const term = searchTerm.toLowerCase();
      
      return subscriptions.filter(subscription =>
        subscription.business?.name?.toLowerCase().includes(term) ||
        subscription.plan?.name?.toLowerCase().includes(term) ||
        subscription.id?.toLowerCase().includes(term) ||
        subscription.status?.toLowerCase().includes(term)
      );
    },
    
    getSubscriptionsByStatus: (status) => {
      return subscriptions.filter(s => s.status === status);
    },
    
    getSubscriptionsByPlan: (planId) => {
      return subscriptions.filter(s => s.planId === planId);
    },
    
    // Validation helpers
    canCancel: (subscription) => {
      return ['ACTIVE', 'SUSPENDED'].includes(subscription.status);
    },
    
    canSuspend: (subscription) => {
      return subscription.status === 'ACTIVE';
    },
    
    canActivate: (subscription) => {
      return ['SUSPENDED', 'PENDING'].includes(subscription.status);
    },
    
    canExtend: (subscription) => {
      return ['ACTIVE', 'SUSPENDED'].includes(subscription.status);
    },
    
    canRenew: (subscription) => {
      return ['EXPIRED', 'CANCELLED'].includes(subscription.status) || 
             helpers.isExpiringSoon(subscription, 15);
    }
  }), [subscriptions]);

  // ====== AUTO-REFRESH EFFECT ======
  useEffect(() => {
    if (ui.autoRefresh) {
      intervalRef.current = setInterval(() => {
        actions.loadSubscriptions({ 
          ...filters, 
          page: pagination.page, 
          limit: pagination.limit 
        });
      }, ui.refreshInterval);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [ui.autoRefresh, ui.refreshInterval, filters, pagination.page, pagination.limit]);

  // ====== INITIAL DATA LOAD ======
  const loadInitialData = useCallback(() => {
    actions.loadSubscriptions({ 
      ...filters, 
      page: pagination.page, 
      limit: pagination.limit 
    });
    actions.loadSubscriptionStats();
  }, [filters, pagination.page, pagination.limit]);

  // Load data when filters or pagination changes
  useEffect(() => {
    loadInitialData();
  }, [filters, pagination.page, pagination.limit]);

  // ====== CLEANUP ======
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    // State
    subscriptions,
    selectedSubscription,
    subscriptionStats,
    pagination,
    filters,
    loading,
    errors,
    ui,
    
    // Computed values
    ...computedValues,
    
    // Actions
    actions,
    
    // Helpers
    helpers,
    
    // Utils
    loadInitialData
  };
};

export default useOwnerSubscriptions;