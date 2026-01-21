import React from 'react'
import { DevicePhoneMobileIcon } from '@heroicons/react/24/outline'

/**
 * WhatsAppTemplatePreview Component
 * 
 * Vista previa en tiempo real de una plantilla de WhatsApp.
 * Simula la apariencia del mensaje en un dispositivo móvil.
 * 
 * @param {Object} template - Template object con components
 * @param {Array} variables - Valores de ejemplo para variables {{1}}, {{2}}, etc.
 * @param {string} businessName - Nombre del negocio actual
 */
const WhatsAppTemplatePreview = ({ template, variables = [], businessName }) => {
  if (!template || !template.components) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center py-12">
          <DevicePhoneMobileIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600">
            La vista previa aparecerá aquí mientras editas
          </p>
        </div>
      </div>
    )
  }

  const header = template.components.find(c => c.type === 'HEADER')
  const body = template.components.find(c => c.type === 'BODY')
  const footer = template.components.find(c => c.type === 'FOOTER')
  const buttonsComponent = template.components.find(c => c.type === 'BUTTONS')

  // Replace variables in text with provided values
  const replaceVariables = (text) => {
    if (!text) return ''
    let result = text
    
    // Default example values for appointment reminder
    const defaultVars = [
      'Juan Pérez',           // {{1}} - Nombre del cliente
      'Corte de Cabello',     // {{2}} - Servicio
      'Viernes 24 de Enero',  // {{3}} - Fecha
      '15:30',                // {{4}} - Hora
      'Laura González',       // {{5}} - Profesional
      businessName || 'Beauty Control' // {{6}} - Nombre del negocio
    ]
    
    const varsToUse = variables.length > 0 ? variables : defaultVars
    
    varsToUse.forEach((value, index) => {
      result = result.replace(new RegExp(`\\{\\{${index + 1}\\}\\}`, 'g'), value)
    })
    
    return result
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Preview Header */}
      <div className="bg-green-50 border-b border-green-200 px-6 py-3">
        <div className="flex items-center space-x-2">
          <DevicePhoneMobileIcon className="h-5 w-5 text-green-600" />
          <h4 className="text-sm font-semibold text-gray-900">
            Vista Previa
          </h4>
        </div>
      </div>

      {/* Mobile Phone Mockup */}
      <div className="p-6 bg-gray-100">
        <div className="max-w-sm mx-auto">
          {/* Phone Container */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-800">
            {/* Phone Header (WhatsApp style) */}
            <div className="bg-green-600 text-white px-4 py-3 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm font-bold">
                  {(businessName || 'BC').substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{businessName || 'Beauty Control'}</p>
                <p className="text-xs text-green-100">WhatsApp Business</p>
              </div>
            </div>

            {/* Chat Background */}
            <div className="bg-[#ECE5DD] p-4 min-h-[400px] max-h-[500px] overflow-y-auto">
              {/* Message Bubble */}
              <div className="mb-4">
                <div className="bg-white rounded-lg shadow-sm max-w-[85%] overflow-hidden">
                  {/* Header Component */}
                  {header && (
                    <div className="border-b border-gray-200">
                      {header.format === 'TEXT' && header.text && (
                        <div className="px-4 py-3 bg-gray-50">
                          <p className="font-bold text-gray-900">
                            {replaceVariables(header.text)}
                          </p>
                        </div>
                      )}
                      {header.format === 'IMAGE' && (
                        <div className="bg-gray-200 h-40 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">🖼️ Imagen</span>
                        </div>
                      )}
                      {header.format === 'VIDEO' && (
                        <div className="bg-gray-200 h-40 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">🎥 Video</span>
                        </div>
                      )}
                      {header.format === 'DOCUMENT' && (
                        <div className="bg-gray-200 h-20 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">📄 Documento</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Body Component */}
                  {body && body.text && (
                    <div className="px-4 py-3">
                      <p className="text-gray-900 text-sm whitespace-pre-wrap">
                        {replaceVariables(body.text)}
                      </p>
                    </div>
                  )}

                  {/* Footer Component */}
                  {footer && footer.text && (
                    <div className="px-4 py-2 border-t border-gray-100">
                      <p className="text-gray-500 text-xs">
                        {replaceVariables(footer.text)}
                      </p>
                    </div>
                  )}

                  {/* Buttons Component */}
                  {buttonsComponent && buttonsComponent.buttons && buttonsComponent.buttons.length > 0 && (
                    <div className="border-t border-gray-200">
                      {buttonsComponent.buttons.map((button, index) => (
                        <button
                          key={index}
                          className="w-full px-4 py-3 text-sm font-medium text-blue-600 hover:bg-gray-50 border-b border-gray-200 last:border-b-0 text-center"
                        >
                          {button.type === 'QUICK_REPLY' && '↩️ '}
                          {button.type === 'URL' && '🔗 '}
                          {button.type === 'PHONE_NUMBER' && '📞 '}
                          {button.text || 'Botón sin texto'}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="px-4 py-1 text-right">
                    <span className="text-xs text-gray-400">
                      {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Template Info */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Nota:</strong> Esta es una vista previa aproximada. La apariencia final puede variar en WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WhatsAppTemplatePreview
