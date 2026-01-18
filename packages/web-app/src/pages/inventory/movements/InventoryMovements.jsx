import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  ArrowRightLeft,
  ShoppingCart,
  MinusCircle,
  TrendingDown,
  TrendingUp,
  Filter,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Package,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getInventoryMovements } from '@shared/api/businessInventoryApi';
import { usePagination } from '@shared/hooks/usePagination';
import { PAGINATION } from '@shared/constants/ui';

const InventoryMovements = () => {
  const { user } = useSelector((state) => state.auth);
  const businessId = user?.businessId;
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  // Filtros
  const [filters, setFilters] = useState({
    productId: '',
    branchId: '',
    movementType: '',
    reason: '',
    userId: '',
    dateFrom: '',
    dateTo: ''
  });

  const [showFilters, setShowFilters] = useState(true);

  // Hook de paginación
  const {
    data: paginatedMovements,
    pagination,
    goToPage,
    changePageSize
  } = usePagination(movements, PAGINATION.MOVEMENTS || 20);

  // Tipos de movimiento con sus colores e iconos
  const movementTypes = {
    PURCHASE: {
      label: 'Compra',
      colorClass: 'bg-green-100 text-green-800',
      icon: <ShoppingCart className="w-4 h-4" />,
      bgClass: 'bg-green-50'
    },
    ADJUSTMENT: {
      label: 'Ajuste',
      colorClass: 'bg-yellow-100 text-yellow-800',
      icon: <MinusCircle className="w-4 h-4" />,
      bgClass: 'bg-yellow-50'
    },
    TRANSFER_OUT: {
      label: 'Salida - Transferencia',
      colorClass: 'bg-red-100 text-red-800',
      icon: <ArrowDown className="w-4 h-4" />,
      bgClass: 'bg-red-50'
    },
    TRANSFER_IN: {
      label: 'Entrada - Transferencia',
      colorClass: 'bg-blue-100 text-blue-800',
      icon: <ArrowUp className="w-4 h-4" />,
      bgClass: 'bg-blue-50'
    },
    SALE: {
      label: 'Venta',
      colorClass: 'bg-purple-100 text-purple-800',
      icon: <TrendingDown className="w-4 h-4" />,
      bgClass: 'bg-purple-50'
    },
    INITIAL_STOCK: {
      label: 'Stock Inicial',
      colorClass: 'bg-gray-100 text-gray-800',
      icon: <TrendingUp className="w-4 h-4" />,
      bgClass: 'bg-gray-50'
    }
  };

  const reasons = {
    STAFF_CONSUMPTION: 'Consumo del Personal',
    BRANCH_TRANSFER: 'Transferencia entre Sucursales',
    INITIAL_STOCK: 'Stock Inicial',
    ADJUSTMENT: 'Ajuste Manual',
    PURCHASE: 'Compra'
  };

  const fetchMovements = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        ...filters
      };

      // Limpiar parámetros vacíos
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await getInventoryMovements(businessId, params);
      
      setMovements(response.data.movements || []);
      setSummary(response.data.summary || null);
    } catch (err) {
      console.error('Error fetching movements:', err);
      setError(err.message || 'Error al cargar movimientos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchMovements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    goToPage(1);
    fetchMovements();
  };

  const handleClearFilters = () => {
    setFilters({
      productId: '',
      branchId: '',
      movementType: '',
      reason: '',
      userId: '',
      dateFrom: '',
      dateTo: ''
    });
    goToPage(1);
    setTimeout(fetchMovements, 100);
  };

  const getMovementIcon = (type) => {
    return movementTypes[type]?.icon || <ArrowRightLeft className="w-4 h-4" />;
  };

  const getMovementColorClass = (type) => {
    return movementTypes[type]?.colorClass || 'bg-gray-100 text-gray-800';
  };

  const getMovementBgClass = (type) => {
    return movementTypes[type]?.bgClass || 'bg-white';
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      {summary && summary.totals && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {summary.totals.map((total, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                {getMovementIcon(total.movementType)}
                <span className="text-sm text-gray-600">
                  {movementTypes[total.movementType]?.label || total.movementType}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{total.count}</div>
              <div className="text-xs text-gray-500">
                Total: {total.totalQuantity > 0 ? '+' : ''}{total.totalQuantity}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={fetchMovements}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {showFilters && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Movimiento
                </label>
                <select
                  value={filters.movementType}
                  onChange={(e) => handleFilterChange('movementType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {Object.entries(movementTypes).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Razón
                </label>
                <select
                  value={filters.reason}
                  onChange={(e) => handleFilterChange('reason', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas</option>
                  {Object.entries(reasons).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Desde
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hasta
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Aplicar Filtros
              </button>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Limpiar
              </button>
            </div>
          </>
        )}
      </div>

      {/* Tabla de movimientos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sucursal
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Razón/Notas
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedMovements.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No hay movimientos para mostrar</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedMovements.map((movement) => (
                      <tr key={movement.id} className={getMovementBgClass(movement.movementType)}>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">
                            {format(new Date(movement.createdAt), 'dd/MM/yyyy', { locale: es })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(movement.createdAt), 'HH:mm', { locale: es })}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getMovementColorClass(movement.movementType)}`}>
                            {getMovementIcon(movement.movementType)}
                            {movementTypes[movement.movementType]?.label || movement.movementType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {movement.product?.name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            SKU: {movement.product?.sku || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">
                            {movement.branch?.name || 'General'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm font-bold ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {movement.quantity > 0 ? '+' : ''}{movement.quantity} {movement.product?.unit || ''}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">
                            {movement.user?.name || 'Sistema'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">
                            {reasons[movement.reason] || movement.reason}
                          </div>
                          {movement.notes && (
                            <div className="text-xs text-gray-500 mt-1">
                              {movement.notes}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {movement.metadata?.transferFromBranchName && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                Desde: {movement.metadata.transferFromBranchName}
                              </span>
                            )}
                            {movement.metadata?.transferToBranchName && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                Hacia: {movement.metadata.transferToBranchName}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => goToPage(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => goToPage(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{pagination.startIndex}</span> a{' '}
                    <span className="font-medium">{pagination.endIndex}</span> de{' '}
                    <span className="font-medium">{pagination.totalItems}</span> resultados
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Filas por página:</label>
                  <select
                    value={pagination.pageSize}
                    onChange={(e) => changePageSize(parseInt(e.target.value, 10))}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <button
                    onClick={() => goToPage(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Página anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-700">
                    Página {pagination.currentPage} de {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => goToPage(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Página siguiente"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InventoryMovements;
