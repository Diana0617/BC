import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, ClockIcon, UserIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { createBooking } from '@shared/store/slices/publicBookingSlice';

const BookingConfirmation = ({ businessCode, onBack }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Obtener estado de Redux
  const { bookingData, isLoadingCreateBooking, createBookingError, createdBooking } = useSelector(state => state.publicBooking);

  // Redirigir cuando se crea la reserva exitosamente
  useEffect(() => {
    if (createdBooking) {
      navigate('/booking/success', {
        state: {
          bookingData: bookingData,
          bookingCode: createdBooking.code
        }
      });
    }
  }, [createdBooking, bookingData, navigate]);

  const handleConfirmBooking = () => {
    // Preparar datos para la API
    const bookingPayload = {
      serviceId: bookingData.service.id,
      specialistId: bookingData.specialist.id,
      date: bookingData.dateTime.date,
      time: bookingData.dateTime.time,
      clientName: bookingData.clientData.name,
      clientEmail: bookingData.clientData.email,
      clientPhone: bookingData.clientData.phone,
      notes: bookingData.clientData.notes,
      paymentMethod: bookingData.paymentMethod
    };

    dispatch(createBooking({ businessCode, bookingData: bookingPayload }));
  };

  const formatDateTime = (date, time) => {
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
  };

  const { date, time } = formatDateTime(bookingData.dateTime.date, bookingData.dateTime.time);

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
              <span className="font-medium text-gray-900">Servicio</span>
            </div>
            <div className="ml-7">
              <p className="font-medium text-gray-900">{bookingData.service.name}</p>
              <p className="text-sm text-gray-600">{bookingData.service.description}</p>
              <p className="text-sm text-gray-500">Duración: {bookingData.service.duration} minutos</p>
            </div>
          </div>

          {/* Información del especialista */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Especialista</span>
            </div>
            <div className="ml-7">
              <p className="font-medium text-gray-900">{bookingData.specialist.name}</p>
              {bookingData.specialist.specialties && (
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
                {bookingData.paymentMethod === 'WOMPI' && 'Pago en línea (Wompi)'}
                {bookingData.paymentMethod === 'BANK_TRANSFER' && 'Transferencia bancaria'}
                {bookingData.paymentMethod === 'CASH' && 'Pago en efectivo'}
              </p>
              <p className="text-sm text-gray-600">
                Total: ${bookingData.service.price.toLocaleString('es-CO')}
              </p>
            </div>
          </div>
        </div>

        {/* Información del cliente */}
        <div className="border-t pt-4 mt-6">
          <h4 className="font-medium text-gray-900 mb-3">Tus datos</h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Nombre:</span>
              <p className="font-medium">{bookingData.client.name}</p>
            </div>
            <div>
              <span className="text-gray-500">Email:</span>
              <p className="font-medium">{bookingData.client.email}</p>
            </div>
            <div>
              <span className="text-gray-500">Teléfono:</span>
              <p className="font-medium">{bookingData.client.phone}</p>
            </div>
          </div>
          {bookingData.client.notes && (
            <div className="mt-3">
              <span className="text-gray-500 text-sm">Notas:</span>
              <p className="text-sm mt-1">{bookingData.client.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Información adicional según método de pago */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-900 mb-2">
          ¿Qué sucede después?
        </h4>

        {bookingData.paymentMethod === 'WOMPI' && (
          <div className="text-sm text-blue-800">
            <p className="mb-2">
              • Serás redirigido a la pasarela de pagos segura de Wompi
            </p>
            <p className="mb-2">
              • Una vez completado el pago, tu reserva se confirmará automáticamente
            </p>
            <p>
              • Recibirás un email de confirmación con los detalles
            </p>
          </div>
        )}

        {bookingData.paymentMethod === 'BANK_TRANSFER' && (
          <div className="text-sm text-blue-800">
            <p className="mb-2">
              • Recibirás un email con los datos bancarios para realizar la transferencia
            </p>
            <p className="mb-2">
              • Tu reserva quedará en estado "Pendiente de pago"
            </p>
            <p>
              • Una vez recibido el pago, te confirmaremos por email y WhatsApp
            </p>
          </div>
        )}

        {bookingData.paymentMethod === 'CASH' && (
          <div className="text-sm text-blue-800">
            <p className="mb-2">
              • Tu reserva quedará confirmada
            </p>
            <p className="mb-2">
              • Realiza el pago directamente en el establecimiento al momento de tu cita
            </p>
            <p>
              • Recibirás recordatorios por email y WhatsApp
            </p>
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {createBookingError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{createBookingError}</p>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={isLoadingCreateBooking}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          ← Volver
        </button>
        <button
          onClick={handleConfirmBooking}
          disabled={isLoadingCreateBooking}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {isLoadingCreateBooking ? (
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