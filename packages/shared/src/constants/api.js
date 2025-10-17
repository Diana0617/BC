// API Configuration
const getApiUrl = () => {
  // Check if we're in React Native environment
  const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
  
  if (isReactNative) {
    // React Native environment - prioritize EXPO_PUBLIC_API_URL
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    if (apiUrl) {
      return apiUrl;
    }
    
    // Fallback to local IP for development
    const localIP = process.env.EXPO_PUBLIC_LOCAL_IP || '192.168.0.213';
    return `http://${localIP}:3001`;
  } else if (typeof window !== 'undefined') {
    // Web browser environment
    // Prioritize Vite env var, then window global, then localhost
    if (import.meta?.env?.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    return window.__BC_API_URL__ || 'http://localhost:3001';
  } else {
    // Node.js environment
    return process.env.API_BASE_URL || 'http://localhost:3001';
  }
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      PROFILE: '/api/auth/profile',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      VERIFY_RESET_TOKEN: '/api/auth/verify-reset-token',
      RESET_PASSWORD: '/api/auth/reset-password',
      CHANGE_PASSWORD: '/api/auth/change-password'
    },
    // User endpoints
    USERS: {
      LIST: '/api/users',
      GET: '/api/users/:id',
      UPDATE: '/api/users/:id',
      DELETE: '/api/users/:id'
    }
  }
};

// Request configuration
export const REQUEST_CONFIG = {
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json'
  }
};

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'bc_auth_token',
  REFRESH_TOKEN: 'bc_refresh_token',
  USER_DATA: 'bc_user_data',
  REMEMBER_EMAIL: 'bc_remember_email'
};