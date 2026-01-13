/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BanknotesIcon,
  ListBulletIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PendingPayments from './PendingPayments';

/**
 * Lista de movimientos de caja con resumen (ingresos y egresos)
 * Con filtros, paginación y gestión de turnos pendientes
 */
export default function CashRegisterMovements({ shiftId }) {
  const { token, user } = useSelector(state => state.auth);
  const [activeView, setActiveView] = useState('pending'); // 'pending' | 'movements' | 'summary'
  const [movements, setMovements] = useState([]);
  const [shiftData, setShiftData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    type: 'all', // 'all', 'INCOME', 'EXPENSE'
    searchTerm: ''
  });

  useEffect(() => {
    if (activeView === 'movements') {
      loadMovements();
    } else if (activeView === 'summary') {
      loadShiftData();
    }
  }, [shiftId, page, filters, activeView]);

  const loadShiftData = async () => {
    if (!shiftId || !user?.businessId) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cash-register/shift/${shiftId}?businessId=${user.businessId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Error loading shift data');

      const data = await response.json();
      setShiftData(data);
    } catch (error) {
      console.error('Error loading shift data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMovements = async () => {
    if (!shiftId) {
      console.log('⚠️ No hay caja abierta para cargar movimientos');
      return;
    }
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        shiftId,
        page,
        limit: 20,
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.searchTerm && { search: filters.searchTerm })
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cash-register/movements?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Error loading movements');

      const data = await response.json();
      setMovements(data.movements);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error loading movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return format(new Date(date), "d MMM yyyy, HH:mm", { locale: es });
  };

  const getTypeIcon = (type) => {
    return type === 'INCOME' ? (
      <ArrowDownTrayIcon className="w-5 h-5 text-green-600" />
    ) : (
      <ArrowUpTrayIcon className="w-5 h-5 text-red-600" />
    );
  };

  const getTypeLabel = (type) => {
    return type === 'INCOME' ? 'Ingreso' : 'Egreso';
  };

  const getTypeBadge = (type) => {
    return type === 'INCOME' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Ingreso
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Egreso
      </span>
    );
  };

  const getCategoryLabel = (category) => {
    const categories = {
      APPOINTMENT: 'Cita',
      PRODUCT_SALE: 'Venta Producto',
      EXPENSE: 'Gasto',
      ADJUSTMENT: 'Ajuste',
      OTHER: 'Otro'
    };
    return categories[category] || category;
  };

  return (
    <div className="space-y-4">
      {/* Tabs de Vista */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveView('pending')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
            activeView === 'pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <BanknotesIcon className="w-5 h-5" />
          Turnos Pendientes
        </button>
        <button
          onClick={() => setActiveView('movements')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
            activeView === 'movements'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <ListBulletIcon className="w-5 h-5" />
          Todos los Movimientos
        </button>
      </div>

      {/* Contenido según vista activa */}
      {activeView === 'pending' ? (
        <PendingPayments shiftId={shiftId} />
      ) : (
        <>
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
        {/* Búsqueda */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => {
              setFilters({ ...filters, searchTerm: e.target.value });
              setPage(1);
            }}
            placeholder="Buscar movimientos..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtro por tipo */}
        <select
          value={filters.type}
          onChange={(e) => {
            setFilters({ ...filters, type: e.target.value });
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos los Tipos</option>
          <option value="INCOME">Solo Ingresos</option>
          <option value="EXPENSE">Solo Egresos</option>
        </select>
      </div>

      {/* Lista de Movimientos */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : movements.length === 0 ? (
          <div className="text-center py-12">
            <FunnelIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay movimientos registrados</p>
          </div>
        ) : (
          <>
            {/* Tabla Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {movements.map(movement => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(movement.type)}
                          {getTypeBadge(movement.type)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getCategoryLabel(movement.category)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {movement.description}
                          </div>
                          {movement.reference && (
                            <div className="text-gray-500 text-xs">
                              Ref: {movement.reference}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(movement.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`text-lg font-bold ${
                          movement.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.type === 'INCOME' ? '+' : '-'}
                          {formatCurrency(movement.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards Mobile */}
            <div className="md:hidden divide-y divide-gray-200">
              {movements.map(movement => (
                <div key={movement.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(movement.type)}
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {movement.description}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {getCategoryLabel(movement.category)}
                        </p>
                      </div>
                    </div>
                    {getTypeBadge(movement.type)}
                  </div>

                  {movement.reference && (
                    <p className="text-xs text-gray-500 mb-2">
                      Ref: {movement.reference}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">
                      {formatDate(movement.createdAt)}
                    </span>
                    <span className={`text-xl font-bold ${
                      movement.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {movement.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(movement.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    Página <span className="font-medium">{page}</span> de{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
        </>
      )}
    </div>
  );
}
