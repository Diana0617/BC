import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  BuildingStorefrontIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { 
  updateBasicInfo,
  completeStep,
  saveBasicInfo
} from '../../../../../../shared/src/store/slices/businessConfigurationSlice'

const BasicInfoSection = ({ isSetupMode, onComplete, isCompleted }) => {
  const dispatch = useDispatch()
  const { basicInfo, isLoading, isSaving, error } = useSelector(state => state.businessConfiguration)
  
  const [formData, setFormData] = useState({
    name: '',
    businessCode: '',
    type: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: 'Colombia',
    description: '',
    useCommissionSystem: true
  })

  const [isEditing, setIsEditing] = useState(isSetupMode)
  const [isInitialized, setIsInitialized] = useState(false)

  // Cargar datos del store al montar el componente (solo una vez)
  useEffect(() => {
    if (basicInfo && Object.keys(basicInfo).length > 0 && !isInitialized) {
      setFormData(basicInfo)
      setIsInitialized(true)
    }
  }, [basicInfo, isInitialized])

  // Generar código automáticamente basado en el nombre
  // Compatible con backend: solo letras minúsculas y números (sin guiones ni espacios)
  const generateBusinessCode = (name) => {
    if (!name || name.trim().length === 0) return ''
    
    // Remover acentos y caracteres especiales
    const cleanName = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()  // Minúsculas para compatibilidad con backend
      .replace(/[^a-z0-9]/g, '')  // Solo letras y números
      .substring(0, 6)
    
    // Generar sufijo aleatorio (4 dígitos)
    const randomSuffix = Math.floor(Math.random() * 9000 + 1000)
    
    // Sin guión, solo concatenar: ej "yani1234"
    return `${cleanName}${randomSuffix}`
  }

  // Sincronizar con Redux store en tiempo real (solo cuando el usuario está editando)
  useEffect(() => {
    if (isEditing && isInitialized) {
      dispatch(updateBasicInfo(formData))
    }
  }, [formData, dispatch, isEditing, isInitialized])

  const businessTypes = [
    { value: 'BEAUTY_SALON', label: 'Salón de Belleza' },
    { value: 'BARBERSHOP', label: 'Barbería' },
    { value: 'SPA', label: 'Spa' },
    { value: 'NAIL_SALON', label: 'Salón de Uñas' },
    { value: 'AESTHETIC_CENTER', label: 'Centro Estético' },
    { value: 'WELLNESS_CENTER', label: 'Centro de Bienestar' }
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    let updatedData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    }
    
    // Si se está editando el nombre y NO hay código aún (o estamos en setup), generar código automático
    if (name === 'name' && (!formData.businessCode || isSetupMode)) {
      updatedData.businessCode = generateBusinessCode(value)
    }
    
    setFormData(updatedData)
  }

  const handleSave = async () => {
    try {
      // Usar el AsyncThunk para guardar los datos
      const resultAction = await dispatch(saveBasicInfo({
        businessId: 'current', // TODO: Obtener businessId real
        data: formData
      }))
      
      if (saveBasicInfo.fulfilled.match(resultAction)) {
        setIsEditing(false)
        
        // Si estamos en modo setup, marcar como completado
        if (isSetupMode && onComplete) {
          dispatch(completeStep('basicInfo'))
          onComplete()
        }
      }
      
    } catch (error) {
      console.error('Error guardando datos:', error)
    }
  }

  const isFormValid = formData.name && formData.businessCode && formData.type && 
                     formData.phone && formData.email

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BuildingStorefrontIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">
            Información Básica
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

      {/* Formulario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre del negocio */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Negocio *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
            placeholder="Ingresa el nombre de tu negocio"
          />
        </div>

        {/* Código del negocio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <LockClosedIcon className="h-4 w-4 inline mr-1" />
            Código del Negocio *
          </label>
          <input
            type="text"
            name="businessCode"
            value={formData.businessCode}
            disabled={true}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            placeholder="Código único"
            title="El código del negocio no puede ser modificado por seguridad"
          />
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            <LockClosedIcon className="h-3 w-3 mr-1" />
            Este código no puede ser modificado por razones de seguridad
          </p>
        </div>

        {/* Tipo de negocio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Negocio *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          >
            <option value="">Selecciona el tipo</option>
            {businessTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <PhoneIcon className="h-4 w-4 inline mr-1" />
            Teléfono *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
            placeholder="+57 300 123 4567"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <EnvelopeIcon className="h-4 w-4 inline mr-1" />
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
            placeholder="contacto@negocio.com"
          />
        </div>

        {/* Dirección */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPinIcon className="h-4 w-4 inline mr-1" />
            Dirección
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
            placeholder="Calle, número, barrio"
          />
        </div>

        {/* Ciudad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ciudad
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
            placeholder="Ciudad"
          />
        </div>

        {/* País */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            País
          </label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción del Negocio
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            disabled={!isEditing}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
            placeholder="Describe tu negocio y los servicios que ofreces..."
          />
        </div>

        {/* Sistema de Comisiones */}
        <div className="md:col-span-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="useCommissionSystem"
                id="useCommissionSystem"
                checked={formData.useCommissionSystem}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <div className="flex-1">
                <label 
                  htmlFor="useCommissionSystem" 
                  className="block text-sm font-medium text-gray-900 cursor-pointer"
                >
                  💰 Usar sistema de comisiones para especialistas
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  {formData.useCommissionSystem 
                    ? 'Los especialistas recibirán un porcentaje de comisión por cada servicio realizado.'
                    : 'Los especialistas recibirán un sueldo fijo (sin comisiones por servicios).'}
                </p>
                {formData.useCommissionSystem && (
                  <p className="text-xs text-blue-700 mt-2 font-medium">
                    ℹ️ Podrás configurar el porcentaje de comisión individual para cada especialista
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      {isEditing && (
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </div>
            ) : (
              'Guardar Información'
            )}
          </button>
          
          {!isSetupMode && (
            <button
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
          )}
        </div>
      )}

      {/* Mensajes de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            Error: {error}
          </p>
        </div>
      )}

      {/* Loading inicial */}
      {isLoading && !isSaving && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando información...</p>
        </div>
      )}

      {/* Mensaje de ayuda en modo setup */}
      {isSetupMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Paso 1 de la configuración:</strong> Completa la información básica de tu negocio. 
            Estos datos aparecerán en tus facturas y comunicaciones con clientes.
          </p>
        </div>
      )}
    </div>
  )
}

export default BasicInfoSection