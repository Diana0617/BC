import { 
  ROLES, 
  ROLE_HIERARCHY, 
  ROLE_PERMISSIONS,
  USER_STATUS
} from '../constants/permissions';

import {
  ROUTE_CONFIG,
  getRouteConfig,
  isPublicRoute,
  isProtectedRoute
} from '../config/routes';

/**
 * Verifica si un usuario tiene un permiso específico
 * @param {string} userRole - Rol del usuario
 * @param {string} permission - Permiso a verificar
 * @param {string} userStatus - Estado del usuario
 * @returns {boolean}
 */
export const hasPermission = (userRole, permission, userStatus = USER_STATUS.ACTIVE) => {
  // Usuario inactivo o suspendido no tiene permisos
  if (userStatus !== USER_STATUS.ACTIVE) {
    return false;
  }

  // Verificar si el rol existe
  if (!userRole || !ROLE_PERMISSIONS[userRole]) {
    return false;
  }

  // Verificar si el rol tiene el permiso
  return ROLE_PERMISSIONS[userRole].includes(permission);
};

/**
 * Verifica si un usuario tiene alguno de los permisos especificados
 * @param {string} userRole - Rol del usuario
 * @param {string[]} permissions - Array de permisos a verificar
 * @param {string} userStatus - Estado del usuario
 * @returns {boolean}
 */
export const hasAnyPermission = (userRole, permissions, userStatus = USER_STATUS.ACTIVE) => {
  return permissions.some(permission => hasPermission(userRole, permission, userStatus));
};

/**
 * Verifica si un usuario tiene todos los permisos especificados
 * @param {string} userRole - Rol del usuario
 * @param {string[]} permissions - Array de permisos a verificar
 * @param {string} userStatus - Estado del usuario
 * @returns {boolean}
 */
export const hasAllPermissions = (userRole, permissions, userStatus = USER_STATUS.ACTIVE) => {
  return permissions.every(permission => hasPermission(userRole, permission, userStatus));
};

/**
 * Verifica si un rol es superior a otro en la jerarquía
 * @param {string} userRole - Rol del usuario
 * @param {string} targetRole - Rol objetivo a comparar
 * @returns {boolean}
 */
export const isRoleHigherThan = (userRole, targetRole) => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const targetLevel = ROLE_HIERARCHY[targetRole] || 0;
  return userLevel > targetLevel;
};

/**
 * Verifica si un rol es igual o superior a otro
 * @param {string} userRole - Rol del usuario
 * @param {string} targetRole - Rol objetivo a comparar
 * @returns {boolean}
 */
export const isRoleEqualOrHigher = (userRole, targetRole) => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const targetLevel = ROLE_HIERARCHY[targetRole] || 0;
  return userLevel >= targetLevel;
};

/**
 * Obtiene todos los permisos de un rol
 * @param {string} userRole - Rol del usuario
 * @returns {string[]}
 */
export const getRolePermissions = (userRole) => {
  return ROLE_PERMISSIONS[userRole] || [];
};

/**
 * Verifica si una ruta es pública (no requiere autenticación)
 * @param {string} path - Ruta a verificar
 * @returns {boolean}
 */
export const isPublicRouteCheck = (path) => {
  return isPublicRoute(path);
};

/**
 * Verifica si una ruta requiere solo autenticación (cualquier usuario logueado)
 * @param {string} path - Ruta a verificar
 * @returns {boolean}
 */
export const isAuthenticatedRoute = (path) => {
  return isProtectedRoute(path);
};

/**
 * Verifica si un usuario puede acceder a una ruta específica
 * @param {string} path - Ruta a verificar
 * @param {string} userRole - Rol del usuario
 * @param {boolean} isAuthenticated - Si el usuario está autenticado
 * @param {string} userStatus - Estado del usuario
 * @returns {boolean}
 */
export const canAccessRoute = (path, userRole = null, isAuthenticated = false, userStatus = USER_STATUS.ACTIVE) => {
  // Rutas públicas siempre accesibles
  if (isPublicRoute(path)) {
    return true;
  }

  // Si no está autenticado, solo puede acceder a rutas públicas
  if (!isAuthenticated) {
    return false;
  }

  // Usuario inactivo o suspendido no puede acceder
  if (userStatus !== USER_STATUS.ACTIVE) {
    return false;
  }

  // Rutas que requieren solo autenticación
  if (isAuthenticatedRoute(path)) {
    return true;
  }

  // Verificar rutas específicas por rol usando la configuración
  const routeConfig = getRouteConfig(path);
  if (routeConfig) {
    // Verificar rol
    if (routeConfig.roles && !routeConfig.roles.includes(userRole)) {
      return false;
    }
    
    // Verificar permisos
    if (routeConfig.permissions && routeConfig.permissions.length > 0) {
      return routeConfig.permissions.some(permission => 
        hasPermission(userRole, permission, userStatus)
      );
    }
    
    return true;
  }

  // Si no coincide con ninguna ruta específica, denegar acceso
  return false;
};

/**
 * Obtiene la ruta por defecto para un rol específico
 * @param {string} userRole - Rol del usuario
 * @returns {string}
 */
export const getDefaultRouteForRole = (userRole) => {
  const roleRouteMap = {
    [ROLES.OWNER]: '/owner/dashboard',
    [ROLES.BUSINESS]: '/business/dashboard',
    [ROLES.SPECIALIST]: '/specialist/schedule',
    [ROLES.RECEPTIONIST]: '/reception/appointments',
    [ROLES.CLIENT]: '/client/appointments'
  };
  
  return roleRouteMap[userRole] || '/dashboard';
};

/**
 * Filtra un array de elementos basado en los permisos del usuario
 * @param {Array} items - Items a filtrar
 * @param {string} userRole - Rol del usuario
 * @param {Function} permissionCheck - Función que retorna el permiso requerido para cada item
 * @param {string} userStatus - Estado del usuario
 * @returns {Array}
 */
export const filterByPermissions = (items, userRole, permissionCheck, userStatus = USER_STATUS.ACTIVE) => {
  return items.filter(item => {
    const requiredPermission = permissionCheck(item);
    return hasPermission(userRole, requiredPermission, userStatus);
  });
};

/**
 * Verifica si un usuario puede ver o interactuar con datos de otro usuario
 * @param {string} currentUserRole - Rol del usuario actual
 * @param {string} currentUserId - ID del usuario actual
 * @param {string} targetUserId - ID del usuario objetivo
 * @param {string} targetUserRole - Rol del usuario objetivo
 * @param {string} businessId - ID del negocio (si aplica)
 * @returns {boolean}
 */
export const canInteractWithUser = (
  currentUserRole, 
  currentUserId, 
  targetUserId, 
  targetUserRole = null, 
  businessId = null
) => {
  // Un usuario siempre puede ver sus propios datos
  if (currentUserId === targetUserId) {
    return true;
  }

  // OWNER puede ver cualquier usuario
  if (currentUserRole === ROLES.OWNER) {
    return true;
  }

  // BUSINESS puede ver usuarios dentro de su negocio
  if (currentUserRole === ROLES.BUSINESS && businessId) {
    return true; // Aquí se debería verificar que el target user pertenece al business
  }

  // Roles inferiores no pueden ver otros usuarios por defecto
  return false;
};

/**
 * Crea un objeto con información de permisos para el frontend
 * @param {string} userRole - Rol del usuario
 * @param {string} userStatus - Estado del usuario
 * @returns {Object}
 */
export const createPermissionsObject = (userRole, userStatus = USER_STATUS.ACTIVE) => {
  const permissions = getRolePermissions(userRole);
  const permissionsObj = {};
  
  permissions.forEach(permission => {
    const [module, action] = permission.split(':');
    if (!permissionsObj[module]) {
      permissionsObj[module] = {};
    }
    permissionsObj[module][action] = true;
  });

  return {
    role: userRole,
    status: userStatus,
    permissions: permissionsObj,
    rawPermissions: permissions,
    hierarchy: ROLE_HIERARCHY[userRole] || 0
  };
};