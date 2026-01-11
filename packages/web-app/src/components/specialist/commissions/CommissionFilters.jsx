import React, { useState } from 'react';
import { 
  CalendarIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

/**
 * Filtros para el historial de comisiones
 * Fecha, estado, búsqueda
 */
export default function CommissionFilters({ filters, onChange, onReset }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const statusOptions = [
    { value: 'all', label: 'Todos los Estados' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'REQUESTED', label: 'Solicitado' },
    { value: 'PAID', label: 'Pagado' },
    { value: 'CANCELLED', label: 'Cancelado' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FunnelIcon className="w-5 h-5" />
          Filtros
        </h3>
        <button
          onClick={onReset}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Limpiar Filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha Inicio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Desde
          </label>
          <input
            type="date"
            value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
            onChange={(e) => handleChange('startDate', e.target.value ? new Date(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Fecha Fin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hasta
          </label>
          <input
            type="date"
            value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
            onChange={(e) => handleChange('endDate', e.target.value ? new Date(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Búsqueda */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buscar
        </label>
        <input
          type="text"
          value={filters.searchTerm}
          onChange={(e) => handleChange('searchTerm', e.target.value)}
          placeholder="Nombre de cliente o servicio..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filtros Activos */}
      {(filters.status !== 'all' || filters.searchTerm) && (
        <div className="flex flex-wrap gap-2">
          {filters.status !== 'all' && (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Estado: {statusOptions.find(o => o.value === filters.status)?.label}
              <button
                onClick={() => handleChange('status', 'all')}
                className="hover:text-blue-900"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </span>
          )}
          
          {filters.searchTerm && (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              Búsqueda: "{filters.searchTerm}"
              <button
                onClick={() => handleChange('searchTerm', '')}
                className="hover:text-purple-900"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
