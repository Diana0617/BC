import React, { useState, useEffect, useCallback } from 'react'
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import './PhoneInput.css'

const BusinessRegistration = ({ selectedPlan, billingCycle = 'MONTHLY', invitationToken, onComplete, onBack }) => {
  const [formData, setFormData] = useState({
    // Business information
    businessName: '',
    businessCode: '', // Subdominio
    businessType: 'BEAUTY_SALON',
    businessPhone: '',
    businessEmail: '',
    address: '',
    city: '', // Region/State from country-region-selector
    country: '',
    
    // Owner/Admin user information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Legal
    acceptTerms: false,
    acceptPrivacy: false,
    acceptMarketing: false
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [subdomainStatus, setSubdomainStatus] = useState({ checking: false, available: null, message: '' })

  // Función para generar subdominio automáticamente
  const generateSubdomain = (businessName) => {
    return businessName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Remover guiones múltiples
      .replace(/^-|-$/g, '') // Remover guiones al inicio y final
      .substring(0, 20) // Limitar longitud
  }

  // Función para verificar disponibilidad del subdominio
  const checkSubdomainAvailability = useCallback(async (subdomain) => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainStatus({ checking: false, available: null, message: '' })
      return
    }

    setSubdomainStatus({ checking: true, available: null, message: 'Verificando...' })

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_BASE_URL}/api/auth/check-subdomain/${subdomain}`)
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      // Verificar que el contenido es JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('La respuesta no es JSON válido')
      }
      
      const data = await response.json()

      if (data.success) {
        if (data.data.available) {
          setSubdomainStatus({ 
            checking: false, 
            available: true, 
            message: '✓ Subdominio disponible' 
          })
          // Limpiar error si existía
          if (errors.businessCode) {
            setErrors(prev => ({ ...prev, businessCode: null }))
          }
        } else {
          setSubdomainStatus({ 
            checking: false, 
            available: false, 
            message: '✗ Subdominio no disponible' 
          })
        }
      } else {
        setSubdomainStatus({ 
          checking: false, 
          available: false, 
          message: 'Error al verificar' 
        })
      }
    } catch (error) {
      console.error('Error checking subdomain:', error)
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error de conexión'
      if (error.message.includes('HTTP 404')) {
        errorMessage = 'Endpoint no encontrado'
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Servidor no disponible'
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Error del servidor'
      }
      
      setSubdomainStatus({ 
        checking: false, 
        available: null, 
        message: errorMessage 
      })
    }
  }, [errors.businessCode])

  const businessTypes = [
    { value: 'BEAUTY_SALON', label: 'Salón de Belleza' },
    { value: 'BARBERSHOP', label: 'Barbería' },
    { value: 'SPA', label: 'Spa' },
    { value: 'NAIL_SALON', label: 'Salón de Uñas' },
    { value: 'AESTHETIC_CENTER', label: 'Centro Estético' },
    { value: 'PET_CENTER', label: 'Centro de Cuidado de Mascotas' }
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    let newValue = type === 'checkbox' ? checked : value
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: newValue
      }
      
      // Auto-generar subdominio cuando cambia el nombre del negocio
      if (name === 'businessName' && newValue) {
        updated.businessCode = generateSubdomain(newValue)
      }
      
      // Normalizar businessCode a lowercase si se edita manualmente
      if (name === 'businessCode' && typeof newValue === 'string') {
        updated.businessCode = newValue
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '') // Solo permitir letras minúsculas, números y guiones
          .replace(/-+/g, '-') // Remover guiones múltiples
          .replace(/^-|-$/g, '') // Remover guiones al inicio y final
      }
      
      return updated
    })
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  // Debounce para verificar subdominio
  useEffect(() => {
    if (formData.businessCode) {
      const timeoutId = setTimeout(() => {
        checkSubdomainAvailability(formData.businessCode)
      }, 500) // Esperar 500ms después de que el usuario deje de escribir

      return () => clearTimeout(timeoutId)
    } else {
      setSubdomainStatus({ checking: false, available: null, message: '' })
    }
  }, [formData.businessCode, checkSubdomainAvailability])

  const validateForm = () => {
    const newErrors = {}

    // Business validation
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'El nombre del negocio es requerido'
    }
    if (!formData.businessCode.trim()) {
      newErrors.businessCode = 'El subdominio es requerido'
    } else if (!/^[a-z0-9-]+$/.test(formData.businessCode)) {
      newErrors.businessCode = 'El subdominio solo puede contener letras, números y guiones'
    } else if (formData.businessCode.length < 3) {
      newErrors.businessCode = 'El subdominio debe tener al menos 3 caracteres'
    } else if (subdomainStatus.available === false) {
      newErrors.businessCode = 'Este subdominio no está disponible'
    }
    if (!formData.businessEmail.trim()) {
      newErrors.businessEmail = 'El email del negocio es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.businessEmail)) {
      newErrors.businessEmail = 'Email inválido'
    }
    if (!formData.businessPhone.trim()) {
      newErrors.businessPhone = 'El teléfono del negocio es requerido'
    }
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida'
    }
    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad/región es requerida'
    }
    if (!formData.country.trim()) {
      newErrors.country = 'El país es requerido'
    }

    // User validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido'
    }
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    // Legal validation
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Debes aceptar los términos y condiciones'
    }
    if (!formData.acceptPrivacy) {
      newErrors.acceptPrivacy = 'Debes aceptar la política de privacidad'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      onComplete(formData)
    }
  }

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency || 'COP'
    }).format(price)
  }

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4 bg-gradient-to-r from-cyan-400 via-yellow-400 to-red-400 bg-clip-text text-transparent drop-shadow-lg">
          Información de tu salón
        </h1>
        <p className="text-sm sm:text-base text-gray-700">
          Completa la información para crear tu cuenta y comenzar tu suscripción
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Business Information */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-plan-lg border-2 border-cyan-400 p-4 sm:p-8">
              <h3 className="text-lg font-bold text-cyan-600 mb-6">
                Información del Negocio
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Negocio *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                      errors.businessName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Salón Bella Vista"
                  />
                  {errors.businessName && (
                    <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subdominio *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="businessCode"
                      value={formData.businessCode}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 pr-32 ${
                        errors.businessCode 
                          ? 'border-red-500' 
                          : subdomainStatus.available === true
                          ? 'border-green-500'
                          : subdomainStatus.available === false
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="mi-salon"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 text-sm">.controldenegocios.com</span>
                    </div>
                    {subdomainStatus.checking && (
                      <div className="absolute inset-y-0 right-36 flex items-center pr-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
                      </div>
                    )}
                  </div>
                  {errors.businessCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.businessCode}</p>
                  )}
                  {subdomainStatus.message && !errors.businessCode && (
                    <p className={`text-sm mt-1 ${
                      subdomainStatus.available === true 
                        ? 'text-green-600' 
                        : subdomainStatus.available === false
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}>
                      {subdomainStatus.message}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Tu URL será: {formData.businessCode || 'mi-salon'}.controldenegocios.com
                  </p>
                </div>
              </div>

              <div className="mt-4 sm:mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Negocio
                </label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  {businessTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email del Negocio *
                  </label>
                  <input
                    type="email"
                    name="businessEmail"
                    value={formData.businessEmail}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                      errors.businessEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="contacto@salon.com"
                  />
                  {errors.businessEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.businessEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono del Negocio *
                  </label>
                  <PhoneInput
                    international
                    defaultCountry="CO"
                    value={formData.businessPhone}
                    onChange={(value) => setFormData(prev => ({ ...prev, businessPhone: value || '' }))}
                    className={`phone-input-custom ${
                      errors.businessPhone ? 'border-red-500' : ''
                    }`}
                    placeholder="+57 300 123 4567"
                  />
                  {errors.businessPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.businessPhone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Calle 123 #45-67"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País *
                  </label>
                  <CountryDropdown
                    value={formData.country}
                    onChange={(val) => setFormData(prev => ({ ...prev, country: val, city: '' }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                      errors.country ? 'border-red-500' : 'border-gray-300'
                    }`}
                    priorityOptions={['CO', 'US', 'MX', 'ES']}
                    defaultOptionLabel="Selecciona un país"
                  />
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad/Región *
                  </label>
                  <RegionDropdown
                    country={formData.country}
                    value={formData.city}
                    onChange={(val) => setFormData(prev => ({ ...prev, city: val }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    blankOptionLabel="Selecciona una ciudad"
                    defaultOptionLabel="Selecciona una ciudad"
                    disabled={!formData.country}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>
              </div>
            </div>

            {/* User Information */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-plan-lg border-2 border-yellow-400 p-4 sm:p-8">
              <h3 className="text-lg font-bold text-yellow-600 mb-3">
                Tu Información Personal
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Estos serán tus datos para iniciar sesión en la plataforma. Recuerda bien tu email y contraseña.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Tu nombre"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Tu apellido"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tu Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="tu@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tu Teléfono *
                  </label>
                  <PhoneInput
                    international
                    defaultCountry="CO"
                    value={formData.phone}
                    onChange={(value) => setFormData(prev => ({ ...prev, phone: value || '' }))}
                    className={`phone-input-custom ${
                      errors.phone ? 'border-red-500' : ''
                    }`}
                    placeholder="+57 300 123 4567"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Mínimo 8 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Repite tu contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Legal */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-plan-lg border-2 border-red-400 p-4 sm:p-8">
              <h3 className="text-lg font-bold text-red-500 mb-6">
                Términos y Condiciones
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <div className="ml-3">
                    <label className="text-sm text-gray-700">
                      Acepto los{' '}
                      <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-500 underline">
                        términos y condiciones
                      </a>{' '}
                      de uso del servicio *
                    </label>
                    {errors.acceptTerms && (
                      <p className="text-red-500 text-xs mt-1">{errors.acceptTerms}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="acceptPrivacy"
                    checked={formData.acceptPrivacy}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <div className="ml-3">
                    <label className="text-sm text-gray-700">
                      Acepto la{' '}
                      <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-500 underline">
                        política de privacidad
                      </a>{' '}
                      y el tratamiento de mis datos *
                    </label>
                    {errors.acceptPrivacy && (
                      <p className="text-red-500 text-xs mt-1">{errors.acceptPrivacy}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="acceptMarketing"
                    checked={formData.acceptMarketing}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <div className="ml-3">
                    <label className="text-sm text-gray-700">
                      Quiero recibir ofertas especiales y novedades por email (opcional)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 border-2 border-cyan-400 rounded-xl text-cyan-600 hover:bg-cyan-50 font-semibold"
              >
                ← Volver a planes
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-yellow-400 text-gray-900 rounded-xl hover:bg-yellow-500 font-bold border-2 border-yellow-400"
              >
                Continuar al pago
              </button>
            </div>
          </form>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1 mt-6 lg:mt-0">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-plan-lg border-2 border-yellow-400 p-4 sm:p-8 sticky top-6">
            <h3 className="text-lg font-bold text-yellow-600 mb-4">
              Resumen del Pedido
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan seleccionado:</span>
                <span className="font-medium">{selectedPlan?.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Ciclo de facturación:</span>
                <span className="font-medium">
                  {billingCycle === 'MONTHLY' ? 'Mensual' : 'Anual'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {billingCycle === 'MONTHLY' ? 'Precio mensual:' : 'Precio anual:'}
                </span>
                <span className="font-medium">
                  {formatPrice(
                    billingCycle === 'MONTHLY' 
                      ? (selectedPlan?.monthlyPrice || selectedPlan?.price)
                      : (selectedPlan?.annualPrice || selectedPlan?.monthlyPrice * 12 || selectedPlan?.price * 12),
                    selectedPlan?.currency
                  )}
                </span>
              </div>
              
              {billingCycle === 'ANNUAL' && selectedPlan?.annualDiscountPercent > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Ahorro anual:</span>
                  <span className="font-medium">{selectedPlan.annualDiscountPercent}%</span>
                </div>
              )}
              
              {selectedPlan?.trialDays > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Prueba gratuita:</span>
                  <span className="font-medium">{selectedPlan.trialDays} días</span>
                </div>
              )}
              
              {/* Módulos incluidos */}
              {selectedPlan?.modules && selectedPlan.modules.length > 0 && (
                <>
                  <hr className="border-gray-200" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      📦 Módulos Incluidos
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedPlan.modules.map((module, index) => {
                        const isIncluded = module.isIncluded || 
                                         module.included || 
                                         module.PlanModule?.isIncluded || 
                                         false
                        
                        return isIncluded ? (
                          <div key={index} className="flex items-start space-x-2">
                            <span className="text-green-500 text-sm">✓</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {module.displayName || module.name}
                              </p>
                              {module.description && (
                                <p className="text-xs text-gray-500 truncate">
                                  {module.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                </>
              )}
              
              <hr className="border-gray-200" />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total hoy:</span>
                <span className="text-green-600">$0 COP</span>
              </div>
              
              {selectedPlan?.trialDays > 0 && (
                <p className="text-sm text-gray-500">
                  Tu primer cobro será el {new Date(Date.now() + selectedPlan.trialDays * 24 * 60 * 60 * 1000).toLocaleDateString('es-CO')}
                </p>
              )}
            </div>

            {invitationToken && (
              <div className="mt-6 p-3 bg-pink-50 border border-pink-200 rounded">
                <p className="text-pink-800 text-sm font-medium">
                  🎉 Invitación especial
                </p>
                <p className="text-pink-600 text-xs mt-1">
                  Condiciones preferenciales aplicadas
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusinessRegistration