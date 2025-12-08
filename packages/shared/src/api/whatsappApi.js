import { api } from './client';

/**
 * 💬 WHATSAPP BUSINESS PLATFORM API
 * Gestión de WhatsApp Business Platform - Self-service para usuarios business
 * 
 * Funcionalidades:
 * - Gestión de tokens (manual y Embedded Signup)
 * - Administración de plantillas de mensajes
 * - Historial de mensajes enviados
 * - Log de eventos de webhook
 * 
 * Base path: /api/admin/whatsapp
 */

const whatsappApi = {
  // ==================== TOKEN MANAGEMENT ====================

  /**
   * Almacenar token de WhatsApp manualmente
   * @param {string} businessId - ID del negocio
   * @param {Object} tokenData - { accessToken, phoneNumberId, wabaId?, phoneNumber?, metadata? }
   * @returns {Promise} { success, message, data: { businessId, phoneNumber, phoneNumberId, hasToken, isActive, expiresAt, createdAt } }
   */
  storeToken: async (businessId, tokenData) => {
    const response = await api.post(`/api/admin/whatsapp/businesses/${businessId}/tokens`, tokenData);
    return response.data;
  },

  /**
   * Obtener información del token (sin exponer el token real)
   * @param {string} businessId - ID del negocio
   * @returns {Promise} { success, data: { hasToken, isActive, tokenType, expiresAt, lastRotatedAt, createdAt, phoneNumber, phoneNumberId, wabaId, permissions, source } }
   */
  getTokenInfo: async (businessId) => {
    const response = await api.get(`/api/admin/whatsapp/businesses/${businessId}/tokens`);
    return response.data;
  },

  /**
   * Rotar token de WhatsApp
   * @param {string} businessId - ID del negocio
   * @param {string} newAccessToken - Nuevo access token
   * @returns {Promise} { success, message, data: { businessId, isActive, expiresAt, lastRotatedAt } }
   */
  rotateToken: async (businessId, newAccessToken) => {
    const response = await api.post(`/api/admin/whatsapp/businesses/${businessId}/tokens/rotate`, {
      newAccessToken
    });
    return response.data;
  },

  /**
   * Eliminar token (desconectar WhatsApp)
   * @param {string} businessId - ID del negocio
   * @returns {Promise} { success, message }
   */
  deleteToken: async (businessId) => {
    const response = await api.delete(`/api/admin/whatsapp/businesses/${businessId}/tokens`);
    return response.data;
  },

  /**
   * Probar conexión de WhatsApp
   * @param {string} businessId - ID del negocio
   * @returns {Promise} { success, message, data: { phoneNumber, verifiedName, quality, status } }
   */
  testConnection: async (businessId) => {
    const response = await api.post(`/api/admin/whatsapp/businesses/${businessId}/test-connection`);
    return response.data;
  },

  // ==================== EMBEDDED SIGNUP ====================

  /**
   * Obtener configuración para Embedded Signup (OAuth)
   * @returns {Promise} { success, data: { appId, redirectUri, state, scope } }
   */
  getEmbeddedSignupConfig: async () => {
    const response = await api.get('/api/admin/whatsapp/embedded-signup/config');
    return response.data;
  },

  /**
   * Procesar callback de Embedded Signup
   * @param {Object} callbackData - { code, state, businessId }
   * @returns {Promise} { success, message, data: { phoneNumber, verifiedName } }
   */
  handleEmbeddedSignupCallback: async (callbackData) => {
    const response = await api.post('/api/admin/whatsapp/embedded-signup/callback', callbackData);
    return response.data;
  },

  // ==================== TEMPLATE MANAGEMENT ====================

  /**
   * Obtener lista de plantillas de mensajes
   * @param {string} businessId - ID del negocio
   * @param {Object} filters - { page?, limit?, status?, category? }
   * @returns {Promise} { success, data: { templates, pagination } }
   */
  getTemplates: async (businessId, filters = {}) => {
    const response = await api.get(`/api/admin/whatsapp/businesses/${businessId}/templates`, {
      params: filters
    });
    return response.data;
  },

  /**
   * Crear nueva plantilla de mensaje
   * @param {string} businessId - ID del negocio
   * @param {Object} templateData - { name, language, category, components }
   * @returns {Promise} { success, message, data: template }
   */
  createTemplate: async (businessId, templateData) => {
    const response = await api.post(`/api/admin/whatsapp/businesses/${businessId}/templates`, templateData);
    return response.data;
  },

  /**
   * Actualizar plantilla de mensaje (solo DRAFT)
   * @param {string} businessId - ID del negocio
   * @param {string} templateId - ID de la plantilla
   * @param {Object} updateData - { name?, language?, category?, components? }
   * @returns {Promise} { success, message, data: template }
   */
  updateTemplate: async (businessId, templateId, updateData) => {
    const response = await api.put(`/api/admin/whatsapp/businesses/${businessId}/templates/${templateId}`, updateData);
    return response.data;
  },

  /**
   * Eliminar plantilla de mensaje
   * @param {string} businessId - ID del negocio
   * @param {string} templateId - ID de la plantilla
   * @returns {Promise} { success, message }
   */
  deleteTemplate: async (businessId, templateId) => {
    const response = await api.delete(`/api/admin/whatsapp/businesses/${businessId}/templates/${templateId}`);
    return response.data;
  },

  /**
   * Enviar plantilla a Meta para aprobación
   * @param {string} businessId - ID del negocio
   * @param {string} templateId - ID de la plantilla
   * @returns {Promise} { success, message, data: template }
   */
  submitTemplate: async (businessId, templateId) => {
    const response = await api.post(`/api/admin/whatsapp/businesses/${businessId}/templates/${templateId}/submit`);
    return response.data;
  },

  /**
   * Sincronizar plantillas desde Meta
   * @param {string} businessId - ID del negocio
   * @returns {Promise} { success, message, data: { synced, templates } }
   */
  syncTemplates: async (businessId) => {
    const response = await api.get(`/api/admin/whatsapp/businesses/${businessId}/templates/sync`);
    return response.data;
  },

  // ==================== MESSAGE HISTORY ====================

  /**
   * Obtener historial de mensajes
   * @param {string} businessId - ID del negocio
   * @param {Object} filters - { page?, limit?, status?, startDate?, endDate?, clientId? }
   * @returns {Promise} { success, data: { messages, pagination } }
   */
  getMessages: async (businessId, filters = {}) => {
    const response = await api.get(`/api/admin/whatsapp/businesses/${businessId}/messages`, {
      params: filters
    });
    return response.data;
  },

  /**
   * Obtener detalle de mensaje por ID
   * @param {string} businessId - ID del negocio
   * @param {string} messageId - ID del mensaje
   * @returns {Promise} { success, data: message }
   */
  getMessageById: async (businessId, messageId) => {
    const response = await api.get(`/api/admin/whatsapp/businesses/${businessId}/messages/${messageId}`);
    return response.data;
  },

  // ==================== WEBHOOK EVENTS ====================

  /**
   * Obtener log de eventos de webhook
   * @param {string} businessId - ID del negocio
   * @param {Object} filters - { page?, limit?, eventType?, startDate?, endDate? }
   * @returns {Promise} { success, data: { events, pagination } }
   */
  getWebhookEvents: async (businessId, filters = {}) => {
    const response = await api.get(`/api/admin/whatsapp/businesses/${businessId}/webhook-events`, {
      params: filters
    });
    return response.data;
  },

  /**
   * Obtener detalle de evento de webhook por ID
   * @param {string} businessId - ID del negocio
   * @param {string} eventId - ID del evento
   * @returns {Promise} { success, data: event }
   */
  getWebhookEventById: async (businessId, eventId) => {
    const response = await api.get(`/api/admin/whatsapp/businesses/${businessId}/webhook-events/${eventId}`);
    return response.data;
  },

  /**
   * Re-procesar evento de webhook
   * @param {string} businessId - ID del negocio
   * @param {string} eventId - ID del evento
   * @returns {Promise} { success, message }
   */
  replayWebhookEvent: async (businessId, eventId) => {
    const response = await api.post(`/api/admin/whatsapp/businesses/${businessId}/webhook-events/${eventId}/replay`);
    return response.data;
  },
};

export default whatsappApi;
