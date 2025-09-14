import { apiClient } from './client.js';

// 🎯 BUSINESS VALIDATION API SERVICE

/**
 * Servicio para manejar validaciones de acceso a negocios y multitenancy
 * Asegura que los usuarios solo accedan a datos de negocios autorizados
 */
const businessValidationApi = {
  
  /**
   * Validar si un usuario tiene acceso a un negocio específico
   * @param {string} businessId - ID del negocio a validar
   * @param {string} userId - ID del usuario (opcional, se obtiene del token)
   * @returns {Promise} Respuesta con información de acceso y permisos
   */
  validateBusinessAccess: async (businessId, userId = null) => {
    return await apiClient.post('/api/business/validate-access', {
      businessId,
      userId
    });
  },

  /**
   * Obtener lista de negocios accesibles para el usuario actual
   * @returns {Promise} Respuesta con array de negocios y permisos
   */
  getAccessibleBusinesses: async () => {
    return await apiClient.get('/api/business/accessible');
  },

  /**
   * Verificar permiso específico en un negocio
   * @param {string} businessId - ID del negocio
   * @param {string} permission - Permiso a verificar
   * @returns {Promise} Respuesta con resultado de verificación
   */
  checkBusinessPermission: async (businessId, permission) => {
    return await apiClient.post('/api/business/check-permission', {
      businessId,
      permission
    });
  },

  /**
   * Obtener información detallada del negocio con permisos del usuario
   * @param {string} businessId - ID del negocio
   * @returns {Promise} Respuesta con datos del negocio y permisos
   */
  getBusinessWithPermissions: async (businessId) => {
    return await apiClient.get(`/api/business/${businessId}/with-permissions`, {
      params: { businessId }
    });
  },

  /**
   * Verificar si el usuario puede realizar una acción específica
   * @param {string} businessId - ID del negocio
   * @param {string} action - Acción a verificar
   * @param {string} resource - Recurso sobre el que se realiza la acción
   * @returns {Promise} Respuesta con autorización
   */
  checkActionPermission: async (businessId, action, resource) => {
    return await apiClient.post('/api/business/check-action', {
      businessId,
      action,
      resource
    });
  },

  /**
   * Obtener configuración de multitenancy del sistema
   * @returns {Promise} Respuesta con configuración global
   */
  getMultitenancyConfig: async () => {
    return await apiClient.get('/api/system/multitenancy-config');
  },

  /**
   * Cambiar contexto de negocio activo
   * @param {string} businessId - ID del nuevo negocio activo
   * @returns {Promise} Respuesta con confirmación de cambio
   */
  switchBusinessContext: async (businessId) => {
    return await apiClient.post('/api/business/switch-context', {
      businessId
    });
  },

  /**
   * Obtener roles y permisos del usuario en un negocio específico
   * @param {string} businessId - ID del negocio
   * @param {string} userId - ID del usuario (opcional)
   * @returns {Promise} Respuesta con roles y permisos detallados
   */
  getUserBusinessRoles: async (businessId, userId = null) => {
    return await apiClient.get(`/api/business/${businessId}/user-roles`, {
      params: {
        businessId,
        userId
      }
    });
  },

  /**
   * Validar múltiples negocios de una vez
   * @param {Array<string>} businessIds - Array de IDs de negocios
   * @returns {Promise} Respuesta con validaciones múltiples
   */
  validateMultipleBusinesses: async (businessIds) => {
    return await apiClient.post('/api/business/validate-multiple', {
      businessIds
    });
  },

  /**
   * Obtener historial de accesos a negocios (para auditoria)
   * @param {string} businessId - ID del negocio (opcional)
   * @param {Object} filters - Filtros opcionales
   * @param {string} filters.dateFrom - Fecha inicio (YYYY-MM-DD)
   * @param {string} filters.dateTo - Fecha fin (YYYY-MM-DD)
   * @param {string} filters.action - Acción específica
   * @param {number} filters.page - Página (default: 1)
   * @param {number} filters.limit - Límite por página (default: 20)
   * @returns {Promise} Respuesta con historial de accesos
   */
  getBusinessAccessHistory: async (businessId = null, filters = {}) => {
    const params = {
      ...filters
    };
    
    if (businessId) {
      params.businessId = businessId;
    }

    return await apiClient.get('/api/business/access-history', {
      params
    });
  },

  /**
   * Reportar intento de acceso no autorizado
   * @param {string} businessId - ID del negocio al que se intentó acceder
   * @param {string} attemptedAction - Acción que se intentó realizar
   * @param {Object} metadata - Metadatos adicionales del intento
   * @returns {Promise} Respuesta con confirmación de reporte
   */
  reportUnauthorizedAccess: async (businessId, attemptedAction, metadata = {}) => {
    return await apiClient.post('/api/business/report-unauthorized-access', {
      businessId,
      attemptedAction,
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ...metadata
      }
    });
  },

  /**
   * Verificar integridad de datos entre negocios
   * @param {string} businessId - ID del negocio a verificar
   * @returns {Promise} Respuesta con resultado de verificación
   */
  verifyDataIntegrity: async (businessId) => {
    return await apiClient.get(`/api/business/${businessId}/verify-integrity`, {
      params: { businessId }
    });
  },

  /**
   * Obtener estadísticas de uso por negocio
   * @param {string} businessId - ID del negocio
   * @param {Object} dateRange - Rango de fechas
   * @param {string} dateRange.from - Fecha inicio (YYYY-MM-DD)
   * @param {string} dateRange.to - Fecha fin (YYYY-MM-DD)
   * @returns {Promise} Respuesta con estadísticas de uso
   */
  getBusinessUsageStats: async (businessId, dateRange = {}) => {
    return await apiClient.get(`/api/business/${businessId}/usage-stats`, {
      params: {
        businessId,
        ...dateRange
      }
    });
  },

  /**
   * Verificar límites de recursos del negocio
   * @param {string} businessId - ID del negocio
   * @returns {Promise} Respuesta con información de límites y uso actual
   */
  checkBusinessLimits: async (businessId) => {
    return await apiClient.get(`/api/business/${businessId}/limits`, {
      params: { businessId }
    });
  }
};

export default businessValidationApi;