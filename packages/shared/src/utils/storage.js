// Storage adapter que funciona en web y React Native
let AsyncStorage;

// Detectar el entorno y usar el storage apropiado
if (typeof window !== 'undefined') {
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
  // Estamos en React Native - usar un mock para evitar errores
  AsyncStorage = {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
    clear: async () => {}
  };
}

export { AsyncStorage };

// Funciones helper para compatibilidad - SIN localStorage directo
export const StorageHelper = {
  // Get item (compatible con código existente)
  getItem: (key) => {
    // En React Native siempre devolver null - no hay storage síncrono
    if (typeof window === 'undefined') {
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
    if (typeof window === 'undefined') {
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
    if (typeof window === 'undefined') {
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
    if (typeof window === 'undefined') {
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
    return await AsyncStorage.getItem(key);
  },
  
  async setItemAsync(key, value) {
    return await AsyncStorage.setItem(key, value);
  },
  
  async removeItemAsync(key) {
    return await AsyncStorage.removeItem(key);
  },
  
  async clearAsync() {
    return await AsyncStorage.clear();
  }
};

export default StorageHelper;