import { apiClient } from './client.js';
import { StorageHelper } from '../utils/storage.js';
import { STORAGE_KEYS } from '../constants/api.js';

export const productsApi = {
  // Products Management
  getProducts: (params = {}) => {
    // Intentar obtener businessId desde params o storage (compatibilidad)
    let businessId = params.businessId;
    if (!businessId) {
      const userRaw = StorageHelper.getItem(STORAGE_KEYS.USER_DATA);
      try {
        const user = userRaw ? JSON.parse(userRaw) : null;
        businessId = user?.businessId || user?.business?.id;
      } catch (e) {
        businessId = null;
      }
    }

    const endpoint = businessId ? `/api/business/${businessId}/products` : '/api/products';
    return apiClient.get(endpoint, { params });
  },

  getProductById: (productId, businessId) => {
    let endpoint;
    if (businessId) endpoint = `/api/business/${businessId}/products/${productId}`;
    else {
      const userRaw = StorageHelper.getItem(STORAGE_KEYS.USER_DATA);
      try {
        const user = userRaw ? JSON.parse(userRaw) : null;
        businessId = user?.businessId || user?.business?.id;
      } catch (e) {
        businessId = null;
      }
      endpoint = businessId ? `/api/business/${businessId}/products/${productId}` : `/api/products/${productId}`;
    }
    return apiClient.get(endpoint);
  },

  createProduct: (productData, businessId) => {
    const endpoint = businessId ? `/api/business/${businessId}/products` : '/api/products';
    return apiClient.post(endpoint, productData);
  },

  updateProduct: (productId, productData, businessId) => {
    const endpoint = businessId ? `/api/business/${businessId}/products/${productId}` : `/api/products/${productId}`;
    return apiClient.put(endpoint, productData);
  },

  deleteProduct: (productId, businessId) => {
    const endpoint = businessId ? `/api/business/${businessId}/products/${productId}` : `/api/products/${productId}`;
    return apiClient.delete(endpoint);
  },

  // Categories
  getCategories: (businessId) => {
    const endpoint = businessId ? `/api/business/${businessId}/products/categories` : '/api/products/categories';
    return apiClient.get(endpoint);
  },

  // Stock Initial
  bulkInitialStock: (products, businessId) => {
    const endpoint = businessId ? `/api/business/${businessId}/products/bulk-initial-stock` : '/api/products/bulk-initial-stock';
    return apiClient.post(endpoint, { products });
  },

  // Inventory Movements
  getProductMovements: (productId, params = {}, businessId) => {
    const endpoint = businessId ? `/api/business/${businessId}/products/${productId}/movements` : `/api/products/${productId}/movements`;
    return apiClient.get(endpoint, { params });
  },

  createMovement: (productId, movementData, businessId) => {
    const endpoint = businessId ? `/api/business/${businessId}/products/${productId}/movements` : `/api/products/${productId}/movements`;
    return apiClient.post(endpoint, movementData);
  }
};
