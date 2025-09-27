import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CalendarDaysIcon, ClockIcon, UserIcon, PhoneIcon, EnvelopeIcon, CurrencyDollarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import ServiceSelection from './components/ServiceSelection';
import SpecialistSelection from './components/SpecialistSelection';
import DateTimeSelection from './components/DateTimeSelection';
import ClientForm from './components/ClientForm';
import PaymentSelection from './components/PaymentSelection';
import BookingConfirmation from './components/BookingConfirmation';
import {
  fetchPublicServices,
  nextStep,
  prevStep,
  clearErrors
} from '@shared/store/slices/publicBookingSlice';

const OnlineBookingPage = () => {
  const { businessCode } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Obtener estado de Redux
  const {
    currentStep,
    businessInfo,
    isLoadingServices,
    servicesError,
    businessInfoError
  } = useSelector(state => state.publicBooking);

  // Cargar servicios al montar
  useEffect(() => {
    if (businessCode) {
      dispatch(fetchPublicServices(businessCode));
      // Aquí podríamos cargar info del negocio también
      // dispatch(fetchBusinessInfo(businessCode));
    }
    return () => {
      // Limpiar estado al desmontar
      dispatch(clearErrors());
    };
  }, [businessCode, dispatch]);

  // Handlers para navegación entre pasos (ahora se usan directamente las actions)

  const nextStep = () => {
    dispatch(nextStep());
  };

  const prevStep = () => {
    dispatch(prevStep());
  };

  const steps = [
    { id: 1, name: 'Servicio', icon: CalendarDaysIcon },
    { id: 2, name: 'Especialista', icon: UserIcon },
    { id: 3, name: 'Fecha y Hora', icon: ClockIcon },
    { id: 4, name: 'Tus Datos', icon: PhoneIcon },
    { id: 5, name: 'Pago', icon: CurrencyDollarIcon },
    { id: 6, name: 'Confirmación', icon: CheckCircleIcon }
  ];

  // Mostrar loading si estamos cargando servicios inicialmente
  if (isLoadingServices && !businessInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Mostrar error si hay problemas cargando servicios
  if (servicesError || businessInfoError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-semibold mb-2">Error</h2>
            <p className="text-red-600">{servicesError || businessInfoError}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Reservar Cita Online
              </h1>
              {businessInfo && (
                <p className="text-gray-600 mt-1">{businessInfo.name}</p>
              )}
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Volver
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.id <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className={`mt-2 text-sm font-medium ${
                      step.id <= currentStep ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      step.id < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {currentStep === 1 && (
            <ServiceSelection
              businessCode={businessCode}
              onNext={nextStep}
            />
          )}

          {currentStep === 2 && (
            <SpecialistSelection
              businessCode={businessCode}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 3 && (
            <DateTimeSelection
              businessCode={businessCode}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 4 && (
            <ClientForm
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 5 && (
            <PaymentSelection
              businessCode={businessCode}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 6 && (
            <BookingConfirmation
              businessCode={businessCode}
              onBack={prevStep}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OnlineBookingPage;