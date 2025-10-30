import { apiClient } from './client.js';

export const productsApi = {
  // Products Management
  getProducts: (params = {}) => 
    apiClient.get('/api/products', { params }),

  getProductById: (productId) => 
    apiClient.get(`/api/products/${productId}`),

  createProduct: (productData) => 
    apiClient.post('/api/products', productData),

  updateProduct: (productId, productData) => 
    apiClient.put(`/api/products/${productId}`, productData),

  deleteProduct: (productId) => 
    apiClient.delete(`/api/products/${productId}`),

  // Categories
  getCategories: () => 
    apiClient.get('/api/products/categories'),

  // Stock Initial
  bulkInitialStock: (products) => 
    apiClient.post('/api/products/bulk-initial-stock', { products }),

  // Inventory Movements
  getProductMovements: (productId, params = {}) => 
    apiClient.get(`/api/products/${productId}/movements`, { params }),

  createMovement: (productId, movementData) => 
    apiClient.post(`/api/products/${productId}/movements`, movementData)
};
