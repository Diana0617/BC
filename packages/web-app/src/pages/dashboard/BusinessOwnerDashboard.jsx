import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  Cog6ToothIcon, 
  UserCircleIcon, 
  CurrencyDollarIcon,
  CalendarIcon,
  ListBulletIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { format, addDays, subDays, startOfWeek, endOfWeek, addWeeks, subWeeks, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import CalendarAccessSection from '../business/profile/sections/CalendarAccessSection'
import AppointmentCard from '../../components/specialist/appointments/AppointmentCard'
import AppointmentDetailsModal from '../../components/specialist/appointments/AppointmentDetailsModal'
import CreateAppointmentModal from '../../components/calendar/CreateAppointmentModal'
import { dateRangeToUTC } from '../../utils/timezone'

const BusinessOwnerDashboard = () => {
  const navigate = useNavigate()
  const { user, token } = useSelector(state => state.auth)
  const { currentBusiness } = useSelector(state => state.business)
  const timezone = currentBusiness?.timezone || 'America/Bogota'

  // Estados para gestión de turnos
  const [activeTab, setActiveTab] = useState('calendar') // 'calendar' | 'appointments'
  const [period, setPeriod] = useState('day')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Cargar turnos de TODOS los especialistas del negocio
  const loadAllAppointments = useCallback(async () => {
    if (!currentBusiness?.id || !token) return
    
    try {
      setLoading(true)
      
      let startDateLocal, endDateLocal
      
      if (period === 'day') {
        startDateLocal = format(currentDate, 'yyyy-MM-dd')
        endDateLocal = format(currentDate, 'yyyy-MM-dd')
      } else if (period === 'week') {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
        startDateLocal = format(weekStart, 'yyyy-MM-dd')
        endDateLocal = format(weekEnd, 'yyyy-MM-dd')
      } else if (period === 'month') {
        const monthStart = startOfMonth(currentDate)
        const monthEnd = endOfMonth(currentDate)
        startDateLocal = format(monthStart, 'yyyy-MM-dd')
        endDateLocal = format(monthEnd, 'yyyy-MM-dd')
      }
      
      // Convertir el rango a UTC para la consulta
      const { startDateUTC, endDateUTC } = dateRangeToUTC(startDateLocal, endDateLocal, timezone);
      
      // Endpoint para obtener todas las citas del negocio
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/appointments?businessId=${currentBusiness.id}&startDate=${startDateUTC}&endDate=${endDateUTC}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (!response.ok) throw new Error('Error cargando turnos')
      
      const result = await response.json()
      // Asegurar que appointments sea siempre un array
      const appointmentsData = result.data || result.appointments || result || []
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : [])
    } catch (error) {
      console.error('Error loading appointments:', error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [currentDate, period, currentBusiness?.id, token])

  useEffect(() => {
    if (activeTab === 'appointments' && currentBusiness?.id) {
      loadAllAppointments()
    }
  }, [activeTab, currentBusiness?.id, loadAllAppointments])

  const handlePrevious = () => {
    if (period === 'day') {
      setCurrentDate(prev => subDays(prev, 1))
    } else if (period === 'week') {
      setCurrentDate(prev => subWeeks(prev, 1))
    } else if (period === 'month') {
      setCurrentDate(prev => subMonths(prev, 1))
    }
  }

  const handleNext = () => {
    if (period === 'day') {
      setCurrentDate(prev => addDays(prev, 1))
    } else if (period === 'week') {
      setCurrentDate(prev => addWeeks(prev, 1))
    } else if (period === 'month') {
      setCurrentDate(prev => addMonths(prev, 1))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailsModal(true)
  }

  const handleAppointmentUpdate = () => {
    loadAllAppointments()
  }

  const getDateLabel = () => {
    if (period === 'day') {
      return format(currentDate, "EEEE, d 'de' MMMM", { locale: es })
    } else if (period === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
      return `${format(weekStart, 'd MMM', { locale: es })} - ${format(weekEnd, 'd MMM', { locale: es })}`
    } else if (period === 'month') {
      return format(currentDate, "MMMM yyyy", { locale: es })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navbar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                {currentBusiness?.name || 'Beauty Control'}
              </h1>
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/business/cash-register')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Caja"
              >
                <CurrencyDollarIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Caja</span>
              </button>
              
              <button
                onClick={() => navigate('/business/profile')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Configuración del negocio"
              >
                <Cog6ToothIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Configuración</span>
              </button>
              
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <UserCircleIcon className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'calendar'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
              <span>Calendario</span>
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'appointments'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <ListBulletIcon className="w-5 h-5" />
              <span>Gestión de Turnos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'calendar' ? (
          <CalendarAccessSection />
        ) : (
          <div>
            {/* Toolbar de Gestión de Turnos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Period Selector */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPeriod('day')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      period === 'day'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Día
                  </button>
                  <button
                    onClick={() => setPeriod('week')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      period === 'week'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Semana
                  </button>
                  <button
                    onClick={() => setPeriod('month')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      period === 'month'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Mes
                  </button>
                </div>

                {/* Date Navigation */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrevious}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleToday}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                  >
                    Hoy
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                  <span className="text-lg font-semibold text-gray-900 min-w-[250px] text-center">
                    {getDateLabel()}
                  </span>
                </div>

                {/* Create Appointment Button */}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Crear Turno</span>
                </button>
              </div>
            </div>

            {/* Lista de Turnos */}
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : appointments.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay turnos programados
                  </h3>
                  <p className="text-gray-600 mb-6">
                    No hay citas para el período seleccionado
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Crear Primera Cita
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {Array.isArray(appointments) && appointments.map(appointment => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onClick={handleAppointmentClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      {showDetailsModal && selectedAppointment && (
        <AppointmentDetailsModal
          isOpen={showDetailsModal}
          appointment={selectedAppointment}
          businessId={currentBusiness?.id}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedAppointment(null)
          }}
          onUpdate={handleAppointmentUpdate}
        />
      )}

      {showCreateModal && (
        <CreateAppointmentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadAllAppointments()
          }}
          businessId={currentBusiness?.id}
        />
      )}
    </div>
  )
}

export default BusinessOwnerDashboard
