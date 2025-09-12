/**
 * Hook para Gestión de Suscripciones del Owner (Nueva Arquitectura)
 * Proporciona acceso fácil y funciones helper para el manejo de suscripciones del Owner
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

export const useOwnerSubscription = () => {
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
    
    // Plan distribution
    planDistribution: subscriptions.reduce((acc, subscription) => {
      const planName = subscription.plan?.name || 'Sin Plan';
      acc[planName] = (acc[planName] || 0) + 1;
      return acc;
    }, {}),
    
    // Business distribution
    businessDistribution: subscriptions.reduce((acc, subscription) => {
      const businessName = subscription.business?.name || 'Sin Negocio';
      acc[businessName] = (acc[businessName] || 0) + 1;
      return acc;
    }, {}),
    
    // Financial summary from current list
    totalRevenueFromSubscriptions: subscriptions
      .filter(s => s.status === 'ACTIVE')
      .reduce((sum, s) => sum + (s.plan?.price || 0), 0),
    
    averageSubscriptionValue: subscriptions.length > 0 
      ? subscriptions
          .filter(s => s.status === 'ACTIVE')
          .reduce((sum, s) => sum + (s.plan?.price || 0), 0) / subscriptions.filter(s => s.status === 'ACTIVE').length
      : 0,
    
    // Expiring subscriptions (next 30 days)
    expiringSubscriptions: subscriptions.filter(subscription => {
      if (!subscription.endDate || subscription.status !== 'ACTIVE') return false;
      const endDate = new Date(subscription.endDate);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return endDate <= thirtyDaysFromNow;
    }),
    
    // Recent subscriptions (last 7 days)
    recentSubscriptions: subscriptions.filter(subscription => {
      if (!subscription.createdAt) return false;
      const createdDate = new Date(subscription.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate >= weekAgo;
    }),
    
    // Renewal analysis
    renewableSubscriptions: subscriptions.filter(s => 
      s.status === 'ACTIVE' && 
      s.endDate && 
      new Date(s.endDate) > new Date()
    ),
    
    // Churn analysis
    churnedSubscriptions: subscriptions.filter(s => 
      s.status === 'CANCELLED' && 
      s.cancelledAt && 
      new Date(s.cancelledAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    )
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
    isExpiring: (subscription, days = 30) => {
      if (!subscription.endDate || subscription.status !== 'ACTIVE') return false;
      const endDate = new Date(subscription.endDate);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + days);
      return endDate <= cutoff;
    },
    
    isRecent: (subscription, days = 7) => {
      if (!subscription.createdAt) return false;
      const createdDate = new Date(subscription.createdAt);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return createdDate >= cutoff;
    },
    
    getDaysUntilExpiry: (subscription) => {
      if (!subscription.endDate) return null;
      const endDate = new Date(subscription.endDate);
      const now = new Date();
      const diffTime = endDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    },
    
    getSubscriptionAge: (subscription) => {
      if (!subscription.createdAt) return null;
      const createdDate = new Date(subscription.createdAt);
      const now = new Date();
      const diffTime = now - createdDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 30) {
        const months = Math.floor(diffDays / 30);
        return `${months} mes${months > 1 ? 'es' : ''}`;
      }
      return `${diffDays} día${diffDays > 1 ? 's' : ''}`;
    },
    
    // Format helpers
    formatStatus: (status) => {
      const statusMap = {
        'ACTIVE': 'Activa',
        'SUSPENDED': 'Suspendida',
        'CANCELLED': 'Cancelada',
        'EXPIRED': 'Expirada'
      };
      return statusMap[status] || status;
    },
    
    getStatusColor: (status) => {
      const colorMap = {
        'ACTIVE': 'success',
        'SUSPENDED': 'warning',
        'CANCELLED': 'error',
        'EXPIRED': 'default'
      };
      return colorMap[status] || 'default';
    },
    
    formatPrice: (amount, currency = 'COP') => {
      if (currency === 'COP') {
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(amount || 0);
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
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
        subscription.id?.toLowerCase().includes(term) ||
        subscription.business?.name?.toLowerCase().includes(term) ||
        subscription.plan?.name?.toLowerCase().includes(term) ||
        subscription.status?.toLowerCase().includes(term)
      );
    },
    
    getSubscriptionsByStatus: (status) => {
      return subscriptions.filter(s => s.status === status);
    },
    
    getSubscriptionsByPlan: (planId) => {
      return subscriptions.filter(s => s.planId === planId);
    },
    
    getSubscriptionsByBusiness: (businessId) => {
      return subscriptions.filter(s => s.businessId === businessId);
    },
    
    getExpiringSubscriptions: (days = 30) => {
      return subscriptions.filter(subscription => helpers.isExpiring(subscription, days));
    },
    
    // Validation helpers
    canCancel: (subscription) => {
      return subscription.status === 'ACTIVE';
    },
    
    canSuspend: (subscription) => {
      return subscription.status === 'ACTIVE';
    },
    
    canReactivate: (subscription) => {
      return subscription.status === 'SUSPENDED';
    },
    
    canExtend: (subscription) => {
      return ['ACTIVE', 'SUSPENDED'].includes(subscription.status);
    },
    
    canRenew: (subscription) => {
      return ['ACTIVE', 'EXPIRED'].includes(subscription.status);
    },
    
    // Analytics helpers
    getChurnRate: (period = 'month') => {
      const now = new Date();
      let startDate;
      
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      }
      
      const periodSubscriptions = subscriptions.filter(s => 
        s.createdAt && new Date(s.createdAt) >= startDate
      );
      
      const churnedInPeriod = subscriptions.filter(s => 
        s.status === 'CANCELLED' &&
        s.cancelledAt && 
        new Date(s.cancelledAt) >= startDate
      );
      
      if (periodSubscriptions.length === 0) return 0;
      return (churnedInPeriod.length / periodSubscriptions.length) * 100;
    },
    
    getRetentionRate: (period = 'month') => {
      return 100 - helpers.getChurnRate(period);
    },
    
    getAverageLifetime: () => {
      const completedSubscriptions = subscriptions.filter(s => 
        s.status === 'CANCELLED' && s.createdAt && s.cancelledAt
      );
      
      if (completedSubscriptions.length === 0) return 0;
      
      const totalDays = completedSubscriptions.reduce((sum, s) => {
        const start = new Date(s.createdAt);
        const end = new Date(s.cancelledAt);
        const diffTime = end - start;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0);
      
      return Math.round(totalDays / completedSubscriptions.length);
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

export default useOwnerSubscription;