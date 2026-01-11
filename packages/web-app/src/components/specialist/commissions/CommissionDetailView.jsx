import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon,
  UserIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Vista detallada de comisiones de un especialista
 * Muestra desglose completo con filtros por período
 */
export default function CommissionDetailView({ 
  specialistId, 
  period = 'current', // 'current', 'month', 'year', 'custom'
  startDate,
  endDate,
  onClose 
}) {
  const [loading, setLoading] = useState(false);
  const [commissionData, setCommissionData] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (specialistId) {
      loadCommissionData();
    }
  }, [specialistId, period, startDate, endDate]);

  const loadCommissionData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        specialistId,
        period,
        ...(startDate && { startDate: startDate.toISOString() }),
        ...(endDate && { endDate: endDate.toISOString() })
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/commissions/detail?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) throw new Error('Error loading commission data');

      const data = await response.json();
      setCommissionData(data.summary);
      setAppointments(data.appointments);
    } catch (error) {
      console.error('Error loading commission data:', error);
      alert('Error al cargar los datos de comisiones');
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
    return format(new Date(date), "d 'de' MMMM, yyyy", { locale: es });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!commissionData) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No hay datos de comisiones</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Detalle de Comisiones</h2>
          <p className="text-gray-600 mt-1">
            {period === 'current' && 'Período actual'}
            {period === 'month' && 'Este mes'}
            {period === 'year' && 'Este año'}
            {period === 'custom' && startDate && endDate && 
              `${formatDate(startDate)} - ${formatDate(endDate)}`}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Resumen de Comisiones */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <ClockIcon className="w-8 h-8 text-yellow-600" />
            <span className="text-xs font-medium text-yellow-700 bg-yellow-200 px-2 py-1 rounded-full">
              Pendiente
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(commissionData.pending)}
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            {commissionData.pendingCount} cita{commissionData.pendingCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <DocumentTextIcon className="w-8 h-8 text-blue-600" />
            <span className="text-xs font-medium text-blue-700 bg-blue-200 px-2 py-1 rounded-full">
              Solicitado
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(commissionData.requested)}
          </p>
          <p className="text-sm text-blue-700 mt-1">
            {commissionData.requestedCount} solicitud{commissionData.requestedCount !== 1 ? 'es' : ''}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
            <span className="text-xs font-medium text-green-700 bg-green-200 px-2 py-1 rounded-full">
              Pagado
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(commissionData.paid)}
          </p>
          <p className="text-sm text-green-700 mt-1">
            {commissionData.paidCount} pago{commissionData.paidCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <BanknotesIcon className="w-8 h-8 text-purple-600" />
            <span className="text-xs font-medium text-purple-700 bg-purple-200 px-2 py-1 rounded-full">
              Total
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(commissionData.total)}
          </p>
          <p className="text-sm text-purple-700 mt-1">
            {commissionData.totalCount} cita{commissionData.totalCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Lista de Citas con Comisiones */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Citas del Período
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {appointments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay citas en este período</p>
            </div>
          ) : (
            appointments.map(appointment => (
              <div key={appointment.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {appointment.service?.name}
                      </h4>
                      {getStatusBadge(appointment.commissionStatus)}
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        <span>
                          {appointment.client?.firstName} {appointment.client?.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(appointment.commissionAmount)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {appointment.commissionPercentage}% de {formatCurrency(appointment.totalAmount)}
                    </p>
                  </div>
                </div>

                {appointment.commissionNotes && (
                  <div className="mt-3 bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Nota:</span> {appointment.commissionNotes}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Estadísticas Adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Comisión Promedio</p>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(commissionData.averageCommission || 0)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Porcentaje Promedio</p>
          <p className="text-xl font-bold text-gray-900">
            {commissionData.averagePercentage?.toFixed(1) || 0}%
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total de Ventas</p>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(commissionData.totalSales || 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
