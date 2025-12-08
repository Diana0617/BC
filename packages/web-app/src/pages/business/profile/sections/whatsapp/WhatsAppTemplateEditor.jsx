import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  createTemplate,
  updateTemplate,
  submitTemplate,
  clearSelectedTemplate,
  selectSelectedTemplate,
  selectIsCreating,
  selectIsUpdating,
  selectIsSubmitting,
  selectCreateError,
  selectUpdateError,
  selectSubmitError
} from '@shared/store/slices/whatsappTemplatesSlice'
import {
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

/**
 * WhatsAppTemplateEditor Component
 * 
 * Form builder para crear/editar plantillas de WhatsApp.
 * Soporta todos los componentes de WhatsApp:
 * - HEADER (text, image, video, document)
 * - BODY (text con variables)
 * - FOOTER (text)
 * - BUTTONS (quick reply, call to action, URL)
 */
const WhatsAppTemplateEditor = ({ onClose, onPreview }) => {
  const dispatch = useDispatch()
  
  const selectedTemplate = useSelector(selectSelectedTemplate)
  const isCreating = useSelector(selectIsCreating)
  const isUpdating = useSelector(selectIsUpdating)
  const isSubmitting = useSelector(selectIsSubmitting)
  const createError = useSelector(selectCreateError)
  const updateError = useSelector(selectUpdateError)
  const submitError = useSelector(selectSubmitError)

  const isEditMode = !!selectedTemplate

  const [formData, setFormData] = useState({
    name: '',
    language: 'es',
    category: 'UTILITY',
    components: []
  })

  const [headerType, setHeaderType] = useState('TEXT')
  const [headerText, setHeaderText] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [footerText, setFooterText] = useState('')
  const [buttons, setButtons] = useState([])

  // Load template data if editing
  useEffect(() => {
    if (selectedTemplate) {
      setFormData({
        name: selectedTemplate.name,
        language: selectedTemplate.language,
        category: selectedTemplate.category,
        components: selectedTemplate.components || []
      })

      // Parse components
      const header = selectedTemplate.components?.find(c => c.type === 'HEADER')
      const body = selectedTemplate.components?.find(c => c.type === 'BODY')
      const footer = selectedTemplate.components?.find(c => c.type === 'FOOTER')
      const buttonsComponent = selectedTemplate.components?.find(c => c.type === 'BUTTONS')

      if (header) {
        setHeaderType(header.format || 'TEXT')
        setHeaderText(header.text || '')
      }
      if (body) {
        setBodyText(body.text || '')
      }
      if (footer) {
        setFooterText(footer.text || '')
      }
      if (buttonsComponent) {
        setButtons(buttonsComponent.buttons || [])
      }
    }
  }, [selectedTemplate])

  // Update preview when form changes
  useEffect(() => {
    const components = buildComponents()
    onPreview && onPreview({ ...formData, components })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, headerType, headerText, bodyText, footerText, buttons])

  const buildComponents = () => {
    const components = []

    // Header component
    if (headerText || headerType !== 'TEXT') {
      components.push({
        type: 'HEADER',
        format: headerType,
        text: headerType === 'TEXT' ? headerText : undefined
      })
    }

    // Body component (required)
    if (bodyText) {
      components.push({
        type: 'BODY',
        text: bodyText
      })
    }

    // Footer component
    if (footerText) {
      components.push({
        type: 'FOOTER',
        text: footerText
      })
    }

    // Buttons component
    if (buttons.length > 0) {
      components.push({
        type: 'BUTTONS',
        buttons: buttons
      })
    }

    return components
  }

  const handleAddButton = (type) => {
    const newButton = {
      type: type,
      text: ''
    }

    if (type === 'PHONE_NUMBER') {
      newButton.phone_number = ''
    } else if (type === 'URL') {
      newButton.url = ''
    }

    setButtons([...buttons, newButton])
  }

  const handleUpdateButton = (index, field, value) => {
    const updatedButtons = [...buttons]
    updatedButtons[index][field] = value
    setButtons(updatedButtons)
  }

  const handleRemoveButton = (index) => {
    setButtons(buttons.filter((_, i) => i !== index))
  }

  const handleSaveDraft = async () => {
    // Validations
    if (!formData.name || !bodyText) {
      toast.error('El nombre y el cuerpo del mensaje son requeridos')
      return
    }

    const templateData = {
      ...formData,
      components: buildComponents()
    }

    const result = isEditMode
      ? await dispatch(updateTemplate({ templateId: selectedTemplate.id, updateData: templateData }))
      : await dispatch(createTemplate(templateData))

    if (result.type.endsWith('/fulfilled')) {
      toast.success(isEditMode ? '✅ Plantilla actualizada' : '✅ Plantilla creada como borrador')
      handleClose()
    } else {
      toast.error('❌ Error al guardar la plantilla')
    }
  }

  const handleSubmitToMeta = async () => {
    // Save first if not in edit mode
    if (!isEditMode) {
      await handleSaveDraft()
    }

    if (selectedTemplate?.id) {
      const result = await dispatch(submitTemplate(selectedTemplate.id))
      
      if (result.type.endsWith('/fulfilled')) {
        toast.success('✅ Plantilla enviada a Meta para aprobación')
        handleClose()
      } else {
        toast.error('❌ Error al enviar la plantilla')
      }
    }
  }

  const handleClose = () => {
    dispatch(clearSelectedTemplate())
    onClose && onClose()
  }

  const isSaving = isCreating || isUpdating
  const error = createError || updateError || submitError

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-green-50 border-b border-green-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditMode ? 'Editar Plantilla' : 'Nueva Plantilla'}
              </h3>
              <p className="text-sm text-gray-600">
                Crea plantillas personalizadas para tus mensajes de WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Plantilla *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
              placeholder="mi_plantilla_ejemplo"
              disabled={isEditMode}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Solo letras minúsculas, números y guiones bajos
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Idioma
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt_BR">Português (BR)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="UTILITY">Utilidad (notificaciones, confirmaciones)</option>
            <option value="MARKETING">Marketing (promociones, ofertas)</option>
            <option value="AUTHENTICATION">Autenticación (códigos OTP)</option>
          </select>
        </div>

        {/* Header Section */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Encabezado (Opcional)
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Encabezado
              </label>
              <select
                value={headerType}
                onChange={(e) => setHeaderType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="TEXT">Texto</option>
                <option value="IMAGE">Imagen</option>
                <option value="VIDEO">Video</option>
                <option value="DOCUMENT">Documento</option>
              </select>
            </div>

            {headerType === 'TEXT' && (
              <div>
                <input
                  type="text"
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  placeholder="Texto del encabezado (máx. 60 caracteres)"
                  maxLength={60}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {headerText.length}/60 caracteres
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Body Section */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Cuerpo del Mensaje *
          </h4>
          
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            placeholder="Escribe el contenido de tu mensaje aquí...&#10;&#10;Usa {{1}}, {{2}}, etc. para variables dinámicas.&#10;Ejemplo: Hola {{1}}, tu cita es el {{2}} a las {{3}}."
            rows={6}
            maxLength={1024}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            {bodyText.length}/1024 caracteres
          </p>
        </div>

        {/* Footer Section */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Pie de Página (Opcional)
          </h4>
          
          <input
            type="text"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            placeholder="Texto del pie de página (máx. 60 caracteres)"
            maxLength={60}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            {footerText.length}/60 caracteres
          </p>
        </div>

        {/* Buttons Section */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">
              Botones (Opcional)
            </h4>
            {buttons.length < 3 && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAddButton('QUICK_REPLY')}
                  className="px-3 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100"
                >
                  + Respuesta Rápida
                </button>
                <button
                  onClick={() => handleAddButton('URL')}
                  className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
                >
                  + URL
                </button>
                <button
                  onClick={() => handleAddButton('PHONE_NUMBER')}
                  className="px-3 py-1 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100"
                >
                  + Teléfono
                </button>
              </div>
            )}
          </div>

          {buttons.length > 0 && (
            <div className="space-y-3">
              {buttons.map((button, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">
                      {button.type === 'QUICK_REPLY' ? 'Respuesta Rápida' : button.type === 'URL' ? 'Botón con URL' : 'Botón de Llamada'}
                    </span>
                    <button
                      onClick={() => handleRemoveButton(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={button.text}
                    onChange={(e) => handleUpdateButton(index, 'text', e.target.value)}
                    placeholder="Texto del botón"
                    maxLength={20}
                    className="w-full px-3 py-2 mb-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                  />

                  {button.type === 'URL' && (
                    <input
                      type="url"
                      value={button.url || ''}
                      onChange={(e) => handleUpdateButton(index, 'url', e.target.value)}
                      placeholder="https://ejemplo.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                    />
                  )}

                  {button.type === 'PHONE_NUMBER' && (
                    <input
                      type="tel"
                      value={button.phone_number || ''}
                      onChange={(e) => handleUpdateButton(index, 'phone_number', e.target.value)}
                      placeholder="+573001234567"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={handleClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancelar
        </button>

        <div className="flex space-x-3">
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Guardar Borrador
              </>
            )}
          </button>

          <button
            onClick={handleSubmitToMeta}
            disabled={isSaving || isSubmitting || !bodyText}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enviando...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                {isEditMode ? 'Actualizar y Enviar' : 'Crear y Enviar a Meta'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default WhatsAppTemplateEditor
