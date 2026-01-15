import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import {
  CalendarDaysIcon,
  ClockIcon,
  EyeIcon,
  LinkIcon,
  ShareIcon,
  UserGroupIcon,
  InformationCircleIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  BuildingOfficeIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { 
  useSchedule, 
  useAppointmentCalendar, 
  businessBranchesApi,
  getServices
} from '@shared'
import businessSpecialistsApi from '@shared/api/businessSpecialistsApi'
import appointmentApi from '@shared/api/appointmentApi'
import FullCalendarView from '../../../../components/calendar/FullCalendarView'
import AppointmentDetailsModal from '../../../../components/specialist/appointments/AppointmentDetailsModal'
import CreateAppointmentModal from '../../../../components/calendar/CreateAppointmentModal'

const CalendarAccessSection = ({ isSetupMode, onComplete, isCompleted }) => {
  const { currentBusiness } = useSelector(state => state.business)
  const { user } = useSelector(state => state.auth)
  
  console.log('📍 CalendarAccessSection mounted:', {
    currentBusiness: currentBusiness?.id,
    userBusinessId: user?.businessId,
    userRole: user?.role
  });
  
  // Leer reglas de negocio para verificar si tiene multisucursal
  const businessRules = useSelector(state => state.businessRule?.assignedRules || [])
  const multiBranchRule = businessRules.find(r => r.key === 'MULTISUCURSAL')
  const hasMultiBranch = multiBranchRule?.customValue ?? multiBranchRule?.effective_value ?? multiBranchRule?.defaultValue ?? multiBranchRule?.template?.defaultValue ?? false
  
  // Redux hooks (se usarán en el futuro para persistir datos)
  // eslint-disable-next-line no-unused-vars
  const scheduleHooks = useSchedule()
  
  const { 
    getByDateRange,
    calendarAppointments,
    loading: appointmentsLoading 
  } = useAppointmentCalendar()

  // Estado para las tabs
  const [activeTab, setActiveTab] = useState('turnos') // 'horarios', 'turnos', 'acceso'
  
  // Estado para el calendario
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [branches, setBranches] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Estados para modales
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createModalData, setCreateModalData] = useState({})
  
  // Estados para datos del modal
  const [specialists, setSpecialists] = useState([])
  const [services, setServices] = useState([])
  
  // Estado para código QR
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  // Estado para edición de horarios
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [weekSchedule, setWeekSchedule] = useState({
    monday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
    tuesday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
    wednesday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
    thursday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
    friday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
    saturday: { isOpen: true, startTime: '09:00', endTime: '14:00' },
    sunday: { isOpen: false, startTime: '09:00', endTime: '18:00' }
  })

  const daysOfWeek = useMemo(() => [
    { key: 'monday', label: 'Lunes', short: 'Lun' },
    { key: 'tuesday', label: 'Martes', short: 'Mar' },
    { key: 'wednesday', label: 'Miércoles', short: 'Mié' },
    { key: 'thursday', label: 'Jueves', short: 'Jue' },
    { key: 'friday', label: 'Viernes', short: 'Vie' },
    { key: 'saturday', label: 'Sábado', short: 'Sáb' },
    { key: 'sunday', label: 'Domingo', short: 'Dom' }
  ], [])

  // Colores para las sucursales
  const branchColors = useMemo(() => [
    { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800', hover: 'hover:bg-blue-200' },
    { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800', hover: 'hover:bg-green-200' },
    { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800', hover: 'hover:bg-purple-200' },
    { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800', hover: 'hover:bg-red-200' },
    { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800', hover: 'hover:bg-yellow-200' },
    { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-800', hover: 'hover:bg-indigo-200' }
  ], [])

  // Cargar sucursales
  const loadBranches = useCallback(async () => {
    const businessId = currentBusiness?.id || user?.businessId;
    
    if (!businessId) {
      console.warn('⚠️ No businessId available to load branches');
      return;
    }
    
    try {
      setIsLoading(true)
      console.log('🏢 Cargando sucursales para el negocio:', businessId)
      
      // Llamar a la API real de sucursales
      const response = await businessBranchesApi.getBranches(businessId, {
        isActive: true,
        limit: 50
      })
      
      console.log('📦 Respuesta de sucursales:', response)
      
      // La API devuelve { success: true, data: [...] } donde data es directamente el array
      const branchesData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.branches || response.branches || [])
      console.log('🏪 Sucursales obtenidas:', branchesData)
      
      // Si no hay sucursales, crear una por defecto automáticamente SOLO para BUSINESS_SPECIALIST
      if (branchesData.length === 0 && user?.role === 'BUSINESS_SPECIALIST') {
        console.log('🔨 No hay sucursales para BUSINESS_SPECIALIST, creando sucursal por defecto...')
        try {
          const businessName = currentBusiness?.name || user?.business?.name || 'Mi Negocio';
          const defaultBranch = {
            name: businessName,
            code: 'PRINCIPAL',
            address: currentBusiness?.address || user?.business?.address || '',
            city: currentBusiness?.city || user?.business?.city || '',
            phone: currentBusiness?.phone || user?.business?.phone || '',
            isActive: true,
            isMain: true
          }
          
          console.log('📋 Datos de la sucursal a crear:', defaultBranch);
          
          const createResponse = await businessBranchesApi.createBranch(businessId, defaultBranch)
          console.log('✅ Sucursal por defecto creada:', createResponse)
          
          // Agregar la nueva sucursal al array
          const newBranch = createResponse.data?.branch || createResponse.data
          if (newBranch) {
            branchesData.push(newBranch)
            toast.success('Sucursal principal creada automáticamente')
          }
        } catch (createError) {
          console.error('❌ Error creando sucursal por defecto:', createError)
          console.error('❌ Detalle del error:', createError.response?.data || createError.message)
          
          // Solo mostrar mensaje si es un error real (no de conexión)
          if (!createError.message?.includes('Failed to fetch')) {
            const errorMsg = createError.response?.data?.error || createError.message || 'Error desconocido';
            toast.error(`No se pudo crear la sucursal: ${errorMsg}. Ve a la sección Sucursales para crearla manualmente.`)
          }
        }
      }
      
      setBranches(branchesData)
      
      // No seleccionar ninguna sucursal por defecto para mostrar todas las citas
      console.log('📋 Sucursales cargadas, mostrando vista de todas las sucursales')
    } catch (error) {
      console.error('❌ Error cargando sucursales:', error)
      // Solo mostrar toast si es un error real (no de conexión)
      if (!error.message?.includes('Failed to fetch')) {
        toast.error('Error cargando sucursales')
      }
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBusiness?.id, user?.businessId, user?.role, hasMultiBranch])

  // Cargar horarios de la sucursal seleccionada
  const loadBranchSchedule = useCallback(async (branch = null) => {
    const targetBranch = branch || selectedBranch
    if (!targetBranch) return

    try {
      console.log('📅 Cargando horarios de sucursal:', targetBranch)
      
      // Si la sucursal tiene businessHours guardados, cargarlos
      if (targetBranch.businessHours) {
        const hours = targetBranch.businessHours
        console.log('✅ businessHours encontrados:', hours)
        const newSchedule = {}
        
        daysOfWeek.forEach(({ key }) => {
          const dayData = hours[key]
          if (dayData) {
            newSchedule[key] = {
              isOpen: !dayData.closed && dayData.open && dayData.close,
              startTime: dayData.open || '09:00',
              endTime: dayData.close || '18:00'
            }
          } else {
            // Valores por defecto si no hay datos
            newSchedule[key] = {
              isOpen: key !== 'sunday',
              startTime: '09:00',
              endTime: '18:00'
            }
          }
        })
        
        console.log('📋 Horarios parseados:', newSchedule)
        setWeekSchedule(newSchedule)
      } else {
        console.log('⚠️ No se encontraron businessHours en la sucursal, usando valores por defecto')
        // Si no hay horarios guardados, usar valores por defecto
        const defaultSchedule = {}
        daysOfWeek.forEach(({ key }) => {
          defaultSchedule[key] = {
            isOpen: key !== 'sunday',
            startTime: '09:00',
            endTime: '18:00'
          }
        })
        setWeekSchedule(defaultSchedule)
      }
    } catch (error) {
      console.error('❌ Error cargando horarios:', error)
      console.error('Error cargando horarios:', error)
    }
  }, [selectedBranch, daysOfWeek])

  // Cargar citas del mes actual
  const loadAppointments = useCallback(async () => {
    const businessId = currentBusiness?.id || user?.businessId;
    
    if (!businessId || activeTab !== 'turnos') return

    console.log('📅 Cargando citas para:', {
      businessId: businessId,
      branchId: selectedBranch?.id || 'todas',
      month: currentMonth
    })

    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
      
      const params = {
        businessId: businessId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
      
      // Solo agregar branchId si hay una sucursal seleccionada
      if (selectedBranch?.id) {
        params.branchId = selectedBranch.id
      }
      
      await getByDateRange(params)
    } catch (error) {
      console.error('Error cargando citas:', error)
    }
  }, [currentBusiness?.id, user?.businessId, currentMonth, selectedBranch, activeTab, getByDateRange])
  
  // Log separado para ver las citas cuando cambien (sin crear loop)
  useEffect(() => {
    if (calendarAppointments) {
      console.log('✅ Citas en Redux actualizadas:', {
        totalCitas: calendarAppointments?.length || 0,
        primeras3: calendarAppointments?.slice(0, 3)
      })
    }
  }, [calendarAppointments])

  // Cargar especialistas de la sucursal seleccionada
  const loadSpecialists = useCallback(async () => {
    const businessId = currentBusiness?.id || user?.businessId;
    
    if (!businessId || !selectedBranch?.id) return

    try {
      console.log('👨‍⚕️ Cargando especialistas de la sucursal:', selectedBranch.name)
      const response = await businessSpecialistsApi.getSpecialists(businessId, {
        branchId: selectedBranch.id,
        isActive: true
      })
      
      const specialistsList = response.data?.specialists || response.data || []
      console.log('✅ Especialistas cargados:', specialistsList.length)
      setSpecialists(specialistsList)
    } catch (error) {
      console.error('❌ Error cargando especialistas:', error)
      setSpecialists([])
    }
  }, [currentBusiness?.id, user?.businessId, selectedBranch])

  // Cargar servicios activos del negocio
  const loadServices = useCallback(async () => {
    const businessId = currentBusiness?.id || user?.businessId;
    
    if (!businessId) return

    try {
      console.log('💼 Cargando servicios del negocio...')
      const response = await getServices(businessId, {
        isActive: true,
        limit: 100
      })
      
      const servicesList = response.data?.services || response.data || []
      console.log('✅ Servicios cargados:', servicesList.length)
      setServices(servicesList)
    } catch (error) {
      console.error('❌ Error cargando servicios:', error)
      // No mostrar toast de error, solo loguear
      setServices([])
    }
  }, [currentBusiness?.id, user?.businessId])

  // Efectos
  useEffect(() => {
    const businessId = currentBusiness?.id || user?.businessId;
    if (businessId) {
      loadBranches()
    }
  }, [currentBusiness?.id, user?.businessId, loadBranches])

  useEffect(() => {
    loadBranchSchedule()
  }, [selectedBranch, loadBranchSchedule])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  useEffect(() => {
    if (selectedBranch?.id) {
      loadSpecialists()
    }
  }, [selectedBranch, loadSpecialists])

  useEffect(() => {
    if (currentBusiness?.id) {
      loadServices()
    }
  }, [currentBusiness, loadServices])

  // Generar código QR cuando cambia el negocio
  useEffect(() => {
    console.log('🔍 Verificando currentBusiness para QR:', currentBusiness)
    
    // Priorizar subdomain sobre id para URLs amigables
    const businessIdentifier = currentBusiness?.subdomain || 
                               currentBusiness?.slug ||
                               currentBusiness?.id
    
    console.log('📋 Identificador del negocio:', businessIdentifier)
    console.log('🏷️ Subdomain:', currentBusiness?.subdomain)
    
    if (businessIdentifier) {
      const bookingUrl = `https://www.controldenegocios.com/book/${businessIdentifier}`
      console.log('🔗 URL de reservas:', bookingUrl)
      
      // Generar QR usando API de QR Code Generator
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(bookingUrl)}`
      console.log('📱 URL del QR:', qrUrl)
      setQrCodeUrl(qrUrl)
    } else {
      console.warn('⚠️ No se encontró identificador del negocio')
    }
  }, [currentBusiness])

  // Navegación del mes
  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(prev.getMonth() + direction)
      return newMonth
    })
  }

  const getMonthName = (date) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return months[date.getMonth()]
  }

  // Handlers de edición de horarios
  const handleToggleDay = (dayKey) => {
    setWeekSchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        isOpen: !prev[dayKey].isOpen
      }
    }))
  }

  const handleTimeChange = (dayKey, field, value) => {
    setWeekSchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: value
      }
    }))
  }

  const handleSaveSchedule = async () => {
    if (!selectedBranch || !currentBusiness?.id) return

    try {
      setIsLoading(true)
      
      // Convertir weekSchedule al formato de businessHours
      const businessHours = {}
      Object.entries(weekSchedule).forEach(([day, data]) => {
        businessHours[day] = {
          isOpen: data.isOpen,
          open: data.startTime,
          close: data.endTime,
          closed: !data.isOpen
        }
      })

      // Llamar a la API real para actualizar la sucursal
      await businessBranchesApi.updateBranch(
        currentBusiness.id,
        selectedBranch.id,
        { businessHours }
      )
      
      console.log('✅ Horarios guardados exitosamente:', businessHours)
      
      // Actualizar sucursal local
      setBranches(prev => prev.map(b => 
        b.id === selectedBranch.id 
          ? { ...b, businessHours }
          : b
      ))
      setSelectedBranch(prev => ({ ...prev, businessHours }))
      
      setEditingSchedule(null)
      
      toast.success('✅ Horarios guardados exitosamente')
    } catch (error) {
      console.error('❌ Error guardando horarios:', error)
      toast.error(`Error al guardar los horarios: ${error.message || 'Error desconocido'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingSchedule(null)
    loadBranchSchedule()
  }

  // Copiar horarios a otros días
  const handleCopyToAllDays = (sourceDayKey) => {
    const sourceDay = weekSchedule[sourceDayKey]
    const newSchedule = {}
    
    daysOfWeek.forEach(({ key }) => {
      newSchedule[key] = {
        ...sourceDay
      }
    })
    
    setWeekSchedule(newSchedule)
  }

  // Copiar enlace al portapapeles
  const handleCopyLink = async () => {
    // Priorizar subdomain sobre id para URLs amigables
    const businessIdentifier = currentBusiness?.subdomain || 
                               currentBusiness?.slug ||
                               currentBusiness?.id
    const bookingUrl = `https://www.controldenegocios.com/book/${businessIdentifier || 'TU_CODIGO'}`
    
    console.log('📋 Copiando enlace:', bookingUrl)
    
    try {
      await navigator.clipboard.writeText(bookingUrl)
      toast.success('✅ Enlace copiado al portapapeles')
    } catch (error) {
      console.error('Error copiando enlace:', error)
      toast.error('Error al copiar el enlace')
    }
  }

  // Descargar código QR
  const handleDownloadQR = async () => {
    if (!qrCodeUrl) {
      toast.error('Error generando código QR')
      return
    }
    
    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `qr-${currentBusiness?.code || 'negocio'}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('✅ Código QR descargado')
    } catch (error) {
      console.error('Error descargando QR:', error)
      toast.error('Error al descargar el código QR')
    }
  }

  // Renderizado de tabs
  const renderTabs = () => (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
        <button
          onClick={() => setActiveTab('horarios')}
          className={`${
            activeTab === 'horarios'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
        >
          <ClockIcon className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">Horarios de Sucursal</span>
          <span className="sm:hidden">Horarios</span>
        </button>

        <button
          onClick={() => setActiveTab('turnos')}
          className={`${
            activeTab === 'turnos'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
        >
          <CalendarDaysIcon className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">Gestión de Turnos</span>
          <span className="sm:hidden">Turnos</span>
        </button>

        <button
          onClick={() => setActiveTab('acceso')}
          className={`${
            activeTab === 'acceso'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
        >
          <UserGroupIcon className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">Acceso Clientes</span>
          <span className="sm:hidden">Clientes</span>
        </button>
      </nav>
    </div>
  )

  // Renderizado de selector de sucursal (solo si tiene multisucursal o más de 1 sucursal)
  const renderBranchSelector = () => {
    // No mostrar selector si solo hay una sucursal y no tiene módulo multisucursal
    if (!hasMultiBranch && branches.length <= 1) {
      return null
    }
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtrar por sucursal:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Opción: Todas las sucursales */}
          <button
            onClick={() => setSelectedBranch(null)}
            className={`${
              selectedBranch === null
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-2 border-blue-600'
                : 'bg-white border-2 border-gray-200 hover:border-gray-300'
            } p-4 rounded-lg transition-all duration-200 text-left`}
          >
            <div className="flex items-center">
              <BuildingOfficeIcon className={`h-5 w-5 mr-2 ${
                selectedBranch === null ? 'text-white' : 'text-gray-500'
              }`} />
              <div>
                <div className={`font-medium ${
                  selectedBranch === null ? 'text-white' : 'text-gray-900'
                }`}>
                  Todas las sucursales
                </div>
                <div className={`text-xs ${
                  selectedBranch === null ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {branches.length} sucursal{branches.length !== 1 ? 'es' : ''}
                </div>
              </div>
            </div>
          </button>
          
          {/* Sucursales individuales */}
          {branches.map((branch, index) => (
            <button
              key={branch.id}
              onClick={() => setSelectedBranch(branch)}
              className={`${
                selectedBranch?.id === branch.id
                  ? `${branchColors[index % branchColors.length].bg} ${branchColors[index % branchColors.length].border} border-2`
                  : 'bg-white border-2 border-gray-200 hover:border-gray-300'
              } p-4 rounded-lg transition-all duration-200 text-left`}
            >
              <div className="flex items-center">
                <BuildingOfficeIcon className={`h-5 w-5 mr-2 ${
                  selectedBranch?.id === branch.id
                    ? branchColors[index % branchColors.length].text
                    : 'text-gray-500'
                }`} />
                <div>
                  <div className={`font-medium ${
                    selectedBranch?.id === branch.id
                      ? branchColors[index % branchColors.length].text
                      : 'text-gray-900'
                  }`}>
                    {branch.name}
                  </div>
                  <div className="text-xs text-gray-500">{branch.code}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Renderizado de tab de horarios
  const renderHorariosTab = () => (
    <div className="space-y-6">
      {renderBranchSelector()}

      {selectedBranch && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
              Horarios de {selectedBranch.name}
            </h3>
            
            {!editingSchedule ? (
              <button
                onClick={() => setEditingSchedule(selectedBranch.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Editar Horarios
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium flex items-center"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Cancelar</span>
                </button>
                <button
                  onClick={handleSaveSchedule}
                  disabled={isLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  {isLoading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            )}
          </div>

          {/* Grid de horarios */}
          <div className="space-y-3 sm:space-y-4">
            {daysOfWeek.map(({ key, label, short }) => (
              <div 
                key={key}
                className={`border rounded-lg p-3 sm:p-4 transition-all ${
                  weekSchedule[key].isOpen 
                    ? 'border-gray-300 bg-white' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                  {/* Día y toggle */}
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={weekSchedule[key].isOpen}
                        onChange={() => editingSchedule && handleToggleDay(key)}
                        disabled={!editingSchedule}
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                      />
                      <span className={`ml-3 font-medium ${
                        weekSchedule[key].isOpen ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        <span className="hidden sm:inline">{label}</span>
                        <span className="sm:hidden">{short}</span>
                      </span>
                    </label>
                  </div>

                  {/* Horarios */}
                  {weekSchedule[key].isOpen ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={weekSchedule[key].startTime}
                          onChange={(e) => editingSchedule && handleTimeChange(key, 'startTime', e.target.value)}
                          disabled={!editingSchedule}
                          className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed w-full sm:w-auto"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="time"
                          value={weekSchedule[key].endTime}
                          onChange={(e) => editingSchedule && handleTimeChange(key, 'endTime', e.target.value)}
                          disabled={!editingSchedule}
                          className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed w-full sm:w-auto"
                        />
                      </div>

                      {editingSchedule && (
                        <button
                          onClick={() => handleCopyToAllDays(key)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                          title="Copiar a todos los días"
                        >
                          Copiar a todos
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500 italic">Cerrado</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Información adicional */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-medium text-blue-800 mb-1">
                  Información sobre horarios
                </h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Los horarios se aplicarán a todas las citas de esta sucursal</li>
                  <li>• Los especialistas solo podrán agendar dentro de estos horarios</li>
                  <li>• Puedes cerrar días específicos desmarcando la casilla</li>
                  <li>• Usa "Copiar a todos" para aplicar el mismo horario a toda la semana</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Renderizado de tab de turnos
  const renderTurnosTab = () => (
    <div className="space-y-6">
      {renderBranchSelector()}

      {/* Mensaje si no hay sucursal seleccionada */}
      {!selectedBranch && branches.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <InformationCircleIcon className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                Necesitas una sucursal para gestionar turnos
              </h4>
              <p className="text-sm text-yellow-700 mb-3">
                Para poder crear y gestionar turnos, primero debes configurar al menos una sucursal.
              </p>
              <button
                onClick={() => {
                  // Navegar a la sección de sucursales
                  const event = new CustomEvent('navigate-to-section', { detail: 'branches' });
                  window.dispatchEvent(event);
                }}
                className="text-sm font-medium text-yellow-800 underline hover:text-yellow-900"
              >
                Ir a configurar sucursales →
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <CalendarDaysIcon className="h-5 w-5 text-blue-600 mr-2" />
            Vista del Calendario
          </h3>

          {/* Navegación del mes y botón crear */}
          <div className="flex items-center justify-between sm:justify-start space-x-4">
            {/* Botón Crear Turno */}
            <button
              onClick={() => {
                setCreateModalData({ 
                  date: new Date().toISOString().split('T')[0],
                  branchId: selectedBranch?.id 
                })
                setShowCreateModal(true)
              }}
              disabled={branches.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <PlusIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Crear Turno</span>
            </button>

            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>

            <span className="text-base sm:text-lg font-semibold text-gray-900 min-w-[150px] text-center">
              {getMonthName(currentMonth)} {currentMonth.getFullYear()}
            </span>

            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {appointmentsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando turnos...</span>
          </div>
        ) : calendarAppointments && calendarAppointments.length > 0 ? (
          <div className="space-y-4">
            {/* FullCalendar View */}
            <FullCalendarView
              appointments={calendarAppointments}
              initialDate={currentMonth}
              branches={branches}
              branchColors={branchColors}
              showAllBranches={selectedBranch === null}
              onEventClick={(eventData) => {
                console.log('🖱️ Click en evento del calendario:', eventData)
                const appointment = eventData.extendedProps?.appointment || eventData.appointment
                console.log('📋 Appointment data:', appointment)
                if (appointment) {
                  setSelectedAppointment(appointment)
                  setShowDetailModal(true)
                } else {
                  console.error('❌ No se encontró el appointment en eventData')
                }
              }}
              onDateClick={(dateData) => {
                setCreateModalData({ 
                  date: dateData.dateStr, 
                  branchId: selectedBranch?.id 
                })
                setShowCreateModal(true)
              }}
              onDateSelect={(selectData) => {
                setCreateModalData({ 
                  date: selectData.startStr, 
                  startTime: selectData.startStr.split('T')[1]?.substring(0, 5),
                  branchId: selectedBranch?.id 
                })
                setShowCreateModal(true)
              }}
              height="650px"
            />
            
            {/* Contador de citas y leyenda de colores */}
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  📅 {calendarAppointments.length} cita{calendarAppointments.length !== 1 ? 's' : ''} encontrada{calendarAppointments.length !== 1 ? 's' : ''} en este período
                  {selectedBranch && ` en ${selectedBranch.name}`}
                </p>
              </div>
              
              {/* Leyenda de colores cuando se muestran todas las sucursales */}
              {!selectedBranch && branches.length > 1 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                    Leyenda de sucursales:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {branches.map((branch, index) => (
                      <div key={branch.id} className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${branchColors[index % branchColors.length].bg} ${branchColors[index % branchColors.length].border} border`}></div>
                        <span className="text-xs text-gray-700 truncate">{branch.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Vista vacía */}
            <div className="text-center text-gray-500 py-12">
              <CalendarDaysIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No hay citas programadas</p>
              <p className="text-sm mt-2">
                {selectedBranch 
                  ? `No hay citas en ${selectedBranch.name} para este período`
                  : 'No hay citas programadas en ninguna sucursal para este período'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Renderizado de tab de acceso clientes
  const renderAccesoTab = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <div className="flex items-center mb-6">
          <UserGroupIcon className="h-6 w-6 text-green-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Acceso de Clientes a la Agenda
          </h3>
        </div>

        <div className="space-y-6">
          {/* Estado actual */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <InformationCircleIcon className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
              <span className="text-sm font-medium text-green-800">
                ✅ Tu agenda está disponible online
              </span>
            </div>
            <p className="text-sm text-green-700 mt-2">
              Los clientes pueden acceder a tu agenda a través del enlace público.
            </p>
          </div>

          {/* Cómo compartir el enlace */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 flex items-center">
              <ShareIcon className="h-5 w-5 text-blue-600 mr-2" />
              Cómo compartir tu agenda con clientes
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Método 1: Enlace directo */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <LinkIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-gray-900">Enlace directo</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Comparte este enlace único con tus clientes para que puedan agendar citas online.
                </p>
                <div className="bg-gray-50 rounded p-3 overflow-x-auto">
                  <code className="text-xs text-gray-800 break-all">
                    https://www.controldenegocios.com/book/{currentBusiness?.subdomain || currentBusiness?.slug || currentBusiness?.id || 'TU_CODIGO'}
                  </code>
                </div>
                <button 
                  onClick={handleCopyLink}
                  className="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Copiar enlace
                </button>
              </div>

              {/* Método 2: Código QR */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <EyeIcon className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-medium text-gray-900">Código QR</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Imprime o muestra este código QR en tu local para que los clientes puedan escanearlo.
                </p>
                <div className="bg-white border border-gray-200 rounded p-4 flex items-center justify-center min-h-[180px]">
                  {qrCodeUrl ? (
                    <img 
                      src={qrCodeUrl} 
                      alt="Código QR para reservas" 
                      className="w-40 h-40 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'block'
                      }}
                    />
                  ) : (
                    <div className="text-sm text-gray-500">Generando código QR...</div>
                  )}
                  <div style={{ display: 'none' }} className="text-sm text-red-500">
                    Error al generar QR
                  </div>
                </div>
                <button 
                  onClick={handleDownloadQR}
                  disabled={!qrCodeUrl}
                  className="mt-3 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Descargar QR
                </button>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-medium text-blue-800 mb-1">
                  Información importante
                </h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Los clientes solo verán los horarios disponibles según la sucursal seleccionada</li>
                  <li>• Las citas se confirman automáticamente y se envía confirmación por email</li>
                  <li>• Puedes gestionar todas las citas desde la sección "Gestión de Turnos"</li>
                  <li>• Los clientes pueden cancelar o modificar citas hasta 24 horas antes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
          <CalendarDaysIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3" />
          Calendario y Gestión de Turnos
        </h2>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Configura los horarios de tus sucursales, gestiona los turnos de especialistas y comparte tu agenda con clientes.
        </p>
      </div>

      {/* Tabs */}
      {renderTabs()}

      {/* Contenido según tab activa */}
      <div className="mt-6">
        {activeTab === 'horarios' && renderHorariosTab()}
        {activeTab === 'turnos' && renderTurnosTab()}
        {activeTab === 'acceso' && renderAccesoTab()}
      </div>

      {/* Botón de completar setup */}
      {isSetupMode && (
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            onClick={onComplete}
            disabled={isCompleted}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isCompleted
                ? 'bg-green-600 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isCompleted ? '✓ Completado' : 'Marcar como completado'}
          </button>
        </div>
      )}
      
      {/* Modales */}
      <AppointmentDetailsModal
        isOpen={showDetailModal}
        appointment={selectedAppointment}
        businessId={currentBusiness?.id || user?.businessId}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedAppointment(null)
        }}
        onUpdate={() => {
          loadAppointments() // Recargar calendario después de actualizar
        }}
      />

      <CreateAppointmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        initialData={createModalData}
        branches={branches}
        specialists={specialists}
        services={services}
        onCreate={async (data) => {
          try {
            // Transformar datos del formulario al formato de la API
            const appointmentData = {
              businessId: currentBusiness.id,
              clientName: data.clientName,
              clientPhone: data.clientPhone,
              clientEmail: data.clientEmail,
              specialistId: data.specialistId,
              branchId: data.branchId,
              startTime: `${data.date}T${data.startTime}:00`,
              endTime: `${data.date}T${data.endTime}:00`,
              notes: data.notes || ''
            }

            // Manejar múltiples servicios o servicio único
            if (data.serviceIds && data.serviceIds.length > 0) {
              // Si hay múltiples servicios, enviarlos como array
              appointmentData.serviceIds = data.serviceIds
            } else if (data.serviceId) {
              // Si solo hay un serviceId (backward compatibility), convertirlo a array
              appointmentData.serviceIds = [data.serviceId]
            }

            // Agregar productos si los hay
            if (data.productsSold && data.productsSold.length > 0) {
              appointmentData.productsSold = data.productsSold
            }

            console.log('📝 Creando cita con datos:', appointmentData)
            await appointmentApi.createAppointment(appointmentData)
            toast.success('✅ Cita creada exitosamente')
            loadAppointments()
            setShowCreateModal(false)
          } catch (error) {
            console.error('Error creando cita:', error)
            
            // Extraer mensaje de error
            let errorMessage = error.response?.data?.error || error.message || 'Error al crear la cita'
            
            // Mejorar mensajes específicos
            if (errorMessage.includes('ya completó todas las sesiones')) {
              const match = errorMessage.match(/(\d+) de (\d+)/)
              if (match) {
                errorMessage = `⚠️ Sesiones completadas (${match[1]}/${match[2]}). El cliente necesita un nuevo paquete.`
              } else {
                errorMessage = '⚠️ El cliente completó todas las sesiones. Necesita un nuevo paquete.'
              }
            } else if (errorMessage.includes('no tiene acceso a la sucursal')) {
              errorMessage = '⚠️ El especialista no tiene acceso a esta sucursal'
            } else if (errorMessage.includes('horario')) {
              errorMessage = '⚠️ El horario seleccionado no está disponible'
            } else if (errorMessage.includes('conflicto') || errorMessage.includes('ocupado')) {
              errorMessage = '⚠️ Ya existe una cita en este horario'
            }
            
            toast.error(errorMessage)
            // Propagar el error para que el modal lo muestre también
            throw new Error(errorMessage)
          }
        }}
      />
    </div>
  )
}

export default CalendarAccessSection
