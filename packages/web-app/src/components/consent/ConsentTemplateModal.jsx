import React, { useState, useEffect } from 'react'
import { XMarkIcon, DocumentTextIcon, EyeIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { consentApi } from '@shared/api'

const ConsentTemplateModal = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  businessId, 
  currentTemplateId = null 
}) => {
  const [templates, setTemplates] = useState([])
  const [selectedTemplateId, setSelectedTemplateId] = useState(currentTemplateId)
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadTemplates = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await consentApi.getTemplates(businessId)
      setTemplates(response.data || response || [])
    } catch (err) {
      console.error('Error loading templates:', err)
      setError('Error al cargar plantillas de consentimiento')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && businessId) {
      loadTemplates()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, businessId])

  useEffect(() => {
    setSelectedTemplateId(currentTemplateId)
  }, [currentTemplateId])

  const handlePreview = async (template) => {
    setPreviewTemplate(template)
  }

  const handleSelect = () => {
    onSelect(selectedTemplateId)
    onClose()
  }

  const handleRemove = () => {
    onSelect(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                Asignar Plantilla de Consentimiento
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Selecciona la plantilla que el cliente deberá firmar para este procedimiento
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadTemplates}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                title="Recargar plantillas"
              >
                <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Loading */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Template List */}
              {!previewTemplate ? (
                <div>
                  {templates.length === 0 ? (
                    <div className="text-center py-12">
                      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No hay plantillas disponibles
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 mb-4">
                        Necesitas crear al menos una plantilla de consentimiento
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          window.open('/business/consent-templates', '_blank');
                        }}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <DocumentTextIcon className="h-5 w-5" />
                        Crear Primera Plantilla
                      </button>
                      <p className="mt-3 text-xs text-gray-500">
                        Se abrirá en una nueva pestaña
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 mb-6">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            selectedTemplateId === template.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                          onClick={() => setSelectedTemplateId(template.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="template"
                                  checked={selectedTemplateId === template.id}
                                  onChange={() => setSelectedTemplateId(template.id)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <h3 className="font-medium text-gray-900">
                                  {template.name}
                                </h3>
                                {template.isDefault && (
                                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                    Por defecto
                                  </span>
                                )}
                              </div>
                              {template.description && (
                                <p className="text-sm text-gray-600 mt-1 ml-6">
                                  {template.description}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePreview(template)
                              }}
                              className="ml-4 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              <EyeIcon className="h-4 w-4" />
                              Vista previa
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleSelect}
                      disabled={!selectedTemplateId}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Asignar Plantilla
                    </button>
                    
                    {currentTemplateId && (
                      <button
                        type="button"
                        onClick={handleRemove}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                      >
                        Quitar Plantilla
                      </button>
                    )}
                    
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                /* Preview Mode */
                <div>
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(null)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      ← Volver a la lista
                    </button>
                  </div>

                  <div className="border rounded-lg p-6 bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {previewTemplate.name}
                    </h3>
                    {previewTemplate.description && (
                      <p className="text-sm text-gray-600 mb-4">
                        {previewTemplate.description}
                      </p>
                    )}
                    
                    <div className="bg-white p-6 rounded border">
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: previewTemplate.content
                            ?.replace(/\{\{cliente\.nombre\}\}/g, '<strong>[NOMBRE DEL CLIENTE]</strong>')
                            ?.replace(/\{\{cliente\.documento\}\}/g, '<strong>[DOCUMENTO]</strong>')
                            ?.replace(/\{\{negocio\.nombre\}\}/g, '<strong>[NOMBRE DEL NEGOCIO]</strong>')
                            ?.replace(/\{\{servicio\.nombre\}\}/g, '<strong>[NOMBRE DEL PROCEDIMIENTO]</strong>')
                            ?.replace(/\{\{fecha\}\}/g, '<strong>[FECHA]</strong>')
                        }}
                      />
                    </div>

                    <div className="mt-6 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTemplateId(previewTemplate.id)
                          setPreviewTemplate(null)
                        }}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Seleccionar esta plantilla
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConsentTemplateModal
