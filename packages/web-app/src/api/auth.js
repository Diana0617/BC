import { API_CONFIG } from '../constants/api.js';

// Simple API client for web
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return { data };
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

export const apiClient = new ApiClient('http://localhost:3001');

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