/**
 * Componente para renderizar condicionalmente según permisos
 * 
 * Uso:
 * <PermissionGuard permission="appointments.create">
 *   <CreateAppointmentButton />
 * </PermissionGuard>
 * 
 * <PermissionGuard 
 *   permissions={['appointments.create', 'appointments.edit']} 
 *   requireAll={true}
 * >
 *   <AdvancedFeature />
 * </PermissionGuard>
 */

import React from 'react'
import useUserPermissions from '../hooks/useUserPermissions'

export const PermissionGuard = ({
  permission,        // Permiso individual
  permissions = [],  // Array de permisos
  requireAll = false, // Si es true, requiere TODOS los permisos (AND). Si false, con UNO basta (OR)
  fallback = null,   // Qué mostrar si no tiene permisos
  children
}) => {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = useUserPermissions()
  
  // Caso 1: Permiso individual
  if (permission) {
    if (!hasPermission(permission)) {
      return fallback
    }
    return <>{children}</>
  }
  
  // Caso 2: Múltiples permisos
  if (permissions.length > 0) {
    const hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
    
    if (!hasAccess) {
      return fallback
    }
    return <>{children}</>
  }
  
  // Sin permisos especificados, denegar por defecto
  return fallback
}

/**
 * Hook para usar dentro de componentes
 */
export const usePermissionCheck = (permission) => {
  const { hasPermission } = useUserPermissions()
  return hasPermission(permission)
}

/**
 * HOC para proteger componentes completos
 */
export const withPermission = (permission) => (Component) => {
  return function PermissionProtectedComponent(props) {
    const { hasPermission } = useUserPermissions()
    
    if (!hasPermission(permission)) {
      return null
    }
    
    return <Component {...props} />
  }
}

export default PermissionGuard
