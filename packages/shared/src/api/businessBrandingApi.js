/**
 * Business Branding API
 * Gestión de logo y colores corporativos del negocio
 */

import { apiClient } from './client.js';

/**
 * Obtener configuración de branding del negocio
 * @param {string} businessId - ID del negocio (o 'current' para el negocio activo)
 * @returns {Promise<Object>} Configuración de branding
 */
export const getBranding = async (businessId = 'current') => {
  try {
    const response = await apiClient.get(`/api/business/${businessId}/branding`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo branding:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener configuración de branding');
  }
};

/**
 * Actualizar colores corporativos del negocio
 * @param {string} businessId - ID del negocio
 * @param {Object} brandingData - Datos de branding
 * @param {string} brandingData.primaryColor - Color principal (#RRGGBB)
 * @param {string} brandingData.secondaryColor - Color secundario (#RRGGBB)
 * @param {string} brandingData.accentColor - Color de acento (#RRGGBB)
 * @param {string} brandingData.fontFamily - Familia de fuente (opcional)
 * @returns {Promise<Object>} Configuración actualizada
 */
export const updateBranding = async (businessId, brandingData) => {
  try {
    const response = await apiClient.put(`/api/business/${businessId}/branding`, brandingData);
    return response.data;
  } catch (error) {
    console.error('Error actualizando branding:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar branding');
  }
};

/**
 * Subir logo del negocio
 * @param {string} businessId - ID del negocio
 * @param {File} logoFile - Archivo de imagen del logo
 * @returns {Promise<Object>} URL del logo subido
 */
export const uploadBusinessLogo = async (businessId, logoFile) => {
  try {
    const formData = new FormData();
    formData.append('logo', logoFile);

    // No especificar Content-Type - el navegador lo establecerá automáticamente con el boundary correcto
    const response = await apiClient.post(`/api/business/${businessId}/upload-logo`, formData);
    
    return response.data;
  } catch (error) {
    console.error('Error subiendo logo:', error);
    throw new Error(error.response?.data?.message || 'Error al subir logo');
  }
};

/**
 * Validar formato de color hexadecimal
 * @param {string} color - Color en formato hexadecimal
 * @returns {boolean} True si es válido
 */
export const validateHexColor = (color) => {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexColorRegex.test(color);
};

/**
 * Obtener contraste de color (para validar accesibilidad)
 * @param {string} hexColor - Color en formato hexadecimal
 * @returns {string} 'light' o 'dark'
 */
export const getColorContrast = (hexColor) => {
  // Remover # si existe
  const hex = hexColor.replace('#', '');
  
  // Convertir a RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calcular luminosidad
  const luminosity = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminosity > 0.5 ? 'light' : 'dark';
};

// Export named object for direct imports
export const businessBrandingApi = {
  getBranding,
  updateBranding,
  uploadBusinessLogo,
  validateHexColor,
  getColorContrast
};

// Export default for index.js re-export
export default businessBrandingApi;
