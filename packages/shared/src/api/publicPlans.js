import { API_CONFIG } from '../constants/api.js';

// Cliente API simplificado para rutas públicas (sin autenticación)
class PublicApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = 10000;
  }

  // Build headers for public requests (no auth)
  buildHeaders(customHeaders = {}) {
    return {
      'Content-Type': 'application/json',
      ...customHeaders
    };
  }

  // Generic request method for public endpoints
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      timeout: this.timeout,
      headers: this.buildHeaders(options.headers),
      ...options
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Parse JSON response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        data = null;
      }

      if (!response.ok) {
        throw new Error(data?.message || `HTTP Error: ${response.status}`);
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  // HTTP Methods for public endpoints
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

// Create public API client instance
const publicApiClient = new PublicApiClient();

// Public Plans API functions
export const publicPlansAPI = {
  // Get all plans (public access)
  getPlans: async (params = {}) => {
    return publicApiClient.get('/api/plans', params);
  },

  // Get specific plan by ID (public access)
  getPlanById: async (planId, params = {}) => {
    return publicApiClient.get(`/api/plans/${planId}`, params);
  }
};

// Export for convenience
export default publicPlansAPI;