import { apiClient } from './auth';

/**
 * API para gestión de catálogo de proveedores
 */
const supplierCatalogApi = {
  /**
   * Obtener catálogo con filtros
   */
  getCatalog: async (businessId, filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.supplierId) params.append('supplierId', filters.supplierId);
    if (filters.category) params.append('category', filters.category);
    if (filters.available !== undefined) params.append('available', filters.available);
    if (filters.search) params.append('search', filters.search);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const endpoint = `/api/business/${businessId}/supplier-catalog${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get(endpoint);
    return response.data;
  },

  /**
   * Obtener categorías del catálogo
   */
  getCategories: async (businessId) => {
    const response = await apiClient.get(
      `/api/business/${businessId}/supplier-catalog/categories`
    );
    return response.data;
  },

  /**
   * Obtener proveedores
   */
  getSuppliers: async (businessId) => {
    const response = await apiClient.get(
      `/api/business/${businessId}/supplier-catalog/suppliers`
    );
    return response.data;
  },

  /**
   * Subir imagen a item del catálogo
   */
  uploadImage: async (businessId, itemId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await apiClient.post(
      `/api/business/${businessId}/supplier-catalog/${itemId}/images`,
      formData
    );
    return response.data;
  },

  /**
   * Eliminar imagen de item del catálogo
   */
  deleteImage: async (businessId, itemId, imageIndex) => {
    const response = await apiClient.delete(
      `/api/business/${businessId}/supplier-catalog/${itemId}/images/${imageIndex}`
    );
    return response.data;
  },

  /**
   * Descargar PDF del catálogo
   */
  downloadPDF: async (businessId, filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.supplierId) params.append('supplierId', filters.supplierId);
    if (filters.category) params.append('category', filters.category);
    if (filters.supplierName) params.append('supplierName', filters.supplierName);

    const queryString = params.toString();
    const url = `/api/business/${businessId}/supplier-catalog/pdf${queryString ? `?${queryString}` : ''}`;

    // Usar fetch directamente para descargar el PDF
    const token = localStorage.getItem('bc_auth_token') || sessionStorage.getItem('bc_auth_token');
    const response = await fetch(`${apiClient.baseURL}${url}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al generar PDF');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `catalogo-proveedores-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
};

export default supplierCatalogApi;
