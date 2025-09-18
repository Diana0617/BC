import React from 'react'
import { Loader2 } from 'lucide-react'

const LoadingSpinner = ({ 
  size = 'md', 
  text = '', 
  className = '',
  color = 'indigo'
}) => {
  // ================================
  // SIZE VARIANTS
  // ================================
  
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  // ================================
  // COLOR VARIANTS
  // ================================
  
  const colorClasses = {
    indigo: 'text-indigo-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600',
    white: 'text-white'
  }

  // ================================
  // RENDER
  // ================================
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 
          className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} 
        />
        {text && (
          <p className={`${textSizeClasses[size]} ${colorClasses[color]} font-medium`}>
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

// ================================
// PRESET COMPONENTS
// ================================

export const InlineSpinner = ({ className = '' }) => (
  <Loader2 className={`animate-spin h-4 w-4 text-current ${className}`} />
)

export const ButtonSpinner = ({ className = '' }) => (
  <Loader2 className={`animate-spin h-4 w-4 mr-2 text-current ${className}`} />
)

export const PageSpinner = ({ text = 'Cargando...' }) => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" text={text} />
  </div>
)

export const SectionSpinner = ({ text = 'Cargando...' }) => (
  <div className="flex items-center justify-center py-12">
    <LoadingSpinner size="md" text={text} />
  </div>
)

export const CardSpinner = ({ text = '' }) => (
  <div className="flex items-center justify-center py-8">
    <LoadingSpinner size="sm" text={text} />
  </div>
)

export default LoadingSpinner