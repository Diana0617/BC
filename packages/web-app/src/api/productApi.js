import { apiClient } from './auth';

/**
 * API para gestión de productos
 */
export const productApi = {
  
  /**
   * Obtener todos los productos del negocio
   * @param {string} businessId - ID del negocio
   * @param {object} params - Parámetros de consulta (search, category, productType, page, limit)
   */
  getProducts: async (businessId, params = {}) => {
    const response = await apiClient.get(
      `/api/business/${businessId}/products`,
      { params }
    );
    return response.data;
  },

  /**
   * Obtener un producto por ID
   * @param {string} businessId - ID del negocio
   * @param {string} productId - ID del producto
   */
  getProductById: async (businessId, productId) => {
    const response = await apiClient.get(
      `/api/business/${businessId}/products/${productId}`
    );
    return response.data;
  },

  /**
   * Crear nuevo producto
   * @param {string} businessId - ID del negocio
   * @param {object} productData - Datos del producto
   */
  createProduct: async (businessId, productData) => {
    const response = await apiClient.post(
      `/api/business/${businessId}/products`,
      productData
    );
    return response.data;
  },

  /**
   * Actualizar producto
   * @param {string} businessId - ID del negocio
   * @param {string} productId - ID del producto
   * @param {object} updates - Datos a actualizar
   */
  updateProduct: async (businessId, productId, updates) => {
    const response = await apiClient.put(
      `/api/business/${businessId}/products/${productId}`,
      updates
    );
    return response.data;
  },

  /**
   * Eliminar producto
   * @param {string} businessId - ID del negocio
   * @param {string} productId - ID del producto
   */
  deleteProduct: async (businessId, productId) => {
    const response = await apiClient.delete(
      `/api/business/${businessId}/products/${productId}`
    );
    return response.data;
  },

  /**
   * Subir imagen de producto
   * @param {string} businessId - ID del negocio
   * @param {string} productId - ID del producto
   * @param {FormData} formData - FormData con la imagen
   */
  uploadProductImage: async (businessId, productId, formData) => {
    // NO establecer Content-Type manualmente - axios lo hace automáticamente con el boundary correcto
    const response = await apiClient.post(
      `/api/business/${businessId}/products/${productId}/images`,
      formData
    );
    return response.data;
  },

  /**
   * Eliminar imagen de producto
   * @param {string} businessId - ID del negocio
   * @param {string} productId - ID del producto
   * @param {number} imageIndex - Índice de la imagen a eliminar
   */
  deleteProductImage: async (businessId, productId, imageIndex) => {
    const response = await apiClient.delete(
      `/api/business/${businessId}/products/${productId}/images/${imageIndex}`
    );
    return response.data;
  },

  /**
   * Obtener movimientos de inventario de un producto
   * @param {string} businessId - ID del negocio
   * @param {string} productId - ID del producto
   * @param {object} params - Parámetros de consulta (startDate, endDate, movementType, page, limit)
   */
  getProductMovements: async (businessId, productId, params = {}) => {
    const response = await apiClient.get(
      `/api/business/${businessId}/products/${productId}/movements`,
      { params }
    );
    return response.data;
  },

  /**
   * Obtener categorías de productos
   * @param {string} businessId - ID del negocio
   */
  getCategories: async (businessId) => {
    const response = await apiClient.get(
      `/api/business/${businessId}/products/categories`
    );
    return response.data;
  },

  /**
   * Carga masiva de stock inicial
   * @param {string} businessId - ID del negocio
   * @param {array} products - Array de {productId, quantity, unitCost}
   */
  bulkInitialStock: async (businessId, products) => {
    const response = await apiClient.post(
      `/api/business/${businessId}/products/bulk-initial-stock`,
      { products }
    );
    return response.data;
  }
};

export default productApi;
