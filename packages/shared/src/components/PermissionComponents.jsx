import React from 'react';
import { usePermissions, usePermissionCheck } from '../hooks/usePermissions';

/**
 * Componente para proteger rutas basado en permisos
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si tiene acceso
 * @param {string|string[]} props.requiredPermissions - Permiso(s) requerido(s)
 * @param {boolean} props.requireAll - Si se requieren todos los permisos (default: false)
 * @param {React.ReactNode} props.fallback - Componente a mostrar si no tiene acceso
 * @param {string} props.redirectTo - Ruta a la cual redirigir si no tiene acceso
 */
export const PermissionGuard = ({ 
  children, 
  requiredPermissions, 
  requireAll = false, 
  fallback = null,
  redirectTo = null
}) => {
  const { hasAccess } = usePermissionCheck(requiredPermissions, requireAll);

  if (!hasAccess) {
    if (redirectTo && typeof window !== 'undefined') {
      window.location.href = redirectTo;
      return null;
    }
    return fallback;
  }

  return children;
};

/**
 * Componente para proteger rutas basado en roles
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si tiene acceso
 * @param {string|string[]} props.allowedRoles - Rol(es) permitido(s)
 * @param {React.ReactNode} props.fallback - Componente a mostrar si no tiene acceso
 */
export const RoleGuard = ({ 
  children, 
  allowedRoles, 
  fallback = null 
}) => {
  const { userRole } = usePermissions();

  const hasAccess = Array.isArray(allowedRoles) 
    ? allowedRoles.includes(userRole)
    : allowedRoles === userRole;

  if (!hasAccess) {
    return fallback;
  }

  return children;
};

/**
 * Componente para mostrar contenido solo a usuarios autenticados
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si está autenticado
 * @param {React.ReactNode} props.fallback - Componente a mostrar si no está autenticado
 */
export const AuthGuard = ({ 
  children, 
  fallback = null 
}) => {
  const { isAuthenticated } = usePermissions();

  if (!isAuthenticated) {
    return fallback;
  }

  return children;
};

/**
 * Componente para mostrar contenido solo a usuarios activos
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si está activo
 * @param {React.ReactNode} props.fallback - Componente a mostrar si no está activo
 */
export const ActiveUserGuard = ({ 
  children, 
  fallback = null 
}) => {
  const { isActive } = usePermissions();

  if (!isActive) {
    return fallback;
  }

  return children;
};

/**
 * HOC para proteger componentes con permisos
 * @param {React.Component} Component - Componente a proteger
 * @param {string|string[]} requiredPermissions - Permiso(s) requerido(s)
 * @param {boolean} requireAll - Si se requieren todos los permisos
 * @param {React.ReactNode} fallback - Componente fallback
 */
export const withPermissions = (Component, requiredPermissions, requireAll = false, fallback = null) => {
  return function PermissionProtectedComponent(props) {
    return (
      <PermissionGuard 
        requiredPermissions={requiredPermissions}
        requireAll={requireAll}
        fallback={fallback}
      >
        <Component {...props} />
      </PermissionGuard>
    );
  };
};

/**
 * HOC para proteger componentes con roles
 * @param {React.Component} Component - Componente a proteger
 * @param {string|string[]} allowedRoles - Rol(es) permitido(s)
 * @param {React.ReactNode} fallback - Componente fallback
 */
export const withRoles = (Component, allowedRoles, fallback = null) => {
  return function RoleProtectedComponent(props) {
    return (
      <RoleGuard 
        allowedRoles={allowedRoles}
        fallback={fallback}
      >
        <Component {...props} />
      </RoleGuard>
    );
  };
};

/**
 * Componente para renderizar contenido condicional basado en permisos
 * @param {Object} props
 * @param {string|string[]} props.permission - Permiso(s) a verificar
 * @param {React.ReactNode} props.children - Contenido a mostrar si tiene permiso
 * @param {React.ReactNode} props.fallback - Contenido alternativo
 */
export const PermissionCheck = ({ 
  permission, 
  children, 
  fallback = null 
}) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return fallback;
  }

  return children;
};

/**
 * Componente para renderizar menús/navegación filtrados por permisos
 * @param {Object} props
 * @param {Array} props.items - Items del menú con permisos
 * @param {Function} props.renderItem - Función para renderizar cada item
 * @param {React.ReactNode} props.fallback - Contenido si no hay items accesibles
 */
export const PermissionMenu = ({ 
  items, 
  renderItem, 
  fallback = null 
}) => {
  const { hasPermission, canAccessRoute } = usePermissions();

  const accessibleItems = items.filter(item => {
    if (item.requiredPermissions) {
      if (Array.isArray(item.requiredPermissions)) {
        return item.requiredPermissions.some(permission => hasPermission(permission));
      }
      return hasPermission(item.requiredPermissions);
    }

    if (item.path) {
      return canAccessRoute(item.path);
    }

    return true;
  });

  if (accessibleItems.length === 0) {
    return fallback;
  }

  return (
    <>
      {accessibleItems.map((item, index) => renderItem(item, index))}
    </>
  );
};