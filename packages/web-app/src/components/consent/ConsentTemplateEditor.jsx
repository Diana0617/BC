import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import SimpleRichTextEditor from './SimpleRichTextEditor';
import { 
  XMarkIcon, 
  DocumentTextIcon, 
  InformationCircleIcon,
  TagIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

/**
 * ConsentTemplateEditor Component
 * Editor completo para crear/editar plantillas de consentimiento
 * Usa editor HTML nativo para evitar conflictos con extensiones del navegador
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal abierto/cerrado
 * @param {Function} props.onClose - Callback al cerrar
 * @param {Function} props.onSave - Callback al guardar (recibe templateData)
 * @param {Object} props.template - Plantilla a editar (null para crear nueva)
 * @param {string} props.businessName - Nombre del negocio
 * @param {string} props.businessPhone - Teléfono del negocio
 * @param {string} props.businessAddress - Dirección del negocio
 * @param {string} props.businessEmail - Email del negocio
 * @param {Array} props.branches - Sucursales del negocio
 * @param {Object} props.branding - Branding del negocio (logo y colores)
 */
const ConsentTemplateEditor = ({ 
  isOpen, 
  onClose, 
  onSave, 
  template = null,
  businessName,
  businessPhone,
  businessAddress,
  businessEmail,
  branches = [],
  branding 
}) => {
  const editorRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataReady, setDataReady] = useState(false); // Flag para saber cuándo los datos están listos
  
  // Estados estables para los datos del negocio - almacenar valores iniciales
  const initialDataRef = useRef({
    logoUrl: branding?.logo || null,
    businessName: businessName || '',
    businessPhone: businessPhone || '',
    businessAddress: businessAddress || '',
    businessEmail: businessEmail || '',
    branches: branches || []
  });

  // Actualizar datos solo cuando el modal se abre (no en cada render)
  useEffect(() => {
    if (isOpen) {
      const newData = {
        logoUrl: branding?.logo || null,
        businessName: businessName || '',
        businessPhone: businessPhone || '',
        businessAddress: businessAddress || '',
        businessEmail: businessEmail || '',
        branches: branches || []
      };
      
      console.log('📦 Datos del negocio cargados:', newData);
      initialDataRef.current = newData;
      
      // Forzar recálculo de placeholders después de actualizar datos
      setDataReady(prev => !prev);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Solo cuando se abre el modal - props capturados intencionalmente

  // Configuración por defecto de PDF (constante estable)
  const defaultPdfConfig = useRef({
    includeLogo: true,
    includeBusinessName: true,
    includeDate: true,
    fontSize: 12,
    fontFamily: 'Arial',
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  }).current;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    content: '',
    version: '1.0.0',
    editableFields: [],
    pdfConfig: defaultPdfConfig,
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
        pdfConfig: template.pdfConfig || defaultPdfConfig,
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
        pdfConfig: defaultPdfConfig,
        metadata: {}
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditorChange = useCallback((content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  }, []); // Función estable

  const handleInsertPlaceholder = useCallback((placeholderValue, isImage = false, isBranch = false, branchData = null) => {
    if (editorRef.current) {
      const data = initialDataRef.current;
      console.log('🔍 Insertando placeholder:', placeholderValue, 'con datos:', data);
      
      if (isImage && placeholderValue === '{{negocio_logo}}') {
        console.log('🖼️ Intentando insertar logo. logoUrl:', data.logoUrl);
        if (data.logoUrl) {
          console.log('✅ Logo disponible, insertando imagen');
          // Insertar logo como imagen editable sin wrapper que restrinja movimiento
          const imageHtml = `<img 
            src="${data.logoUrl}" 
            alt="Logo del negocio" 
            style="max-width: 250px; width: 250px; height: auto; cursor: pointer; border: 2px dashed #cbd5e1; display: inline-block; margin: 10px;" 
            onclick="
              const newWidth = prompt('Ancho de la imagen (ej: 150px, 200px, 300px):', this.style.width);
              if (newWidth) { 
                this.style.width = newWidth; 
                this.style.maxWidth = newWidth; 
              }
            "
          /> `;
          editorRef.current.insertContent(imageHtml);
        } else {
          console.log('⚠️ No hay logo disponible. branding?.logo:', branding?.logo);
          // Si no hay logo, insertar el placeholder como texto
          editorRef.current.insertContent(` ${placeholderValue} `);
        }
      } else if (isBranch && branchData) {
        // Insertar información completa de la sucursal como HTML
        const branchHtml = `
          <div style="margin: 10px 0; padding: 10px; border-left: 3px solid #3b82f6; background-color: #eff6ff;">
            <strong>${branchData.name}</strong><br/>
            📍 ${branchData.address}, ${branchData.city}<br/>
            📞 ${branchData.phone || 'No disponible'}<br/>
            📧 ${branchData.email || 'No disponible'}
          </div>
        `;
        editorRef.current.insertContent(branchHtml);
      } else {
        // Mapear placeholders a valores reales del negocio
        const valueMap = {
          '{{negocio_nombre}}': data.businessName,
          '{{negocio_direccion}}': data.businessAddress,
          '{{negocio_telefono}}': data.businessPhone,
          '{{negocio_email}}': data.businessEmail,
          // Estos se mantienen como placeholders para reemplazarse al firmar
          '{{servicio_nombre}}': '{{servicio_nombre}}',
          '{{fecha_firma}}': '{{fecha_firma}}',
          '{{fecha_cita}}': '{{fecha_cita}}'
        };
        
        // Obtener el valor real o mantener el placeholder
        const valueToInsert = valueMap[placeholderValue] || placeholderValue;
        editorRef.current.insertContent(` ${valueToInsert} `);
      }
    }
  }, []); // Sin dependencias - función estable

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

  // Memoizar placeholders - recalcular solo cuando placeholdersKey cambia (al abrir modal)
  const placeholders = useMemo(() => {
    const data = initialDataRef.current;
    console.log('🏷️ Generando placeholders con data:', data);
    
    const result = [
      // Logo del negocio (siempre disponible)
      {
        label: '🖼️ Logo del Negocio',
        value: '{{negocio_logo}}',
        description: 'Inserta el logo de tu negocio',
        isImage: true
      },
      { 
        label: 'Nombre del Negocio', 
        value: '{{negocio_nombre}}',
        description: data.businessName || 'Nombre de tu negocio'
      },
      { 
        label: 'Dirección del Negocio', 
        value: '{{negocio_direccion}}',
        description: data.businessAddress || 'Dirección física del negocio'
      },
      { 
        label: 'Teléfono del Negocio', 
        value: '{{negocio_telefono}}',
        description: data.businessPhone || 'Número de contacto'
      },
      { 
        label: 'Email del Negocio', 
        value: '{{negocio_email}}',
        description: data.businessEmail || 'Correo electrónico'
      },
      // Sucursales (si existen múltiples)
      ...(data.branches.length > 0 ? data.branches.map((branch, index) => ({
        label: `📍 Sucursal: ${branch.name}`,
        value: `{{sucursal_${index + 1}_info}}`,
        description: `${branch.address} - Tel: ${branch.phone || 'N/A'}`,
        isBranch: true,
        branchData: branch
      })) : []),
      // Datos del Cliente
      { 
        label: '👤 Nombre Completo del Cliente', 
        value: '{{cliente_nombre_completo}}',
        description: 'Nombre y apellido completo del cliente'
      },
      { 
        label: 'Nombre del Cliente', 
        value: '{{cliente_nombre}}',
        description: 'Solo el nombre del cliente'
      },
      { 
        label: 'Apellido del Cliente', 
        value: '{{cliente_apellido}}',
        description: 'Solo el apellido del cliente'
      },
      { 
        label: '📧 Email del Cliente', 
        value: '{{cliente_email}}',
        description: 'Correo electrónico del cliente'
      },
      { 
        label: '📱 Teléfono del Cliente', 
        value: '{{cliente_telefono}}',
        description: 'Número de contacto del cliente'
      },
      { 
        label: '🆔 Tipo de Documento', 
        value: '{{cliente_tipo_documento}}',
        description: 'Tipo de documento (CC, DNI, Pasaporte, etc.)'
      },
      { 
        label: '🆔 Número de Documento', 
        value: '{{cliente_numero_documento}}',
        description: 'Número de identificación del cliente'
      },
      { 
        label: '🆔 Documento Completo', 
        value: '{{cliente_documento_completo}}',
        description: 'Tipo y número de documento (ej: CC: 1234567890)'
      },
      { 
        label: '🎂 Fecha de Nacimiento', 
        value: '{{cliente_fecha_nacimiento}}',
        description: 'Fecha de nacimiento del cliente (DD/MM/AAAA)'
      },
      { 
        label: '🎂 Edad del Cliente', 
        value: '{{cliente_edad}}',
        description: 'Edad calculada automáticamente (ej: 25 años)'
      },
      // Datos del Servicio
      { 
        label: '💆 Nombre del Servicio', 
        value: '{{servicio_nombre}}',
        description: 'Nombre del procedimiento/servicio'
      },
      // Fechas
      { 
        label: '📅 Fecha de Firma', 
        value: '{{fecha_firma}}',
        description: 'Fecha actual de firma'
      },
      { 
        label: '📅 Fecha de Cita', 
        value: '{{fecha_cita}}',
        description: 'Fecha de la cita programada'
      }
    ];
    
    console.log(`✅ Placeholders generados: ${result.length} items`, result);
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataReady]); // Recalcular cuando los datos estén listos

  const categories = [
    { value: 'ESTETICO', label: 'Estético' },
    { value: 'MEDICO', label: 'Médico' },
    { value: 'DEPILACION', label: 'Depilación' },
    { value: 'TATUAJE', label: 'Tatuaje' },
    { value: 'MASAJES', label: 'Masajes' },
    { value: 'OTRO', label: 'Otro' }
  ];

  // No renderizar nada si el modal está cerrado
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-2 sm:px-4 py-2 sm:py-6">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>
        
        {/* Modal - Responsive width and height */}
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header - Responsive */}
          <div className="flex items-start sm:items-center justify-between p-3 sm:p-6 border-b">
            <div className="flex-1 min-w-0 pr-3">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                {template ? 'Editar Plantilla' : 'Nueva Plantilla'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                {template 
                  ? `${template.name} (v${template.version})`
                  : 'Crea una plantilla para tus servicios'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              disabled={isLoading}
            >
              <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Error Alert - Responsive */}
          {error && (
            <div className="mx-3 sm:mx-6 mt-3 sm:mt-4 bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3">
              <p className="text-xs sm:text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 p-3 sm:p-6">
              {/* Left Column - Form Fields - Full width on mobile, 8 cols on desktop */}
              <div className="lg:col-span-8 space-y-4 sm:space-y-6">
                {/* Basic Info - Responsive */}
                <div className="bg-white border rounded-lg p-3 sm:p-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Información Básica
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Nombre de la Plantilla *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Ej: Consentimiento Botox"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Código Único *
                      </label>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        placeholder="Ej: CONSENT_BOTOX_V1"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                        required
                        disabled={!!template} // No editable si es actualización
                      />
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                        {template ? 'El código no puede modificarse' : 'Identificador único (sin espacios)'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Categoría
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Versión
                      </label>
                      <input
                        type="text"
                        name="version"
                        value={formData.version}
                        onChange={handleInputChange}
                        placeholder="1.0.0"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50"
                        disabled
                      />
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                        Se incrementa automáticamente al editar
                      </p>
                    </div>
                  </div>
                </div>

                {/* Editor Simple - Sin iframe, sin loops */}
                <div className="bg-white border rounded-lg p-3 sm:p-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <ClipboardDocumentCheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Contenido del Consentimiento *
                  </h3>
                  
                  <SimpleRichTextEditor
                    ref={editorRef}
                    value={formData.content}
                    onChange={handleEditorChange}
                    placeholder="Escribe aquí el contenido del consentimiento informado..."
                  />
                </div>
              </div>

              {/* Right Column - Placeholders & Help - Full width on mobile, 4 cols on desktop */}
              <div className="lg:col-span-4 space-y-4 order-first lg:order-last" key={`placeholders-${isOpen}`}>
                {/* Placeholders - Responsive */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 lg:sticky lg:top-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-900 mb-2 sm:mb-3 flex items-center gap-2">
                    <TagIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    Variables Disponibles ({placeholders.length})
                  </h3>
                  
                  <p className="text-[10px] sm:text-xs text-blue-800 mb-2 sm:mb-3">
                    Haz clic para insertar en el contenido:
                  </p>
                  
                  <div className="space-y-1 sm:space-y-1.5 max-h-64 sm:max-h-96 overflow-y-auto">
                    {placeholders.map((placeholder, index) => (
                      <button
                        key={`${placeholder.value}-${index}`}
                        type="button"
                        onClick={() => handleInsertPlaceholder(
                          placeholder.value, 
                          placeholder.isImage, 
                          placeholder.isBranch,
                          placeholder.branchData
                        )}
                        className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs bg-white hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                        title={placeholder.description}
                      >
                        <div className="font-medium text-blue-900 truncate">
                          {placeholder.label}
                        </div>
                        <div className="text-blue-600 font-mono text-[9px] sm:text-[10px] mt-0.5 truncate">
                          {placeholder.isBranch ? placeholder.description : placeholder.value}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Help - Responsive */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                    <InformationCircleIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    Información
                  </h3>
                  <ul className="text-[10px] sm:text-xs text-yellow-800 space-y-1.5 sm:space-y-2">
                    <li>• Las variables se reemplazan automáticamente al firmar</li>
                    <li>• El código debe ser único y no puede cambiar</li>
                    <li>• La versión se incrementa al editar el contenido</li>
                    <li>• Puedes usar formato HTML rico con el editor</li>
                    {branding?.logo && (
                      <li>• El logo se puede insertar desde las variables</li>
                    )}
                  </ul>
                </div>

                {/* Example Template */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-3 sm:p-4 shadow-sm">
                  <h3 className="text-xs sm:text-sm font-bold text-green-900 mb-2 flex items-center gap-2">
                    <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-700" />
                    💡 Ejemplo de Template
                  </h3>
                  <div className="text-[10px] sm:text-xs text-green-800 space-y-2">
                    <p className="font-bold text-green-900">📋 Copia este ejemplo:</p>
                    <div className="bg-white p-3 rounded border-2 border-green-300 font-mono text-[10px] sm:text-xs overflow-x-auto shadow-inner">
                      <p>Yo, <strong>{'{{cliente_nombre_completo}}'}</strong>, identificado(a) con <strong>{'{{cliente_documento_completo}}'}</strong>, de <strong>{'{{cliente_edad}}'}</strong>,</p>
                      <br />
                      <p>DECLARO que:</p>
                      <p>✓ He sido informado(a) sobre el procedimiento <strong>{'{{servicio_nombre}}'}</strong></p>
                      <p>✓ No tengo contraindicaciones médicas</p>
                      <p>✓ Autorizo la realización del tratamiento</p>
                      <br />
                      <p>Firmado el <strong>{'{{fecha_firma}}'}</strong></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions - Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t">
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                {template && (
                  <span>
                    Última actualización: {new Date(template.updatedAt).toLocaleDateString('es-CO')}
                  </span>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
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
