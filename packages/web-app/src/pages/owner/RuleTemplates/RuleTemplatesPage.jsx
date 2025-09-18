import React, { useEffect } from 'react'
import { Plus, Search, Filter, BarChart3, RefreshCw, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import useRuleTemplates from '../../../../../shared/src/hooks/useRuleTemplates'
import RuleTemplateCard from './components/RuleTemplateCard'
import CreateTemplateModal from './components/CreateTemplateModal'
import EditTemplateModal from './components/EditTemplateModal'
import ViewTemplateModal from './components/ViewTemplateModal'
import DeleteTemplateModal from './components/DeleteTemplateModal'
import FilterPanel from './components/FilterPanel'
import StatsPanel from './components/StatsPanel'
import EmptyState from './components/EmptyState'
import LoadingSpinner from '../../../components/common/LoadingSpinner'

const RuleTemplatesPage = () => {
  const {
    // Data
    filteredTemplates,
    currentTemplate,
    stats,
    filters,
    modals,
    
    // States
    loading,
    errors,
    hasTemplates,
    hasFilters,
    activeTemplatesCount,
    totalUsageCount,
    uniqueCategories,
    uniqueBusinessTypes,
    
    // Actions
    loadOwnerTemplates,
    loadStats,
    syncRules,
    
    // Filters
    updateFilters,
    resetFilters,
    
    // Modals
    openTemplateModal,
    closeTemplateModal,
    
    // Messages
    clearTemplateErrors
  } = useRuleTemplates()

  // ================================
  // EFFECTS
  // ================================
  
  useEffect(() => {
    loadOwnerTemplates()
    // loadStats() // NO IMPLEMENTADO EN BACKEND
  }, [loadOwnerTemplates]) // Removido loadStats de dependencias

  useEffect(() => {
    if (errors.templates) {
      console.error('Error loading templates:', errors.templates)
    }
  }, [errors.templates])

  // ================================
  // HANDLERS
  // ================================
  
  const handleCreateTemplate = () => {
    openTemplateModal('createTemplate')
  }

  const handleEditTemplate = (template) => {
    openTemplateModal('editTemplate', template)
  }

  const handleViewTemplate = (template) => {
    openTemplateModal('viewTemplate', template)
  }

  const handleDeleteTemplate = (template) => {
    openTemplateModal('deleteTemplate', template)
  }

  const handleViewStats = () => {
    // openTemplateModal('viewStats') // NO IMPLEMENTADO
    toast.error('Funcionalidad de estadísticas no disponible aún')
  }

  const handleSyncRules = async () => {
    // NO IMPLEMENTADO EN BACKEND
    toast.error('Funcionalidad de sincronización no disponible aún')
    // const success = await syncRules()
    // if (success) {
    //   toast.success('Reglas sincronizadas exitosamente')
    //   await loadOwnerTemplates() // Refresh data after sync
    // } else {
    //   toast.error('Error al sincronizar reglas')
    // }
  }

  const handleSearchChange = (searchTerm) => {
    updateFilters({ search: searchTerm })
  }

  const handleFilterChange = (filterKey, value) => {
    updateFilters({ [filterKey]: value })
  }

  const handleClearFilters = () => {
    resetFilters()
  }

  // ================================
  // RENDER ERROR STATE
  // ================================
  
  if (errors.templates && !loading.templates) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Error al cargar las plantillas
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {errors.templates}
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  clearTemplateErrors()
                  loadOwnerTemplates()
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ================================
  // RENDER LOADING STATE
  // ================================
  
  if (loading.templates && !hasTemplates) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  // ================================
  // MAIN RENDER
  // ================================
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
                Plantillas de Reglas
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona las plantillas de reglas para tus negocios
              </p>
            </div>
            <div className="mt-4 flex md:ml-4 md:mt-0 space-x-3">
              <button
                onClick={handleViewStats}
                disabled={true} // Deshabilitado hasta implementar en backend
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Próximamente - En desarrollo"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Estadísticas
              </button>
              
              <button
                onClick={handleSyncRules}
                disabled={true} // Deshabilitado hasta implementar en backend
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Próximamente - En desarrollo"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar
              </button>
              
              <button
                onClick={handleCreateTemplate}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Plantilla
              </button>
            </div>
          </div>
          
          {/* Stats Summary */}
          {stats && (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">T</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Plantillas
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.totalTemplates || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">A</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Activas
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {activeTemplatesCount}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">U</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Usos
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {totalUsageCount}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">C</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Categorías
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {uniqueCategories.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mb-6 bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Buscar plantillas..."
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <FilterPanel
                  filters={filters}
                  uniqueCategories={uniqueCategories}
                  uniqueBusinessTypes={uniqueBusinessTypes}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                  hasFilters={hasFilters}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        {!hasTemplates ? (
          <EmptyState onCreateTemplate={handleCreateTemplate} />
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No hay plantillas que coincidan con los filtros
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Intenta ajustar los filtros o crear una nueva plantilla.
            </p>
            <div className="mt-6">
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTemplates.map((template) => (
              <RuleTemplateCard
                key={template.id}
                template={template}
                onView={() => handleViewTemplate(template)}
                onEdit={() => handleEditTemplate(template)}
                onDelete={() => handleDeleteTemplate(template)}
                loading={loading.update || loading.delete}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        <CreateTemplateModal
          isOpen={modals.createTemplate}
          onClose={() => closeTemplateModal('createTemplate')}
        />

        <EditTemplateModal
          isOpen={modals.editTemplate}
          template={currentTemplate}
          onClose={() => closeTemplateModal('editTemplate')}
        />

        <ViewTemplateModal
          isOpen={modals.viewTemplate}
          template={currentTemplate}
          onClose={() => closeTemplateModal('viewTemplate')}
        />

        <DeleteTemplateModal
          isOpen={modals.deleteTemplate}
          template={currentTemplate}
          onClose={() => closeTemplateModal('deleteTemplate')}
        />

        <StatsPanel
          isOpen={modals.viewStats}
          stats={stats}
          onClose={() => closeTemplateModal('viewStats')}
        />
      </div>
    </div>
  )
}

export default RuleTemplatesPage