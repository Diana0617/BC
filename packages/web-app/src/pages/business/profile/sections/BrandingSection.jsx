import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  PaintBrushIcon,
  PhotoIcon,
  CheckCircleIcon,
  ArrowUpTrayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { 
  uploadLogo,
  saveBranding,
  completeStep,
  
} from '@shared/store/slices/businessConfigurationSlice'
import { businessBrandingApi } from '@shared/api'

const BrandingSection = ({ isSetupMode, onComplete, isCompleted }) => {
  const dispatch = useDispatch()
  const { branding, uploadingLogo, saving, error, saveError } = useSelector(state => state.businessConfiguration)
  const activeBusiness = useSelector(state => state.business?.currentBusiness)
  const { user } = useSelector(state => state.auth)
  
  // Usar businessId del usuario si activeBusiness no está disponible
  const businessId = activeBusiness?.id || user?.businessId
  
  const [formData, setFormData] = useState({
    primaryColor: '#FF6B9D',
    secondaryColor: '#4ECDC4',
    accentColor: '#FFE66D',
    fontFamily: 'Poppins'
  })

  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [isEditing, setIsEditing] = useState(isSetupMode)
  const fileInputRef = useRef(null)
  const initializedRef = useRef(false)

  // NOTE: El branding se carga en el componente padre (BusinessProfile)
  // Este componente solo consume el branding de Redux

  // Inicializar formData cuando se carga el branding por primera vez
  useEffect(() => {
    if (branding && !initializedRef.current) {
      initializedRef.current = true
      
      setFormData({
        primaryColor: branding.primaryColor || '#FF6B9D',
        secondaryColor: branding.secondaryColor || '#4ECDC4',
        accentColor: branding.accentColor || '#FFE66D',
        fontFamily: branding.fontFamily || 'Poppins'
      })
      
      if (branding.logo) {
        setLogoPreview(branding.logo)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branding?.logo])

  // Manejar selección de archivo de logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        alert('Formato de archivo no válido. Use JPG, PNG o WEBP')
        return
      }

      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo es muy grande. Máximo 10MB')
        return
      }

      setLogoFile(file)

      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview(branding?.logo || null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Manejar cambio de colores
  const handleColorChange = (colorType, value) => {
    // Validar formato hexadecimal
    if (!businessBrandingApi.validateHexColor(value)) {
      return // Solo ignorar silenciosamente, ya mostramos error en el UI
    }

    setFormData(prev => ({
      ...prev,
      [colorType]: value
    }))
  }

  // Guardar cambios
  const handleSave = async () => {
    console.log('🔵 handleSave called');
    console.log('📦 activeBusiness:', activeBusiness);
    console.log('👤 user.businessId:', user?.businessId);
    console.log('🆔 businessId:', businessId);
    console.log('🎨 formData:', formData);
    console.log('🖼️ logoFile:', logoFile);
    
    if (!businessId) {
      console.log('❌ No businessId available, returning');
      alert('No se pudo identificar el negocio. Por favor recarga la página.');
      return;
    }

    try {
      // Si hay un logo nuevo, subirlo primero
      if (logoFile) {
        console.log('📤 Uploading logo...');
        const resultLogo = await dispatch(uploadLogo({
          businessId: businessId,
          logoFile: logoFile
        }))
        
        if (uploadLogo.fulfilled.match(resultLogo)) {
          console.log('✅ Logo uploaded successfully');
          setLogoFile(null)
        }
      }

      // Guardar colores
      console.log('💾 Saving branding colors...');
      const result = await dispatch(saveBranding({
        businessId: businessId,
        brandingData: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          accentColor: formData.accentColor,
          fontFamily: formData.fontFamily
        }
      }))

      console.log('📊 Save result:', result);

      if (saveBranding.fulfilled.match(result)) {
        console.log('✅ Branding saved successfully');
        setIsEditing(false)
        
        // Si estamos en modo setup, marcar como completado
        if (isSetupMode && onComplete) {
          dispatch(completeStep('branding'))
          onComplete()
        }
      }
    } catch (error) {
      console.error('❌ Error guardando branding:', error)
    }
  }

  const validateHexColor = (color) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
  }

  const isFormValid = 
    validateHexColor(formData.primaryColor) &&
    validateHexColor(formData.secondaryColor) &&
    validateHexColor(formData.accentColor)

  console.log('🔍 Form validation:', {
    primaryColor: formData.primaryColor,
    secondaryColor: formData.secondaryColor,
    accentColor: formData.accentColor,
    primaryValid: validateHexColor(formData.primaryColor),
    secondaryValid: validateHexColor(formData.secondaryColor),
    accentValid: validateHexColor(formData.accentColor),
    isFormValid,
    saving,
    uploadingLogo,
    buttonDisabled: !isFormValid || saving || uploadingLogo
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <PaintBrushIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">
            Branding y Personalización
          </h2>
          {isCompleted && !isSetupMode && (
            <CheckCircleIcon className="h-6 w-6 text-green-500 ml-2" />
          )}
        </div>
        
        {!isSetupMode && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-branded-primary px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 animate-pulse"
          >
            ✏️ Editar Branding
          </button>
        )}
      </div>

      {/* Banner de ayuda interactivo cuando NO está editando */}
      {!isSetupMode && !isEditing && (
        <div className="bg-gradient-to-r from-branded-primary/10 to-branded-secondary/10 border-2 border-branded-primary/50 rounded-lg p-4 shadow-md">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="bg-branded-primary text-white rounded-full p-2 animate-bounce">
                <PaintBrushIcon className="h-6 w-6" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-branded-primary mb-1">
                👋 ¿Quieres personalizar tu branding?
              </h3>
              <p className="text-branded-secondary mb-3">
                Haz clic en el botón <strong>"✏️ Editar Branding"</strong> arriba para empezar a personalizar tu logo y colores corporativos.
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="btn-branded-primary px-4 py-2 font-semibold shadow-md hover:shadow-lg transition-all duration-200 inline-flex items-center gap-2"
              >
                <PaintBrushIcon className="h-5 w-5" />
                Comenzar a editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logo Upload Section */}
      <div className={`rounded-lg p-6 transition-all duration-300 ${
        isEditing ? 'bg-blue-50 border-2 border-branded-primary shadow-lg' : 'bg-gray-50 border-2 border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <PhotoIcon className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Logo del Negocio</h3>
          </div>
          {isEditing && (
            <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full animate-pulse">
              ✏️ MODO EDICIÓN
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Preview */}
          <div className="flex-shrink-0">
            <div className={`w-32 h-32 bg-white border-2 rounded-lg flex items-center justify-center overflow-hidden transition-all duration-300 ${
              isEditing ? 'border-branded-primary shadow-lg ring-2 ring-branded-secondary/30' : 'border-gray-300'
            }`}>
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
              ) : (
                <PhotoIcon className="h-16 w-16 text-gray-400" />
              )}
            </div>
          </div>

          {/* Upload Controls */}
          {isEditing ? (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📤 Subir nuevo logo
              </label>
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleLogoChange}
                  disabled={uploadingLogo}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    disabled:opacity-50"
                />
                {logoFile && (
                  <button
                    onClick={handleRemoveLogo}
                    className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Cancelar
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Formatos soportados: JPG, PNG, WEBP. Tamaño máximo: 10MB. El logo se subirá al guardar.
              </p>
            </div>
          ) : (
            <div className="flex-1">
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium mb-1">Logo actual</p>
                <p className="text-sm text-gray-500">
                  Haz clic en "Editar Branding" para cambiar el logo
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Colors Section */}
      <div className={`rounded-lg p-6 transition-all duration-300 ${
        isEditing ? 'bg-blue-50 border-2 border-branded-primary shadow-lg' : 'bg-gray-50 border-2 border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <PaintBrushIcon className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Colores Corporativos</h3>
          </div>
          {isEditing && (
            <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full animate-pulse">
              ✏️ MODO EDICIÓN
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Primary Color */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎨 Color Principal
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                disabled={!isEditing}
                title={!isEditing ? "Haz clic en 'Editar Branding' para cambiar este color" : "Selecciona el color principal"}
                className={`h-12 w-12 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  isEditing 
                    ? 'border-branded-primary hover:border-branded-secondary hover:scale-110' 
                    : 'border-gray-300 opacity-50 cursor-not-allowed'
                }`}
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                disabled={!isEditing}
                placeholder="#FF6B9D"
                title={!isEditing ? "Haz clic en 'Editar Branding' para cambiar este color" : "Código hexadecimal del color"}
                className={`flex-1 px-3 py-2 border rounded-lg font-mono text-sm transition-all duration-200 ${
                  isEditing
                    ? 'border-branded-secondary focus:ring-2 focus:ring-branded-primary focus:border-branded-primary bg-white'
                    : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              />
            </div>
            {!isEditing && (
              <p className="text-xs text-gray-500 mt-1 italic">
                🔒 Bloqueado - Activa el modo edición
              </p>
            )}
          </div>

          {/* Secondary Color */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎨 Color Secundario
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                disabled={!isEditing}
                title={!isEditing ? "Haz clic en 'Editar Branding' para cambiar este color" : "Selecciona el color secundario"}
                className={`h-12 w-12 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  isEditing 
                    ? 'border-branded-primary hover:border-branded-secondary hover:scale-110' 
                    : 'border-gray-300 opacity-50 cursor-not-allowed'
                }`}
              />
              <input
                type="text"
                value={formData.secondaryColor}
                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                disabled={!isEditing}
                placeholder="#4ECDC4"
                title={!isEditing ? "Haz clic en 'Editar Branding' para cambiar este color" : "Código hexadecimal del color"}
                className={`flex-1 px-3 py-2 border rounded-lg font-mono text-sm transition-all duration-200 ${
                  isEditing
                    ? 'border-branded-secondary focus:ring-2 focus:ring-branded-primary focus:border-branded-primary bg-white'
                    : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              />
            </div>
            {!isEditing && (
              <p className="text-xs text-gray-500 mt-1 italic">
                🔒 Bloqueado - Activa el modo edición
              </p>
            )}
          </div>

          {/* Accent Color */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎨 Color de Acento
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.accentColor}
                onChange={(e) => handleColorChange('accentColor', e.target.value)}
                disabled={!isEditing}
                title={!isEditing ? "Haz clic en 'Editar Branding' para cambiar este color" : "Selecciona el color de acento"}
                className={`h-12 w-12 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  isEditing 
                    ? 'border-branded-primary hover:border-branded-secondary hover:scale-110' 
                    : 'border-gray-300 opacity-50 cursor-not-allowed'
                }`}
              />
              <input
                type="text"
                value={formData.accentColor}
                onChange={(e) => handleColorChange('accentColor', e.target.value)}
                disabled={!isEditing}
                placeholder="#FFE66D"
                title={!isEditing ? "Haz clic en 'Editar Branding' para cambiar este color" : "Código hexadecimal del color"}
                className={`flex-1 px-3 py-2 border rounded-lg font-mono text-sm transition-all duration-200 ${
                  isEditing
                    ? 'border-branded-secondary focus:ring-2 focus:ring-branded-primary focus:border-branded-primary bg-white'
                    : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              />
            </div>
            {!isEditing && (
              <p className="text-xs text-gray-500 mt-1 italic">
                🔒 Bloqueado - Activa el modo edición
              </p>
            )}
          </div>
        </div>

        {/* Color Preview */}
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <span>👁️</span> Vista Previa de Colores:
          </p>
          <div className="flex gap-4">
            <div 
              className="flex-1 h-24 rounded-lg shadow-md flex items-center justify-center text-white font-semibold transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: formData.primaryColor }}
            >
              Primario
            </div>
            <div 
              className="flex-1 h-24 rounded-lg shadow-md flex items-center justify-center text-white font-semibold transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: formData.secondaryColor }}
            >
              Secundario
            </div>
            <div 
              className="flex-1 h-24 rounded-lg shadow-md flex items-center justify-center text-gray-900 font-semibold transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: formData.accentColor }}
            >
              Acento
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      {isEditing && (
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={!isFormValid || saving || uploadingLogo}
            className="flex-1 btn-branded-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(saving || uploadingLogo) ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {uploadingLogo ? 'Subiendo logo...' : 'Guardando...'}
              </div>
            ) : (
              'Guardar Personalización'
            )}
          </button>
          
          {!isSetupMode && (
            <button
              onClick={() => {
                setIsEditing(false)
                // Reset form to branding state
                if (branding) {
                  setFormData({
                    primaryColor: branding.primaryColor || '#FF6B9D',
                    secondaryColor: branding.secondaryColor || '#4ECDC4',
                    accentColor: branding.accentColor || '#FFE66D',
                    fontFamily: branding.fontFamily || 'Poppins'
                  })
                }
                handleRemoveLogo()
              }}
              disabled={saving || uploadingLogo}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
        </div>
      )}

      {/* Mensajes de error */}
      {(error || saveError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            Error: {error || saveError}
          </p>
        </div>
      )}

      {/* Mensaje de ayuda en modo setup */}
      {isSetupMode && (
        <div className="bg-branded-primary/10 border border-branded-primary/30 rounded-lg p-4">
          <p className="text-sm text-branded-primary">
            <strong>Personaliza tu marca:</strong> Sube tu logo y elige los colores que representan tu negocio. 
            Estos se aplicarán en toda la aplicación para crear una experiencia única para tus clientes.
          </p>
        </div>
      )}
    </div>
  )
}

export default BrandingSection
