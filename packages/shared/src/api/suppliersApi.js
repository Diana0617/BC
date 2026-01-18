import { apiClient } from './client.js';

/**
 * API para gestión de proveedores
 */
class SuppliersApi {
  /**
   * Obtener lista de proveedores
   */
  static async getSuppliers(businessId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.isActive !== undefined) {
        queryParams.append('isActive', filters.isActive);
      }
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      if (filters.page) {
        queryParams.append('page', filters.page);
      }
      if (filters.limit) {
        queryParams.append('limit', filters.limit);
      }

      const queryString = queryParams.toString();
      const url = `/api/business/${businessId}/suppliers${queryString ? '?' + queryString : ''}`;
      
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  }

  /**
   * Obtener un proveedor por ID
   */
  static async getSupplierById(businessId, supplierId) {
    try {
      const url = `/api/business/${businessId}/suppliers/${supplierId}`;
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching supplier:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo proveedor
   */
  static async createSupplier(businessId, supplierData) {
    try {
      const url = `/api/business/${businessId}/suppliers`;
      const response = await apiClient.post(url, supplierData);
      return response;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  }

  /**
   * Actualizar un proveedor
   */
  static async updateSupplier(businessId, supplierId, supplierData) {
    try {
      const url = `/api/business/${businessId}/suppliers/${supplierId}`;
      const response = await apiClient.put(url, supplierData);
      return response;
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }
  }

  /**
   * Eliminar un proveedor
   */
  static async deleteSupplier(businessId, supplierId) {
    try {
      const url = `/api/business/${businessId}/suppliers/${supplierId}`;
      const response = await apiClient.delete(url);
      return response;
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }
  }
}

export default SuppliersApi;
