import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  UsersIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  PlusIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '@shared/api/client'
import toast from 'react-hot-toast'

// Importar componentes de la página de clientes
import ClientList from '../../customers/components/ClientList'
import ClientFilters from '../../customers/components/ClientFilters'
import CreateManualVoucherModal from '../../customers/components/CreateManualVoucherModal'
import ClientDetailModal from '../../customers/components/ClientDetailModal'
import CreateClientModal from '../../customers/components/CreateClientModal'

const CustomerHistorySection = () => {
  const { currentBusiness } = useSelector(state => state.business)

  // Estados locales
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [showVoucherModal, setShowVoucherModal] = useState(false)
  const [showCreateClientModal, setShowCreateClientModal] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'recent',
    timeRange: '30'
  })

  // Cargar clientes desde la API
  const loadClients = async () => {
    if (!currentBusiness?.id) return

    setLoading(true)
    try {
      const response = await apiClient.get(
        `/api/business/${currentBusiness.id}/clients`,
        {
          params: {
            search: searchTerm,
            status: filters.status,
            sortBy: filters.sortBy,
            timeRange: filters.timeRange
          }
        }
      )

      if (response.data.success) {
        setClients(response.data.data)
      }
    } catch (error) {
      console.error('Error loading clients:', error)
      toast.error('Error al cargar los clientes')
      // En caso de error, usar array vacío
      setClients([])
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos iniciales y cuando cambien los filtros
  useEffect(() => {
    loadClients()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBusiness?.id, searchTerm, filters])

  // Calcular estadísticas
  const stats = {
    total: clients.length,
    blocked: clients.filter(c => c.isBlocked).length,
    withVouchers: clients.filter(c => c.activeVouchersCount > 0).length,
    withConsents: clients.filter(c => c.consentsCount > 0).length,
    frequentCancellers: clients.filter(c => c.cancellationsCount >= 3).length
  }

  // Filtrado local adicional (el backend ya hace el filtrado principal)
  const filteredClients = clients

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
    loadClients() // Recargar lista
  }

  const handleClientCreated = () => {
    setShowCreateClientModal(false)
    loadClients() // Recargar lista
  }

  const handleClientUpdated = (updatedClient) => {
    // Actualizar el cliente en la lista local
    setClients(prevClients => 
      prevClients.map(c => c.id === updatedClient.id ? updatedClient : c)
    )
    // Actualizar el cliente seleccionado si está abierto
    setSelectedClient(updatedClient)
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <UsersIcon className="h-8 w-8 text-indigo-600 mr-3" />
            Historial de Clientes
          </h2>
          <p className="mt-2 text-gray-600">
            Gestiona tus clientes, revisa su historial de citas, cancelaciones y vouchers.
          </p>
        </div>
        <button
          onClick={() => setShowCreateClientModal(true)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <ClipboardDocumentListIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Con Consentimientos</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.withConsents}</p>
            </div>
            <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <ClipboardDocumentListIcon className="h-6 w-6 text-indigo-600" />
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
            <span className="text-gray-600">Cargando clientes...</span>
          </div>
        ) : (
          <ClientList
            clients={filteredClients}
            onClientClick={handleViewClient}
            onCreateVoucher={handleCreateVoucher}
          />
        )}
      </div>

      {/* Modal de detalle de cliente */}
      {selectedClient && !showVoucherModal && (
        <ClientDetailModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onCreateVoucher={() => setShowVoucherModal(true)}
          onClientUpdated={handleClientUpdated}
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

      {/* Modal de creación de cliente */}
      {showCreateClientModal && (
        <CreateClientModal
          onClose={() => setShowCreateClientModal(false)}
          onSuccess={handleClientCreated}
        />
      )}
    </div>
  )
}

export default CustomerHistorySection
