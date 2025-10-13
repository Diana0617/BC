import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  UsersIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

// Importar componentes de la página de clientes
import ClientList from '../../customers/components/ClientList'
import ClientFilters from '../../customers/components/ClientFilters'
import CreateManualVoucherModal from '../../customers/components/CreateManualVoucherModal'
import ClientDetailModal from '../../customers/components/ClientDetailModal'

const CustomerHistorySection = () => {
  const { currentBusiness } = useSelector(state => state.business)

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [showVoucherModal, setShowVoucherModal] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'recent',
    timeRange: '30'
  })

  // Datos mock de clientes (TODO: Reemplazar con API real)
  const mockClients = [
    {
      id: 1,
      name: 'María García',
      email: 'maria@example.com',
      phone: '+57 300 123 4567',
      appointmentsCount: 12,
      cancellationsCount: 1,
      vouchersCount: 2,
      isBlocked: false,
      lastAppointment: '2024-03-15',
      totalSpent: 450000
    },
    {
      id: 2,
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '+57 301 234 5678',
      appointmentsCount: 8,
      cancellationsCount: 3,
      vouchersCount: 0,
      isBlocked: true,
      lastAppointment: '2024-03-10',
      totalSpent: 320000
    },
    {
      id: 3,
      name: 'Ana López',
      email: 'ana@example.com',
      phone: '+57 302 345 6789',
      appointmentsCount: 25,
      cancellationsCount: 0,
      vouchersCount: 1,
      isBlocked: false,
      lastAppointment: '2024-03-18',
      totalSpent: 890000
    },
    {
      id: 4,
      name: 'Carlos Rodríguez',
      email: 'carlos@example.com',
      phone: '+57 303 456 7890',
      appointmentsCount: 5,
      cancellationsCount: 2,
      vouchersCount: 1,
      isBlocked: false,
      lastAppointment: '2024-03-12',
      totalSpent: 180000
    }
  ]

  // Calcular estadísticas
  const stats = {
    total: mockClients.length,
    blocked: mockClients.filter(c => c.isBlocked).length,
    withVouchers: mockClients.filter(c => c.vouchersCount > 0).length,
    frequentCancellers: mockClients.filter(c => c.cancellationsCount >= 3).length
  }

  // Filtrar y ordenar clientes
  const filteredClients = mockClients
    .filter(client => {
      // Búsqueda por texto
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          client.name.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower) ||
          client.phone.includes(searchTerm)
        if (!matchesSearch) return false
      }

      // Filtro por estado
      if (filters.status === 'blocked' && !client.isBlocked) return false
      if (filters.status === 'with_vouchers' && client.vouchersCount === 0) return false
      if (filters.status === 'frequent_cancellers' && client.cancellationsCount < 3) return false

      return true
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name)
        case 'name_desc':
          return b.name.localeCompare(a.name)
        case 'appointments_desc':
          return b.appointmentsCount - a.appointmentsCount
        case 'cancellations_desc':
          return b.cancellationsCount - a.cancellationsCount
        case 'vouchers_desc':
          return b.vouchersCount - a.vouchersCount
        case 'recent':
        default:
          return new Date(b.lastAppointment) - new Date(a.lastAppointment)
      }
    })

  // Cargar datos iniciales
  useEffect(() => {
    if (currentBusiness?.id) {
      // TODO: Cargar datos reales de la API
      // dispatch(fetchBusinessCustomers(currentBusiness.id))
    }
  }, [currentBusiness])

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      sortBy: 'recent',
      timeRange: '30'
    })
    setSearchTerm('')
  }

  const handleViewClient = (client) => {
    setSelectedClient(client)
  }

  const handleCreateVoucher = (client) => {
    setSelectedClient(client)
    setShowVoucherModal(true)
  }

  const handleVoucherCreated = () => {
    setShowVoucherModal(false)
    // Recargar lista de clientes
    // TODO: Implementar recarga de datos
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <UsersIcon className="h-8 w-8 text-indigo-600 mr-3" />
          Historial de Clientes
        </h2>
        <p className="mt-2 text-gray-600">
          Gestiona tus clientes, revisa su historial de citas, cancelaciones y vouchers.
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Bloqueados</p>
              <p className="text-2xl font-bold text-red-600">{stats.blocked}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <XMarkIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Con Vouchers</p>
              <p className="text-2xl font-bold text-green-600">{stats.withVouchers}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Canceladores Frecuentes</p>
              <p className="text-2xl font-bold text-orange-600">{stats.frequentCancellers}</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Botón de filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters 
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FunnelIcon className="h-5 w-5" />
            <span>Filtros</span>
          </button>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <ClientFilters
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={handleClearFilters}
            />
          </div>
        )}
      </div>

      {/* Lista de clientes */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <ClientList
          clients={filteredClients}
          onViewClient={handleViewClient}
          onCreateVoucher={handleCreateVoucher}
        />
      </div>

      {/* Modal de detalle de cliente */}
      {selectedClient && !showVoucherModal && (
        <ClientDetailModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onCreateVoucher={() => setShowVoucherModal(true)}
        />
      )}

      {/* Modal de creación de voucher */}
      {showVoucherModal && selectedClient && (
        <CreateManualVoucherModal
          client={selectedClient}
          onClose={() => {
            setShowVoucherModal(false)
            setSelectedClient(null)
          }}
          onSuccess={handleVoucherCreated}
        />
      )}
    </div>
  )
}

export default CustomerHistorySection
