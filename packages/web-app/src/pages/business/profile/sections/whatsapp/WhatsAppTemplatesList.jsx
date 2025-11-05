import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchTemplates,
  syncTemplates,
  deleteTemplate,
  setFilters,
  clearFilters,
  setPagination,
  setSelectedTemplate,
  selectTemplates,
  selectPagination,
  selectFilters,
  selectIsLoading,
  selectIsSyncing,
  selectIsDeleting,
  selectError,
  selectLastSynced
} from '@shared/store/slices/whatsappTemplatesSlice'
import { 
  WhatsAppLoadingState, 
  WhatsAppErrorState, 
  WhatsAppEmptyState,
  TemplateStatusBadge
} from './shared'
import {
  DocumentTextIcon,
  PlusIcon,
  ArrowPathIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

/**
 * WhatsAppTemplatesList Component
 * 
 * Lista de plantillas de WhatsApp con funcionalidades:
 * - Paginación
 * - Filtros por estado y categoría
 * - Sincronización con Meta
 * - Acciones: Crear, Editar, Eliminar
 */
const WhatsAppTemplatesList = ({ onCreateTemplate, onEditTemplate }) => {
  const dispatch = useDispatch()
  
  const templates = useSelector(selectTemplates)
  const pagination = useSelector(selectPagination)
  const filters = useSelector(selectFilters)
  const isLoading = useSelector(selectIsLoading)
  const isSyncing = useSelector(selectIsSyncing)
  const isDeleting = useSelector(selectIsDeleting)
  const error = useSelector(selectError)
  const lastSynced = useSelector(selectLastSynced)

  const [showFilters, setShowFilters] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Load templates on mount and when filters/pagination change
  useEffect(() => {
    dispatch(fetchTemplates({ ...filters, ...pagination }))
  }, [dispatch, filters, pagination])

  const handleSync = async () => {
    const result = await dispatch(syncTemplates())
    if (result.type.endsWith('/fulfilled')) {
      toast.success('✅ Plantillas sincronizadas correctamente')
      dispatch(fetchTemplates({ ...filters, ...pagination }))
    } else {
      toast.error('❌ Error al sincronizar plantillas')
    }
  }

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

  const handleEdit = (template) => {
    dispatch(setSelectedTemplate(template))
    onEditTemplate && onEditTemplate(template)
  }

  const handleDelete = async (templateId) => {
    const result = await dispatch(deleteTemplate(templateId))
    if (result.type.endsWith('/fulfilled')) {
      toast.success('✅ Plantilla eliminada correctamente')
      setDeleteConfirm(null)
    } else {
      toast.error('❌ Error al eliminar plantilla')
    }
  }

  // Loading state
  if (isLoading && templates.length === 0) {
    return <WhatsAppLoadingState variant="list" rows={5} />
  }

  // Error state
  if (error && templates.length === 0) {
    return (
      <WhatsAppErrorState 
        error={error}
        onRetry={() => dispatch(fetchTemplates({ ...filters, ...pagination }))}
        title="Error al cargar plantillas"
      />
    )
  }

  // Empty state
  if (!isLoading && templates.length === 0 && !filters.status && !filters.category) {
    return (
      <WhatsAppEmptyState 
        variant="templates"
        onAction={onCreateTemplate}
        actionLabel="Crear Primera Plantilla"
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Plantillas de Mensaje
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {pagination.total} plantilla{pagination.total !== 1 ? 's' : ''} en total
            {lastSynced && (
              <span className="ml-2 text-gray-500">
                • Última sincronización: {new Date(lastSynced).toLocaleString('es-ES')}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-3 py-2 border ${showFilters ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'} rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors`}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filtros
            {(filters.status || filters.category) && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white">
                {[filters.status, filters.category].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Sync button */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 bg-white rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </button>

          {/* Create button */}
          <button
            onClick={onCreateTemplate}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nueva Plantilla
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <option value="DRAFT">Borrador</option>
                <option value="PENDING">Pendiente</option>
                <option value="APPROVED">Aprobada</option>
                <option value="REJECTED">Rechazada</option>
              </select>
            </div>

            {/* Category filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todas</option>
                <option value="UTILITY">Utilidad</option>
                <option value="MARKETING">Marketing</option>
                <option value="AUTHENTICATION">Autenticación</option>
              </select>
            </div>

            {/* Clear filters button */}
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates grid */}
      {templates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron plantillas
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Intenta con otros filtros o crea una nueva plantilla
          </p>
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Limpiar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-md transition-all"
            >
              {/* Template header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">
                    {template.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {template.language?.toUpperCase()} • {template.category}
                  </p>
                </div>
                <TemplateStatusBadge status={template.status} size="sm" />
              </div>

              {/* Template preview */}
              <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-3 text-sm text-gray-700 line-clamp-3">
                {template.components?.find(c => c.type === 'BODY')?.text || 'Sin contenido'}
              </div>

              {/* Template actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  {new Date(template.createdAt).toLocaleDateString('es-ES')}
                </span>
                
                <div className="flex items-center space-x-2">
                  {/* Edit button */}
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Editar"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>

                  {/* Delete button (only for DRAFT and REJECTED) */}
                  {(template.status === 'DRAFT' || template.status === 'REJECTED') && (
                    <button
                      onClick={() => setDeleteConfirm(template.id)}
                      className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Delete confirmation */}
              {deleteConfirm === template.id && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800 mb-2">
                    ¿Eliminar esta plantilla?
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDelete(template.id)}
                      disabled={isDeleting}
                      className="flex-1 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      {isDeleting ? 'Eliminando...' : 'Confirmar'}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
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
            {pagination.total} plantillas
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
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

export default WhatsAppTemplatesList
