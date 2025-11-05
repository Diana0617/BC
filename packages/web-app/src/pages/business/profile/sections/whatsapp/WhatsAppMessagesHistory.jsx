import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchMessages,
  fetchMessageById,
  setFilters,
  clearFilters,
  setPagination,
  setSelectedMessage,
  clearSelectedMessage,
  selectMessages,
  selectSelectedMessage,
  selectPagination,
  selectFilters,
  selectIsLoading,
  selectIsLoadingDetail,
  selectError
} from '@shared/store/slices/whatsappMessagesSlice'
import { 
  WhatsAppLoadingState, 
  WhatsAppErrorState, 
  WhatsAppEmptyState,
  MessageStatusBadge
} from '../shared'
import {
  EnvelopeIcon,
  FunnelIcon,
  XMarkIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

/**
 * WhatsAppMessagesHistory Component
 * 
 * Historial de mensajes enviados con:
 * - Tabla con información de mensajes
 * - Filtros por estado, fecha, cliente
 * - Paginación
 * - Vista de detalle
 */
const WhatsAppMessagesHistory = () => {
  const dispatch = useDispatch()
  
  const messages = useSelector(selectMessages)
  const selectedMessage = useSelector(selectSelectedMessage)
  const pagination = useSelector(selectPagination)
  const filters = useSelector(selectFilters)
  const isLoading = useSelector(selectIsLoading)
  const isLoadingDetail = useSelector(selectIsLoadingDetail)
  const error = useSelector(selectError)

  const [showFilters, setShowFilters] = useState(false)
  const [showDetail, setShowDetail] = useState(false)

  // Load messages on mount and when filters/pagination change
  useEffect(() => {
    dispatch(fetchMessages({ ...filters, ...pagination }))
  }, [dispatch, filters, pagination])

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ ...filters, [key]: value }))
    dispatch(setPagination({ ...pagination, page: 1 }))
  }

  const handleClearFilters = () => {
    dispatch(clearFilters())
  }

  const handlePageChange = (newPage) => {
    dispatch(setPagination({ ...pagination, page: newPage }))
  }

  const handleViewDetail = async (message) => {
    dispatch(setSelectedMessage(message))
    setShowDetail(true)
    
    // Load full message details if needed
    if (message.id) {
      await dispatch(fetchMessageById(message.id))
    }
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
    dispatch(clearSelectedMessage())
  }

  // Loading state
  if (isLoading && messages.length === 0) {
    return <WhatsAppLoadingState variant="table" rows={10} />
  }

  // Error state
  if (error && messages.length === 0) {
    return (
      <WhatsAppErrorState 
        error={error}
        onRetry={() => dispatch(fetchMessages({ ...filters, ...pagination }))}
        title="Error al cargar historial de mensajes"
      />
    )
  }

  // Empty state
  if (!isLoading && messages.length === 0 && !filters.status && !filters.startDate) {
    return <WhatsAppEmptyState variant="messages" />
  }

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Historial de Mensajes
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {pagination.total} mensaje{pagination.total !== 1 ? 's' : ''} enviado{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center px-3 py-2 border ${showFilters ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'} rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors`}
        >
          <FunnelIcon className="h-4 w-4 mr-2" />
          Filtros
          {(filters.status || filters.startDate || filters.clientId) && (
            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white">
              {[filters.status, filters.startDate, filters.endDate, filters.clientId].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todos</option>
                <option value="QUEUED">En Cola</option>
                <option value="SENT">Enviado</option>
                <option value="DELIVERED">Entregado</option>
                <option value="READ">Leído</option>
                <option value="FAILED">Fallido</option>
              </select>
            </div>

            {/* Start date filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desde
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* End date filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasta
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Clear filters button */}
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Limpiar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages table */}
      {messages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
          <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron mensajes
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Intenta con otros filtros
          </p>
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Limpiar Filtros
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mensaje
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                        {new Date(message.createdAt).toLocaleString('es-ES')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {message.clientName || 'Cliente desconocido'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {message.to}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-md">
                        {message.content || message.templateName || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <MessageStatusBadge status={message.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetail(message)}
                        className="text-green-600 hover:text-green-900 inline-flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-700">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} mensajes
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1.5 border rounded text-sm font-medium ${
                  page === pagination.page
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {showDetail && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-green-50 border-b border-green-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Detalle del Mensaje
              </h3>
              <button
                onClick={handleCloseDetail}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {isLoadingDetail ? (
                <WhatsAppLoadingState variant="card" />
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Estado</p>
                      <div className="mt-1">
                        <MessageStatusBadge status={selectedMessage.status} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Fecha de Envío</p>
                      <p className="text-sm text-gray-900 mt-1">
                        {new Date(selectedMessage.createdAt).toLocaleString('es-ES')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Cliente</p>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedMessage.clientName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Número</p>
                      <p className="text-sm text-gray-900 mt-1 font-mono">
                        {selectedMessage.to}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">Contenido</p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedMessage.content || selectedMessage.templateName || 'Sin contenido'}
                      </p>
                    </div>
                  </div>

                  {selectedMessage.metaMessageId && (
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-xs font-medium text-gray-500">Meta Message ID</p>
                      <p className="text-sm text-gray-900 mt-1 font-mono">
                        {selectedMessage.metaMessageId}
                      </p>
                    </div>
                  )}

                  {selectedMessage.error && (
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-xs font-medium text-red-600">Error</p>
                      <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-800">{selectedMessage.error}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={handleCloseDetail}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WhatsAppMessagesHistory
