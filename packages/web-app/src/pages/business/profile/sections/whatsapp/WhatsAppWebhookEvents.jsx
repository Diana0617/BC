import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchWebhookEvents,
  replayWebhookEvent,
  setFilters,
  clearFilters,
  setPagination,
  selectEvents,
  selectPagination,
  selectFilters,
  selectIsLoading,
  selectIsReplaying,
  selectError
} from '@shared/store/slices/whatsappWebhookEventsSlice'
import { 
  WhatsAppLoadingState, 
  WhatsAppErrorState, 
  WhatsAppEmptyState 
} from './shared'
import WebhookEventCard from './WebhookEventCard'
import {
  BellIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

/**
 * WhatsAppWebhookEvents Component
 * 
 * Log de eventos de webhook con:
 * - Lista de eventos recibidos
 * - Filtros por tipo y fecha
 * - Paginación
 * - Replay de eventos
 */
const WhatsAppWebhookEvents = () => {
  const dispatch = useDispatch()
  
  const events = useSelector(selectEvents)
  const pagination = useSelector(selectPagination)
  const filters = useSelector(selectFilters)
  const isLoading = useSelector(selectIsLoading)
  const isReplaying = useSelector(selectIsReplaying)
  const error = useSelector(selectError)

  const [showFilters, setShowFilters] = useState(false)
  const [replayingEventId, setReplayingEventId] = useState(null)

  // Load events on mount and when filters/pagination change
  useEffect(() => {
    dispatch(fetchWebhookEvents({ ...filters, ...pagination }))
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

  const handleReplay = async (eventId) => {
    setReplayingEventId(eventId)
    const result = await dispatch(replayWebhookEvent(eventId))
    
    if (result.type.endsWith('/fulfilled')) {
      toast.success('✅ Evento re-procesado correctamente')
    } else {
      toast.error('❌ Error al re-procesar el evento')
    }
    setReplayingEventId(null)
  }

  // Loading state
  if (isLoading && events.length === 0) {
    return <WhatsAppLoadingState variant="list" rows={8} />
  }

  // Error state
  if (error && events.length === 0) {
    return (
      <WhatsAppErrorState 
        error={error}
        onRetry={() => dispatch(fetchWebhookEvents({ ...filters, ...pagination }))}
        title="Error al cargar eventos de webhook"
      />
    )
  }

  // Empty state
  if (!isLoading && events.length === 0 && !filters.eventType && !filters.startDate) {
    return <WhatsAppEmptyState variant="webhooks" />
  }

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Registro de Eventos (Webhooks)
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {pagination.total} evento{pagination.total !== 1 ? 's' : ''} registrado{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center px-3 py-2 border ${showFilters ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'} rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors`}
        >
          <FunnelIcon className="h-4 w-4 mr-2" />
          Filtros
          {(filters.eventType || filters.startDate) && (
            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white">
              {[filters.eventType, filters.startDate, filters.endDate].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Event type filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Evento
              </label>
              <select
                value={filters.eventType || ''}
                onChange={(e) => handleFilterChange('eventType', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todos</option>
                <option value="message_status">Actualización de Estado</option>
                <option value="message_received">Mensaje Recibido</option>
                <option value="template_status">Estado de Plantilla</option>
                <option value="account_update">Actualización de Cuenta</option>
                <option value="phone_number_quality_update">Calidad del Número</option>
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

      {/* Events list */}
      {events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
          <BellIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron eventos
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
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="relative">
              <WebhookEventCard event={event} />
              
              {/* Replay button */}
              {!event.processed && (
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => handleReplay(event.id)}
                    disabled={isReplaying && replayingEventId === event.id}
                    className="inline-flex items-center px-3 py-1.5 border border-blue-300 bg-blue-50 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Re-procesar evento"
                  >
                    {isReplaying && replayingEventId === event.id ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-700 mr-1.5"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <ArrowPathIcon className="h-3 w-3 mr-1.5" />
                        Re-procesar
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-700">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} eventos
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
    </div>
  )
}

export default WhatsAppWebhookEvents
