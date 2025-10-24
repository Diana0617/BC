import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePermissions } from '../../hooks/usePermissions';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente de protección por permisos para React Native
 * Renderiza children solo si tiene el permiso requerido
 * 
 * @param {Object} props
 * @param {string|string[]} props.permission - Permiso(s) requerido(s)
 * @param {boolean} props.requireAll - Si requiere TODOS los permisos (default: false = OR)
 * @param {React.ReactNode} props.children - Contenido a proteger
 * @param {React.ReactNode} props.fallback - Componente a mostrar si no tiene permiso
 * @param {boolean} props.showMessage - Mostrar mensaje de "sin permisos" (default: false)
 * @param {string} props.message - Mensaje personalizado
 */
export const PermissionGuard = ({ 
  permission,
  requireAll = false,
  children,
  fallback = null,
  showMessage = false,
  message = 'No tienes permiso para acceder a esta funcionalidad'
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  
  // Determinar si tiene acceso
  let hasAccess = false;
  
  if (Array.isArray(permission)) {
    hasAccess = requireAll 
      ? hasAllPermissions(permission) 
      : hasAnyPermission(permission);
  } else {
    hasAccess = hasPermission(permission);
  }
  
  // Si tiene acceso, renderizar children
  if (hasAccess) {
    return <>{children}</>;
  }
  
  // Si no tiene acceso y hay fallback, mostrarlo
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Si showMessage, mostrar mensaje de error
  if (showMessage) {
    return (
      <View style={styles.noPermissionContainer}>
        <Ionicons name="lock-closed" size={48} color="#ef4444" />
        <Text style={styles.noPermissionTitle}>Sin Permisos</Text>
        <Text style={styles.noPermissionText}>{message}</Text>
      </View>
    );
  }
  
  // Por defecto, no renderizar nada
  return null;
};

const styles = StyleSheet.create({
  noPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    marginVertical: 16
  },
  noPermissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
    marginTop: 16,
    marginBottom: 8
  },
  noPermissionText: {
    fontSize: 14,
    color: '#7f1d1d',
    textAlign: 'center',
    paddingHorizontal: 16
  }
});
