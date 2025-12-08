import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadBranding } from '@shared/store/slices/businessConfigurationSlice';

const BrandingContext = createContext({
  branding: null,
  isLoading: false,
  colors: {
    primary: '#FF6B9D',
    secondary: '#4ECDC4',
    accent: '#FFE66D'
  }
});

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding debe usarse dentro de BrandingProvider');
  }
  return context;
};

export const BrandingProvider = ({ children }) => {
  const dispatch = useDispatch();
  
  // Obtener datos del usuario autenticado
  const user = useSelector(state => state?.auth?.user);
  const businessId = useSelector(state => state?.auth?.businessId || state?.auth?.user?.businessId);
  
  // Obtener branding del estado
  const businessConfiguration = useSelector(state => state?.businessConfiguration);
  const branding = businessConfiguration?.branding;
  const loading = businessConfiguration?.loading || false;
  const [hasLoaded, setHasLoaded] = useState(false);

  console.log('📱 BrandingProvider - User:', user);
  console.log('📱 BrandingProvider - BusinessId:', businessId);
  console.log('📱 BrandingProvider - Branding:', branding);

  useEffect(() => {
    // Cargar branding cuando tengamos el business ID
    if (businessId && !branding && !hasLoaded && !loading) {
      console.log('📱 Loading branding for mobile app, businessId:', businessId);
      try {
        dispatch(loadBranding(businessId));
        setHasLoaded(true);
      } catch (error) {
        console.error('📱 Error loading branding:', error);
      }
    }
  }, [businessId, branding, hasLoaded, loading, dispatch]);

  // Valores por defecto y valores del branding
  const colors = {
    primary: branding?.primaryColor || '#FF6B9D',
    secondary: branding?.secondaryColor || '#4ECDC4',
    accent: branding?.accentColor || '#FFE66D',
    text: '#1F2937',
    textSecondary: '#6B7280',
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B'
  };

  const value = {
    branding: branding || {
      primaryColor: colors.primary,
      secondaryColor: colors.secondary,
      accentColor: colors.accent,
      fontFamily: 'Poppins',
      logo: null
    },
    isLoading: loading,
    colors,
    // Helpers para estilos
    getPrimaryColor: (opacity = 1) => {
      if (opacity === 1) return colors.primary;
      // Convertir hex a rgba
      const hex = colors.primary.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
    getSecondaryColor: (opacity = 1) => {
      if (opacity === 1) return colors.secondary;
      const hex = colors.secondary.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
};
