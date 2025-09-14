import React, { useEffect, useState } from 'react';
import { useOwnerPlans } from '../../../../shared/src/index.js';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

/**
 * Página principal de gestión de planes del Owner
 */
const OwnerPlansPage = () => {
  const {
    // State
    plans,
    totalPlans,
    pagination,
    filters,
    
    // Loading states
    loading,
    createLoading,
    updateLoading,
    deleteLoading,
    
    // UI State
    showCreateModal,
    showEditModal,
    showDeleteModal,
    editingPlan,
    
    // Helpers
    helpers,
    
    // Computed
    computed
  } = useOwnerPlans();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Cargar planes al montar
  useEffect(() => {
    helpers.refresh();
  }, []);

  // Filtrar en tiempo real
  const handleSearch = (value) => {
    setSearchTerm(value);
    helpers.searchPlans(value);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    helpers.filterPlans({ status: status === 'all' ? undefined : status });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Planes</h1>
          <p className="text-gray-600 mt-1">
            Administra los planes de suscripción de Business Control
          </p>
        </div>
        
        <button
          onClick={helpers.openCreateModal}
          className="flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Nuevo Plan</span>
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar planes..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por estado */}
          <div className="relative">
            <FunnelIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none"
            >
              <option value="all">Todos los estados</option>
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
              <option value="DEPRECATED">Deprecated</option>
            </select>
          </div>

          {/* Estadísticas */}
          <div className="flex items-center justify-end space-x-4 text-sm text-gray-600">
            <span>Total: {totalPlans}</span>
            <span>Mostrando: {plans.length}</span>
          </div>
        </div>
      </div>

      {/* Lista de planes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            <span className="ml-3 text-gray-600">Cargando planes...</span>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              No se encontraron planes
            </div>
            <button
              onClick={helpers.openCreateModal}
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              Crear el primer plan
            </button>
          </div>
        ) : (
          <>
            {/* Tabla de planes */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duración
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Suscripciones
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
                  {plans.map((plan) => (
                    <PlanTableRow 
                      key={plan.id} 
                      plan={plan} 
                      helpers={helpers}
                      loading={updateLoading || deleteLoading}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => helpers.goToPage(pagination.page - 1)}
                    disabled={!computed.hasPrevPage}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => helpers.goToPage(pagination.page + 1)}
                    disabled={!computed.hasNextPage}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    Siguiente
                  </button>
                </div>
                
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando{' '}
                      <span className="font-medium">
                        {((pagination.page - 1) * pagination.itemsPerPage) + 1}
                      </span>{' '}
                      a{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.itemsPerPage, totalPlans)}
                      </span>{' '}
                      de{' '}
                      <span className="font-medium">{totalPlans}</span> resultados
                    </p>
                  </div>
                  
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => helpers.goToPage(pagination.page - 1)}
                        disabled={!computed.hasPrevPage}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      
                      {/* Números de página */}
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const page = i + Math.max(1, pagination.page - 2);
                        return (
                          <button
                            key={page}
                            onClick={() => helpers.goToPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pagination.page
                                ? 'z-10 bg-pink-50 border-pink-500 text-pink-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => helpers.goToPage(pagination.page + 1)}
                        disabled={!computed.hasNextPage}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modales */}
      {showCreateModal && (
        <CreatePlanModal 
          onClose={helpers.closeModals}
          loading={createLoading}
        />
      )}
      
      {showEditModal && editingPlan && (
        <EditPlanModal 
          plan={editingPlan}
          onClose={helpers.closeModals}
          loading={updateLoading}
        />
      )}
      
      {showDeleteModal && editingPlan && (
        <DeletePlanModal 
          plan={editingPlan}
          onClose={helpers.closeModals}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

/**
 * Fila de la tabla de planes
 */
const PlanTableRow = ({ plan, helpers, loading }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { color: 'green', icon: CheckCircleIcon, text: 'Activo' },
      INACTIVE: { color: 'gray', icon: ClockIcon, text: 'Inactivo' },
      DEPRECATED: { color: 'red', icon: XCircleIcon, text: 'Deprecated' }
    };
    
    const config = statusConfig[status] || statusConfig.INACTIVE;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <IconComponent className="h-4 w-4 mr-1" />
        {config.text}
      </span>
    );
  };

  const formatPrice = (price, currency = 'COP') => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency
    }).format(price);
  };

  const formatDuration = (duration, type) => {
    const types = {
      DAYS: 'días',
      MONTHS: 'meses',
      YEARS: 'años'
    };
    return `${duration} ${types[type] || type.toLowerCase()}`;
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-900">
              {plan.name}
              {plan.isPopular && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Popular
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {plan.description?.substring(0, 50)}...
            </div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {formatPrice(plan.price, plan.currency)}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {formatDuration(plan.duration, plan.durationType)}
        </div>
        {plan.trialDays > 0 && (
          <div className="text-xs text-gray-500">
            {plan.trialDays} días de prueba
          </div>
        )}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {plan.statistics?.activeSubscriptions || 0}
        </div>
        <div className="text-xs text-gray-500">
          Total: {plan.statistics?.totalSubscriptions || 0}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(plan.status)}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => helpers.selectPlan(plan.id)}
            className="text-indigo-600 hover:text-indigo-900"
            title="Ver detalles"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => helpers.openEditModal(plan)}
            disabled={loading}
            className="text-pink-600 hover:text-pink-900 disabled:text-gray-400"
            title="Editar"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => helpers.openDeleteModal(plan)}
            disabled={loading}
            className="text-red-600 hover:text-red-900 disabled:text-gray-400"
            title="Eliminar"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

/**
 * Modal para crear plan (placeholder)
 */
const CreatePlanModal = ({ onClose, loading }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Crear Nuevo Plan</h2>
        <p className="text-gray-600 mb-4">
          Modal de creación de plan - Implementar formulario completo
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            disabled={loading}
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:bg-gray-400"
          >
            {loading ? 'Creando...' : 'Crear Plan'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Modal para editar plan (placeholder)
 */
const EditPlanModal = ({ plan, onClose, loading }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Editar Plan: {plan.name}
        </h2>
        <p className="text-gray-600 mb-4">
          Modal de edición de plan - Implementar formulario completo
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            disabled={loading}
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:bg-gray-400"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Modal para confirmar eliminación
 */
const DeletePlanModal = ({ plan, onClose, loading }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-md w-full">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Confirmar Eliminación</h2>
        <p className="text-gray-600 mb-4">
          ¿Estás seguro de que deseas eliminar el plan "<strong>{plan.name}</strong>"?
        </p>
        <p className="text-sm text-red-600 mb-6">
          Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default OwnerPlansPage;