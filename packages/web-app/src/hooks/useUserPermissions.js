import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getUserPermissions } from '@shared/api/permissions';

/**
 * Hook para cargar y verificar permisos efectivos del usuario actual
 * Carga los permisos desde el backend (defaults + customizaciones)
 * @returns {Object} Permisos del usuario y funciones de verificación
 */
export const useUserPermissions = () => {
  const { user, token } = useSelector(state => state.auth);
  const businessId = user?.businessId;
  const userId = user?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionsData, setPermissionsData] = useState(null);

  // Cargar permisos efectivos del usuario
  const loadPermissions = useCallback(async () => {
    if (!userId || !businessId || !token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 [useUserPermissions] Cargando permisos para:', { userId, businessId });
      
      const response = await getUserPermissions(userId, businessId);
      
      if (response.success) {
        setPermissionsData(response.data);
        console.log('✅ [useUserPermissions] Permisos cargados:', {
          total: response.data.permissions?.length,
          role: response.data.user?.role
        });
      } else {
        throw new Error(response.error || 'Error al cargar permisos');
      }
    } catch (err) {
      console.error('❌ [useUserPermissions] Error:', err);
      setError(err.message);
      setPermissionsData(null);
    } finally {
      setLoading(false);
    }
  }, [userId, businessId, token]);

  // Cargar permisos al montar o cambiar usuario
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  // Crear Set de permisos activos para búsqueda rápida
  const activePermissions = useMemo(() => {
    if (!permissionsData?.permissions) return new Set();
    
    return new Set(
      permissionsData.permissions
        .filter(p => p.isGranted)
        .map(p => p.permission?.key)
    );
  }, [permissionsData]);

  // Función para verificar un permiso específico
  const hasPermission = useCallback((permissionKey) => {
    if (!permissionKey) return false;
    return activePermissions.has(permissionKey);
  }, [activePermissions]);

  // Función para verificar si tiene alguno de los permisos
  const hasAnyPermission = useCallback((permissionKeys) => {
    if (!Array.isArray(permissionKeys)) return false;
    return permissionKeys.some(key => activePermissions.has(key));
  }, [activePermissions]);

  // Función para verificar si tiene todos los permisos
  const hasAllPermissions = useCallback((permissionKeys) => {
    if (!Array.isArray(permissionKeys)) return false;
    return permissionKeys.every(key => activePermissions.has(key));
  }, [activePermissions]);

  // Obtener permisos por categoría
  const getPermissionsByCategory = useCallback((category) => {
    if (!permissionsData?.permissions) return [];
    return permissionsData.permissions
      .filter(p => p.permission?.category === category && p.isGranted);
  }, [permissionsData]);

  // Verificar permisos específicos para el dashboard
  const canViewAllAppointments = hasPermission('appointments.view_all');
  const canCreateAppointments = hasPermission('appointments.create');
  const canEditAppointments = hasPermission('appointments.edit');
  const canCancelAppointments = hasPermission('appointments.cancel');
  
  const canViewPayments = hasPermission('payments.view');
  const canCreatePayments = hasPermission('payments.create');
  const canProcessPayments = hasPermission('payments.process');
  
  const canViewClients = hasPermission('clients.view');
  const canCreateClients = hasPermission('clients.create');
  const canEditClients = hasPermission('clients.edit');
  
  const canViewInventory = hasPermission('inventory.view');
  const canManageInventory = hasPermission('inventory.create') || hasPermission('inventory.edit');
  
  const canViewReports = hasPermission('reports.view');
  const canViewCommissions = hasPermission('commissions.view');
  
  // Permisos de consentimientos (si existen en el sistema)
  const canViewConsents = hasPermission('consents.view') || hasPermission('appointments.manage_consents');
  const canCreateConsents = hasPermission('consents.create');

  return {
    // Estado
    loading,
    error,
    permissionsData,
    
    // Datos del usuario
    user: permissionsData?.user,
    userRole: permissionsData?.user?.role || user?.role,
    
    // Permisos activos
    permissions: Array.from(activePermissions),
    permissionsCount: activePermissions.size,
    
    // Funciones de verificación
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermissionsByCategory,
    
    // Permisos específicos (helpers)
    appointments: {
      viewAll: canViewAllAppointments,
      create: canCreateAppointments,
      edit: canEditAppointments,
      cancel: canCancelAppointments
    },
    payments: {
      view: canViewPayments,
      create: canCreatePayments,
      process: canProcessPayments
    },
    clients: {
      view: canViewClients,
      create: canCreateClients,
      edit: canEditClients
    },
    inventory: {
      view: canViewInventory,
      manage: canManageInventory
    },
    reports: {
      view: canViewReports
    },
    commissions: {
      view: canViewCommissions
    },
    consents: {
      view: canViewConsents,
      create: canCreateConsents
    },
    
    // Función para refrescar permisos
    refresh: loadPermissions
  };
};

export default useUserPermissions;
