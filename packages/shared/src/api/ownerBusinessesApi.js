/**
 * API para funcionalidades de Gestión de Negocios del Owner
 * Comunicación con endpoints del backend para gestión de negocios
 */

import { api } from './client';

export const ownerBusinessesApi = {
  /**
   * Obtener todos los negocios con filtros y paginación
   * @param {Object} params - Parámetros de filtrado y paginación
   * @returns {Promise} Lista de negocios con paginación
   */
  getAllBusinesses: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/api/owner/businesses?${queryString}` : '/api/owner/businesses';
    
    const response = await api.get(url);
    return response.data.data;
  },

  /**
   * Crear un negocio manualmente (desde admin)
   * @param {Object} businessData - Datos del negocio a crear
   * @returns {Promise} Negocio creado
   */
  createBusinessManually: async (businessData) => {
    const response = await api.post('/api/owner/businesses/create-manually', businessData);
    return response.data.data;
  },

  /**
   * Cambiar estado de un negocio (activar/desactivar/suspender)
   * @param {string} businessId - ID del negocio
   * @param {string} status - Nuevo estado (ACTIVE, INACTIVE, SUSPENDED)
   * @param {string} reason - Razón del cambio
   * @returns {Promise} Negocio actualizado
   */
  toggleBusinessStatus: async (businessId, status, reason) => {
    const response = await api.patch(`/api/owner/businesses/${businessId}/status`, {
      status,
      reason
    });
    return response.data.data;
  },

  /**
   * Obtener detalles completos de un negocio
   * @param {string} businessId - ID del negocio
   * @returns {Promise} Detalles del negocio
   */
  getBusinessDetails: async (businessId) => {
    const response = await api.get(`/api/owner/businesses/${businessId}/details`);
    return response.data.data;
  },

  /**
   * Actualizar información de un negocio
   * @param {string} businessId - ID del negocio
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise} Negocio actualizado
   */
  updateBusinessInfo: async (businessId, updateData) => {
    const response = await api.patch(`/api/owner/businesses/${businessId}`, updateData);
    return response.data.data;
  },

  /**
   * Obtener estadísticas generales de negocios
   * @returns {Promise} Estadísticas de negocios
   */
  getBusinessStats: async () => {
    const response = await api.get('/api/owner/stats/platform');
    return response.data.data;
  },

  /**
   * Obtener actividad reciente de un negocio
   * @param {string} businessId - ID del negocio
   * @param {number} limit - Límite de actividades
   * @returns {Promise} Lista de actividades
   */
  getBusinessActivity: async (businessId, limit = 20) => {
    const response = await api.get(`/api/owner/businesses/${businessId}/activity`, {
      params: { limit }
    });
    return response.data.data;
  },

  /**
   * Obtener usuarios de un negocio
   * @param {string} businessId - ID del negocio
   * @returns {Promise} Lista de usuarios del negocio
   */
  getBusinessUsers: async (businessId) => {
    const response = await api.get(`/api/owner/businesses/${businessId}/users`);
    return response.data.data;
  },

  /**
   * Obtener suscripciones de un negocio
   * @param {string} businessId - ID del negocio
   * @returns {Promise} Lista de suscripciones del negocio
   */
  getBusinessSubscriptions: async (businessId) => {
    const response = await api.get(`/api/owner/businesses/${businessId}/subscriptions`);
    return response.data.data;
  },

  /**
   * Eliminar un negocio (solo para casos especiales)
   * @param {string} businessId - ID del negocio
   * @param {string} reason - Razón de eliminación
   * @returns {Promise} Confirmación de eliminación
   */
  deleteBusiness: async (businessId, reason) => {
    const response = await api.delete(`/api/owner/businesses/${businessId}`, {
      data: { reason }
    });
    return response.data.data;
  },

  /**
   * Buscar negocios por término específico
   * @param {string} term - Término de búsqueda
   * @param {Object} filters - Filtros adicionales
   * @returns {Promise} Resultados de búsqueda
   */
  searchBusinesses: async (term, filters = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append('search', term);
    
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const response = await api.get(`/api/owner/businesses/search?${queryParams.toString()}`);
    return response.data.data;
  },

  /**
   * Exportar lista de negocios
   * @param {Object} filters - Filtros para exportación
   * @param {string} format - Formato de exportación (csv, xlsx)
   * @returns {Promise} Datos de exportación
   */
  exportBusinesses: async (filters = {}, format = 'csv') => {
    const queryParams = new URLSearchParams();
    queryParams.append('format', format);
    
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    
    const response = await api.get(`/api/owner/businesses/export?${queryParams.toString()}`);
    return response.data.data;
  }
};