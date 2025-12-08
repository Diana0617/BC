import { apiClient } from './auth';

/**
 * API para gestión de inventario por sucursal
 */
export const branchInventoryApi = {
  
  /**
   * Obtener productos con stock de una sucursal
   * @param {string} businessId - ID del negocio
   * @param {string} branchId - ID de la sucursal
   * @param {object} params - Parámetros de consulta (search, category, productType, stockStatus, page, limit)
   */
  getBranchProducts: async (businessId, branchId, params = {}) => {
    const response = await apiClient.get(
      `/api/business/${businessId}/branches/${branchId}/inventory/products`,
      { params }
    );
    return response.data;
  },

  /**
   * Obtener stock de un producto específico en una sucursal
   * @param {string} businessId - ID del negocio
   * @param {string} branchId - ID de la sucursal
   * @param {string} productId - ID del producto
   */
  getBranchProductStock: async (businessId, branchId, productId) => {
    const response = await apiClient.get(
      `/api/business/${businessId}/branches/${branchId}/inventory/products/${productId}`
    );
    return response.data;
  },

  /**
   * Cargar stock inicial de múltiples productos en una sucursal
   * @param {string} businessId - ID del negocio
   * @param {string} branchId - ID de la sucursal
   * @param {array} products - Array de {productId, quantity, unitCost}
   */
  loadInitialStock: async (businessId, branchId, products) => {
    const response = await apiClient.post(
      `/api/business/${businessId}/branches/${branchId}/inventory/initial-stock`,
      { products }
    );
    return response.data;
  },

  /**
   * Ajustar stock de un producto
   * @param {string} businessId - ID del negocio
   * @param {string} branchId - ID de la sucursal
   * @param {object} data - {productId, quantity, reason, notes, unitCost}
   */
  adjustStock: async (businessId, branchId, data) => {
    const response = await apiClient.post(
      `/api/business/${businessId}/branches/${branchId}/inventory/adjust-stock`,
      data
    );
    return response.data;
  },

  /**
   * Obtener productos con stock bajo
   * @param {string} businessId - ID del negocio
   * @param {string} branchId - ID de la sucursal
   */
  getLowStockProducts: async (businessId, branchId) => {
    const response = await apiClient.get(
      `/api/business/${businessId}/branches/${branchId}/inventory/low-stock`
    );
    return response.data;
  },

  /**
   * Actualizar configuración de stock (min/max)
   * @param {string} businessId - ID del negocio
   * @param {string} branchId - ID de la sucursal
   * @param {string} productId - ID del producto
   * @param {object} config - {minStock, maxStock, notes}
   */
  updateStockConfig: async (businessId, branchId, productId, config) => {
    const response = await apiClient.put(
      `/api/business/${businessId}/branches/${branchId}/inventory/products/${productId}/config`,
      config
    );
    return response.data;
  },

  /**
   * Obtener historial de movimientos de un producto
   * @param {string} businessId - ID del negocio
   * @param {string} branchId - ID de la sucursal
   * @param {string} productId - ID del producto
   * @param {object} params - {startDate, endDate, movementType, page, limit}
   */
  getProductMovements: async (businessId, branchId, productId, params = {}) => {
    const response = await apiClient.get(
      `/api/business/${businessId}/branches/${branchId}/inventory/products/${productId}/movements`,
      { params }
    );
    return response.data;
  }
};

export default branchInventoryApi;
