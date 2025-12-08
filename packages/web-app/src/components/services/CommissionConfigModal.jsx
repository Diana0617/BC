import React, { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { commissionApi } from '@shared/api'

const CommissionConfigModal = ({ isOpen, onClose, onSave, service, businessId, globalConfig }) => {
  const [useCustom, setUseCustom] = useState(false)
  const [formData, setFormData] = useState({
    specialistPercentage: 50,
    businessPercentage: 50
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (service?.ServiceCommission) {
      setUseCustom(true)
      setFormData({
        specialistPercentage: service.ServiceCommission.specialistPercentage,
        businessPercentage: service.ServiceCommission.businessPercentage
      })
    } else if (globalConfig?.generalPercentage) {
      setFormData({
        specialistPercentage: globalConfig.generalPercentage,
        businessPercentage: 100 - globalConfig.generalPercentage
      })
    }
  }, [service, globalConfig])

  const handlePercentageChange = (field, value) => {
    const numValue = parseInt(value) || 0
    const otherField = field === 'specialistPercentage' ? 'businessPercentage' : 'specialistPercentage'
    
    setFormData({
      [field]: numValue,
      [otherField]: 100 - numValue
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.specialistPercentage + formData.businessPercentage !== 100) {
      setError('Los porcentajes deben sumar 100%')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      if (useCustom) {
        await commissionApi.upsertServiceCommission(businessId, service.id, {
          specialistPercentage: formData.specialistPercentage,
          businessPercentage: formData.businessPercentage,
          calculationType: 'PERCENTAGE',
          isActive: true
        })
      } else {
        // Eliminar configuración personalizada
        try {
          await commissionApi.deleteServiceCommission(businessId, service.id)
        } catch {
          // Si no existe, ignorar error
        }
      }
      
      onSave()
    } catch (err) {
      console.error('Error saving commission:', err)
      setError(err.message || 'Error al guardar comisión')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Configurar Comisión
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Procedimiento: <strong>{service?.name}</strong>
          </p>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Toggle usar configuración general o personalizada */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustom}
                  onChange={(e) => setUseCustom(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-900">
                  Configuración personalizada para este procedimiento
                </span>
              </label>
              
              {!useCustom && globalConfig && (
                <p className="mt-2 text-xs text-gray-500">
                  Usando configuración general: {globalConfig.generalPercentage}% especialista / {100 - globalConfig.generalPercentage}% negocio
                </p>
              )}
            </div>

            {/* Configuración de porcentajes */}
            {useCustom && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Porcentaje Especialista
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.specialistPercentage}
                      onChange={(e) => handlePercentageChange('specialistPercentage', e.target.value)}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      value={formData.specialistPercentage}
                      onChange={(e) => handlePercentageChange('specialistPercentage', e.target.value)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                      min="0"
                      max="100"
                    />
                    <span className="text-sm font-medium">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Porcentaje Negocio
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.businessPercentage}
                      onChange={(e) => handlePercentageChange('businessPercentage', e.target.value)}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      value={formData.businessPercentage}
                      onChange={(e) => handlePercentageChange('businessPercentage', e.target.value)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                      min="0"
                      max="100"
                    />
                    <span className="text-sm font-medium">%</span>
                  </div>
                </div>

                {/* Preview del cálculo */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">Vista previa (precio: ${service?.price?.toLocaleString()})</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Especialista:</p>
                      <p className="text-lg font-bold text-green-600">
                        ${((service?.price || 0) * formData.specialistPercentage / 100).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Negocio:</p>
                      <p className="text-lg font-bold text-blue-600">
                        ${((service?.price || 0) * formData.businessPercentage / 100).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Guardando...' : 'Guardar Configuración'}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CommissionConfigModal
