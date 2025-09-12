import { apiClient } from './client';

/**
 * API para gestión de módulos (OWNER)
 */
export const ownerModulesApi = {
  /**
   * Obtener todos los módulos con filtros
   */
  getAllModules: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Parámetros de paginación
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Filtros
    if (params.category) queryParams.append('category', params.category);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const url = `/api/modules${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(url);
  },

  /**
   * Obtener un módulo específico por ID
   */
  getModuleById: async (moduleId) => {
    return apiClient.get(`/api/modules/${moduleId}`);
  },

  /**
   * Obtener módulos por categoría
   */
  getModulesByCategory: async (category, params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const url = `/api/modules/category/${category}${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(url);
  },

  /**
   * Crear un nuevo módulo
   */
  createModule: async (moduleData) => {
    return apiClient.post('/api/modules', moduleData);
  },

  /**
   * Actualizar un módulo existente
   */
  updateModule: async (moduleId, moduleData) => {
    return apiClient.put(`/api/modules/${moduleId}`, moduleData);
  },

  /**
   * Cambiar estado de un módulo
   */
  updateModuleStatus: async (moduleId, status) => {
    return apiClient.patch(`/api/modules/${moduleId}/status`, { status });
  },

  /**
   * Obtener dependencias de un módulo
   */
  getModuleDependencies: async (moduleId) => {
    return apiClient.get(`/api/modules/${moduleId}/dependencies`);
  },

  /**
   * Eliminar un módulo (marcar como DEPRECATED)
   */
  deleteModule: async (moduleId) => {
    return apiClient.delete(`/api/modules/${moduleId}`);
  }
};