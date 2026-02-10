import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Plus Icon,
  FunnelIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { selectUserBranches, selectUserHasMultipleBranches } from '@shared';

const ExpensesTab = ({
  expenses = [],
  categories = [],
  stats = {},
  loading = false,
  onCreateExpense,
  onEditExpense,
  onDeleteExpense,
  onApproveExpense,
  onMarkAsPaid,
  filters,
  onFilterChange,
  permissions = {} // Permisos del usuario
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const userBranches = useSelector(selectUserBranches);
  const hasMultipleBranches = useSelector(selectUserHasMultipleBranches);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'Pendiente' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Aprobado' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, label: 'Rechazado' },
      paid: { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon, label: 'Pagado' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Gastos</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalExpenses || 0)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Pendientes</div>
          <div className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pendingExpenses || 0)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Aprobados</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.approvedExpenses || 0)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Este Mes</div>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.currentMonthExpenses || 0)}</div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow">
        <div className="flex gap-2">
          {permissions?.create && (
            <button
              onClick={onCreateExpense}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Nuevo Gasto
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filtros
          </button>
        </div>
        <button
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
        >
          <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
          Exportar
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={filters?.categoryId || ''}
                onChange={(e) => onFilterChange({ ...filters, categoryId: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              >
                <option value="">Todas</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            {/* Filtro de sucursal (solo si hay múltiples) */}
            {hasMultipleBranches && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <BuildingOfficeIcon className="w-4 h-4 inline-block mr-1" />
                  Sucursal
                </label>
                <select
                  value={filters?.branchId || ''}
                  onChange={(e) => onFilterChange({ ...filters, branchId: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                >
                  <option value="">Todas</option>
                  <option value="general">General</option>
                  {userBranches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={filters?.status || ''}
                onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              >
                <option value="">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobado</option>
                <option value="rejected">Rechazado</option>
                <option value="paid">Pagado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
              <input
                type="date"
                value={filters?.startDate || ''}
                onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
              <input
                type="date"
                value={filters?.endDate || ''}
                onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Cargando gastos...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No hay gastos registrados</p>
            {permissions?.create && (
              <button
                onClick={onCreateExpense}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Crear Primer Gasto
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sucursal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
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
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(expense.expenseDate), 'dd/MM/yyyy', { locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {expense.branch?.name || 
                       expense.Branch?.name || 
                       <span className="text-gray-400 italic">General</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.BusinessExpenseCategory?.name || 'Sin categoría'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.vendor || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(expense.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {permissions?.approve && expense.status === 'pending' && (
                          <button
                            onClick={() => onApproveExpense(expense.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Aprobar"
                          >
                            <CheckCircleIcon className="w-5 h-5" />
                          </button>
                        )}
                        {permissions?.approve && expense.status === 'approved' && !expense.isPaid && (
                          <button
                            onClick={() => onMarkAsPaid(expense.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Marcar como pagado"
                          >
                            Pagar
                          </button>
                        )}
                        {permissions?.edit && (
                          <button
                            onClick={() => onEditExpense(expense)}
                            className="text-pink-600 hover:text-pink-900"
                          >
                            Editar
                          </button>
                        )}
                        {permissions?.delete && (
                          <button
                            onClick={() => onDeleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpensesTab;
