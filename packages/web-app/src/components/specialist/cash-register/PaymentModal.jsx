import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  XMarkIcon,
  BanknotesIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline';
import ReceiptActions from '../payments/ReceiptActions';

/**
 * Modal para procesar el pago de un turno
 * Registra el pago y crea el movimiento de caja
 */
export default function PaymentModal({ 
  isOpen, 
  onClose, 
  appointment, 
  shiftId,
  onSuccess 
}) {
  const { user, token } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [formData, setFormData] = useState({
    paymentMethodId: '',
    amount: 0,
    discount: 0,
    notes: ''
  });

  useEffect(() => {
    if (isOpen && appointment) {
      // Reset estado de pago exitoso
      setPaymentSuccessful(false);
      
      // Asegurar que los valores sean números
      const totalAmount = parseFloat(appointment.totalAmount) || 0;
      const currentDiscount = parseFloat(appointment.discountAmount) || 0;
      
      // Calcular el monto a pagar (total - descuento previo)
      const amountToPay = totalAmount - currentDiscount;
      setFormData({
        paymentMethodId: '',
        amount: amountToPay,
        discount: 0, // No incluir el descuento anterior aquí, está en appointment.discountAmount
        notes: ''
      });
      loadPaymentMethods();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, appointment]);

  const loadPaymentMethods = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/business/${user.businessId}/payment-methods`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Error loading payment methods');

      const data = await response.json();
      setPaymentMethods(data.data || data.paymentMethods || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      alert('Error al cargar los métodos de pago');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.paymentMethodId) {
      alert('Selecciona un método de pago');
      return;
    }

    if (formData.amount <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }

    setLoading(true);
    try {
      // 1. Registrar el pago en el appointment
      const paymentResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/appointments/${appointment.id}/payment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            businessId: user.businessId,
            paymentMethodId: formData.paymentMethodId,
            amount: formData.amount,
            discount: formData.discount,
            notes: formData.notes
          })
        }
      );

      if (!paymentResponse.ok) {
        const error = await paymentResponse.json();
        throw new Error(error.message || 'Error al procesar el pago');
      }

      await paymentResponse.json(); // paymentData

      // 2. Registrar movimiento de caja (si hay caja abierta)
      if (shiftId) {
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/cash-register/movements`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              shiftId,
              type: 'INCOME',
              category: 'APPOINTMENT',
              amount: formData.amount,
              paymentMethodId: formData.paymentMethodId,
              description: `Pago turno #${appointment.id.substring(0, 8)} - ${getClientName()}`,
              referenceId: appointment.id,
              referenceType: 'APPOINTMENT'
            })
          }
        );
      }

      // Establecer pago exitoso ANTES del alert para que el modal cambie inmediatamente
      setPaymentSuccessful(true);
      
      // No cerrar el modal para mostrar las opciones de recibo
    } catch (error) {
      console.error('Error processing payment:', error);
      alert(error.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (paymentSuccessful) {
      onSuccess?.();
    }
    onClose();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getClientName = () => {
    const client = appointment.Client || appointment.client;
    if (!client) return 'Cliente';
    return `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Cliente';
  };

  const getServiceName = () => {
    const service = appointment.Service || appointment.service;
    return service?.name || 'Servicio';
  };

  const calculateFinalAmount = () => {
    return Math.max(0, formData.amount - formData.discount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {paymentSuccessful ? (
              <>
                <CheckCircleIcon className="w-6 h-6" />
                <h2 className="text-xl font-bold">Pago Completado</h2>
              </>
            ) : (
              <>
                <BanknotesIcon className="w-6 h-6" />
                <h2 className="text-xl font-bold">Procesar Pago</h2>
              </>
            )}
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        {paymentSuccessful ? (
          <div className="p-6 space-y-6">
            {/* Mensaje de éxito */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">¡Pago Registrado!</h3>
                  <p className="text-sm text-green-700">
                    El pago se procesó correctamente y se registró en caja.
                  </p>
                </div>
              </div>
            </div>

            {/* Componente de Recibo */}
            <ReceiptActions 
              appointmentId={appointment.id}
              businessId={user.businessId}
            />

            {/* Botón para cerrar */}
            <button
              onClick={handleClose}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información del Turno */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-gray-900 mb-3">Información del Turno</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Cliente:</span>
              <span className="font-medium text-gray-900">{getClientName()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Servicio:</span>
              <span className="font-medium text-gray-900">{getServiceName()}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="text-gray-600">Monto Total:</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(appointment.totalAmount)}
              </span>
            </div>
            {appointment.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Descuento:</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(appointment.discountAmount)}
                </span>
              </div>
            )}
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago *
            </label>
            <select
              value={formData.paymentMethodId}
              onChange={(e) => setFormData({ ...formData, paymentMethodId: e.target.value })}
              disabled={loading}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Seleccionar método</option>
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </select>
          </div>

          {/* Monto a Pagar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto a Pagar
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                disabled={loading}
                min="0"
                step="100"
                required
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Descuento Adicional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descuento Adicional
            </label>
            <div className="relative">
              <ReceiptPercentIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                disabled={loading}
                min="0"
                step="100"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={loading}
              rows={3}
              placeholder="Comentarios sobre el pago..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 resize-none"
            />
          </div>

          {/* Total Final */}
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total a Cobrar:</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatCurrency(calculateFinalAmount())}
              </span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  Confirmar Pago
                </>
              )}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
