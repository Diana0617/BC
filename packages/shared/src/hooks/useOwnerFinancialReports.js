/**
 * Hook para Reportes Financieros del Owner
 * Proporciona acceso fácil y funciones helper para la generación de reportes financieros
 */

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  generateRevenueReport,
  generateCommissionReport,
  generatePaymentReport,
  generateBusinessPerformanceReport,
  generateSubscriptionReport,
  generateTaxReport,
  getFinancialSummary,
  getProfitAndLoss,
  getCashFlow,
  getRevenueProjection,
  exportReport,
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
  reset,
  selectRevenueReport,
  selectCommissionReport,
  selectPaymentReport,
  selectBusinessPerformanceReport,
  selectSubscriptionReport,
  selectTaxReport,
  selectFinancialSummary,
  selectProfitAndLoss,
  selectCashFlow,
  selectRevenueProjection,
  selectReportParams,
  selectFinancialReportsLoading,
  selectFinancialReportsErrors,
  selectFinancialReportsUI
} from '../store/slices/ownerFinancialReportsSlice';

export const useOwnerFinancialReports = () => {
  const dispatch = useDispatch();
  const intervalRef = useRef(null);

  // ====== SELECTORS ======
  const revenueReport = useSelector(selectRevenueReport);
  const commissionReport = useSelector(selectCommissionReport);
  const paymentReport = useSelector(selectPaymentReport);
  const businessPerformanceReport = useSelector(selectBusinessPerformanceReport);
  const subscriptionReport = useSelector(selectSubscriptionReport);
  const taxReport = useSelector(selectTaxReport);
  const financialSummary = useSelector(selectFinancialSummary);
  const profitAndLoss = useSelector(selectProfitAndLoss);
  const cashFlow = useSelector(selectCashFlow);
  const revenueProjection = useSelector(selectRevenueProjection);
  const reportParams = useSelector(selectReportParams);
  const loading = useSelector(selectFinancialReportsLoading);
  const errors = useSelector(selectFinancialReportsErrors);
  const ui = useSelector(selectFinancialReportsUI);

  // ====== COMPUTED VALUES ======
  const computedValues = useMemo(() => {
    const reports = {
      revenueReport,
      commissionReport,
      paymentReport,
      businessPerformanceReport,
      subscriptionReport,
      taxReport,
      financialSummary,
      profitAndLoss,
      cashFlow,
      revenueProjection
    };

    return {
      hasReports: Object.values(reports).some(report => report !== null),
      activeReportData: reports[`${ui.activeReport}Report`] || reports[ui.activeReport],
      hasParameters: Boolean(reportParams.startDate && reportParams.endDate),
      isCustomDateRange: ui.dateRange === 'custom',
      
      // Summary metrics from financial summary
      totalRevenue: financialSummary?.totalRevenue || 0,
      netRevenue: financialSummary?.netRevenue || 0,
      profitMargin: financialSummary?.profitMargin || 0,
      revenueGrowth: financialSummary?.revenueGrowth || 0,
      
      // Revenue report metrics
      revenueByBusiness: revenueReport?.byBusiness || [],
      revenueTimeline: revenueReport?.timeline || [],
      revenueTrends: revenueReport?.trends || {},
      
      // Commission report metrics
      totalCommissionsPaid: commissionReport?.totalCommissionsPaid || 0,
      totalCommissionsPending: commissionReport?.totalCommissionsPending || 0,
      averageCommissionRate: commissionReport?.averageCommissionRate || 0,
      
      // Payment report metrics
      paymentSuccessRate: paymentReport?.successRate || 0,
      refundRate: paymentReport?.refundRate || 0,
      disputeRate: paymentReport?.disputeRate || 0,
      averageTransactionValue: paymentReport?.averageTransactionValue || 0,
      
      // Business performance metrics
      topPerformers: businessPerformanceReport?.topPerformers || [],
      underPerformers: businessPerformanceReport?.underPerformers || [],
      
      // Subscription metrics
      monthlyRecurringRevenue: subscriptionReport?.mrr || 0,
      annualRecurringRevenue: subscriptionReport?.arr || 0,
      churnRate: subscriptionReport?.churnRate || 0,
      renewalRate: subscriptionReport?.renewalRate || 0,
      
      // Tax metrics
      grossRevenue: taxReport?.grossRevenue || 0,
      taxableIncome: taxReport?.taxableIncome || 0,
      totalTaxes: taxReport?.totalTaxes || 0,
      
      // P&L metrics
      grossProfit: profitAndLoss?.grossProfit || 0,
      operatingIncome: profitAndLoss?.operatingIncome || 0,
      netIncome: profitAndLoss?.netIncome || 0,
      
      // Cash flow metrics
      cashPosition: cashFlow?.cashPosition || 0,
      operatingCashFlow: cashFlow?.operatingCashFlow || 0,
      
      // Projection metrics
      projectedRevenue: revenueProjection?.projections || [],
      projectionAccuracy: revenueProjection?.accuracy || {},
      
      // Loading states
      isLoadingAnyReport: Object.values(loading).some(isLoading => isLoading),
      loadingStates: loading,
      
      // Error states
      hasErrors: Object.values(errors).some(error => error !== null),
      errorStates: errors
    };
  }, [
    revenueReport, commissionReport, paymentReport, businessPerformanceReport,
    subscriptionReport, taxReport, financialSummary, profitAndLoss, cashFlow,
    revenueProjection, reportParams, ui, loading, errors
  ]);

  // ====== API ACTIONS ======
  const actions = useMemo(() => ({
    // Report generation
    generateRevenue: (params = reportParams) => dispatch(generateRevenueReport(params)),
    generateCommission: (params = reportParams) => dispatch(generateCommissionReport(params)),
    generatePayment: (params = reportParams) => dispatch(generatePaymentReport(params)),
    generateBusinessPerformance: (params = reportParams) => dispatch(generateBusinessPerformanceReport(params)),
    generateSubscription: (params = reportParams) => dispatch(generateSubscriptionReport(params)),
    generateTax: (params = reportParams) => dispatch(generateTaxReport(params)),
    
    // Financial data
    loadFinancialSummary: (params = reportParams) => dispatch(getFinancialSummary(params)),
    loadProfitAndLoss: (params = reportParams) => dispatch(getProfitAndLoss(params)),
    loadCashFlow: (params = reportParams) => dispatch(getCashFlow(params)),
    loadRevenueProjection: (params = {}) => dispatch(getRevenueProjection(params)),
    
    // Export
    exportCurrentReport: (format = ui.exportFormat) => {
      if (ui.selectedReportForExport) {
        dispatch(exportReport({
          reportType: ui.selectedReportForExport,
          params: reportParams,
          format
        }));
      }
    },
    
    // Parameters
    updateParams: (params) => dispatch(setReportParams(params)),
    setDateRange: (startDate, endDate) => {
      dispatch(setStartDate(startDate));
      dispatch(setEndDate(endDate));
    },
    changeBusinessId: (businessId) => dispatch(setBusinessId(businessId)),
    changeCurrency: (currency) => dispatch(setCurrency(currency)),
    changeGranularity: (granularity) => dispatch(setGranularity(granularity)),
    changeGroupBy: (groupBy) => dispatch(setGroupBy(groupBy)),
    toggleRefunds: () => dispatch(toggleIncludeRefunds()),
    toggleDisputes: () => dispatch(toggleIncludeDisputes()),
    toggleComparison: () => dispatch(toggleCompareWithPrevious()),
    resetParams: () => dispatch(resetReportParams()),
    
    // UI Management
    changeActiveReport: (reportType) => dispatch(setActiveReport(reportType)),
    showParametersModal: () => dispatch(openParametersModal()),
    hideParametersModal: () => dispatch(closeParametersModal()),
    showExportModal: (reportType) => dispatch(openExportModal(reportType)),
    hideExportModal: () => dispatch(closeExportModal()),
    changeExportFormat: (format) => dispatch(setExportFormat(format)),
    toggleComparison: () => dispatch(toggleComparisonMode()),
    changeDateRange: (range) => dispatch(setDateRange(range)),
    changeChartType: (type) => dispatch(setChartType(type)),
    changeViewMode: (mode) => dispatch(setViewMode(mode)),
    changeComparisonPeriod: (period) => dispatch(setComparisonPeriod(period)),
    
    // Auto-refresh
    toggleRefresh: () => dispatch(toggleAutoRefresh()),
    setInterval: (interval) => dispatch(setRefreshInterval(interval)),
    
    // Data management
    clearSpecificReport: (reportType) => dispatch(clearReport(reportType)),
    clearAll: () => dispatch(clearAllReports()),
    
    // Error handling
    clearAllErrors: () => dispatch(clearErrors()),
    clearSpecificError: (errorType) => dispatch(clearError(errorType)),
    
    // Reset
    resetState: () => dispatch(reset())
  }), [dispatch, reportParams, ui.exportFormat, ui.selectedReportForExport]);

  // ====== HELPER FUNCTIONS ======
  const helpers = useMemo(() => ({
    // Format helpers
    formatCurrency: (amount, currency = reportParams.currency) => {
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
    
    formatPercentage: (value, decimals = 1) => {
      if (value === null || value === undefined) return '-';
      return `${Number(value).toFixed(decimals)}%`;
    },
    
    formatNumber: (value, decimals = 0) => {
      if (value === null || value === undefined) return '-';
      return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value);
    },
    
    formatDate: (date) => {
      if (!date) return '-';
      return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(new Date(date));
    },
    
    formatDateRange: () => {
      if (!reportParams.startDate || !reportParams.endDate) return 'Sin fechas definidas';
      return `${helpers.formatDate(reportParams.startDate)} - ${helpers.formatDate(reportParams.endDate)}`;
    },
    
    // Analysis helpers
    calculateGrowth: (current, previous) => {
      if (!previous || previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    },
    
    calculateMargin: (revenue, cost) => {
      if (!revenue || revenue === 0) return 0;
      return ((revenue - cost) / revenue) * 100;
    },
    
    getGrowthColor: (growth) => {
      if (growth > 0) return 'success';
      if (growth < 0) return 'error';
      return 'warning';
    },
    
    getGrowthIcon: (growth) => {
      if (growth > 0) return 'trending_up';
      if (growth < 0) return 'trending_down';
      return 'trending_flat';
    },
    
    // Report helpers
    getReportTitle: (reportType) => {
      const titles = {
        'revenue': 'Reporte de Ingresos',
        'commission': 'Reporte de Comisiones',
        'payment': 'Reporte de Pagos',
        'business': 'Reporte de Rendimiento de Negocios',
        'subscription': 'Reporte de Suscripciones',
        'tax': 'Reporte Fiscal',
        'financialSummary': 'Resumen Financiero',
        'profitAndLoss': 'Estado de Pérdidas y Ganancias',
        'cashFlow': 'Flujo de Caja',
        'revenueProjection': 'Proyección de Ingresos'
      };
      return titles[reportType] || reportType;
    },
    
    getReportStatus: (reportType) => {
      const report = computedValues.activeReportData;
      const isLoading = loading[reportType] || loading[`${reportType}Report`];
      const hasError = errors[reportType] || errors[`${reportType}Report`];
      const hasData = report !== null;
      
      if (isLoading) return 'loading';
      if (hasError) return 'error';
      if (hasData) return 'ready';
      return 'empty';
    },
    
    canExport: (reportType) => {
      const report = reportType === ui.activeReport ? computedValues.activeReportData : null;
      return report !== null && !loading.exporting;
    },
    
    // Chart helpers
    prepareChartData: (data, xKey = 'date', yKey = 'value') => {
      if (!Array.isArray(data)) return [];
      
      return data.map((item, index) => ({
        x: item[xKey] || index,
        y: item[yKey] || 0,
        label: item.label || item[xKey] || `Item ${index + 1}`
      }));
    },
    
    getChartColors: (count = 1) => {
      const colors = [
        '#1976d2', '#388e3c', '#f57c00', '#d32f2f',
        '#7b1fa2', '#5d4037', '#455a64', '#e64a19',
        '#00796b', '#303f9f'
      ];
      
      return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
    },
    
    // Validation helpers
    hasValidDateRange: () => {
      return Boolean(reportParams.startDate && reportParams.endDate);
    },
    
    isDateRangeValid: () => {
      if (!reportParams.startDate || !reportParams.endDate) return false;
      return new Date(reportParams.startDate) <= new Date(reportParams.endDate);
    },
    
    getDateRangeInDays: () => {
      if (!helpers.hasValidDateRange()) return 0;
      const start = new Date(reportParams.startDate);
      const end = new Date(reportParams.endDate);
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    
    // Export helpers
    getExportFormats: () => [
      { value: 'pdf', label: 'PDF' },
      { value: 'excel', label: 'Excel' },
      { value: 'csv', label: 'CSV' }
    ],
    
    getAvailableReports: () => [
      { value: 'revenue', label: 'Ingresos', available: revenueReport !== null },
      { value: 'commission', label: 'Comisiones', available: commissionReport !== null },
      { value: 'payment', label: 'Pagos', available: paymentReport !== null },
      { value: 'business', label: 'Rendimiento', available: businessPerformanceReport !== null },
      { value: 'subscription', label: 'Suscripciones', available: subscriptionReport !== null },
      { value: 'tax', label: 'Fiscal', available: taxReport !== null }
    ]
  }), [reportParams, computedValues, loading, errors, ui, revenueReport, commissionReport, paymentReport, businessPerformanceReport, subscriptionReport, taxReport]);

  // ====== AUTO-REFRESH EFFECT ======
  useEffect(() => {
    if (ui.autoRefresh && helpers.hasValidDateRange()) {
      intervalRef.current = setInterval(() => {
        // Refresh the active report
        const refreshActions = {
          'revenue': actions.generateRevenue,
          'commission': actions.generateCommission,
          'payment': actions.generatePayment,
          'business': actions.generateBusinessPerformance,
          'subscription': actions.generateSubscription,
          'tax': actions.generateTax,
          'financialSummary': actions.loadFinancialSummary,
          'profitAndLoss': actions.loadProfitAndLoss,
          'cashFlow': actions.loadCashFlow,
          'revenueProjection': actions.loadRevenueProjection
        };
        
        const refreshAction = refreshActions[ui.activeReport];
        if (refreshAction) {
          refreshAction();
        }
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
  }, [ui.autoRefresh, ui.refreshInterval, ui.activeReport, helpers.hasValidDateRange(), actions]);

  // ====== INITIAL DATA LOAD ======
  const loadInitialData = useCallback(() => {
    if (helpers.hasValidDateRange()) {
      actions.loadFinancialSummary();
    }
  }, [helpers.hasValidDateRange(), actions.loadFinancialSummary]);

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
    revenueReport,
    commissionReport,
    paymentReport,
    businessPerformanceReport,
    subscriptionReport,
    taxReport,
    financialSummary,
    profitAndLoss,
    cashFlow,
    revenueProjection,
    reportParams,
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

export default useOwnerFinancialReports;