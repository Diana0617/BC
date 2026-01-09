import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  ChartBarIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  XCircleIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { getMainMetrics, getSalesBreakdown, getAppointmentsSummary } from '@shared/api/businessMetricsApi'

// Componente de tarjeta de métrica con gradiente
const MetricCard = ({ title, value, subtitle, icon: Icon, gradient, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-gradient-to-br ${gradient} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105`}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-white text-opacity-90 text-sm font-medium mb-2">
          {title}
        </p>
        <p className="text-white text-3xl font-bold mb-1">
          {value}
        </p>
        {subtitle && (
          <p className="text-white text-opacity-75 text-xs">
            {subtitle}
          </p>
        )}
      </div>
      <div className="bg-white bg-opacity-20 rounded-lg p-3">
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
)

// Componente de resumen rápido
const QuickSummaryCard = ({ title, items, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
    <div className="flex items-center mb-4">
      <div className={`bg-${color}-100 rounded-lg p-2 mr-3`}>
        <Icon className={`h-5 w-5 text-${color}-600`} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex justify-between items-center">
          <span className="text-sm text-gray-600">{item.label}</span>
          <span className={`text-sm font-semibold ${item.valueColor || 'text-gray-900'}`}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  </div>
)

const BusinessOwnerDashboard = () => {
  const { user, business } = useSelector(state => state.auth)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('today') // today, week, month
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Estado de métricas
  const [metrics, setMetrics] = useState({
    sales: { value: '$0', subtitle: 'Cargando...', change: '0%' },
    income: { value: '$0', subtitle: 'Cargando...', change: '0%' },
    appointments: { value: '0', subtitle: 'Cargando...', change: '0' },
    cancelled: { value: '0', subtitle: 'Cargando...', change: '0' },
    expenses: { value: '$0', subtitle: 'Cargando...', change: '0%' }
  })

  const [salesBreakdown, setSalesBreakdown] = useState({
    services: { formatted: '$0' },
    products: { formatted: '$0' },
    mostUsedMethod: { method: 'N/A', count: 0 },
    averageTicket: { formatted: '$0' }
  })

  const [appointmentsSummary, setAppointmentsSummary] = useState({
    completed: 0,
    pending: 0,
    cancelled: 0,
    confirmed: 0,
    occupancyRate: '0%',
    cancellationRate: '0%'
  })

  useEffect(() => {
    loadMetrics()
  }, [selectedPeriod])

  const loadMetrics = async () => {
    setRefreshing(true)
    setLoading(true)
    setError(null)
    
    try {
      // Cargar todas las métricas en paralelo
      const [metricsData, salesData, appointmentsData] = await Promise.all([
        getMainMetrics(selectedPeriod),
        getSalesBreakdown(selectedPeriod),
        getAppointmentsSummary(selectedPeriod)
      ])

      console.log('📊 Métricas cargadas:', { metricsData, salesData, appointmentsData })

      // Actualizar métricas principales
      if (metricsData.success) {
        setMetrics(metricsData.data)
      }

      // Actualizar desglose de ventas
      if (salesData.success) {
        setSalesBreakdown(salesData.data)
      }

      // Actualizar resumen de citas
      if (appointmentsData.success) {
        setAppointmentsSummary(appointmentsData.data)
      }

    } catch (err) {
      console.error('Error cargando métricas:', err)
      setError(err.response?.data?.error || 'Error al cargar métricas')
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadMetrics()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                Dashboard de Negocio
              </h1>
              <p className="text-gray-600 mt-1">
                Bienvenido, {user?.firstName} - {business?.name}
              </p>
            </div>
            
            {/* Selector de período */}
            <div className="flex space-x-2">
              {['today', 'week', 'month'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period === 'today' && 'Hoy'}
                  {period === 'week' && 'Semana'}
                  {period === 'month' && 'Mes'}
                </button>
              ))}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {refreshing ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="ml-4 text-gray-600">Cargando métricas...</p>
          </div>
        ) : (
          <>
            {/* Métricas principales - Grid de 3 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Ventas del Día"
            value={metrics.sales.value}
            subtitle={metrics.sales.subtitle}
            icon={ChartBarIcon}
            gradient="from-blue-500 to-blue-600"
          />
          
          <MetricCard
            title="Ingresos Netos"
            value={metrics.income.value}
            subtitle={metrics.income.subtitle}
            icon={CurrencyDollarIcon}
            gradient="from-green-500 to-green-600"
          />
          
          <MetricCard
            title="Citas"
            value={metrics.appointments.value}
            subtitle={metrics.appointments.subtitle}
            icon={CalendarIcon}
            gradient="from-purple-500 to-purple-600"
          />
        </div>

        {/* Métricas secundarias - Grid de 2 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <MetricCard
            title="Citas Canceladas"
            value={metrics.cancelled.value}
            subtitle={metrics.cancelled.subtitle}
            icon={XCircleIcon}
            gradient="from-red-500 to-red-600"
          />
          
          <MetricCard
            title="Gastos del Día"
            value={metrics.expenses.value}
            subtitle={metrics.expenses.subtitle}
            icon={BanknotesIcon}
            gradient="from-orange-500 to-orange-600"
          />
        </div>

        {/* Sección de resúmenes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resumen de ventas */}
          <QuickSummaryCard
            title="Desglose de Ventas"
            icon={ChartBarIcon}
            color="blue"
            items={[
              { label: 'Servicios', value: salesBreakdown.services.formatted, valueColor: 'text-green-600' },
              { label: 'Productos', value: salesBreakdown.products.formatted, valueColor: 'text-blue-600' },
              { label: 'Método más usado', value: salesBreakdown.mostUsedMethod.method },
              { label: 'Ticket promedio', value: salesBreakdown.averageTicket.formatted }
            ]}
          />

          {/* Resumen de citas */}
          <QuickSummaryCard
            title="Estado de Citas"
            icon={CalendarIcon}
            color="purple"
            items={[
              { label: 'Completadas', value: appointmentsSummary.completed.toString(), valueColor: 'text-green-600' },
              { label: 'Pendientes', value: appointmentsSummary.pending.toString(), valueColor: 'text-yellow-600' },
              { label: 'Canceladas', value: appointmentsSummary.cancelled.toString(), valueColor: 'text-red-600' },
              { label: 'Tasa de ocupación', value: appointmentsSummary.occupancyRate, valueColor: 'text-blue-600' }
            ]}
          />
        </div>

        {/* Sección de acciones rápidas */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-primary-500" />
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Nueva Cita
            </button>
            <button className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white rounded-lg hover:from-secondary-600 hover:to-secondary-700 transition-all shadow-md hover:shadow-lg">
              <UserGroupIcon className="h-5 w-5 mr-2" />
              Ver Clientes
            </button>
            <button className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg">
              <BanknotesIcon className="h-5 w-5 mr-2" />
              Caja
            </button>
            <button className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Reportes
            </button>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  )
}

export default BusinessOwnerDashboard
