import React, { useState, useMemo } from 'react';
import { useOwnerBusinesses } from '@shared/hooks/useOwnerBusinesses';
import CreateManualSubscriptionModal from '../../../components/owner/CreateManualSubscriptionModal';
import SubscriptionStatusBadge from '../../../components/subscription/SubscriptionStatusBadge';
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
    helpers = {},
    actions = {}
  } = useOwnerBusinesses() || {};

  // Modal state for details preview
 
 const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

    // Local state for status change modal reason
    const [statusChangeReason, setStatusChangeReason] = useState('');

  // Filtros locales combinados con los del hook
  const filteredBusinesses = useMemo(() => {
    let filtered = businesses;

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
    // Toggle sort order if sorting by the same field
    const newOrder = sortBy === field && sortOrder === 'DESC' ? 'ASC' : 'DESC';
    setSortBy(field);
    setSortOrder(newOrder);
    helpers.sortBusinesses(field, newOrder);
  };

  const handleExport = async () => {
    try {
      await helpers.exportBusinesses(filters, 'csv');
    } catch (error) {
      console.error('Error exporting businesses:', error);
    }
  };

  const handleCreateBusiness = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  const handleSubscriptionCreated = () => {
    setShowCreateModal(false);
    // Recargar la lista de negocios
    if (actions?.fetchBusinesses) {
      actions.fetchBusinesses();
    }
  };

  // Función para obtener el ícono de estado
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'INACTIVE':
        return <PauseIcon className="w-5 h-5 text-gray-400" />;
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

  // You may need to define availableStatuses if not already defined
  const availableStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TRIAL'];

  return (
    <>
      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* If handleRefresh is not defined, remove this button or define it */}
          {/* <button
            onClick={handleRefresh}
            disabled={loading?.businesses}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading?.businesses ? 'animate-spin' : ''}`} />
            Actualizar
          </button> */}
          
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
            Crear Suscripción Manual
          </button>
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
                  {businessStats?.businesses?.byStatus?.find(s => s.status === 'ACTIVE')?.count || 0}
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
                  {businessStats?.businesses?.byStatus?.find(s => s.status === 'TRIAL')?.count || 0}
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
                  {businessStats?.users?.total || 0}
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
                  {businessStats?.businesses?.total || 0}
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
                {filteredBusinesses.map((business) => {
                  // ...existing code...
                  return (
                    <tr key={business.id} className="hover:bg-gray-50">
                    {/* ID oculto, si no quieres mostrarlo elimina esta columna */}
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{business.id}</td> */}
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
                        {business.users?.[0]?.firstName || ''} {business.users?.[0]?.lastName || ''}
                      </div>
                      <div className="text-sm text-gray-500">
                        {business.users?.[0]?.email || 'N/A'}
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
                      {business.createdAt ? new Date(business.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        // Buscar la suscripción activa o la más reciente
                        const activeSub = business.subscriptions?.find(sub => sub.status === 'ACTIVE');
                        const currentSub = activeSub || business.subscriptions?.[0];
                        
                        return currentSub ? (
                          <div className="space-y-2">
                            {/* Plan name */}
                            <div className="text-sm font-medium text-gray-900">
                              {currentSub.plan?.name || 'Plan'}
                            </div>
                            
                            {/* Status badge with trial/payment distinction */}
                            <SubscriptionStatusBadge 
                              subscription={currentSub} 
                              compact={false}
                              showDetails={false}
                            />
                            
                            {/* Dates */}
                            <div className="text-xs text-gray-500 space-y-0.5">
                              {currentSub.status === 'TRIAL' ? (
                                <>
                                  <div>Trial termina: {currentSub.trialEndDate ? new Date(currentSub.trialEndDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}</div>
                                  <div className="text-blue-600 font-medium">
                                    Primer cobro: {currentSub.trialEndDate ? new Date(currentSub.trialEndDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div>Inicio: {currentSub.startDate ? new Date(currentSub.startDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}</div>
                                  <div>Vence: {currentSub.endDate ? new Date(currentSub.endDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}</div>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <XCircleIcon className="w-4 h-4" />
                            Sin suscripción
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedBusiness(business)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                          title="Ver detalles"
                        >
                          <EyeIcon className="w-4 h-4" />
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
 
 
  {/* Business Details Modal */}
  {selectedBusiness && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-lg md:max-w-2xl xl:max-w-3xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-lg relative">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              {selectedBusiness.logo ? (
                <img src={selectedBusiness.logo} alt={selectedBusiness.name} className="w-12 h-12 rounded-full object-cover bg-indigo-100" />
              ) : (
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-indigo-600" />
                </div>
              )}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedBusiness.name}</h2>
                <p className="text-sm text-gray-500 font-mono">ID: {selectedBusiness.id}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedBusiness.status)}`}>{getStatusIcon(selectedBusiness.status)}{helpers?.formatBusinessStatus(selectedBusiness.status).label}</span>
              <span className="text-xs text-gray-500">Creado: {helpers?.formatDate(selectedBusiness.createdAt)}</span>
            </div>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setSelectedBusiness(null)}><span className="text-xl">×</span></button>
          </div>

          {/* Grid de información */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Información del negocio */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold  text-gray-900 border-b pb-2">Información del Negocio</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm text-gray-900">{selectedBusiness.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Teléfono:</span>
                 
                  <span className="text-sm text-gray-900">{selectedBusiness.phone ? selectedBusiness.phone : <span className="text-gray-400">N/A</span>}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dirección:</span>
                  <span className="text-sm text-gray-900">{selectedBusiness.address || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ciudad:</span>
                  <span className="text-sm text-gray-900">{selectedBusiness.city || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">País:</span>
                  <span className="text-sm text-gray-900">{selectedBusiness.country || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tipo:</span>
                  <span className="text-sm text-gray-900">{selectedBusiness.businessType || 'Negocio'}</span>
                </div>
              </div>
            </div>

            {/* Información del propietario */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Propietario</h3>
              {selectedBusiness.users?.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Nombre:</span>
                    <span className="text-sm text-gray-900">{selectedBusiness.users[0].firstName} {selectedBusiness.users[0].lastName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm text-gray-900">{selectedBusiness.users[0].email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Teléfono:</span>
                    
                    <span className="text-sm text-gray-900">{selectedBusiness.users[0].phone ? selectedBusiness.users[0].phone : <span className="text-gray-400">N/A</span>}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Rol:</span>
                    <span className="text-sm text-gray-900">{selectedBusiness.users[0].role}</span>
                  </div>
                </div>
              ) : (
                <span className="text-sm text-gray-500">No hay propietario asignado.</span>
              )}
            </div>
          </div>

          {/* Suscripciones */}
          <div className="mb-6">
            <h3 className="text-lg text-center bg-slate-200 font-semibold text-gray-900 mb-3">Suscripciones</h3>
            {selectedBusiness.subscriptions?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm mb-2 border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-center font-semibold text-gray-700">Plan</th>
                      <th className="px-4 py-2 text-center font-semibold text-gray-700">Ciclo</th>
                      <th className="px-4 py-2 text-center font-semibold text-gray-700">Estado</th>
                      <th className="px-4 py-2 text-center font-semibold text-gray-700">Inicio</th>
                      <th className="px-4 py-2 text-center font-semibold text-gray-700">Fin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBusiness.subscriptions.map((sub, idx) => (
                      <tr key={sub.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 text-gray-900 text-center">{sub.plan?.name || <span className="text-gray-400">N/A</span>}</td>
                        <td className="px-4 py-2 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            sub.billingCycle === 'ANNUAL' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {sub.billingCycle === 'ANNUAL' ? '📅 Anual' : '📆 Mensual'}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {sub.status ? (
                            <span className="inline-flex items-center text-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{sub.status}</span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-gray-900 text-center">{sub.startDate ? helpers?.formatDate(sub.startDate) : <span className="text-gray-400">N/A</span>}</td>
                        <td className="px-4 py-2 text-gray-900 text-center">{sub.endDate ? helpers?.formatDate(sub.endDate) : <span className="text-gray-400">N/A</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <span className="text-sm text-gray-500">No hay suscripciones registradas.</span>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">Última actualización: {helpers?.formatDate(selectedBusiness.updatedAt)}</div>
            <button onClick={() => setSelectedBusiness(null)} className="w-full sm:w-auto px-6 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  )}
                    </td>
                  </tr>
                  );
                })}
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

        {/* Status Change Modal */}
        {ui?.showStatusChangeModal && ui?.selectedBusinessForStatus ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-md md:max-w-lg h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-lg relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => (helpers.closeStatusChangeModal ? helpers.closeStatusChangeModal() : actions.closeStatusChangeModal())}
                aria-label="Cerrar"
              >×</button>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  {ui.selectedBusinessForStatus.logo ? (
                    <img src={ui.selectedBusinessForStatus.logo} alt={ui.selectedBusinessForStatus.name} className="w-10 h-10 rounded-full object-cover bg-indigo-100" />
                  ) : (
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <BuildingOfficeIcon className="w-6 h-6 text-indigo-600" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{ui.selectedBusinessForStatus.name}</h2>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ui.selectedBusinessForStatus.status)}`}>{getStatusIcon(ui.selectedBusinessForStatus.status)}{helpers?.formatBusinessStatus(ui.selectedBusinessForStatus.status).label}</span>
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="statusChangeReason" className="block text-sm font-medium text-gray-700 mb-1">Motivo del cambio de estado</label>
                  <textarea
                    id="statusChangeReason"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    rows={2}
                    value={statusChangeReason}
                    onChange={e => setStatusChangeReason(e.target.value)}
                    placeholder="Ejemplo: Desactivado por falta de pago, activado por solicitud, etc."
                  />
                </div>
                <div className="flex flex-col gap-2 mt-6">
                  {/* Show all business status options */}
                  {['ACTIVE', 'INACTIVE', 'SUSPENDED'].map((statusOption) => (
                    <button
                      key={statusOption}
                      className={`w-full px-6 py-2 text-white text-sm rounded-md transition-colors ${
                        statusOption === 'ACTIVE' ? 'bg-green-600 hover:bg-green-700' :
                        statusOption === 'INACTIVE' ? 'bg-gray-600 hover:bg-gray-700' :
                        statusOption === 'SUSPENDED' ? 'bg-yellow-500 hover:bg-yellow-600' :
                       
                        'bg-gray-400'
                      }`}
                      disabled={loading?.changingStatus || ui.selectedBusinessForStatus.status === statusOption}
                      onClick={async () => {
                        if (statusOption === 'ACTIVE') await helpers.activateBusiness(ui.selectedBusinessForStatus.id, statusChangeReason);
                        else if (statusOption === 'INACTIVE') await helpers.deactivateBusiness(ui.selectedBusinessForStatus.id, statusChangeReason);
                        else if (statusOption === 'SUSPENDED') await helpers.suspendBusiness(ui.selectedBusinessForStatus.id, statusChangeReason);
                        setStatusChangeReason('');
                        
                      }}
                    >{helpers.formatBusinessStatus(statusOption).label}</button>
                  ))}
                  {/* Cancel button removed, use X button above to close modal */}
                </div>
                {errors?.status && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-2 text-sm text-red-700">
                    {errors.status}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

      {/* Modal para crear suscripción manual */}
      <CreateManualSubscriptionModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSuccess={handleSubscriptionCreated}
      />
    </>
  );
};

export default OwnerBusinessesPage;