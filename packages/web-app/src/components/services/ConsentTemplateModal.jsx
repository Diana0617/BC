import React, { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { businessServicesApi } from '@shared/api'

const ConsentTemplateModal = ({ isOpen, onClose, onSave, service, businessId, availableTemplates }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (service?.consentTemplateId) {
      setSelectedTemplateId(service.consentTemplateId)
    }
  }, [service])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      setError(null)
      
      await businessServicesApi.updateService(businessId, service.id, {
        consentTemplateId: selectedTemplateId || null
      })
      
      onSave()
    } catch (err) {
      console.error('Error saving consent template:', err)
      setError(err.message || 'Error al guardar plantilla de consentimiento')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const selectedTemplate = availableTemplates?.find(t => t.id === selectedTemplateId)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Consentimiento Informado
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
            {/* Selector de plantilla */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plantilla de Consentimiento
              </label>
              
              {!availableTemplates || availableTemplates.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    No hay plantillas disponibles. Crea plantillas de consentimiento desde la sección de configuración.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Opción: Sin consentimiento */}
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="template"
                      value=""
                      checked={!selectedTemplateId}
                      onChange={() => setSelectedTemplateId(null)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      Sin consentimiento informado
                    </span>
                  </label>

                  {/* Plantillas disponibles */}
                  {availableTemplates.map((template) => (
                    <label
                      key={template.id}
                      className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="template"
                        value={template.id}
                        checked={selectedTemplateId === template.id}
                        onChange={() => setSelectedTemplateId(template.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 mt-0.5"
                      />
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">{template.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Código: {template.code} | Versión: {template.version}
                        </p>
                        {template.description && (
                          <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Vista previa de la plantilla seleccionada */}
            {selectedTemplate && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Vista previa:
                </p>
                <div 
                  className="text-xs text-gray-700 max-h-48 overflow-y-auto prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: selectedTemplate.content?.substring(0, 500) + '...' }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Los clientes deberán firmar este consentimiento antes de realizar el procedimiento.
                </p>
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

export default ConsentTemplateModal
