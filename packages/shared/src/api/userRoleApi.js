import { apiClient } from './client';

/**
 * API para gestión de roles de usuario
 */
const userRoleApi = {
  /**
   * Actualizar rol del usuario (BUSINESS <-> BUSINESS_SPECIALIST)
   */
  updateRole: async (newRole) => {
    const response = await apiClient.patch('/api/auth/update-role', {
      newRole
    });
    return response.data;
  }
};

export default userRoleApi;
