import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  CalendarIcon, 
  UserGroupIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  ChartBarIcon,
  CubeIcon
} from '@heroicons/react/24/outline'
import { useAppointmentCalendar, usePermissions } from '@shared'
import FullCalendarView from '../../components/calendar/FullCalendarView'
import AppointmentDetailModal from '../../components/calendar/AppointmentDetailModal'
import CreateAppointmentModal from '../../components/calendar/CreateAppointmentModal'

const ReceptionistDashboard = () => {
  const { user } = useSelector(state => state.auth)
  const { currentBusiness } = useSelector(state => state.business)
  const { hasPermission } = usePermissions()
  
  const { 
    getByDateRange,
    calendarAppointments,
    loading: appointmentsLoading 
  } = useAppointmentCalendar()

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [stats, setStats] = useState({
    today: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  })
  
  // Estados para modales
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (currentBusiness?.id) {
      loadDashboardData()
    }
  }, [selectedDate, currentBusiness])

  const loadDashboardData = async () => {
    if (!currentBusiness?.id) {
      console.log('⚠️ No hay businessId disponible aún')
      return
    }

    try {
      // Cargar citas del mes actual para el calendario
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
      
      console.log('📅 Cargando citas para:', {
        businessId: currentBusiness.id,
        startDate: startOfMonth,
        endDate: endOfMonth
      })
      
      // Cargar TODAS las citas del negocio (sin filtrar por especialista)
      await getByDateRange({
        businessId: currentBusiness.id,
        startDate: startOfMonth,
        endDate: endOfMonth
        // NO incluir specialistId para ver todos los especialistas
      })
      
      // Calcular stats del día actual
      const today = new Date()
      const todayAppointments = calendarAppointments.filter(apt => {
        const aptDate = new Date(apt.startTime)
        return aptDate.toDateString() === today.toDateString()
      })
      
      setStats({
        today: todayAppointments.length,
        pending: todayAppointments.filter(a => a.status === 'PENDING').length,
        confirmed: todayAppointments.filter(a => a.status === 'CONFIRMED').length,
        completed: todayAppointments.filter(a => a.status === 'COMPLETED').length,
        cancelled: todayAppointments.filter(a => a.status === 'CANCELED').length
      })
    } catch (error) {
      console.error('Error cargando datos:', error)
    }
  }

  const handleEventClick = (eventInfo) => {
    const appointment = eventInfo.extendedProps.appointment
    setSelectedAppointment(appointment)
    setShowDetailModal(true)
  }

  const handleDateClick = (dateInfo) => {
    setShowCreateModal(true)
  }

  const handleAppointmentUpdated = () => {
    loadDashboardData()
  }

  const handleAppointmentCreated = () => {
    loadDashboardData()
    setShowCreateModal(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Panel de Recepción
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Hola, {user?.name || 'Recepcionista'} - {currentBusiness?.name || 'Tu Negocio'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nueva Cita
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Citas Hoy</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.today}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Confirmadas</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.confirmed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completadas</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Canceladas</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.cancelled}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircleIcon className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Calendar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <FullCalendarView
          appointments={calendarAppointments}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
          initialDate={selectedDate}
          height="auto"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          onClick={() => window.location.href = '/clients'}
          className="flex items-center justify-center gap-3 p-4 bg-white hover:bg-gray-50 rounded-lg shadow-sm border border-gray-200 transition-colors"
        >
          <UserGroupIcon className="w-6 h-6 text-pink-600" />
          <span className="font-medium text-gray-900">Clientes</span>
        </button>
        
        {hasPermission('inventory.view') && (
          <button 
            onClick={() => window.location.href = '/business/inventory'}
            className="flex items-center justify-center gap-3 p-4 bg-white hover:bg-gray-50 rounded-lg shadow-sm border border-gray-200 transition-colors"
          >
            <CubeIcon className="w-6 h-6 text-blue-600" />
            <span className="font-medium text-gray-900">Inventario</span>
          </button>
        )}
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-3 p-4 bg-white hover:bg-gray-50 rounded-lg shadow-sm border border-gray-200 transition-colors"
        >
          <CalendarIcon className="w-6 h-6 text-purple-600" />
          <span className="font-medium text-gray-900">Nueva Cita</span>
        </button>
        
        <button 
          onClick={() => window.location.href = '/business/profile?tab=calendar'}
          className="flex items-center justify-center gap-3 p-4 bg-white hover:bg-gray-50 rounded-lg shadow-sm border border-gray-200 transition-colors"
        >
          <ClockIcon className="w-6 h-6 text-green-600" />
          <span className="font-medium text-gray-900">Configurar Horarios</span>
        </button>
      </div>

      {/* Modales */}
      {showDetailModal && selectedAppointment && (
        <AppointmentDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedAppointment(null)
          }}
          appointment={selectedAppointment}
          onUpdate={handleAppointmentUpdated}
        />
      )}

      {showCreateModal && (
        <CreateAppointmentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleAppointmentCreated}
          initialDate={selectedDate}
        />
      )}
    </div>
  )
}

export default ReceptionistDashboard
