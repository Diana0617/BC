import React from 'react'

/**
 * WhatsAppLoadingState Component
 * 
 * Skeleton loader para estados de carga en tabs de WhatsApp.
 * Muestra placeholders animados mientras se cargan los datos.
 * 
 * @param {string} variant - Tipo de skeleton: 'list', 'form', 'card', 'table'
 * @param {number} rows - Número de filas a mostrar (para variant 'list' o 'table')
 */
const WhatsAppLoadingState = ({ variant = 'list', rows = 3 }) => {
  if (variant === 'form') {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Form fields skeleton */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
        
        {/* Button skeleton */}
        <div className="flex justify-end space-x-3">
          <div className="h-10 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className="animate-pulse">
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          
          {/* Content */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
          
          {/* Footer */}
          <div className="flex justify-end space-x-2">
            <div className="h-9 bg-gray-200 rounded w-20"></div>
            <div className="h-9 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div className="animate-pulse">
        {/* Table header */}
        <div className="bg-gray-50 border border-gray-200 rounded-t-lg p-4">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        
        {/* Table rows */}
        <div className="border-x border-b border-gray-200 rounded-b-lg divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination skeleton */}
        <div className="mt-4 flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Default: 'list' variant
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-gray-200 rounded-full flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default WhatsAppLoadingState
