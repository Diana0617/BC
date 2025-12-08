import React, { useState } from 'react'
import { Filter, X, ChevronDown } from 'lucide-react'

const FilterPanel = ({ 
  filters, 
  uniqueCategories, 
  uniqueBusinessTypes, 
  onFilterChange, 
  onClearFilters, 
  hasFilters 
}) => {
  const [isOpen, setIsOpen] = useState(false)

  // ================================
  // HANDLERS
  // ================================
  
  const handleCategoryChange = (category) => {
    onFilterChange('category', filters.category === category ? '' : category)
  }

  const handleBusinessTypeChange = (businessType) => {
    onFilterChange('businessType', filters.businessType === businessType ? '' : businessType)
  }

  const handleActiveChange = (isActive) => {
    onFilterChange('isActive', filters.isActive === isActive ? null : isActive)
  }

  const handleClearAll = () => {
    onClearFilters()
    setIsOpen(false)
  }

  // ================================
  // UTILS
  // ================================
  
  const getCategoryLabel = (category) => {
    const labels = {
      'PAYMENT_POLICY': 'Política de Pago',
      'CANCELLATION_POLICY': 'Política de Cancelación',
      'BOOKING_POLICY': 'Política de Reservas',
      'SERVICE_POLICY': 'Política de Servicios',
      'SCHEDULING_POLICY': 'Política de Horarios',
      'CUSTOMER_POLICY': 'Política de Clientes',
      'PROMOTIONAL_POLICY': 'Política Promocional',
      'OPERATIONAL_POLICY': 'Política Operacional'
    }
    return labels[category] || category
  }

  const getBusinessTypeLabel = (type) => {
    const labels = {
      'BEAUTY_SALON': 'Salón de Belleza',
      'BARBERSHOP': 'Barbería',
      'SPA': 'Spa',
      'NAIL_SALON': 'Salón de Uñas',
      'MEDICAL_SPA': 'Spa Médico',
      'FITNESS_CENTER': 'Centro de Fitness',
      'MASSAGE_CENTER': 'Centro de Masajes',
      'AESTHETICS_CENTER': 'Centro de Estética'
    }
    return labels[type] || type
  }

  // ================================
  // RENDER
  // ================================
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
          hasFilters
            ? 'border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
        }`}
      >
        <Filter className="h-4 w-4 mr-2" />
        Filtros
        {hasFilters && (
          <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-indigo-600 rounded-full">
            {Object.values(filters).filter(v => v !== '' && v !== null).length}
          </span>
        )}
        <ChevronDown className="ml-2 h-4 w-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Filter Panel */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Categoría
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {uniqueCategories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.category === category}
                          onChange={() => handleCategoryChange(category)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          {getCategoryLabel(category)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Business Type Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Tipo de Negocio
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {uniqueBusinessTypes.map((businessType) => (
                      <label key={businessType} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.businessType === businessType}
                          onChange={() => handleBusinessTypeChange(businessType)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          {getBusinessTypeLabel(businessType)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Estado
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.isActive === true}
                        onChange={() => handleActiveChange(true)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">Activas</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.isActive === false}
                        onChange={() => handleActiveChange(false)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">Inactivas</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {hasFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleClearAll}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Limpiar todos los filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default FilterPanel