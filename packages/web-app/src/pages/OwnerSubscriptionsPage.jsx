import React, { useState, useMemo, useEffect } from 'react';
import { useOwnerSubscriptions } from '@shared/hooks/useOwnerSubscriptions';
import {
  CreditCardIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  EyeIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const OwnerSubscriptionsPage = () => {
  const {
    subscriptions = [],
    subscriptionStats,
    pagination = {},
    filters = {},
    loading = {},
    errors = {},
    ui = {},
    computed = {},
    helpers = {}
  } = useOwnerSubscriptions() || {};

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Mostrar estadísticas en el dashboard
  useEffect(() => {
    if (subscriptionStats) {
      console.log('Estadísticas de suscripciones:', subscriptionStats);
    }
  }, [subscriptionStats]);

  // Filtros locales combinados con los del hook
  const filteredSubscriptions = useMemo(() => {
    let filtered = [...subscriptions];

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(sub =>
        sub.business?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.plan?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.id.toString().includes(searchTerm)
      );
    }

    // Filtro por estado
    if (statusFilter) {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    return filtered;
  }, [subscriptions, searchTerm, statusFilter]);

  // Manejadores de eventos
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value === '') {
      helpers.clearAllFilters();
    } else {
      helpers.searchSubscriptions(value);
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    helpers.filterByStatus(status);
  };

  const handleSort = (field) => {
    const newOrder = sortBy === field && sortOrder === 'DESC' ? 'ASC' : 'DESC';
    setSortBy(field);
    setSortOrder(newOrder);
    helpers.sortSubscriptions(field, newOrder);
  };

  const handleRefresh = () => {
    helpers.refresh();
  };

  const handleExport = async () => {
    try {
      await helpers.exportSubscriptions(filters, 'csv');
    } catch (error) {
      console.error('Error exporting subscriptions:', error);
    }
  };

  // Función para obtener el ícono de estado
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'EXPIRED':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'CANCELLED':
        return <XCircleIcon className="w-5 h-5 text-gray-500" />;
      case 'PENDING':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'TRIAL':
        return <ExclamationCircleIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  // Función para obtener el color del estado
  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'EXPIRED': 'bg-red-100 text-red-800',
      'CANCELLED': 'bg-gray-100 text-gray-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'TRIAL': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Estados de filtros únicos
  const availableStatuses = useMemo(() => {
    const statuses = [...new Set(subscriptions.map(sub => sub.status))];
    return statuses;
  }, [subscriptions]);

  // Renderizar estadísticas y lista de suscripciones
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <CreditCardIcon className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Suscripciones</h1>
              <p className="text-gray-600">Gestiona todas las suscripciones de la plataforma</p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading?.subscriptions}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading?.subscriptions ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {subscriptionStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscriptionStats.activeSubscriptions || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Por Vencer</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscriptionStats.expiringSubscriptions || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Mensuales</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${subscriptionStats.monthlyRevenue ? subscriptionStats.monthlyRevenue.toLocaleString('es-CO') : '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <CreditCardIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscriptionStats.totalSubscriptions || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por negocio, plan o ID..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Todos los estados</option>
              {availableStatuses.map(status => (
                <option key={status} value={status}>
                                          {helpers?.formatSubscriptionStatus(status).label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                helpers.clearAllFilters();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {loading?.subscriptions ? (
          <div className="p-8 text-center">
            <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-4" />
            <p className="text-gray-600">Cargando suscripciones...</p>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCardIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay suscripciones</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter 
                ? 'No se encontraron suscripciones que coincidan con los filtros.'
                : 'Aún no hay suscripciones registradas.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('id')}
                  >
                    ID
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('business.name')}
                  >
                    Negocio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('startDate')}
                  >
                    Fecha Inicio
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('endDate')}
                  >
                    Fecha Fin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{subscription.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {subscription.business?.name || 'N/A'}
                      </div>
                      {subscription.business?.owner && (
                        <div className="text-sm text-gray-500">
                          {subscription.business.owner.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {subscription.plan?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {subscription.plan?.duration} días
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                        {getStatusIcon(subscription.status)}
                        {helpers.formatSubscriptionStatus(subscription.status).label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {helpers?.formatDate(subscription.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {helpers?.formatDate(subscription.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${subscription.price ? subscription.price.toLocaleString('es-CO') : '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => helpers?.viewSubscriptionDetails(subscription)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                          title="Ver detalles"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {computed?.totalPages > 1 && (
        <div className="bg-white shadow-sm rounded-lg px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{((pagination?.page - 1) * pagination?.limit) + 1}</span> a{' '}
              <span className="font-medium">
                {Math.min(pagination?.page * pagination?.limit, computed?.totalSubscriptions || 0)}
              </span> de{' '}
              <span className="font-medium">{computed?.totalSubscriptions || 0}</span> resultados
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => helpers?.prevPage()}
                disabled={!computed?.hasPrevPage}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(computed?.totalPages || 1, 7) }, (_, i) => {
                  const pageNum = i + 1;
                  const isCurrentPage = pageNum === pagination?.page;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => helpers?.goToPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        isCurrentPage
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => helpers?.nextPage()}
                disabled={!computed?.hasNextPage}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {errors?.subscriptions && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircleIcon className="w-5 h-5 text-red-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{errors.subscriptions}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerSubscriptionsPage;