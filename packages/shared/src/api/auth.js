import { apiClient } from './client.js';
import { API_CONFIG } from '../constants/api.js';

// Auth API functions
export const authAPI = {
  // Register new user
  register: async (userData) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
  },

  // Login user
  login: async (credentials) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
  },

  // Get user profile
  getProfile: async () => {
    return apiClient.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
  },

  // Forgot password - request reset
  forgotPassword: async (email) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  // Verify reset token
  verifyResetToken: async (token) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_RESET_TOKEN, { token });
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      newPassword
    });
  },

  // Change password (authenticated)
  changePassword: async (currentPassword, newPassword) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword
    });
  }
};

// User API functions
export const userAPI = {
  // Get all users (admin only)
  getUsers: async (params = {}) => {
    return apiClient.get(API_CONFIG.ENDPOINTS.USERS.LIST, params);
  },

  // Get specific user
  getUser: async (userId) => {
    const endpoint = API_CONFIG.ENDPOINTS.USERS.GET.replace(':id', userId);
    return apiClient.get(endpoint);
  },

  // Update user
  updateUser: async (userId, userData) => {
    const endpoint = API_CONFIG.ENDPOINTS.USERS.UPDATE.replace(':id', userId);
    return apiClient.put(endpoint, userData);
  },

  // Delete user
  deleteUser: async (userId) => {
    const endpoint = API_CONFIG.ENDPOINTS.USERS.DELETE.replace(':id', userId);
    return apiClient.delete(endpoint);
  }
};