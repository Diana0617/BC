import { API_CONFIG, REQUEST_CONFIG, STORAGE_KEYS } from '../constants/api.js';
import { StorageHelper } from '../utils/storage.js';

// Base API class
class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = REQUEST_CONFIG.TIMEOUT;
  }

  // Get auth token from storage (supports async retrieval for React Native)
  async getAuthToken() {
    const isReactNative = typeof window === 'undefined' || 
                         (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') ||
                         (typeof global !== 'undefined' && !!global.HermesInternal);

    try {
      let token;
      if (isReactNative) {
        token = await StorageHelper.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      } else {
        token = StorageHelper.getItem(STORAGE_KEYS.AUTH_TOKEN);
      }
      
     
      return token;
    } catch (error) {
      console.warn('Error getting auth token:', error);
      return null;
    }
  }

  // Build headers with auth if available (async to support RN storage)
  async buildHeaders(customHeaders = {}) {
    const headers = { ...REQUEST_CONFIG.HEADERS, ...customHeaders };
    const token = await this.getAuthToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log('ApiClient buildHeaders: Added Authorization header');
    } else {
      console.log('ApiClient buildHeaders: No token available');
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    let headers = await this.buildHeaders(options.headers);
    let body = options.body;

    // Detect FormData and adjust headers/body
    if (body instanceof FormData) {
      // Remove Content-Type header if present (let browser set it)
      if (headers['Content-Type']) {
        delete headers['Content-Type'];
      }
    } else if (body && typeof body === 'object' && !(body instanceof Blob)) {
      // If body is a plain object, stringify as JSON
      body = JSON.stringify(body);
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    }

    const config = {
      timeout: this.timeout,
      headers,
      ...options,
      body
    };

    // console.log('ApiClient request:', {
    //   url,
    //   method: config.method || 'GET',
    //   hasAuthHeader: !!headers.Authorization,
    //   authPreview: headers.Authorization ? `${headers.Authorization.substring(0, 20)}...` : null,
    //   contentType: headers['Content-Type'] || null,
    //   isFormData: body instanceof FormData
    // });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: config.method || 'GET',
        headers: config.headers,
        body: config.body,
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

  // HTTP Methods
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}, options = {}) {
    // If data is FormData, pass as body; else, pass as object
    return this.request(endpoint, {
      method: 'POST',
      body: data,
      ...options
    });
  }

  async put(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data,
      ...options
    });
  }

  async patch(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data,
      ...options
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export as 'api' for backward compatibility
export const api = apiClient;

// Export as default for import convenience
export default apiClient;