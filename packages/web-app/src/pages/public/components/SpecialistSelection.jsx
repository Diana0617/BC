import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircleIcon, UserIcon } from '@heroicons/react/24/solid';
import { fetchPublicSpecialists, updateBookingData } from '@shared/store/slices/publicBookingSlice';

const SpecialistSelection = ({ businessCode, onNext, onBack }) => {
  const dispatch = useDispatch();

  // Obtener estado de Redux
  const {
    specialists,
    bookingData,
    isLoadingSpecialists,
    specialistsError
  } = useSelector(state => state.publicBooking);

  // Cargar especialistas cuando cambie el servicio seleccionado
  useEffect(() => {
    if (businessCode && bookingData.service?.id && specialists.length === 0) {
      dispatch(fetchPublicSpecialists({
        businessCode,
        serviceId: bookingData.service.id
      }));
    }
  }, [businessCode, bookingData.service?.id, specialists.length, dispatch]);

  const handleSpecialistSelect = (specialist) => {
    console.log('✅ SpecialistSelection - Especialista seleccionado:', specialist);
    dispatch(updateBookingData({ specialist }));
  };

  if (!bookingData.service) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Primero selecciona un servicio</p>
        <button
          onClick={onBack}
          className="mt-4 text-blue-600 hover:text-blue-800 underline"
        >
          ← Volver
        </button>
      </div>
    );
  }

  if (isLoadingSpecialists) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando especialistas...</p>
      </div>
    );
  }

  if (specialistsError) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{specialistsError}</p>
          <button
            onClick={() => dispatch(fetchPublicSpecialists({
              businessCode,
              serviceId: bookingData.service.id
            }))}
            className="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Selecciona un especialista
        </h2>
        <p className="text-gray-600">
          Elige el especialista para tu {bookingData.service?.name?.toLowerCase() || 'servicio'}
        </p>
      </div>

      {specialists.length === 0 ? (
        <div className="text-center py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-600">
              No hay especialistas disponibles para este servicio en este momento.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {specialists.map((specialist) => (
            <div
              key={specialist.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                bookingData.specialist?.id === specialist.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleSpecialistSelect(specialist)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{specialist?.name || 'Especialista'}</h3>
                    {specialist.specialties && specialist.specialties.length > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        Especialista en: {specialist.specialties.join(', ')}
                      </p>
                    )}
                    {specialist.services && specialist.services.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Servicios que ofrece:</p>
                        <div className="flex flex-wrap gap-1">
                          {specialist.services.slice(0, 3).map((service, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                            >
                              {service?.name || 'Servicio'}
                            </span>
                          ))}
                          {specialist.services.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{specialist.services.length - 3} más
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {bookingData.specialist?.id === specialist.id && (
                  <CheckCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          ← Volver
        </button>
        <button
          onClick={onNext}
          disabled={!bookingData.specialist}
          className={`px-6 py-2 rounded-lg font-medium ${
            bookingData.specialist
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

export default SpecialistSelection;