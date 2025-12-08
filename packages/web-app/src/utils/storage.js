// Storage helper for web (localStorage/sessionStorage)
export const StorageHelper = {
  // Set item to storage
  setItem: (key, value, persistent = false) => {
    try {
      const storage = persistent ? localStorage : sessionStorage;
      storage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to store item:', error);
    }
  },

  // Get item from storage
  getItem: (key) => {
    try {
      // Try localStorage first, then sessionStorage
      return localStorage.getItem(key) || sessionStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to get item:', error);
      return null;
    }
  },

  // Remove item from storage
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove item:', error);
    }
  },

  // Clear all storage
  clear: () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.warn('Failed to clear storage:', error);
    }
  }
};