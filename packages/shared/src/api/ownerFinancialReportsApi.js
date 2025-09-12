/**
 * API para Reportes Financieros del Owner
 * Endpoints para generar reportes de ingresos, comisiones, análisis financiero y exportaciones
 */

import { api } from './client';

const FINANCIAL_REPORTS_ENDPOINTS = {
  REVENUE_REPORT: '/owner/reports/revenue',
  COMMISSION_REPORT: '/owner/reports/commissions',
  PAYMENT_REPORT: '/owner/reports/payments',
  BUSINESS_PERFORMANCE: '/owner/reports/business-performance',
  SUBSCRIPTION_REPORT: '/owner/reports/subscriptions',
  TAX_REPORT: '/owner/reports/tax',
  FINANCIAL_SUMMARY: '/owner/reports/financial-summary',
  PROFIT_AND_LOSS: '/owner/reports/profit-loss',
  CASH_FLOW: '/owner/reports/cash-flow',
  REVENUE_PROJECTION: '/owner/reports/revenue-projection',
  EXPORT: '/owner/reports/export',
  SCHEDULED_REPORTS: '/owner/reports/scheduled'
};

export const ownerFinancialReportsApi = {
  /**
   * Generar reporte de ingresos
   * @param {Object} params - Parámetros del reporte
   */
  async generateRevenueReport(params = {}) {
    try {
      const response = await api.post(FINANCIAL_REPORTS_ENDPOINTS.REVENUE_REPORT, {
        startDate: params.startDate,
        endDate: params.endDate,
        businessId: params.businessId,
        currency: params.currency || 'COP',
        granularity: params.granularity || 'monthly',
        groupBy: params.groupBy || 'business',
        includeRefunds: params.includeRefunds !== false,
        includeDisputes: params.includeDisputes || false,
        compareWithPrevious: params.compareWithPrevious || false
      });
      
      return {
        summary: response.data.summary || {},
        timeline: response.data.timeline || [],
        byBusiness: response.data.byBusiness || [],
        byPlan: response.data.byPlan || [],
        byMethod: response.data.byMethod || [],
        comparison: response.data.comparison || null,
        trends: response.data.trends || {},
        projections: response.data.projections || [],
        generatedAt: response.data.generatedAt || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating revenue report:', error);
      throw error;
    }
  },

  /**
   * Generar reporte de comisiones
   * @param {Object} params - Parámetros del reporte
   */
  async generateCommissionReport(params = {}) {
    try {
      const response = await api.post(FINANCIAL_REPORTS_ENDPOINTS.COMMISSION_REPORT, {
        startDate: params.startDate,
        endDate: params.endDate,
        businessId: params.businessId,
        status: params.status, // pending, paid, cancelled
        currency: params.currency || 'COP',
        granularity: params.granularity || 'monthly'
      });
      
      return {
        summary: response.data.summary || {},
        commissions: response.data.commissions || [],
        byBusiness: response.data.byBusiness || [],
        byStatus: response.data.byStatus || {},
        timeline: response.data.timeline || [],
        pendingPayments: response.data.pendingPayments || [],
        totalCommissionsPaid: response.data.totalCommissionsPaid || 0,
        totalCommissionsPending: response.data.totalCommissionsPending || 0,
        averageCommissionRate: response.data.averageCommissionRate || 0,
        generatedAt: response.data.generatedAt || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating commission report:', error);
      throw error;
    }
  },

  /**
   * Generar reporte de pagos
   * @param {Object} params - Parámetros del reporte
   */
  async generatePaymentReport(params = {}) {
    try {
      const response = await api.post(FINANCIAL_REPORTS_ENDPOINTS.PAYMENT_REPORT, {
        startDate: params.startDate,
        endDate: params.endDate,
        businessId: params.businessId,
        status: params.status,
        method: params.method,
        currency: params.currency || 'COP',
        granularity: params.granularity || 'monthly'
      });
      
      return {
        summary: response.data.summary || {},
        payments: response.data.payments || [],
        byStatus: response.data.byStatus || {},
        byMethod: response.data.byMethod || {},
        byBusiness: response.data.byBusiness || [],
        timeline: response.data.timeline || [],
        successRate: response.data.successRate || 0,
        refundRate: response.data.refundRate || 0,
        disputeRate: response.data.disputeRate || 0,
        averageTransactionValue: response.data.averageTransactionValue || 0,
        failureReasons: response.data.failureReasons || {},
        generatedAt: response.data.generatedAt || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating payment report:', error);
      throw error;
    }
  },

  /**
   * Generar reporte de rendimiento de negocios
   * @param {Object} params - Parámetros del reporte
   */
  async generateBusinessPerformanceReport(params = {}) {
    try {
      const response = await api.post(FINANCIAL_REPORTS_ENDPOINTS.BUSINESS_PERFORMANCE, {
        startDate: params.startDate,
        endDate: params.endDate,
        businessId: params.businessId,
        currency: params.currency || 'COP',
        granularity: params.granularity || 'monthly',
        metrics: params.metrics || ['revenue', 'growth', 'retention', 'churn']
      });
      
      return {
        summary: response.data.summary || {},
        businesses: response.data.businesses || [],
        topPerformers: response.data.topPerformers || [],
        underPerformers: response.data.underPerformers || [],
        revenueGrowth: response.data.revenueGrowth || [],
        customerMetrics: response.data.customerMetrics || {},
        subscriptionMetrics: response.data.subscriptionMetrics || {},
        churnAnalysis: response.data.churnAnalysis || {},
        retentionAnalysis: response.data.retentionAnalysis || {},
        profitabilityAnalysis: response.data.profitabilityAnalysis || {},
        generatedAt: response.data.generatedAt || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating business performance report:', error);
      throw error;
    }
  },

  /**
   * Generar reporte de suscripciones
   * @param {Object} params - Parámetros del reporte
   */
  async generateSubscriptionReport(params = {}) {
    try {
      const response = await api.post(FINANCIAL_REPORTS_ENDPOINTS.SUBSCRIPTION_REPORT, {
        startDate: params.startDate,
        endDate: params.endDate,
        businessId: params.businessId,
        planId: params.planId,
        status: params.status,
        currency: params.currency || 'COP',
        granularity: params.granularity || 'monthly'
      });
      
      return {
        summary: response.data.summary || {},
        subscriptions: response.data.subscriptions || [],
        byStatus: response.data.byStatus || {},
        byPlan: response.data.byPlan || {},
        byBusiness: response.data.byBusiness || [],
        timeline: response.data.timeline || [],
        newSubscriptions: response.data.newSubscriptions || [],
        cancelledSubscriptions: response.data.cancelledSubscriptions || [],
        renewalRate: response.data.renewalRate || 0,
        churnRate: response.data.churnRate || 0,
        avgSubscriptionLength: response.data.avgSubscriptionLength || 0,
        mrr: response.data.mrr || 0, // Monthly Recurring Revenue
        arr: response.data.arr || 0, // Annual Recurring Revenue
        ltv: response.data.ltv || 0, // Lifetime Value
        generatedAt: response.data.generatedAt || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating subscription report:', error);
      throw error;
    }
  },

  /**
   * Generar reporte fiscal/tributario
   * @param {Object} params - Parámetros del reporte
   */
  async generateTaxReport(params = {}) {
    try {
      const response = await api.post(FINANCIAL_REPORTS_ENDPOINTS.TAX_REPORT, {
        startDate: params.startDate,
        endDate: params.endDate,
        taxYear: params.taxYear,
        businessId: params.businessId,
        currency: params.currency || 'COP',
        includeWithholdings: params.includeWithholdings !== false,
        includeIVA: params.includeIVA !== false
      });
      
      return {
        summary: response.data.summary || {},
        grossRevenue: response.data.grossRevenue || 0,
        netRevenue: response.data.netRevenue || 0,
        totalTaxes: response.data.totalTaxes || 0,
        ivaCollected: response.data.ivaCollected || 0,
        retentions: response.data.retentions || 0,
        deductions: response.data.deductions || [],
        taxableIncome: response.data.taxableIncome || 0,
        byMonth: response.data.byMonth || [],
        byBusiness: response.data.byBusiness || [],
        taxDocuments: response.data.taxDocuments || [],
        complianceStatus: response.data.complianceStatus || {},
        generatedAt: response.data.generatedAt || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating tax report:', error);
      throw error;
    }
  },

  /**
   * Obtener resumen financiero
   * @param {Object} params - Parámetros del resumen
   */
  async getFinancialSummary(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.businessId) queryParams.append('businessId', params.businessId);
      if (params.currency) queryParams.append('currency', params.currency);
      
      const response = await api.get(`${FINANCIAL_REPORTS_ENDPOINTS.FINANCIAL_SUMMARY}?${queryParams}`);
      
      return {
        totalRevenue: response.data.totalRevenue || 0,
        netRevenue: response.data.netRevenue || 0,
        totalExpenses: response.data.totalExpenses || 0,
        grossProfit: response.data.grossProfit || 0,
        profitMargin: response.data.profitMargin || 0,
        totalCommissions: response.data.totalCommissions || 0,
        totalRefunds: response.data.totalRefunds || 0,
        totalDisputes: response.data.totalDisputes || 0,
        activeSubscriptions: response.data.activeSubscriptions || 0,
        totalBusinesses: response.data.totalBusinesses || 0,
        averageRevenuePerBusiness: response.data.averageRevenuePerBusiness || 0,
        revenueGrowth: response.data.revenueGrowth || 0,
        monthlyRecurringRevenue: response.data.monthlyRecurringRevenue || 0,
        keyMetrics: response.data.keyMetrics || {},
        trends: response.data.trends || {},
        alerts: response.data.alerts || []
      };
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      throw error;
    }
  },

  /**
   * Obtener estado de pérdidas y ganancias
   * @param {Object} params - Parámetros del P&L
   */
  async getProfitAndLoss(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.businessId) queryParams.append('businessId', params.businessId);
      if (params.currency) queryParams.append('currency', params.currency);
      if (params.granularity) queryParams.append('granularity', params.granularity);
      
      const response = await api.get(`${FINANCIAL_REPORTS_ENDPOINTS.PROFIT_AND_LOSS}?${queryParams}`);
      
      return {
        revenue: response.data.revenue || {},
        expenses: response.data.expenses || {},
        grossProfit: response.data.grossProfit || 0,
        operatingExpenses: response.data.operatingExpenses || 0,
        operatingIncome: response.data.operatingIncome || 0,
        netIncome: response.data.netIncome || 0,
        margins: response.data.margins || {},
        timeline: response.data.timeline || [],
        comparison: response.data.comparison || null,
        generatedAt: response.data.generatedAt || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching profit and loss:', error);
      throw error;
    }
  },

  /**
   * Obtener flujo de caja
   * @param {Object} params - Parámetros del cash flow
   */
  async getCashFlow(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.businessId) queryParams.append('businessId', params.businessId);
      if (params.currency) queryParams.append('currency', params.currency);
      if (params.granularity) queryParams.append('granularity', params.granularity);
      
      const response = await api.get(`${FINANCIAL_REPORTS_ENDPOINTS.CASH_FLOW}?${queryParams}`);
      
      return {
        cashInflows: response.data.cashInflows || [],
        cashOutflows: response.data.cashOutflows || [],
        netCashFlow: response.data.netCashFlow || [],
        cumulativeCashFlow: response.data.cumulativeCashFlow || [],
        cashPosition: response.data.cashPosition || 0,
        operatingCashFlow: response.data.operatingCashFlow || 0,
        investingCashFlow: response.data.investingCashFlow || 0,
        financingCashFlow: response.data.financingCashFlow || 0,
        timeline: response.data.timeline || [],
        projections: response.data.projections || [],
        generatedAt: response.data.generatedAt || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching cash flow:', error);
      throw error;
    }
  },

  /**
   * Obtener proyección de ingresos
   * @param {Object} params - Parámetros de la proyección
   */
  async getRevenueProjection(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.months) queryParams.append('months', params.months);
      if (params.businessId) queryParams.append('businessId', params.businessId);
      if (params.currency) queryParams.append('currency', params.currency);
      if (params.model) queryParams.append('model', params.model); // linear, exponential, seasonal
      if (params.confidence) queryParams.append('confidence', params.confidence);
      
      const response = await api.get(`${FINANCIAL_REPORTS_ENDPOINTS.REVENUE_PROJECTION}?${queryParams}`);
      
      return {
        projections: response.data.projections || [],
        confidenceIntervals: response.data.confidenceIntervals || [],
        scenarios: response.data.scenarios || {},
        assumptions: response.data.assumptions || [],
        historicalData: response.data.historicalData || [],
        accuracy: response.data.accuracy || {},
        model: response.data.model || 'linear',
        generatedAt: response.data.generatedAt || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching revenue projection:', error);
      throw error;
    }
  },

  /**
   * Exportar reporte
   * @param {string} reportType - Tipo de reporte
   * @param {Object} params - Parámetros del reporte
   * @param {string} format - Formato de exportación (pdf, excel, csv)
   */
  async exportReport(reportType, params = {}, format = 'pdf') {
    try {
      const response = await api.post(FINANCIAL_REPORTS_ENDPOINTS.EXPORT, {
        reportType,
        params,
        format,
        exportedAt: new Date().toISOString()
      }, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on report type and format
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = format === 'excel' ? 'xlsx' : format === 'csv' ? 'csv' : 'pdf';
      const reportNames = {
        'revenue': 'reporte_ingresos',
        'commission': 'reporte_comisiones',
        'payment': 'reporte_pagos',
        'business': 'reporte_negocios',
        'subscription': 'reporte_suscripciones',
        'tax': 'reporte_fiscal'
      };
      
      const fileName = `${reportNames[reportType] || reportType}_${timestamp}.${extension}`;
      link.setAttribute('download', fileName);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Reporte exportado exitosamente', fileName };
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  },

  /**
   * Programar reporte automático
   * @param {Object} scheduleData - Datos del reporte programado
   */
  async scheduleReport(scheduleData) {
    try {
      const response = await api.post(FINANCIAL_REPORTS_ENDPOINTS.SCHEDULED_REPORTS, {
        reportType: scheduleData.reportType,
        frequency: scheduleData.frequency, // daily, weekly, monthly, quarterly
        recipients: scheduleData.recipients,
        format: scheduleData.format || 'pdf',
        params: scheduleData.params || {},
        active: scheduleData.active !== false,
        nextRun: scheduleData.nextRun,
        timezone: scheduleData.timezone || 'America/Bogota'
      });
      
      return response.data.scheduledReport;
    } catch (error) {
      console.error('Error scheduling report:', error);
      throw error;
    }
  },

  /**
   * Obtener reportes programados
   */
  async getScheduledReports() {
    try {
      const response = await api.get(FINANCIAL_REPORTS_ENDPOINTS.SCHEDULED_REPORTS);
      
      return response.data.scheduledReports || [];
    } catch (error) {
      console.error('Error fetching scheduled reports:', error);
      throw error;
    }
  },

  /**
   * Actualizar reporte programado
   * @param {string} scheduleId - ID del reporte programado
   * @param {Object} updateData - Datos a actualizar
   */
  async updateScheduledReport(scheduleId, updateData) {
    try {
      const response = await api.put(`${FINANCIAL_REPORTS_ENDPOINTS.SCHEDULED_REPORTS}/${scheduleId}`, updateData);
      
      return response.data.scheduledReport;
    } catch (error) {
      console.error('Error updating scheduled report:', error);
      throw error;
    }
  },

  /**
   * Eliminar reporte programado
   * @param {string} scheduleId - ID del reporte programado
   */
  async deleteScheduledReport(scheduleId) {
    try {
      await api.delete(`${FINANCIAL_REPORTS_ENDPOINTS.SCHEDULED_REPORTS}/${scheduleId}`);
      
      return { success: true, message: 'Reporte programado eliminado exitosamente' };
    } catch (error) {
      console.error('Error deleting scheduled report:', error);
      throw error;
    }
  }
};

export default ownerFinancialReportsApi;