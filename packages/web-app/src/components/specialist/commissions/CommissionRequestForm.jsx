import React, { useState } from 'react';
import { 
  PaperAirplaneIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

/**
 * Formulario para solicitar pago de comisiones
 * Permite seleccionar período y agregar notas
 */
export default function CommissionRequestForm({ 
  specialistId,
  pendingAmount,
  onSuccess,
  onCancel 
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: pendingAmount || 0,
    notes: '',
    paymentMethod: 'TRANSFER' // 'TRANSFER', 'CASH', 'CHECK'
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.amount <= 0) {
      alert('El monto debe ser mayor a cero');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/commissions/request`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            specialistId,
            ...formData
          })
        }
      );

      if (!response.ok) throw new Error('Error creating request');

      const data = await response.json();
      alert('Solicitud de pago enviada exitosamente');
      onSuccess?.(data);
    } catch (error) {
      console.error('Error creating commission request:', error);
      alert('Error al crear la solicitud. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethodOptions = [
    { value: 'TRANSFER', label: 'Transferencia Bancaria', icon: '🏦' },
    { value: 'CASH', label: 'Efectivo', icon: '💵' },
    { value: 'CHECK', label: 'Cheque', icon: '📝' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <PaperAirplaneIcon className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Solicitar Pago de Comisiones
        </h3>
        <p className="text-gray-600">
          Completa la información para solicitar tu pago
        </p>
      </div>

      {/* Monto Disponible */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
        <p className="text-sm text-gray-600 text-center mb-1">Comisiones Pendientes</p>
        <p className="text-4xl font-bold text-gray-900 text-center">
          {formatCurrency(pendingAmount)}
        </p>
      </div>

      {/* Advertencia si no hay monto */}
      {pendingAmount <= 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-800">Sin Comisiones Pendientes</p>
              <p className="text-sm text-yellow-700 mt-1">
                No tienes comisiones pendientes para solicitar en este momento.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Monto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto a Solicitar *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              max={pendingAmount}
              min={0}
              step="1000"
              required
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Máximo disponible: {formatCurrency(pendingAmount)}
          </p>
        </div>

        {/* Método de Pago */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Método de Pago Preferido *
          </label>
          <div className="grid grid-cols-1 gap-3">
            {paymentMethodOptions.map(option => (
              <label
                key={option.value}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.paymentMethod === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  value={option.value}
                  checked={formData.paymentMethod === option.value}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="sr-only"
                />
                <span className="text-2xl mr-3">{option.icon}</span>
                <span className={`font-medium ${
                  formData.paymentMethod === option.value ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {option.label}
                </span>
                {formData.paymentMethod === option.value && (
                  <CheckCircleIcon className="w-5 h-5 text-blue-600 ml-auto" />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas Adicionales (opcional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Información adicional, datos bancarios, etc..."
          />
        </div>

        {/* Botones */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={loading || pendingAmount <= 0 || formData.amount <= 0}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Enviando...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="w-5 h-5" />
                Enviar Solicitud
              </>
            )}
          </button>
        </div>
      </form>

      {/* Información Adicional */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-700 mb-2">
          <span className="font-medium">📋 Proceso de Solicitud:</span>
        </p>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Tu solicitud será revisada por administración</li>
          <li>Recibirás una notificación cuando sea aprobada</li>
          <li>El pago se procesará según el método seleccionado</li>
          <li>Podrás ver el estado en tu historial de comisiones</li>
        </ol>
      </div>
    </div>
  );
}
