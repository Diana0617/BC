import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircleIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
  uploadProof,
  clearUploadSuccess,
  clearErrors
} from '@shared/store/slices/publicBookingSlice';

const BookingSuccess = () => {
  const { businessCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Obtener datos de la reserva del state de navegación
  const bookingData = location.state?.bookingData;
  const bookingCode = location.state?.bookingCode;

  // Obtener estado de Redux
  const {
    isUploadingProof,
    uploadSuccess,
    uploadError
  } = useSelector(state => state.publicBooking);

  const [selectedFile, setSelectedFile] = useState(null);
  const [notes, setNotes] = useState('');

  // Limpiar errores al montar el componente
  useEffect(() => {
    dispatch(clearErrors());
    dispatch(clearUploadSuccess());
  }, [dispatch]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, WebP) y PDF.');
        return;
      }

      // Validar tamaño (10MB máximo)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 10MB.');
        return;
      }

      setSelectedFile(file);
      // Limpiar errores y estado de éxito anterior
      dispatch(clearErrors());
      dispatch(clearUploadSuccess());
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !bookingCode) return;

    try {
      const formData = new FormData();
      formData.append('paymentProof', selectedFile);
      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }

      await dispatch(uploadProof({
        businessCode,
        bookingCode,
        formData
      })).unwrap();

      // Limpiar el formulario después del éxito
      setSelectedFile(null);
      setNotes('');

    } catch (error) {
      console.error('Error uploading payment proof:', error);
      // El error ya está manejado por Redux
    }
  };

  const needsPaymentProof = bookingData?.paymentMethod === 'BANK_TRANSFER';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header de éxito */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Reserva confirmada!
          </h1>
          <p className="text-gray-600">
            Tu cita ha sido agendada exitosamente
          </p>
          {bookingCode && (
            <p className="text-sm text-gray-500 mt-2">
              Código de reserva: <span className="font-mono font-medium">{bookingCode}</span>
            </p>
          )}
        </div>

        {/* Resumen de la reserva */}
        {bookingData && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Detalles de tu reserva
            </h2>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Servicio:</span>
                <p className="font-medium">{bookingData.service?.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Especialista:</span>
                <p className="font-medium">{bookingData.specialist?.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Fecha y hora:</span>
                <p className="font-medium">
                  {bookingData.dateTime && new Date(`${bookingData.dateTime.date}T${bookingData.dateTime.time}`).toLocaleString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Método de pago:</span>
                <p className="font-medium">
                  {bookingData.paymentMethod === 'WOMPI' && 'Pago en línea (Wompi)'}
                  {bookingData.paymentMethod === 'BANK_TRANSFER' && 'Transferencia bancaria'}
                  {bookingData.paymentMethod === 'CASH' && 'Pago en efectivo'}
                </p>
              </div>
            </div>

            {bookingData.dateTime?.branchName && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-medium text-gray-900 mb-2">Ubicación</h3>
                <div className="text-sm">
                  <span className="text-gray-500">Sucursal:</span>
                  <p className="font-medium">{bookingData.dateTime.branchName}</p>
                  {bookingData.dateTime.branchAddress && (
                    <p className="text-gray-600 text-xs mt-1">{bookingData.dateTime.branchAddress}</p>
                  )}
                </div>
              </div>
            )}

            {bookingData.client && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-medium text-gray-900 mb-2">Tus datos</h3>
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
              </div>
            )}
          </div>
        )}

        {/* Sección de comprobante de pago */}
        {needsPaymentProof && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Subir comprobante de pago
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                Para confirmar tu reserva, por favor sube el comprobante de la transferencia bancaria.
                Una vez revisado, te confirmaremos por email.
              </p>
            </div>

            {uploadSuccess ? (
              <div className="text-center py-4">
                <CheckCircleIcon className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <p className="text-green-600 font-medium">¡Comprobante subido exitosamente!</p>
                <p className="text-sm text-gray-600 mt-1">
                  Revisaremos tu pago y te confirmaremos pronto.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selector de archivo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar archivo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*,.pdf"
                      className="hidden"
                      id="payment-proof"
                    />
                    <label
                      htmlFor="payment-proof"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        {selectedFile ? selectedFile.name : 'Haz clic para seleccionar un archivo'}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        JPG, PNG, WebP o PDF (máx. 10MB)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Información adicional sobre el pago..."
                  />
                </div>

                {/* Mensaje de error */}
                {uploadError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{uploadError}</p>
                  </div>
                )}

                {/* Botón de subida */}
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploadingProof}
                  className={`w-full py-2 px-4 rounded-lg font-medium ${
                    selectedFile && !isUploadingProof
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isUploadingProof ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Subiendo...
                    </div>
                  ) : (
                    'Subir comprobante'
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Instrucciones finales */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            ¿Qué sucede ahora?
          </h2>

          <div className="space-y-3 text-sm text-gray-600">
            {bookingData?.paymentMethod === 'WOMPI' && (
              <>
                <p>• Recibirás un email de confirmación con los detalles de tu cita.</p>
                <p>• Si hay algún problema con el pago, te contactaremos.</p>
              </>
            )}

            {bookingData?.paymentMethod === 'BANK_TRANSFER' && (
              <>
                <p>• Una vez subas el comprobante, revisaremos tu pago (máximo 24 horas).</p>
                <p>• Te enviaremos un email de confirmación cuando se verifique el pago.</p>
                <p>• Si hay algún problema, te contactaremos por teléfono o email.</p>
              </>
            )}

            {bookingData?.paymentMethod === 'CASH' && (
              <>
                <p>• Tu reserva está confirmada. Realiza el pago al momento de tu cita.</p>
                <p>• Recibirás recordatorios por email y WhatsApp.</p>
              </>
            )}

            <p>• Si necesitas modificar o cancelar tu cita, contacta directamente al negocio.</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Volver al inicio
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Imprimir confirmación
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;