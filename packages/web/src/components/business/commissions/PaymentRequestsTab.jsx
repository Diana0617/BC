import React, { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  DocumentTextIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import commissionApi from '@shared/api/commissionApi';

const PaymentRequestsTab = ({ businessId }) => {
  const { token } = useSelector(state => state.auth);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [filters, setFilters] = useState({
    status: 'SUBMITTED',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    if (businessId) {
      loadRequests();
    }
  }, [businessId, filters]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      console.log('🔶 PaymentRequestsTab - loadRequests:', { businessId, filters });
      
      const response = await commissionApi.getPaymentRequests(businessId, filters);
      
      if (response.success) {
        setRequests(response.data.requests);
        setPagination(response.data.pagination);
        console.log('✅ PaymentRequestsTab - Requests loaded:', response.data.requests.length);
      }
    } catch (error) {
      console.error('❌ Error loading payment requests:', error);
      toast.error('Error al cargar solicitudes de pago');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      const businessNotes = prompt('Notas del negocio (opcional):');
      
      const response = await commissionApi.updatePaymentRequestStatus(
        businessId,
        requestId,
        { status: 'APPROVED', businessNotes }
      );

      if (response.success) {
        toast.success('Solicitud aprobada exitosamente');
        loadRequests();
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Error al aprobar solicitud');
    }
  };

  const handleReject = async (requestId) => {
    try {
      const rejectionReason = prompt('¿Por qué rechazas esta solicitud?');
      
      if (!rejectionReason) {
        toast.error('Debes proporcionar una razón de rechazo');
        return;
      }

      const response = await commissionApi.updatePaymentRequestStatus(
        businessId,
        requestId,
        { status: 'REJECTED', rejectionReason }
      );

      if (response.success) {
        toast.success('Solicitud rechazada');
        loadRequests();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Error al rechazar solicitud');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      SUBMITTED: { text: 'Pendiente', bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ClockIcon },
      APPROVED: { text: 'Aprobada', bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon },
      REJECTED: { text: 'Rechazada', bg: 'bg-red-100', text: 'text-red-800', icon: XCircleIcon },
      PAID: { text: 'Pagada', bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircleIcon }
    };

    const config = statusConfig[status] || statusConfig.SUBMITTED;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.textColor}`}>
        <Icon className="w-4 h-4 mr-1" />
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
            >
              <option value="all">Todas</option>
              <option value="SUBMITTED">Pendientes</option>
              <option value="APPROVED">Aprobadas</option>
              <option value="REJECTED">Rechazadas</option>
              <option value="PAID">Pagadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de solicitudes */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay solicitudes de pago
          </h3>
          <p className="text-gray-500">
            {filters.status === 'SUBMITTED' 
              ? 'No hay solicitudes pendientes de revisión'
              : 'No se encontraron solicitudes con este filtro'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={request.specialist.avatar || '/default-avatar.png'}
                      alt={request.specialist.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.specialist.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {request.requestNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-pink-600">
                      ${parseFloat(request.totalAmount).toLocaleString('es-CO')}
                    </p>
                    {getStatusBadge(request.status)}
                  </div>
                </div>

                {/* Período */}
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Período:</span>
                    <span className="ml-2 font-medium">
                      {format(new Date(request.periodFrom), 'dd MMM', { locale: es })} - {format(new Date(request.periodTo), 'dd MMM yyyy', { locale: es })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Solicitado:</span>
                    <span className="ml-2 font-medium">
                      {format(new Date(request.submittedAt), "dd MMM yyyy 'a las' HH:mm", { locale: es })}
                    </span>
                  </div>
                </div>

                {/* Notas del especialista */}
                {request.specialistNotes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Notas:</span> {request.specialistNotes}
                    </p>
                  </div>
                )}

                {/* Comprobante de pago */}
                {request.paymentProofUrl && (
                  <div className="mt-3">
                    <a
                      href={request.paymentProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-pink-600 hover:text-pink-700"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      Ver comprobante de pago
                    </a>
                  </div>
                )}

                {/* Acciones */}
                {request.status === 'SUBMITTED' && (
                  <div className="mt-4 flex items-center space-x-3">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <XCircleIcon className="w-5 h-5 mr-2" />
                      Rechazar
                    </button>
                  </div>
                )}

                {/* Información de rechazo */}
                {request.status === 'REJECTED' && request.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 rounded-md">
                    <p className="text-sm text-red-700">
                      <span className="font-medium">Razón de rechazo:</span> {request.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} solicitudes
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-700">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentRequestsTab;
