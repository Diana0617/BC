import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOwnerPlans } from '@shared/store/slices/ownerPlansSlice'
import { createBusinessManually } from '@shared/store/slices/ownerBusinessSlice'
import BillingCycleSelector from '../subscription/BillingCycleSelector'

const CreateManualSubscriptionModal = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const { plans, loading: plansLoading } = useSelector(state => state.ownerPlans)
  
  const [formData, setFormData] = useState({
    // Datos del negocio
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessCode: '',
    address: '',
    city: '',
    country: 'Colombia',
    
    // Datos del propietario
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerPassword: '',
    
    // Suscripción
    subscriptionPlanId: '',
    billingCycle: 'MONTHLY', // MONTHLY o ANNUAL
    isLifetime: false, // Acceso ilimitado para desarrollo/testing
  })
  
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [subdomainStatus, setSubdomainStatus] = useState({ 
    checking: false, 
    available: null, 
    message: '' 
  })

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchOwnerPlans())
    }
  }, [isOpen, dispatch])

  // Función para verificar disponibilidad del subdominio
  const checkSubdomainAvailability = useCallback(async (subdomain) => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainStatus({ checking: false, available: null, message: '' })
      return
    }

    setSubdomainStatus({ checking: true, available: null, message: 'Verificando...' })

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://beautycontrol-api.azurewebsites.net'
      const response = await fetch(`${API_BASE_URL}/api/auth/check-subdomain/${subdomain}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Respuesta no válida')
      }
      
      const data = await response.json()

      if (data.success) {
        if (data.data.available) {
          setSubdomainStatus({ 
            checking: false, 
            available: true, 
            message: '✓ Disponible' 
          })
          // Limpiar error si existía
          if (errors.businessCode) {
            setErrors(prev => ({ ...prev, businessCode: '' }))
          }
        } else {
          setSubdomainStatus({ 
            checking: false, 
            available: false, 
            message: '✗ No disponible' 
          })
          setErrors(prev => ({ ...prev, businessCode: 'Este código ya está en uso' }))
        }
      } else {
        setSubdomainStatus({ 
          checking: false, 
          available: false, 
          message: 'Error al verificar' 
        })
      }
    } catch (error) {
      console.error('Error verificando subdomain:', error)
      setSubdomainStatus({ 
        checking: false, 
        available: null, 
        message: 'Error de conexión' 
      })
    }
  }, [errors.businessCode])

  // Debounce para verificar subdominio
  useEffect(() => {
    if (formData.businessCode && isOpen) {
      const timeoutId = setTimeout(() => {
        checkSubdomainAvailability(formData.businessCode)
      }, 500) // Esperar 500ms después de que el usuario deje de escribir

      return () => clearTimeout(timeoutId)
    } else {
      setSubdomainStatus({ checking: false, available: null, message: '' })
    }
  }, [formData.businessCode, isOpen, checkSubdomainAvailability])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Si es el businessCode, normalizarlo a minúsculas y sin espacios
    let finalValue = value
    if (name === 'businessCode') {
      finalValue = value.toLowerCase().replace(/[^a-z0-9]/g, '')
    }
    
    setFormData(prev => ({ ...prev, [name]: finalValue }))
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Validar negocio
    if (!formData.businessName.trim()) newErrors.businessName = 'Nombre del negocio requerido'
    if (!formData.businessEmail.trim()) newErrors.businessEmail = 'Email del negocio requerido'
    if (!formData.businessPhone.trim()) newErrors.businessPhone = 'Teléfono del negocio requerido'
    if (!formData.businessCode.trim()) {
      newErrors.businessCode = 'Código del negocio requerido'
    } else if (!/^[a-z0-9]+$/.test(formData.businessCode)) {
      newErrors.businessCode = 'Solo letras minúsculas y números, sin espacios'
    } else if (subdomainStatus.available === false) {
      newErrors.businessCode = 'Este código ya está en uso'
    } else if (subdomainStatus.available === null) {
      newErrors.businessCode = 'Verifica la disponibilidad del código'
    }
    
    // Validar propietario
    if (!formData.ownerFirstName.trim()) newErrors.ownerFirstName = 'Nombre requerido'
    if (!formData.ownerLastName.trim()) newErrors.ownerLastName = 'Apellido requerido'
    if (!formData.ownerEmail.trim()) newErrors.ownerEmail = 'Email requerido'
    if (!formData.ownerPassword || formData.ownerPassword.length < 6) {
      newErrors.ownerPassword = 'Contraseña debe tener al menos 6 caracteres'
    }
    
    // Validar plan
    if (!formData.subscriptionPlanId) newErrors.subscriptionPlanId = 'Selecciona un plan'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setSubmitting(true)
    
    try {
      const result = await dispatch(createBusinessManually(formData))
      
      if (createBusinessManually.fulfilled.match(result)) {
        alert('✅ Suscripción creada exitosamente con pago efectivo')
        onSuccess?.()
        onClose()
        // Resetear formulario
        setFormData({
          businessName: '',
          businessEmail: '',
          businessPhone: '',
          businessCode: '',
          address: '',
          city: '',
          country: 'Colombia',
          ownerFirstName: '',
          ownerLastName: '',
          ownerEmail: '',
          ownerPhone: '',
          ownerPassword: '',
          subscriptionPlanId: '',
          billingCycle: 'MONTHLY',
          isLifetime: false,
        })
        setSubdomainStatus({ checking: false, available: null, message: '' })
        setErrors({})
      } else {
        throw new Error(result.payload || 'Error al crear suscripción')
      }
    } catch (error) {
      alert('❌ Error: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  const selectedPlanData = plans?.find(p => p.id === parseInt(formData.subscriptionPlanId))

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Crear Suscripción Manual</h2>
            <p className="text-sm text-gray-600 mt-1">Pago efectivo - Sin Wompi</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={submitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Datos del Negocio */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Datos del Negocio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Negocio *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 ${errors.businessName ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={submitting}
                />
                {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email del Negocio *
                </label>
                <input
                  type="email"
                  name="businessEmail"
                  value={formData.businessEmail}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 ${errors.businessEmail ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={submitting}
                />
                {errors.businessEmail && <p className="text-red-500 text-xs mt-1">{errors.businessEmail}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono del Negocio *
                </label>
                <input
                  type="tel"
                  name="businessPhone"
                  value={formData.businessPhone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 ${errors.businessPhone ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={submitting}
                />
                {errors.businessPhone && <p className="text-red-500 text-xs mt-1">{errors.businessPhone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código del Negocio (Subdominio) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="businessCode"
                    value={formData.businessCode}
                    onChange={handleChange}
                    placeholder="ejemplo: salonmaria"
                    className={`w-full px-3 py-2 pr-10 border rounded-md focus:ring-2 focus:ring-pink-500 ${
                      errors.businessCode 
                        ? 'border-red-500' 
                        : subdomainStatus.available === true 
                          ? 'border-green-500' 
                          : subdomainStatus.available === false 
                            ? 'border-red-500' 
                            : 'border-gray-300'
                    }`}
                    disabled={submitting}
                  />
                  {/* Icono de estado */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {subdomainStatus.checking ? (
                      <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : subdomainStatus.available === true ? (
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : subdomainStatus.available === false ? (
                      <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : null}
                  </div>
                </div>
                {/* Mensajes de estado */}
                {errors.businessCode && (
                  <p className="text-red-500 text-xs mt-1">{errors.businessCode}</p>
                )}
                {!errors.businessCode && subdomainStatus.message && (
                  <p className={`text-xs mt-1 ${
                    subdomainStatus.available === true 
                      ? 'text-green-600' 
                      : subdomainStatus.available === false 
                        ? 'text-red-600' 
                        : 'text-gray-500'
                  }`}>
                    {subdomainStatus.message}
                  </p>
                )}
                {!errors.businessCode && !subdomainStatus.message && (
                  <p className="text-xs text-gray-500 mt-1">Solo letras minúsculas y números, sin espacios</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  País
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          {/* Datos del Propietario */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Datos del Propietario
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="ownerFirstName"
                  value={formData.ownerFirstName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${errors.ownerFirstName ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={submitting}
                />
                {errors.ownerFirstName && <p className="text-red-500 text-xs mt-1">{errors.ownerFirstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido *
                </label>
                <input
                  type="text"
                  name="ownerLastName"
                  value={formData.ownerLastName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${errors.ownerLastName ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={submitting}
                />
                {errors.ownerLastName && <p className="text-red-500 text-xs mt-1">{errors.ownerLastName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${errors.ownerEmail ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={submitting}
                />
                {errors.ownerEmail && <p className="text-red-500 text-xs mt-1">{errors.ownerEmail}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña *
                </label>
                <input
                  type="password"
                  name="ownerPassword"
                  value={formData.ownerPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${errors.ownerPassword ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={submitting}
                  placeholder="Mínimo 6 caracteres"
                />
                {errors.ownerPassword && <p className="text-red-500 text-xs mt-1">{errors.ownerPassword}</p>}
              </div>
            </div>
          </div>

          {/* Selección de Plan */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Plan de Suscripción
            </h3>
            
            {/* LIFETIME Checkbox - Solo para Owner */}
            <div className="mb-4 p-3 bg-purple-50 border-2 border-purple-200 rounded-lg">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  name="isLifetime"
                  checked={formData.isLifetime}
                  onChange={(e) => setFormData(prev => ({ ...prev, isLifetime: e.target.checked }))}
                  disabled={submitting}
                  className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <span className="text-sm font-semibold text-purple-900">
                    🌟 Negocio de Desarrollo/Testing (LIFETIME)
                  </span>
                  <p className="text-xs text-purple-700 mt-1">
                    Otorga acceso ilimitado permanente sin restricciones de suscripción. 
                    <strong className="block mt-1">⚠️ Solo para negocios de desarrollo, testing o modelos de actualización.</strong>
                  </p>
                </div>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seleccionar Plan *
              </label>
              {formData.isLifetime && (
                <div className="mb-2 p-2 bg-purple-100 border border-purple-300 rounded text-xs text-purple-800">
                  ℹ️ Con acceso LIFETIME activado, el plan seleccionado es solo informativo. El negocio tendrá acceso ilimitado.
                </div>
              )}
              <select
                name="subscriptionPlanId"
                value={formData.subscriptionPlanId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 ${errors.subscriptionPlanId ? 'border-red-500' : 'border-gray-300'}`}
                disabled={submitting || plansLoading}
              >
                <option value="">-- Selecciona un plan --</option>
                {plans?.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - ${(plan.monthlyPrice || plan.price).toLocaleString()} / mes
                  </option>
                ))}
              </select>
              {errors.subscriptionPlanId && <p className="text-red-500 text-xs mt-1">{errors.subscriptionPlanId}</p>}
              
              {selectedPlanData && (
                <>
                  <div className="mt-3 p-3 bg-white border border-green-200 rounded-md">
                    <p className="text-sm font-medium text-gray-700">Plan seleccionado:</p>
                    <p className="text-lg font-bold text-green-600">{selectedPlanData.name}</p>
                    <p className="text-sm text-gray-600">{selectedPlanData.description}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-2">
                      Precio mensual: ${(selectedPlanData.monthlyPrice || selectedPlanData.price).toLocaleString()} COP
                    </p>
                  </div>
                  
                  {/* Billing Cycle Selector */}
                  <div className="mt-4">
                    <BillingCycleSelector
                      plan={selectedPlanData}
                      selectedCycle={formData.billingCycle}
                      onCycleChange={(cycle) => setFormData(prev => ({ ...prev, billingCycle: cycle }))}
                      disabled={submitting}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Información de Pago */}
          <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-semibold text-yellow-800">Pago Efectivo</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Esta suscripción se creará con método de pago <strong>EFECTIVO</strong>. 
                  El negocio tendrá acceso inmediato y podrá realizar el pago posteriormente.
                </p>
                <p className="text-xs text-yellow-600 mt-2">
                  💡 El vencimiento se calculará automáticamente según el plan seleccionado.
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || plansLoading}
              className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 disabled:opacity-50 flex items-center"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando...
                </>
              ) : (
                '✓ Crear Suscripción'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateManualSubscriptionModal
