/**
 * API para Gestión de Pagos del Owner
 * Endpoints para procesar pagos, reembolsos, disputas y análisis financiero
 */

import { api } from './client';

const PAYMENTS_ENDPOINTS = {
  GET_ALL: '/api/owner/subscription-status/payments',
  PROCESS: '/owner/payments/process',
  REFUND: (id) => `/owner/payments/${id}/refund`,
  UPDATE_STATUS: (id) => `/owner/payments/${id}/status`,
  DETAILS: (id) => `/owner/payments/${id}`,
  STATS: '/api/owner/subscription-status/payments/stats',
  ANALYTICS: '/owner/payments/analytics',
  DISPUTE: (id) => `/owner/payments/${id}/dispute`,
  COMMISSIONS: '/owner/payments/commissions',
  COMMISSION_PAYMENT: '/owner/payments/commissions/pay',
  EXPORT: '/owner/payments/export',
  BULK_ACTIONS: '/owner/payments/bulk',
  RECONCILIATION: '/owner/payments/reconciliation'
};

export const ownerPaymentsApi = {
  /**
   * Obtener todos los pagos con filtros y paginación
   * @param {Object} params - Parámetros de consulta
   */
  async getAllPayments(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
  // Filters
  if (params.status) queryParams.append('status', params.status);
  if (params.method) queryParams.append('method', params.method);
  if (params.businessId) queryParams.append('businessId', params.businessId);
  if (params.subscriptionId) queryParams.append('subscriptionId', params.subscriptionId);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.minAmount) queryParams.append('minAmount', params.minAmount);
  if (params.maxAmount) queryParams.append('maxAmount', params.maxAmount);
  if (params.currency) queryParams.append('currency', params.currency);
  if (params.search) queryParams.append('search', params.search);
      
      // Sorting
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const response = await api.get(`${PAYMENTS_ENDPOINTS.GET_ALL}?${queryParams}`);
      // Retornar el objeto data completo del backend
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  /**
   * Procesar nuevo pago
   * @param {Object} paymentData - Datos del pago
   */
  async processPayment(paymentData) {
    try {
      const response = await api.post(PAYMENTS_ENDPOINTS.PROCESS, {
        businessId: paymentData.businessId,
        subscriptionId: paymentData.subscriptionId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'COP',
        method: paymentData.method, // wompi, cash, bank_transfer
        description: paymentData.description,
        reference: paymentData.reference,
        customerInfo: paymentData.customerInfo,
        metadata: paymentData.metadata || {},
        paymentMethodData: paymentData.paymentMethodData,
        webhookUrl: paymentData.webhookUrl,
        redirectUrl: paymentData.redirectUrl
      });
      
      return response.data.payment;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  /**
   * Procesar reembolso
   * @param {string} paymentId - ID del pago
   * @param {number} amount - Cantidad a reembolsar
   * @param {string} reason - Razón del reembolso
   */
  async processRefund(paymentId, amount, reason) {
    try {
      const response = await api.post(PAYMENTS_ENDPOINTS.REFUND(paymentId), {
        amount,
        reason,
        refundDate: new Date().toISOString()
      });
      
      return response.data.payment;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  },

  /**
   * Actualizar estado del pago
   * @param {string} paymentId - ID del pago
   * @param {string} status - Nuevo estado
   * @param {string} notes - Notas adicionales
   */
  async updatePaymentStatus(paymentId, status, notes) {
    try {
      const response = await api.put(PAYMENTS_ENDPOINTS.UPDATE_STATUS(paymentId), {
        status,
        notes,
        updatedAt: new Date().toISOString()
      });
      
      return response.data.payment;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  /**
   * Obtener detalles completos del pago
   * @param {string} paymentId - ID del pago
   */
  async getPaymentDetails(paymentId) {
    try {
      const response = await api.get(PAYMENTS_ENDPOINTS.DETAILS(paymentId));
      
      return {
        ...response.data.payment,
        business: response.data.business || null,
        subscription: response.data.subscription || null,
        transactions: response.data.transactions || [],
        refunds: response.data.refunds || [],
        disputes: response.data.disputes || [],
        webhookHistory: response.data.webhookHistory || []
      };
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de pagos
   * @param {Object} params - Parámetros para las estadísticas
   */
  async getPaymentStats(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.businessId) queryParams.append('businessId', params.businessId);
      if (params.currency) queryParams.append('currency', params.currency);
      
      const response = await api.get(`${PAYMENTS_ENDPOINTS.STATS}?${queryParams}`);
      
      return {
        totalPayments: response.data.totalPayments || 0,
        successfulPayments: response.data.successfulPayments || 0,
        failedPayments: response.data.failedPayments || 0,
        pendingPayments: response.data.pendingPayments || 0,
        refundedPayments: response.data.refundedPayments || 0,
        disputedPayments: response.data.disputedPayments || 0,
        totalRevenue: response.data.totalRevenue || 0,
        totalRefunds: response.data.totalRefunds || 0,
        netRevenue: response.data.netRevenue || 0,
        averagePaymentAmount: response.data.averagePaymentAmount || 0,
        paymentSuccessRate: response.data.paymentSuccessRate || 0,
        refundRate: response.data.refundRate || 0,
        disputeRate: response.data.disputeRate || 0,
        methodDistribution: response.data.methodDistribution || {},
        statusDistribution: response.data.statusDistribution || {},
        dailyStats: response.data.dailyStats || [],
        monthlyStats: response.data.monthlyStats || []
      };
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  },

  /**
   * Obtener analytics de ingresos
   * @param {Object} params - Parámetros para analytics
   */
  async getRevenueAnalytics(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.granularity) queryParams.append('granularity', params.granularity); // daily, weekly, monthly
      if (params.businessId) queryParams.append('businessId', params.businessId);
      if (params.currency) queryParams.append('currency', params.currency);
      
      const response = await api.get(`${PAYMENTS_ENDPOINTS.ANALYTICS}?${queryParams}`);
      
      return {
        revenueTimeline: response.data.revenueTimeline || [],
        revenueByBusiness: response.data.revenueByBusiness || [],
        revenueByPlan: response.data.revenueByPlan || [],
        revenueByMethod: response.data.revenueByMethod || [],
        revenueGrowth: response.data.revenueGrowth || 0,
        revenueProjection: response.data.revenueProjection || [],
        topPerformingBusinesses: response.data.topPerformingBusinesses || [],
        paymentTrends: response.data.paymentTrends || {},
        seasonalAnalysis: response.data.seasonalAnalysis || {},
        cohortAnalysis: response.data.cohortAnalysis || []
      };
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      throw error;
    }
  },

  /**
   * Gestionar disputa de pago
   * @param {string} paymentId - ID del pago
   * @param {string} action - Acción (accept, contest, resolve)
   * @param {string} notes - Notas sobre la disputa
   * @param {Array} evidence - Evidencias para la disputa
   */
  async handlePaymentDispute(paymentId, action, notes, evidence = []) {
    try {
      const response = await api.post(PAYMENTS_ENDPOINTS.DISPUTE(paymentId), {
        action,
        notes,
        evidence,
        handledAt: new Date().toISOString()
      });
      
      return response.data.payment;
    } catch (error) {
      console.error('Error handling payment dispute:', error);
      throw error;
    }
  },

  /**
   * Obtener detalles de comisiones
   * @param {Object} params - Parámetros para comisiones
   */
  async getCommissionDetails(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.businessId) queryParams.append('businessId', params.businessId);
      if (params.status) queryParams.append('status', params.status); // pending, paid, cancelled
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const response = await api.get(`${PAYMENTS_ENDPOINTS.COMMISSIONS}?${queryParams}`);
      
      return response.data.commissions || [];
    } catch (error) {
      console.error('Error fetching commission details:', error);
      throw error;
    }
  },

  /**
   * Procesar pago de comisión
   * @param {Object} commissionData - Datos de la comisión a pagar
   */
  async processCommissionPayment(commissionData) {
    try {
      const response = await api.post(PAYMENTS_ENDPOINTS.COMMISSION_PAYMENT, {
        commissionIds: commissionData.commissionIds,
        paymentMethod: commissionData.paymentMethod,
        bankAccount: commissionData.bankAccount,
        notes: commissionData.notes,
        processedAt: new Date().toISOString()
      });
      
      return response.data.commissionPayment;
    } catch (error) {
      console.error('Error processing commission payment:', error);
      throw error;
    }
  },

  /**
   * Exportar pagos
   * @param {Object} filters - Filtros para la exportación
   * @param {string} format - Formato de exportación (csv, xlsx, pdf)
   */
  async exportPayments(filters = {}, format = 'csv') {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });
      
      queryParams.append('format', format);
      
      const response = await api.get(`${PAYMENTS_ENDPOINTS.EXPORT}?${queryParams}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on format
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = format === 'xlsx' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv';
      link.setAttribute('download', `payments_${timestamp}.${extension}`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Exportación completada exitosamente' };
    } catch (error) {
      console.error('Error exporting payments:', error);
      throw error;
    }
  },

  /**
   * Acciones en lote para múltiples pagos
   * @param {Array} paymentIds - IDs de los pagos
   * @param {string} action - Acción a realizar (refund, mark_as_paid, cancel)
   * @param {Object} data - Datos adicionales para la acción
   */
  async bulkActions(paymentIds, action, data = {}) {
    try {
      const response = await api.post(PAYMENTS_ENDPOINTS.BULK_ACTIONS, {
        paymentIds,
        action,
        data,
        performedAt: new Date().toISOString()
      });
      
      return {
        success: response.data.success || true,
        updatedPayments: response.data.updatedPayments || [],
        failedUpdates: response.data.failedUpdates || [],
        message: response.data.message || 'Acciones realizadas exitosamente'
      };
    } catch (error) {
      console.error('Error performing bulk actions:', error);
      throw error;
    }
  },

  /**
   * Reconciliación de pagos
   * @param {Object} params - Parámetros para reconciliación
   */
  async reconcilePayments(params = {}) {
    try {
      const response = await api.post(PAYMENTS_ENDPOINTS.RECONCILIATION, {
        startDate: params.startDate,
        endDate: params.endDate,
        provider: params.provider, // wompi, manual
        reconciliationType: params.reconciliationType || 'automatic'
      });
      
      return {
        reconciledPayments: response.data.reconciledPayments || [],
        discrepancies: response.data.discrepancies || [],
        summary: response.data.summary || {}
      };
    } catch (error) {
      console.error('Error reconciling payments:', error);
      throw error;
    }
  },

  /**
   * Buscar pagos por término
   * @param {string} searchTerm - Término de búsqueda
   */
  async searchPayments(searchTerm) {
    try {
      const response = await api.get(`${PAYMENTS_ENDPOINTS.GET_ALL}?search=${encodeURIComponent(searchTerm)}`);
      
      return response.data.payments || [];
    } catch (error) {
      console.error('Error searching payments:', error);
      throw error;
    }
  },

  /**
   * Obtener pagos pendientes
   */
  async getPendingPayments() {
    try {
      const response = await api.get(`${PAYMENTS_ENDPOINTS.GET_ALL}?status=pending`);
      
      return response.data.payments || [];
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      throw error;
    }
  },

  /**
   * Obtener pagos fallidos
   */
  async getFailedPayments() {
    try {
      const response = await api.get(`${PAYMENTS_ENDPOINTS.GET_ALL}?status=failed`);
      
      return response.data.payments || [];
    } catch (error) {
      console.error('Error fetching failed payments:', error);
      throw error;
    }
  },

  /**
   * Obtener resumen de ingresos por período
   * @param {string} period - Período (today, week, month, year)
   */
  async getRevenueSummary(period = 'month') {
    try {
      const response = await api.get(`${PAYMENTS_ENDPOINTS.STATS}?period=${period}&summary=true`);
      
      return response.data.summary || {};
    } catch (error) {
      console.error('Error fetching revenue summary:', error);
      throw error;
    }
  }
};

export default ownerPaymentsApi;