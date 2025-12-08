import { apiClient } from './client.js';

/**
 * API para configuración de pagos del Owner
 * Endpoints para gestión de proveedores de pago y configuraciones
 */
export const ownerPaymentConfigApi = {
  
  /**
   * 📋 Obtener todas las configuraciones de pago
   * @param {Object} options - Opciones de filtrado y paginación
   * @param {string} options.provider - Filtrar por proveedor
   * @param {boolean} options.isActive - Filtrar por estado activo
   * @param {string} options.environment - Filtrar por ambiente
   * @param {number} options.page - Página a obtener
   * @param {number} options.limit - Cantidad de items por página
   */
  getAllConfigurations: ({ provider, isActive, environment, page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams();
    
    if (provider) params.append('provider', provider);
    if (isActive !== undefined) params.append('isActive', isActive.toString());
    if (environment) params.append('environment', environment);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
  // backend route: /api/owner/payment-configurations
  return apiClient.get(`/api/owner/payment-configurations?${params.toString()}`);
  },

  /**
   * ➕ Crear nueva configuración de pago
   * @param {Object} configData - Datos de la configuración
   * @param {string} configData.provider - Proveedor de pago (wompi, stripe, paypal, etc.)
   * @param {string} configData.environment - Ambiente (sandbox | production)
   * @param {Object} configData.credentials - Credenciales del proveedor
   * @param {Object} configData.settings - Configuraciones adicionales
   * @param {boolean} configData.isActive - Estado activo
   */
  createConfiguration: (configData) => {
  return apiClient.post('/api/owner/payment-configurations', configData);
  },

  /**
   * 📄 Obtener configuración específica por ID
   * @param {string} configId - ID de la configuración
   */
  getConfigurationById: (configId) => {
  return apiClient.get(`/api/owner/payment-configurations/${configId}`);
  },

  /**
   * ✏️ Actualizar configuración de pago
   * @param {string} configId - ID de la configuración
   * @param {Object} updates - Datos a actualizar
   */
  updateConfiguration: (configId, updates) => {
  return apiClient.put(`/api/owner/payment-configurations/${configId}`, updates);
  },

  /**
   * 🗑️ Eliminar configuración de pago
   * @param {string} configId - ID de la configuración
   */
  deleteConfiguration: (configId) => {
  return apiClient.delete(`/api/owner/payment-configurations/${configId}`);
  },

  /**
   * 🔄 Activar/Desactivar configuración
   * @param {string} configId - ID de la configuración
   * @param {boolean} isActive - Nuevo estado
   */
  toggleConfiguration: (configId, isActive) => {
  return apiClient.patch(`/api/owner/payment-configurations/${configId}/toggle`, { isActive });
  },

  /**
   * 🧪 Probar configuración de pago
   * @param {string} configId - ID de la configuración
   */
  testConfiguration: (configId) => {
  return apiClient.post(`/api/owner/payment-configurations/${configId}/test`);
  },

  /**
   * 🏪 Obtener proveedores de pago disponibles
   */
  getAvailableProviders: () => {
  // backend route for providers is /api/owner/payment-configurations/active
  return apiClient.get('/api/owner/payment-configurations/active');
  },

  /**
   * 📊 Obtener estadísticas de configuraciones
   */
  getConfigurationStats: () => {
  return apiClient.get('/api/owner/payment-configurations/stats');
  },

  /**
   * 🔐 Obtener campos requeridos para un proveedor
   * @param {string} provider - Nombre del proveedor
   * @param {string} environment - Ambiente (sandbox | production)
   */
  getProviderRequiredFields: (provider, environment = 'sandbox') => {
  return apiClient.get(`/api/owner/payment-configurations/providers/${provider}/fields?environment=${environment}`);
  },

  /**
   * ✅ Validar credenciales de proveedor
   * @param {string} provider - Nombre del proveedor
   * @param {Object} credentials - Credenciales a validar
   * @param {string} environment - Ambiente
   */
  validateProviderCredentials: (provider, credentials, environment = 'sandbox') => {
  return apiClient.post(`/api/owner/payment-configurations/providers/${provider}/validate`, {
      credentials,
      environment
    });
  },

  /**
   * 📈 Obtener métricas de transacciones por configuración
   * @param {string} configId - ID de la configuración
   * @param {Object} filters - Filtros de fecha
   */
  getConfigurationMetrics: (configId, filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
  return apiClient.get(`/api/owner/payment-configurations/${configId}/metrics?${params.toString()}`);
  },

  /**
   * 🔄 Sincronizar configuración con proveedor
   * @param {string} configId - ID de la configuración
   */
  syncWithProvider: (configId) => {
  return apiClient.post(`/api/owner/payment-configurations/${configId}/sync`);
  },

  /**
   * 📋 Obtener logs de transacciones de una configuración
   * @param {string} configId - ID de la configuración
   * @param {Object} filters - Filtros de búsqueda
   */
  getConfigurationLogs: (configId, filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);
    
  return apiClient.get(`/api/owner/payment-configurations/${configId}/logs?${params.toString()}`);
  },

  /**
   * 🔗 Generar webhooks para configuración
   * @param {string} configId - ID de la configuración
   * @param {Array} events - Eventos para webhooks
   */
  generateWebhooks: (configId, events) => {
  return apiClient.post(`/api/owner/payment-configurations/${configId}/webhooks`, { events });
  },

  /**
   * 🔧 Actualizar configuración de webhooks
   * @param {string} configId - ID de la configuración
   * @param {Object} webhookConfig - Nueva configuración de webhooks
   */
  updateWebhookConfig: (configId, webhookConfig) => {
  return apiClient.put(`/api/owner/payment-configurations/${configId}/webhooks`, webhookConfig);
  },

  /**
   * 📤 Exportar configuraciones
   * @param {Object} filters - Filtros para exportación
   * @param {string} format - Formato (csv | excel | json)
   */
  exportConfigurations: (filters = {}, format = 'csv') => {
    const params = new URLSearchParams();
    
    params.append('format', format);
    if (filters.provider) params.append('provider', filters.provider);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.environment) params.append('environment', filters.environment);
    
  return apiClient.get(`/api/owner/payment-configurations/export?${params.toString()}`, {
      responseType: 'blob'
    });
  },

  /**
   * 🔄 Migrar configuración a otro ambiente
   * @param {string} configId - ID de la configuración
   * @param {string} targetEnvironment - Ambiente destino
   */
  migrateToEnvironment: (configId, targetEnvironment) => {
  return apiClient.post(`/api/owner/payment-configurations/${configId}/migrate`, {
      targetEnvironment
    });
  },

  /**
   * 📊 Obtener comparativa de rendimiento entre proveedores
   * @param {Object} filters - Filtros de fecha
   */
  getProvidersComparison: (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
  return apiClient.get(`/api/owner/payment-configurations/providers/comparison?${params.toString()}`);
  }
};