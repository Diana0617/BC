import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { 
  XMarkIcon, 
  DocumentTextIcon, 
  InformationCircleIcon,
  TagIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

/**
 * ConsentTemplateEditor Component
 * Editor completo para crear/editar plantillas de consentimiento con TinyMCE
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal abierto/cerrado
 * @param {Function} props.onClose - Callback al cerrar
 * @param {Function} props.onSave - Callback al guardar (recibe templateData)
 * @param {Object} props.template - Plantilla a editar (null para crear nueva)
 * @param {string} props.businessId - ID del negocio
 */
const ConsentTemplateEditor = ({ 
  isOpen, 
  onClose, 
  onSave, 
  template = null,
  businessId 
}) => {
  const editorRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    content: '',
    version: '1.0.0',
    editableFields: [],
    pdfConfig: {
      includeLogo: true,
      includeBusinessName: true,
      includeDate: true,
      fontSize: 12,
      fontFamily: 'Arial',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    },
    metadata: {}
  });

  // Cargar datos de la plantilla si estamos editando
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        code: template.code || '',
        category: template.category || '',
        content: template.content || '',
        version: template.version || '1.0.0',
        editableFields: template.editableFields || [],
        pdfConfig: template.pdfConfig || formData.pdfConfig,
        metadata: template.metadata || {}
      });
    } else {
      // Reset para nueva plantilla
      setFormData({
        name: '',
        code: '',
        category: '',
        content: '',
        version: '1.0.0',
        editableFields: [],
        pdfConfig: {
          includeLogo: true,
          includeBusinessName: true,
          includeDate: true,
          fontSize: 12,
          fontFamily: 'Arial',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        },
        metadata: {}
      });
    }
  }, [template, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditorChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const handleInsertPlaceholder = (placeholder) => {
    if (editorRef.current) {
      editorRef.current.insertContent(placeholder);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }
    
    if (!formData.code.trim()) {
      setError('El código es requerido');
      return;
    }
    
    if (!formData.content.trim()) {
      setError('El contenido es requerido');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await onSave(formData);
      
      onClose();
    } catch (err) {
      console.error('Error saving template:', err);
      setError(err.message || 'Error al guardar la plantilla');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Placeholders disponibles
  const placeholders = [
    { 
      label: 'Nombre del Negocio', 
      value: '{{negocio_nombre}}',
      description: 'Nombre de tu negocio'
    },
    { 
      label: 'Dirección del Negocio', 
      value: '{{negocio_direccion}}',
      description: 'Dirección física del negocio'
    },
    { 
      label: 'Teléfono del Negocio', 
      value: '{{negocio_telefono}}',
      description: 'Número de contacto'
    },
    { 
      label: 'Email del Negocio', 
      value: '{{negocio_email}}',
      description: 'Correo electrónico'
    },
    { 
      label: 'Nombre del Cliente', 
      value: '{{cliente_nombre}}',
      description: 'Nombre completo del cliente'
    },
    { 
      label: 'Email del Cliente', 
      value: '{{cliente_email}}',
      description: 'Email del cliente'
    },
    { 
      label: 'Teléfono del Cliente', 
      value: '{{cliente_telefono}}',
      description: 'Teléfono del cliente'
    },
    { 
      label: 'Documento del Cliente', 
      value: '{{cliente_documento}}',
      description: 'Número de identificación'
    },
    { 
      label: 'Fecha de Nacimiento', 
      value: '{{cliente_fecha_nacimiento}}',
      description: 'Fecha de nacimiento del cliente'
    },
    { 
      label: 'Nombre del Servicio', 
      value: '{{servicio_nombre}}',
      description: 'Nombre del procedimiento/servicio'
    },
    { 
      label: 'Fecha de Firma', 
      value: '{{fecha_firma}}',
      description: 'Fecha actual de firma'
    },
    { 
      label: 'Fecha de Cita', 
      value: '{{fecha_cita}}',
      description: 'Fecha de la cita programada'
    }
  ];

  const categories = [
    { value: 'ESTETICO', label: 'Estético' },
    { value: 'MEDICO', label: 'Médico' },
    { value: 'DEPILACION', label: 'Depilación' },
    { value: 'TATUAJE', label: 'Tatuaje' },
    { value: 'MASAJES', label: 'Masajes' },
    { value: 'OTRO', label: 'Otro' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {template ? 'Editar Plantilla' : 'Nueva Plantilla de Consentimiento'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {template 
                  ? `Editando: ${template.name} (v${template.version})`
                  : 'Crea una plantilla que podrás usar en tus servicios'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-12 gap-6 p-6">
              {/* Left Column - Form Fields */}
              <div className="col-span-8 space-y-6">
                {/* Basic Info */}
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                    Información Básica
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la Plantilla *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Ej: Consentimiento Botox"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código Único *
                      </label>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        placeholder="Ej: CONSENT_BOTOX_V1"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                        required
                        disabled={!!template} // No editable si es actualización
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {template ? 'El código no puede modificarse' : 'Identificador único (sin espacios)'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoría
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Versión
                      </label>
                      <input
                        type="text"
                        name="version"
                        value={formData.version}
                        onChange={handleInputChange}
                        placeholder="1.0.0"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Se incrementa automáticamente al editar
                      </p>
                    </div>
                  </div>
                </div>

                {/* Editor */}
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ClipboardDocumentCheckIcon className="h-5 w-5 text-blue-600" />
                    Contenido del Consentimiento *
                  </h3>
                  
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <Editor
                      apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                      onInit={(evt, editor) => editorRef.current = editor}
                      value={formData.content}
                      onEditorChange={handleEditorChange}
                      init={{
                        height: 500,
                        menubar: true,
                        // ✅ SOLO PLUGINS GRATUITOS (Core Features) - No expiran
                        plugins: [
                          'anchor', 'autolink', 'charmap', 'code', 'codesample', 
                          'emoticons', 'link', 'lists', 'media', 'searchreplace', 
                          'table', 'visualblocks', 'wordcount', 'preview', 
                          'fullscreen', 'insertdatetime', 'help'
                        ],
                        toolbar: 'undo redo | blocks fontfamily fontsize | ' +
                          'bold italic underline strikethrough | forecolor backcolor | ' +
                          'alignleft aligncenter alignright alignjustify | ' +
                          'bullist numlist | outdent indent | ' +
                          'table link media | ' +
                          'removeformat code preview fullscreen | help',
                        content_style: 'body { font-family:Arial,sans-serif; font-size:14px; line-height: 1.6; }',
                        language: 'es',
                        placeholder: 'Escribe aquí el contenido del consentimiento informado...',
                        font_family_formats: 'Arial=arial,helvetica,sans-serif; Courier New=courier new,courier,monospace; Georgia=georgia,palatino; Times New Roman=times new roman,times; Verdana=verdana,geneva',
                        font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt',
                        block_formats: 'Párrafo=p; Título 1=h1; Título 2=h2; Título 3=h3; Título 4=h4; Preformateado=pre'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Placeholders & Help */}
              <div className="col-span-4 space-y-4">
                {/* Placeholders */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sticky top-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <TagIcon className="h-4 w-4" />
                    Variables Disponibles
                  </h3>
                  
                  <p className="text-xs text-blue-800 mb-3">
                    Haz clic para insertar en el contenido:
                  </p>
                  
                  <div className="space-y-1.5 max-h-96 overflow-y-auto">
                    {placeholders.map((placeholder, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleInsertPlaceholder(placeholder.value)}
                        className="w-full text-left px-3 py-2 text-xs bg-white hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                        title={placeholder.description}
                      >
                        <div className="font-medium text-blue-900">
                          {placeholder.label}
                        </div>
                        <div className="text-blue-600 font-mono text-[10px] mt-0.5">
                          {placeholder.value}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Help */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                    <InformationCircleIcon className="h-4 w-4" />
                    Información
                  </h3>
                  <ul className="text-xs text-yellow-800 space-y-2">
                    <li>• Las variables se reemplazan automáticamente al firmar</li>
                    <li>• El código debe ser único y no puede cambiar</li>
                    <li>• La versión se incrementa al editar el contenido</li>
                    <li>• Puedes usar formato HTML rico con el editor</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 bg-gray-50 border-t">
              <div className="text-sm text-gray-600">
                {template && (
                  <span>
                    Última actualización: {new Date(template.updatedAt).toLocaleDateString('es-CO')}
                  </span>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      {template ? 'Actualizar Plantilla' : 'Crear Plantilla'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConsentTemplateEditor;
