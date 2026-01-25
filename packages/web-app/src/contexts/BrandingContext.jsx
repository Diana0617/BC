import React, { createContext, useContext, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { loadBranding } from '@shared/store/slices/businessConfigurationSlice'

// Helper para convertir HEX a RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0'
}

const BrandingContext = createContext({
  branding: null,
  isLoading: false
})

// Hook para usar el contexto de branding
// eslint-disable-next-line react-refresh/only-export-components
export const useBranding = () => {
  const context = useContext(BrandingContext)
  if (!context) {
    throw new Error('useBranding debe usarse dentro de BrandingProvider')
  }
  return context
}

// Componente Provider
export function BrandingProvider({ children }) {
  const dispatch = useDispatch()
  const business = useSelector(state => state.business?.currentBusiness)
  const { branding, loading } = useSelector(state => state.businessConfiguration)

  useEffect(() => {
    // Cargar branding cuando tengamos el business ID
    if (business?.id) {
      dispatch(loadBranding(business.id))
    }
  }, [business?.id, dispatch])

  // Aplicar CSS variables globales para que estén disponibles en toda la app
  useEffect(() => {
    const root = document.documentElement
    const defaultBranding = {
      primaryColor: '#ec4899',   // Fucsia
      secondaryColor: '#8b5cf6', // Purple
      accentColor: '#3b82f6',    // Blue
      fontFamily: 'Nunito'
    }
    
    // Usar branding personalizado o valores por defecto
    const colors = branding || defaultBranding
    
    // Establecer variables CSS para colores
    root.style.setProperty('--color-primary', colors.primaryColor)
    root.style.setProperty('--color-secondary', colors.secondaryColor)
    root.style.setProperty('--color-accent', colors.accentColor)
    root.style.setProperty('--font-family', colors.fontFamily)
    
    // Establecer variables RGB para compatibilidad con Tailwind
    root.style.setProperty('--color-primary-rgb', hexToRgb(colors.primaryColor))
    root.style.setProperty('--color-secondary-rgb', hexToRgb(colors.secondaryColor))
    root.style.setProperty('--color-accent-rgb', hexToRgb(colors.accentColor))
    
    console.log('🎨 Branding aplicado:', colors)
  }, [branding])

  const value = {
    branding: branding || {
      primaryColor: '#ec4899',
      secondaryColor: '#8b5cf6',
      accentColor: '#3b82f6',
      fontFamily: 'Nunito',
      logo: null
    },
    isLoading: loading
  }

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  )
}
