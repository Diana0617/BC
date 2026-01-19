import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { 
  XMarkIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  PhotoIcon,
  PlayCircleIcon
} from '@heroicons/react/24/outline';
import ConsentFormView from '../consent/ConsentFormView';
import EvidenceUploader from '../evidence/EvidenceUploader';

/**
 * Modal de flujo completo para iniciar y completar citas
 * Incluye: Consentimiento → Fotos Antes → Inicio → Fotos Después → Completar
 */
export default function AppointmentWorkflowModal({ 
  isOpen, 
  appointment, 
  action, // 'start' | 'complete' | 'before-photo' | 'after-photo'
  onClose, 
  onSuccess 
}) {
  const { token } = useSelector(state => state.auth);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [consentRequired, setConsentRequired] = useState(false);
  const [consentCompleted, setConsentCompleted] = useState(false);
  const [beforeEvidenceUploaded, setBeforeEvidenceUploaded] = useState(false);
  const [afterEvidenceUploaded, setAfterEvidenceUploaded] = useState(false);

  useEffect(() => {
    if (isOpen && appointment) {
      initializeWorkflow();
    }
  }, [isOpen, appointment, action]);

  const initializeWorkflow = async () => {
    // Si es solo para subir fotos, no inicializar el flujo completo
    if (action === 'before-photo' || action === 'after-photo') {
      // Ir directo al paso de foto correspondiente
      if (action === 'before-photo') {
        setCurrentStep(2); // Fotos antes
      } else {
        setCurrentStep(4); // Fotos después
      }
      return;
    }

    // Verificar si el servicio requiere consentimiento
    // Soportar ambos formatos: Service/service
    const service = appointment.Service || appointment.service;
    const requiresConsent = service?.requiresConsent || false;
    const templateId = service?.consentTemplateId || null;
    const alreadyHasConsent = appointment.hasConsent || false;
    
    console.log('🔍 Inicializando workflow:', {
      action,
      requiresConsent,
      templateId,
      serviceName: service?.name,
      hasConsent: alreadyHasConsent,
      hasToken: !!token
    });
    
    setConsentRequired(requiresConsent);
    
    // Si ya tiene consentimiento firmado, marcarlo como completado
    if (alreadyHasConsent) {
      setConsentCompleted(true);
    }

    // Si es para "completar", ir directo a fotos después
    if (action === 'complete') {
      setCurrentStep(4);
    } else if (action === 'start') {
      // Al iniciar: si requiere consentimiento y NO lo tiene, empezar por consentimiento
      if (requiresConsent && !alreadyHasConsent) {
        setCurrentStep(1); // Consentimiento
      } else {
        setCurrentStep(2); // Fotos antes (ya tiene consentimiento o no lo requiere)
      }
    } else if (!requiresConsent || alreadyHasConsent) {
      // Si no requiere consentimiento o ya lo tiene, ir a fotos antes
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  };

  const handleConsentComplete = () => {
    setConsentCompleted(true);
    setCurrentStep(2);
  };

  const handleSkipBeforePhotos = () => {
    setCurrentStep(3);
  };

  const handleBeforePhotosComplete = () => {
    setBeforeEvidenceUploaded(true);
    // Si es solo para subir fotos, cerrar el modal
    if (action === 'before-photo') {
      toast.success('Foto "antes" guardada correctamente');
      onSuccess?.();
      onClose();
      return;
    }
    setCurrentStep(3);
  };

  const handleStartAppointment = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/appointments/${appointment.id}/start`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Error iniciando turno');

      toast.success('Turno iniciado correctamente');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error starting appointment:', error);
      toast.error('Error al iniciar el turno');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipAfterPhotos = () => {
    handleCompleteAppointment();
  };

  const handleAfterPhotosComplete = () => {
    setAfterEvidenceUploaded(true);
    // Si es solo para subir fotos, cerrar el modal
    if (action === 'after-photo') {
      toast.success('Foto "después" guardada correctamente');
      onSuccess?.();
      onClose();
      return;
    }
    handleCompleteAppointment();
  };

  const handleCompleteAppointment = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/appointments/${appointment.id}/complete`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Error completando turno');

      toast.success('Turno completado correctamente');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error completing appointment:', error);
      toast.error('Error al completar el turno');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Consentimiento
        return (
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Paso 1: Consentimiento Informado</h3>
                  <p className="text-sm text-gray-600">Este servicio requiere consentimiento del cliente</p>
                </div>
              </div>
            </div>

            <ConsentFormView
              appointment={appointment}
              templateId={(appointment.Service || appointment.service)?.consentTemplateId}
              onSuccess={handleConsentComplete}
              onCancel={onClose}
              token={token}
            />
          </div>
        );

      case 2: { // Fotos Antes
        const isOnlyUploadBefore = action === 'before-photo';
        return (
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <PhotoIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {isOnlyUploadBefore ? 'Subir Foto Antes' : 'Paso 2: Evidencia Fotográfica (Antes)'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isOnlyUploadBefore ? 'Documenta el estado inicial del cliente' : 'Documenta el estado inicial del cliente (opcional)'}
                  </p>
                </div>
              </div>
            </div>

            <EvidenceUploader
              appointmentId={appointment.id}
              type="before"
              onUploadComplete={() => setBeforeEvidenceUploaded(true)}
            />

            <div className="mt-6 flex gap-3">
              {!isOnlyUploadBefore && (
                <button
                  onClick={handleSkipBeforePhotos}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Omitir Fotos
                </button>
              )}
              <button
                onClick={isOnlyUploadBefore ? onClose : handleBeforePhotosComplete}
                disabled={isOnlyUploadBefore ? !beforeEvidenceUploaded : false}
                className={`${isOnlyUploadBefore ? 'w-full' : 'flex-1'} px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
              >
                {isOnlyUploadBefore ? (
                  beforeEvidenceUploaded ? 'Cerrar' : 'Subir Foto para Continuar'
                ) : (
                  <>
                    Continuar
                    <ArrowRightIcon className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        );
      }

      case 3: // Confirmar Inicio
        return (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <PlayCircleIcon className="w-12 h-12 text-green-600" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              ¿Iniciar Procedimiento?
            </h3>
            
            <p className="text-gray-600 mb-8">
              {consentRequired && consentCompleted && (
                <span className="inline-flex items-center gap-2 text-green-600 mb-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  Consentimiento firmado
                </span>
              )}
              {beforeEvidenceUploaded && (
                <span className="inline-flex items-center gap-2 text-green-600 ml-4">
                  <CheckCircleIcon className="w-5 h-5" />
                  Fotos "antes" subidas
                </span>
              )}
            </p>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Cliente:</strong> {appointment.client?.firstName} {appointment.client?.lastName}
                <br />
                <strong>Servicio:</strong> {appointment.service?.name}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleStartAppointment}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Iniciando...
                  </>
                ) : (
                  <>
                    <PlayCircleIcon className="w-5 h-5" />
                    Iniciar Ahora
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case 4: { // Fotos Después
        const isOnlyUploadAfter = action === 'after-photo';
        return (
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <PhotoIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {isOnlyUploadAfter ? 'Subir Foto Después' : 'Evidencia Fotográfica (Después)'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isOnlyUploadAfter ? 'Documenta el resultado final' : 'Documenta el resultado final (opcional)'}
                  </p>
                </div>
              </div>
            </div>

            <EvidenceUploader
              appointmentId={appointment.id}
              type="after"
              onUploadComplete={() => setAfterEvidenceUploaded(true)}
            />

            <div className="mt-6 flex gap-3">
              {!isOnlyUploadAfter && (
                <button
                  onClick={handleSkipAfterPhotos}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Omitir y Completar
                </button>
              )}
              <button
                onClick={isOnlyUploadAfter ? onClose : handleAfterPhotosComplete}
                disabled={isOnlyUploadAfter ? !afterEvidenceUploaded : (loading || !afterEvidenceUploaded)}
                className={`${isOnlyUploadAfter ? 'w-full' : 'flex-1'} px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Completando...
                  </>
                ) : isOnlyUploadAfter ? (
                  afterEvidenceUploaded ? 'Cerrar' : 'Subir Foto para Continuar'
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    Finalizar Turno
                  </>
                )}
              </button>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const getProgressPercentage = () => {
    const totalSteps = consentRequired ? 4 : 3;
    return (currentStep / totalSteps) * 100;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={currentStep === 1 || currentStep === 4 ? null : onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-3xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {action === 'complete' ? 'Completar Turno' : action === 'before-photo' ? 'Subir Foto Antes' : action === 'after-photo' ? 'Subir Foto Después' : 'Iniciar Turno'}
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  {appointment.service?.name || appointment.Service?.name}
                </p>
              </div>
              {currentStep !== 1 && currentStep !== 3 && (
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Barra de Progreso */}
            {action !== 'before-photo' && action !== 'after-photo' && (
              <div className="mt-4">
                <div className="bg-blue-400 bg-opacity-30 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-white h-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
