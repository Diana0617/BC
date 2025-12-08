import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useBranding } from '../contexts/BrandingContext';

/**
 * Botón con estilos personalizados según el branding del negocio
 * 
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'accent' | 'outline' | 'ghost'} props.variant - Variante del botón
 * @param {'small' | 'medium' | 'large'} props.size - Tamaño del botón
 * @param {boolean} props.disabled - Si el botón está deshabilitado
 * @param {boolean} props.loading - Si el botón está en estado de carga
 * @param {Function} props.onPress - Función al presionar
 * @param {string | React.ReactNode} props.children - Contenido del botón
 */
const BrandedButton = ({ 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onPress,
  children,
  style,
  textStyle
}) => {
  const { colors, getPrimaryColor, getSecondaryColor } = useBranding();

  const getButtonStyles = () => {
    let backgroundColor, borderColor, borderWidth = 0;
    
    switch (variant) {
      case 'primary':
        backgroundColor = colors.primary;
        break;
      case 'secondary':
        backgroundColor = colors.secondary;
        break;
      case 'accent':
        backgroundColor = colors.accent;
        break;
      case 'outline':
        backgroundColor = 'transparent';
        borderColor = colors.primary;
        borderWidth = 2;
        break;
      case 'ghost':
        backgroundColor = getPrimaryColor(0.1);
        break;
      default:
        backgroundColor = '#E5E7EB';
    }

    return {
      backgroundColor,
      borderColor,
      borderWidth,
      opacity: disabled || loading ? 0.5 : 1
    };
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return '#FFFFFF';
      case 'accent':
        return '#1F2937';
      case 'outline':
      case 'ghost':
        return colors.primary;
      default:
        return '#6B7280';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 12,
          paddingVertical: 8,
          fontSize: 14
        };
      case 'large':
        return {
          paddingHorizontal: 24,
          paddingVertical: 16,
          fontSize: 18
        };
      case 'medium':
      default:
        return {
          paddingHorizontal: 16,
          paddingVertical: 12,
          fontSize: 16
        };
    }
  };

  const buttonStyles = getButtonStyles();
  const sizeStyles = getSizeStyles();
  const textColor = getTextColor();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: buttonStyles.backgroundColor,
          borderColor: buttonStyles.borderColor,
          borderWidth: buttonStyles.borderWidth,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
          opacity: buttonStyles.opacity
        },
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        typeof children === 'string' ? (
          <Text 
            style={[
              styles.text,
              {
                color: textColor,
                fontSize: sizeStyles.fontSize
              },
              textStyle
            ]}
          >
            {children}
          </Text>
        ) : (
          children
        )
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: '600',
  },
});

export default BrandedButton;
