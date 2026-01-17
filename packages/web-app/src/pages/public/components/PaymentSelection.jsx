import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  CreditCardIcon, 
  BanknotesIcon, 
  DevicePhoneMobileIcon,
  ArrowsRightLeftIcon,
  QrCodeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { updateBookingData } from '@shared/store/slices/publicBookingSlice';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://beautycontrol-api.azurewebsites.net/api';

// Mapeo de tipos a iconos
const PAYMENT_TYPE_ICONS = {
  CASH: BanknotesIcon,
  CARD: CreditCardIcon,
  TRANSFER: ArrowsRightLeftIcon,
  QR: QrCodeIcon,
  ONLINE: GlobeAltIcon,
  OTHER: DevicePhoneMobileIcon
};

const PaymentSelection = ({ businessCode, onNext, onBack }) => {
  const dispatch = useDispatch();

  // Obtener estado de Redux
  const { bookingData } = useSelector(state => state.publicBooking);

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar métodos de pago al montar
  useEffect(() => {
    fetchPaymentMethods();
  }, [businessCode]);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/public/bookings/business/${businessCode}/payment-methods`
      );
      
      if (response.data.success) {
        setPaymentMethods(response.data.data.paymentMethods);
        setBusinessInfo(response.data.data.businessInfo);
      }
    } catch (err) {
      console.error('Error al cargar métodos de pago:', err);
      setError('No se pudieron cargar los métodos de pago');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSelect = (methodId) => {
    const selectedMethod = paymentMethods.find(m => m.id === methodId);
    console.log('✅ PaymentSelection - Método de pago seleccionado:', { methodId, selectedMethod });
    dispatch(updateBookingData({ 
      paymentMethod: methodId,
      paymentMethodData: selectedMethod
    }));
  };

  const handleContinue = () => {
    if (!bookingData.paymentMethod) return;
    if (!acceptedTerms) return;

    onNext();
  };

  const selectedMethod = paymentMethods.find(m => m.id === bookingData.paymentMethod);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-600">Este negocio aún no tiene métodos de pago configurados. Por favor, contacta directamente.</p>
      </div>
    );
  }

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
        {paymentMethods.map((method) => {
          const IconComponent = PAYMENT_TYPE_ICONS[method.type] || DevicePhoneMobileIcon;
          
          return (
            <div
              key={method.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                bookingData.paymentMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handlePaymentSelect(method.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  bookingData.paymentMethod === method.id
                    ? 'bg-blue-100'
                    : 'bg-gray-100'
                }`}>
                  <IconComponent className={`w-6 h-6 ${
                    bookingData.paymentMethod === method.id
                      ? 'text-blue-600'
                      : 'text-gray-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{method?.name || 'Método de pago'}</h3>
                  <p className="text-sm text-gray-600 mt-1">{method.type === 'CASH' && 'Paga directamente en el establecimiento'}
                    {method.type === 'CARD' && 'Paga con tarjeta de crédito o débito'}
                    {method.type === 'TRANSFER' && 'Transferencia o consignación bancaria'}
                    {method.type === 'QR' && 'Paga escaneando el código QR'}
                    {method.type === 'ONLINE' && 'Pago en línea seguro'}
                    {method.type === 'OTHER' && (method.metadata?.description || 'Otro método de pago')}
                  </p>
                  {method.requiresProof && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <span>⚠️</span> Requiere comprobante de pago
                    </p>
                  )}
                </div>
                {bookingData.paymentMethod === method.id && (
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Información adicional según método seleccionado */}
      {selectedMethod && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-3">
            Información de pago
          </h4>

          {selectedMethod.type === 'TRANSFER' && selectedMethod.bankInfo && (
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <h5 className="font-semibold text-gray-900 mb-3">Datos bancarios:</h5>
                <div className="space-y-2 text-sm">
                  {selectedMethod.bankInfo.bankName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Banco:</span>
                      <span className="font-medium">{selectedMethod.bankInfo.bankName}</span>
                    </div>
                  )}
                  {selectedMethod.bankInfo.accountType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo de cuenta:</span>
                      <span className="font-medium">{selectedMethod.bankInfo.accountType}</span>
                    </div>
                  )}
                  {selectedMethod.bankInfo.accountNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Número de cuenta:</span>
                      <span className="font-medium font-mono">{selectedMethod.bankInfo.accountNumber}</span>
                    </div>
                  )}
                  {selectedMethod.bankInfo.cci && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">CCI:</span>
                      <span className="font-medium font-mono">{selectedMethod.bankInfo.cci}</span>
                    </div>
                  )}
                  {selectedMethod.bankInfo.holderName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Titular:</span>
                      <span className="font-medium">{selectedMethod.bankInfo.holderName}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {businessInfo?.phone && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 mb-2">
                    📱 <strong>Importante:</strong> Envía tu comprobante de pago por WhatsApp al:
                  </p>
                  <a 
                    href={`https://wa.me/${businessInfo.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    {businessInfo.phone}
                  </a>
                </div>
              )}
              
              <p className="text-xs text-blue-700">
                💡 Tu reserva se confirmará una vez que verifiquemos tu pago (máximo 24 horas)
              </p>
            </div>
          )}

          {selectedMethod.type === 'QR' && selectedMethod.qrInfo && (
            <div className="space-y-3">
              {selectedMethod.qrInfo.qrImage && (
                <div className="bg-white rounded-lg p-4 text-center">
                  <img 
                    src={selectedMethod.qrInfo.qrImage} 
                    alt="Código QR de pago"
                    className="max-w-[200px] mx-auto"
                  />
                </div>
              )}
              {selectedMethod.qrInfo.phoneNumber && (
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Número:</strong> {selectedMethod.qrInfo.phoneNumber}
                  </p>
                </div>
              )}
              <p className="text-xs text-blue-700">
                💡 Escanea el código QR o envía al número indicado. Luego envía el comprobante por WhatsApp.
              </p>
            </div>
          )}

          {selectedMethod.type === 'CASH' && (
            <div className="text-sm text-blue-800">
              <p className="mb-2">
                • Paga directamente en el establecimiento al momento de tu cita
              </p>
              <p className="mb-2">
                • Tu reserva queda confirmada, pero recuerda llegar puntual
              </p>
              <p>
                • Recibirás recordatorios por email{businessInfo?.phone && ' y WhatsApp'}
              </p>
            </div>
          )}

          {selectedMethod.type === 'ONLINE' && (
            <div className="text-sm text-blue-800">
              <p className="mb-2">
                • Pago seguro procesado por pasarela de pagos
              </p>
              <p className="mb-2">
                • Tu reserva se confirmará automáticamente después del pago
              </p>
              <p>
                • Recibirás un comprobante por email
              </p>
            </div>
          )}

          {selectedMethod.type === 'CARD' && (
            <div className="text-sm text-blue-800">
              <p className="mb-2">
                • Paga con tarjeta de crédito o débito
              </p>
              <p className="mb-2">
                • Tu reserva se confirmará al procesar el pago
              </p>
              <p>
                • Aceptamos las principales tarjetas
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