// Storage adapter que funciona en web y React Native
let AsyncStorage;

// Detectar el entorno de manera más robusta
const isReactNative = (() => {
  // Verificaciones múltiples para React Native
  if (typeof window === 'undefined') return true; // Node.js o React Native
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') return true;
  if (typeof global !== 'undefined' && global.HermesInternal) return true; // Hermes engine
  return false;
})();

if (!isReactNative) {
  // Estamos en web - usar localStorage/sessionStorage
  AsyncStorage = {
    getItem: async (key) => {
      try {
        return localStorage.getItem(key) || sessionStorage.getItem(key);
      } catch (error) {
        console.warn('Error accessing web storage:', error);
        return null;
      }
    },
    setItem: async (key, value) => {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.warn('Error setting web storage:', error);
      }
    },
    removeItem: async (key) => {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      } catch (error) {
        console.warn('Error removing from web storage:', error);
      }
    },
    clear: async () => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (error) {
        console.warn('Error clearing web storage:', error);
      }
    }
  };
} else {
  // Estamos en React Native - usar AsyncStorage
  try {
    // Importar AsyncStorage de la manera estándar
    const AsyncStorageModule = require('@react-native-async-storage/async-storage');
    AsyncStorage = AsyncStorageModule.default || AsyncStorageModule;
    
    // Verificar que AsyncStorage tiene los métodos necesarios
    if (!AsyncStorage || typeof AsyncStorage.getItem !== 'function') {
      throw new Error('AsyncStorage methods not available');
    }
  } catch (error) {
    console.warn('AsyncStorage not available, using fallback');
    // Usar fallback silencioso
    AsyncStorage = {
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
      clear: async () => {}
    };
  }
}

export { AsyncStorage };

// Funciones helper para compatibilidad - SIN localStorage directo
export const StorageHelper = {
  // Get item (compatible con código existente)
  getItem: (key) => {
    // En React Native siempre devolver null para evitar localStorage
    if (isReactNative) {
      console.warn('StorageHelper.getItem called in React Native - use async version');
      return null;
    }
    
    try {
      // En web, usar localStorage de manera síncrona
      return localStorage.getItem(key) || sessionStorage.getItem(key);
    } catch (error) {
      console.warn('Error getting item from storage:', error);
      return null;
    }
  },
  
  // Set item with option for session vs local storage
  setItem: (key, value, persistent = true) => {
    if (isReactNative) {
      // En React Native, usar AsyncStorage (no puede ser síncrono)
      AsyncStorage.setItem(key, value).catch(error => 
        console.warn('Error setting item in AsyncStorage:', error)
      );
      return;
    }
    
    try {
      if (persistent) {
        localStorage.setItem(key, value);
      } else {
        sessionStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn('Error setting item in storage:', error);
    }
  },
  
  // Remove item from both storages
  removeItem: (key) => {
    if (isReactNative) {
      // En React Native
      AsyncStorage.removeItem(key).catch(error => 
        console.warn('Error removing item from AsyncStorage:', error)
      );
      return;
    }
    
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn('Error removing item from storage:', error);
    }
  },
  
  // Clear all storage
  clear: () => {
    if (isReactNative) {
      // En React Native
      AsyncStorage.clear().catch(error => 
        console.warn('Error clearing AsyncStorage:', error)
      );
      return;
    }
    
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.warn('Error clearing storage:', error);
    }
  },
  
  // Async versions for consistency
  async getItemAsync(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      console.log('StorageHelper.getItemAsync:', { key, hasValue: !!value, valuePreview: value ? `${value.substring(0, 20)}...` : null });
      return value;
    } catch (error) {
      console.warn('Error in getItemAsync:', error);
      return null;
    }
  },
  
  async setItemAsync(key, value) {
    try {
      const result = await AsyncStorage.setItem(key, value);
      console.log('StorageHelper.setItemAsync:', { key, saved: true, valuePreview: value ? `${value.substring(0, 20)}...` : null });
      return result;
    } catch (error) {
      console.warn('Error in setItemAsync:', error);
    }
  },
  
  async removeItemAsync(key) {
    return await AsyncStorage.removeItem(key);
  },
  
  async clearAsync() {
    return await AsyncStorage.clear();
  }
};

export default StorageHelper;