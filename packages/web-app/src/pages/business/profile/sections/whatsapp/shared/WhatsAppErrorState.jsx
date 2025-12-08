import React from 'react'
import { 
  ExclamationTriangleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline'

/**
 * WhatsAppErrorState Component
 * 
 * Componente para mostrar estados de error con opción de reintentar.
 * Incluye mensaje descriptivo y botón de retry.
 * 
 * @param {string|Error} error - Mensaje de error o objeto Error
 * @param {Function} onRetry - Callback para reintentar la operación
 * @param {string} title - Título del error (opcional)
 * @param {boolean} showRetry - Mostrar botón de reintentar (default: true)
 */
const WhatsAppErrorState = ({ 
  error, 
  onRetry, 
  title = 'Error al cargar datos',
  showRetry = true 
}) => {
  // Extraer mensaje del error
  const errorMessage = typeof error === 'string' 
    ? error 
    : error?.message || error?.response?.data?.message || 'Ha ocurrido un error inesperado'

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
        
        {/* Error message */}
        <p className="text-sm text-gray-600 mb-6">
          {errorMessage}
        </p>
        
        {/* Retry button */}
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Reintentar
          </button>
        )}
      </div>
    </div>
  )
}

export default WhatsAppErrorState
