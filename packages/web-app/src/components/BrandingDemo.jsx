import React from 'react'
import { useBranding } from '../contexts/BrandingContext'

/**
 * Componente de demostración del sistema de branding
 * Muestra cómo usar las clases CSS personalizadas y el hook useBranding
 */
const BrandingDemo = () => {
  const { branding, isLoading } = useBranding()

  if (isLoading) {
    return <div className="p-4">Cargando branding...</div>
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="card-branded card-branded-accent p-6">
        <h2 className="text-2xl font-bold mb-4">Sistema de Branding Activo</h2>
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg" style={{ backgroundColor: branding.primaryColor }} />
            <div>
              <p className="font-semibold">Color Primario</p>
              <p className="text-sm text-gray-600">{branding.primaryColor}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg" style={{ backgroundColor: branding.secondaryColor }} />
            <div>
              <p className="font-semibold">Color Secundario</p>
              <p className="text-sm text-gray-600">{branding.secondaryColor}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg" style={{ backgroundColor: branding.accentColor }} />
            <div>
              <p className="font-semibold">Color de Acento</p>
              <p className="text-sm text-gray-600">{branding.accentColor}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="font-semibold mb-2">Fuente:</p>
          <p style={{ fontFamily: branding.fontFamily }}>
            {branding.fontFamily} - El rápido zorro marrón salta sobre el perro perezoso
          </p>
        </div>

        {branding.logo && (
          <div className="mb-6">
            <p className="font-semibold mb-2">Logo:</p>
            <img src={branding.logo} alt="Logo del negocio" className="h-16 object-contain" />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold">Componentes con Clases Branded</h3>
        
        <div className="flex flex-wrap gap-3">
          <button className="btn-branded-primary">
            Botón Primario Branded
          </button>
          
          <button className="btn-branded-secondary">
            Botón Secundario Branded
          </button>
          
          <button className="btn-branded-outline">
            Botón Outline Branded
          </button>
        </div>

        <div className="bg-branded-gradient p-6 rounded-lg text-white">
          <h4 className="font-bold text-lg mb-2">Gradiente Branded</h4>
          <p>Este fondo usa el gradiente personalizado de tu marca</p>
        </div>

        <div className="space-y-2">
          <p className="text-branded-primary text-lg font-semibold">
            Texto con color primario branded
          </p>
          <p className="text-branded-secondary text-lg font-semibold">
            Texto con color secundario branded
          </p>
        </div>

        <div className="flex gap-3">
          <span className="badge-branded-primary">Badge Primario</span>
          <span className="badge-branded-secondary">Badge Secundario</span>
        </div>

        <div className="border-2 border-branded-primary p-4 rounded-lg">
          <p className="font-semibold">Card con borde branded</p>
          <p className="text-sm text-gray-600">El borde usa el color primario de tu marca</p>
        </div>

        <input 
          type="text" 
          className="input-branded" 
          placeholder="Input con foco branded - haz click para ver el efecto"
        />
      </div>

      <div className="card-branded p-6">
        <h3 className="text-xl font-bold mb-4">Variables CSS Globales</h3>
        <p className="text-sm text-gray-600 mb-4">
          Estas variables están disponibles en toda la aplicación:
        </p>
        <ul className="text-sm space-y-1 font-mono bg-gray-50 p-4 rounded">
          <li>var(--color-primary)</li>
          <li>var(--color-secondary)</li>
          <li>var(--color-accent)</li>
          <li>var(--font-family)</li>
          <li>var(--color-primary-rgb)</li>
          <li>var(--color-secondary-rgb)</li>
          <li>var(--color-accent-rgb)</li>
        </ul>
      </div>
    </div>
  )
}

export default BrandingDemo
