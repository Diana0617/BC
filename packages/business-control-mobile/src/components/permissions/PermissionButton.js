import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { usePermissions } from '../../hooks/usePermissions';
import { Ionicons } from '@expo/vector-icons';

/**
 * Botón con validación de permisos para React Native
 * Se oculta o deshabilita si no tiene el permiso
 * 
 * @param {Object} props
 * @param {string|string[]} props.permission - Permiso(s) requerido(s)
 * @param {boolean} props.requireAll - Si requiere TODOS los permisos
 * @param {Function} props.onPress - Manejador de click
 * @param {React.ReactNode} props.children - Texto del botón
 * @param {Object} props.style - Estilos personalizados del botón
 * @param {Object} props.textStyle - Estilos personalizados del texto
 * @param {boolean} props.disabled - Estado deshabilitado adicional
 * @param {boolean} props.loading - Estado de carga
 * @param {boolean} props.showDisabled - Mostrar deshabilitado en vez de ocultar
 * @param {string} props.icon - Nombre del ícono de Ionicons
 * @param {number} props.iconSize - Tamaño del ícono (default: 20)
 * @param {string} props.iconColor - Color del ícono (default: '#fff')
 * @param {string} props.variant - Variante del botón: 'primary', 'secondary', 'danger', 'success'
 */
export const PermissionButton = ({
  permission,
  requireAll = false,
  onPress,
  children,
  style,
  textStyle,
  disabled = false,
  loading = false,
  showDisabled = false,
  icon,
  iconSize = 20,
  iconColor,
  variant = 'primary',
  ...props
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
  
  // Si no tiene acceso y showDisabled es false, ocultar
  if (!hasAccess && !showDisabled) {
    return null;
  }
  
  // Determinar si está deshabilitado
  const isDisabled = disabled || loading || !hasAccess;
  
  // Obtener estilos según variante
  const variantStyles = getVariantStyles(variant);
  const finalIconColor = iconColor || variantStyles.iconColor;
  
  return (
    <TouchableOpacity
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        variantStyles.button,
        isDisabled && styles.buttonDisabled,
        style
      ]}
      activeOpacity={0.7}
      {...props}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={isDisabled ? '#9ca3af' : finalIconColor} 
          />
        ) : icon ? (
          <Ionicons 
            name={icon} 
            size={iconSize} 
            color={isDisabled ? '#9ca3af' : finalIconColor} 
            style={styles.icon}
          />
        ) : null}
        
        <Text style={[
          styles.text,
          variantStyles.text,
          isDisabled && styles.textDisabled,
          textStyle
        ]}>
          {children}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Obtener estilos según la variante del botón
 */
const getVariantStyles = (variant) => {
  switch (variant) {
    case 'primary':
      return {
        button: { backgroundColor: '#3b82f6' },
        text: { color: '#fff' },
        iconColor: '#fff'
      };
    case 'secondary':
      return {
        button: { backgroundColor: '#6b7280', borderWidth: 1, borderColor: '#9ca3af' },
        text: { color: '#fff' },
        iconColor: '#fff'
      };
    case 'danger':
      return {
        button: { backgroundColor: '#ef4444' },
        text: { color: '#fff' },
        iconColor: '#fff'
      };
    case 'success':
      return {
        button: { backgroundColor: '#10b981' },
        text: { color: '#fff' },
        iconColor: '#fff'
      };
    case 'outline':
      return {
        button: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#3b82f6' },
        text: { color: '#3b82f6' },
        iconColor: '#3b82f6'
      };
    default:
      return {
        button: { backgroundColor: '#3b82f6' },
        text: { color: '#fff' },
        iconColor: '#fff'
      };
  }
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48
  },
  buttonDisabled: {
    backgroundColor: '#e5e7eb',
    opacity: 0.6
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    marginRight: 8
  },
  text: {
    fontSize: 16,
    fontWeight: '600'
  },
  textDisabled: {
    color: '#9ca3af'
  }
});
