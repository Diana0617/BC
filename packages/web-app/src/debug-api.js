// Test script to verify API configuration
console.log('=== API Configuration Test ===');

// Check environment variable
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);

// Check global variable
console.log('window.__BC_API_URL__:', window.__BC_API_URL__);

// Import and check API config
import { API_CONFIG } from '@shared/constants/api.js';
console.log('API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);

// Make a test request to verify
const testConnection = async () => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/health`);
    const data = await response.json();
    console.log('✅ API Connection test:', data);
  } catch (error) {
    console.error('❌ API Connection failed:', error.message);
  }
};

testConnection();