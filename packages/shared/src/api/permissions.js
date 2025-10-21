import { apiClient } from './client.js';

/**
 * API para gestión de permisos granulares
 * Permite a BUSINESS/OWNER gestionar permisos de su equipo
 */

// ================================
// CONSTANTES
// ================================

export const PERMISSION_CONSTANTS = {
  CATEGORIES: {
    APPOINTMENTS: 'appointments',
    PAYMENTS: 'payments',
    CLIENTS: 'clients',
    COMMISSIONS: 'commissions',
    INVENTORY: 'inventory',
    REPORTS: 'reports',
    SERVICES: 'services',
    TEAM: 'team',
    CONFIG: 'config'
  },
  ROLES: {
    BUSINESS: 'BUSINESS',
    SPECIALIST: 'SPECIALIST',
    RECEPTIONIST: 'RECEPTIONIST',
    RECEPTIONIST_SPECIALIST: 'RECEPTIONIST_SPECIALIST'
  }
};

// ================================
// PERMISOS - CRUD
// ================================

/**
 * Obtener todos los permisos disponibles (catálogo)
 * @param {string} [category] - Filtrar por categoría
 * @returns {Promise<Array>} Lista de permisos
 */
export const getAllPermissions = async (category = null) => {
  try {
    const params = category ? { category } : {};
    const response = await apiClient.get('/api/permissions', params);
    return response.data;
  } catch (error) {
    console.error('Error fetching permissions:', error);
    throw new Error(error.response?.data?.error || 'Error al obtener permisos');
  }
};

/**
 * Obtener permisos por defecto de un rol
 * @param {string} role - Rol (SPECIALIST, RECEPTIONIST, etc)
 * @returns {Promise<Object>} Permisos por defecto del rol
 */
export const getRoleDefaultPermissions = async (role) => {
  try {
    const response = await apiClient.get(`/api/permissions/role/${role}/defaults`);
    return response.data;
  } catch (error) {
    console.error('Error fetching role defaults:', error);
    throw new Error(error.response?.data?.error || 'Error al obtener permisos por defecto del rol');
  }
};

/**
 * Obtener permisos efectivos de un usuario en un negocio
 * @param {string} userId - ID del usuario
 * @param {string} businessId - ID del negocio
 * @returns {Promise<Object>} Permisos efectivos del usuario
 */
export const getUserPermissions = async (userId, businessId) => {
  try {
    const response = await apiClient.get(`/api/permissions/user/${userId}/business/${businessId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    throw new Error(error.response?.data?.error || 'Error al obtener permisos del usuario');
  }
};

/**
 * Conceder un permiso a un usuario
 * @param {Object} data - Datos del permiso
 * @param {string} data.userId - ID del usuario
 * @param {string} data.businessId - ID del negocio
 * @param {string} data.permissionKey - Clave del permiso (ej: 'appointments.create')
 * @param {string} [data.notes] - Notas sobre por qué se concede
 * @returns {Promise<Object>} Permiso concedido
 */
export const grantPermission = async (data) => {
  try {
    const response = await apiClient.post('/api/permissions/grant', data);
    return response.data;
  } catch (error) {
    console.error('Error granting permission:', error);
    throw new Error(error.response?.data?.error || 'Error al conceder permiso');
  }
};

/**
 * Revocar un permiso a un usuario
 * @param {Object} data - Datos del permiso
 * @param {string} data.userId - ID del usuario
 * @param {string} data.businessId - ID del negocio
 * @param {string} data.permissionKey - Clave del permiso
 * @param {string} [data.notes] - Notas sobre por qué se revoca
 * @returns {Promise<Object>} Permiso revocado
 */
export const revokePermission = async (data) => {
  try {
    const response = await apiClient.post('/api/permissions/revoke', data);
    return response.data;
  } catch (error) {
    console.error('Error revoking permission:', error);
    throw new Error(error.response?.data?.error || 'Error al revocar permiso');
  }
};

/**
 * Conceder múltiples permisos de una vez
 * @param {Object} data - Datos de los permisos
 * @param {string} data.userId - ID del usuario
 * @param {string} data.businessId - ID del negocio
 * @param {Array<string>} data.permissionKeys - Array de claves de permisos
 * @param {string} [data.notes] - Notas
 * @returns {Promise<Object>} Permisos concedidos
 */
export const grantBulkPermissions = async (data) => {
  try {
    const response = await apiClient.post('/api/permissions/grant-bulk', data);
    return response.data;
  } catch (error) {
    console.error('Error granting bulk permissions:', error);
    throw new Error(error.response?.data?.error || 'Error al conceder permisos múltiples');
  }
};

/**
 * Revocar múltiples permisos de una vez
 * @param {Object} data - Datos de los permisos
 * @param {string} data.userId - ID del usuario
 * @param {string} data.businessId - ID del negocio
 * @param {Array<string>} data.permissionKeys - Array de claves de permisos
 * @param {string} [data.notes] - Notas
 * @returns {Promise<Object>} Permisos revocados
 */
export const revokeBulkPermissions = async (data) => {
  try {
    const response = await apiClient.post('/api/permissions/revoke-bulk', data);
    return response.data;
  } catch (error) {
    console.error('Error revoking bulk permissions:', error);
    throw new Error(error.response?.data?.error || 'Error al revocar permisos múltiples');
  }
};

/**
 * Resetear permisos de un usuario a los valores por defecto de su rol
 * @param {string} userId - ID del usuario
 * @param {string} businessId - ID del negocio
 * @returns {Promise<Object>} Confirmación
 */
export const resetUserPermissions = async (userId, businessId) => {
  try {
    const response = await apiClient.post('/api/permissions/reset', { userId, businessId });
    return response.data;
  } catch (error) {
    console.error('Error resetting permissions:', error);
    throw new Error(error.response?.data?.error || 'Error al resetear permisos');
  }
};

// ================================
// UTILIDADES Y HELPERS
// ================================

/**
 * Agrupar permisos por categoría
 * @param {Array} permissions - Lista de permisos
 * @returns {Object} Permisos agrupados por categoría
 */
export const groupPermissionsByCategory = (permissions) => {
  return permissions.reduce((acc, permission) => {
    const category = permission.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {});
};

/**
 * Verificar si un usuario tiene un permiso específico
 * @param {Array} userPermissions - Permisos del usuario
 * @param {string} permissionKey - Clave del permiso a verificar
 * @returns {boolean} True si tiene el permiso
 */
export const hasPermission = (userPermissions, permissionKey) => {
  return userPermissions.some(p => p.permission?.key === permissionKey && p.isGranted);
};

/**
 * Obtener permisos personalizados (diferentes a los defaults)
 * @param {Object} userPermissionsData - Datos de permisos del usuario
 * @returns {Object} Permisos concedidos y revocados
 */
export const getCustomPermissions = (userPermissionsData) => {
  const customizations = userPermissionsData.customizations || {};
  return {
    granted: customizations.extraGranted || [],
    revoked: customizations.revoked || []
  };
};

/**
 * Calcular resumen de permisos por categoría
 * @param {Array} permissions - Lista de permisos del usuario
 * @returns {Object} Resumen por categoría
 */
export const calculatePermissionsSummary = (permissions) => {
  const byCategory = {};
  let totalActive = 0;

  permissions.forEach(perm => {
    const category = perm.permission?.category || 'other';
    
    if (!byCategory[category]) {
      byCategory[category] = { active: 0, total: 0 };
    }
    
    byCategory[category].total += 1;
    
    if (perm.isGranted) {
      byCategory[category].active += 1;
      totalActive += 1;
    }
  });

  return {
    total: totalActive,
    byCategory
  };
};

/**
 * Formatear permiso para mostrar en UI
 * @param {Object} permission - Permiso a formatear
 * @returns {Object} Permiso formateado
 */
export const formatPermission = (permission) => {
  return {
    ...permission,
    categoryLabel: getCategoryLabel(permission.category),
    statusLabel: permission.isGranted ? 'Activo' : 'Inactivo',
    isDefault: permission.source === 'default',
    isCustom: permission.source === 'custom'
  };
};

/**
 * Obtener etiqueta de categoría
 * @param {string} category - Categoría
 * @returns {string} Etiqueta legible
 */
export const getCategoryLabel = (category) => {
  const labels = {
    appointments: 'Citas',
    payments: 'Pagos',
    clients: 'Clientes',
    commissions: 'Comisiones',
    inventory: 'Inventario',
    reports: 'Reportes',
    services: 'Servicios',
    team: 'Equipo',
    config: 'Configuración'
  };
  return labels[category] || category;
};

/**
 * Obtener emoji de categoría
 * @param {string} category - Categoría
 * @returns {string} Emoji
 */
export const getCategoryEmoji = (category) => {
  const emojis = {
    appointments: '📅',
    payments: '💰',
    clients: '👥',
    commissions: '💸',
    inventory: '📦',
    reports: '📊',
    services: '💼',
    team: '👥',
    config: '⚙️'
  };
  return emojis[category] || '📋';
};

/**
 * Obtener color de categoría
 * @param {string} category - Categoría
 * @returns {string} Color hexadecimal
 */
export const getCategoryColor = (category) => {
  const colors = {
    appointments: '#3B82F6',
    payments: '#10B981',
    clients: '#F59E0B',
    commissions: '#8B5CF6',
    inventory: '#6366F1',
    reports: '#EC4899',
    services: '#14B8A6',
    team: '#F97316',
    config: '#6B7280'
  };
  return colors[category] || '#9CA3AF';
};

/**
 * Obtener color de rol
 * @param {string} role - Rol
 * @returns {string} Color hexadecimal
 */
export const getRoleColor = (role) => {
  const colors = {
    BUSINESS: '#8B5CF6',
    SPECIALIST: '#3B82F6',
    RECEPTIONIST: '#10B981',
    RECEPTIONIST_SPECIALIST: '#F59E0B'
  };
  return colors[role] || '#6B7280';
};

/**
 * Validar datos de concesión de permiso
 * @param {Object} data - Datos a validar
 * @returns {Object} Resultado de validación
 */
export const validatePermissionData = (data) => {
  const errors = {};

  if (!data.userId) {
    errors.userId = 'Usuario es requerido';
  }

  if (!data.businessId) {
    errors.businessId = 'Negocio es requerido';
  }

  if (!data.permissionKey && !data.permissionKeys) {
    errors.permissionKey = 'Permiso es requerido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ================================
// EXPORTACIONES AGRUPADAS
// ================================

export const permissionsCRUD = {
  getAllPermissions,
  getRoleDefaultPermissions,
  getUserPermissions,
  grantPermission,
  revokePermission,
  grantBulkPermissions,
  revokeBulkPermissions,
  resetUserPermissions
};

export const permissionsUtils = {
  groupPermissionsByCategory,
  hasPermission,
  getCustomPermissions,
  calculatePermissionsSummary,
  formatPermission,
  getCategoryLabel,
  getCategoryEmoji,
  getCategoryColor,
  getRoleColor,
  validatePermissionData
};

// Exportación por defecto
export default {
  ...permissionsCRUD,
  ...permissionsUtils,
  PERMISSION_CONSTANTS
};
