import React, { useState, useEffect } from 'react';
import { 
  BanknotesIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';

/**
 * Formulario para cerrar turno de caja
 * Conteo final, cuadre y generación de reporte
 */
export default function CashRegisterClosing({ 
  shiftId,
  shiftData,
  onSuccess,
  onCancel 
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    closingAmount: '',
    notes: '',
    denominationBreakdown: {
      bills_100000: 0,
      bills_50000: 0,
      bills_20000: 0,
      bills_10000: 0,
      bills_5000: 0,
      bills_2000: 0,
      bills_1000: 0,
      coins_500: 0,
      coins_200: 0,
      coins_100: 0,
      coins_50: 0
    }
  });

  const [showBreakdown, setShowBreakdown] = useState(false);
  const [difference, setDifference] = useState(0);

  const denominations = [
    { key: 'bills_100000', label: '$100,000', value: 100000 },
    { key: 'bills_50000', label: '$50,000', value: 50000 },
    { key: 'bills_20000', label: '$20,000', value: 20000 },
    { key: 'bills_10000', label: '$10,000', value: 10000 },
    { key: 'bills_5000', label: '$5,000', value: 5000 },
    { key: 'bills_2000', label: '$2,000', value: 2000 },
    { key: 'bills_1000', label: '$1,000', value: 1000 },
    { key: 'coins_500', label: '$500', value: 500 },
    { key: 'coins_200', label: '$200', value: 200 },
    { key: 'coins_100', label: '$100', value: 100 },
    { key: 'coins_50', label: '$50', value: 50 }
  ];

  useEffect(() => {
    const closingAmount = parseFloat(formData.closingAmount) || 0;
    const expectedAmount = calculateExpectedAmount();
    setDifference(closingAmount - expectedAmount);
  }, [formData.closingAmount, shiftData]);

  const calculateBreakdownTotal = () => {
    return denominations.reduce((total, denom) => {
      return total + (formData.denominationBreakdown[denom.key] * denom.value);
    }, 0);
  };

  const calculateExpectedAmount = () => {
    if (!shiftData) return 0;
    
    const opening = parseFloat(shiftData.openingBalance) || 0;
    const income = parseFloat(shiftData.totalIncome) || 0;
    const expenses = parseFloat(shiftData.totalExpenses) || 0;
    
    return opening + income - expenses;
  };

  const handleDenominationChange = (key, value) => {
    const numValue = parseInt(value) || 0;
    setFormData({
      ...formData,
      denominationBreakdown: {
        ...formData.denominationBreakdown,
        [key]: numValue
      }
    });
  };

  const handleUseBreakdown = () => {
    const total = calculateBreakdownTotal();
    setFormData({ ...formData, closingAmount: total.toString() });
    setShowBreakdown(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const amount = parseFloat(formData.closingAmount);
    if (isNaN(amount) || amount < 0) {
      alert('Ingresa un monto válido');
      return;
    }

    // Advertencia si hay diferencia significativa
    if (Math.abs(difference) > 10000) {
      const confirm = window.confirm(
        `Hay una diferencia de ${formatCurrency(difference)}. ¿Deseas continuar con el cierre?`
      );
      if (!confirm) return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cash-register/close/${shiftId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            closingAmount: amount,
            notes: formData.notes,
            denominationBreakdown: showBreakdown ? formData.denominationBreakdown : null,
            difference: difference
          })
        }
      );

      if (!response.ok) throw new Error('Error closing shift');

      const data = await response.json();
      alert('Turno de caja cerrado exitosamente');
      onSuccess?.(data);
    } catch (error) {
      console.error('Error closing shift:', error);
      alert('Error al cerrar el turno. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const expectedAmount = calculateExpectedAmount();
  const hasDifference = Math.abs(difference) > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <BanknotesIcon className="w-10 h-10 text-red-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Cerrar Turno de Caja
        </h3>
        <p className="text-gray-600">
          Realiza el conteo final y cuadra la caja
        </p>
      </div>

      {/* Resumen del Turno */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
        <h4 className="font-semibold text-gray-900 mb-4">Resumen del Turno</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Balance Inicial</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(shiftData?.openingBalance)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Ingresos</p>
            <p className="text-xl font-bold text-green-600">
              +{formatCurrency(shiftData?.totalIncome)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Egresos</p>
            <p className="text-xl font-bold text-red-600">
              -{formatCurrency(shiftData?.totalExpenses)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Movimientos</p>
            <p className="text-xl font-bold text-gray-900">
              {shiftData?.movementsCount || 0}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t-2 border-blue-200">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700">Monto Esperado:</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(expectedAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Monto de Cierre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto Real en Caja *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
              $
            </span>
            <input
              type="number"
              value={formData.closingAmount}
              onChange={(e) => setFormData({ ...formData, closingAmount: e.target.value })}
              min="0"
              step="1000"
              required
              disabled={showBreakdown}
              className="w-full pl-8 pr-4 py-3 text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="0"
            />
          </div>
          {formData.closingAmount && (
            <p className="text-sm text-gray-600 mt-2">
              {formatCurrency(parseFloat(formData.closingAmount) || 0)}
            </p>
          )}
        </div>

        {/* Diferencia */}
        {formData.closingAmount && (
          <div className={`rounded-xl p-4 border-2 ${
            Math.abs(difference) < 1000
              ? 'bg-green-50 border-green-200'
              : Math.abs(difference) < 10000
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalculatorIcon className={`w-6 h-6 ${
                  Math.abs(difference) < 1000
                    ? 'text-green-600'
                    : Math.abs(difference) < 10000
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`} />
                <span className="font-semibold text-gray-900">Diferencia:</span>
              </div>
              <span className={`text-2xl font-bold ${
                difference > 0 ? 'text-green-600' :
                difference < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {difference > 0 && '+'}{formatCurrency(difference)}
              </span>
            </div>
            {Math.abs(difference) > 0 && (
              <p className="text-sm mt-2 text-gray-700">
                {difference > 0 ? '💰 Hay un sobrante' : '⚠️ Hay un faltante'} de {formatCurrency(Math.abs(difference))}
              </p>
            )}
          </div>
        )}

        {/* Botón Desglose */}
        <button
          type="button"
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
        >
          <CurrencyDollarIcon className="w-5 h-5" />
          {showBreakdown ? 'Ocultar Desglose' : 'Agregar Desglose de Denominaciones'}
        </button>

        {/* Desglose de Denominaciones */}
        {showBreakdown && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h4 className="font-semibold text-gray-900 mb-3">
              Conteo por Denominación
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {denominations.map(denom => (
                <div key={denom.key} className="bg-white rounded-lg p-3 border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {denom.label}
                  </label>
                  <input
                    type="number"
                    value={formData.denominationBreakdown[denom.key]}
                    onChange={(e) => handleDenominationChange(denom.key, e.target.value)}
                    min="0"
                    className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {formatCurrency(formData.denominationBreakdown[denom.key] * denom.value)}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-red-50 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Total Conteo:</span>
                <span className="text-2xl font-bold text-red-600">
                  {formatCurrency(calculateBreakdownTotal())}
                </span>
              </div>
              <button
                type="button"
                onClick={handleUseBreakdown}
                className="w-full mt-3 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Usar este Monto
              </button>
            </div>
          </div>
        )}

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas de Cierre (opcional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            placeholder="Observaciones sobre el cierre del turno..."
          />
        </div>

        {/* Advertencia de Diferencia */}
        {Math.abs(difference) > 10000 && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">Diferencia Significativa</p>
                <p className="text-sm text-red-700 mt-1">
                  La diferencia es mayor a $10,000. Por favor verifica el conteo 
                  y explica la diferencia en las notas.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <XMarkIcon className="w-5 h-5" />
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={loading || !formData.closingAmount}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Cerrando...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                Cerrar Turno
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
