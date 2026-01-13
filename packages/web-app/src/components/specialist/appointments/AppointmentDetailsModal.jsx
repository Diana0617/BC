import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  PlayCircleIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AppointmentWorkflowModal from './AppointmentWorkflowModal';

/**
 * Modal de detalles de cita para especialistas
 * Incluye todas las transiciones de estado y validaciones
 */
export default function AppointmentDetailsModal({ isOpen, appointment, businessId, onClose, onUpdate }) {
  const { token } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [appointmentDetails, setAppointmentDetails] = useState(appointment);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [workflowAction, setWorkflowAction] = useState(null);

  useEffect(() => {
    if (isOpen && appointment?.id) {
      loadAppointmentDetails();
    }
  }, [isOpen, appointment?.id]);

  const loadAppointmentDetails = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/appointments/${appointment.id}?businessId=${businessId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Error cargando detalles');
      
      const data = await response.json();
      setAppointmentDetails(data.data || data.appointment);
    } catch (error) {
      console.error('Error loading appointment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'text-yellow-600 bg-yellow-100',
      CONFIRMED: 'text-blue-600 bg-blue-100',
      IN_PROGRESS: 'text-purple-600 bg-purple-100',
      COMPLETED: 'text-green-600 bg-green-100',
      CANCELED: 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusText = (status) => {
    const texts = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmado',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completado',
      CANCELED: 'Cancelado'
    };
    return texts[status] || status;
  };

  const handleConfirm = async () => {
    if (!window.confirm('¿Deseas confirmar este turno?')) return;

    try {
      setActionLoading('confirm');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/appointments/${appointmentDetails.id}/cancel`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'CONFIRMED' })
        }
      );

      if (!response.ok) throw new Error('Error confirmando turno');

      const data = await response.json();
      setAppointmentDetails(prev => ({ ...prev, status: 'CONFIRMED' }));
      toast.success('Turno confirmado correctamente');
      onUpdate();
    } catch (error) {
      toast.error(error.message || 'No se pudo confirmar el turno');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async () => {
    // Abrir el modal de flujo de trabajo
    setWorkflowAction('start');
    setShowWorkflowModal(true);
  };

  const handleComplete = async () => {
    // Abrir el modal de flujo de trabajo para fotos después
    setWorkflowAction('complete');
    setShowWorkflowModal(true);
  };

  const handleWorkflowSuccess = () => {
    setShowWorkflowModal(false);
    setWorkflowAction(null);
    loadAppointmentDetails();
    onUpdate();
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Por favor ingresa un motivo de cancelación');
      return;
    }

    try {
      setActionLoading('cancel');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/appointments/${appointmentDetails.id}/cancel`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            status: 'CANCELED',
            cancelReason: cancelReason 
          })
        }
      );

      if (!response.ok) throw new Error('Error cancelando turno');

      const data = await response.json();
      setAppointmentDetails(prev => ({ ...prev, status: 'CANCELED' }));
      setShowCancelForm(false);
      setCancelReason('');
      toast.success('Turno cancelado correctamente');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error(error.message || 'No se pudo cancelar el turno');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;
  
  // Validar que appointmentDetails existe antes de renderizar
  if (!appointmentDetails) {
    return null;
  }

  const startDate = new Date(appointmentDetails.startTime);
  const endDate = new Date(appointmentDetails.endTime);
  
  // Soportar ambos formatos: Client/client y Service/service
  const client = appointmentDetails.Client || appointmentDetails.client;
  const service = appointmentDetails.Service || appointmentDetails.service;
  
  const clientName = client 
    ? `${client.firstName} ${client.lastName}`
    : appointmentDetails.clientName || 'Cliente no especificado';
  const serviceName = service?.name || appointmentDetails.serviceName || 'Servicio no especificado';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                Detalles del Turno
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            {/* Status Badge */}
            <div className="mt-3 flex items-center gap-2">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(appointmentDetails.status)}`}>
                {getStatusText(appointmentDetails.status)}
              </span>
              {appointmentDetails.appointmentNumber && (
                <span className="text-white text-sm opacity-80">
                  #{appointmentDetails.appointmentNumber}
                </span>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-4 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Fecha y Hora */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ClockIcon className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">Fecha y Hora</span>
                  </div>
                  <p className="text-gray-700">
                    {format(startDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                  <p className="text-gray-600">
                    {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
                  </p>
                </div>

                {/* Cliente */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">Cliente</span>
                  </div>
                  <p className="text-gray-900 font-medium">{clientName}</p>
                  {client?.phone && (
                    <div className="flex items-center gap-2 mt-2 text-gray-600">
                      <PhoneIcon className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client?.email && (
                    <div className="flex items-center gap-2 mt-1 text-gray-600">
                      <EnvelopeIcon className="w-4 h-4" />
                      <span>{client.email}</span>
                    </div>
                  )}
                </div>

                {/* Servicio */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TagIcon className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">Servicio</span>
                  </div>
                  <p className="text-gray-900">{serviceName}</p>
                  {service?.duration && (
                    <p className="text-gray-600 text-sm mt-1">
                      Duración: {service.duration} min
                    </p>
                  )}
                </div>

                {/* Monto */}
                {appointmentDetails.totalAmount && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CurrencyDollarIcon className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold text-gray-900">Monto</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      ${appointmentDetails.totalAmount.toLocaleString('es-CO')}
                    </p>
                    {appointmentDetails.specialistCommission && (
                      <p className="text-green-600 text-sm mt-1">
                        Tu comisión: ${appointmentDetails.specialistCommission.toLocaleString('es-CO')}
                      </p>
                    )}
                  </div>
                )}

                {/* Sucursal */}
                {appointmentDetails.Branch && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPinIcon className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold text-gray-900">Sucursal</span>
                    </div>
                    <p className="text-gray-900">{appointmentDetails.Branch.name}</p>
                    {appointmentDetails.Branch.address && (
                      <p className="text-gray-600 text-sm">{appointmentDetails.Branch.address}</p>
                    )}
                  </div>
                )}

                {/* Notas */}
                {appointmentDetails.notes && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p className="text-sm font-semibold text-yellow-800 mb-1">Notas:</p>
                    <p className="text-yellow-700">{appointmentDetails.notes}</p>
                  </div>
                )}

                {/* Formulario de Cancelación */}
                {showCancelForm && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-red-800 mb-2">
                      Motivo de cancelación
                    </label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Escribe el motivo..."
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows="3"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer - Acciones */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-end gap-3">
              {/* Botón Cancelar (siempre visible excepto si ya está cancelado o completado) */}
              {!['CANCELED', 'COMPLETED'].includes(appointmentDetails.status) && (
                <>
                  {showCancelForm ? (
                    <>
                      <button
                        onClick={() => {
                          setShowCancelForm(false);
                          setCancelReason('');
                        }}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Volver
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={actionLoading === 'cancel'}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {actionLoading === 'cancel' ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Cancelando...
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="w-5 h-5" />
                            Confirmar Cancelación
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setShowCancelForm(true)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <XCircleIcon className="w-5 h-5" />
                      Cancelar Turno
                    </button>
                  )}
                </>
              )}

              {/* Acciones según estado */}
              {!showCancelForm && (
                <>
                  {appointmentDetails.status === 'PENDING' && (
                    <button
                      onClick={handleConfirm}
                      disabled={actionLoading === 'confirm'}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {actionLoading === 'confirm' ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Confirmando...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-5 h-5" />
                          Confirmar
                        </>
                      )}
                    </button>
                  )}

                  {appointmentDetails.status === 'CONFIRMED' && (
                    <button
                      onClick={handleStart}
                      disabled={actionLoading === 'start'}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {actionLoading === 'start' ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Iniciando...
                        </>
                      ) : (
                        <>
                          <PlayCircleIcon className="w-5 h-5" />
                          Iniciar
                        </>
                      )}
                    </button>
                  )}

                  {appointmentDetails.status === 'IN_PROGRESS' && (
                    <button
                      onClick={handleComplete}
                      disabled={actionLoading === 'complete'}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {actionLoading === 'complete' ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Completando...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-5 h-5" />
                          Completar
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Flujo de Trabajo */}
      {showWorkflowModal && (
        <AppointmentWorkflowModal
          isOpen={showWorkflowModal}
          appointment={appointmentDetails}
          action={workflowAction}
          onClose={() => {
            setShowWorkflowModal(false);
            setWorkflowAction(null);
          }}
          onSuccess={handleWorkflowSuccess}
        />
      )}
    </div>
  );
}
