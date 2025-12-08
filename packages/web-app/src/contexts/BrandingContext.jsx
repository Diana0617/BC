import React, { createContext, useContext, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { loadBranding } from '@shared/store/slices/businessConfigurationSlice'

const BrandingContext = createContext({
  branding: null,
  isLoading: false
})

export const useBranding = () => {
  const context = useContext(BrandingContext)
  if (!context) {
    throw new Error('useBranding debe usarse dentro de BrandingProvider')
  }
  return context
}

export const BrandingProvider = ({ children }) => {
  const dispatch = useDispatch()
  const business = useSelector(state => state.business?.currentBusiness)
  const { branding, loading } = useSelector(state => state.businessConfiguration)

  useEffect(() => {
    // Cargar branding cuando tengamos el business ID
    if (business?.id && !branding) {
      dispatch(loadBranding(business.id))
    }
  }, [business?.id, branding, dispatch])

  // Aplicar CSS variables globales para que estén disponibles en toda la app
  useEffect(() => {
    if (branding) {
      const root = document.documentElement
      root.style.setProperty('--color-primary', branding.primaryColor || '#FF6B9D')
      root.style.setProperty('--color-secondary', branding.secondaryColor || '#4ECDC4')
      root.style.setProperty('--color-accent', branding.accentColor || '#FFE66D')
      root.style.setProperty('--font-family', branding.fontFamily || 'Poppins')
    }
  }, [branding])

  const value = {
    branding: branding || {
      primaryColor: '#FF6B9D',
      secondaryColor: '#4ECDC4',
      accentColor: '#FFE66D',
      fontFamily: 'Poppins',
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
