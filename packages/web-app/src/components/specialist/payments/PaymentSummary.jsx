import React from 'react';
import { 
  CheckCircleIcon,
  BanknotesIcon,
  CreditCardIcon,
  ShoppingBagIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

/**
 * Resumen final del pago antes de confirmar
 * Muestra todos los detalles: métodos, productos, montos
 */
export default function PaymentSummary({ 
  paymentData, 
  appointment, 
  onConfirm, 
  onBack,
  loading 
}) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getMethodLabel = (method) => {
    const labels = {
      CASH: 'Efectivo',
      WOMPI: 'Tarjeta/Nequi (Wompi)',
      WOMPI_CARD: 'Tarjeta',
      WOMPI_NEQUI: 'Nequi',
      TRANSFER: 'Transferencia',
      CARD: 'Tarjeta'
    };
    return labels[method] || method;
  };

  const totalPayments = paymentData.payments.reduce((sum, p) => 
    sum + parseFloat(p.amount || 0), 0
  );

  const totalProducts = paymentData.products.reduce((sum, p) => 
    sum + (p.price * p.quantity), 0
  );

  const totalAmount = totalPayments + totalProducts;

  return (
    <div className="space-y-6">
      {/* Header de Confirmación */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircleIcon className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Confirmar Pago
        </h3>
        <p className="text-gray-600">
          Revisa los detalles antes de confirmar
        </p>
      </div>

      {/* Información del Cliente y Servicio */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Información de la Cita</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Cliente:</span>
            <span className="font-medium text-gray-900">
              {appointment.client?.firstName} {appointment.client?.lastName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Servicio:</span>
            <span className="font-medium text-gray-900">
              {appointment.service?.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Precio Base:</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(appointment.service?.price)}
            </span>
          </div>
        </div>
      </div>

      {/* Pagos Existentes */}
      {paymentData.existingPayments.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <BanknotesIcon className="w-5 h-5" />
            Pagos Anticipados
          </h4>
          <div className="space-y-2">
            {paymentData.existingPayments.map((payment, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-blue-700">{getMethodLabel(payment.method)}</span>
                <span className="font-semibold text-blue-900">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagos Actuales */}
      {paymentData.payments.length > 0 && (
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <CreditCardIcon className="w-5 h-5" />
            Pagos de Cierre
          </h4>
          <div className="space-y-3">
            {paymentData.payments.map((payment, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {getMethodLabel(payment.method)}
                    </p>
                    {payment.transactionId && (
                      <p className="text-xs text-gray-500 mt-1">
                        ID: {payment.transactionId}
                      </p>
                    )}
                    {payment.reference && (
                      <p className="text-xs text-gray-500">
                        Ref: {payment.reference}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatCurrency(payment.amount)}
                    </p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                      payment.status === 'COMPLETED' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {payment.status === 'COMPLETED' ? 'Completado' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Productos */}
      {paymentData.products.length > 0 && (
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
            <ShoppingBagIcon className="w-5 h-5" />
            Productos Vendidos
          </h4>
          <div className="space-y-2">
            {paymentData.products.map((product, index) => (
              <div key={index} className="flex justify-between text-sm">
                <div>
                  <span className="text-purple-900 font-medium">{product.name}</span>
                  <span className="text-purple-600 ml-2">x{product.quantity}</span>
                </div>
                <span className="font-semibold text-purple-900">
                  {formatCurrency(product.price * product.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total Final */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6">
        <div className="flex items-center justify-between text-white">
          <div>
            <p className="text-sm text-blue-100 mb-1">Total a Pagar</p>
            <p className="text-4xl font-bold">{formatCurrency(totalAmount)}</p>
          </div>
          <CheckCircleIcon className="w-16 h-16 text-white opacity-20" />
        </div>
      </div>

      {/* Notas */}
      {paymentData.notes && (
        <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
          <p className="text-sm font-medium text-yellow-800 mb-1">Notas:</p>
          <p className="text-sm text-yellow-700">{paymentData.notes}</p>
        </div>
      )}

      {/* Botones de Acción */}
      <div className="flex items-center gap-3 pt-4">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Volver
        </button>
        
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
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

      {/* Información de Seguridad */}
      <div className="text-center text-sm text-gray-500">
        <p>🔒 Transacción segura</p>
        <p className="text-xs mt-1">
          Se generará un recibo automáticamente
        </p>
      </div>
    </div>
  );
}
