import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { ROLES } from '../constants/permissions';

/**
 * Componente para mostrar/ocultar elementos UI basado en permisos
 * @param {Object} props
 * @param {React.ReactNode} props.children - Elementos a mostrar si tiene permiso
 * @param {string|string[]} props.permissions - Permiso(s) requerido(s)
 * @param {boolean} props.requireAll - Si requiere todos los permisos
 * @param {React.ReactNode} props.fallback - Elemento alternativo
 */
export const ConditionalRender = ({ 
  children, 
  permissions, 
  requireAll = false, 
  fallback = null 
}) => {
  const { hasPermission } = usePermissions();

  let hasAccess = false;

  if (Array.isArray(permissions)) {
    if (requireAll) {
      hasAccess = permissions.every(permission => hasPermission(permission));
    } else {
      hasAccess = permissions.some(permission => hasPermission(permission));
    }
  } else {
    hasAccess = hasPermission(permissions);
  }

  return hasAccess ? children : fallback;
};

/**
 * Componente para botones con permisos
 * @param {Object} props
 * @param {string|string[]} props.permissions - Permiso(s) requerido(s)
 * @param {Function} props.onClick - Manejador de click
 * @param {React.ReactNode} props.children - Contenido del botón
 * @param {boolean} props.showDisabled - Mostrar botón deshabilitado si no tiene permisos
 * @param {Object} props.buttonProps - Props adicionales para el botón
 */
export const PermissionButton = ({ 
  permissions, 
  onClick, 
  children, 
  showDisabled = false,
  ...buttonProps 
}) => {
  const { hasPermission } = usePermissions();

  const hasAccess = Array.isArray(permissions)
    ? permissions.some(permission => hasPermission(permission))
    : hasPermission(permissions);

  if (!hasAccess && !showDisabled) {
    return null;
  }

  return (
    <button
      {...buttonProps}
      onClick={hasAccess ? onClick : undefined}
      disabled={!hasAccess}
      style={{
        ...buttonProps.style,
        opacity: hasAccess ? 1 : 0.5,
        cursor: hasAccess ? 'pointer' : 'not-allowed'
      }}
    >
      {children}
    </button>
  );
};

/**
 * Componente para enlaces con permisos
 * @param {Object} props
 * @param {string|string[]} props.permissions - Permiso(s) requerido(s)
 * @param {string} props.to - URL destino
 * @param {React.ReactNode} props.children - Contenido del enlace
 * @param {boolean} props.showDisabled - Mostrar enlace deshabilitado si no tiene permisos
 * @param {Object} props.linkProps - Props adicionales para el enlace
 */
export const PermissionLink = ({ 
  permissions, 
  to, 
  children, 
  showDisabled = false,
  ...linkProps 
}) => {
  const { hasPermission, canAccessRoute } = usePermissions();

  const hasPermissionAccess = Array.isArray(permissions)
    ? permissions.some(permission => hasPermission(permission))
    : hasPermission(permissions);

  const hasRouteAccess = canAccessRoute(to);
  const hasAccess = hasPermissionAccess && hasRouteAccess;

  if (!hasAccess && !showDisabled) {
    return null;
  }

  if (!hasAccess) {
    return (
      <span 
        {...linkProps}
        style={{
          ...linkProps.style,
          opacity: 0.5,
          cursor: 'not-allowed',
          textDecoration: 'none'
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <a href={to} {...linkProps}>
      {children}
    </a>
  );
};

/**
 * Componente para mostrar contenido solo a roles específicos
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido a mostrar
 * @param {string|string[]} props.roles - Rol(es) permitido(s)
 * @param {React.ReactNode} props.fallback - Contenido alternativo
 */
export const RoleBasedContent = ({ 
  children, 
  roles, 
  fallback = null 
}) => {
  const { userRole } = usePermissions();

  const hasAccess = Array.isArray(roles) 
    ? roles.includes(userRole)
    : roles === userRole;

  return hasAccess ? children : fallback;
};

/**
 * Componente para mostrar contenido de administración
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido a mostrar
 * @param {React.ReactNode} props.fallback - Contenido alternativo
 */
export const AdminContent = ({ children, fallback = null }) => {
  return (
    <RoleBasedContent 
      roles={[ROLES.OWNER, ROLES.BUSINESS]} 
      fallback={fallback}
    >
      {children}
    </RoleBasedContent>
  );
};

/**
 * Componente para mostrar contenido solo a OWNER
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido a mostrar
 * @param {React.ReactNode} props.fallback - Contenido alternativo
 */
export const OwnerContent = ({ children, fallback = null }) => {
  return (
    <RoleBasedContent 
      roles={[ROLES.OWNER]} 
      fallback={fallback}
    >
      {children}
    </RoleBasedContent>
  );
};

/**
 * Componente para mostrar contenido a usuarios activos
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido a mostrar
 * @param {React.ReactNode} props.fallback - Contenido alternativo
 */
export const ActiveUserContent = ({ children, fallback = null }) => {
  const { isActive } = usePermissions();

  return isActive ? children : fallback;
};

/**
 * Componente para mostrar formularios con permisos
 * @param {Object} props
 * @param {React.ReactNode} props.children - Campos del formulario
 * @param {string|string[]} props.createPermission - Permiso para crear
 * @param {string|string[]} props.editPermission - Permiso para editar
 * @param {boolean} props.isEditing - Si está en modo edición
 * @param {React.ReactNode} props.readOnlyContent - Contenido de solo lectura
 */
export const PermissionForm = ({ 
  children, 
  createPermission, 
  editPermission, 
  isEditing = false, 
  readOnlyContent = null 
}) => {
  const { hasPermission } = usePermissions();

  const requiredPermission = isEditing ? editPermission : createPermission;
  const hasAccess = hasPermission(requiredPermission);

  if (!hasAccess) {
    return readOnlyContent || <div>No tienes permisos para realizar esta acción</div>;
  }

  return children;
};

/**
 * Componente para tablas con acciones basadas en permisos
 * @param {Object} props
 * @param {Array} props.data - Datos de la tabla
 * @param {Array} props.columns - Configuración de columnas
 * @param {Object} props.actions - Acciones disponibles con sus permisos
 * @param {Function} props.renderRow - Función para renderizar filas
 */
export const PermissionTable = ({ 
  data, 
  columns, 
  actions = {}, 
  renderRow 
}) => {
  const { hasPermission } = usePermissions();

  const availableActions = Object.keys(actions).filter(actionKey => {
    const action = actions[actionKey];
    return hasPermission(action.permission);
  });

  return (
    <div className="permission-table">
      <table>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.title}</th>
            ))}
            {availableActions.length > 0 && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
              {availableActions.length > 0 && (
                <td>
                  {availableActions.map(actionKey => {
                    const action = actions[actionKey];
                    return (
                      <PermissionButton
                        key={actionKey}
                        permissions={action.permission}
                        onClick={() => action.handler(row)}
                        className={action.className}
                      >
                        {action.label}
                      </PermissionButton>
                    );
                  })}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};