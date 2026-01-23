import React, { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
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
import { fetchProducts } from '@shared/store/slices/productsSlice'
import { apiClient } from '@shared/api/client'
import ProductSelector from '../sales/ProductSelector'
import { localToUTC, isValidFutureDateTime } from '../../utils/timezone'

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
  const dispatch = useDispatch()
  const business = useSelector(state => state.business?.currentBusiness)
  const token = useSelector(state => state.auth?.token)
  const user = useSelector(state => state.auth?.user)
  const { products } = useSelector(state => state.products)
  // Para SPECIALIST, usar user.businessId; para BUSINESS, usar business.id
  const businessId = user?.businessId || business?.id
  // Obtener timezone del negocio (default: America/Bogota)
  const timezone = business?.timezone || 'America/Bogota'
  
  // Si es BUSINESS_SPECIALIST o SPECIALIST, él mismo es el especialista
  const isAutoSpecialist = user?.role === 'BUSINESS_SPECIALIST' || user?.role === 'SPECIALIST'
  // Para SPECIALIST usar specialistProfile.id, para BUSINESS_SPECIALIST usar user.id
  const autoSpecialistId = isAutoSpecialist 
    ? (user?.role === 'SPECIALIST' && user?.specialistProfile?.id ? user.specialistProfile.id : user?.id)
    : null
  
  // Debug logging
  console.log('🔍 [CreateAppointmentModal] User data:', {
    role: user?.role,
    userId: user?.id,
    specialistProfileId: user?.specialistProfile?.id,
    autoSpecialistId,
    isAutoSpecialist
  })
  
  const [formData, setFormData] = useState({
    // Datos del cliente
    clientId: null, // ID si es cliente existente
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    
    // Datos de la cita
    branchId: initialData.branchId || '',
    specialistId: initialData.specialistId || autoSpecialistId || '',
    serviceId: '', // Mantener para backward compatibility
    serviceIds: [], // Array de servicios seleccionados
    date: initialData.date || new Date().toISOString().split('T')[0],
    startTime: initialData.startTime || '09:00',
    endTime: initialData.endTime || '10:00',
    
    // Otros
    notes: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Estados para servicios seleccionados
  const [selectedServices, setSelectedServices] = useState([])
  const [currentServiceId, setCurrentServiceId] = useState('') // Para el dropdown
  
  // Estados para búsqueda de clientes
  const [clientSearch, setClientSearch] = useState('')
  const [searchingClient, setSearchingClient] = useState(false)
  const [clientResults, setClientResults] = useState([])
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [isNewClient, setIsNewClient] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState(null)

  // Estados para filtrado de servicios
  const [filteredServices, setFilteredServices] = useState([])
  const [loadingSpecialistServices, setLoadingSpecialistServices] = useState(false)

  // Estados para productos/ventas
  const [selectedProducts, setSelectedProducts] = useState([])
  const [showProductsSection, setShowProductsSection] = useState(false)

  // Estados para slots disponibles
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  
  // Estados para especialistas filtrados
  const [filteredSpecialists, setFilteredSpecialists] = useState([])

  // Inicializar servicios filtrados
  useEffect(() => {
    if (services && services.length > 0 && filteredServices.length === 0) {
      setFilteredServices(services)
    }
  }, [services, filteredServices.length])

  // Cargar productos al abrir el modal
  useEffect(() => {
    if (isOpen && businessId) {
      dispatch(fetchProducts({ 
        businessId,
        productType: 'FOR_SALE,BOTH',
        isActive: true
      }))
    }
  }, [isOpen, businessId, dispatch])

  // Función para resetear todos los estados del formulario
  const resetForm = useCallback(() => {
    const currentAutoSpecialistId = isAutoSpecialist 
      ? (user?.role === 'SPECIALIST' && user?.specialistProfile?.id ? user.specialistProfile.id : user?.id)
      : null
    
    console.log('🔄 [CreateAppointmentModal] Resetting form with autoSpecialistId:', currentAutoSpecialistId)
    
    setFormData({
      clientId: null,
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      branchId: initialData.branchId || '',
      specialistId: initialData.specialistId || currentAutoSpecialistId || '',
      serviceId: '',
      serviceIds: [],
      date: initialData.date || new Date().toISOString().split('T')[0],
      startTime: initialData.startTime || '09:00',
      endTime: initialData.endTime || '10:00',
      notes: ''
    })
    setClientSearch('')
    setClientResults([])
    setShowClientDropdown(false)
    setIsNewClient(false)
    setSelectedServices([])
    setCurrentServiceId('')
    setSelectedProducts([])
    setShowProductsSection(false)
    setErrors({})
  }, [isAutoSpecialist, user?.role, user?.id, user?.specialistProfile?.id, initialData.branchId, initialData.specialistId, initialData.date, initialData.startTime, initialData.endTime])

  // Resetear form cuando se abre/cierra
  useEffect(() => {
    if (isOpen) {
      resetForm()
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
   * Cargar slots disponibles del especialista
   */
  const loadAvailableSlots = useCallback(async () => {
    // Validar que tengamos todos los datos necesarios
    if (!formData.branchId || !formData.specialistId || !formData.date || selectedServices.length === 0) {
      setAvailableSlots([])
      return
    }

    try {
      setLoadingSlots(true)
      
      // Usar el primer servicio seleccionado para calcular slots
      const serviceId = selectedServices[0].id
      
      console.log('📅 Cargando slots disponibles:', {
        businessId,
        branchId: formData.branchId,
        specialistId: formData.specialistId,
        serviceId,
        date: formData.date
      })
      
      const response = await apiClient.get('/api/calendar/available-slots', {
        params: {
          businessId,
          branchId: formData.branchId,
          specialistId: formData.specialistId,
          serviceId,
          date: formData.date
        }
      })
      
      console.log('✅ Respuesta completa slots:', response.data)
      
      // Manejar diferentes formatos de respuesta
      let slots = []
      if (response.data.data && Array.isArray(response.data.data)) {
        slots = response.data.data
      } else if (response.data.slots && Array.isArray(response.data.slots)) {
        slots = response.data.slots
      } else if (Array.isArray(response.data)) {
        slots = response.data
      }
      
      console.log('✅ Slots disponibles procesados:', slots)
      setAvailableSlots(slots)
    } catch (error) {
      console.error('❌ Error cargando slots:', error)
      console.error('❌ Error response:', error.response?.data)
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }, [businessId, formData.branchId, formData.specialistId, formData.date, selectedServices])

  /**
   * Filtrar especialistas por sucursal y servicio
   */
  useEffect(() => {
    if (!formData.branchId) {
      setFilteredSpecialists(specialists)
      return
    }

    // Filtrar especialistas que pertenecen a la sucursal seleccionada
    const specialistsInBranch = specialists.filter(specialist => {
      const branches = specialist.branches || specialist.additionalBranches || []
      return branches.some(b => (typeof b === 'string' ? b : b.id) === formData.branchId)
    })

    // Si hay un servicio seleccionado, filtrar además por especialistas que tienen ese servicio
    if (selectedServices.length > 0) {
      // Aquí necesitaríamos verificar qué especialistas tienen el servicio asignado
      // Por ahora, usamos los que están en la sucursal
      setFilteredSpecialists(specialistsInBranch)
    } else {
      setFilteredSpecialists(specialistsInBranch)
    }
  }, [formData.branchId, selectedServices, specialists])

  // Cargar slots cuando cambien los parámetros relevantes
  useEffect(() => {
    if (formData.branchId && formData.specialistId && formData.date && selectedServices.length > 0) {
      loadAvailableSlots()
    } else {
      setAvailableSlots([])
      setSelectedSlot(null)
    }
  }, [formData.branchId, formData.specialistId, formData.date, selectedServices, loadAvailableSlots])

  /**
   * Manejar selección de slot
   */
  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot)
    setFormData(prev => ({
      ...prev,
      startTime: slot.startTime,
      endTime: slot.endTime
    }))
  }

  /**
   * Cargar servicios de un especialista específico
   */
  const loadSpecialistServices = useCallback(async (specialistId) => {
    try {
      setLoadingSpecialistServices(true)
      
      console.log('📞 [WEB] Calling specialist services API:', `/api/business/${businessId}/specialists/${specialistId}/services`)
      
      const response = await apiClient.get(
        `/api/business/${businessId}/specialists/${specialistId}/services`
      )

      console.log('✅ [WEB] Specialist services response:', response.data)
      console.log('🔧 [WEB] Specialist services loaded:', response.data.data?.length || 0)
      
      if (response.data.data && Array.isArray(response.data.data)) {
        // Filtrar solo servicios activos
        const activeServices = response.data.data.filter(ss => ss.isActive)
        
        console.log('📋 [WEB] Active services:', activeServices.length)
        console.log('📋 [WEB] First service structure:', activeServices[0])
        
        if (activeServices.length === 0) {
          console.warn('⚠️ [WEB] No services assigned to this specialist')
          setFilteredServices([])
          return
        }
        
        // Mapear a formato compatible con el dropdown de servicios
        // El backend retorna la relación con el objeto 'service' anidado
        const mappedServices = activeServices.map(ss => ({
          id: ss.serviceId || ss.id,
          name: ss.service?.name || ss.serviceName || ss.name || 'Servicio sin nombre',
          duration: ss.service?.duration || ss.duration,
          price: ss.customPrice !== null && ss.customPrice !== undefined 
            ? ss.customPrice 
            : (ss.service?.price || ss.price)
        }))
        
        console.log('✅ [WEB] Mapped services:', mappedServices.length, mappedServices)
        setFilteredServices(mappedServices)
        
        // Si el servicio actualmente seleccionado no está en la lista, limpiarlo
        if (formData.serviceId && !mappedServices.find(s => s.id === formData.serviceId)) {
          setFormData(prev => ({ ...prev, serviceId: '' }))
        }
      } else {
        console.warn('⚠️ [WEB] No services data in response')
        setFilteredServices([])
      }
    } catch (error) {
      console.error('❌ [WEB] Error loading specialist services:', error)
      console.error('❌ [WEB] Error details:', error.response?.data || error.message)
      
      // Si hay error 404, significa que el especialista no tiene servicios asignados
      if (error.response?.status === 404) {
        console.warn('⚠️ [WEB] Specialist not found or has no services')
        setFilteredServices([])
      } else {
        // Para otros errores, mostrar todos los servicios como fallback
        console.log('⚠️ [WEB] Falling back to all services')
        setFilteredServices(services)
      }
    } finally {
      setLoadingSpecialistServices(false)
    }
  }, [businessId, services, formData.serviceId])

  // Cargar servicios del especialista cuando cambie
  useEffect(() => {
    if (formData.specialistId && businessId && token) {
      // Buscar el especialista seleccionado en la lista
      const selectedSpecialist = specialists.find(s => s.id === formData.specialistId);
      
      console.log('🔧 [WEB] Selected specialist:', selectedSpecialist);
      console.log('🔧 [WEB] Specialist role:', selectedSpecialist?.role);
      
      // SIEMPRE cargar los servicios específicos del especialista seleccionado
      // independientemente de su rol o del rol del usuario logueado
      console.log('🔧 [WEB] Loading services for specialist:', formData.specialistId);
      loadSpecialistServices(formData.specialistId);
    } else if (formData.specialistId === '' || !formData.specialistId) {
      // Si no hay especialista, mostrar todos los servicios
      console.log('🔧 [WEB] No specialist selected, showing all services');
      if (JSON.stringify(filteredServices) !== JSON.stringify(services)) {
        setFilteredServices(services);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.specialistId, businessId, token, specialists])

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
      
      const response = await apiClient.get(
        `/api/business/${businessId}/clients/search?q=${encodeURIComponent(searchTerm)}`
      )

      console.log('📊 [WEB] Results:', response.data.data?.length || 0, 'clients found')
      console.log('📋 [WEB] Data:', response.data.data)
      setClientResults(response.data.data || [])
      setShowClientDropdown(true)
      console.log('✅ [WEB] Dropdown should be visible now')
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

  /**
   * Agregar un servicio a la lista
   */
  const handleAddService = () => {
    if (!currentServiceId) return
    
    // Verificar que no esté ya agregado
    if (selectedServices.some(s => s.id === currentServiceId)) {
      return
    }
    
    // Buscar el servicio completo
    const service = filteredServices.find(s => s.id === currentServiceId)
    if (!service) return
    
    const newService = {
      ...service,
      order: selectedServices.length
    }
    
    setSelectedServices(prev => [...prev, newService])
    
    // Actualizar formData
    const newServiceIds = [...selectedServices.map(s => s.id), service.id]
    setFormData(prev => ({
      ...prev,
      serviceIds: newServiceIds,
      serviceId: newServiceIds[0] // Mantener el primero para backward compatibility
    }))
    
    // Limpiar el dropdown
    setCurrentServiceId('')
    
    // Calcular nueva duración total y actualizar endTime
    calculateTotalDuration([...selectedServices, newService])
  }

  /**
   * Eliminar un servicio de la lista
   */
  const handleRemoveService = (serviceId) => {
    const newServices = selectedServices.filter(s => s.id !== serviceId)
    setSelectedServices(newServices)
    
    // Actualizar formData
    const newServiceIds = newServices.map(s => s.id)
    setFormData(prev => ({
      ...prev,
      serviceIds: newServiceIds,
      serviceId: newServiceIds[0] || '' // Mantener el primero o vacío
    }))
    
    // Recalcular duración
    calculateTotalDuration(newServices)
  }

  /**
   * Mover un servicio hacia arriba en el orden
   */
  const handleMoveServiceUp = (index) => {
    if (index === 0) return
    
    const newServices = [...selectedServices]
    const temp = newServices[index]
    newServices[index] = newServices[index - 1]
    newServices[index - 1] = temp
    
    // Actualizar order
    newServices.forEach((s, i) => s.order = i)
    
    setSelectedServices(newServices)
  }

  /**
   * Mover un servicio hacia abajo en el orden
   */
  const handleMoveServiceDown = (index) => {
    if (index === selectedServices.length - 1) return
    
    const newServices = [...selectedServices]
    const temp = newServices[index]
    newServices[index] = newServices[index + 1]
    newServices[index + 1] = temp
    
    // Actualizar order
    newServices.forEach((s, i) => s.order = i)
    
    setSelectedServices(newServices)
  }

  /**
   * Calcular duración total y actualizar endTime
   */
  const calculateTotalDuration = (services) => {
    if (services.length === 0) {
      return
    }
    
    const totalMinutes = services.reduce((sum, s) => sum + (s.duration || 0), 0)
    
    // Actualizar endTime basado en startTime + totalDuration
    if (formData.startTime) {
      const [hours, minutes] = formData.startTime.split(':').map(Number)
      const startDate = new Date()
      startDate.setHours(hours, minutes, 0, 0)
      
      const endDate = new Date(startDate.getTime() + totalMinutes * 60000)
      const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`
      
      setFormData(prev => ({
        ...prev,
        endTime
      }))
    }
  }

  /**
   * Calcular precio total de todos los servicios
   */
  const calculateTotalPrice = () => {
    return selectedServices.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0)
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

    // Validar especialista (solo si no es auto-asignado)
    if (!formData.specialistId && !isAutoSpecialist) {
      newErrors.specialistId = 'Especialista es requerido'
    }

    // Validar que haya al menos un servicio seleccionado
    if (selectedServices.length === 0 && !formData.serviceId) {
      newErrors.serviceId = 'Debe seleccionar al menos un servicio'
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

    // Validar que la fecha y hora no sean en el pasado (usando timezone del negocio)
    if (formData.date && formData.startTime) {
      if (!isValidFutureDateTime(formData.date, formData.startTime, timezone)) {
        newErrors.date = 'No se pueden crear citas con fecha y hora pasadas'
        newErrors.startTime = 'La hora debe ser futura'
      }
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
      // Construir los serviceIds desde selectedServices
      const serviceIds = selectedServices.map(s => s.id);
      
      console.log('📤 [CreateAppointmentModal] Preparando datos para enviar:');
      console.log('  - selectedServices:', selectedServices.length, selectedServices);
      console.log('  - serviceIds construido:', serviceIds);
      console.log('  - formData.serviceIds:', formData.serviceIds);
      console.log('  - formData.serviceId:', formData.serviceId);
      
      // Convertir fecha y hora local a UTC para enviar al backend
      const startTimeUTC = localToUTC(formData.date, formData.startTime, timezone)
      const endTimeUTC = localToUTC(formData.date, formData.endTime, timezone)
      
      console.log('🌍 [CreateAppointmentModal] Conversión de timezone:');
      console.log('  - Timezone del negocio:', timezone);
      console.log('  - Fecha local:', formData.date);
      console.log('  - Hora inicio local:', formData.startTime);
      console.log('  - Hora fin local:', formData.endTime);
      console.log('  - StartTime UTC:', startTimeUTC.toISOString());
      console.log('  - EndTime UTC:', endTimeUTC.toISOString());
      
      // Agregar productos al formData si hay seleccionados
      const dataToSubmit = {
        ...formData,
        startTime: startTimeUTC.toISOString(),
        endTime: endTimeUTC.toISOString(),
        serviceIds: serviceIds, // Usar el array construido desde selectedServices
        ...(selectedProducts.length > 0 && { productsSold: selectedProducts })
      }
      
      console.log('📦 [CreateAppointmentModal] Data completo a enviar:', dataToSubmit);
      
      await onCreate(dataToSubmit)
      
      // Resetear el formulario antes de cerrar
      resetForm()
      
      // Cerrar el modal
      onClose()
    } catch (error) {
      console.error('Error creando cita:', error)
      
      // Extraer mensaje de error del servidor
      let errorMessage = 'Error al crear la cita. Por favor intenta nuevamente.'
      
      if (error.message) {
        errorMessage = error.message
        
        // Mejorar mensajes específicos para el usuario
        if (errorMessage.includes('ya completó todas las sesiones')) {
          // Extraer información de sesiones si está disponible
          const match = errorMessage.match(/(\d+) de (\d+)/)
          if (match) {
            errorMessage = `El cliente ya completó todas las sesiones de este paquete (${match[1]} de ${match[2]}). Para continuar, debe adquirir un nuevo paquete.`
          } else {
            errorMessage = 'El cliente ya completó todas las sesiones disponibles de este paquete. Debe adquirir uno nuevo para continuar.'
          }
        } else if (errorMessage.includes('no tiene acceso a la sucursal')) {
          errorMessage = 'El especialista seleccionado no tiene acceso a esta sucursal. Por favor selecciona otro especialista o cambia la sucursal.'
        } else if (errorMessage.includes('horario')) {
          errorMessage = 'El horario seleccionado no está disponible. Por favor elige otro horario.'
        } else if (errorMessage.includes('conflicto') || errorMessage.includes('ocupado')) {
          errorMessage = 'Ya existe una cita en este horario. Por favor selecciona otro horario.'
        }
      }
      
      setErrors({ submit: errorMessage })
      
      // Scroll al inicio del modal para que el usuario vea el error
      const modalContent = document.querySelector('.max-h-\\[90vh\\]')
      if (modalContent) {
        modalContent.scrollTop = 0
      }
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
          {/* Error general del servidor */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <svg className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error al crear la cita</h3>
                <p className="text-sm text-red-700 mt-1">{errors.submit}</p>
              </div>
            </div>
          )}
          
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

              {isAutoSpecialist ? (
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
                    ✓ Las citas se asignan automáticamente a ti
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especialista * {filteredSpecialists.length > 0 && `(${filteredSpecialists.length} disponible${filteredSpecialists.length > 1 ? 's' : ''})`}
                  </label>
                  {!formData.branchId ? (
                    <div className="w-full border border-gray-300 bg-gray-100 rounded-lg px-3 py-2 text-gray-500 text-sm">
                      Primero selecciona una sucursal
                    </div>
                  ) : selectedServices.length === 0 ? (
                    <div className="w-full border border-gray-300 bg-gray-100 rounded-lg px-3 py-2 text-gray-500 text-sm">
                      Primero selecciona un servicio
                    </div>
                  ) : filteredSpecialists.length === 0 ? (
                    <div className="w-full border border-yellow-300 bg-yellow-50 rounded-lg px-3 py-2 text-yellow-700 text-sm">
                      ⚠️ No hay especialistas disponibles para este servicio en esta sucursal
                    </div>
                  ) : (
                    <select
                      name="specialistId"
                      value={formData.specialistId}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.specialistId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Seleccionar especialista</option>
                      {filteredSpecialists
                        .filter(specialist => specialist.isActive !== false && specialist.status !== 'INACTIVE')
                        .map(specialist => {
                          const specialistId = specialist.specialistProfileId || specialist.SpecialistProfile?.id || specialist.id;
                          return (
                            <option key={specialistId} value={specialistId}>
                              {specialist.firstName} {specialist.lastName}
                            </option>
                          )
                        })}
                    </select>
                  )}
                  {errors.specialistId && (
                    <p className="text-red-500 text-xs mt-1">{errors.specialistId}</p>
                  )}
                  {filteredSpecialists.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Especialistas con este servicio asignado en esta sucursal
                    </p>
                  )}
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servicios *
                </label>
                
                {/* Lista de servicios seleccionados */}
                {selectedServices.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {selectedServices.map((service, index) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-semibold text-blue-600">
                            #{index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{service.name}</p>
                            <p className="text-xs text-gray-600">
                              ${service.price?.toLocaleString('es-CO')} • {service.duration} min
                            </p>
                          </div>
                        </div>
                        
                        {/* Botones de orden */}
                        <div className="flex items-center gap-1 mr-2">
                          <button
                            type="button"
                            onClick={() => handleMoveServiceUp(index)}
                            disabled={index === 0}
                            className={`p-1 rounded hover:bg-blue-100 ${
                              index === 0 ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                            title="Mover arriba"
                          >
                            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveServiceDown(index)}
                            disabled={index === selectedServices.length - 1}
                            className={`p-1 rounded hover:bg-blue-100 ${
                              index === selectedServices.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                            title="Mover abajo"
                          >
                            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Botón eliminar */}
                        <button
                          type="button"
                          onClick={() => handleRemoveService(service.id)}
                          className="p-1 rounded hover:bg-red-100"
                          title="Eliminar servicio"
                        >
                          <XMarkIcon className="h-5 w-5 text-red-600" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Resumen totales */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Total:</span>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-700">
                            ${calculateTotalPrice().toLocaleString('es-CO')}
                          </p>
                          <p className="text-xs text-gray-600">
                            {selectedServices.reduce((sum, s) => sum + (s.duration || 0), 0)} minutos totales
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Selector para agregar servicio */}
                <div className="flex gap-2">
                  <select
                    value={currentServiceId}
                    onChange={(e) => setCurrentServiceId(e.target.value)}
                    disabled={loadingSpecialistServices || (formData.specialistId && filteredServices.length === 0)}
                    className={`flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.serviceId && selectedServices.length === 0 ? 'border-red-500' : 'border-gray-300'
                    } ${loadingSpecialistServices || (formData.specialistId && filteredServices.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">
                      {loadingSpecialistServices 
                        ? 'Cargando servicios...' 
                        : (formData.specialistId && filteredServices.length === 0)
                          ? 'Este especialista no tiene servicios asignados'
                          : 'Seleccionar servicio'}
                    </option>
                    {filteredServices
                      .filter(s => !selectedServices.some(sel => sel.id === s.id))
                      .map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name} - ${service.price?.toLocaleString('es-CO')} ({service.duration} min)
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddService}
                    disabled={!currentServiceId || loadingSpecialistServices}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${
                      !currentServiceId || loadingSpecialistServices ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar
                  </button>
                </div>
                
                {/* Mensaje cuando no hay servicios para el especialista */}
                {formData.specialistId && filteredServices.length === 0 && !loadingSpecialistServices && (
                  <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      ⚠️ <strong>Este especialista no tiene servicios asignados.</strong>
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Para crear una cita, primero debes asignar servicios a este especialista desde la sección de Gestión de Especialistas.
                    </p>
                  </div>
                )}
                
                {errors.serviceId && selectedServices.length === 0 && (
                  <p className="text-red-500 text-xs mt-1">{errors.serviceId}</p>
                )}
                
                {selectedServices.length === 0 && !formData.specialistId && (
                  <p className="text-sm text-gray-500 mt-2">
                    💡 Puedes agregar múltiples servicios para una misma cita
                  </p>
                )}
                
                {selectedServices.length === 0 && formData.specialistId && filteredServices.length > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    💡 Selecciona uno o más servicios que el especialista realizará en esta cita
                  </p>
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
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                )}
              </div>

              {/* Sección de Slots Disponibles */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horarios Disponibles *
                </label>
                
                {!formData.branchId || !formData.specialistId || !formData.date || selectedServices.length === 0 ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <ClockIcon className="h-10 w-10 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm text-blue-800">
                      Completa los campos anteriores para ver los horarios disponibles
                    </p>
                  </div>
                ) : loadingSlots ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-sm text-gray-600">Cargando horarios disponibles...</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-red-800 font-medium mb-2">
                      😞 No hay horarios disponibles para esta fecha
                    </p>
                    <p className="text-xs text-red-700">
                      El especialista no tiene disponibilidad o todos los horarios están ocupados. Prueba con otra fecha.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-3">
                      ✓ {availableSlots.length} horario{availableSlots.length > 1 ? 's' : ''} disponible{availableSlots.length > 1 ? 's' : ''} • Selecciona uno
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-60 overflow-y-auto">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectSlot(slot)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedSlot?.startTime === slot.startTime
                              ? 'bg-green-600 text-white ring-2 ring-green-500 ring-offset-2'
                              : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700 border border-gray-300'
                          }`}
                        >
                          {slot.startTime}
                        </button>
                      ))}
                    </div>
                    {selectedSlot && (
                      <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800">
                          ✓ Horario seleccionado: <strong>{selectedSlot.startTime} - {selectedSlot.endTime}</strong>
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          Duración: {selectedServices.reduce((sum, s) => sum + (s.duration || 0), 0)} minutos
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {errors.startTime && !selectedSlot && (
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

              {/* Sección de Productos/Ventas */}
              <div className="sm:col-span-2">
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Productos/Ventas
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowProductsSection(!showProductsSection)}
                      className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                    >
                      {showProductsSection ? 'Ocultar' : 'Agregar Productos'}
                    </button>
                  </div>
                  
                  {showProductsSection && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-4">
                        Registra los productos vendidos durante esta cita
                      </p>
                      <ProductSelector
                        products={products || []}
                        selectedItems={selectedProducts}
                        onItemsChange={setSelectedProducts}
                        allowQuantityEdit={true}
                        allowPriceEdit={false}
                        showStock={true}
                        title="Productos Vendidos"
                      />
                    </div>
                  )}
                  
                  {!showProductsSection && selectedProducts.length > 0 && (
                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                      <p className="text-sm text-pink-800">
                        ✓ {selectedProducts.length} producto(s) agregado(s) - Total: ${selectedProducts.reduce((sum, item) => sum + item.total, 0).toLocaleString('es-CO')}
                      </p>
                    </div>
                  )}
                </div>
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
