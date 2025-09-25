import React from 'react';
import { useOwnerPlans } from '@shared';
import {
  XMarkIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  TagIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const ViewPlanModal = ({ isOpen, onClose }) => {
  // Obtener el plan seleccionado desde Redux
  const { selectedPlan, selectedPlanLoading } = useOwnerPlans();
  const statusColors = {
    'ACTIVE': 'bg-green-100 text-green-800 border-green-200',
    'INACTIVE': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'DEPRECATED': 'bg-red-100 text-red-800 border-red-200'
  };

  const statusIcons = {
    'ACTIVE': CheckCircleIcon,
    'INACTIVE': ExclamationTriangleIcon,
    'DEPRECATED': XCircleIcon
  };

  const formatPrice = (price, currency = 'COP') => {
    // Convertir string a number si es necesario
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numericPrice);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Validación para evitar errores
  if (!isOpen || !selectedPlan) {
    return null;
  }

  // Si está cargando, mostrar spinner
  if (selectedPlanLoading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl bg-white rounded-md shadow-lg">
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-lg text-gray-600">Cargando plan...</span>
          </div>
        </div>
      </div>
    );
  }

  // Determinar la estructura correcta de los datos del plan
  // Los logs muestran que selectedPlan es directamente el objeto del plan
  const plan = selectedPlan;
  // eslint-disable-next-line no-unused-vars
  const statistics = selectedPlan?.statistics;

  // Validación adicional para asegurar que tenemos los datos del plan
  if (!plan || !plan.id) {
    console.error('🎯 ViewPlanModal - Error: Plan data is missing or invalid', {
      selectedPlan,
      plan,
      planHasId: plan?.id
    });
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl bg-white rounded-md shadow-lg">
          <div className="flex items-center justify-center py-10">
            <div className="text-center">
              <p className="text-lg text-red-600 mb-2">Error al cargar el plan</p>
              <p className="text-sm text-gray-500 mb-4">Datos del plan no disponibles</p>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon = statusIcons[plan.status] || CheckCircleIcon;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 sm:top-8 lg:top-20 mx-auto p-3 sm:p-5 border w-full max-w-xs sm:max-w-2xl lg:max-w-4xl bg-white rounded-md shadow-lg mb-4 sm:mb-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <TagIcon className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-600" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 truncate">
                {plan.name}
              </h3>
              <div className="flex items-center mt-1 flex-wrap gap-1 sm:gap-2">
                <StatusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full border ${statusColors[plan.status]}`}>
                  {plan.status}
                </span>
                {plan.isPopular && (
                  <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    ⭐ <span className="hidden sm:inline ml-1">Popular</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 sm:mt-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Información General */}
            <div className="xl:col-span-2 space-y-4 sm:space-y-6">
              <div>
                <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">Información General</h4>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Descripción</label>
                    <p className="mt-1 text-xs sm:text-sm text-gray-900">{plan.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Precio</label>
                      <div className="mt-1 flex items-center">
                        <CurrencyDollarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-1" />
                        <span className="text-sm sm:text-lg font-semibold text-gray-900">
                          {formatPrice(plan.price, plan.currency)}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Duración</label>
                      <div className="mt-1 flex items-center">
                        <CalendarDaysIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-1" />
                        <span className="text-xs sm:text-sm text-gray-900">
                          {plan.duration} {plan.durationType === 'MONTHS' ? 'mes(es)' : plan.durationType === 'YEARS' ? 'año(s)' : (plan.durationType || 'período').toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Usuarios Máx</label>
                      <div className="mt-1 flex items-center">
                        <UsersIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-1" />
                        <span className="text-xs sm:text-sm text-gray-900">{plan.maxUsers || 'Ilimitado'}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Clientes Máx</label>
                      <span className="text-xs sm:text-sm text-gray-900">{plan.maxClients || 'Ilimitado'}</span>
                    </div>
                    
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Citas Máx/mes</label>
                      <span className="text-xs sm:text-sm text-gray-900">{plan.maxAppointments || 'Ilimitado'}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Almacenamiento</label>
                      <span className="text-xs sm:text-sm text-gray-900">
                        {plan.storageLimit ? `${plan.storageLimit} GB` : 'Ilimitado'}
                      </span>
                    </div>
                    
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Días de Prueba</label>
                      <div className="mt-1 flex items-center">
                        <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-1" />
                        <span className="text-xs sm:text-sm text-gray-900">{plan.trialDays || 0} días</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Características */}
              {plan.features && plan.features.length > 0 && (
                <div>
                  <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">Características</h4>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1 sm:mr-2 flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-gray-900">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Módulos del Plan */}
              {plan.planModules && plan.planModules.length > 0 && (
                <div>
                  <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">Módulos Incluidos</h4>
                  <div className="bg-indigo-50 rounded-lg p-3 sm:p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {plan.planModules.map((planModule) => (
                        <div key={planModule.id} className="bg-white rounded-lg p-2 sm:p-3 border border-indigo-200">
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <div className="flex-shrink-0">
                              <Cog6ToothIcon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 mt-0.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                {planModule.module?.displayName || planModule.module?.name || 'Módulo sin nombre'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {planModule.module?.description || 'Sin descripción'}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-1">
                                {planModule.module?.category && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    {planModule.module.category}
                                  </span>
                                )}
                                {planModule.module?.status && (
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                                    planModule.module.status === 'ACTIVE' 
                                      ? 'bg-green-100 text-green-800'
                                      : planModule.module.status === 'DEPRECATED'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {planModule.module.status}
                                  </span>
                                )}
                                {planModule.module?.version && (
                                  <span className="text-xs text-gray-400">
                                    v{planModule.module.version}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* No hay módulos */}
              {(!plan.planModules || plan.planModules.length === 0) && (
                <div>
                  <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">Módulos Incluidos</h4>
                  <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center">
                    <Cog6ToothIcon className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-2 sm:mb-3" />
                    <p className="text-xs sm:text-sm text-gray-500">Este plan no tiene módulos asociados</p>
                  </div>
                </div>
              )}

              {/* Limitaciones */}
              {plan.limitations && Object.keys(plan.limitations).length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Limitaciones</h4>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {Object.entries(plan.limitations).map(([key, value]) => (
                        <div key={key} className="flex items-center">
                          <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
                          <span className="text-sm text-gray-900">
                            {key}: {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Panel Lateral - Estadísticas */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">Información del Plan</h4>
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
                      <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-blue-900">Precio Mensual</p>
                        <p className="text-lg sm:text-2xl font-bold text-blue-600 truncate">
                          {formatPrice(plan.price, plan.currency)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center">
                      <CalendarDaysIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
                      <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-green-900">Duración</p>
                        <p className="text-base sm:text-xl font-bold text-green-600">
                          {plan.duration} {plan.durationType === 'MONTHS' ? 'mes(es)' : plan.durationType === 'YEARS' ? 'año(s)' : (plan.durationType || '').toLowerCase()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 flex-shrink-0" />
                      <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-purple-900">Días de Prueba</p>
                        <p className="text-base sm:text-xl font-bold text-purple-600">
                          {plan.trialDays || 0} días
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center">
                      <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 flex-shrink-0" />
                      <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-orange-900">Límite Usuarios</p>
                        <p className="text-base sm:text-xl font-bold text-orange-600">
                          {plan.maxUsers || 'Ilimitado'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">Información del Sistema</h4>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">ID</label>
                    <p className="mt-1 text-xs sm:text-sm text-gray-600 font-mono break-all">{plan.id}</p>
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Creado</label>
                    <p className="mt-1 text-xs sm:text-sm text-gray-600">{formatDate(plan.createdAt)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Actualizado</label>
                    <p className="mt-1 text-xs sm:text-sm text-gray-600">{formatDate(plan.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export { ViewPlanModal };