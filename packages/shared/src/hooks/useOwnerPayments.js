/**
 * Hook para Gestión de Pagos del Owner
 * Proporciona acceso fácil y funciones helper para el manejo de pagos, reembolsos y analytics
 */

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllPayments,
  processPayment,
  processRefund,
  updatePaymentStatus,
  getPaymentDetails,
  getPaymentStats,
  getRevenueAnalytics,
  handlePaymentDispute,
  getCommissionDetails,
  processCommissionPayment,
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
  reset,
  selectPayments,
  selectSelectedPayment,
  selectPaymentStats,
  selectRevenueAnalytics,
  selectCommissionDetails,
  selectPaymentsPagination,
  selectPaymentsFilters,
  selectPaymentsLoading,
  selectPaymentsErrors,
  selectPaymentsUI
} from '../store/slices/ownerPaymentsSlice';

export const useOwnerPayments = () => {
  const dispatch = useDispatch();
  const intervalRef = useRef(null);

  // ====== SELECTORS ======
  const payments = useSelector(selectPayments);
  const selectedPayment = useSelector(selectSelectedPayment);
  const paymentStats = useSelector(selectPaymentStats);
  const revenueAnalytics = useSelector(selectRevenueAnalytics);
  const commissionDetails = useSelector(selectCommissionDetails);
  const pagination = useSelector(selectPaymentsPagination);
  const filters = useSelector(selectPaymentsFilters);
  const loading = useSelector(selectPaymentsLoading);
  const errors = useSelector(selectPaymentsErrors);
  const ui = useSelector(selectPaymentsUI);

  // ====== COMPUTED VALUES ======
  const computedValues = useMemo(() => ({
    hasPayments: payments.length > 0,
    totalPayments: pagination.totalItems || 0,
    isFirstPage: pagination.page === 1,
    isLastPage: pagination.page >= pagination.totalPages,
    hasFiltersApplied: Boolean(
      filters.status ||
      filters.method ||
      filters.businessId ||
      filters.subscriptionId ||
      filters.startDate ||
      filters.endDate ||
      filters.minAmount ||
      filters.maxAmount
    ),
    
    // Status-based counts
    successfulPayments: payments.filter(p => p.status === 'successful').length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    failedPayments: payments.filter(p => p.status === 'failed').length,
    refundedPayments: payments.filter(p => p.status === 'refunded').length,
    disputedPayments: payments.filter(p => p.status === 'disputed').length,
    
    // Method distribution
    methodDistribution: payments.reduce((acc, payment) => {
      const method = payment.method || 'unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {}),
    
    // Financial summary from current list
    totalRevenueFromList: payments
      .filter(p => p.status === 'successful')
      .reduce((sum, p) => sum + (p.amount || 0), 0),
    
    totalRefundsFromList: payments
      .filter(p => p.status === 'refunded')
      .reduce((sum, p) => sum + (p.refundAmount || p.amount || 0), 0),
    
    netRevenueFromList: payments
      .filter(p => ['successful'].includes(p.status))
      .reduce((sum, p) => sum + (p.amount || 0), 0) -
      payments
      .filter(p => p.status === 'refunded')
      .reduce((sum, p) => sum + (p.refundAmount || p.amount || 0), 0),
    
    averagePaymentAmount: payments.length > 0 
      ? payments
          .filter(p => p.status === 'successful')
          .reduce((sum, p) => sum + (p.amount || 0), 0) / payments.filter(p => p.status === 'successful').length
      : 0,
    
    // Success rate from current list
    paymentSuccessRate: payments.length > 0 
      ? (payments.filter(p => p.status === 'successful').length / payments.length) * 100
      : 0,
    
    // Refund rate from current list
    refundRate: payments.length > 0 
      ? (payments.filter(p => p.status === 'refunded').length / payments.length) * 100
      : 0,
    
    // Dispute rate from current list
    disputeRate: payments.length > 0 
      ? (payments.filter(p => p.status === 'disputed').length / payments.length) * 100
      : 0,
    
    // Currency distribution
    currencyDistribution: payments.reduce((acc, payment) => {
      const currency = payment.currency || 'COP';
      acc[currency] = (acc[currency] || 0) + (payment.amount || 0);
      return acc;
    }, {}),
    
    // Recent payments (last 24 hours)
    recentPayments: payments.filter(payment => {
      if (!payment.createdAt) return false;
      const paymentDate = new Date(payment.createdAt);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return paymentDate >= yesterday;
    }),
    
    // High value payments (>= 100,000 COP)
    highValuePayments: payments.filter(p => (p.amount || 0) >= 100000),
    
    // Failed payments that can be retried
    retryablePayments: payments.filter(p => 
      p.status === 'failed' && 
      p.errorCode !== 'insufficient_funds' && 
      p.errorCode !== 'card_declined'
    )
  }), [payments, pagination, filters]);

  // ====== API ACTIONS ======
  const actions = useMemo(() => ({
    // Data fetching
    loadPayments: (params) => dispatch(fetchAllPayments(params)),
    loadPaymentStats: (params) => dispatch(getPaymentStats(params)),
    loadRevenueAnalytics: (params) => dispatch(getRevenueAnalytics(params)),
    loadPaymentDetails: (id) => dispatch(getPaymentDetails(id)),
    loadCommissionDetails: (params) => dispatch(getCommissionDetails(params)),
    
    // Payment management
    processPayment: (data) => dispatch(processPayment(data)),
    refundPayment: (id, amount, reason) => dispatch(processRefund({ paymentId: id, amount, reason })),
    updateStatus: (id, status, notes) => dispatch(updatePaymentStatus({ paymentId: id, status, notes })),
    handleDispute: (id, action, notes, evidence) => dispatch(handlePaymentDispute({ paymentId: id, action, notes, evidence })),
    payCommission: (data) => dispatch(processCommissionPayment(data)),
    
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
    changeMethod: (method) => dispatch(setMethod(method)),
    changeBusinessId: (businessId) => dispatch(setBusinessId(businessId)),
    changeSubscriptionId: (subscriptionId) => dispatch(setSubscriptionId(subscriptionId)),
    changeDateRange: (startDate, endDate) => dispatch(setDateRange({ startDate, endDate })),
    changeAmountRange: (minAmount, maxAmount) => dispatch(setAmountRange({ minAmount, maxAmount })),
    changeCurrency: (currency) => dispatch(setCurrency(currency)),
    changeSorting: (sortBy, sortOrder) => dispatch(setSorting({ sortBy, sortOrder })),
    resetFilters: () => dispatch(clearFilters()),
    
    // UI Management
    showProcessModal: () => dispatch(openProcessModal()),
    hideProcessModal: () => dispatch(closeProcessModal()),
    setFormStep: (step) => dispatch(setProcessFormStep(step)),
    nextStep: () => dispatch(nextProcessStep()),
    prevStep: () => dispatch(prevProcessStep()),
    
    showRefundModal: (payment) => dispatch(openRefundModal(payment)),
    hideRefundModal: () => dispatch(closeRefundModal()),
    setRefundData: (data) => dispatch(setRefundForm(data)),
    
    showDetailsModal: (payment) => dispatch(openDetailsModal(payment)),
    hideDetailsModal: () => dispatch(closeDetailsModal()),
    changeDetailsTab: (tab) => dispatch(setDetailsTab(tab)),
    
    showDisputeModal: (payment) => dispatch(openDisputeModal(payment)),
    hideDisputeModal: () => dispatch(closeDisputeModal()),
    
    showCommissionModal: () => dispatch(openCommissionModal()),
    hideCommissionModal: () => dispatch(closeCommissionModal()),
    
    changeViewMode: (mode) => dispatch(setViewMode(mode)),
    
    // Auto-refresh
    toggleRefresh: () => dispatch(toggleAutoRefresh()),
    setInterval: (interval) => dispatch(setRefreshInterval(interval)),
    
    // Selection
    selectPayment: (payment) => dispatch(selectPayment(payment)),
    
    // Error handling
    clearAllErrors: () => dispatch(clearErrors()),
    clearSpecificError: (errorType) => dispatch(clearError(errorType)),
    
    // Reset
    resetState: () => dispatch(reset())
  }), [dispatch, pagination.page, computedValues.isFirstPage, computedValues.isLastPage]);

  // ====== HELPER FUNCTIONS ======
  const helpers = useMemo(() => ({
    // Status helpers
    isSuccessful: (payment) => payment.status === 'successful',
    isPending: (payment) => payment.status === 'pending',
    isFailed: (payment) => payment.status === 'failed',
    isRefunded: (payment) => payment.status === 'refunded',
    isDisputed: (payment) => payment.status === 'disputed',
    
    // Payment method helpers
    isWompiPayment: (payment) => payment.method === 'wompi',
    isCashPayment: (payment) => payment.method === 'cash',
    isBankTransfer: (payment) => payment.method === 'bank_transfer',
    
    // Amount helpers
    isHighValue: (payment, threshold = 100000) => (payment.amount || 0) >= threshold,
    isLowValue: (payment, threshold = 10000) => (payment.amount || 0) <= threshold,
    
    // Date helpers
    isRecent: (payment, hours = 24) => {
      if (!payment.createdAt) return false;
      const paymentDate = new Date(payment.createdAt);
      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - hours);
      return paymentDate >= cutoff;
    },
    
    getPaymentAge: (payment) => {
      if (!payment.createdAt) return null;
      const paymentDate = new Date(payment.createdAt);
      const now = new Date();
      const diffTime = now - paymentDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      
      if (diffDays > 0) return `${diffDays} día${diffDays > 1 ? 's' : ''}`;
      return `${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    },
    
    // Format helpers
    formatStatus: (status) => {
      const statusMap = {
        'successful': 'Exitoso',
        'pending': 'Pendiente',
        'failed': 'Fallido',
        'refunded': 'Reembolsado',
        'disputed': 'En Disputa',
        'cancelled': 'Cancelado'
      };
      return statusMap[status] || status;
    },
    
    getStatusColor: (status) => {
      const colorMap = {
        'successful': 'success',
        'pending': 'warning',
        'failed': 'error',
        'refunded': 'info',
        'disputed': 'error',
        'cancelled': 'default'
      };
      return colorMap[status] || 'default';
    },
    
    formatMethod: (method) => {
      const methodMap = {
        'wompi': 'Wompi',
        'cash': 'Efectivo',
        'bank_transfer': 'Transferencia Bancaria',
        'credit_card': 'Tarjeta de Crédito',
        'debit_card': 'Tarjeta Débito',
        'pse': 'PSE'
      };
      return methodMap[method] || method;
    },
    
    formatCurrency: (amount, currency = 'COP') => {
      const formatMap = {
        'COP': new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }),
        'USD': new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      };
      
      const formatter = formatMap[currency] || formatMap['COP'];
      return formatter.format(amount || 0);
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
    getFilteredPayments: (searchTerm) => {
      if (!searchTerm) return payments;
      const term = searchTerm.toLowerCase();
      
      return payments.filter(payment =>
        payment.id?.toLowerCase().includes(term) ||
        payment.reference?.toLowerCase().includes(term) ||
        payment.business?.name?.toLowerCase().includes(term) ||
        payment.customerInfo?.name?.toLowerCase().includes(term) ||
        payment.customerInfo?.email?.toLowerCase().includes(term) ||
        payment.description?.toLowerCase().includes(term)
      );
    },
    
    getPaymentsByStatus: (status) => {
      return payments.filter(p => p.status === status);
    },
    
    getPaymentsByMethod: (method) => {
      return payments.filter(p => p.method === method);
    },
    
    getPaymentsByBusiness: (businessId) => {
      return payments.filter(p => p.businessId === businessId);
    },
    
    getPaymentsByDateRange: (startDate, endDate) => {
      return payments.filter(payment => {
        if (!payment.createdAt) return false;
        const paymentDate = new Date(payment.createdAt);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return paymentDate >= start && paymentDate <= end;
      });
    },
    
    // Validation helpers
    canRefund: (payment) => {
      return payment.status === 'successful' && !payment.refundedAt;
    },
    
    canRetry: (payment) => {
      return payment.status === 'failed' && 
             !['insufficient_funds', 'card_declined', 'expired_card'].includes(payment.errorCode);
    },
    
    canDispute: (payment) => {
      return ['successful', 'refunded'].includes(payment.status) && !payment.disputedAt;
    },
    
    // Analytics helpers
    getRevenueByPeriod: (period = 'month') => {
      const now = new Date();
      let startDate;
      
      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      
      return payments
        .filter(p => p.status === 'successful' && new Date(p.createdAt) >= startDate)
        .reduce((sum, p) => sum + (p.amount || 0), 0);
    },
    
    getSuccessRateByPeriod: (period = 'month') => {
      const periodPayments = helpers.getPaymentsByDateRange(
        period === 'month' ? new Date(new Date().getFullYear(), new Date().getMonth(), 1) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        new Date()
      );
      
      if (periodPayments.length === 0) return 0;
      
      const successful = periodPayments.filter(p => p.status === 'successful').length;
      return (successful / periodPayments.length) * 100;
    }
  }), [payments]);

  // ====== AUTO-REFRESH EFFECT ======
  useEffect(() => {
    if (ui.autoRefresh) {
      intervalRef.current = setInterval(() => {
        actions.loadPayments({ 
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
    actions.loadPayments({ 
      ...filters, 
      page: pagination.page, 
      limit: pagination.limit 
    });
    actions.loadPaymentStats({ 
      startDate: filters.startDate, 
      endDate: filters.endDate,
      businessId: filters.businessId,
      currency: filters.currency
    });
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
    payments,
    selectedPayment,
    paymentStats,
    revenueAnalytics,
    commissionDetails,
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

export default useOwnerPayments;