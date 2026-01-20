import React, { useState } from 'react';
import {
  UserCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CommissionsTab = ({
  specialists = [],
  config = {},
  selectedSpecialistDetails = null,
  loading = false,
  onPayCommission,
  onViewDetails,
  filters,
  onFilterChange
}) => {
  const [expandedSpecialist, setExpandedSpecialist] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value}%`;
  };

  const toggleSpecialist = (specialistId) => {
    if (expandedSpecialist === specialistId) {
      setExpandedSpecialist(null);
    } else {
      setExpandedSpecialist(specialistId);
      onViewDetails(specialistId);
    }
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="space-y-6">
      {/* Commission Config Card */}
      {config && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Comisiones</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Porcentaje Comisión</div>
              <div className="text-2xl font-bold text-pink-600">
                {formatPercentage(config.commissionPercentage || 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Cálculo Basado En</div>
              <div className="text-lg font-semibold text-gray-900">
                {config.calculationBasis === 'service_price' ? 'Precio del Servicio' : 
                 config.calculationBasis === 'amount_paid' ? 'Monto Pagado' : 
                 'Monto Pagado (sin anticipos)'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Frecuencia de Pago</div>
              <div className="text-lg font-semibold text-gray-900">
                {config.paymentFrequency === 'weekly' ? 'Semanal' :
                 config.paymentFrequency === 'biweekly' ? 'Quincenal' :
                 'Mensual'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Period Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
            <select
              value={filters?.month || currentMonth}
              onChange={(e) => onFilterChange({ ...filters, month: parseInt(e.target.value) })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <select
              value={filters?.year || currentYear}
              onChange={(e) => onFilterChange({ ...filters, year: parseInt(e.target.value) })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Specialists List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Cargando comisiones...</p>
          </div>
        ) : specialists.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <UserCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay especialistas con comisiones en este período</p>
          </div>
        ) : (
          specialists.map((specialist) => (
            <div key={specialist.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Specialist Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSpecialist(specialist.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <UserCircleIcon className="w-12 h-12 text-pink-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {specialist.firstName} {specialist.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{specialist.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Comisiones Generadas</div>
                      <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(specialist.totalCommissionsGenerated || 0)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Comisiones Pagadas</div>
                      <div className="text-xl font-bold text-green-600">
                        {formatCurrency(specialist.totalCommissionsPaid || 0)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Pendientes</div>
                      <div className="text-xl font-bold text-yellow-600">
                        {formatCurrency(specialist.totalCommissionsPending || 0)}
                      </div>
                    </div>
                    {expandedSpecialist === specialist.id ? (
                      <ChevronUpIcon className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Specialist Details */}
              {expandedSpecialist === specialist.id && selectedSpecialistDetails && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  {selectedSpecialistDetails.loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Services Table */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Servicios del Período</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Fecha
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Servicio
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Cliente
                                </th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                  Precio
                                </th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                  Comisión
                                </th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                                  Estado
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {selectedSpecialistDetails.services?.map((service, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {format(new Date(service.date), 'dd/MM/yyyy', { locale: es })}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {service.serviceName}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-500">
                                    {service.clientName}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                    {formatCurrency(service.servicePrice)}
                                  </td>
                                  <td className="px-4 py-2 text-sm font-medium text-pink-600 text-right">
                                    {formatCurrency(service.commission)}
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    {service.isPaid ? (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                                        Pagado
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        <ClockIcon className="w-4 h-4 mr-1" />
                                        Pendiente
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Payment History */}
                      {selectedSpecialistDetails.paymentHistory && selectedSpecialistDetails.paymentHistory.length > 0 && (
                        <div>
                          <h4 className="text-md font-semibold text-gray-900 mb-3">Historial de Pagos</h4>
                          <div className="space-y-2">
                            {selectedSpecialistDetails.paymentHistory.map((payment, index) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {format(new Date(payment.paymentDate), 'dd/MM/yyyy HH:mm', { locale: es })}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Por: {payment.paidByUser}
                                  </div>
                                  {payment.notes && (
                                    <div className="text-xs text-gray-500 mt-1">{payment.notes}</div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-green-600">
                                    {formatCurrency(payment.amount)}
                                  </div>
                                  <div className="text-xs text-gray-500">{payment.paymentMethod}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pay Button */}
                      {specialist.totalCommissionsPending > 0 && (
                        <div className="flex justify-end">
                          <button
                            onClick={() => onPayCommission(specialist, selectedSpecialistDetails)}
                            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                          >
                            <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                            Registrar Pago de {formatCurrency(specialist.totalCommissionsPending)}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommissionsTab;
