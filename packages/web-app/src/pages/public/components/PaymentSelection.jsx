import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CreditCardIcon, BanknotesIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { fetchPaymentInfo, updateBookingData } from '@shared/store/slices/publicBookingSlice';

const PaymentSelection = ({ businessCode, onNext, onBack }) => {
  const dispatch = useDispatch();

  // Obtener estado de Redux
  const { bookingData, paymentInfo, isLoadingPaymentInfo } = useSelector(state => state.publicBooking);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const paymentMethods = [
    {
      id: 'WOMPI',
      name: 'Pago en línea',
      description: 'Paga de forma segura con tarjeta de crédito o débito',
      icon: CreditCardIcon,
      available: true,
      details: 'Aceptamos Visa, MasterCard y American Express'
    },
    {
      id: 'BANK_TRANSFER',
      name: 'Transferencia bancaria',
      description: 'Paga mediante transferencia o consignación bancaria',
      icon: BanknotesIcon,
      available: true,
      details: 'Te enviaremos los datos bancarios después de confirmar'
    },
    {
      id: 'CASH',
      name: 'Pago en efectivo',
      description: 'Paga directamente en el establecimiento',
      icon: DevicePhoneMobileIcon,
      available: true,
      details: 'Paga al momento de tu cita'
    }
  ];

  const handlePaymentSelect = (method) => {
    dispatch(updateBookingData({ paymentMethod: method }));

    // Cargar información bancaria si se selecciona transferencia
    if (method === 'BANK_TRANSFER') {
      dispatch(fetchPaymentInfo({ businessCode, paymentMethod: 'BANK_TRANSFER' }));
    }
  };

  const handleContinue = () => {
    if (!bookingData.paymentMethod) return;
    if (!acceptedTerms) return;

    onNext();
  };

  const selectedMethod = paymentMethods.find(m => m.id === bookingData.paymentMethod);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Método de pago
        </h2>
        <p className="text-gray-600">
          Selecciona cómo deseas realizar el pago por tu reserva
        </p>
      </div>

      {/* Resumen de la reserva */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-gray-900 mb-3">Resumen de tu reserva</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Servicio:</span>
            <span className="font-medium">{bookingData.service?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Especialista:</span>
            <span className="font-medium">{bookingData.specialist?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Fecha y hora:</span>
            <span className="font-medium">
              {bookingData.dateTime && new Date(`${bookingData.dateTime.date}T${bookingData.dateTime.time}`).toLocaleString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duración:</span>
            <span className="font-medium">{bookingData.service?.duration} min</span>
          </div>
          <div className="border-t pt-2 mt-3">
            <div className="flex justify-between font-semibold text-gray-900">
              <span>Total a pagar:</span>
              <span>${bookingData.service?.price?.toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Métodos de pago */}
      <div className="space-y-3 mb-6">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              bookingData.paymentMethod === method.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => method.available && handlePaymentSelect(method.id)}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                bookingData.paymentMethod === method.id
                  ? 'bg-blue-100'
                  : 'bg-gray-100'
              }`}>
                <method.icon className={`w-6 h-6 ${
                  bookingData.paymentMethod === method.id
                    ? 'text-blue-600'
                    : 'text-gray-500'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{method.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                <p className="text-xs text-gray-500 mt-1">{method.details}</p>
              </div>
              {bookingData.paymentMethod === method.id && (
                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional según método seleccionado */}
      {selectedMethod && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-2">
            Información sobre {selectedMethod.name.toLowerCase()}
          </h4>

          {selectedMethod.id === 'WOMPI' && (
            <div className="text-sm text-blue-800">
              <p className="mb-2">
                • Pago seguro procesado por Wompi
              </p>
              <p className="mb-2">
                • Tu reserva se confirmará automáticamente después del pago
              </p>
              <p>
                • Recibirás un comprobante por email
              </p>
            </div>
          )}

          {selectedMethod.id === 'BANK_TRANSFER' && (
            <div className="text-sm text-blue-800">
              <p className="mb-2">
                • Recibirás los datos bancarios por email después de crear la reserva
              </p>
              <p className="mb-2">
                • Tu reserva se confirmará una vez recibido el pago (máximo 24 horas)
              </p>
              <p className="mb-2">
                • Envía el comprobante de pago por WhatsApp o email
              </p>
              {paymentInfo && (
                <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                  <p className="font-medium mb-2">Datos bancarios:</p>
                  <div className="space-y-1 text-xs">
                    <p><strong>Banco:</strong> {paymentInfo.bankName}</p>
                    <p><strong>Tipo de cuenta:</strong> {paymentInfo.accountType}</p>
                    <p><strong>Número de cuenta:</strong> {paymentInfo.accountNumber}</p>
                    <p><strong>Titular:</strong> {paymentInfo.accountHolder}</p>
                    {paymentInfo.nit && <p><strong>NIT:</strong> {paymentInfo.nit}</p>}
                    {paymentInfo.instructions && (
                      <p className="mt-2"><strong>Instrucciones:</strong> {paymentInfo.instructions}</p>
                    )}
                  </div>
                </div>
              )}
              {isLoadingPaymentInfo && (
                <div className="mt-2 text-xs text-blue-600">
                  Cargando información bancaria...
                </div>
              )}
            </div>
          )}

          {selectedMethod.id === 'CASH' && (
            <div className="text-sm text-blue-800">
              <p className="mb-2">
                • Paga directamente en el establecimiento al momento de tu cita
              </p>
              <p className="mb-2">
                • Tu reserva queda pendiente hasta que confirmes tu llegada
              </p>
              <p>
                • Recibirás recordatorios por email y WhatsApp
              </p>
            </div>
          )}
        </div>
      )}

      {/* Términos y condiciones */}
      <div className="mb-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            Acepto los{' '}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 underline"
              onClick={() => {/* Abrir términos */}}
            >
              términos y condiciones
            </button>
            {' '}y la{' '}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 underline"
              onClick={() => {/* Abrir política */}}
            >
              política de privacidad
            </button>
            {' '}para el procesamiento de mis datos y la reserva del servicio.
          </span>
        </label>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          ← Volver
        </button>
        <button
          onClick={handleContinue}
          disabled={!bookingData.paymentMethod || !acceptedTerms}
          className={`px-6 py-2 rounded-lg font-medium ${
            bookingData.paymentMethod && acceptedTerms
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default PaymentSelection;