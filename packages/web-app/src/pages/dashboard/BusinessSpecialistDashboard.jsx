import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  CalendarIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CubeIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  UsersIcon
} from '@heroicons/react/24/outline'

const BusinessSpecialistDashboard = () => {
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const [stats, setStats] = useState({
    todayAppointments: 0,
    weekAppointments: 0,
    totalClients: 0,
    totalServices: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    nextAppointment: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // TODO: Hacer llamadas reales a la API
      // const response = await api.get(`/dashboard/business-specialist/${user.businessId}`)
      
      // Mock data por ahora
      setStats({
        todayAppointments: 5,
        weekAppointments: 23,
        totalClients: 32,
        totalServices: 8,
        todayRevenue: 245000,
        weekRevenue: 1280000,
        nextAppointment: {
          clientName: 'María González',
          service: 'Corte y Color',
          time: '14:30',
          duration: '90 min'
        }
      })
    } catch (error) {
      console.error('Error cargando dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const quickActions = [
    {
      title: 'Nueva Cita',
      description: 'Agenda una cita',
      icon: CalendarIcon,
      color: 'bg-blue-500',
      onClick: () => navigate('/appointments/new')
    },
    {
      title: 'Mis Clientes',
      description: 'Ver lista de clientes',
      icon: UserGroupIcon,
      color: 'bg-pink-500',
      onClick: () => navigate('/clients')
    },
    {
      title: 'Mis Servicios',
      description: 'Gestionar servicios',
      icon: ClipboardDocumentListIcon,
      color: 'bg-purple-500',
      onClick: () => navigate('/services')
    },
    {
      title: 'Inventario',
      description: 'Gestionar productos',
      icon: CubeIcon,
      color: 'bg-indigo-500',
      onClick: () => navigate('/business/inventory')
    },
    {
      title: 'Consentimientos',
      description: 'Plantillas de consentimiento',
      icon: DocumentTextIcon,
      color: 'bg-teal-500',
      onClick: () => navigate('/business/consent-templates')
    },
    {
      title: 'Mi Equipo',
      description: 'Gestionar personal',
      icon: UsersIcon,
      color: 'bg-orange-500',
      onClick: () => navigate('/business/profile?tab=team')
    },
    {
      title: 'Configuración',
      description: 'Ajustes del negocio',
      icon: Cog6ToothIcon,
      color: 'bg-gray-500',
      onClick: () => navigate('/business/profile')
    },
    {
      title: 'Registro de Pagos',
      description: 'Ver pagos recibidos',
      icon: BanknotesIcon,
      color: 'bg-green-500',
      onClick: () => navigate('/payments')
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          ¡Hola, {user?.firstName || 'Profesional'}! 👋
        </h1>
        <p className="text-pink-100">
          Gestiona tu negocio y atiende a tus clientes en un solo lugar
        </p>
        <p className="text-pink-50 text-sm mt-2 flex items-center gap-2">
          <span className="bg-white/20 px-2 py-1 rounded">Dueño</span>
          <span>+</span>
          <span className="bg-white/20 px-2 py-1 rounded">Especialista</span>
        </p>
      </div>

      {/* Next Appointment Card */}
      {stats.nextAppointment && (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ClockIcon className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Próxima Cita
                </h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {stats.nextAppointment.time}
              </p>
              <p className="text-gray-600">
                {stats.nextAppointment.clientName} • {stats.nextAppointment.service}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Duración: {stats.nextAppointment.duration}
              </p>
            </div>
            <button
              onClick={() => navigate('/appointments')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Ver Agenda
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Citas de Hoy */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
              Hoy
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {stats.todayAppointments}
          </p>
          <p className="text-sm text-gray-600">Citas programadas</p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.weekAppointments} esta semana
          </p>
        </div>

        {/* Ingresos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BanknotesIcon className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
              Hoy
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(stats.todayRevenue)}
          </p>
          <p className="text-sm text-gray-600">Ingresos del día</p>
          <p className="text-xs text-gray-500 mt-2">
            {formatCurrency(stats.weekRevenue)} esta semana
          </p>
        </div>

        {/* Clientes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-pink-600" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
              Total
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {stats.totalClients}
          </p>
          <p className="text-sm text-gray-600">Clientes registrados</p>
          <p className="text-xs text-gray-500 mt-2">
            Límite: 50 (Plan Básico)
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 text-left group"
            >
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600">
                {action.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BusinessSpecialistDashboard
