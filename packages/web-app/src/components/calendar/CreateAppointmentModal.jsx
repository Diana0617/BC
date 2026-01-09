import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  UserPlusIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  UserCircleIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

/**
 * CreateAppointmentModal - Modal para crear una nueva cita
 * 
 * @param {Boolean} isOpen - Si el modal está abierto
 * @param {Function} onClose - Callback para cerrar el modal
 * @param {Function} onCreate - Callback para crear la cita
 * @param {Object} initialData - Datos iniciales (fecha preseleccionada, etc.)
 * @param {Array} branches - Lista de sucursales
 * @param {Array} specialists - Lista de especialistas
 * @param {Array} services - Lista de servicios
 */
const CreateAppointmentModal = ({
  isOpen,
  onClose,
  onCreate,
  initialData = {},
  branches = [],
  specialists = [],
  services = []
}) => {
  // Redux state
  const business = useSelector(state => state.business?.currentBusiness)
  const token = useSelector(state => state.auth?.token)
  const user = useSelector(state => state.auth?.user)
  const businessId = business?.id
  
  // Si es BUSINESS_SPECIALIST, él mismo es el especialista
  const isBusinessSpecialist = user?.role === 'BUSINESS_SPECIALIST'
  const autoSpecialistId = isBusinessSpecialist ? user?.id : null
  
  const [formData, setFormData] = useState({
    // Datos del cliente
    clientId: null, // ID si es cliente existente
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    
    // Datos de la cita
    branchId: initialData.branchId || '',
    specialistId: initialData.specialistId || autoSpecialistId || '',
    serviceId: '',
    date: initialData.date || new Date().toISOString().split('T')[0],
    startTime: initialData.startTime || '09:00',
    endTime: initialData.endTime || '10:00',
    
    // Otros
    notes: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Estados para búsqueda de clientes
  const [clientSearch, setClientSearch] = useState('')
  const [searchingClient, setSearchingClient] = useState(false)
  const [clientResults, setClientResults] = useState([])
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [isNewClient, setIsNewClient] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState(null)

  // Estados para filtrado de servicios
  const [filteredServices, setFilteredServices] = useState(services)
  const [loadingSpecialistServices, setLoadingSpecialistServices] = useState(false)

  // Resetear form cuando se abre/cierra
  useEffect(() => {
    if (isOpen) {
      setFormData({
        clientId: null,
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        branchId: initialData.branchId || '',
        specialistId: initialData.specialistId || autoSpecialistId || '',
        serviceId: '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        startTime: initialData.startTime || '09:00',
        endTime: initialData.endTime || '10:00',
        notes: ''
      })
      setClientSearch('')
      setClientResults([])
      setShowClientDropdown(false)
      setIsNewClient(false)
      setErrors({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Auto-calcular endTime cuando cambia servicio
  useEffect(() => {
    const selectedService = filteredServices.find(s => s.id === formData.serviceId)
    if (selectedService && selectedService.duration && formData.startTime) {
      const [hours, minutes] = formData.startTime.split(':').map(Number)
      const startMinutes = hours * 60 + minutes
      const endMinutes = startMinutes + selectedService.duration
      const endHours = Math.floor(endMinutes / 60)
      const endMins = endMinutes % 60
      setFormData(prev => ({
        ...prev,
        endTime: `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`
      }))
    }
  }, [formData.serviceId, formData.startTime, filteredServices])

  /**
   * Cargar servicios de un especialista específico
   */
  const loadSpecialistServices = useCallback(async (specialistId) => {
    try {
      setLoadingSpecialistServices(true)
      
      const response = await fetch(
        `/api/business/${businessId}/specialists/${specialistId}/services`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log('🔧 [WEB] Specialist services loaded:', data.data?.length || 0)
        console.log('🔧 [WEB] First service structure:', data.data?.[0])
        
        // Filtrar solo servicios activos
        const activeServices = (data.data || []).filter(ss => ss.isActive)
        
        // Mapear a formato compatible con el dropdown de servicios
        // El backend retorna la relación con el objeto 'service' anidado
        const mappedServices = activeServices.map(ss => ({
          id: ss.serviceId,
          name: ss.service?.name || ss.serviceName || ss.name || 'Servicio sin nombre',
          duration: ss.service?.duration || ss.duration,
          price: ss.customPrice !== null && ss.customPrice !== undefined 
            ? ss.customPrice 
            : (ss.service?.price || ss.price)
        }))
        
        setFilteredServices(mappedServices)
        
        // Si el servicio actualmente seleccionado no está en la lista, limpiarlo
        if (formData.serviceId && !mappedServices.find(s => s.id === formData.serviceId)) {
          setFormData(prev => ({ ...prev, serviceId: '' }))
        }
      }
    } catch (error) {
      console.error('❌ [WEB] Error loading specialist services:', error)
      setFilteredServices(services) // Fallback a todos los servicios
    } finally {
      setLoadingSpecialistServices(false)
    }
  }, [businessId, token, services, formData.serviceId])

  // Cargar servicios del especialista cuando cambie
  useEffect(() => {
    if (formData.specialistId && businessId && token) {
      loadSpecialistServices(formData.specialistId)
    } else {
      // Si no hay especialista, mostrar todos los servicios
      setFilteredServices(services)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.specialistId, businessId, token, services])

  /**
   * Buscar clientes en el backend
   */
  const searchClients = async (searchTerm) => {
    console.log('🔍 [WEB] searchClients called with:', searchTerm)
    console.log('🏢 [WEB] businessId:', businessId)
    console.log('🔑 [WEB] token:', token ? 'exists' : 'missing')
    
    if (!searchTerm || searchTerm.trim().length < 2) {
      console.log('⚠️ [WEB] Search term too short')
      setClientResults([])
      setShowClientDropdown(false)
      return
    }

    if (!businessId) {
      console.error('❌ [WEB] No businessId available')
      return
    }

    if (!token) {
      console.error('❌ [WEB] No token available')
      return
    }

    try {
      setSearchingClient(true)
      
      console.log('📞 [WEB] Calling API:', `/api/business/${businessId}/clients/search?q=${searchTerm}`)
      
      const response = await fetch(
        `/api/business/${businessId}/clients/search?q=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('📡 [WEB] Response status:', response.status)
      console.log('📄 [WEB] Response headers:', response.headers.get('content-type'))

      if (response.ok) {
        const responseText = await response.text()
        console.log('📝 [WEB] Response text (first 200 chars):', responseText.substring(0, 200))
        
        try {
          const data = JSON.parse(responseText)
          console.log('📊 [WEB] Results:', data.data?.length || 0, 'clients found')
          console.log('📋 [WEB] Data:', data.data)
          setClientResults(data.data || [])
          setShowClientDropdown(true)
          console.log('✅ [WEB] Dropdown should be visible now')
        } catch (parseError) {
          console.error('❌ [WEB] JSON Parse Error:', parseError)
          console.error('📄 [WEB] Response was:', responseText.substring(0, 500))
        }
      } else {
        console.error('❌ [WEB] Response not OK:', response.status)
      }
    } catch (error) {
      console.error('❌ [WEB] Error searching clients:', error)
      setClientResults([])
    } finally {
      setSearchingClient(false)
    }
  }

  /**
   * Manejar cambio en el input de búsqueda con debounce
   */
  const handleClientSearchChange = (e) => {
    const value = e.target.value
    console.log('⌨️ [WEB] Input changed:', value)
    setClientSearch(value)

    // Limpiar timeout anterior
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // Si el cliente ya estaba seleccionado, limpiarlo
    if (formData.clientId) {
      setFormData(prev => ({
        ...prev,
        clientId: null,
        clientName: '',
        clientPhone: '',
        clientEmail: ''
      }))
      setIsNewClient(false)
    }

    // Buscar después de 500ms
    if (value.trim().length >= 2) {
      console.log('⏳ [WEB] Setting timeout for search...')
      const timeout = setTimeout(() => {
        searchClients(value)
      }, 500)
      setSearchTimeout(timeout)
    } else {
      setClientResults([])
      setShowClientDropdown(false)
    }
  }

  /**
   * Seleccionar cliente de los resultados
   */
  const selectClient = (client) => {
    setFormData(prev => ({
      ...prev,
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      clientEmail: client.email || ''
    }))
    setClientSearch(client.name)
    setShowClientDropdown(false)
    setIsNewClient(false)
    
    // Limpiar errores
    setErrors(prev => ({
      ...prev,
      clientName: '',
      clientPhone: ''
    }))
  }

  /**
   * Crear nuevo cliente
   */
  const handleCreateNewClient = () => {
    setFormData(prev => ({
      ...prev,
      clientId: null,
      clientName: clientSearch.trim(),
      clientPhone: '',
      clientEmail: ''
    }))
    setShowClientDropdown(false)
    setIsNewClient(true)
  }

  /**
   * Limpiar búsqueda
   */
  const clearClientSearch = () => {
    setClientSearch('')
    setClientResults([])
    setShowClientDropdown(false)
    setFormData(prev => ({
      ...prev,
      clientId: null,
      clientName: '',
      clientPhone: '',
      clientEmail: ''
    }))
    setIsNewClient(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Nombre del cliente es requerido'
    }

    if (!formData.clientPhone.trim()) {
      newErrors.clientPhone = 'Teléfono es requerido'
    }

    if (!formData.branchId) {
      newErrors.branchId = 'Sucursal es requerida'
    }

    if (!formData.specialistId) {
      newErrors.specialistId = 'Especialista es requerido'
    }

    if (!formData.serviceId) {
      newErrors.serviceId = 'Servicio es requerido'
    }

    if (!formData.date) {
      newErrors.date = 'Fecha es requerida'
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Hora de inicio es requerida'
    }

    if (!formData.endTime) {
      newErrors.endTime = 'Hora de fin es requerida'
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'Hora de fin debe ser posterior a hora de inicio'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onCreate(formData)
      onClose()
    } catch (error) {
      console.error('Error creando cita:', error)
      alert('Error al crear la cita. Por favor intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <CalendarIcon className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Nueva Cita</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {/* Datos del Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
              Datos del Cliente
            </h3>

            {/* Búsqueda de Cliente */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar cliente
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={clientSearch}
                  onChange={handleClientSearchChange}
                  placeholder="Buscar por nombre o teléfono..."
                  className="w-full border border-gray-300 rounded-lg px-10 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoComplete="off"
                />
                <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                {searchingClient && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
                {clientSearch && !searchingClient && (
                  <button
                    type="button"
                    onClick={clearClientSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Hint */}
              {clientSearch.length > 0 && clientSearch.length < 2 && (
                <p className="text-xs text-gray-500 mt-1">💡 Escribe al menos 2 caracteres</p>
              )}

              {/* Botón crear nuevo sin buscar */}
              {!clientSearch && !formData.clientId && !isNewClient && (
                <button
                  type="button"
                  onClick={() => setIsNewClient(true)}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-green-500 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <UserPlusIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">O crea un cliente nuevo sin buscar</span>
                </button>
              )}

              {/* Dropdown de Resultados */}
              {showClientDropdown && clientResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="px-3 py-2 bg-blue-50 border-b border-blue-100">
                    <p className="text-xs font-medium text-blue-700">
                      ✓ {clientResults.length} {clientResults.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
                    </p>
                  </div>
                  {clientResults.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => selectClient(client)}
                      className="w-full px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <UserCircleIcon className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">{client.name}</p>
                            <p className="text-sm text-gray-600">{client.phone}</p>
                            {client.email && (
                              <p className="text-xs text-gray-500">{client.email}</p>
                            )}
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                          EXISTE
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Sin Resultados */}
              {showClientDropdown && clientResults.length === 0 && clientSearch.length >= 2 && !searchingClient && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-6">
                  <div className="text-center">
                    <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700 mb-1">Cliente no encontrado</p>
                    <p className="text-xs text-gray-500 mb-4">"{clientSearch}"</p>
                    <button
                      type="button"
                      onClick={handleCreateNewClient}
                      className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Crear nuevo cliente
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cliente Seleccionado */}
            {formData.clientId && !isNewClient && (
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-900">Cliente Seleccionado</p>
                      <p className="font-medium text-gray-900 mt-1">{formData.clientName}</p>
                      <p className="text-sm text-gray-600">{formData.clientPhone}</p>
                      {formData.clientEmail && (
                        <p className="text-sm text-gray-600">{formData.clientEmail}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Formulario Nuevo Cliente */}
            {isNewClient && (
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <UserCircleIcon className="h-6 w-6 text-green-600" />
                  <h4 className="font-semibold text-green-900">Nuevo Cliente</h4>
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-600 text-white">
                    NUEVO
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.clientName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Juan Pérez"
                    />
                    {errors.clientName && (
                      <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.clientPhone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+57 300 123 4567"
                    />
                    {errors.clientPhone ? (
                      <p className="text-red-500 text-xs mt-1">{errors.clientPhone}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">💡 Puedes incluir espacios y formato</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email (opcional)
                    </label>
                    <input
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="juan@example.com"
                    />
                  </div>
                </div>

                <p className="text-xs text-green-700">
                  💡 El cliente se creará automáticamente al guardar la cita
                </p>
              </div>
            )}
          </div>

          {/* Datos de la Cita */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-green-600" />
              Datos de la Cita
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sucursal *
                </label>
                <select
                  name="branchId"
                  value={formData.branchId}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.branchId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar sucursal</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                {errors.branchId && (
                  <p className="text-red-500 text-xs mt-1">{errors.branchId}</p>
                )}
              </div>

              {isBusinessSpecialist ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especialista
                  </label>
                  <div className="w-full border border-gray-300 bg-gray-50 rounded-lg px-3 py-2 flex items-center">
                    <UserCircleIcon className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-gray-700">
                      {user?.firstName} {user?.lastName} <span className="text-gray-500 text-sm">(Tú)</span>
                    </span>
                  </div>
                  <p className="text-xs text-purple-600 mt-1">
                    ✓ Como dueño-especialista, las citas se asignan automáticamente a ti
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especialista *
                  </label>
                  <select
                    name="specialistId"
                    value={formData.specialistId}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.specialistId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar especialista</option>
                    {specialists.map(specialist => (
                      <option key={specialist.id} value={specialist.id}>
                        {specialist.firstName} {specialist.lastName}
                      </option>
                    ))}
                  </select>
                  {errors.specialistId && (
                    <p className="text-red-500 text-xs mt-1">{errors.specialistId}</p>
                  )}
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servicio *
                </label>
                <select
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={handleChange}
                  disabled={loadingSpecialistServices}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.serviceId ? 'border-red-500' : 'border-gray-300'
                  } ${loadingSpecialistServices ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">
                    {loadingSpecialistServices ? 'Cargando servicios...' : 'Seleccionar servicio'}
                  </option>
                  {filteredServices.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - ${service.price?.toLocaleString('es-CO')} ({service.duration} min)
                    </option>
                  ))}
                </select>
                {errors.serviceId && (
                  <p className="text-red-500 text-xs mt-1">{errors.serviceId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de inicio *
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.startTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startTime && (
                  <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Agregar notas adicionales sobre la cita..."
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creando...' : 'Crear Cita'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateAppointmentModal
