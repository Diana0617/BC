/**
 * API para verificación de estado de suscripciones
 * Endpoints para validar acceso, límites y uso de suscripciones
 */

import { apiClient } from './client';

/**
 * API para gestión y verificación de estados de suscripción
 * Permite a los negocios verificar su estado, límites y accesos
 */
export const subscriptionStatusApi = {
  
  /**
   * ✅ Verificar estado actual de suscripción de un negocio
   * @param {string} businessId - ID del negocio
   * @returns {Promise} Estado detallado de la suscripción
   */
  checkSubscriptionStatus: (businessId) => {
    return apiClient.get(`/business/${businessId}/subscription/status`);
  },

  /**
   * 🔐 Validar acceso general del negocio a la plataforma
   * @param {string} businessId - ID del negocio
   * @returns {Promise} Validación de acceso con detalles
   */
  validateBusinessAccess: (businessId) => {
    return apiClient.get(`/business/${businessId}/validate-access`);
  },

  /**
   * 🧩 Verificar acceso a un módulo específico
   * @param {string} businessId - ID del negocio
   * @param {string} moduleId - ID del módulo a verificar
   * @returns {Promise} Estado de acceso al módulo
   */
  checkModuleAccess: (businessId, moduleId) => {
    return apiClient.get(`/business/${businessId}/modules/${moduleId}/access`);
  },

  /**
   * 📊 Obtener límites de la suscripción actual
   * @param {string} businessId - ID del negocio
   * @returns {Promise} Límites detallados del plan
   */
  getSubscriptionLimits: (businessId) => {
    return apiClient.get(`/business/${businessId}/subscription/limits`);
  },

  /**
   * ⚠️ Verificar si se han excedido los límites de uso
   * @param {string} businessId - ID del negocio
   * @returns {Promise} Estado de límites y alertas
   */
  checkUsageLimits: (businessId) => {
    return apiClient.get(`/business/${businessId}/usage/limits`);
  },

  /**
   * 📈 Obtener estadísticas de uso actual
   * @param {string} businessId - ID del negocio
   * @param {Object} params - Parámetros opcionales
   * @param {string} params.period - Período de consulta (thisMonth, lastMonth, etc.)
   * @param {boolean} params.detailed - Incluir detalles por módulo
   * @returns {Promise} Estadísticas de uso detalladas
   */
  getSubscriptionUsage: (businessId, params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.period) queryParams.append('period', params.period);
    if (params.detailed !== undefined) queryParams.append('detailed', params.detailed);
    
    const queryString = queryParams.toString();
    const url = `/business/${businessId}/subscription/usage${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(url);
  },

  /**
   * 🔄 Renovar suscripción de un negocio
   * @param {string} businessId - ID del negocio
   * @param {Object} renewalData - Datos para la renovación
   * @param {string} renewalData.planId - ID del nuevo plan (opcional)
   * @param {number} renewalData.duration - Duración en meses (opcional)
   * @param {string} renewalData.paymentMethod - Método de pago
   * @param {boolean} renewalData.autoRenewal - Configurar auto-renovación
   * @returns {Promise} Detalles de la suscripción renovada
   */
  renewSubscription: (businessId, renewalData) => {
    return apiClient.post(`/business/${businessId}/subscription/renew`, renewalData);
  },

  // 🔧 MÉTODOS DE UTILIDAD ADICIONALES

  /**
   * 📅 Obtener fecha de expiración de suscripción
   * @param {string} businessId - ID del negocio
   * @returns {Promise} Información de expiración
   */
  getExpirationInfo: (businessId) => {
    return apiClient.get(`/business/${businessId}/subscription/expiration`);
  },

  /**
   * 🎯 Verificar acceso a una funcionalidad específica
   * @param {string} businessId - ID del negocio
   * @param {string} feature - Nombre de la funcionalidad
   * @returns {Promise} Estado de acceso a la funcionalidad
   */
  checkFeatureAccess: (businessId, feature) => {
    return apiClient.get(`/business/${businessId}/features/${feature}/access`);
  },

  /**
   * 📊 Obtener resumen rápido de estado
   * @param {string} businessId - ID del negocio
   * @returns {Promise} Resumen ejecutivo del estado
   */
  getQuickStatus: (businessId) => {
    return apiClient.get(`/business/${businessId}/subscription/quick-status`);
  }
};

export default subscriptionStatusApi;