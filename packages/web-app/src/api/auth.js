import { API_CONFIG } from '../constants/api.js';

// Simple API client for web
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

async request(endpoint, options = {}) {
  const url = `${this.baseURL}${endpoint}`;
  
  // Check if body is FormData to avoid setting Content-Type and stringifying
  const isFormData = options.body instanceof FormData;
  
  const config = {
    headers: {
      // Only set Content-Type for non-FormData requests
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available - using correct storage keys
  const token = localStorage.getItem('bc_auth_token') || sessionStorage.getItem('bc_auth_token');
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
    // Si hay params, convertirlos a query string
    if (options.params) {
      const queryParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          queryParams.append(key, value);
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        endpoint = `${endpoint}?${queryString}`;
      }
      // Eliminar params del options para no pasarlo a fetch
      delete options.params;
    }
    return this.request(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, body, options = {}) {
  // Don't stringify FormData, let browser handle it
  const isFormData = body instanceof FormData;
  console.log('🚀 POST request:', { endpoint, isFormData, bodyType: body?.constructor?.name });
  
  return this.request(endpoint, {
    method: 'POST',
    body: isFormData ? body : JSON.stringify(body),
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