/**
 * Modal de Detalle del Cliente
 * Componente con Tailwind CSS con tabs para mostrar información completa del cliente
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  XMarkIcon,
  UserIcon,
  CalendarDaysIcon,
  TicketIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import {
  fetchCustomerStats,
  fetchCancellationHistory,
  liftCustomerBlock
} from '@shared/store/slices/voucherSlice';
import {
  selectCustomerStats,
  selectCancellationHistory,
  selectOperationLoading
} from '@shared/store/selectors/voucherSelectors';
import toast from 'react-hot-toast';
import EditClientModal from './EditClientModal';
import CreateVoucherModal from './CreateVoucherModal';
import VouchersList from './VouchersList';
import BlockClientModal from './BlockClientModal';

const ClientDetailModal = ({ client, onClose, onCreateVoucher, onClientUpdated }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('info');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateVoucherModal, setShowCreateVoucherModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  
  const customerStats = useSelector(selectCustomerStats);
  const cancellationHistory = useSelector(selectCancellationHistory);
  const operationLoading = useSelector(selectOperationLoading);

  useEffect(() => {
    if (client?.id) {
      // Cargar estadísticas y historial
      dispatch(fetchCustomerStats({ customerId: client.id, days: 90 }));
      dispatch(fetchCancellationHistory(90));
    }
  }, [client, dispatch]);

  const handleClientUpdated = (updatedClient) => {
    toast.success('Cliente actualizado exitosamente');
    setShowEditModal(false);
    if (onClientUpdated) {
      onClientUpdated(updatedClient);
    }
  };

  const handleLiftBlock = async () => {
    if (!window.confirm('¿Estás seguro de levantar el bloqueo de este cliente?')) {
      return;
    }

    try {
      const result = await dispatch(liftCustomerBlock({
        blockId: client.blockId,
        notes: 'Bloqueo levantado manualmente desde panel de administración'
      }));

      if (liftCustomerBlock.fulfilled.match(result)) {
        toast.success('✅ Bloqueo levantado exitosamente');
        onClose();
      } else {
        toast.error(result.payload || 'Error al levantar bloqueo');
      }
    } catch (error) {
      console.error('Error lifting block:', error);
      toast.error('Error al levantar bloqueo');
    }
  };

  const tabs = [
    { id: 'info', label: 'Información', icon: UserIcon },
    { id: 'appointments', label: 'Citas', icon: CalendarDaysIcon },
    { id: 'consents', label: 'Consentimientos', icon: DocumentTextIcon },
    { id: 'vouchers', label: 'Vouchers', icon: TicketIcon },
    { id: 'stats', label: 'Estadísticas', icon: ChartBarIcon }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-indigo-600">
                  {client.firstName?.charAt(0)?.toUpperCase() || client.lastName?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {`${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Sin nombre'}
                </h3>
                <p className="text-sm text-gray-500">{client.email}</p>
                {client.isBlocked && (
                  <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <NoSymbolIcon className="h-4 w-4 mr-1" />
                    Cliente Bloqueado
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Editar
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 px-6">
            <nav className="flex space-x-4 -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                      isActive
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'info' && <InfoTab client={client} onLiftBlock={handleLiftBlock} />}
            {activeTab === 'appointments' && <AppointmentsTab client={client} />}
            {activeTab === 'consents' && <ConsentsTab client={client} />}
            {activeTab === 'vouchers' && <VouchersTab client={client} onCreateVoucher={onCreateVoucher} />}
            {activeTab === 'stats' && <StatsTab stats={customerStats} history={cancellationHistory} />}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t border-gray-200">
            {/* Left side - Block/Unblock */}
            <div>
              {client.isBlocked ? (
                <button
                  onClick={handleLiftBlock}
                  disabled={operationLoading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  <NoSymbolIcon className="h-4 w-4 mr-2" />
                  Levantar Bloqueo
                </button>
              ) : (
                <button
                  onClick={() => setShowBlockModal(true)}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center"
                >
                  <NoSymbolIcon className="h-4 w-4 mr-2" />
                  Bloquear Cliente
                </button>
              )}
            </div>

            {/* Right side - Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateVoucherModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
              >
                <TicketIcon className="h-4 w-4 mr-2" />
                Crear Voucher
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Client Modal */}
      {showEditModal && (
        <EditClientModal
          client={client}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleClientUpdated}
        />
      )}

      {/* Create Voucher Modal */}
      {showCreateVoucherModal && (
        <CreateVoucherModal
          client={client}
          onClose={() => setShowCreateVoucherModal(false)}
          onSuccess={() => {
            setShowCreateVoucherModal(false);
            // Recargar la tab de vouchers si está activa
            if (activeTab === 'vouchers') {
              // El componente VouchersList se recargará automáticamente
            }
          }}
        />
      )}

      {/* Block Client Modal */}
      {showBlockModal && (
        <BlockClientModal
          client={client}
          onClose={() => setShowBlockModal(false)}
          onSuccess={(blockData) => {
            setShowBlockModal(false);
            toast.success('Cliente bloqueado exitosamente');
            // Recargar información del cliente
            if (onClientUpdated) {
              onClientUpdated({ ...client, isBlocked: true, ...blockData });
            }
          }}
        />
      )}
    </div>
  );
};

/**
 * Tab de Información General
 */
const InfoTab = ({ client, onLiftBlock }) => {
  return (
    <div className="space-y-6">
      {/* Información de contacto */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">Información de Contacto</h4>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <dt className="text-xs text-gray-500 mb-1">Email</dt>
            <dd className="text-sm font-medium text-gray-900">{client.email || '-'}</dd>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <dt className="text-xs text-gray-500 mb-1">Teléfono</dt>
            <dd className="text-sm font-medium text-gray-900">{client.phone || '-'}</dd>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <dt className="text-xs text-gray-500 mb-1">Cliente desde</dt>
            <dd className="text-sm font-medium text-gray-900">
              {new Date(client.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </dd>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <dt className="text-xs text-gray-500 mb-1">Última visita</dt>
            <dd className="text-sm font-medium text-gray-900">
              {client.lastVisit 
                ? new Date(client.lastVisit).toLocaleDateString('es-ES')
                : 'Nunca'
              }
            </dd>
          </div>
        </dl>
      </div>

      {/* Estadísticas rápidas */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">Resumen de Actividad</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-indigo-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-indigo-600">{client.totalAppointments || 0}</div>
            <div className="text-xs text-gray-600 mt-1">Citas Totales</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{client.completedAppointments || 0}</div>
            <div className="text-xs text-gray-600 mt-1">Completadas</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">{client.cancellationsCount || 0}</div>
            <div className="text-xs text-gray-600 mt-1">Cancelaciones</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{client.activeVouchersCount || 0}</div>
            <div className="text-xs text-gray-600 mt-1">Vouchers Activos</div>
          </div>
        </div>
      </div>

      {/* Estado de bloqueo */}
      {client.isBlocked && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="ml-3 flex-1">
              <h5 className="text-sm font-medium text-red-900">Cliente Bloqueado</h5>
              <p className="mt-1 text-sm text-red-700">
                Este cliente está temporalmente bloqueado para agendar citas debido a cancelaciones excesivas.
              </p>
              <dl className="mt-3 space-y-1 text-sm text-red-700">
                <div className="flex justify-between">
                  <dt>Fecha de bloqueo:</dt>
                  <dd className="font-medium">
                    {new Date(client.blockedAt).toLocaleDateString('es-ES')}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Expira:</dt>
                  <dd className="font-medium">
                    {new Date(client.blockExpiresAt).toLocaleDateString('es-ES')}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Cancelaciones que causaron el bloqueo:</dt>
                  <dd className="font-medium">{client.blockCancellationCount}</dd>
                </div>
              </dl>
              <button
                onClick={onLiftBlock}
                className="mt-4 text-sm font-medium text-red-600 hover:text-red-800 underline"
              >
                Levantar bloqueo manualmente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Tab de Citas
 */
const AppointmentsTab = ({ client }) => {
  // TODO: Obtener historial real de citas del cliente
  const appointments = client.appointments || [];

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-sm font-medium text-gray-900">No hay citas registradas</h3>
        <p className="mt-2 text-sm text-gray-500">
          Este cliente aún no ha tenido citas en tu negocio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                {appointment.status === 'completed' ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                ) : appointment.status === 'cancelled' ? (
                  <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                ) : (
                  <ClockIcon className="h-5 w-5 text-yellow-500 mr-2" />
                )}
                <h5 className="text-sm font-medium text-gray-900">
                  {appointment.service?.name || 'Servicio'}
                </h5>
              </div>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Fecha:</span>{' '}
                  {new Date(appointment.dateTime).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                {appointment.specialist && (
                  <p>
                    <span className="font-medium">Especialista:</span>{' '}
                    {appointment.specialist.name}
                  </p>
                )}
                <p>
                  <span className="font-medium">Precio:</span>{' '}
                  ${appointment.price?.toLocaleString('es-CO')}
                </p>
              </div>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              appointment.status === 'completed' 
                ? 'bg-green-100 text-green-800'
                : appointment.status === 'cancelled'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {appointment.status === 'completed' ? 'Completada' :
               appointment.status === 'cancelled' ? 'Cancelada' : 'Pendiente'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Tab de Vouchers
 */
const VouchersTab = ({ client, onCreateVoucher }) => {
  return <VouchersList client={client} onCreateVoucher={onCreateVoucher} />;
};

/**
 * Tab de Estadísticas
 */
const StatsTab = ({ stats, history }) => {
  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">Métricas de Comportamiento</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Tasa de Cancelación</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">
              {stats?.cancellationRate || 0}%
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Tasa de Asistencia</div>
            <div className="mt-1 text-2xl font-bold text-green-600">
              {stats?.attendanceRate || 0}%
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Tiempo Promedio de Cancelación</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">
              {stats?.avgCancellationHours || 0}h
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Valor Total en Vouchers</div>
            <div className="mt-1 text-2xl font-bold text-green-600">
              ${(stats?.totalVoucherValue || 0).toLocaleString('es-CO')}
            </div>
          </div>
        </div>
      </div>

      {/* Historial de cancelaciones reciente */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">
          Historial de Cancelaciones Recientes
        </h4>
        {!history || history.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No hay cancelaciones recientes
          </p>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 5).map((cancellation) => (
              <div key={cancellation.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">
                    {new Date(cancellation.cancelledAt).toLocaleDateString('es-ES')}
                  </span>
                  <span className="text-gray-500 ml-2">
                    ({cancellation.hoursBeforeBooking}h antes)
                  </span>
                </div>
                {cancellation.voucherGenerated && (
                  <span className="text-xs text-green-600 font-medium">
                    Voucher generado
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Tab de Consentimientos
 */
const ConsentsTab = ({ client }) => {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentBusiness } = useSelector(state => state.business);

  useEffect(() => {
    const loadConsents = async () => {
      if (!client?.id || !currentBusiness?.id) return;
      
      setLoading(true);
      try {
        const response = await fetch(
          `/api/business/${currentBusiness.id}/clients/${client.id}/history`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setConsents(data.data?.consents || []);
        }
      } catch (error) {
        console.error('Error loading consents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConsents();
  }, [client, currentBusiness]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
        <span className="text-gray-600">Cargando consentimientos...</span>
      </div>
    );
  }

  if (consents.length === 0) {
    return (
      <div className="text-center py-12">
        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Sin consentimientos firmados
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Este cliente aún no ha firmado ningún consentimiento informado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Consentimientos Firmados
        </h3>
        <span className="text-sm text-gray-500">
          Total: {consents.length}
        </span>
      </div>

      <div className="space-y-3">
        {consents.map((consent) => (
          <div 
            key={consent.id} 
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
                  <h4 className="text-sm font-medium text-gray-900">
                    {consent.template?.title || 'Consentimiento'}
                  </h4>
                  {consent.template?.version && (
                    <span className="text-xs text-gray-500">
                      v{consent.template.version}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Servicio:</span>
                    <span className="ml-2 text-gray-900">
                      {consent.service?.name || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Categoría:</span>
                    <span className="ml-2 text-gray-900">
                      {consent.template?.category || 'General'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Firmado:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(consent.signedAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Firmado por:</span>
                    <span className="ml-2 text-gray-900">
                      {consent.signedBy || client.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="ml-4 flex flex-col space-y-2">
                {consent.pdfUrl && (
                  <a
                    href={consent.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition-colors"
                  >
                    <DocumentTextIcon className="h-4 w-4 mr-1" />
                    Ver PDF
                  </a>
                )}
                {consent.pdfGeneratedAt && (
                  <span className="text-xs text-green-600 flex items-center">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    PDF generado
                  </span>
                )}
              </div>
            </div>

            {/* Campos editables si existen */}
            {consent.editableFieldsData && Object.keys(consent.editableFieldsData).length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs font-medium text-gray-700 mb-2">
                  Datos capturados:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(consent.editableFieldsData).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-2 rounded">
                      <span className="text-gray-500 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="ml-1 text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientDetailModal;
