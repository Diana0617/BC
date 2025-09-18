import React, { useState, useMemo } from 'react';
import { useOwnerBusinesses } from '@shared/hooks/useOwnerBusinesses';
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  EyeIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';

const OwnerBusinessesPage = () => {
  const {
    businesses = [],
    businessStats,
    pagination = {},
    filters = {},
    loading = {},
    errors = {},
    ui = {},
    computed = {},
    helpers = {}
  } = useOwnerBusinesses() || {};

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Filtros locales combinados con los del hook
  const filteredBusinesses = useMemo(() => {
    let filtered = [...businesses];

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(business =>
        business.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.id.toString().includes(searchTerm)
      );
    }

    // Filtro por estado
    if (statusFilter) {
      filtered = filtered.filter(business => business.status === statusFilter);
    }

    return filtered;
  }, [businesses, searchTerm, statusFilter]);

  // Manejadores de eventos
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value === '') {
      helpers.clearAllFilters();
    } else {
      helpers.searchBusinesses(value);
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
    helpers.sortBusinesses(field, newOrder);
  };

  const handleRefresh = () => {
    helpers.refresh();
  };

  const handleExport = async () => {
    try {
      await helpers.exportBusinesses(filters, 'csv');
    } catch (error) {
      console.error('Error exporting businesses:', error);
    }
  };

  const handleCreateBusiness = () => {
    helpers.startBusinessCreation();
  };

  // Función para obtener el ícono de estado
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'INACTIVE':
        return <PauseIcon className="w-5 h-5 text-gray-500" />;
      case 'SUSPENDED':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'TRIAL':
        return <ExclamationTriangleIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <PauseIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  // Función para obtener el color del estado
  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'INACTIVE': 'bg-gray-100 text-gray-800',
      'SUSPENDED': 'bg-red-100 text-red-800',
      'TRIAL': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Estados de filtros únicos
  const availableStatuses = useMemo(() => {
    const statuses = [...new Set(businesses.map(business => business.status))];
    return statuses;
  }, [businesses]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <BuildingOfficeIcon className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Negocios</h1>
              <p className="text-gray-600">Gestiona todos los negocios de la plataforma</p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading?.businesses}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading?.businesses ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              Exportar
            </button>

            <button
              onClick={handleCreateBusiness}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <PlusIcon className="w-4 h-4" />
              Crear Negocio
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {businessStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {businessStats.activeBusinesses || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">En Prueba</p>
                <p className="text-2xl font-bold text-gray-900">
                  {businessStats.trialBusinesses || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">
                  {businessStats.totalUsers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <BuildingOfficeIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {businessStats.totalBusinesses || 0}
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
                placeholder="Buscar por nombre, propietario, email o ID..."
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
                  {helpers.formatBusinessStatus(status).label}
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

      {/* Businesses Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {loading?.businesses ? (
          <div className="p-8 text-center">
            <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-4" />
            <p className="text-gray-600">Cargando negocios...</p>
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="p-8 text-center">
            <BuildingOfficeIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay negocios</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter 
                ? 'No se encontraron negocios que coincidan con los filtros.'
                : 'Aún no hay negocios registrados.'}
            </p>
            <button
              onClick={handleCreateBusiness}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              <PlusIcon className="w-4 h-4" />
              Crear Primer Negocio
            </button>
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
                    onClick={() => handleSort('name')}
                  >
                    Negocio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propietario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuarios
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('createdAt')}
                  >
                    Fecha Creación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suscripción
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBusinesses.map((business) => (
                  <tr key={business.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{business.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {business.logo ? (
                          <img
                            src={business.logo}
                            alt={business.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <BuildingOfficeIcon className="w-4 h-4 text-indigo-600" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {business.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {business.businessType || 'Negocio'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {business.owner?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {business.owner?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(business.status)}`}>
                        {getStatusIcon(business.status)}
                        {helpers?.formatBusinessStatus(business.status).label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <UserGroupIcon className="w-4 h-4" />
                        {business.userCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {helpers?.formatDate(business.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {business.activeSubscription ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {business.activeSubscription.plan?.name || 'Plan'}
                          </div>
                          <div className="text-gray-500">
                            Vence: {helpers.formatDate(business.activeSubscription.endDate)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Sin suscripción</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => helpers?.viewBusinessDetails(business)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                          title="Ver detalles"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => helpers?.editBusiness(business)}
                          className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded"
                          title="Editar"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => helpers?.changeBusinessStatusModal(business)}
                          className={`p-1 rounded ${
                            business.status === 'ACTIVE'
                              ? 'text-red-600 hover:text-red-900 hover:bg-red-50'
                              : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          }`}
                          title={business.status === 'ACTIVE' ? 'Suspender' : 'Activar'}
                        >
                          {business.status === 'ACTIVE' ? (
                            <PauseIcon className="w-4 h-4" />
                          ) : (
                            <PlayIcon className="w-4 h-4" />
                          )}
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
                {Math.min(pagination?.page * pagination?.limit, computed?.totalBusinesses || 0)}
              </span> de{' '}
              <span className="font-medium">{computed?.totalBusinesses || 0}</span> resultados
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
      {errors?.businesses && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircleIcon className="w-5 h-5 text-red-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{errors.businesses}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerBusinessesPage;