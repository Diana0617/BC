import { useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectUserPermissionsArray } from '@shared/store/reactNativeStore';

/**
 * Hook de permisos para React Native
 * Compatible con el sistema de permisos del backend y Redux shared
 * 
 * @returns {Object} Funciones y estado de permisos
 */
export const usePermissions = () => {
  // Obtener usuario desde Redux (reactNativeStore)
  const user = useSelector(state => state.auth.user);
  
  // Obtener permisos del usuario desde Redux usando selector memoizado
  const userPermissions = useSelector(selectUserPermissionsArray);
  
  // Set de permisos activos (optimización O(1))
  const permissionsSet = useMemo(() => {
    return new Set(
      userPermissions
        .filter(p => p.isGranted)
        .map(p => p.key)
    );
  }, [userPermissions]);
  
  /**
   * Verificar permiso individual
   * @param {string} permissionKey - Clave del permiso (ej: 'appointments.create')
   * @returns {boolean}
   */
  const hasPermission = useCallback((permissionKey) => {
    // OWNER y BUSINESS tienen todos los permisos
    if (['OWNER', 'BUSINESS'].includes(user?.role)) {
      return true;
    }
    
    // Verificar en el set de permisos
    return permissionsSet.has(permissionKey);
  }, [user?.role, permissionsSet]);
  
  /**
   * Verificar cualquiera de varios permisos (OR)
   * @param {string[]} permissionKeys - Array de claves de permisos
   * @returns {boolean}
   */
  const hasAnyPermission = useCallback((permissionKeys) => {
    if (['OWNER', 'BUSINESS'].includes(user?.role)) {
      return true;
    }
    
    return permissionKeys.some(key => permissionsSet.has(key));
  }, [user?.role, permissionsSet]);
  
  /**
   * Verificar todos los permisos (AND)
   * @param {string[]} permissionKeys - Array de claves de permisos
   * @returns {boolean}
   */
  const hasAllPermissions = useCallback((permissionKeys) => {
    if (['OWNER', 'BUSINESS'].includes(user?.role)) {
      return true;
    }
    
    return permissionKeys.every(key => permissionsSet.has(key));
  }, [user?.role, permissionsSet]);
  
  /**
   * Verificar permiso con logging (útil para debugging)
   * @param {string} permissionKey 
   * @returns {boolean}
   */
  const checkPermission = useCallback((permissionKey) => {
    const has = hasPermission(permissionKey);
    
    if (__DEV__) {
      console.log(`🔐 Permiso "${permissionKey}":`, has ? '✅ Concedido' : '❌ Denegado', `(${user?.role})`);
    }
    
    return has;
  }, [hasPermission, user?.role]);
  
  return {
    // Datos del usuario
    user,
    userRole: user?.role,
    permissions: Array.from(permissionsSet),
    permissionsCount: permissionsSet.size,
    
    // Funciones de verificación
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkPermission,
    
    // Helpers rápidos de rol
    isOwner: user?.role === 'OWNER',
    isBusiness: user?.role === 'BUSINESS',
    isSpecialist: user?.role === 'SPECIALIST',
    isReceptionist: user?.role === 'RECEPTIONIST',
    isReceptionistSpecialist: user?.role === 'RECEPTIONIST_SPECIALIST',
    
    // Helper para verificar si tiene rol staff
    isStaff: ['SPECIALIST', 'RECEPTIONIST', 'RECEPTIONIST_SPECIALIST'].includes(user?.role)
  };
};

/**
 * Hook para verificar permisos específicos con resultado detallado
 * @param {string|string[]} requiredPermissions - Permiso(s) requerido(s)
 * @param {boolean} requireAll - Si requiere TODOS los permisos (default: false = OR)
 * @returns {Object}
 */
export const usePermissionCheck = (requiredPermissions, requireAll = false) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, userRole } = usePermissions();
  
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
    requiredPermissions,
    requireAll,
    // Mensaje de error si no tiene acceso
    denialReason: !hasAccess 
      ? `Se requiere permiso: ${Array.isArray(requiredPermissions) ? requiredPermissions.join(', ') : requiredPermissions}`
      : null
  };
};

/**
 * Hook para verificar múltiples conjuntos de permisos
 * Útil para renderizado condicional complejo
 * @param {Object} permissionGroups - Objeto con grupos de permisos a verificar
 * @returns {Object}
 * 
 * @example
 * const { canCreate, canEdit, canDelete } = usePermissionGroups({
 *   canCreate: 'appointments.create',
 *   canEdit: ['appointments.edit', 'appointments.update'],
 *   canDelete: { permissions: 'appointments.delete', requireAll: false }
 * });
 */
export const usePermissionGroups = (permissionGroups) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  
  return useMemo(() => {
    const results = {};
    
    Object.keys(permissionGroups).forEach(key => {
      const config = permissionGroups[key];
      
      // Si es string simple
      if (typeof config === 'string') {
        results[key] = hasPermission(config);
        return;
      }
      
      // Si es array
      if (Array.isArray(config)) {
        results[key] = hasAnyPermission(config);
        return;
      }
      
      // Si es objeto con configuración
      if (config.permissions) {
        const perms = config.permissions;
        const requireAll = config.requireAll || false;
        
        if (Array.isArray(perms)) {
          results[key] = requireAll 
            ? hasAllPermissions(perms)
            : hasAnyPermission(perms);
        } else {
          results[key] = hasPermission(perms);
        }
      }
    });
    
    return results;
  }, [permissionGroups, hasPermission, hasAnyPermission, hasAllPermissions]);
};
