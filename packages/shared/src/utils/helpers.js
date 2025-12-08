import { StorageHelper } from './storage.js';

// Storage helpers
export const storage = {
  get: (key) => {
    return StorageHelper.getItem(key);
  },

  setItem: (key, value, persistent = true) => {
    StorageHelper.setItem(key, value, persistent);
  },

  removeItem: (key) => {
    StorageHelper.removeItem(key);
  },

  clear: () => {
    StorageHelper.clear();
  }
};

// Format utilities
export const formatters = {
  // Format phone number
  formatPhone: (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('57')) {
      // Colombian format
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    return phone;
  },

  // Format currency
  formatCurrency: (amount, currency = 'COP') => {
    if (amount === null || amount === undefined) return '';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  // Format date
  formatDate: (date, options = {}) => {
    if (!date) return '';
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Bogota'
    };
    return new Date(date).toLocaleDateString('es-CO', { ...defaultOptions, ...options });
  },

  // Format time
  formatTime: (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Bogota'
    });
  },

  // Format name
  formatName: (firstName, lastName) => {
    const parts = [firstName, lastName].filter(Boolean);
    return parts.join(' ');
  }
};

// Text utilities
export const textUtils = {
  // Capitalize first letter
  capitalize: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Truncate text
  truncate: (str, length = 50) => {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
  },

  // Generate initials
  getInitials: (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last;
  },

  // Remove accents
  removeAccents: (str) => {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
};

// Debounce utility
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle utility
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};