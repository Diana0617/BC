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
  ArrowTrendingDownIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PendingPayments from './PendingPayments';

/**
 * Componente unificado: Resumen + Movimientos de caja
 */
export default function CashRegisterMovementsUnified({ shiftId: propShiftId, branchId, onMovementAdded }) {
  const { token, user } = useSelector(state => state.auth);
  const [activeView, setActiveView] = useState('pending'); // 'pending' | 'summary' | 'movements'
  const [movements, setMovements] = useState([]);
  const [shiftData, setShiftData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeShiftId, setActiveShiftId] = useState(propShiftId);
  const [filters, setFilters] = useState({
    type: 'all', // 'all', 'INCOME', 'EXPENSE'
    searchTerm: ''
  });

  const getPaymentMethodIcon = (method, methodType = null) => {
    // Si se proporciona el tipo, usar ese; sino intentar detectar por el nombre del método
    const type = methodType || method;
    
    if (type === 'CASH' || method === 'CASH') {
      return <BanknotesIcon className="w-5 h-5 text-green-600" />;
    }
    if (type === 'CARD' || method === 'CARD') {
      return <CreditCardIcon className="w-5 h-5 text-blue-600" />;
    }
    if (type === 'TRANSFER' || method === 'TRANSFER') {
      return <DevicePhoneMobileIcon className="w-5 h-5 text-purple-600" />;
    }
    if (type === 'WOMPI' || method === 'WOMPI') {
      return <CurrencyDollarIcon className="w-5 h-5 text-orange-600" />;
    }
    // Icono genérico para métodos personalizados
    return <CurrencyDollarIcon className="w-5 h-5 text-gray-600" />;
  };

  const getPaymentMethodLabel = (method) => {
    // Si es un método personalizado (no es uno de los enums), mostrarlo tal cual
    const standardEnums = ['CASH', 'CARD', 'TRANSFER', 'WOMPI', 'OTHER'];
    if (!standardEnums.includes(method)) {
      return method; // Nombre personalizado del negocio
    }
    
    // Si es un enum estándar, traducirlo
    const labels = {
      'CASH': 'Efectivo',
      'CARD': 'Tarjeta',
      'TRANSFER': 'Transferencia',
      'WOMPI': 'Wompi',
      'OTHER': 'Otro'
    };
    return labels[method] || method;
  };

  // Cargar turno activo si no hay shiftId proporcionado
  useEffect(() => {
    const loadActiveShift = async () => {
      if (propShiftId) {
        setActiveShiftId(propShiftId);
        return;
      }

      if (!user?.businessId) return;

      try {
        let url = `${import.meta.env.VITE_API_URL}/api/cash-register/active-shift?businessId=${user.businessId}`;
        if (branchId) {
          url += `&branchId=${branchId}`;
        }
        const response = await fetch(
          url,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data?.hasActiveShift && result.data?.shift) {
            setActiveShiftId(result.data.shift.id);
          } else {
            setActiveShiftId(null);
          }
        }
      } catch (error) {
        console.error('Error loading active shift:', error);
      }
    };

    loadActiveShift();
  }, [propShiftId, user?.businessId, token, branchId]);

  useEffect(() => {
    if (activeView === 'movements' && activeShiftId) {
      loadMovements();
    } else if (activeView === 'summary' && activeShiftId) {
      loadShiftData();
    }
  }, [activeShiftId, page, filters, activeView, branchId]);

  const loadShiftData = async () => {
    if (!activeShiftId || !user?.businessId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      let url = `${import.meta.env.VITE_API_URL}/api/cash-register/shift/${activeShiftId}?businessId=${user.businessId}`;
      if (branchId) {
        url += `&branchId=${branchId}`;
      }
      const response = await fetch(
        url,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Error loading shift data');

      const result = await response.json();
      setShiftData(result.data);
    } catch (error) {
      console.error('Error loading shift data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMovements = async () => {
    if (!activeShiftId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        businessId: user.businessId
      });

      if (branchId) {
        params.append('branchId', branchId);
      }

      if (filters.type !== 'all') {
        params.append('type', filters.type);
      }

      if (filters.searchTerm) {
        params.append('search', filters.searchTerm);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cash-register/shift/${activeShiftId}/movements?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Error loading movements');

      const result = await response.json();
      setMovements(result.data.movements || []);
      
      // No hay paginación en este endpoint, todos los movimientos vienen juntos
      setTotalPages(1);
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

  const getCategoryLabel = (movement) => {
    if (movement.source === 'RECEIPT') {
      return 'Pago de Cita';
    }
    
    if (movement.source === 'EXPENSE') {
      return movement.category || 'Gasto';
    }
    
    const categories = {
      APPOINTMENT: 'Cita',
      PRODUCT_SALE: 'Venta Producto',
      EXPENSE: 'Gasto',
      ADJUSTMENT: 'Ajuste',
      OTHER: 'Otro'
    };
    return categories[movement.category] || movement.category;
  };

  return (
    <div className="space-y-4">
      {/* Tabs de Vista */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveView('pending')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeView === 'pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <BanknotesIcon className="w-5 h-5" />
          Turnos Pendientes
        </button>
        <button
          onClick={() => setActiveView('summary')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeView === 'summary'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <ChartBarIcon className="w-5 h-5" />
          Resumen
        </button>
        <button
          onClick={() => setActiveView('movements')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeView === 'movements'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <ListBulletIcon className="w-5 h-5" />
          Todos los Movimientos
        </button>
      </div>

      {/* Vista: Turnos Pendientes */}
      {activeView === 'pending' && (
        <PendingPayments shiftId={activeShiftId} branchId={branchId} onPaymentComplete={onMovementAdded} />
      )}

      {/* Vista: Resumen */}
      {activeView === 'summary' && (
        <div className="space-y-6">
          {!activeShiftId ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium mb-1">No hay turno activo</p>
              <p className="text-sm text-gray-500">Abre un turno de caja para ver el resumen</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Balance Actual - Solo Efectivo */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs sm:text-sm text-blue-100 mb-1">Balance Efectivo</p>
                    <p className="text-2xl sm:text-4xl font-bold">
                      {formatCurrency(
                        (parseFloat(shiftData?.openingBalance) || 0) +
                        (parseFloat(shiftData?.totalCash) || 0)
                      )}
                    </p>
                    <p className="text-xs text-blue-200 mt-1">(Apertura + Efectivo recibido)</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-3 sm:p-4">
                    <BanknotesIcon className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 sm:mt-6">
                  <div>
                    <p className="text-xs text-blue-100 mb-1">Apertura</p>
                    <p className="text-base sm:text-lg font-semibold">
                      {formatCurrency(shiftData?.openingBalance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-100 mb-1">Movimientos</p>
                    <p className="text-base sm:text-lg font-semibold">
                      {shiftData?.movementsCount || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Resumen por Método de Pago */}
              {shiftData?.paymentMethodsBreakdown && Object.keys(shiftData.paymentMethodsBreakdown).length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5" />
                    Ingresos por Método de Pago
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(shiftData.paymentMethodsBreakdown).map(([method, data]) => (
                      <div key={method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getPaymentMethodIcon(method, data.type)}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{getPaymentMethodLabel(method)}</p>
                            <p className="text-xs text-gray-500">{data.count} transacciones</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-base sm:text-lg font-bold text-gray-900">
                            {formatCurrency(data.total)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Total Ingresos</span>
                      <span className="text-lg sm:text-xl font-bold text-green-600">
                        {formatCurrency(shiftData?.totalIncome)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Ingresos y Egresos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Ingresos */}
                <div className="bg-green-50 rounded-xl p-4 sm:p-6 border-2 border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <ArrowTrendingUpIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                    <span className="text-xs font-medium text-green-700 bg-green-200 px-2 py-1 rounded-full">
                      +{shiftData?.incomeCount || 0}
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mb-1">Ingresos</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {formatCurrency(shiftData?.totalIncome)}
                  </p>
                </div>

                {/* Egresos */}
                <div className="bg-red-50 rounded-xl p-4 sm:p-6 border-2 border-red-200">
                  <div className="flex items-center justify-between mb-3">
                    <ArrowTrendingDownIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                    <span className="text-xs font-medium text-red-700 bg-red-200 px-2 py-1 rounded-full">
                      -{shiftData?.expenseCount || 0}
                    </span>
                  </div>
                  <p className="text-sm text-red-700 mb-1">Egresos</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">
                    {formatCurrency(shiftData?.totalExpenses)}
                  </p>
                </div>
              </div>

              {/* Proporción */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5" />
                  Proporción de Movimientos
                </h4>

                <div className="space-y-4">
                  {(() => {
                    const totalIncome = parseFloat(shiftData?.totalIncome) || 0;
                    const totalExpenses = parseFloat(shiftData?.totalExpenses) || 0;
                    const total = totalIncome + totalExpenses;
                    const incomePercentage = total > 0 ? (totalIncome / total) * 100 : 50;

                    return (
                      <>
                        {/* Barra de Ingresos */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Ingresos</span>
                            <span className="text-sm font-semibold text-green-600">
                              {incomePercentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-green-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${incomePercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Barra de Egresos */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Egresos</span>
                            <span className="text-sm font-semibold text-red-600">
                              {(100 - incomePercentage).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-red-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${100 - incomePercentage}%` }}
                            />
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Diferencia Neta */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Diferencia Neta</span>
                    <span className={`text-lg font-bold ${
                      (shiftData?.totalIncome || 0) > (shiftData?.totalExpenses || 0)
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {(shiftData?.totalIncome || 0) > (shiftData?.totalExpenses || 0) ? '+' : ''}
                      {formatCurrency((shiftData?.totalIncome || 0) - (shiftData?.totalExpenses || 0))}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Vista: Todos los Movimientos */}
      {activeView === 'movements' && (
        <>
          {!activeShiftId ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <ListBulletIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium mb-1">No hay turno activo</p>
              <p className="text-sm text-gray-500">Abre un turno de caja para registrar movimientos</p>
            </div>
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
                          Especialista
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Método Pago
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
                            {getCategoryLabel(movement)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">
                                {movement.description}
                              </div>
                              {movement.clientName && (
                                <div className="text-gray-500 text-xs">
                                  Cliente: {movement.clientName}
                                </div>
                              )}
                              {movement.vendor && (
                                <div className="text-gray-500 text-xs">
                                  Proveedor: {movement.vendor}
                                </div>
                              )}
                              {movement.receiptNumber && (
                                <div className="text-gray-500 text-xs">
                                  Recibo: {movement.receiptNumber}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {movement.specialistName || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {movement.paymentMethod ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {movement.paymentMethod === 'CASH' ? 'Efectivo' :
                                 movement.paymentMethod === 'CARD' ? 'Tarjeta' :
                                 movement.paymentMethod === 'TRANSFER' ? 'Transferencia' :
                                 movement.paymentMethod === 'WOMPI' ? 'Wompi' :
                                 movement.paymentMethod}
                              </span>
                            ) : '-'}
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
                              {getCategoryLabel(movement)}
                            </p>
                          </div>
                        </div>
                        {getTypeBadge(movement.type)}
                      </div>

                      {movement.clientName && (
                        <p className="text-xs text-gray-500 mb-1">
                          Cliente: {movement.clientName}
                        </p>
                      )}
                      {movement.specialistName && (
                        <p className="text-xs text-gray-500 mb-1">
                          Especialista: {movement.specialistName}
                        </p>
                      )}
                      {movement.vendor && (
                        <p className="text-xs text-gray-500 mb-1">
                          Proveedor: {movement.vendor}
                        </p>
                      )}
                      {movement.paymentMethod && (
                        <p className="text-xs text-gray-500 mb-1">
                          Pago: {movement.paymentMethod === 'CASH' ? 'Efectivo' :
                                 movement.paymentMethod === 'CARD' ? 'Tarjeta' :
                                 movement.paymentMethod === 'TRANSFER' ? 'Transferencia' :
                                 movement.paymentMethod === 'WOMPI' ? 'Wompi' :
                                 movement.paymentMethod}
                        </p>
                      )}
                      {movement.receiptNumber && (
                        <p className="text-xs text-gray-500 mb-1">
                          Recibo: {movement.receiptNumber}
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
                  <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
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
        </>
      )}
    </div>
  );
}
