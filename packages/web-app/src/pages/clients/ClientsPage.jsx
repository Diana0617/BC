import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '@shared/api/client'
import CreateEditClientModal from './components/CreateEditClientModal'
import ClientDetailModal from './components/ClientDetailModal'

const ClientsPage = () => {
  const { currentBusiness } = useSelector(state => state.business)
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ACTIVE')
  const [showFilters, setShowFilters] = useState(false)
  
  // Paginación
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalClients, setTotalClients] = useState(0)
  const limit = 20

  // Modales
  const [showCreateEditModal, setShowCreateEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [modalMode, setModalMode] = useState('create') // 'create' | 'edit'

  useEffect(() => {
    if (currentBusiness?.id) {
      loadClients()
    }
  }, [currentBusiness, page, statusFilter])

  useEffect(() => {
    // Búsqueda con debounce
    const timer = setTimeout(() => {
      if (searchTerm) {
        handleSearch()
      } else if (currentBusiness?.id) {
        loadClients()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadClients = async () => {
    try {
      setLoading(true)
      const params = {
        page,
        limit,
        status: statusFilter
      }

      const response = await apiClient.get(`/api/business/${currentBusiness.id}/clients`, { params })
      
      setClients(response.data.data || [])
      setTotalPages(response.data.totalPages || 1)
      setTotalClients(response.data.total || 0)
    } catch (error) {
      console.error('Error cargando clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadClients()
      return
    }

    try {
      setLoading(true)
      const response = await apiClient.get(`/api/business/${currentBusiness.id}/clients/search`, {
        params: { q: searchTerm }
      })
      
      setClients(response.data.data || [])
      setTotalPages(1)
    } catch (error) {
      console.error('Error buscando clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClient = () => {
    setSelectedClient(null)
    setModalMode('create')
    setShowCreateEditModal(true)
  }

  const handleEditClient = (client) => {
    setSelectedClient(client)
    setModalMode('edit')
    setShowCreateEditModal(true)
  }

  const handleViewClient = (client) => {
    setSelectedClient(client)
    setShowDetailModal(true)
  }

  const handleClientSaved = () => {
    setShowCreateEditModal(false)
    setSelectedClient(null)
    loadClients()
  }

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      BLOCKED: 'bg-red-100 text-red-800'
    }
    return badges[status] || badges.ACTIVE
  }

  const getStatusText = (status) => {
    const texts = {
      ACTIVE: 'Activo',
      INACTIVE: 'Inactivo',
      BLOCKED: 'Bloqueado'
    }
    return texts[status] || status
  }

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '-'
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <UserGroupIcon className="w-8 h-8 text-pink-600" />
              Gestión de Clientes
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {totalClients} cliente{totalClients !== 1 ? 's' : ''} registrado{totalClients !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleCreateClient}
            className="inline-flex items-center px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nuevo Cliente
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, email o teléfono..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                <FunnelIcon className="w-5 h-5 mr-2" />
                Filtros
              </button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 self-center">Estado:</span>
                {['ACTIVE', 'INACTIVE', 'BLOCKED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status)
                      setPage(1)
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      statusFilter === status
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {getStatusText(status)}
                  </button>
                ))}
                {statusFilter && (
                  <button
                    onClick={() => setStatusFilter('')}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    <XMarkIcon className="w-4 h-4 inline mr-1" />
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Clients List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay clientes</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'No se encontraron resultados' : 'Comienza agregando tu primer cliente'}
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCreateClient}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Nuevo Cliente
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Edad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registro
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-medium">
                              {client.firstName[0]}{client.lastName[0]}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {client.firstName} {client.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{client.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {client.phone && (
                            <div className="flex items-center text-sm text-gray-900">
                              <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                              {client.phone}
                            </div>
                          )}
                          {client.phoneSecondary && (
                            <div className="flex items-center text-sm text-gray-500">
                              <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                              {client.phoneSecondary}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateAge(client.dateOfBirth)} años
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(client.status)}`}>
                          {getStatusText(client.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(client.createdAt).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleViewClient(client)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Ver detalles"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEditClient(client)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                            title="Editar"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{(page - 1) * limit + 1}</span> a{' '}
                    <span className="font-medium">{Math.min(page * limit, totalClients)}</span> de{' '}
                    <span className="font-medium">{totalClients}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Página {page} de {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateEditModal && (
        <CreateEditClientModal
          isOpen={showCreateEditModal}
          onClose={() => {
            setShowCreateEditModal(false)
            setSelectedClient(null)
          }}
          mode={modalMode}
          client={selectedClient}
          onSuccess={handleClientSaved}
        />
      )}

      {showDetailModal && selectedClient && (
        <ClientDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedClient(null)
          }}
          client={selectedClient}
          onEdit={() => {
            setShowDetailModal(false)
            handleEditClient(selectedClient)
          }}
        />
      )}
    </div>
  )
}

export default ClientsPage
