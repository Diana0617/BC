/**
 * Lista de Clientes
 * Componente con Tailwind CSS para mostrar la tabla/grid de clientes
 */

import React from 'react';
import {
  TicketIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  EyeIcon,
  PlusCircleIcon,
  NoSymbolIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const ClientList = ({ clients, loading, onClientClick, onCreateVoucher }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-500">Cargando clientes...</p>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No se encontraron clientes
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Intenta ajustar los filtros o términos de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Versión móvil - Cards */}
      <div className="block lg:hidden">
        {clients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onClientClick={onClientClick}
            onCreateVoucher={onCreateVoucher}
          />
        ))}
      </div>

      {/* Versión desktop - Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Citas
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cancelaciones
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vouchers
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Consentimientos
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <ClientRow
                key={client.id}
                client={client}
                onClientClick={onClientClick}
                onCreateVoucher={onCreateVoucher}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Fila de cliente para tabla (desktop)
 */
const ClientRow = ({ client, onClientClick, onCreateVoucher }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Cliente */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-medium text-sm">
                {client.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {client.name || 'Sin nombre'}
            </div>
            <div className="text-sm text-gray-500">
              Cliente desde {new Date(client.createdAt).toLocaleDateString('es-ES', { 
                month: 'short', 
                year: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </td>

      {/* Contacto */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{client.email || '-'}</div>
        <div className="text-sm text-gray-500">{client.phone || '-'}</div>
      </td>

      {/* Citas */}
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="text-sm font-medium text-gray-900">
          {client.totalAppointments || 0}
        </div>
        <div className="text-xs text-gray-500">
          {client.completedAppointments || 0} completadas
        </div>
      </td>

      {/* Cancelaciones */}
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="flex items-center justify-center">
          {client.cancellationsCount >= 3 ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              {client.cancellationsCount}
            </span>
          ) : (
            <span className="text-sm text-gray-900">
              {client.cancellationsCount || 0}
            </span>
          )}
        </div>
      </td>

      {/* Vouchers */}
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="flex items-center justify-center">
          {client.activeVouchersCount > 0 ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <TicketIcon className="h-4 w-4 mr-1" />
              {client.activeVouchersCount}
            </span>
          ) : (
            <span className="text-sm text-gray-500">0</span>
          )}
        </div>
      </td>

      {/* Consentimientos */}
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="flex items-center justify-center">
          {client.consentsCount > 0 ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <DocumentTextIcon className="h-4 w-4 mr-1" />
              {client.consentsCount}
            </span>
          ) : (
            <span className="text-sm text-gray-500">0</span>
          )}
        </div>
      </td>

      {/* Estado */}
      <td className="px-6 py-4 whitespace-nowrap text-center">
        {client.isBlocked ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <NoSymbolIcon className="h-4 w-4 mr-1" />
            Bloqueado
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Activo
          </span>
        )}
      </td>

      {/* Acciones */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onClientClick(client)}
            className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded hover:bg-indigo-50"
            title="Ver detalles"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onCreateVoucher(client)}
            className="text-green-600 hover:text-green-900 transition-colors p-1 rounded hover:bg-green-50"
            title="Crear voucher"
          >
            <PlusCircleIcon className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

/**
 * Card de cliente para móvil
 */
const ClientCard = ({ client, onClientClick, onCreateVoucher }) => {
  return (
    <div className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors">
      {/* Header del card */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 font-medium">
              {client.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900">
              {client.name || 'Sin nombre'}
            </h3>
            <p className="text-xs text-gray-500">{client.email || '-'}</p>
          </div>
        </div>
        
        {/* Estado */}
        {client.isBlocked && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <NoSymbolIcon className="h-3 w-3 mr-1" />
            Bloqueado
          </span>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="text-xs text-gray-500">Citas</div>
          <div className="text-sm font-medium text-gray-900">
            {client.totalAppointments || 0}
          </div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="text-xs text-gray-500">Cancelaciones</div>
          <div className="text-sm font-medium text-gray-900">
            {client.cancellationsCount || 0}
          </div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="text-xs text-gray-500">Vouchers</div>
          <div className="text-sm font-medium text-green-600">
            {client.activeVouchersCount || 0}
          </div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="text-xs text-gray-500">Consents</div>
          <div className="text-sm font-medium text-blue-600">
            {client.consentsCount || 0}
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex space-x-2">
        <button
          onClick={() => onClientClick(client)}
          className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <EyeIcon className="h-4 w-4 mr-2" />
          Ver Detalles
        </button>
        <button
          onClick={() => onCreateVoucher(client)}
          className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 rounded-lg text-sm font-medium text-white hover:bg-green-700 transition-colors"
        >
          <PlusCircleIcon className="h-4 w-4 mr-2" />
          Voucher
        </button>
      </div>
    </div>
  );
};

export default ClientList;
