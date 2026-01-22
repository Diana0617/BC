import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { fetchPublicServices, updateBookingData } from '@shared/store/slices/publicBookingSlice';

console.log('🚀🚀🚀 ServiceSelection.jsx CARGADO - Versión:', new Date().toISOString());

const ServiceSelection = ({ businessCode, onNext }) => {
  const dispatch = useDispatch();

  // Obtener estado de Redux
  const {
    services,
    bookingData,
    isLoadingServices,
    servicesError
  } = useSelector(state => state.publicBooking);

  // Cargar servicios al montar
  useEffect(() => {
    if (businessCode && services.length === 0) {
      dispatch(fetchPublicServices(businessCode));
    }
  }, [businessCode, services.length, dispatch]);

  const handleServiceSelect = (service) => {
    console.log('✅ ServiceSelection - Servicio seleccionado:', service);
    
    // Obtener servicios actuales (array) o inicializar como array vacío
    const currentServices = Array.isArray(bookingData.services) ? [...bookingData.services] : [];
    
    // Verificar si el servicio ya está seleccionado
    const serviceIndex = currentServices.findIndex(s => s.id === service.id);
    
    if (serviceIndex > -1) {
      // Si ya está, quitarlo
      currentServices.splice(serviceIndex, 1);
    } else {
      // Si no está, agregarlo
      currentServices.push(service);
    }
    
    console.log('✅ ServiceSelection - Servicios actualizados:', currentServices);
    
    // Calcular duración total y precio total
    const totalDuration = currentServices.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalPrice = currentServices.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
    
    dispatch(updateBookingData({ 
      services: currentServices,
      totalDuration,
      totalPrice,
      // Mantener service por compatibilidad (usar el primero seleccionado)
      service: currentServices[0] || null
    }));
  };

  const isServiceSelected = (serviceId) => {
    const currentServices = Array.isArray(bookingData.services) ? bookingData.services : [];
    return currentServices.some(s => s.id === serviceId);
  };

  if (isLoadingServices) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando servicios...</p>
      </div>
    );
  }

  if (servicesError) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{servicesError}</p>
          <button
            onClick={() => dispatch(fetchPublicServices(businessCode))}
            className="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-600">No hay servicios disponibles en este momento.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Selecciona uno o más servicios
        </h2>
        <p className="text-gray-600">
          Puedes seleccionar múltiples servicios para tu cita
        </p>
        {bookingData.services && bookingData.services.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              {bookingData.services.length} servicio{bookingData.services.length > 1 ? 's' : ''} seleccionado{bookingData.services.length > 1 ? 's' : ''} • 
              Duración total: {bookingData.totalDuration || 0} min • 
              Total: ${(bookingData.totalPrice || 0).toLocaleString('es-CO')}
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service) => {
          const selected = isServiceSelected(service.id);
          return (
          <div
            key={service.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleServiceSelect(service)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{service?.name || 'Servicio'}</h3>
                {service.description && (
                  <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-sm text-gray-500">
                    ⏱️ {service?.duration || 0} min
                  </span>
                  <span className="font-semibold text-green-600">
                    ${service?.price?.toLocaleString('es-CO') || '0'}
                  </span>
                </div>
                {service.category && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                    {service.category}
                  </span>
                )}
              </div>
              {selected && (
                <CheckCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0" />
              )}
            </div>
          </div>
        );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={!bookingData.services || bookingData.services.length === 0}
          className={`px-6 py-2 rounded-lg font-medium ${
            bookingData.services && bookingData.services.length > 0
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

export default ServiceSelection;