import React from 'react'
import { useBranding } from '../contexts/BrandingContext'
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline'

/**
 * Header con branding personalizado del negocio
 * Muestra el logo y usa los colores corporativos
 */
const BrandedHeader = ({ 
  title, 
  subtitle, 
  actions,
  showLogo = true 
}) => {
  const { branding } = useBranding()

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {showLogo && (
              <>
                {branding?.logo ? (
                  <img 
                    src={branding.logo} 
                    alt="Logo" 
                    className="h-10 w-10 rounded-full object-cover mr-3"
                  />
                ) : (
                  <BuildingStorefrontIcon 
                    className="h-8 w-8 mr-3" 
                    style={{ color: branding?.primaryColor || '#2563eb' }}
                  />
                )}
              </>
            )}
            <div>
              {title && (
                <h1 
                  className="text-xl font-semibold"
                  style={{ color: branding?.primaryColor || '#111827' }}
                >
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center space-x-4">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BrandedHeader
