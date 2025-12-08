import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions, useRoutePermission } from '../hooks/usePermissions';
import { ROLES } from '../constants/permissions';

/**
 * Componente para proteger rutas que requieren autenticación
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente hijo a renderizar
 * @param {string} props.redirectTo - Ruta de redirección si no está autenticado
 */
export const ProtectedRoute = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated } = usePermissions();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
};

/**
 * Componente para proteger rutas por rol específico
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente hijo a renderizar
 * @param {string|string[]} props.allowedRoles - Roles permitidos
 * @param {string} props.redirectTo - Ruta de redirección si no tiene acceso
 * @param {React.ReactNode} props.fallback - Componente alternativo
 */
export const RoleBasedRoute = ({ 
  children, 
  allowedRoles, 
  redirectTo = '/unauthorized',
  fallback = null
}) => {
  const { userRole, isAuthenticated } = usePermissions();
  const location = useLocation();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar si el rol actual está permitido
  const hasAccess = Array.isArray(allowedRoles) 
    ? allowedRoles.includes(userRole)
    : allowedRoles === userRole;

  if (!hasAccess) {
    if (fallback) {
      return fallback;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

/**
 * Componente para proteger rutas por permisos específicos
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente hijo a renderizar
 * @param {string|string[]} props.requiredPermissions - Permisos requeridos
 * @param {boolean} props.requireAll - Si requiere todos los permisos
 * @param {string} props.redirectTo - Ruta de redirección si no tiene acceso
 */
export const PermissionBasedRoute = ({ 
  children, 
  requiredPermissions, 
  requireAll = false,
  redirectTo = '/unauthorized'
}) => {
  const { isAuthenticated, hasPermission } = usePermissions();
  const location = useLocation();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar permisos
  let hasAccess = false;

  if (Array.isArray(requiredPermissions)) {
    if (requireAll) {
      hasAccess = requiredPermissions.every(permission => hasPermission(permission));
    } else {
      hasAccess = requiredPermissions.some(permission => hasPermission(permission));
    }
  } else {
    hasAccess = hasPermission(requiredPermissions);
  }

  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

/**
 * Componente para rutas de solo OWNER
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente hijo a renderizar
 * @param {string} props.redirectTo - Ruta de redirección si no es OWNER
 */
export const OwnerOnlyRoute = ({ 
  children, 
  redirectTo = '/unauthorized' 
}) => {
  return (
    <RoleBasedRoute 
      allowedRoles={[ROLES.OWNER]} 
      redirectTo={redirectTo}
    >
      {children}
    </RoleBasedRoute>
  );
};

/**
 * Componente para rutas de administración (OWNER y BUSINESS)
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente hijo a renderizar
 * @param {string} props.redirectTo - Ruta de redirección si no es admin
 */
export const AdminRoute = ({ 
  children, 
  redirectTo = '/unauthorized' 
}) => {
  return (
    <RoleBasedRoute 
      allowedRoles={[ROLES.OWNER, ROLES.BUSINESS]} 
      redirectTo={redirectTo}
    >
      {children}
    </RoleBasedRoute>
  );
};

/**
 * Componente para rutas que requieren rol de staff o superior
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente hijo a renderizar
 * @param {string} props.redirectTo - Ruta de redirección si no es staff
 */
export const StaffRoute = ({ 
  children, 
  redirectTo = '/unauthorized' 
}) => {
  return (
    <RoleBasedRoute 
      allowedRoles={[ROLES.OWNER, ROLES.BUSINESS, ROLES.SPECIALIST, ROLES.RECEPTIONIST]} 
      redirectTo={redirectTo}
    >
      {children}
    </RoleBasedRoute>
  );
};

/**
 * Componente para rutas públicas (redirige si ya está autenticado)
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente hijo a renderizar
 * @param {string} props.redirectTo - Ruta de redirección si está autenticado
 */
export const PublicRoute = ({ 
  children, 
  redirectTo = '/dashboard' 
}) => {
  const { isAuthenticated } = usePermissions();

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

/**
 * Componente inteligente que protege rutas automáticamente
 * basado en la configuración de la ruta actual
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente hijo a renderizar
 * @param {string} props.path - Path de la ruta actual
 */
export const SmartRoute = ({ children, path }) => {
  const { canAccess } = useRoutePermission(path);
  const { isAuthenticated } = usePermissions();
  const location = useLocation();

  // Si no está autenticado y la ruta requiere autenticación
  if (!isAuthenticated && canAccess === false) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si no tiene permisos para la ruta
  if (isAuthenticated && canAccess === false) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

/**
 * HOC para crear rutas protegidas
 * @param {React.Component} Component - Componente a proteger
 * @param {Object} options - Opciones de protección
 */
export const withRouteProtection = (Component, options = {}) => {
  const {
    requireAuth = true,
    allowedRoles = null,
    requiredPermissions = null,
    requireAll = false,
    redirectTo = '/unauthorized'
  } = options;

  return function ProtectedComponent(props) {
    if (!requireAuth) {
      return <Component {...props} />;
    }

    if (allowedRoles) {
      return (
        <RoleBasedRoute allowedRoles={allowedRoles} redirectTo={redirectTo}>
          <Component {...props} />
        </RoleBasedRoute>
      );
    }

    if (requiredPermissions) {
      return (
        <PermissionBasedRoute 
          requiredPermissions={requiredPermissions}
          requireAll={requireAll}
          redirectTo={redirectTo}
        >
          <Component {...props} />
        </PermissionBasedRoute>
      );
    }

    return (
      <ProtectedRoute redirectTo="/login">
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};