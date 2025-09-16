// Environment configuration for web app
// This file sets up the API URL for the shared module

// Set the API URL in a global variable that the shared module can access
if (typeof window !== 'undefined') {
  window.__BC_API_URL__ = import.meta.env.VITE_API_URL || 'http://localhost:3001';
}

export default window.__BC_API_URL__;