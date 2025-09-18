/**
 * API para Gestión de Suscripciones del Owner
 * Endpoints para crear, actualizar, cancelar y gestionar suscripciones
 */

import { api } from './client';

const SUBSCRIPTIONS_ENDPOINTS = {
  GET_ALL: '/api/owner/subscriptions',
  CREATE: '/api/owner/subscriptions',
  CANCEL: (id) => `/api/owner/subscriptions/${id}/cancel`,
  UPDATE_STATUS: (id) => `/api/owner/subscriptions/${id}/status`,
  EXTEND: (id) => `/api/owner/subscriptions/${id}/extend`,
  DETAILS: (id) => `/api/owner/subscriptions/${id}`,
  RENEW: (id) => `/api/owner/subscriptions/${id}/renew`,
  STATS: '/api/owner/subscriptions/stats',
  EXPORT: '/api/owner/subscriptions/export',
  BULK_ACTIONS: '/api/owner/subscriptions/bulk'
};

export const ownerSubscriptionsApi = {
  /**
   * Obtener todas las suscripciones con filtros y paginación
   * @param {Object} params - Parámetros de consulta
   */
  async getAllSubscriptions(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Filters
      if (params.status) queryParams.append('status', params.status);
      if (params.planId) queryParams.append('planId', params.planId);
      if (params.businessId) queryParams.append('businessId', params.businessId);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.expiring) queryParams.append('expiring', params.expiring);
      
      // Sorting
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const response = await api.get(`${SUBSCRIPTIONS_ENDPOINTS.GET_ALL}?${queryParams}`);
      
      return {
        subscriptions: response.data.subscriptions || [],
        pagination: response.data.pagination || {},
        stats: response.data.stats || null
      };
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  },

  /**
   * Crear nueva suscripción
   * @param {Object} subscriptionData - Datos de la suscripción
   */
  async createSubscription(subscriptionData) {
    try {
      const response = await api.post(SUBSCRIPTIONS_ENDPOINTS.CREATE, {
        businessId: subscriptionData.businessId,
        planId: subscriptionData.planId,
        startDate: subscriptionData.startDate,
        endDate: subscriptionData.endDate,
        status: subscriptionData.status || 'ACTIVE',
        paymentMethod: subscriptionData.paymentMethod,
        notes: subscriptionData.notes,
        customModules: subscriptionData.customModules || [],
        discountPercentage: subscriptionData.discountPercentage || 0,
        isComplementary: subscriptionData.isComplementary || false
      });
      
      return response.data.subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  /**
   * Cancelar suscripción existente
   * @param {string} subscriptionId - ID de la suscripción
   * @param {string} reason - Razón de cancelación
   */
  async cancelSubscription(subscriptionId, reason) {
    try {
      const response = await api.post(SUBSCRIPTIONS_ENDPOINTS.CANCEL(subscriptionId), {
        reason,
        cancellationDate: new Date().toISOString()
      });
      
      return response.data.subscription;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  },

  /**
   * Actualizar estado de suscripción
   * @param {string} subscriptionId - ID de la suscripción
   * @param {string} status - Nuevo estado (ACTIVE, SUSPENDED, CANCELLED, EXPIRED)
   * @param {string} reason - Razón del cambio
   */
  async updateSubscriptionStatus(subscriptionId, status, reason) {
    try {
      const response = await api.put(SUBSCRIPTIONS_ENDPOINTS.UPDATE_STATUS(subscriptionId), {
        status,
        reason,
        updatedAt: new Date().toISOString()
      });
      
      return response.data.subscription;
    } catch (error) {
      console.error('Error updating subscription status:', error);
      throw error;
    }
  },

  /**
   * Extender suscripción
   * @param {string} subscriptionId - ID de la suscripción
   * @param {number} duration - Duración de la extensión
   * @param {string} durationType - Tipo de duración (DAYS, MONTHS, YEARS)
   */
  async extendSubscription(subscriptionId, duration, durationType) {
    try {
      const response = await api.post(SUBSCRIPTIONS_ENDPOINTS.EXTEND(subscriptionId), {
        duration,
        durationType,
        extendedAt: new Date().toISOString()
      });
      
      return response.data.subscription;
    } catch (error) {
      console.error('Error extending subscription:', error);
      throw error;
    }
  },

  /**
   * Obtener detalles completos de una suscripción
   * @param {string} subscriptionId - ID de la suscripción
   */
  async getSubscriptionDetails(subscriptionId) {
    try {
      const response = await api.get(SUBSCRIPTIONS_ENDPOINTS.DETAILS(subscriptionId));
      
      return {
        ...response.data.subscription,
        business: response.data.business || null,
        plan: response.data.plan || null,
        payments: response.data.payments || [],
        history: response.data.history || [],
        modules: response.data.modules || []
      };
    } catch (error) {
      console.error('Error fetching subscription details:', error);
      throw error;
    }
  },

  /**
   * Renovar suscripción con nuevo plan
   * @param {string} subscriptionId - ID de la suscripción
   * @param {string} planId - ID del nuevo plan
   */
  async renewSubscription(subscriptionId, planId) {
    try {
      const response = await api.post(SUBSCRIPTIONS_ENDPOINTS.RENEW(subscriptionId), {
        planId,
        renewedAt: new Date().toISOString()
      });
      
      return response.data.subscription;
    } catch (error) {
      console.error('Error renewing subscription:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de suscripciones
   */
  async getSubscriptionStats() {
    try {
      const response = await api.get(SUBSCRIPTIONS_ENDPOINTS.STATS);
      
      return {
        totalSubscriptions: response.data.totalSubscriptions || 0,
        activeSubscriptions: response.data.activeSubscriptions || 0,
        cancelledSubscriptions: response.data.cancelledSubscriptions || 0,
        suspendedSubscriptions: response.data.suspendedSubscriptions || 0,
        expiredSubscriptions: response.data.expiredSubscriptions || 0,
        expiringThisMonth: response.data.expiringThisMonth || 0,
        newThisMonth: response.data.newThisMonth || 0,
        totalRevenue: response.data.totalRevenue || 0,
        monthlyRecurringRevenue: response.data.monthlyRecurringRevenue || 0,
        averageSubscriptionValue: response.data.averageSubscriptionValue || 0,
        churnRate: response.data.churnRate || 0,
        growthRate: response.data.growthRate || 0,
        statusDistribution: response.data.statusDistribution || {},
        planDistribution: response.data.planDistribution || {},
        revenueByMonth: response.data.revenueByMonth || [],
        subscriptionsByMonth: response.data.subscriptionsByMonth || []
      };
    } catch (error) {
      console.error('Error fetching subscription stats:', error);
      throw error;
    }
  },

  /**
   * Exportar suscripciones
   * @param {Object} filters - Filtros para la exportación
   * @param {string} format - Formato de exportación (csv, xlsx, pdf)
   */
  async exportSubscriptions(filters = {}, format = 'csv') {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });
      
      queryParams.append('format', format);
      
      const response = await api.get(`${SUBSCRIPTIONS_ENDPOINTS.EXPORT}?${queryParams}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on format
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = format === 'xlsx' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv';
      link.setAttribute('download', `subscriptions_${timestamp}.${extension}`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Exportación completada exitosamente' };
    } catch (error) {
      console.error('Error exporting subscriptions:', error);
      throw error;
    }
  },

  /**
   * Acciones en lote para múltiples suscripciones
   * @param {Array} subscriptionIds - IDs de las suscripciones
   * @param {string} action - Acción a realizar (activate, suspend, cancel)
   * @param {Object} data - Datos adicionales para la acción
   */
  async bulkActions(subscriptionIds, action, data = {}) {
    try {
      const response = await api.post(SUBSCRIPTIONS_ENDPOINTS.BULK_ACTIONS, {
        subscriptionIds,
        action,
        data,
        performedAt: new Date().toISOString()
      });
      
      return {
        success: response.data.success || true,
        updatedSubscriptions: response.data.updatedSubscriptions || [],
        failedUpdates: response.data.failedUpdates || [],
        message: response.data.message || 'Acciones realizadas exitosamente'
      };
    } catch (error) {
      console.error('Error performing bulk actions:', error);
      throw error;
    }
  },

  /**
   * Obtener suscripciones próximas a vencer
   * @param {number} days - Días de anticipación (default: 30)
   */
  async getExpiringSubscriptions(days = 30) {
    try {
      const response = await api.get(`${SUBSCRIPTIONS_ENDPOINTS.GET_ALL}?expiring=true&days=${days}`);
      
      return response.data.subscriptions || [];
    } catch (error) {
      console.error('Error fetching expiring subscriptions:', error);
      throw error;
    }
  },

  /**
   * Buscar suscripciones por término
   * @param {string} searchTerm - Término de búsqueda
   */
  async searchSubscriptions(searchTerm) {
    try {
      const response = await api.get(`${SUBSCRIPTIONS_ENDPOINTS.GET_ALL}?search=${encodeURIComponent(searchTerm)}`);
      
      return response.data.subscriptions || [];
    } catch (error) {
      console.error('Error searching subscriptions:', error);
      throw error;
    }
  }
};

export default ownerSubscriptionsApi;