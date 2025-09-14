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
    
    return apiClient.get(`/owner/payment-config?${params.toString()}`);
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
    return apiClient.post('/owner/payment-config', configData);
  },

  /**
   * 📄 Obtener configuración específica por ID
   * @param {string} configId - ID de la configuración
   */
  getConfigurationById: (configId) => {
    return apiClient.get(`/owner/payment-config/${configId}`);
  },

  /**
   * ✏️ Actualizar configuración de pago
   * @param {string} configId - ID de la configuración
   * @param {Object} updates - Datos a actualizar
   */
  updateConfiguration: (configId, updates) => {
    return apiClient.put(`/owner/payment-config/${configId}`, updates);
  },

  /**
   * 🗑️ Eliminar configuración de pago
   * @param {string} configId - ID de la configuración
   */
  deleteConfiguration: (configId) => {
    return apiClient.delete(`/owner/payment-config/${configId}`);
  },

  /**
   * 🔄 Activar/Desactivar configuración
   * @param {string} configId - ID de la configuración
   * @param {boolean} isActive - Nuevo estado
   */
  toggleConfiguration: (configId, isActive) => {
    return apiClient.patch(`/owner/payment-config/${configId}/toggle`, { isActive });
  },

  /**
   * 🧪 Probar configuración de pago
   * @param {string} configId - ID de la configuración
   */
  testConfiguration: (configId) => {
    return apiClient.post(`/owner/payment-config/${configId}/test`);
  },

  /**
   * 🏪 Obtener proveedores de pago disponibles
   */
  getAvailableProviders: () => {
    return apiClient.get('/owner/payment-config/providers');
  },

  /**
   * 📊 Obtener estadísticas de configuraciones
   */
  getConfigurationStats: () => {
    return apiClient.get('/owner/payment-config/stats');
  },

  /**
   * 🔐 Obtener campos requeridos para un proveedor
   * @param {string} provider - Nombre del proveedor
   * @param {string} environment - Ambiente (sandbox | production)
   */
  getProviderRequiredFields: (provider, environment = 'sandbox') => {
    return apiClient.get(`/owner/payment-config/providers/${provider}/fields?environment=${environment}`);
  },

  /**
   * ✅ Validar credenciales de proveedor
   * @param {string} provider - Nombre del proveedor
   * @param {Object} credentials - Credenciales a validar
   * @param {string} environment - Ambiente
   */
  validateProviderCredentials: (provider, credentials, environment = 'sandbox') => {
    return apiClient.post(`/owner/payment-config/providers/${provider}/validate`, {
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
    
    return apiClient.get(`/owner/payment-config/${configId}/metrics?${params.toString()}`);
  },

  /**
   * 🔄 Sincronizar configuración con proveedor
   * @param {string} configId - ID de la configuración
   */
  syncWithProvider: (configId) => {
    return apiClient.post(`/owner/payment-config/${configId}/sync`);
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
    
    return apiClient.get(`/owner/payment-config/${configId}/logs?${params.toString()}`);
  },

  /**
   * 🔗 Generar webhooks para configuración
   * @param {string} configId - ID de la configuración
   * @param {Array} events - Eventos para webhooks
   */
  generateWebhooks: (configId, events) => {
    return apiClient.post(`/owner/payment-config/${configId}/webhooks`, { events });
  },

  /**
   * 🔧 Actualizar configuración de webhooks
   * @param {string} configId - ID de la configuración
   * @param {Object} webhookConfig - Nueva configuración de webhooks
   */
  updateWebhookConfig: (configId, webhookConfig) => {
    return apiClient.put(`/owner/payment-config/${configId}/webhooks`, webhookConfig);
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
    
    return apiClient.get(`/owner/payment-config/export?${params.toString()}`, {
      responseType: 'blob'
    });
  },

  /**
   * 🔄 Migrar configuración a otro ambiente
   * @param {string} configId - ID de la configuración
   * @param {string} targetEnvironment - Ambiente destino
   */
  migrateToEnvironment: (configId, targetEnvironment) => {
    return apiClient.post(`/owner/payment-config/${configId}/migrate`, {
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
    
    return apiClient.get(`/owner/payment-config/providers/comparison?${params.toString()}`);
  }
};