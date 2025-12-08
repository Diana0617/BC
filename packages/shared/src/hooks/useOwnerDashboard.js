/**
 * Hook personalizado para el Dashboard del Owner
 * Proporciona acceso fácil a todas las funcionalidades del dashboard
 */

import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect, useMemo } from 'react';
import {
  // Actions
  fetchMainMetrics,
  fetchRevenueChart,
  fetchPlanDistribution,
  fetchTopBusinesses,
  fetchGrowthStats,
  fetchQuickSummary,
  exportDashboardData,
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
  reset,
  
  // Selectors
  selectMainMetrics,
  selectRevenueChart,
  selectPlanDistribution,
  selectTopBusinesses,
  selectGrowthStats,
  selectQuickSummary,
  selectDashboardLoading,
  selectDashboardErrors,
  selectDashboardUI,
  selectDashboardFilters
} from '../store/slices/ownerDashboardSlice';

export const useOwnerDashboard = () => {
  const dispatch = useDispatch();

  // ====== SELECTORS ======
  const mainMetrics = useSelector(selectMainMetrics);
  const revenueChart = useSelector(selectRevenueChart);
  const planDistribution = useSelector(selectPlanDistribution);
  const topBusinesses = useSelector(selectTopBusinesses);
  const growthStats = useSelector(selectGrowthStats);
  const quickSummary = useSelector(selectQuickSummary);
  const loading = useSelector(selectDashboardLoading);
  const errors = useSelector(selectDashboardErrors);
  const ui = useSelector(selectDashboardUI);
  const filters = useSelector(selectDashboardFilters);

  // ====== ACTIONS ======
  const actions = useMemo(() => ({
    // Data fetching
    fetchMainMetrics: (period) => dispatch(fetchMainMetrics(period)),
    fetchRevenueChart: (months) => dispatch(fetchRevenueChart(months)),
    fetchPlanDistribution: () => dispatch(fetchPlanDistribution()),
    fetchTopBusinesses: (limit) => dispatch(fetchTopBusinesses(limit)),
    fetchGrowthStats: (period) => dispatch(fetchGrowthStats(period)),
    fetchQuickSummary: () => dispatch(fetchQuickSummary()),
    exportDashboardData: (options) => dispatch(exportDashboardData(options)),
    
    // UI actions
    setSelectedWidget: (widget) => dispatch(setSelectedWidget(widget)),
    toggleAutoRefresh: () => dispatch(toggleAutoRefresh()),
    setRefreshInterval: (interval) => dispatch(setRefreshInterval(interval)),
    updateLastRefresh: () => dispatch(updateLastRefresh()),
    openExportModal: () => dispatch(openExportModal()),
    closeExportModal: () => dispatch(closeExportModal()),
    setExportFormat: (format) => dispatch(setExportFormat(format)),
    setExportPeriod: (period) => dispatch(setExportPeriod(period)),
    
    // Filter actions
    setPeriod: (period) => dispatch(setPeriod(period)),
    setChartMonths: (months) => dispatch(setChartMonths(months)),
    setTopBusinessesLimit: (limit) => dispatch(setTopBusinessesLimit(limit)),
    
    // Error handling
    clearErrors: () => dispatch(clearErrors()),
    clearError: (errorType) => dispatch(clearError(errorType)),
    
    // Reset
    reset: () => dispatch(reset())
  }), [dispatch]);

  // ====== COMPUTED VALUES ======
  const computed = useMemo(() => ({
    // Check if any data is loading
    isAnyLoading: Object.values(loading).some(l => l),
    
    // Check if there are any errors
    hasErrors: Object.values(errors).some(e => e !== null),
    
    // Count loaded sections
    loadedSections: [
      mainMetrics && 'metrics',
      revenueChart?.data?.length > 0 && 'revenue',
      planDistribution?.distribution?.length > 0 && 'plans',
      topBusinesses?.businesses?.length > 0 && 'businesses',
      growthStats?.conversionRate !== null && 'growth',
      quickSummary?.widgets?.length > 0 && 'summary'
    ].filter(Boolean).length,
    
    // Total sections available
    totalSections: 6,
    
    // Progress percentage
    loadProgress: Math.round((6 - Object.values(loading).filter(l => l).length) / 6 * 100),
    
    // Revenue chart info
    hasRevenueData: revenueChart?.data && revenueChart.data.length > 0,
    revenueChartPeriod: `${filters.chartMonths} meses`,
    
    // Plan distribution info
    hasPlanData: planDistribution?.distribution && planDistribution.distribution.length > 0,
    totalPlansCount: planDistribution?.totalPlans || 0,
    totalSubscriptionsCount: planDistribution?.totalSubscriptions || 0,
    
    // Top businesses info
    hasBusinessData: topBusinesses?.businesses && topBusinesses.businesses.length > 0,
    topBusinessesCount: topBusinesses?.totalShown || 0,
    
    // Growth stats info
    hasGrowthData: growthStats?.conversionRate !== null,
    conversionRatePercent: growthStats?.conversionRate?.value || 0,
    businessGrowthPercent: growthStats?.businessGrowth?.value || 0,
    revenueTrendPercent: growthStats?.revenueTrend?.value || 0,
    
    // Widget info
    hasWidgets: quickSummary?.widgets && quickSummary.widgets.length > 0,
    widgetCount: quickSummary?.widgets?.length || 0,
    
    // Auto refresh info
    isAutoRefreshEnabled: ui.autoRefresh,
    refreshInterval: ui.refreshInterval,
    lastRefreshTime: ui.lastRefresh ? new Date(ui.lastRefresh) : null,
    timeSinceLastRefresh: ui.lastRefresh 
      ? Math.floor((Date.now() - new Date(ui.lastRefresh).getTime()) / 1000)
      : null
  }), [
    loading, 
    errors, 
    mainMetrics, 
    revenueChart, 
    planDistribution, 
    topBusinesses, 
    growthStats, 
    quickSummary, 
    filters, 
    ui
  ]);

  // ====== HELPERS ======
  const helpers = useMemo(() => ({
    // Load all dashboard data
    loadAll: async (period = filters.period) => {
      await Promise.all([
        actions.fetchMainMetrics(period),
        actions.fetchRevenueChart(filters.chartMonths),
        actions.fetchPlanDistribution(),
        actions.fetchTopBusinesses(filters.topBusinessesLimit),
        actions.fetchGrowthStats(period),
        actions.fetchQuickSummary()
      ]);
      actions.updateLastRefresh();
    },

    // Refresh all data
    refresh: async () => {
      await helpers.loadAll(filters.period);
    },

    // Change period and reload relevant data
    changePeriod: async (newPeriod) => {
      actions.setPeriod(newPeriod);
      await Promise.all([
        actions.fetchMainMetrics(newPeriod),
        actions.fetchGrowthStats(newPeriod)
      ]);
    },

    // Change chart months and reload
    changeChartMonths: async (months) => {
      actions.setChartMonths(months);
      await actions.fetchRevenueChart(months);
    },

    // Change top businesses limit and reload
    changeTopBusinessesLimit: async (limit) => {
      actions.setTopBusinessesLimit(limit);
      await actions.fetchTopBusinesses(limit);
    },

    // Handle export
    exportData: async (format = 'json', period = filters.period) => {
      try {
        await actions.exportDashboardData({ format, period });
        return true;
      } catch (error) {
        console.error('Error exporting data:', error);
        return false;
      }
    },

    // Format currency values
    formatCurrency: (value, currency = 'COP') => {
      if (typeof value !== 'number') return '$0';
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: currency
      }).format(value);
    },

    // Format percentage
    formatPercentage: (value, decimals = 1) => {
      if (typeof value !== 'number') return '0%';
      return `${value.toFixed(decimals)}%`;
    },

    // Format large numbers
    formatNumber: (value) => {
      if (typeof value !== 'number') return '0';
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toString();
    },

    // Get widget by title
    getWidget: (title) => {
      return quickSummary?.widgets?.find(w => w.title === title);
    },

    // Get error message
    getError: (errorType) => {
      return errors[errorType];
    },

    // Clear specific error
    clearSpecificError: (errorType) => {
      actions.clearError(errorType);
    },

    // Check if specific section is loading
    isLoading: (section) => {
      return loading[section] || false;
    },

    // Get time since last refresh in human format
    getTimeSinceRefresh: () => {
      if (!computed.timeSinceLastRefresh) return 'Nunca';
      
      const seconds = computed.timeSinceLastRefresh;
      if (seconds < 60) return `${seconds}s`;
      
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m`;
      
      const hours = Math.floor(minutes / 60);
      return `${hours}h`;
    }
  }), [actions, filters, quickSummary, errors, loading, computed]);

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
    mainMetrics,
    revenueChart,
    planDistribution,
    topBusinesses,
    growthStats,
    quickSummary,
    
    // Loading states
    loading,
    isLoading: computed.isAnyLoading,
    
    // Error states
    errors,
    hasErrors: computed.hasErrors,
    
    // UI state
    ui,
    
    // Filters
    filters,
    
    // Actions
    actions,
    
    // Computed values
    computed,
    
    // Helpers
    helpers
  };
};

// Export como default para compatibilidad
export default useOwnerDashboard;