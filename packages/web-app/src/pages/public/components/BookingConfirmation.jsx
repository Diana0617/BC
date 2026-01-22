/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, ClockIcon, UserIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { createBooking } from '@shared/store/slices/publicBookingSlice';

console.log('🚀🚀🚀 BookingConfirmation.jsx CARGADO - Versión:', new Date().toISOString());

const BookingConfirmation = ({ businessCode, onBack }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Obtener estado de Redux
  const { bookingData, isCreatingBooking, bookingError, currentBooking } = useSelector(state => state.publicBooking);

  // DEBUG: Ver el estado completo
  console.log('🔍 BookingConfirmation - Estado completo:', { bookingData, isCreatingBooking, bookingError, currentBooking });
  console.log('🔍 BookingConfirmation - bookingData.service:', bookingData?.service);
  console.log('🔍 BookingConfirmation - bookingData.specialist:', bookingData?.specialist);
  console.log('🔍 BookingConfirmation - bookingData.dateTime:', bookingData?.dateTime);
  console.log('🔍 BookingConfirmation - bookingData.clientData:', bookingData?.clientData);
  console.log('🔍 BookingConfirmation - bookingData.paymentMethod:', bookingData?.paymentMethod);
  console.log('🔍 BookingConfirmation - bookingData.paymentMethodData:', bookingData?.paymentMethodData);

  // Validar que tenemos todos los datos necesarios
  if (!bookingData.service || !bookingData.specialist || !bookingData.dateTime || !bookingData.clientData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-700 mb-4">Faltan datos para completar la reserva.</p>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ← Volver
        </button>
      </div>
    );
  }

  // Redirigir cuando se crea la reserva exitosamente
  useEffect(() => {
    if (currentBooking) {
      navigate('/booking/success', {
        state: {
          bookingData: bookingData,
          bookingCode: currentBooking.code
        }
      });
    }
  }, [currentBooking, bookingData, navigate]);

  const handleConfirmBooking = () => {
    // Validar que tenemos todos los datos antes de enviar
    if (!bookingData.service?.id || !bookingData.specialist?.id || !bookingData.dateTime?.date || !bookingData.clientData?.name) {
      console.error('Faltan datos para crear la reserva', bookingData);
      return;
    }

    // Preparar datos para la API
    const bookingPayload = {
      serviceId: bookingData.service?.id,
      specialistId: bookingData.specialist?.id,
      branchId: bookingData.dateTime?.branchId,
      date: bookingData.dateTime?.date,
      time: bookingData.dateTime?.time,
      clientName: bookingData.clientData?.name,
      clientEmail: bookingData.clientData?.email,
      clientPhone: bookingData.clientData?.phone,
      notes: bookingData.clientData?.notes || '',
      paymentMethod: bookingData.paymentMethod,
      paymentProofUrl: bookingData.paymentProofUrl || null
    };

    console.log('📤 Enviando reserva al backend:', bookingPayload);
    console.log('📤 Business Code:', businessCode);
    dispatch(createBooking({ businessCode, bookingData: bookingPayload }));
  };

  const formatDateTime = (date, time) => {
    if (!date || !time) {
      return { date: '', time: '' };
    }
    
    try {
      const dateTime = new Date(`${date}T${time}`);
      return {
        date: dateTime.toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        time: dateTime.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return { date: date || '', time: time || '' };
    }
  };

  const { date, time } = formatDateTime(bookingData.dateTime?.date, bookingData.dateTime?.time);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Confirmar reserva
        </h2>
        <p className="text-gray-600">
          Revisa los detalles de tu reserva antes de confirmar
        </p>
      </div>

      {/* Resumen completo de la reserva */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircleIcon className="w-8 h-8 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Detalles de tu reserva
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Información del servicio */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">
                Servicio{bookingData.services && bookingData.services.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="ml-7 space-y-3">
              {bookingData.services && bookingData.services.length > 0 ? (
                bookingData.services.map((service, index) => (
                  <div key={service.id || index} className="pb-2 border-b border-gray-200 last:border-0">
                    <p className="font-medium text-gray-900">{service?.name || 'Servicio'}</p>
                    {service.description && (
                      <p className="text-sm text-gray-600">{service.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-gray-500">⏱️ {service?.duration || 0} min</p>
                      <p className="text-sm text-green-600 font-medium">${service?.price?.toLocaleString('es-CO') || '0'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div>
                  <p className="font-medium text-gray-900">{bookingData.service?.name || 'Servicio'}</p>
                  <p className="text-sm text-gray-600">{bookingData.service?.description || ''}</p>
                  <p className="text-sm text-gray-500">Duración: {bookingData.service?.duration || 0} minutos</p>
                </div>
              )}
              {bookingData.services && bookingData.services.length > 1 && (
                <div className="pt-2 border-t-2 border-gray-300">
                  <p className="text-sm font-semibold text-gray-900">
                    Total: {bookingData.totalDuration || 0} min • ${(bookingData.totalPrice || 0).toLocaleString('es-CO')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Información del especialista */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Especialista</span>
            </div>
            <div className="ml-7">
              <p className="font-medium text-gray-900">{bookingData.specialist?.name || 'Especialista'}</p>
              {bookingData.specialist?.specialties && (
                <p className="text-sm text-gray-600">
                  Especialista en: {bookingData.specialist.specialties.join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Fecha y hora */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Fecha y hora</span>
            </div>
            <div className="ml-7">
              <p className="font-medium text-gray-900">{date}</p>
              <p className="text-sm text-gray-600">{time}</p>
              {bookingData.dateTime?.branchName && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">Sucursal:</p>
                  <p className="text-sm font-medium text-gray-900">{bookingData.dateTime.branchName}</p>
                  {bookingData.dateTime?.branchAddress && (
                    <p className="text-xs text-gray-600">{bookingData.dateTime.branchAddress}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Método de pago */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Pago</span>
            </div>
            <div className="ml-7">
              <p className="font-medium text-gray-900">
                {bookingData.paymentMethodData?.name || 'Método de pago seleccionado'}
              </p>
              <p className="text-sm text-gray-600">
                Total: ${bookingData.service?.price?.toLocaleString('es-CO') || '0'}
              </p>
              {bookingData.paymentProofUrl && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Comprobante de pago:</p>
                  <a 
                    href={bookingData.paymentProofUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <img 
                      src={bookingData.paymentProofUrl} 
                      alt="Comprobante de pago" 
                      className="w-32 h-32 object-cover rounded border border-gray-300 hover:opacity-80 transition-opacity"
                    />
                  </a>
                  <p className="text-xs text-green-600 mt-1">✓ Comprobante cargado</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información del cliente */}
        <div className="border-t pt-4 mt-6">
          <h4 className="font-medium text-gray-900 mb-3">Tus datos</h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Nombre:</span>
              <p className="font-medium">{bookingData.clientData?.name || 'Cliente'}</p>
            </div>
            <div>
              <span className="text-gray-500">Email:</span>
              <p className="font-medium">{bookingData.clientData?.email || ''}</p>
            </div>
            <div>
              <span className="text-gray-500">Teléfono:</span>
              <p className="font-medium">{bookingData.clientData?.phone || ''}</p>
            </div>
          </div>
          {bookingData.clientData?.notes && (
            <div className="mt-3">
              <span className="text-gray-500 text-sm">Notas:</span>
              <p className="text-sm mt-1">{bookingData.clientData.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Información adicional según método de pago */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-900 mb-2">
          ¿Qué sucede después?
        </h4>

        {bookingData.paymentMethodData?.type === 'ONLINE' && (
          <div className="text-sm text-blue-800">
            <p className="mb-2">
              • Serás redirigido a la pasarela de pagos segura
            </p>
            <p className="mb-2">
              • Una vez completado el pago, tu reserva se confirmará automáticamente
            </p>
            <p>
              • Recibirás un email de confirmación con los detalles
            </p>
          </div>
        )}

        {bookingData.paymentMethodData?.type === 'TRANSFER' && (
          <div className="text-sm text-blue-800">
            <p className="mb-2">
              • Realiza la transferencia usando los datos bancarios proporcionados
            </p>
            <p className="mb-2">
              • Tu reserva quedará en estado "Pendiente de verificación"
            </p>
            <p>
              • Una vez recibido el pago, te confirmaremos por email
            </p>
          </div>
        )}

        {bookingData.paymentMethodData?.type === 'CASH' && (
          <div className="text-sm text-blue-800">
            <p className="mb-2">
              • Tu reserva quedará confirmada
            </p>
            <p className="mb-2">
              • Realiza el pago directamente en el establecimiento al momento de tu cita
            </p>
            <p>
              • Recibirás recordatorios por email
            </p>
          </div>
        )}

        {bookingData.paymentMethodData?.type === 'QR' && (
          <div className="text-sm text-blue-800">
            <p className="mb-2">
              • Realiza el pago usando el código QR proporcionado
            </p>
            <p className="mb-2">
              • Tu comprobante ya fue cargado en el sistema
            </p>
            <p>
              • Tu reserva se confirmará una vez verifiquemos tu pago
            </p>
          </div>
        )}

        {bookingData.paymentMethodData?.type === 'CARD' && (
          <div className="text-sm text-blue-800">
            <p className="mb-2">
              • Procesaremos tu pago con tarjeta de forma segura
            </p>
            <p className="mb-2">
              • Tu reserva se confirmará automáticamente
            </p>
            <p>
              • Recibirás un email de confirmación
            </p>
          </div>
        )}

        {!bookingData.paymentMethodData?.type && (
          <div className="text-sm text-blue-800">
            <p>Tu reserva será procesada y recibirás confirmación por email.</p>
          </div>
        )}
      </div>

      {/* Botón de WhatsApp para consultas */}
      {bookingData.paymentMethodData?.businessInfo?.whatsappNumber && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-sm text-green-800 mb-3">
            💬 ¿Tienes alguna duda sobre tu reserva o necesitas ayuda?
          </p>
          <a
            href={`https://wa.me/${bookingData.paymentMethodData.businessInfo.whatsappNumber.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Escríbenos por WhatsApp
          </a>
        </div>
      )}

      {/* Mensaje de error */}
      {bookingError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{bookingError}</p>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={isCreatingBooking}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          ← Volver
        </button>
        <button
          onClick={handleConfirmBooking}
          disabled={isCreatingBooking}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {isCreatingBooking ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Procesando...
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-5 h-5" />
              Confirmar reserva
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmation;