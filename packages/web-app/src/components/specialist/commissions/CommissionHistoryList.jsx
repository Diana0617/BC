import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { 
  CalendarIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import CommissionFilters from './CommissionFilters';

/**
 * Historial completo de comisiones con paginación
 * Incluye filtros y exportación
 */
export default function CommissionHistoryList({ specialistId, businessId }) {
  const { token } = useSelector(state => state.auth);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    searchTerm: ''
  });

  console.log('🟢 CommissionHistoryList - Props recibidos:', { specialistId, businessId });

  useEffect(() => {
    console.log('🟢 CommissionHistoryList - useEffect disparado', { specialistId, page, filters });
    if (specialistId) {
      loadCommissions();
    } else {
      console.warn('⚠️ CommissionHistoryList - specialistId no está definido');
    }
  }, [specialistId, page, filters]);

  const loadCommissions = async () => {
    console.log('🟢 CommissionHistoryList - Validando condiciones', { token: !!token, specialistId });
    if (!token || !specialistId) {
      console.warn('⚠️ CommissionHistoryList - No se puede cargar: falta token o specialistId');
      return;
    }
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        specialistId,
        businessId,
        page,
        limit: 20,
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate.toISOString() }),
        ...(filters.endDate && { endDate: filters.endDate.toISOString() }),
        ...(filters.searchTerm && { search: filters.searchTerm })
      });

      const url = `${import.meta.env.VITE_API_URL}/api/commissions/history?${params}`;
      console.log('🟢 CommissionHistoryList - URL:', url);
      console.log('🟢 CommissionHistoryList - Params:', Object.fromEntries(params));

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('🟢 CommissionHistoryList - Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ CommissionHistoryList - Error response:', errorText);
        throw new Error('Error loading commissions');
      }

      const data = await response.json();
      console.log('✅ CommissionHistoryList - Data recibida:', data);
      setCommissions(data.data?.commissions || []);
      setTotalPages(data.data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error('❌ CommissionHistoryList - Error loading commissions:', error);
      toast.error('Error al cargar el historial de comisiones');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        specialistId,
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate.toISOString() }),
        ...(filters.endDate && { endDate: filters.endDate.toISOString() }),
        format: 'excel'
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/commissions/export?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) throw new Error('Error exporting');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comisiones_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Archivo exportado exitosamente');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Error al exportar el historial');
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
    return format(new Date(date), "d MMM yyyy", { locale: es });
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      REQUESTED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Solicitado' },
      PAID: { bg: 'bg-green-100', text: 'text-green-800', label: 'Pagado' },
      CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelado' }
    };

    const badge = badges[status] || badges.PENDING;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header con búsqueda y acciones */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historial de Comisiones</h2>
          <p className="text-sm text-gray-600 mt-1">
            Registro completo de todas tus comisiones
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              showFilters 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FunnelIcon className="w-5 h-5" />
            Filtros
          </button>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            Exportar
          </button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <CommissionFilters
            filters={filters}
            onChange={setFilters}
            onReset={() => {
              setFilters({
                status: 'all',
                startDate: startOfMonth(new Date()),
                endDate: endOfMonth(new Date()),
                searchTerm: ''
              });
              setPage(1);
            }}
          />
        </div>
      )}

      {/* Lista de Comisiones */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : commissions.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No se encontraron comisiones</p>
          </div>
        ) : (
          <>
            {/* Tabla Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente / Servicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comisión
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {commissions.map(commission => (
                    <tr key={commission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(commission.appointmentDate)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {commission.clientName}
                          </div>
                          <div className="text-gray-500">
                            {commission.serviceName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(commission.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-bold text-gray-900">
                            {formatCurrency(commission.commissionAmount)}
                          </div>
                          <div className="text-gray-500">
                            {commission.commissionPercentage}%
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(commission.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards Mobile */}
            <div className="md:hidden divide-y divide-gray-200">
              {commissions.map(commission => (
                <div key={commission.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {commission.clientName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {commission.serviceName}
                      </p>
                    </div>
                    {getStatusBadge(commission.status)}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <p className="text-xs text-gray-500">
                        {formatDate(commission.appointmentDate)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Total: {formatCurrency(commission.totalAmount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(commission.commissionAmount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {commission.commissionPercentage}%
                      </p>
                    </div>
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
    </div>
  );
}
