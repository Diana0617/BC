// API Configuration for web app
// Detectar dinámicamente la URL del API basándose en el host actual
const getApiBaseUrl = () => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isLanIp = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);
  
  // Si está en localhost o IP LAN, usar el mismo host para el API
  if (isLocalhost || isLanIp) {
    const apiUrl = `${protocol}//${hostname}:3001`;
    console.log('[WEB API_CONFIG] Auto-detectado:', apiUrl);
    return apiUrl;
  }
  
  // Fallback para producción
  console.log('[WEB API_CONFIG] Fallback producción');
  return 'http://localhost:3001';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
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
  USER_DATA: 'bc_user_data',
  REMEMBER_EMAIL: 'bc_remember_email'
};