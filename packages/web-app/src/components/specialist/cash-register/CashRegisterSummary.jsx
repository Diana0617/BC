import React from 'react';
import { 
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

/**
 * Resumen estadístico del turno de caja activo
 * Muestra totales y gráficos simples
 */
export default function CashRegisterSummary({ shiftData }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const calculateBalance = () => {
    const opening = parseFloat(shiftData?.openingBalance) || 0;
    const income = parseFloat(shiftData?.totalIncome) || 0;
    const expenses = parseFloat(shiftData?.totalExpenses) || 0;
    return opening + income - expenses;
  };

  const getIncomePercentage = () => {
    const total = (parseFloat(shiftData?.totalIncome) || 0) + (parseFloat(shiftData?.totalExpenses) || 0);
    if (total === 0) return 50;
    return ((parseFloat(shiftData?.totalIncome) || 0) / total) * 100;
  };

  const balance = calculateBalance();
  const incomePercentage = getIncomePercentage();

  return (
    <div className="space-y-6">
      {/* Balance Actual */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-blue-100 mb-1">Balance Actual</p>
            <p className="text-4xl font-bold">{formatCurrency(balance)}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-full p-4">
            <BanknotesIcon className="w-10 h-10" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-xs text-blue-100 mb-1">Apertura</p>
            <p className="text-lg font-semibold">
              {formatCurrency(shiftData?.openingBalance)}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-100 mb-1">Movimientos</p>
            <p className="text-lg font-semibold">
              {shiftData?.movementsCount || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Ingresos y Egresos */}
      <div className="grid grid-cols-2 gap-4">
        {/* Ingresos */}
        <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-3">
            <ArrowTrendingUpIcon className="w-8 h-8 text-green-600" />
            <span className="text-xs font-medium text-green-700 bg-green-200 px-2 py-1 rounded-full">
              +{shiftData?.incomeCount || 0}
            </span>
          </div>
          <p className="text-sm text-green-700 mb-1">Ingresos</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(shiftData?.totalIncome)}
          </p>
        </div>

        {/* Egresos */}
        <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
          <div className="flex items-center justify-between mb-3">
            <ArrowTrendingDownIcon className="w-8 h-8 text-red-600" />
            <span className="text-xs font-medium text-red-700 bg-red-200 px-2 py-1 rounded-full">
              -{shiftData?.expenseCount || 0}
            </span>
          </div>
          <p className="text-sm text-red-700 mb-1">Egresos</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(shiftData?.totalExpenses)}
          </p>
        </div>
      </div>

      {/* Gráfico de Proporción */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ChartBarIcon className="w-5 h-5" />
          Proporción de Movimientos
        </h4>

        <div className="space-y-4">
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
        </div>

        {/* Comparación */}
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

      {/* Información por Categoría */}
      {shiftData?.categoryBreakdown && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            Desglose por Categoría
          </h4>
          <div className="space-y-3">
            {Object.entries(shiftData.categoryBreakdown).map(([category, data]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    data.type === 'INCOME' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm text-gray-700">{category}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(data.amount)}
                  </p>
                  <p className="text-xs text-gray-500">{data.count} mov.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tiempo de Turno */}
      {shiftData?.openedAt && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Turno iniciado</span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(shiftData.openedAt).toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-600">Duración</span>
            <span className="text-sm font-medium text-gray-900">
              {Math.floor((Date.now() - new Date(shiftData.openedAt).getTime()) / (1000 * 60))} minutos
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
