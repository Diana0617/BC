// API Configuration
export const getApiUrl = () => {
  // Check if we're in React Native environment
  const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
  
  if (isReactNative) {
    // React Native environment - prioritize EXPO_PUBLIC_API_URL
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    if (apiUrl) {
      console.log('📡 Using EXPO_PUBLIC_API_URL:', apiUrl);
      return apiUrl;
    }
    
    // Fallback to local IP for development
    const localIP = process.env.EXPO_PUBLIC_LOCAL_IP || '192.168.0.213';
    const url = `http://${localIP}:3001`;
    console.log('📡 Using fallback API URL:', url);
    return url;
  } else if (typeof window !== 'undefined') {
    // Web browser environment - detectar automáticamente
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isLanIp = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);
    
    // Si está en localhost o IP LAN, usar el mismo host para el API
    if (isLocalhost || isLanIp) {
      const apiUrl = `${protocol}//${hostname}:3001`;
      console.log('🔵 [SHARED API_CONFIG] Auto-detectado:', apiUrl);
      return apiUrl;
    }
    
    // Si hay window.__BC_API_URL__ configurado en index.html, usarlo
    if (window.__BC_API_URL__) {
      console.log('🔵 [SHARED API_CONFIG] Desde window:', window.__BC_API_URL__);
      return window.__BC_API_URL__;
    }
    
    // Fallback para producción
    console.log('🔵 [SHARED API_CONFIG] Fallback producción');
    return 'http://localhost:3001';
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

// Log de debug - solo en desarrollo
// __DEV__ solo existe en React Native, usamos typeof para evitar errores en web
const isDev = (typeof __DEV__ !== 'undefined' && __DEV__) || process.env.NODE_ENV === 'development';
if (isDev) {
  console.log('🔧 API Configuration:', {
    BASE_URL: API_CONFIG.BASE_URL,
    isReactNative: typeof navigator !== 'undefined' && navigator.product === 'ReactNative',
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    EXPO_PUBLIC_LOCAL_IP: process.env.EXPO_PUBLIC_LOCAL_IP,
    VITE_API_URL: typeof globalThis !== 'undefined' ? globalThis.__VITE_API_URL__ : 'N/A'
  });
}

// Request configuration
// TIMEOUT increased to 60s to allow Render free tier cold starts (~30-50s)
export const REQUEST_CONFIG = {
  TIMEOUT: 60000,
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