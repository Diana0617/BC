/**
 * Hook para gestión centralizada de permisos de usuario
 * Funciona tanto en web como mobile
 */

import { useMemo } from 'react'
import { useSelector } from 'react-redux'

export const useUserPermissions = () => {
  const user = useSelector(state => state.auth?.user)
  const userPermissions = useSelector(state => state.auth?.permissions || [])
  
  // Extraer permisos del usuario
  const permissions = useMemo(() => {
    if (!user) return []
    
    // Si es OWNER o BUSINESS, tiene todos los permisos
    if (user.role === 'OWNER' || user.role === 'BUSINESS') {
      return ['*'] // Wildcard = todos los permisos
    }
    
    // Para otros roles, devolver permisos específicos
    return userPermissions || []
  }, [user, userPermissions])
  
  // Función para verificar un permiso específico
  const hasPermission = useMemo(() => {
    return (permissionKey) => {
      if (!permissionKey) return false
      if (permissions.includes('*')) return true
      return permissions.includes(permissionKey)
    }
  }, [permissions])
  
  // Función para verificar múltiples permisos (AND)
  const hasAllPermissions = useMemo(() => {
    return (permissionKeys = []) => {
      if (permissions.includes('*')) return true
      return permissionKeys.every(key => permissions.includes(key))
    }
  }, [permissions])
  
  // Función para verificar al menos uno (OR)
  const hasAnyPermission = useMemo(() => {
    return (permissionKeys = []) => {
      if (permissions.includes('*')) return true
      return permissionKeys.some(key => permissions.includes(key))
    }
  }, [permissions])
  
  // Verificar si puede ver citas
  const canViewAppointments = useMemo(() => {
    return hasAnyPermission([
      'appointments.view_all',
      'appointments.view_own'
    ])
  }, [hasAnyPermission])
  
  // Verificar si puede crear citas
  const canCreateAppointments = useMemo(() => {
    return hasPermission('appointments.create')
  }, [hasPermission])
  
  // Verificar si puede editar citas
  const canEditAppointments = useMemo(() => {
    return hasAnyPermission([
      'appointments.edit',
      'appointments.edit_own'
    ])
  }, [hasAnyPermission])
  
  // Verificar si puede cancelar citas
  const canCancelAppointments = useMemo(() => {
    return hasAnyPermission([
      'appointments.cancel',
      'appointments.cancel_own'
    ])
  }, [hasAnyPermission])
  
  // Verificar si puede completar citas
  const canCompleteAppointments = useMemo(() => {
    return hasPermission('appointments.complete')
  }, [hasPermission])
  
  // Verificar si puede ver todas las citas o solo las propias
  const canViewAllAppointments = useMemo(() => {
    return hasPermission('appointments.view_all')
  }, [hasPermission])
  
  const canViewOwnAppointments = useMemo(() => {
    return hasPermission('appointments.view_own')
  }, [hasPermission])
  
  // Determinar el alcance de visualización
  const appointmentViewScope = useMemo(() => {
    if (canViewAllAppointments) return 'all'
    if (canViewOwnAppointments) return 'own'
    return 'none'
  }, [canViewAllAppointments, canViewOwnAppointments])
  
  return {
    user,
    permissions,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    
    // Permisos específicos de citas
    canViewAppointments,
    canCreateAppointments,
    canEditAppointments,
    canCancelAppointments,
    canCompleteAppointments,
    canViewAllAppointments,
    canViewOwnAppointments,
    appointmentViewScope
  }
}

export default useUserPermissions
