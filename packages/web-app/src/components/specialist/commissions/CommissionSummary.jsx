import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { CurrencyDollarIcon, ClockIcon, CheckCircleIcon, ChartBarIcon } from '@heroicons/react/24/outline';

/**
 * Resumen de comisiones del especialista
 * Muestra ingresos, comisiones pendientes y pagadas
 */
export default function CommissionSummary({ specialistId, businessId }) {
  const { token } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    pending: 0,
    requested: 0,
    paid: 0,
    total: 0,
    thisMonth: 0,
    lastPayment: null
  });

  useEffect(() => {
    if (specialistId && businessId) {
      loadCommissionSummary();
    }
  }, [specialistId, businessId]);

  const loadCommissionSummary = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/commissions/summary?specialistId=${specialistId}&businessId=${businessId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        // Si el endpoint no existe (404), usar valores por defecto sin mostrar error
        if (response.status === 404) {
          console.log('⚠️ Endpoint de comisiones aún no implementado, usando valores por defecto');
          setSummary({
            pending: 0,
            requested: 0,
            paid: 0,
            total: 0,
            thisMonth: 0,
            lastPayment: null
          });
          return;
        }
        throw new Error('Error cargando comisiones');
      }

      const data = await response.json();
      setSummary(data.data || {
        pending: 0,
        requested: 0,
        paid: 0,
        total: 0,
        thisMonth: 0,
        lastPayment: null
      });
    } catch (error) {
      console.error('Error loading commissions:', error);
      // En caso de error, usar valores por defecto
      setSummary({
        pending: 0,
        requested: 0,
        paid: 0,
        total: 0,
        thisMonth: 0,
        lastPayment: null
      });
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
            <CurrencyDollarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Mis Comisiones</h3>
            <p className="text-sm text-green-100">Resumen financiero</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        {/* Pendientes */}
        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <ClockIcon className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800">Pendientes</p>
              <p className="text-xs text-yellow-600">Por cobrar</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-yellow-900">
              {formatCurrency(summary.pending)}
            </p>
          </div>
        </div>

        {/* Solicitadas */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <ChartBarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Solicitadas</p>
              <p className="text-xs text-blue-600">En proceso</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-900">
              {formatCurrency(summary.requested)}
            </p>
          </div>
        </div>

        {/* Pagadas */}
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Pagadas</p>
              <p className="text-xs text-green-600">Historial</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-900">
              {formatCurrency(summary.paid)}
            </p>
          </div>
        </div>

        {/* Total del Mes */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Este Mes</p>
              <p className="text-xs text-gray-500">Total ganado</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.thisMonth)}
            </p>
          </div>
        </div>

        {/* Último Pago */}
        {summary.lastPayment && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Último pago:</span>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatCurrency(summary.lastPayment.amount)}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(summary.lastPayment.date).toLocaleDateString('es-CO')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botón Ver Detalle */}
        <button
          onClick={() => window.location.href = '/specialist/commissions'}
          className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-md"
        >
          Ver Detalle Completo
        </button>
      </div>
    </div>
  );
}
