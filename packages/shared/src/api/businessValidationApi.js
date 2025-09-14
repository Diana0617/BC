import { apiClient } from './client';

// ================================
// BUSINESS VALIDATION API
// ================================

/**
 * Validar acceso a un negocio específico
 */
export const validateBusinessAccess = async ({ businessId, userId, moduleId }) => {
  return await apiClient.post('/business-validation/validate-access', {
    businessId,
    userId,
    moduleId
  });
};

/**
 * Obtener negocios disponibles para el usuario
 */
export const getAvailableBusinesses = async (userId) => {
  return await apiClient.get(`/business-validation/available-businesses/${userId}`);
};

/**
 * Cambiar negocio activo
 */
export const switchActiveBusiness = async (businessId) => {
  return await apiClient.post('/business-validation/switch-business', {
    businessId
  });
};

/**
 * Verificar permisos específicos en un módulo
 */
export const checkModulePermissions = async ({ businessId, moduleId, permissions }) => {
  return await apiClient.post('/business-validation/check-permissions', {
    businessId,
    moduleId,
    permissions
  });
};

/**
 * Obtener todos los permisos del usuario en un negocio
 */
export const getUserBusinessPermissions = async (businessId, userId) => {
  return await apiClient.get(`/business-validation/user-permissions/${businessId}/${userId}`);
};

/**
 * Verificar si el usuario puede acceder a una funcionalidad específica
 */
export const checkFeatureAccess = async ({ businessId, featureKey, userId }) => {
  return await apiClient.post('/business-validation/check-feature', {
    businessId,
    featureKey,
    userId
  });
};

/**
 * Obtener roles disponibles para un negocio
 */
export const getBusinessRoles = async (businessId) => {
  return await apiClient.get(`/business-validation/business-roles/${businessId}`);
};

/**
 * Validar múltiples permisos de una vez
 */
export const validateMultiplePermissions = async ({ businessId, userId, permissions }) => {
  return await apiClient.post('/business-validation/validate-multiple', {
    businessId,
    userId,
    permissions
  });
};

/**
 * Obtener contexto completo del negocio
 */
export const getBusinessContext = async (businessId) => {
  return await apiClient.get(`/business-validation/business-context/${businessId}`);
};

/**
 * Verificar estado de suscripción del negocio
 */
export const checkBusinessSubscription = async (businessId) => {
  return await apiClient.get(`/business-validation/subscription-status/${businessId}`);
};

/**
 * Obtener límites y cuotas del negocio
 */
export const getBusinessLimits = async (businessId) => {
  return await apiClient.get(`/business-validation/business-limits/${businessId}`);
};

/**
 * Registrar evento de acceso para auditoría
 */
export const logAccessEvent = async ({ businessId, userId, action, resource }) => {
  return await apiClient.post('/business-validation/log-access', {
    businessId,
    userId,
    action,
    resource
  });
};

// Default export como objeto
const businessValidationApi = {
  validateBusinessAccess,
  getAvailableBusinesses,
  switchActiveBusiness,
  checkModulePermissions,
  getUserBusinessPermissions,
  checkFeatureAccess,
  getBusinessRoles,
  validateMultiplePermissions,
  getBusinessContext,
  checkBusinessSubscription,
  getBusinessLimits,
  logAccessEvent
};

export default businessValidationApi;