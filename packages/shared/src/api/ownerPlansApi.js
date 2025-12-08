import { apiClient } from './client.js';

/**
 * API para gestión de planes (OWNER)
 */
export const ownerPlansApi = {
  /**
   * Obtener todos los planes con estadísticas
   */
  getAllPlans: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Parámetros de paginación
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Filtros
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const url = `/api/owner/plans${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(url);
  },

  /**
   * Obtener un plan específico por ID
   */
  getPlanById: async (planId) => {
    return apiClient.get(`/api/owner/plans/${planId}`);
  },

  /**
   * Crear un nuevo plan
   */
  createPlan: async (planData) => {
    return apiClient.post('/api/owner/plans', planData);
  },

  /**
   * Actualizar un plan existente
   */
  updatePlan: async (planId, planData) => {
    return apiClient.put(`/api/owner/plans/${planId}`, planData);
  },

  /**
   * Cambiar estado de un plan (activar/desactivar)
   */
  updatePlanStatus: async (planId, status) => {
    return apiClient.patch(`/api/owner/plans/${planId}/status`, { status });
  },

  /**
   * Obtener estadísticas de un plan específico
   */
  getPlanStats: async (planId) => {
    return apiClient.get(`/api/owner/plans/${planId}/stats`);
  },

  /**
   * Eliminar un plan (soft delete)
   */
  deletePlan: async (planId) => {
    return apiClient.delete(`/api/owner/plans/${planId}`);
  }
};