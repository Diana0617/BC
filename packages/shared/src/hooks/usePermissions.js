import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessRoute,
  getDefaultRouteForRole,
  createPermissionsObject,
  isRoleHigherThan,
  isRoleEqualOrHigher
} from '../utils/permissions';

/**
 * Hook principal para manejo de permisos
 * @returns {Object} Objeto con funciones y datos de permisos
 */
export const usePermissions = () => {
  // Obtener datos del usuario desde Redux
  const user = useSelector(state => state.auth.user);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  
  const userRole = user?.role;
  const userStatus = user?.status;
  const userId = user?.id;

  // Crear objeto de permisos memoizado
  const permissionsData = useMemo(() => {
    if (!userRole) return null;
    return createPermissionsObject(userRole, userStatus);
  }, [userRole, userStatus]);

  // Funciones de verificación de permisos
  const checkPermission = useMemo(() => (permission) => {
    return hasPermission(userRole, permission, userStatus);
  }, [userRole, userStatus]);

  const checkAnyPermission = useMemo(() => (permissions) => {
    return hasAnyPermission(userRole, permissions, userStatus);
  }, [userRole, userStatus]);

  const checkAllPermissions = useMemo(() => (permissions) => {
    return hasAllPermissions(userRole, permissions, userStatus);
  }, [userRole, userStatus]);

  const checkRouteAccess = useMemo(() => (path) => {
    return canAccessRoute(path, userRole, isAuthenticated, userStatus);
  }, [userRole, isAuthenticated, userStatus]);

  const isHigherRole = useMemo(() => (targetRole) => {
    return isRoleHigherThan(userRole, targetRole);
  }, [userRole]);

  const isEqualOrHigherRole = useMemo(() => (targetRole) => {
    return isRoleEqualOrHigher(userRole, targetRole);
  }, [userRole]);

  return {
    // Datos del usuario
    user,
    userRole,
    userStatus,
    userId,
    isAuthenticated,
    
    // Objeto de permisos estructurado
    permissions: permissionsData,
    
    // Funciones de verificación
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    canAccessRoute: checkRouteAccess,
    isHigherRole,
    isEqualOrHigherRole,
    
    // Helpers
    getDefaultRoute: () => getDefaultRouteForRole(userRole),
    
    // Verificaciones rápidas por rol
    isOwner: userRole === 'OWNER',
    isBusiness: userRole === 'BUSINESS',
    isSpecialist: userRole === 'SPECIALIST',
    isReceptionist: userRole === 'RECEPTIONIST',
    isClient: userRole === 'CLIENT',
    
    // Estado del usuario
    isActive: userStatus === 'ACTIVE',
    isInactive: userStatus === 'INACTIVE',
    isSuspended: userStatus === 'SUSPENDED',
    isPending: userStatus === 'PENDING'
  };
};

/**
 * Hook específico para verificar permisos de una funcionalidad
 * @param {string|string[]} requiredPermissions - Permiso(s) requerido(s)
 * @param {boolean} requireAll - Si se requieren todos los permisos (default: false)
 * @returns {Object}
 */
export const usePermissionCheck = (requiredPermissions, requireAll = false) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, userRole, userStatus } = usePermissions();

  const hasAccess = useMemo(() => {
    if (!requiredPermissions) return true;

    if (Array.isArray(requiredPermissions)) {
      return requireAll 
        ? hasAllPermissions(requiredPermissions)
        : hasAnyPermission(requiredPermissions);
    }

    return hasPermission(requiredPermissions);
  }, [requiredPermissions, requireAll, hasPermission, hasAnyPermission, hasAllPermissions]);

  return {
    hasAccess,
    userRole,
    userStatus,
    requiredPermissions,
    requireAll
  };
};

/**
 * Hook para verificar acceso a rutas
 * @param {string} path - Ruta a verificar
 * @returns {Object}
 */
export const useRoutePermission = (path) => {
  const { canAccessRoute, userRole, isAuthenticated, userStatus } = usePermissions();

  const canAccess = useMemo(() => {
    return canAccessRoute(path);
  }, [path, canAccessRoute]);

  return {
    canAccess,
    path,
    userRole,
    isAuthenticated,
    userStatus
  };
};

/**
 * Hook para obtener rutas filtradas por permisos
 * @param {Array} routes - Array de rutas con sus permisos requeridos
 * @returns {Array}
 */
export const useFilteredRoutes = (routes) => {
  const { hasPermission, canAccessRoute } = usePermissions();

  const filteredRoutes = useMemo(() => {
    return routes.filter(route => {
      // Si la ruta tiene permisos específicos
      if (route.requiredPermissions) {
        if (Array.isArray(route.requiredPermissions)) {
          return route.requiredPermissions.some(permission => hasPermission(permission));
        }
        return hasPermission(route.requiredPermissions);
      }

      // Si solo tiene path, verificar acceso a la ruta
      if (route.path) {
        return canAccessRoute(route.path);
      }

      // Si no tiene restricciones, incluir
      return true;
    });
  }, [routes, hasPermission, canAccessRoute]);

  return filteredRoutes;
};

/**
 * Hook para verificar permisos sobre otros usuarios
 * @param {string} targetUserId - ID del usuario objetivo
 * @param {string} targetUserRole - Rol del usuario objetivo
 * @param {string} businessId - ID del negocio (opcional)
 * @returns {Object}
 */
export const useUserPermissions = (targetUserId, targetUserRole = null, businessId = null) => {
  const { userRole, userId, isHigherRole } = usePermissions();

  const canInteract = useMemo(() => {
    // Puede interactuar consigo mismo
    if (userId === targetUserId) return true;

    // OWNER puede interactuar con cualquiera
    if (userRole === 'OWNER') return true;

    // BUSINESS puede interactuar con usuarios de su negocio
    if (userRole === 'BUSINESS' && businessId) return true;

    // Verificar jerarquía de roles
    if (targetUserRole) {
      return isHigherRole(targetUserRole);
    }

    return false;
  }, [userId, targetUserId, userRole, targetUserRole, businessId, isHigherRole]);

  const canEdit = useMemo(() => {
    return canInteract && (userRole === 'OWNER' || userRole === 'BUSINESS');
  }, [canInteract, userRole]);

  const canDelete = useMemo(() => {
    return canInteract && userRole === 'OWNER';
  }, [canInteract, userRole]);

  return {
    canInteract,
    canEdit,
    canDelete,
    targetUserId,
    targetUserRole,
    businessId
  };
};