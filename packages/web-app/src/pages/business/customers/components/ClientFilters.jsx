/**
 * Filtros de Clientes
 * Componente con Tailwind CSS para filtrar la lista de clientes
 */

import React from 'react';
import {
  AdjustmentsHorizontalIcon,
  UserGroupIcon,
  NoSymbolIcon,
  TicketIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ClientFilters = ({ filters, onFilterChange }) => {
  const handleStatusChange = (status) => {
    onFilterChange({ status });
  };

  const handleSortChange = (e) => {
    onFilterChange({ sortBy: e.target.value });
  };

  const handleTimeRangeChange = (e) => {
    onFilterChange({ timeRange: parseInt(e.target.value) });
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex items-center mb-4">
        <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400 mr-2" />
        <h3 className="text-sm font-medium text-gray-700">Filtros Avanzados</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Filtro por estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado del Cliente
          </label>
          <div className="space-y-2">
            <FilterButton
              active={filters.status === 'all'}
              onClick={() => handleStatusChange('all')}
              icon={UserGroupIcon}
              label="Todos"
              color="gray"
            />
            <FilterButton
              active={filters.status === 'blocked'}
              onClick={() => handleStatusChange('blocked')}
              icon={NoSymbolIcon}
              label="Bloqueados"
              color="red"
            />
            <FilterButton
              active={filters.status === 'with_vouchers'}
              onClick={() => handleStatusChange('with_vouchers')}
              icon={TicketIcon}
              label="Con Vouchers"
              color="green"
            />
            <FilterButton
              active={filters.status === 'frequent_cancellers'}
              onClick={() => handleStatusChange('frequent_cancellers')}
              icon={ExclamationTriangleIcon}
              label="Canceladores Frecuentes"
              color="orange"
            />
          </div>
        </div>

        {/* Ordenar por */}
        <div>
          <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
            Ordenar Por
          </label>
          <select
            id="sortBy"
            value={filters.sortBy}
            onChange={handleSortChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="recent">Más Reciente</option>
            <option value="name">Nombre (A-Z)</option>
            <option value="appointments">Más Citas</option>
            <option value="cancellations">Más Cancelaciones</option>
            <option value="vouchers">Más Vouchers</option>
          </select>
        </div>

        {/* Rango de tiempo */}
        <div>
          <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 mb-2">
            Período de Análisis
          </label>
          <select
            id="timeRange"
            value={filters.timeRange}
            onChange={handleTimeRangeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value={7}>Últimos 7 días</option>
            <option value={15}>Últimos 15 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={60}>Últimos 60 días</option>
            <option value={90}>Últimos 90 días</option>
            <option value={180}>Últimos 6 meses</option>
            <option value={365}>Último año</option>
          </select>
        </div>
      </div>

      {/* Botón para limpiar filtros */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => onFilterChange({ 
            status: 'all', 
            sortBy: 'recent', 
            timeRange: 30 
          })}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
};

/**
 * Botón de filtro reutilizable
 */
const FilterButton = ({ active, onClick, icon, label, color }) => {
  const Icon = icon;
  const colorClasses = {
    gray: {
      active: 'bg-gray-100 text-gray-900 border-gray-300',
      inactive: 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
    },
    red: {
      active: 'bg-red-100 text-red-900 border-red-300',
      inactive: 'bg-white text-gray-600 border-gray-300 hover:bg-red-50'
    },
    green: {
      active: 'bg-green-100 text-green-900 border-green-300',
      inactive: 'bg-white text-gray-600 border-gray-300 hover:bg-green-50'
    },
    orange: {
      active: 'bg-orange-100 text-orange-900 border-orange-300',
      inactive: 'bg-white text-gray-600 border-gray-300 hover:bg-orange-50'
    }
  };

  const classes = active ? colorClasses[color].active : colorClasses[color].inactive;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-3 py-2 border rounded-lg transition-colors ${classes}`}
    >
      <Icon className="h-4 w-4 mr-2" />
      <span className="text-sm font-medium">{label}</span>
      {active && (
        <svg 
          className="ml-auto h-4 w-4" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
            clipRule="evenodd" 
          />
        </svg>
      )}
    </button>
  );
};

export default ClientFilters;
