import apiClient from './client';

/**
 * API para gestión de Auto-Renovación
 * Endpoints para testing y administración del sistema de renovaciones automáticas
 */
export const autoRenewalApi = {
  
  /**
   * 🔄 Ejecutar auto-renovación manual para testing
   */
  runManualAutoRenewal: () => {
    return apiClient.post('/test/auto-renewal/run');
  },

  /**
   * 📊 Obtener estadísticas de auto-renovación
   */
  getAutoRenewalStats: () => {
    return apiClient.get('/test/auto-renewal/stats');
  },

  /**
   * ⚙️ Obtener configuración de cron jobs
   */
  getCronJobsConfig: () => {
    return apiClient.get('/test/auto-renewal/cron-config');
  },

  /**
   * 📧 Ejecutar notificaciones de expiración manual
   */
  runExpirationNotifications: () => {
    return apiClient.post('/test/auto-renewal/expiration-notifications');
  },

  /**
   * 🔄 Procesar reintentos de pagos fallidos
   */
  processFailedPaymentRetries: () => {
    return apiClient.post('/test/auto-renewal/retry-failed-payments');
  },

  /**
   * ⏰ Obtener suscripciones que vencen pronto
   * @param {number} daysAhead - Días hacia adelante para buscar vencimientos
   */
  getExpiringSubscriptions: (daysAhead = 7) => {
    return apiClient.get(`/test/auto-renewal/expiring-subscriptions?daysAhead=${daysAhead}`);
  },

  /**
   * 📝 Obtener historial de renovaciones
   * @param {number} page - Página a obtener
   * @param {number} limit - Cantidad de items por página
   */
  getRenewalHistory: (page = 1, limit = 20) => {
    return apiClient.get(`/test/auto-renewal/renewal-history?page=${page}&limit=${limit}`);
  },

  /**
   * 🧪 Simular proceso de auto-renovación para un negocio específico
   * @param {string} businessId - ID del negocio
   */
  simulateBusinessRenewal: (businessId) => {
    return apiClient.post(`/test/auto-renewal/simulate/${businessId}`);
  },

  /**
   * 🔧 Actualizar configuración de cron jobs
   * @param {Object} config - Nueva configuración
   */
  updateCronConfig: (config) => {
    return apiClient.put('/test/auto-renewal/cron-config', config);
  },

  /**
   * 🗂️ Obtener logs de auto-renovación
   * @param {Object} filters - Filtros de búsqueda
   */
  getAutoRenewalLogs: (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.status) params.append('status', filters.status);
    if (filters.businessId) params.append('businessId', filters.businessId);
    if (filters.limit) params.append('limit', filters.limit);
    
    return apiClient.get(`/test/auto-renewal/logs?${params.toString()}`);
  },

  /**
   * 📈 Obtener métricas de rendimiento del sistema
   */
  getPerformanceMetrics: () => {
    return apiClient.get('/test/auto-renewal/performance-metrics');
  },

  /**
   * 🚨 Obtener alertas del sistema de auto-renovación
   */
  getSystemAlerts: () => {
    return apiClient.get('/test/auto-renewal/system-alerts');
  },

  /**
   * 🔄 Reiniciar todos los cron jobs
   */
  restartCronJobs: () => {
    return apiClient.post('/test/auto-renewal/restart-cron-jobs');
  },

  /**
   * 🛑 Detener todos los cron jobs
   */
  stopCronJobs: () => {
    return apiClient.post('/test/auto-renewal/stop-cron-jobs');
  },

  /**
   * ▶️ Iniciar todos los cron jobs
   */
  startCronJobs: () => {
    return apiClient.post('/test/auto-renewal/start-cron-jobs');
  }
};