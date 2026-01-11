import React, { useState } from 'react';
import { 
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  XMarkIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

/**
 * Formulario para registrar movimientos de caja
 * Ingresos o egresos manuales
 */
export default function MovementForm({ 
  shiftId,
  type = 'INCOME', // 'INCOME' | 'EXPENSE'
  onSuccess,
  onCancel 
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    reference: ''
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const incomeCategories = [
    { value: 'APPOINTMENT', label: 'Pago de Cita' },
    { value: 'PRODUCT_SALE', label: 'Venta de Producto' },
    { value: 'ADJUSTMENT', label: 'Ajuste' },
    { value: 'OTHER', label: 'Otro' }
  ];

  const expenseCategories = [
    { value: 'SUPPLIES', label: 'Insumos' },
    { value: 'UTILITIES', label: 'Servicios' },
    { value: 'MAINTENANCE', label: 'Mantenimiento' },
    { value: 'SALARY', label: 'Salario' },
    { value: 'COMMISSION', label: 'Comisión' },
    { value: 'ADJUSTMENT', label: 'Ajuste' },
    { value: 'OTHER', label: 'Otro' }
  ];

  const categories = type === 'INCOME' ? incomeCategories : expenseCategories;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Ingresa un monto válido');
      return;
    }

    if (!formData.category) {
      alert('Selecciona una categoría');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cash-register/movement`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            shiftId,
            type,
            amount,
            category: formData.category,
            description: formData.description,
            reference: formData.reference
          })
        }
      );

      if (!response.ok) throw new Error('Error creating movement');

      const data = await response.json();
      alert(`${type === 'INCOME' ? 'Ingreso' : 'Egreso'} registrado exitosamente`);
      onSuccess?.(data);
    } catch (error) {
      console.error('Error creating movement:', error);
      alert('Error al registrar el movimiento. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const isIncome = type === 'INCOME';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
          isIncome ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {isIncome ? (
            <ArrowDownTrayIcon className="w-10 h-10 text-green-600" />
          ) : (
            <ArrowUpTrayIcon className="w-10 h-10 text-red-600" />
          )}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Registrar {isIncome ? 'Ingreso' : 'Egreso'}
        </h3>
        <p className="text-gray-600">
          Registra un movimiento de {isIncome ? 'entrada' : 'salida'} de efectivo
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Monto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
              $
            </span>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              min="0"
              step="1000"
              required
              className="w-full pl-8 pr-4 py-3 text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
          {formData.amount && (
            <p className="text-sm text-gray-600 mt-2">
              {formatCurrency(parseFloat(formData.amount) || 0)}
            </p>
          )}
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder={`Describe el ${isIncome ? 'ingreso' : 'gasto'}...`}
          />
        </div>

        {/* Referencia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Referencia / Factura (opcional)
          </label>
          <input
            type="text"
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Factura #123, Recibo #456"
          />
        </div>

        {/* Resumen */}
        {formData.amount && formData.category && (
          <div className={`rounded-xl p-4 border-2 ${
            isIncome 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {isIncome ? 'Se agregará' : 'Se descontará'}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {categories.find(c => c.value === formData.category)?.label}
                </p>
              </div>
              <p className={`text-2xl font-bold ${
                isIncome ? 'text-green-600' : 'text-red-600'
              }`}>
                {isIncome ? '+' : '-'}{formatCurrency(parseFloat(formData.amount) || 0)}
              </p>
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
            disabled={loading || !formData.amount || !formData.category}
            className={`flex-1 px-6 py-3 text-white rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              isIncome
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Registrando...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                Registrar {isIncome ? 'Ingreso' : 'Egreso'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Información */}
      <div className={`rounded-lg p-4 ${
        isIncome ? 'bg-green-50' : 'bg-red-50'
      }`}>
        <div className="flex items-start gap-3">
          <DocumentTextIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            isIncome ? 'text-green-600' : 'text-red-600'
          }`} />
          <div>
            <p className={`font-medium mb-1 ${
              isIncome ? 'text-green-800' : 'text-red-800'
            }`}>
              {isIncome ? '💰 Registro de Ingreso' : '💸 Registro de Egreso'}
            </p>
            <p className={`text-sm ${
              isIncome ? 'text-green-700' : 'text-red-700'
            }`}>
              {isIncome 
                ? 'Este movimiento incrementará el balance de la caja.'
                : 'Este movimiento reducirá el balance de la caja.'
              }
              {' '}Asegúrate de ingresar los datos correctamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
