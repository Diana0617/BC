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
  XCircleIcon
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

const ClientDetailModal = ({ client, onClose, onCreateVoucher }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('info');
  
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
                  {client.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {client.name || 'Sin nombre'}
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
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
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
            {activeTab === 'vouchers' && <VouchersTab client={client} onCreateVoucher={onCreateVoucher} />}
            {activeTab === 'stats' && <StatsTab stats={customerStats} history={cancellationHistory} />}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            {client.isBlocked && (
              <button
                onClick={handleLiftBlock}
                disabled={operationLoading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                Levantar Bloqueo
              </button>
            )}
            <button
              onClick={() => onCreateVoucher(client)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
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
  const vouchers = client.vouchers || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-900">
          Vouchers del Cliente ({vouchers.length})
        </h4>
        <button
          onClick={() => onCreateVoucher(client)}
          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          Crear Voucher
        </button>
      </div>

      {vouchers.length === 0 ? (
        <div className="text-center py-12">
          <TicketIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-sm font-medium text-gray-900">No hay vouchers</h3>
          <p className="mt-2 text-sm text-gray-500">
            Este cliente no tiene vouchers activos o generados.
          </p>
        </div>
      ) : (
        vouchers.map((voucher) => (
          <div key={voucher.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center">
                  <TicketIcon className="h-5 w-5 text-green-600 mr-2" />
                  <code className="text-sm font-mono font-medium text-gray-900">
                    {voucher.code}
                  </code>
                </div>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Valor:</span> ${voucher.amount?.toLocaleString('es-CO')}
                  </p>
                  <p>
                    <span className="font-medium">Generado:</span>{' '}
                    {new Date(voucher.issuedAt).toLocaleDateString('es-ES')}
                  </p>
                  <p>
                    <span className="font-medium">Expira:</span>{' '}
                    {new Date(voucher.expiresAt).toLocaleDateString('es-ES')}
                  </p>
                  {voucher.usedAt && (
                    <p>
                      <span className="font-medium">Usado:</span>{' '}
                      {new Date(voucher.usedAt).toLocaleDateString('es-ES')}
                    </p>
                  )}
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                voucher.status === 'ACTIVE' 
                  ? 'bg-green-100 text-green-800'
                  : voucher.status === 'USED'
                  ? 'bg-blue-100 text-blue-800'
                  : voucher.status === 'EXPIRED'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {voucher.status === 'ACTIVE' ? 'Activo' :
                 voucher.status === 'USED' ? 'Usado' :
                 voucher.status === 'EXPIRED' ? 'Expirado' : 'Cancelado'}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
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

export default ClientDetailModal;
