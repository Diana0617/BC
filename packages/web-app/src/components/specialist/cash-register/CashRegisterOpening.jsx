import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  BanknotesIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { selectUserBranches, selectUserHasMultipleBranches } from '@shared';

/**
 * Formulario para abrir turno de caja
 * Registro de monto inicial y validaciones
 */
export default function CashRegisterOpening({ 
  
  businessId,
  branchId,
  token,
  onSuccess,
  onCancel 
}) {
  const userBranches = useSelector(selectUserBranches);
  const hasMultipleBranches = useSelector(selectUserHasMultipleBranches);
  
  // Encontrar el nombre de la sucursal seleccionada
  const selectedBranch = branchId ? userBranches.find(b => b.id === branchId) : null;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    openingAmount: '',
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

  const calculateBreakdownTotal = () => {
    return denominations.reduce((total, denom) => {
      return total + (formData.denominationBreakdown[denom.key] * denom.value);
    }, 0);
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
    setFormData({ ...formData, openingAmount: total.toString() });
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

    const amount = parseFloat(formData.openingAmount);
    if (isNaN(amount) || amount < 0) {
      alert('Ingresa un monto válido');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cash-register/open-shift`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            businessId,
            branchId: branchId || null,
            openingBalance: amount,
            openingNotes: formData.notes || null,
            denominationBreakdown: showBreakdown ? formData.denominationBreakdown : null
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Si ya hay un turno abierto, mostrar mensaje específico
        if (response.status === 400 && data.error?.includes('turno abierto')) {
          const shouldGoToShift = window.confirm(
            'Ya tienes un turno abierto.\n\n¿Deseas ir al turno activo?'
          );
          if (shouldGoToShift && data.debug?.existingShiftId) {
            // Redirigir al turno existente
            onSuccess?.({ shift: { id: data.debug.existingShiftId } });
            return;
          } else if (shouldGoToShift) {
            // Si no hay ID, simplemente cerrar el modal
            onSuccess?.(null);
            return;
          }
          return;
        }
        throw new Error(data.error || 'Error opening cash register');
      }

      alert('Turno de caja abierto exitosamente');
      onSuccess?.(data);
    } catch (error) {
      console.error('Error opening cash register:', error);
      alert(error.message || 'Error al abrir el turno. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <BanknotesIcon className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Abrir Turno de Caja
        </h3>
        <p className="text-gray-600">
          Registra el monto inicial para comenzar tu turno
        </p>
        {hasMultipleBranches && selectedBranch && (
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
            <BuildingOfficeIcon className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">
              Sucursal: {selectedBranch.name}
            </span>
          </div>
        )}
      </div>

      {/* Información */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <ClockIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Inicio de Turno</p>
            <p className="text-sm text-blue-700 mt-1">
              El sistema registrará automáticamente la hora de inicio. 
              Asegúrate de contar el efectivo correctamente.
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Monto de Apertura */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto de Apertura *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
              $
            </span>
            <input
              type="number"
              value={formData.openingAmount}
              onChange={(e) => setFormData({ ...formData, openingAmount: e.target.value })}
              min="0"
              step="1000"
              required
              className="w-full pl-8 pr-4 py-3 text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
          {formData.openingAmount && (
            <p className="text-sm text-gray-600 mt-2">
              {formatCurrency(parseFloat(formData.openingAmount) || 0)}
            </p>
          )}
        </div>

        {/* Botón Desglose */}
        <button
          type="button"
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
        >
          <CurrencyDollarIcon className="w-5 h-5" />
          {showBreakdown ? 'Ocultar Desglose' : 'Agregar Desglose de Denominaciones (Opcional)'}
        </button>

        {/* Desglose de Denominaciones */}
        {showBreakdown && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-2 mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">
                  Desglose por Denominación
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Cuenta cuántos billetes y monedas de cada tipo tienes. El sistema calculará el total automáticamente.
                </p>
              </div>
            </div>
            
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
                    className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {formatCurrency(formData.denominationBreakdown[denom.key] * denom.value)}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-green-50 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Total Desglose:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(calculateBreakdownTotal())}
                </span>
              </div>
              <button
                type="button"
                onClick={handleUseBreakdown}
                className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Usar este Monto
              </button>
            </div>
          </div>
        )}

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas (opcional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            placeholder="Observaciones sobre el turno..."
          />
        </div>

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
            disabled={loading || !formData.openingAmount}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Abriendo...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                Abrir Turno
              </>
            )}
          </button>
        </div>
      </form>

      {/* Advertencia */}
      <div className="bg-yellow-50 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <span className="font-medium">⚠️ Importante:</span> Verifica el monto cuidadosamente. 
          Una vez abierto el turno, deberás cerrarlo al finalizar tu jornada.
        </p>
      </div>
    </div>
  );
}
