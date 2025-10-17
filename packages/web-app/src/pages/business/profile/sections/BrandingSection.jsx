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
  updateBranding
} from '@shared/store/slices/businessConfigurationSlice'
import { businessBrandingApi } from '@shared/api'

const BrandingSection = ({ isSetupMode, onComplete, isCompleted }) => {
  const dispatch = useDispatch()
  const { branding, uploadingLogo, saving, error, saveError } = useSelector(state => state.businessConfiguration)
  const activeBusiness = useSelector(state => state.business?.currentBusiness)
  
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
    console.log('🎨 formData:', formData);
    console.log('🖼️ logoFile:', logoFile);
    
    if (!activeBusiness?.id) {
      console.log('❌ No activeBusiness.id, returning');
      return;
    }

    try {
      // Si hay un logo nuevo, subirlo primero
      if (logoFile) {
        console.log('📤 Uploading logo...');
        const resultLogo = await dispatch(uploadLogo({
          businessId: activeBusiness.id,
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
        businessId: activeBusiness.id,
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Editar
          </button>
        )}
      </div>

      {/* Logo Upload Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <PhotoIcon className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Logo del Negocio</h3>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Preview */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
              ) : (
                <PhotoIcon className="h-16 w-16 text-gray-400" />
              )}
            </div>
          </div>

          {/* Upload Controls */}
          {isEditing && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subir nuevo logo
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
          )}
        </div>
      </div>

      {/* Colors Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <PaintBrushIcon className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Colores Corporativos</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Primary Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Principal
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                disabled={!isEditing}
                className="h-12 w-12 rounded-lg border-2 border-gray-300 cursor-pointer disabled:opacity-50"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                disabled={!isEditing}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 font-mono text-sm"
                placeholder="#FF6B9D"
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Secundario
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                disabled={!isEditing}
                className="h-12 w-12 rounded-lg border-2 border-gray-300 cursor-pointer disabled:opacity-50"
              />
              <input
                type="text"
                value={formData.secondaryColor}
                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                disabled={!isEditing}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 font-mono text-sm"
                placeholder="#4ECDC4"
              />
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color de Acento
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.accentColor}
                onChange={(e) => handleColorChange('accentColor', e.target.value)}
                disabled={!isEditing}
                className="h-12 w-12 rounded-lg border-2 border-gray-300 cursor-pointer disabled:opacity-50"
              />
              <input
                type="text"
                value={formData.accentColor}
                onChange={(e) => handleColorChange('accentColor', e.target.value)}
                disabled={!isEditing}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 font-mono text-sm"
                placeholder="#FFE66D"
              />
            </div>
          </div>
        </div>

        {/* Color Preview */}
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Vista Previa:</p>
          <div className="flex gap-4">
            <div 
              className="flex-1 h-24 rounded-lg shadow-md flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: formData.primaryColor }}
            >
              Primario
            </div>
            <div 
              className="flex-1 h-24 rounded-lg shadow-md flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: formData.secondaryColor }}
            >
              Secundario
            </div>
            <div 
              className="flex-1 h-24 rounded-lg shadow-md flex items-center justify-center text-gray-900 font-semibold"
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
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Personaliza tu marca:</strong> Sube tu logo y elige los colores que representan tu negocio. 
            Estos se aplicarán en toda la aplicación para crear una experiencia única para tus clientes.
          </p>
        </div>
      )}
    </div>
  )
}

export default BrandingSection
