import React from 'react'
import { useBranding } from '../contexts/BrandingContext'

/**
 * Botón con estilos personalizados según el branding del negocio
 * 
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'accent' | 'outline'} props.variant - Variante del botón
 * @param {string} props.className - Clases CSS adicionales
 * @param {boolean} props.disabled - Si el botón está deshabilitado
 * @param {React.ReactNode} props.children - Contenido del botón
 */
const BrandedButton = ({ 
  variant = 'primary', 
  className = '', 
  disabled = false,
  onClick,
  type = 'button',
  children 
}) => {
  const { branding } = useBranding()

  const getButtonStyles = () => {
    const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
    
    switch (variant) {
      case 'primary':
        return {
          className: `${baseStyles} text-white hover:opacity-90 ${className}`,
          style: {
            backgroundColor: branding?.primaryColor || '#2563eb'
          }
        }
      case 'secondary':
        return {
          className: `${baseStyles} text-white hover:opacity-90 ${className}`,
          style: {
            backgroundColor: branding?.secondaryColor || '#06b6d4'
          }
        }
      case 'accent':
        return {
          className: `${baseStyles} text-gray-900 hover:opacity-90 ${className}`,
          style: {
            backgroundColor: branding?.accentColor || '#fbbf24'
          }
        }
      case 'outline':
        return {
          className: `${baseStyles} bg-white hover:bg-opacity-10 ${className}`,
          style: {
            borderWidth: '2px',
            borderColor: branding?.primaryColor || '#2563eb',
            color: branding?.primaryColor || '#2563eb'
          }
        }
      default:
        return {
          className: `${baseStyles} bg-gray-200 text-gray-700 hover:bg-gray-300 ${className}`,
          style: {}
        }
    }
  }

  const buttonStyles = getButtonStyles()

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonStyles.className}
      style={buttonStyles.style}
    >
      {children}
    </button>
  )
}

export default BrandedButton
