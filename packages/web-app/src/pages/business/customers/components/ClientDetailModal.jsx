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
  DocumentTextIcon,
  DocumentArrowDownIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  PrinterIcon
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
import { apiClient } from '@shared/api/client';
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
            {activeTab === 'stats' && <StatsTab client={client} />}
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
      {/* Información Personal */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">Información Personal</h4>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {client.dateOfBirth && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-xs text-gray-500 mb-1">Fecha de Nacimiento</dt>
              <dd className="text-sm font-medium text-gray-900">
                {new Date(client.dateOfBirth).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </dd>
            </div>
          )}
          {client.documentType && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-xs text-gray-500 mb-1">Tipo de Documento</dt>
              <dd className="text-sm font-medium text-gray-900">{client.documentType}</dd>
            </div>
          )}
          {client.documentNumber && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-xs text-gray-500 mb-1">Número de Documento</dt>
              <dd className="text-sm font-medium text-gray-900">{client.documentNumber}</dd>
            </div>
          )}
          {client.gender && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-xs text-gray-500 mb-1">Género</dt>
              <dd className="text-sm font-medium text-gray-900">
                {client.gender === 'MALE' ? 'Masculino' : 
                 client.gender === 'FEMALE' ? 'Femenino' : 
                 client.gender === 'OTHER' ? 'Otro' : 'Prefiere no decir'}
              </dd>
            </div>
          )}
        </dl>
      </div>

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
 * Tab de Citas con historial completo
 */
const AppointmentsTab = ({ client }) => {
  const { currentBusiness } = useSelector(state => state.business);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingReceipt, setDownloadingReceipt] = useState(null);

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client.id]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `/api/appointments/client/${client.id}`,
        {
          params: { 
            businessId: currentBusiness?.id,
            includeReceipt: true
            // Removido temporalmente: includePaymentInfo: true
          }
        }
      );

      if (response.data.success) {
        setAppointments(response.data.data || response.data.appointments || []);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Error al cargar el historial de citas');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (receiptId, receiptNumber) => {
    setDownloadingReceipt(receiptId);
    try {
      const response = await apiClient.get(
        `/api/receipts/${receiptId}/pdf`,
        {
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recibo-${receiptNumber || receiptId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('✅ Recibo descargado');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('❌ Error al descargar el recibo');
    } finally {
      setDownloadingReceipt(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
        <span className="text-gray-600">Cargando historial...</span>
      </div>
    );
  }

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
      {/* Header con estadísticas rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="text-xs text-blue-600 font-medium">Total</div>
          <div className="text-2xl font-bold text-blue-700">{appointments.length}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="text-xs text-green-600 font-medium">Completadas</div>
          <div className="text-2xl font-bold text-green-700">
            {appointments.filter(a => a.status === 'COMPLETED').length}
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
          <div className="text-xs text-red-600 font-medium">Canceladas</div>
          <div className="text-2xl font-bold text-red-700">
            {appointments.filter(a => a.status === 'CANCELED').length}
          </div>
        </div>
      </div>

      {/* Lista de citas */}
      {appointments.map((appointment) => (
        <div 
          key={appointment.id} 
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          {/* Header de la cita */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {appointment.status === 'COMPLETED' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
              ) : appointment.status === 'CANCELED' ? (
                <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
              ) : (
                <ClockIcon className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              )}
              <div>
                <h5 className="text-sm font-semibold text-gray-900">
                  {appointment.service?.name || 'Servicio'}
                </h5>
                <p className="text-xs text-gray-500">
                  {formatDateTime(appointment.startTime || appointment.dateTime)}
                </p>
              </div>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              appointment.status === 'COMPLETED' 
                ? 'bg-green-100 text-green-800'
                : appointment.status === 'CANCELED'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {appointment.status === 'COMPLETED' ? 'Completada' :
               appointment.status === 'CANCELED' ? 'Cancelada' : 
               appointment.status === 'SCHEDULED' ? 'Programada' : 'Pendiente'}
            </span>
          </div>

          {/* Información principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {/* Especialista que atendió */}
            {appointment.specialist && (
              <div className="flex items-center gap-2 text-sm">
                <UserCircleIcon className="h-4 w-4 text-indigo-600" />
                <div>
                  <span className="text-gray-500">Atendió:</span>
                  <span className="ml-1 font-medium text-gray-900">
                    {appointment.specialist.firstName} {appointment.specialist.lastName}
                  </span>
                </div>
              </div>
            )}

            {/* Precio del servicio */}
            <div className="flex items-center gap-2 text-sm">
              <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
              <div>
                <span className="text-gray-500">Precio:</span>
                <span className="ml-1 font-medium text-gray-900">
                  {formatCurrency(appointment.totalAmount || appointment.price)}
                </span>
              </div>
            </div>
          </div>

          {/* Información de pago (si está pagado) */}
          {appointment.paymentStatus === 'PAID' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Pago Completado</span>
                  </div>

                  {/* Monto pagado */}
                  <div className="text-sm text-green-700">
                    <span className="font-medium">Monto:</span> {formatCurrency(appointment.paidAmount)}
                  </div>

                  {/* Usuario que cobró */}
                  {appointment.paidBy && (
                    <div className="text-sm text-green-700">
                      <span className="font-medium">Cobró:</span> {appointment.paidBy.firstName} {appointment.paidBy.lastName}
                    </div>
                  )}

                  {/* Método de pago */}
                  {appointment.paymentMethod && (
                    <div className="text-sm text-green-700">
                      <span className="font-medium">Método:</span> {appointment.paymentMethod}
                    </div>
                  )}

                  {/* Recibo */}
                  {appointment.receipt && (
                    <div className="flex items-center gap-2 mt-2">
                      <DocumentTextIcon className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-700">
                        Recibo #{appointment.receipt.receiptNumber}
                      </span>
                    </div>
                  )}
                </div>

                {/* Botón de descarga */}
                {appointment.receipt && (
                  <button
                    onClick={() => handleDownloadReceipt(
                      appointment.receipt.id, 
                      appointment.receipt.receiptNumber
                    )}
                    disabled={downloadingReceipt === appointment.receipt.id}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                  >
                    {downloadingReceipt === appointment.receipt.id ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        <span>Descargando...</span>
                      </>
                    ) : (
                      <>
                        <DocumentArrowDownIcon className="h-4 w-4" />
                        <span>Descargar</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Estado de pago pendiente */}
          {appointment.paymentStatus === 'PENDING' && appointment.status === 'COMPLETED' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Pago Pendiente</span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                Esta cita está completada pero aún no se ha registrado el pago.
              </p>
            </div>
          )}

          {/* Pago parcial */}
          {appointment.paymentStatus === 'PARTIAL_PAID' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Pago Parcial</span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    Pagado: {formatCurrency(appointment.paidAmount)} de {formatCurrency(appointment.totalAmount)}
                  </p>
                  <p className="text-xs text-blue-700">
                    Pendiente: {formatCurrency((appointment.totalAmount || 0) - (appointment.paidAmount || 0))}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notas (si existen) */}
          {appointment.notes && (
            <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded p-2">
              <span className="font-medium">Notas:</span> {appointment.notes}
            </div>
          )}
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
const StatsTab = ({ client }) => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentBusiness } = useSelector(state => state.business);

  useEffect(() => {
    const loadHistory = async () => {
      if (!client?.id || !currentBusiness?.id) return;
      
      setLoading(true);
      try {
        const response = await apiClient.get(
          `/api/business/${currentBusiness.id}/clients/${client.id}/history`
        );
        
        setHistory(response.data?.data || null);
      } catch (error) {
        console.error('Error loading client history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [client, currentBusiness]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
        <span className="text-gray-600">Cargando estadísticas...</span>
      </div>
    );
  }

  const stats = history?.statistics || {};
  const cancellations = history?.cancellations || [];

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">Métricas de Comportamiento</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Tasa de Cancelación</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">
              {stats.totalAppointments > 0 
                ? Math.round((stats.canceledAppointments / stats.totalAppointments) * 100)
                : 0}%
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Tasa de Asistencia</div>
            <div className="mt-1 text-2xl font-bold text-green-600">
              {stats.totalAppointments > 0 
                ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
                : 0}%
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Tiempo Promedio de Cancelación</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">
              {cancellations.length > 0 
                ? Math.round(
                    cancellations.reduce((acc, c) => {
                      const hours = Math.abs(new Date(c.canceledAt) - new Date(c.appointmentDate)) / 36e5;
                      return acc + hours;
                    }, 0) / cancellations.length
                  )
                : 0}h
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Valor Total en Vouchers</div>
            <div className="mt-1 text-2xl font-bold text-green-600">
              ${(stats.availableVouchers || 0).toLocaleString('es-CO')}
            </div>
          </div>
        </div>
      </div>

      {/* Historial de cancelaciones reciente */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">
          Historial de Cancelaciones Recientes
        </h4>
        {!cancellations || cancellations.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No hay cancelaciones recientes
          </p>
        ) : (
          <div className="space-y-2">
            {cancellations.slice(0, 5).map((cancellation) => (
              <div key={cancellation.id} className="flex items-start justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900 text-sm">
                      {new Date(cancellation.appointmentDate).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Cancelado el {new Date(cancellation.canceledAt).toLocaleDateString('es-ES')}
                  </div>
                  {cancellation.service && (
                    <div className="mt-1 text-xs text-gray-600">
                      Servicio: {cancellation.service.name}
                    </div>
                  )}
                  {cancellation.reason && (
                    <div className="mt-1 text-xs text-gray-500 italic">
                      Motivo: {cancellation.reason}
                    </div>
                  )}
                  {cancellation.canceledBy && (
                    <div className="mt-1 text-xs text-gray-500">
                      Por: {cancellation.canceledBy.name}
                    </div>
                  )}
                </div>
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
        const response = await apiClient.get(
          `/api/business/${currentBusiness.id}/clients/${client.id}/history`
        );
        
        console.log('🔍 Frontend - Respuesta completa:', response.data);
        console.log('🔍 Frontend - Data anidada:', response.data?.data);
        console.log('🔍 Frontend - Consents recibidos:', response.data?.data?.consents);
        console.log('🔍 Frontend - Cantidad de consents:', response.data?.data?.consents?.length);
        
        setConsents(response.data?.data?.consents || []);
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
        {consents.map((consent) => {
          console.log('🔍 Frontend - Consent individual:', {
            id: consent.id,
            pdfUrl: consent.pdfUrl,
            hasPdfUrl: !!consent.pdfUrl,
            pdfGeneratedAt: consent.pdfGeneratedAt
          });
          
          // Detectar si es un PDF legacy (cualquier cosa que NO sea base64)
          const isBase64PDF = consent.pdfUrl && consent.pdfUrl.startsWith('data:application/pdf;base64');
          const needsRegeneration = consent.pdfUrl && !isBase64PDF;
          
          // Handler para regenerar PDF si no es base64
          const handleViewPDF = async (e) => {
            console.log('🔵 handleViewPDF llamado');
            console.log('🔍 needsRegeneration:', needsRegeneration);
            console.log('🔍 consent.pdfUrl:', consent.pdfUrl);
            console.log('🔍 consent.id:', consent.id);
            console.log('🔍 currentBusiness.id:', currentBusiness?.id);
            
            if (needsRegeneration) {
              e.preventDefault();
              console.log('⚠️ Es ruta local, regenerando PDF...');
              
              try {
                toast.loading('Generando PDF...', { id: 'pdf-gen' });
                
                const url = `/api/business/${currentBusiness.id}/consent-signatures/${consent.id}/pdf`;
                console.log('📡 Llamando endpoint:', url);
                
                // Recibir como blob (igual que los recibos)
                const response = await apiClient.get(url, { responseType: 'blob' });
                
                console.log('📥 PDF recibido como blob');
                
                // Crear Blob y URL temporal (patrón de los recibos)
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const blobUrl = window.URL.createObjectURL(blob);
                
                console.log('✅ PDF generado y URL temporal creada');
                toast.success('PDF generado exitosamente', { id: 'pdf-gen' });
                
                // Abrir en nueva ventana
                window.open(blobUrl, '_blank');
                
                // Limpiar URL temporal después de un momento
                setTimeout(() => {
                  window.URL.revokeObjectURL(blobUrl);
                  console.log('🧹 URL temporal limpiada');
                }, 100);
                
              } catch (error) {
                console.error('❌ Error generating PDF:', error);
                console.error('❌ Error completo:', error.response?.data || error.message);
                toast.error('Error generando PDF', { id: 'pdf-gen' });
              }
            } else if (consent.pdfUrl) {
              // Si ya existe el PDF, descargarlo como blob también
              try {
                const response = await apiClient.get(
                  `/api/business/${currentBusiness.id}/consent-signatures/${consent.id}/pdf`,
                  { responseType: 'blob' }
                );
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const blobUrl = window.URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');
                setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
              } catch (error) {
                console.error('❌ Error abriendo PDF:', error);
                toast.error('Error abriendo PDF');
              }
            }
          };
          
          return (
          <div 
            key={consent.id} 
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
                  <h4 className="text-sm font-medium text-gray-900">
                    {consent.template?.name || 'Consentimiento'}
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
                {consent.pdfUrl ? (
                  <>
                    <button
                      onClick={handleViewPDF}
                      className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition-colors"
                    >
                      <DocumentTextIcon className="h-4 w-4 mr-1" />
                      Ver PDF
                    </button>
                    <button
                      onClick={handleViewPDF}
                      className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                    >
                      <PrinterIcon className="h-4 w-4 mr-1" />
                      Imprimir
                    </button>
                  </>
                ) : (
                  <div className="text-xs text-amber-600 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    PDF no generado
                  </div>
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
          );
        })}
      </div>
    </div>
  );
};

export default ClientDetailModal;
