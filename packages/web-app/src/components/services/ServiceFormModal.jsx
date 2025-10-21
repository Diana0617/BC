import React, { useState, useEffect, useRef } from 'react'
import { XMarkIcon, PhotoIcon, XCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { businessServicesApi } from '@shared/api'
import ConsentTemplateModal from '../consent/ConsentTemplateModal'

const ServiceFormModal = ({ isOpen, onClose, onSave, service, businessId }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: '',
    category: '',
    color: '#3B82F6',
    preparationTime: 0,
    cleanupTime: 0,
    requiresConsent: false,
    consentTemplateId: null,
    // 💉 Campos de paquete
    isPackage: false,
    packageType: 'SINGLE',
    totalPrice: '',
    allowPartialPayment: false,
    pricePerSession: ''
  })
  
  const [packageConfig, setPackageConfig] = useState({
    sessions: 3,
    sessionInterval: 30,
    maintenanceSessions: 6,
    maintenanceInterval: 30,
    description: '',
    pricing: {
      perSession: '',
      discount: 0,
      mainSession: '',
      maintenancePrice: ''
    }
  })
  
  const [existingCategories, setExistingCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [existingImages, setExistingImages] = useState([]) // Imágenes ya guardadas en Cloudinary
  const fileInputRef = useRef(null)

  // Cargar categorías existentes
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await businessServicesApi.getServiceCategories(businessId)
        setExistingCategories(response.data || response || [])
      } catch (err) {
        console.error('Error loading categories:', err)
        // No es crítico, continuar sin categorías
      }
    }

    if (isOpen && businessId) {
      loadCategories()
    }
  }, [isOpen, businessId])

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        duration: service.duration || 30,
        price: service.price || '',
        category: service.category || '',
        color: service.color || '#3B82F6',
        preparationTime: service.preparationTime || 0,
        cleanupTime: service.cleanupTime || 0,
        requiresConsent: service.requiresConsent || false,
        consentTemplateId: service.consentTemplateId || null,
        // 💉 Datos de paquete
        isPackage: service.isPackage || false,
        packageType: service.packageType || 'SINGLE',
        totalPrice: service.totalPrice || '',
        allowPartialPayment: service.allowPartialPayment || false,
        pricePerSession: service.pricePerSession || ''
      })
      
      // 💉 Configuración de paquete
      if (service.isPackage && service.packageConfig) {
        setPackageConfig({
          sessions: service.packageConfig.sessions || 3,
          sessionInterval: service.packageConfig.sessionInterval || 30,
          maintenanceSessions: service.packageConfig.maintenanceSessions || 6,
          maintenanceInterval: service.packageConfig.maintenanceInterval || 30,
          description: service.packageConfig.description || '',
          pricing: {
            perSession: service.packageConfig.pricing?.perSession || '',
            discount: service.packageConfig.pricing?.discount || 0,
            mainSession: service.packageConfig.pricing?.mainSession || '',
            maintenancePrice: service.packageConfig.pricing?.maintenancePrice || ''
          }
        })
      }
      
      // Cargar imágenes existentes
      console.log('🖼️ Service images from DB:', service.images)
      if (service.images && service.images.length > 0) {
        console.log('✅ Loading existing images:', service.images)
        setExistingImages(service.images)
      } else {
        console.log('⚠️ No images found in service')
        setExistingImages([])
      }
      setImagePreview(null)
      setImageFile(null)
    } else {
      // Limpiar al crear nuevo servicio
      setPackageConfig({
        sessions: 3,
        sessionInterval: 30,
        maintenanceSessions: 6,
        maintenanceInterval: 30,
        description: '',
        pricing: {
          perSession: '',
          discount: 0,
          mainSession: '',
          maintenancePrice: ''
        }
      })
      setExistingImages([])
      setImagePreview(null)
      setImageFile(null)
    }
  }, [service])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // 💉 Manejar cambios en configuración de paquete
  const handlePackageConfigChange = (field, value) => {
    setPackageConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePackagePricingChange = (field, value) => {
    setPackageConfig(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [field]: value
      }
    }))
  }

  // 💉 Calcular precio total automáticamente
  useEffect(() => {
    if (!formData.isPackage) return

    let total = 0

    if (formData.packageType === 'MULTI_SESSION') {
      const pricePerSession = parseFloat(packageConfig.pricing.perSession) || 0
      const discount = parseFloat(packageConfig.pricing.discount) || 0
      const sessions = parseInt(packageConfig.sessions) || 0
      
      const subtotal = pricePerSession * sessions
      const discountAmount = subtotal * (discount / 100)
      total = subtotal - discountAmount
    } else if (formData.packageType === 'WITH_MAINTENANCE') {
      const mainPrice = parseFloat(packageConfig.pricing.mainSession) || 0
      const maintenancePrice = parseFloat(packageConfig.pricing.maintenancePrice) || 0
      const maintenanceCount = parseInt(packageConfig.maintenanceSessions) || 0
      
      total = mainPrice + (maintenancePrice * maintenanceCount)
    }

    setFormData(prev => ({
      ...prev,
      totalPrice: total.toFixed(2),
      pricePerSession: packageConfig.pricing.perSession
    }))
  }, [
    formData.isPackage,
    formData.packageType,
    packageConfig.sessions,
    packageConfig.maintenanceSessions,
    packageConfig.pricing
  ])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setError('Formato de archivo no válido. Use JPG, PNG o WEBP')
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo es muy grande. Máximo 5MB')
        return
      }

      setImageFile(file)

      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveExistingImage = (imageUrl) => {
    // Quitar de las imágenes existentes (se enviará el array actualizado al backend)
    setExistingImages(prev => prev.filter(url => url !== imageUrl))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 💉 Validación mejorada
    if (!formData.name) {
      setError('El nombre es requerido')
      return
    }

    // Validar según tipo de servicio
    if (!formData.isPackage && !formData.price) {
      setError('El precio es requerido para servicios individuales')
      return
    }

    if (formData.isPackage) {
      if (formData.packageType === 'MULTI_SESSION') {
        if (!packageConfig.pricing.perSession || packageConfig.sessions < 2) {
          setError('Para paquetes multi-sesión debes especificar precio por sesión y al menos 2 sesiones')
          return
        }
      } else if (formData.packageType === 'WITH_MAINTENANCE') {
        if (!packageConfig.pricing.mainSession || !packageConfig.pricing.maintenancePrice) {
          setError('Debes especificar el precio de la sesión principal y las sesiones de mantenimiento')
          return
        }
      }
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const serviceData = {
        name: formData.name,
        description: formData.description,
        category: formData.category?.trim() || null,
        duration: parseInt(formData.duration),
        price: formData.isPackage ? parseFloat(formData.totalPrice) : parseFloat(formData.price),
        color: formData.color || '#3B82F6',
        preparationTime: parseInt(formData.preparationTime) || 0,
        cleanupTime: parseInt(formData.cleanupTime) || 0,
        requiresConsent: formData.requiresConsent,
        consentTemplateId: formData.requiresConsent ? formData.consentTemplateId : null,
        isActive: true,
        // 💉 Datos de paquete
        isPackage: formData.isPackage,
        packageType: formData.isPackage ? formData.packageType : 'SINGLE',
        totalPrice: formData.isPackage ? parseFloat(formData.totalPrice) : null,
        allowPartialPayment: formData.isPackage ? formData.allowPartialPayment : false,
        pricePerSession: formData.isPackage && formData.packageType === 'MULTI_SESSION' 
          ? parseFloat(packageConfig.pricing.perSession) 
          : null
      }

      // 💉 Agregar packageConfig si es paquete
      if (formData.isPackage) {
        serviceData.packageConfig = {
          sessions: formData.packageType === 'MULTI_SESSION' ? parseInt(packageConfig.sessions) : null,
          sessionInterval: formData.packageType === 'MULTI_SESSION' ? parseInt(packageConfig.sessionInterval) : null,
          maintenanceSessions: formData.packageType === 'WITH_MAINTENANCE' ? parseInt(packageConfig.maintenanceSessions) : null,
          maintenanceInterval: formData.packageType === 'WITH_MAINTENANCE' ? parseInt(packageConfig.maintenanceInterval) : null,
          description: packageConfig.description || null,
          pricing: packageConfig.pricing
        }
      }
      
      // Solo enviar images si hay cambios
      if (existingImages.length > 0) {
        serviceData.images = existingImages
      }
      
      console.log('📤 Sending service data:', serviceData)
      console.log('📤 TYPE CHECK:')
      Object.keys(serviceData).forEach(key => {
        console.log(`  ${key}:`, typeof serviceData[key], serviceData[key])
      })
      
      let savedService
      if (service?.id) {
        savedService = await businessServicesApi.updateService(businessId, service.id, serviceData)
      } else {
        savedService = await businessServicesApi.createService(businessId, serviceData)
      }
      
      // Si hay una imagen nueva, subirla después de crear/actualizar el servicio
      if (imageFile && savedService?.data?.id) {
        setIsUploadingImage(true)
        try {
          await businessServicesApi.uploadServiceImage(businessId, savedService.data.id, imageFile)
        } catch (imgError) {
          console.error('Error uploading service image:', imgError)
          // No fallar el save completo si falla la imagen
          setError('Servicio guardado pero hubo un error al subir la imagen')
        } finally {
          setIsUploadingImage(false)
        }
      }
      
      onSave()
    } catch (err) {
      console.error('Error saving service:', err)
      setError(err.message || 'Error al guardar servicio')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>
        
        {/* Modal - Más ancho para paquetes, scroll interno */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
          {/* Header - Fixed */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {service ? 'Editar Procedimiento' : 'Nuevo Procedimiento'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 -mr-2"
              type="button"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="overflow-y-auto p-6 flex-1">
            {/* Error */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Procedimiento *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Aplicación de Botox"
                required
              />
            </div>

            {/* 💉 SELECTOR DE TIPO DE SERVICIO */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="isPackage"
                  name="isPackage"
                  checked={formData.isPackage}
                  onChange={handleChange}
                  className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label htmlFor="isPackage" className="text-sm font-medium text-gray-900 cursor-pointer">
                    ¿Es un paquete de múltiples sesiones?
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Marca esta opción si este procedimiento requiere varias citas (ej: tratamientos faciales con mantenimiento)
                  </p>
                </div>
              </div>
            </div>

            {/* 💉 CONFIGURACIÓN DE PAQUETE */}
            {formData.isPackage && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-semibold text-purple-900 mb-3">Configuración del Paquete</h3>
                
                {/* Tipo de paquete */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Paquete *
                  </label>
                  <select
                    name="packageType"
                    value={formData.packageType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="SINGLE">Servicio Individual</option>
                    <option value="MULTI_SESSION">Múltiples Sesiones Iguales</option>
                    <option value="WITH_MAINTENANCE">Sesión Principal + Mantenimiento</option>
                  </select>
                  <p className="text-xs text-gray-600 mt-1">
                    {formData.packageType === 'MULTI_SESSION' && 'Varias sesiones del mismo procedimiento (ej: 5 sesiones de láser)'}
                    {formData.packageType === 'WITH_MAINTENANCE' && 'Una sesión principal seguida de sesiones de mantenimiento (ej: Hydrafacial + 6 mantenimientos)'}
                    {formData.packageType === 'SINGLE' && 'Servicio de una sola sesión'}
                  </p>
                </div>

                {/* MULTI_SESSION */}
                {formData.packageType === 'MULTI_SESSION' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número de Sesiones *
                        </label>
                        <input
                          type="number"
                          value={packageConfig.sessions}
                          onChange={(e) => handlePackageConfigChange('sessions', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min="2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Intervalo entre Sesiones (días)
                        </label>
                        <input
                          type="number"
                          value={packageConfig.sessionInterval}
                          onChange={(e) => handlePackageConfigChange('sessionInterval', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Precio por Sesión (COP) *
                        </label>
                        <input
                          type="number"
                          value={packageConfig.pricing.perSession}
                          onChange={(e) => handlePackagePricingChange('perSession', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="50000"
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descuento por Paquete (%)
                        </label>
                        <input
                          type="number"
                          value={packageConfig.pricing.discount}
                          onChange={(e) => handlePackagePricingChange('discount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min="0"
                          max="100"
                          placeholder="10"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* WITH_MAINTENANCE */}
                {formData.packageType === 'WITH_MAINTENANCE' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Precio Sesión Principal (COP) *
                        </label>
                        <input
                          type="number"
                          value={packageConfig.pricing.mainSession}
                          onChange={(e) => handlePackagePricingChange('mainSession', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="200000"
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Precio Mantenimiento (COP) *
                        </label>
                        <input
                          type="number"
                          value={packageConfig.pricing.maintenancePrice}
                          onChange={(e) => handlePackagePricingChange('maintenancePrice', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="80000"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número de Mantenimientos *
                        </label>
                        <input
                          type="number"
                          value={packageConfig.maintenanceSessions}
                          onChange={(e) => handlePackageConfigChange('maintenanceSessions', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Intervalo entre Sesiones (días)
                        </label>
                        <input
                          type="number"
                          value={packageConfig.maintenanceInterval}
                          onChange={(e) => handlePackageConfigChange('maintenanceInterval', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min="1"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Descripción del paquete */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción del Paquete
                  </label>
                  <textarea
                    value={packageConfig.description}
                    onChange={(e) => handlePackageConfigChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    rows="2"
                    placeholder="Describe brevemente en qué consiste este paquete..."
                  />
                </div>

                {/* Precio Total Calculado */}
                {formData.totalPrice && parseFloat(formData.totalPrice) > 0 && (
                  <div className="bg-white border-2 border-purple-300 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Precio Total del Paquete:</span>
                      <span className="text-2xl font-bold text-purple-600">
                        ${parseFloat(formData.totalPrice).toLocaleString('es-CO')} COP
                      </span>
                    </div>
                  </div>
                )}

                {/* Pago Parcial */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="allowPartialPayment"
                    name="allowPartialPayment"
                    checked={formData.allowPartialPayment}
                    onChange={handleChange}
                    className="mt-1 h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div>
                    <label htmlFor="allowPartialPayment" className="text-sm font-medium text-gray-900 cursor-pointer">
                      Permitir Pago Parcial
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      Permite que el cliente pague el paquete en cuotas
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Duración y Precio (solo para servicios NO paquete) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración (minutos) *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="15"
                  step="15"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">
                  {formData.isPackage ? 'Duración de cada sesión individual' : 'Duración del procedimiento'}
                </p>
              </div>

              {!formData.isPackage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio (COP) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="50000"
                    min="0"
                    required
                  />
                </div>
              )}
            </div>

            {/* Categoría con autocompletado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                list="category-suggestions"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Tratamientos Faciales, Corte de Cabello..."
              />
              <datalist id="category-suggestions">
                {existingCategories.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
              <p className="mt-1 text-xs text-gray-500">
                Selecciona una categoría existente o escribe una nueva
              </p>
            </div>

            {/* Color y Tiempos */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color (para calendario)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{formData.color}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preparación (min)
                </label>
                <input
                  type="number"
                  name="preparationTime"
                  value={formData.preparationTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="5"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-gray-500">Tiempo antes</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Limpieza (min)
                </label>
                <input
                  type="number"
                  name="cleanupTime"
                  value={formData.cleanupTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="5"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-gray-500">Tiempo después</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descripción del procedimiento..."
              />
            </div>

            {/* Imagen del procedimiento */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {existingImages.length > 0 ? 'Imágenes del Procedimiento' : 'Imagen del Procedimiento'}
              </label>
              
              {/* Mostrar imágenes existentes */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Imágenes actuales (click en X para eliminar)</p>
                  <div className="flex flex-wrap gap-3">
                    {existingImages.map((imageUrl, index) => (
                      <div key={index} className="relative inline-block">
                        <img
                          src={imageUrl}
                          alt={`Imagen ${index + 1}`}
                          className="h-32 w-32 object-cover rounded-lg border-2 border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(imageUrl)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                          title="Eliminar imagen"
                        >
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview de nueva imagen a subir */}
              {imagePreview ? (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">Nueva imagen a agregar</p>
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-lg border-2 border-blue-300"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Área para agregar nueva imagen */}
              {!imagePreview && (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <PhotoIcon className="w-10 h-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Click para subir</span> o arrastra una imagen
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG o WEBP (máx. 5MB)</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      name="serviceImage"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Consentimiento */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="requiresConsent"
                      checked={formData.requiresConsent}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Este procedimiento requiere consentimiento informado
                    </span>
                  </label>
                  <p className="ml-6 text-xs text-gray-500">
                    El cliente deberá firmar un consentimiento antes de completar la cita
                  </p>
                </div>
              </div>

              {formData.requiresConsent && (
                <div className="ml-6 mt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowConsentModal(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    {formData.consentTemplateId 
                      ? '✓ Plantilla asignada - Cambiar plantilla' 
                      : '+ Asignar plantilla de consentimiento'}
                  </button>
                  <p className="text-xs text-gray-500">
                    {formData.consentTemplateId 
                      ? 'Se usará la plantilla seleccionada para este procedimiento' 
                      : 'Sin plantilla, se usará la plantilla general del negocio'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      window.open('/business/consent-templates', '_blank');
                    }}
                    className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 underline"
                  >
                    <DocumentTextIcon className="h-3 w-3" />
                    Gestionar plantillas de consentimiento
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading || isUploadingImage}
                className="flex-1 bg-blue-600 text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base sm:text-sm min-h-[44px] sm:min-h-0"
              >
                {isLoading 
                  ? 'Guardando...' 
                  : isUploadingImage 
                    ? 'Subiendo imagen...' 
                    : service 
                      ? 'Actualizar' 
                      : 'Crear Procedimiento'}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading || isUploadingImage}
                className="px-4 py-3 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium text-base sm:text-sm min-h-[44px] sm:min-h-0"
              >
                Cancelar
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>

      {/* Consent Template Modal */}
      <ConsentTemplateModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onSelect={(templateId) => {
          setFormData(prev => ({ ...prev, consentTemplateId: templateId }))
          setShowConsentModal(false)
        }}
        businessId={businessId}
        currentTemplateId={formData.consentTemplateId}
      />
    </div>
  )
}

export default ServiceFormModal
