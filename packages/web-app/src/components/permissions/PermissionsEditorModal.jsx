import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  XMarkIcon,
  ShieldCheckIcon,
  CheckIcon,
  XCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import {
  fetchAllPermissions,
  fetchUserPermissions,
  grantUserPermission,
  revokeUserPermission,
  resetToDefaults
} from '@shared/store/slices';

/**
 * Modal para editar permisos individuales de un miembro del equipo
 * Compatible con WebView móvil
 */
const PermissionsEditorModal = ({ isOpen, onClose, staffMember, businessId }) => {
  const dispatch = useDispatch();
  const [expandedCategories, setExpandedCategories] = useState({});

  // Obtener el userId correcto (userId para staff, id para otros casos)
  const userId = staffMember?.userId || staffMember?.id;

  const {
    allPermissions,
    currentUserPermissions,
    loadingUserPermissions,
    grantLoading,
    revokeLoading,
    error,
    success
  } = useSelector(state => state.permissions);

  // Cargar catálogo de permisos al montar el componente
  useEffect(() => {
    if (allPermissions.length === 0) {
      dispatch(fetchAllPermissions());
    }
  }, [dispatch, allPermissions.length]);

  // Cargar permisos del usuario cuando se abre el modal
  useEffect(() => {
    if (isOpen && userId && businessId) {
      dispatch(fetchUserPermissions({
        businessId,
        userId
      }));
    }
  }, [isOpen, userId, businessId, dispatch]);

  // ✨ OPTIMIZACIÓN: Crear un Set con los permisos activos (se recalcula solo cuando cambian los permisos)
  const grantedPermissionsSet = useMemo(() => {
    if (!currentUserPermissions?.permissions) {
      return new Set();
    }
    
    return new Set(
      currentUserPermissions.permissions
        .filter(p => p.isGranted)
        .map(p => p.key)
    );
  }, [currentUserPermissions]);

  // Verificar si un permiso está activo (ahora es O(1) en lugar de O(n))
  const isPermissionGranted = (permissionKey) => {
    return grantedPermissionsSet.has(permissionKey);
  };

  // Contar permisos activos vs totales (se recalcula cuando cambian los permisos)
  const permissionCount = useMemo(() => {
    const active = currentUserPermissions?.permissions?.filter(p => p.isGranted).length || 0;
    const total = allPermissions?.length || 0;
    return { active, total };
  }, [currentUserPermissions, allPermissions]);

  if (!isOpen || !staffMember) return null;

  // Agrupar permisos por categoría
  const groupedPermissions = allPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  // Toggle categoría expandida/colapsada
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Manejar cambio de permiso
  const handlePermissionToggle = async (permission) => {
    const isCurrentlyGranted = isPermissionGranted(permission.key);
    
    try {
      if (isCurrentlyGranted) {
        await dispatch(revokeUserPermission({
          businessId,
          userId,
          permissionKey: permission.key
        })).unwrap();
      } else {
        await dispatch(grantUserPermission({
          businessId,
          userId,
          permissionKey: permission.key
        })).unwrap();
      }

      // Recargar permisos
      await dispatch(fetchUserPermissions({
        businessId,
        userId
      }));
    } catch (err) {
      console.error('Error toggling permission:', err);
    }
  };

  // Resetear a permisos por defecto del rol
  const handleResetToDefaults = async () => {
    if (!window.confirm('¿Estás seguro de restablecer los permisos por defecto? Se perderán todas las personalizaciones.')) {
      return;
    }

    try {
      await dispatch(resetToDefaults({
        businessId,
        userId,
        role: staffMember.role
      })).unwrap();

      // Recargar permisos
      dispatch(fetchUserPermissions({
        businessId,
        userId
      }));
    } catch (err) {
      console.error('Error resetting permissions:', err);
    }
  };

  // Obtener emoji para categoría
  const getCategoryEmoji = (category) => {
    const emojis = {
      'APPOINTMENTS': '📅',
      'CLIENTS': '👥',
      'SERVICES': '✨',
      'PRODUCTS': '📦',
      'PAYMENTS': '💰',
      'REPORTS': '📊',
      'SETTINGS': '⚙️',
      'STAFF': '👔'
    };
    return emojis[category] || '📋';
  };

  // Obtener badge del rol
  const getRoleBadge = (role) => {
    switch (role) {
      case 'SPECIALIST':
        return { label: 'Especialista', color: 'bg-purple-100 text-purple-700 border-purple-300' };
      case 'RECEPTIONIST_SPECIALIST':
        return { label: 'Recep-Especialista', color: 'bg-blue-100 text-blue-700 border-blue-300' };
      case 'RECEPTIONIST':
        return { label: 'Recepcionista', color: 'bg-green-100 text-green-700 border-green-300' };
      default:
        return { label: role, color: 'bg-gray-100 text-gray-700 border-gray-300' };
    }
  };

  const roleBadge = getRoleBadge(staffMember.role);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Editar Permisos
              </h2>
              <p className="text-sm text-gray-500">
                {staffMember.firstName} {staffMember.lastName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Info del usuario */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-sm font-medium rounded border ${roleBadge.color}`}>
                {roleBadge.label}
              </span>
              <span className="text-sm text-gray-600">
                {permissionCount.active} de {permissionCount.total} permisos activos
              </span>
            </div>
            <button
              onClick={handleResetToDefaults}
              disabled={grantLoading || revokeLoading}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Restablecer por defecto
            </button>
          </div>

          {/* Info contextual */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Los permisos controlan qué acciones puede realizar este usuario en el sistema. 
              Los cambios se aplican inmediatamente.
            </p>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <XCircleIcon className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <CheckIcon className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Contenido - Lista de permisos */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loadingUserPermissions ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(groupedPermissions).map(([category, permissions]) => {
                const isExpanded = expandedCategories[category] !== false; // Por defecto expandido
                const emoji = getCategoryEmoji(category);
                const activeInCategory = permissions.filter(p => isPermissionGranted(p.id)).length;

                return (
                  <div
                    key={category}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* Header de categoría */}
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{emoji}</span>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900">{category}</h3>
                          <p className="text-xs text-gray-500">
                            {activeInCategory} de {permissions.length} activos
                          </p>
                        </div>
                      </div>
                      <span className="text-gray-400">
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </button>

                    {/* Lista de permisos */}
                    {isExpanded && (
                      <div className="divide-y divide-gray-100">
                        {permissions.map(permission => {
                          const isGranted = isPermissionGranted(permission.key);
                          
                          return (
                            <div
                              key={permission.id}
                              className="px-4 py-3 hover:bg-gray-50 transition-colors"
                            >
                              <label className="flex items-start gap-3 cursor-pointer">
                                {/* Checkbox */}
                                <input
                                  type="checkbox"
                                  checked={isGranted}
                                  onChange={() => handlePermissionToggle(permission)}
                                  disabled={grantLoading || revokeLoading}
                                  className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                                />

                                {/* Contenido */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-gray-900">
                                      {permission.name}
                                    </p>
                                    {isGranted && (
                                      <CheckIcon className="h-4 w-4 text-green-600" />
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mt-0.5">
                                    {permission.description}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    Código: {permission.key}
                                  </p>
                                </div>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Los cambios se guardan automáticamente
          </p>
          <button
            onClick={onClose}
            disabled={grantLoading || revokeLoading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckIcon className="h-5 w-5" />
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionsEditorModal;
