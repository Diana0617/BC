/**
 * Cambiar el plan de suscripción del negocio
 */
export const changeBusinessPlan = async (newPlanId) => {
  try {
    const response = await apiClient.post('/api/business/subscription/change-plan', { newPlanId });
    return response.data;
  } catch (error) {
    console.error('Error cambiando el plan del negocio:', error);
    throw error;
  }
};
/**
 * API para gestión del perfil de Business
 * Incluye funciones para obtener y actualizar información básica del negocio
 */

import { apiClient } from './client.js';

// ================================
// BUSINESS PROFILE API
// ================================

/**
 * Obtener información básica del negocio actual
 */
export const getBusinessProfile = async () => {
  try {
    const response = await apiClient.get('/api/business');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo perfil del negocio:', error);
    throw error;
  }
};

/**
 * Actualizar información básica del negocio
 */
export const updateBusinessProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/api/business', profileData);
    return response.data;
  } catch (error) {
    console.error('Error actualizando perfil del negocio:', error);
    throw error;
  }
};

/**
 * Obtener información de suscripción del negocio
 */
export const getBusinessSubscription = async () => {
  try {
    const response = await apiClient.get('/api/business/subscription');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo suscripción del negocio:', error);
    throw error;
  }
};

/**
 * Obtener configuración de Taxxa del negocio
 */
export const getBusinessTaxxa = async () => {
  try {
    const response = await apiClient.get('/api/business/taxxa');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo configuración de Taxxa:', error);
    throw error;
  }
};

/**
 * Actualizar configuración de Taxxa del negocio
 */
export const updateBusinessTaxxa = async (taxxaData) => {
  try {
    const response = await apiClient.put('/api/business/taxxa', taxxaData);
    return response.data;
  } catch (error) {
    console.error('Error actualizando configuración de Taxxa:', error);
    throw error;
  }
};

/**
 * Obtener horarios del negocio
 */
export const getBusinessSchedule = async () => {
  try {
    const response = await apiClient.get('/api/business/schedule');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo horarios del negocio:', error);
    throw error;
  }
};

/**
 * Actualizar horarios del negocio
 */
export const updateBusinessSchedule = async (scheduleData) => {
  try {
    const response = await apiClient.put('/api/business/schedule', scheduleData);
    return response.data;
  } catch (error) {
    console.error('Error actualizando horarios del negocio:', error);
    throw error;
  }
};

/**
 * Marcar sección como completada
 */
export const markSectionComplete = async (sectionName) => {
  try {
    const response = await apiClient.post('/api/business/profile/complete-section', {
      section: sectionName
    });
    return response.data;
  } catch (error) {
    console.error('Error marcando sección como completada:', error);
    throw error;
  }
};

/**
 * Obtener progreso de configuración
 */
export const getSetupProgress = async () => {
  try {
    const response = await apiClient.get('/api/business/profile/setup-progress');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo progreso de configuración:', error);
    throw error;
  }
};

/**
 * Subir imagen de perfil del negocio
 */
export const uploadBusinessImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await apiClient.post('/api/business/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error subiendo imagen del negocio:', error);
    throw error;
  }
};

// Export default object with all functions
export const businessProfileApi = {
  getBusinessProfile,
  updateBusinessProfile,
  getBusinessSubscription,
  getBusinessTaxxa,
  updateBusinessTaxxa,
  getBusinessSchedule,
  updateBusinessSchedule,
  markSectionComplete,
  getSetupProgress,
  uploadBusinessImage,
  changeBusinessPlan
};