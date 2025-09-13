import apiClient from './client';

/**
 * API para gestión manual de negocios por parte del Owner
 * Endpoints para crear invitaciones, gestionar negocios y procesar pagos
 */
export const ownerBusinessManagementApi = {
  
  /**
   * 📋 Obtener planes disponibles para invitaciones
   */
  getAvailablePlans: () => {
    return apiClient.get('/owner/business/plans');
  },

  /**
   * 📧 Crear invitación de negocio
   * @param {Object} invitationData - Datos de la invitación
   * @param {string} invitationData.businessName - Nombre del negocio
   * @param {string} invitationData.email - Email de contacto
   * @param {string} invitationData.phone - Teléfono de contacto
   * @param {string} invitationData.address - Dirección física
   * @param {string} invitationData.ownerName - Nombre del propietario
   * @param {string} invitationData.planId - ID del plan de suscripción
   * @param {number} invitationData.expirationDays - Días hasta expiración (opcional)
   */
  createBusinessInvitation: (invitationData) => {
    return apiClient.post('/owner/business/invite', invitationData);
  },

  /**
   * 📋 Obtener lista de mis invitaciones
   * @param {Object} options - Opciones de filtrado y paginación
   * @param {string} options.status - Filtrar por estado
   * @param {number} options.page - Página a obtener
   * @param {number} options.limit - Cantidad de items por página
   */
  getMyInvitations: ({ status, page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams();
    
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    return apiClient.get(`/owner/business/invitations?${params.toString()}`);
  },

  /**
   * 📊 Obtener estadísticas de invitaciones
   */
  getInvitationStats: () => {
    return apiClient.get('/owner/business/invitations/stats');
  },

  /**
   * 🔄 Reenviar invitación
   * @param {string} invitationId - ID de la invitación
   */
  resendInvitation: (invitationId) => {
    return apiClient.post(`/owner/business/invitations/${invitationId}/resend`);
  },

  /**
   * ❌ Cancelar invitación
   * @param {string} invitationId - ID de la invitación
   */
  cancelInvitation: (invitationId) => {
    return apiClient.delete(`/owner/business/invitations/${invitationId}`);
  },

  /**
   * 📄 Obtener detalles de una invitación específica
   * @param {string} invitationId - ID de la invitación
   */
  getInvitationDetails: (invitationId) => {
    return apiClient.get(`/owner/business/invitations/${invitationId}`);
  },

  /**
   * 📈 Obtener métricas de conversión de invitaciones
   * @param {Object} filters - Filtros de fecha
   */
  getConversionMetrics: (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.planId) params.append('planId', filters.planId);
    
    return apiClient.get(`/owner/business/metrics/conversion?${params.toString()}`);
  },

  /**
   * 📧 Obtener plantillas de email para invitaciones
   */
  getEmailTemplates: () => {
    return apiClient.get('/owner/business/email-templates');
  },

  /**
   * ✏️ Actualizar plantilla de email
   * @param {string} templateId - ID de la plantilla
   * @param {Object} templateData - Datos de la plantilla
   */
  updateEmailTemplate: (templateId, templateData) => {
    return apiClient.put(`/owner/business/email-templates/${templateId}`, templateData);
  },

  /**
   * 🔍 Buscar invitaciones
   * @param {string} query - Término de búsqueda
   * @param {Object} filters - Filtros adicionales
   */
  searchInvitations: (query, filters = {}) => {
    const params = new URLSearchParams();
    
    params.append('q', query);
    if (filters.status) params.append('status', filters.status);
    if (filters.planId) params.append('planId', filters.planId);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    
    return apiClient.get(`/owner/business/invitations/search?${params.toString()}`);
  },

  /**
   * 📤 Exportar invitaciones a CSV/Excel
   * @param {Object} filters - Filtros para la exportación
   * @param {string} format - Formato de exportación ('csv' | 'excel')
   */
  exportInvitations: (filters = {}, format = 'csv') => {
    const params = new URLSearchParams();
    
    params.append('format', format);
    if (filters.status) params.append('status', filters.status);
    if (filters.planId) params.append('planId', filters.planId);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    
    return apiClient.get(`/owner/business/invitations/export?${params.toString()}`, {
      responseType: 'blob'
    });
  },

  /**
   * 🔗 Generar enlace público para invitación
   * @param {string} invitationId - ID de la invitación
   */
  generatePublicLink: (invitationId) => {
    return apiClient.post(`/owner/business/invitations/${invitationId}/generate-link`);
  },

  /**
   * 📋 Obtener historial de actividad de una invitación
   * @param {string} invitationId - ID de la invitación
   */
  getInvitationActivity: (invitationId) => {
    return apiClient.get(`/owner/business/invitations/${invitationId}/activity`);
  }
};