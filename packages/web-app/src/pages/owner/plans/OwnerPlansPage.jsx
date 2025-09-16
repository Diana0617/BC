import React, { useEffect, useState } from 'react';
import { useOwnerPlans, useOwnerModules } from '@shared';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { CreatePlanModal } from './components/CreatePlanModal';
import { EditPlanModal } from './components/EditPlanModal';
import { DeletePlanModal } from './components/DeletePlanModal';
import { ViewPlanModal } from './components/ViewPlanModal';

const OwnerPlansPage = () => {
  const { 
    plans, 
    totalPlans,
    loading, 
    showCreateModal,
    showEditModal,
    showDeleteModal,
    showViewModal,
    editingPlan,
    selectedPlan,
    actions, 
    helpers,
    filters,
    pagination,
    computed 
  } = useOwnerPlans();

  // Cargar módulos disponibles para los formularios
  const { actions: moduleActions } = useOwnerModules();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Cargar planes al montar el componente
  useEffect(() => {
    helpers.refresh();
    // También cargar módulos para los formularios
    moduleActions.fetchModules();
  }, []);

  // Manejar búsqueda
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    helpers.searchPlans(value);
  };

  // Manejar filtro por estado
  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    helpers.filterPlans({ status, sortBy, sortOrder });
  };

  // Manejar ordenamiento
  const handleSort = (field) => {
    const newOrder = sortBy === field && sortOrder === 'DESC' ? 'ASC' : 'DESC';
    setSortBy(field);
    setSortOrder(newOrder);
    helpers.filterPlans({ status: filterStatus, sortBy: field, sortOrder: newOrder });
  };

  // Mapeo de estados para traducción
  const statusLabels = {
    'all': 'Todos',
    'ACTIVE': 'Activos',
    'INACTIVE': 'Inactivos',
    'DEPRECATED': 'Depreciados'
  };

  const statusColors = {
    'ACTIVE': 'bg-green-100 text-green-800',
    'INACTIVE': 'bg-yellow-100 text-yellow-800',
    'DEPRECATED': 'bg-red-100 text-red-800'
  };

  const statusIcons = {
    'ACTIVE': CheckCircleIcon,
    'INACTIVE': ExclamationTriangleIcon,
    'DEPRECATED': XCircleIcon
  };

  // Formatear precio
  const formatPrice = (price, currency = 'COP') => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Gestión de Planes
            </h1>
            <p className="text-gray-600">
              Administra los planes de suscripción y sus módulos
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => {
                helpers.openCreateModal();
              }}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nuevo Plan
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClipboardDocumentListIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Planes</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{totalPlans}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Planes Activos</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                {plans.filter(plan => plan.status === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Suscripciones</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                {plans.reduce((acc, plan) => acc + (plan.subscriptionsCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Ingresos Est.</p>
              <p className="text-base sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate">
                {formatPrice(plans.reduce((acc, plan) => acc + ((plan.price || 0) * (plan.subscriptionsCount || 0)), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de filtro y búsqueda */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Búsqueda */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Buscar planes..."
                />
              </div>
            </div>

            {/* Filtros de estado */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusLabels).map(([status, label]) => (
                <button
                  key={status}
                  onClick={() => handleStatusFilter(status)}
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                    filterStatus === status
                      ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  } border whitespace-nowrap`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de planes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Vista Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Plan</span>
                    <AdjustmentsHorizontalIcon className="h-4 w-4" />
                  </div>
                </th>
                <th 
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Precio</span>
                    <AdjustmentsHorizontalIcon className="h-4 w-4" />
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Módulos
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Suscripciones
                </th>
                <th 
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Creado</span>
                    <AdjustmentsHorizontalIcon className="h-4 w-4" />
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center space-x-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      <span className="text-gray-500">Cargando planes...</span>
                    </div>
                  </td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium mb-2">No hay planes disponibles</p>
                      <p className="text-sm">Crea tu primer plan para comenzar</p>
                    </div>
                  </td>
                </tr>
              ) : (
                plans.map((plan) => {
                  const StatusIcon = statusIcons[plan.status];
                  
                  return (
                    <tr key={plan.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {plan.name}
                            </div>
                            {plan.isPopular && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                Popular
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {plan.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(plan.price, plan.currency)}
                        </div>
                        <div className="text-sm text-gray-500">
                          por {plan.durationType === 'MONTHS' ? 'mes' : 'año'}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {plan.duration} {plan.durationType === 'MONTHS' ? 'mes(es)' : 'año(s)'}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {plan.planModules && plan.planModules.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                {plan.planModules.length} módulo{plan.planModules.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Sin módulos</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <StatusIcon className="h-4 w-4 mr-2" />
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[plan.status]}`}>
                            {statusLabels[plan.status] || plan.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UsersIcon className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="text-sm text-gray-900">{plan.subscriptionsCount || 0}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(plan.createdAt)}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
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
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => helpers.openDeleteModal(plan)}
                            disabled={loading || (plan.subscriptionsCount > 0)}
                            className={`${
                              plan.subscriptionsCount > 0
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-red-600 hover:text-red-900'
                            }`}
                            title={plan.subscriptionsCount > 0 ? 'No se puede eliminar: tiene suscripciones activas' : 'Eliminar'}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Vista Mobile/Tablet - Cards */}
        <div className="lg:hidden">
          {loading ? (
            <div className="p-6 text-center">
              <div className="flex justify-center items-center space-x-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="text-gray-500">Cargando planes...</span>
              </div>
            </div>
          ) : plans.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-gray-500">
                <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-2">No hay planes disponibles</p>
                <p className="text-sm">Crea tu primer plan para comenzar</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {plans.map((plan) => {
                const StatusIcon = statusIcons[plan.status];
                
                return (
                  <div key={plan.id} className="p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-base font-medium text-gray-900 truncate">
                            {plan.name}
                          </h3>
                          {plan.isPopular && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              Popular
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                          {plan.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                          <div>
                            <span className="text-gray-500">Precio:</span>
                            <p className="font-medium text-gray-900">
                              {formatPrice(plan.price, plan.currency)}
                              <span className="text-xs text-gray-500 ml-1">
                                /{plan.durationType === 'MONTHS' ? 'mes' : 'año'}
                              </span>
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-gray-500">Duración:</span>
                            <p className="font-medium text-gray-900">
                              {plan.duration} {plan.durationType === 'MONTHS' ? 'mes(es)' : 'año(s)'}
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-gray-500">Módulos:</span>
                            <p className="font-medium text-gray-900">
                              {plan.planModules && plan.planModules.length > 0 ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                  {plan.planModules.length} módulo{plan.planModules.length > 1 ? 's' : ''}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">Sin módulos</span>
                              )}
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-gray-500">Suscripciones:</span>
                            <p className="font-medium text-gray-900 flex items-center">
                              <UsersIcon className="h-3 w-3 mr-1 text-gray-400" />
                              {plan.subscriptionsCount || 0}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <StatusIcon className="h-4 w-4 mr-2" />
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[plan.status]}`}>
                              {statusLabels[plan.status] || plan.status}
                            </span>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            {formatDate(plan.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Acciones en mobile */}
                    <div className="mt-4 flex justify-end space-x-2">
                      <button
                        onClick={() => helpers.selectPlan(plan.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <EyeIcon className="h-3 w-3 mr-1" />
                        Ver
                      </button>
                      
                      <button
                        onClick={() => helpers.openEditModal(plan)}
                        disabled={loading}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-blue-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        <PencilIcon className="h-3 w-3 mr-1" />
                        Editar
                      </button>
                      
                      <button
                        onClick={() => helpers.openDeleteModal(plan)}
                        disabled={loading || (plan.subscriptionsCount > 0)}
                        className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded ${
                          plan.subscriptionsCount > 0
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-700 hover:bg-gray-50'
                        } bg-white`}
                      >
                        <TrashIcon className="h-3 w-3 mr-1" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Paginación */}
        {plans.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Mostrando {Math.min(plans.length, 1)} a{' '}
                {plans.length} de{' '}
                {plans.length} planes
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => helpers.goToPage(pagination.page - 1)}
                  disabled={!computed.hasPrevPage}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => helpers.goToPage(pagination.page + 1)}
                  disabled={!computed.hasNextPage}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      {showCreateModal && (
        <CreatePlanModal 
          isOpen={showCreateModal}
          onClose={helpers.closeModals} 
        />
      )}

      {showEditModal && editingPlan && (
        <EditPlanModal 
          isOpen={showEditModal}
          plan={editingPlan}
          onClose={helpers.closeModals}
        />
      )}

      {showDeleteModal && editingPlan && (
        <DeletePlanModal 
          isOpen={showDeleteModal}
          plan={editingPlan}
          onClose={helpers.closeModals}
        />
      )}

      {showViewModal && (
        <ViewPlanModal 
          isOpen={showViewModal}
          onClose={helpers.closeModals}
        />
      )}
    </div>
  );
};

export default OwnerPlansPage;