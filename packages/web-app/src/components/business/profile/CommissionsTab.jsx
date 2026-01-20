import React, { useState, useEffect } from 'react';
import {
  UserCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import commissionApi from '@shared/api/commissionApi';
import CommissionPaymentModal from './CommissionPaymentModal';

const CommissionsTab = ({
  specialists = [],
  config = {},
  selectedSpecialistDetails = null,
  loading = false,
  onPayCommission,
  onViewDetails,
  filters,
  onFilterChange
}) => {
  const { user } = useSelector(state => state.auth);
  const [expandedSpecialist, setExpandedSpecialist] = useState(null);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestFilters, setRequestFilters] = useState({ status: 'SUBMITTED', page: 1, limit: 10 });
  // eslint-disable-next-line no-unused-vars
  const [requestsPagination, setRequestsPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRequestForPayment, setSelectedRequestForPayment] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState([]);

  console.log('🔶 CommissionsTab - Props recibidos:', {
    specialists,
    specialistsCount: specialists?.length,
    config,
    loading,
    filters,
    selectedSpecialistDetails
  });

  useEffect(() => {
    if (user?.businessId) {
      loadPaymentRequests();
    }
  }, [user?.businessId, requestFilters]);

  const loadPaymentRequests = async () => {
    try {
      setRequestsLoading(true);
      console.log('🔶 CommissionsTab - loadPaymentRequests:', { businessId: user.businessId, requestFilters });
      
      const response = await commissionApi.getPaymentRequests(user.businessId, requestFilters);
      
      if (response.success) {
        setPaymentRequests(response.data.requests);
        setRequestsPagination(response.data.pagination);
        console.log('✅ CommissionsTab - Payment requests loaded:', response.data.requests.length);
      }
    } catch (error) {
      console.error('❌ Error loading payment requests:', error);
      toast.error('Error al cargar solicitudes de pago');
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      const businessNotes = prompt('Notas del negocio (opcional):');
      
      const response = await commissionApi.updatePaymentRequestStatus(
        user.businessId,
        requestId,
        { status: 'APPROVED', businessNotes }
      );

      if (response.success) {
        toast.success('Solicitud aprobada exitosamente');
        loadPaymentRequests();
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Error al aprobar solicitud');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const rejectionReason = prompt('¿Por qué rechazas esta solicitud?');
      
      if (!rejectionReason) {
        toast.error('Debes proporcionar una razón de rechazo');
        return;
      }

      const response = await commissionApi.updatePaymentRequestStatus(
        user.businessId,
        requestId,
        { status: 'REJECTED', rejectionReason }
      );

      if (response.success) {
        toast.success('Solicitud rechazada');
        loadPaymentRequests();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Error al rechazar solicitud');
    }
  };

  const handleToggleRequestSelection = (requestId) => {
    setSelectedRequests(prev => {
      if (prev.includes(requestId)) {
        return prev.filter(id => id !== requestId);
      }
      return [...prev, requestId];
    });
  };

  const handleSelectAllApproved = () => {
    const approvedIds = paymentRequests
      .filter(req => req.status === 'APPROVED')
      .map(req => req.id);
    
    if (selectedRequests.length === approvedIds.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(approvedIds);
    }
  };

  const handleOpenPaymentModal = (request) => {
    setSelectedRequestForPayment(request);
    setShowPaymentModal(true);
  };

  const handleOpenMultiPaymentModal = () => {
    const selectedRequestsData = paymentRequests.filter(req => selectedRequests.includes(req.id));
    
    if (selectedRequestsData.length === 0) {
      toast.error('Selecciona al menos una solicitud para pagar');
      return;
    }

    // Combinar datos de múltiples solicitudes
    const totalAmount = selectedRequestsData.reduce((sum, req) => sum + req.totalAmount, 0);
    const allAppointments = selectedRequestsData.flatMap(req => req.appointments || []);
    const firstRequest = selectedRequestsData[0];

    setSelectedRequestForPayment({
      ...firstRequest,
      totalAmount,
      appointments: allAppointments,
      isMultiple: true,
      requestIds: selectedRequests
    });
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedRequestForPayment(null);
  };

  const handlePaymentSubmit = async (paymentData, paymentProofFile) => {
    try {
      setPaymentLoading(true);
      console.log('💳 Registrando pago de comisión:', { paymentData, hasFile: !!paymentProofFile, isMultiple: selectedRequestForPayment.isMultiple });

      const data = {
        specialistId: selectedRequestForPayment.specialist.id,
        periodFrom: selectedRequestForPayment.periodFrom,
        periodTo: selectedRequestForPayment.periodTo,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        paymentReference: paymentData.notes,
        paidDate: paymentData.paymentDate,
        notes: paymentData.notes,
        requestIds: selectedRequestForPayment.isMultiple ? selectedRequestForPayment.requestIds : [selectedRequestForPayment.id],
        appointmentIds: (selectedRequestForPayment.appointments || []).map(a => a.id)
      };

      const response = await commissionApi.registerPayment(
        user.businessId,
        data,
        paymentProofFile
      );

      if (response.success) {
        const count = selectedRequestForPayment.isMultiple ? selectedRequestForPayment.requestIds.length : 1;
        toast.success(`Pago${count > 1 ? 's' : ''} registrado${count > 1 ? 's' : ''} exitosamente`);
        handleClosePaymentModal();
        setSelectedRequests([]);
        loadPaymentRequests();
      }
    } catch (error) {
      console.error('❌ Error registering payment:', error);
      toast.error(error.response?.data?.message || 'Error al registrar pago');
    } finally {
      setPaymentLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      SUBMITTED: { text: 'Pendiente', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', icon: ClockIcon },
      APPROVED: { text: 'Aprobada', bgColor: 'bg-green-100', textColor: 'text-green-800', icon: CheckCircleIcon },
      REJECTED: { text: 'Rechazada', bgColor: 'bg-red-100', textColor: 'text-red-800', icon: XCircleIcon },
      PAID: { text: 'Pagada', bgColor: 'bg-blue-100', textColor: 'text-blue-800', icon: CheckCircleIcon }
    };

    const config = statusConfig[status] || statusConfig.SUBMITTED;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
        <Icon className="w-4 h-4 mr-1" />
        {config.text}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value}%`;
  };

  const toggleSpecialist = (specialistId) => {
    if (expandedSpecialist === specialistId) {
      setExpandedSpecialist(null);
    } else {
      setExpandedSpecialist(specialistId);
      onViewDetails(specialistId);
    }
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="space-y-6">
      {/* Commission Config Card */}
      {config && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Comisiones</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Porcentaje Comisión</div>
              <div className="text-2xl font-bold text-pink-600">
                {formatPercentage(config.commissionPercentage || 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Cálculo Basado En</div>
              <div className="text-lg font-semibold text-gray-900">
                {config.calculationBasis === 'service_price' ? 'Precio del Servicio' : 
                 config.calculationBasis === 'amount_paid' ? 'Monto Pagado' : 
                 'Monto Pagado (sin anticipos)'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Frecuencia de Pago</div>
              <div className="text-lg font-semibold text-gray-900">
                {config.paymentFrequency === 'weekly' ? 'Semanal' :
                 config.paymentFrequency === 'biweekly' ? 'Quincenal' :
                 'Mensual'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Period Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
            <select
              value={filters?.month || currentMonth}
              onChange={(e) => onFilterChange({ ...filters, month: parseInt(e.target.value) })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <select
              value={filters?.year || currentYear}
              onChange={(e) => onFilterChange({ ...filters, year: parseInt(e.target.value) })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Specialists List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Cargando comisiones...</p>
          </div>
        ) : specialists.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <UserCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay especialistas con comisiones en este período</p>
          </div>
        ) : (
          specialists.map((specialist) => (
            <div key={specialist.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Specialist Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSpecialist(specialist.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <UserCircleIcon className="w-12 h-12 text-pink-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {specialist.firstName} {specialist.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{specialist.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Comisiones Generadas</div>
                      <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(specialist.totalCommissionsGenerated || 0)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Comisiones Pagadas</div>
                      <div className="text-xl font-bold text-green-600">
                        {formatCurrency(specialist.totalCommissionsPaid || 0)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Pendientes</div>
                      <div className="text-xl font-bold text-yellow-600">
                        {formatCurrency(specialist.totalCommissionsPending || 0)}
                      </div>
                    </div>
                    {expandedSpecialist === specialist.id ? (
                      <ChevronUpIcon className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Specialist Details */}
              {expandedSpecialist === specialist.id && selectedSpecialistDetails && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  {selectedSpecialistDetails.loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Services Table */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Servicios del Período</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Fecha
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Servicio
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Cliente
                                </th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                  Precio
                                </th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                  Comisión
                                </th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                                  Estado
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {selectedSpecialistDetails.services?.map((service, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {format(new Date(service.date), 'dd/MM/yyyy', { locale: es })}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {service.serviceName}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-500">
                                    {service.clientName}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                    {formatCurrency(service.servicePrice)}
                                  </td>
                                  <td className="px-4 py-2 text-sm font-medium text-pink-600 text-right">
                                    {formatCurrency(service.commission)}
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    {service.isPaid ? (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                                        Pagado
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        <ClockIcon className="w-4 h-4 mr-1" />
                                        Pendiente
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Payment History */}
                      {selectedSpecialistDetails.paymentHistory && selectedSpecialistDetails.paymentHistory.length > 0 && (
                        <div>
                          <h4 className="text-md font-semibold text-gray-900 mb-3">Historial de Pagos</h4>
                          <div className="space-y-2">
                            {selectedSpecialistDetails.paymentHistory.map((payment, index) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {format(new Date(payment.paymentDate), 'dd/MM/yyyy HH:mm', { locale: es })}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Por: {payment.paidByUser}
                                  </div>
                                  {payment.notes && (
                                    <div className="text-xs text-gray-500 mt-1">{payment.notes}</div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-green-600">
                                    {formatCurrency(payment.amount)}
                                  </div>
                                  <div className="text-xs text-gray-500">{payment.paymentMethod}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pay Button */}
                      {specialist.totalCommissionsPending > 0 && (
                        <div className="flex justify-end">
                          <button
                            onClick={() => onPayCommission(specialist, selectedSpecialistDetails)}
                            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                          >
                            <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                            Registrar Pago de {formatCurrency(specialist.totalCommissionsPending)}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Payment Requests Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900">Solicitudes de Pago</h2>
            {paymentRequests.filter(r => r.status === 'APPROVED').length > 0 && (
              <button
                onClick={handleSelectAllApproved}
                className="text-sm text-pink-600 hover:text-pink-700 font-medium"
              >
                {selectedRequests.length === paymentRequests.filter(r => r.status === 'APPROVED').length
                  ? 'Deseleccionar todas'
                  : 'Seleccionar todas las aprobadas'}
              </button>
            )}
            {selectedRequests.length > 0 && (
              <span className="text-sm text-gray-600">
                {selectedRequests.length} seleccionada{selectedRequests.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <select
            value={requestFilters.status}
            onChange={(e) => setRequestFilters({ ...requestFilters, status: e.target.value, page: 1 })}
            className="rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 text-sm"
          >
            <option value="all">Todas</option>
            <option value="SUBMITTED">Pendientes</option>
            <option value="APPROVED">Aprobadas</option>
            <option value="REJECTED">Rechazadas</option>
            <option value="PAID">Pagadas</option>
          </select>
        </div>

        {requestsLoading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Cargando solicitudes...</p>
          </div>
        ) : paymentRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay solicitudes de pago
            </h3>
            <p className="text-gray-500">
              {requestFilters.status === 'SUBMITTED' 
                ? 'No hay solicitudes pendientes de revisión'
                : 'No se encontraron solicitudes con este filtro'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Checkbox para solicitudes aprobadas */}
                    {request.status === 'APPROVED' && (
                      <input
                        type="checkbox"
                        checked={selectedRequests.includes(request.id)}
                        onChange={() => handleToggleRequestSelection(request.id)}
                        className="h-5 w-5 text-pink-600 focus:ring-pink-500 border-gray-300 rounded cursor-pointer"
                      />
                    )}
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
                      onClick={() => handleApproveRequest(request.id)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <XCircleIcon className="w-5 h-5 mr-2" />
                      Rechazar
                    </button>
                  </div>
                )}

                {/* Botón de pagar para solicitudes aprobadas (solo si no está seleccionada) */}
                {request.status === 'APPROVED' && !selectedRequests.includes(request.id) && (
                  <div className="mt-4">
                    <button
                      onClick={() => handleOpenPaymentModal(request)}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                    >
                      <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                      Registrar Pago Individual
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
            ))}
          </div>
        )}
      </div>

      {/* Botón flotante para pago múltiple */}
      {selectedRequests.length > 0 && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={handleOpenMultiPaymentModal}
            className="inline-flex items-center px-6 py-4 border border-transparent rounded-full shadow-lg text-base font-medium text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transform transition-all duration-200 hover:scale-105"
          >
            <CurrencyDollarIcon className="w-6 h-6 mr-2" />
            Pagar {selectedRequests.length} Solicitud{selectedRequests.length > 1 ? 'es' : ''} (
            ${paymentRequests
              .filter(req => selectedRequests.includes(req.id))
              .reduce((sum, req) => sum + req.totalAmount, 0)
              .toLocaleString('es-CO')}
            )
          </button>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedRequestForPayment && (
        <CommissionPaymentModal
          isOpen={showPaymentModal}
          onClose={handleClosePaymentModal}
          onSubmit={handlePaymentSubmit}
          specialist={{
            id: selectedRequestForPayment.specialist.id,
            firstName: selectedRequestForPayment.specialist.name.split(' ')[0],
            lastName: selectedRequestForPayment.specialist.name.split(' ').slice(1).join(' '),
            email: selectedRequestForPayment.specialist.email,
            totalCommissionsGenerated: selectedRequestForPayment.totalAmount,
            totalCommissionsPaid: 0,
            totalCommissionsPending: selectedRequestForPayment.totalAmount
          }}
          details={{
            period: {
              month: new Date(selectedRequestForPayment.periodFrom).getMonth() + 1,
              year: new Date(selectedRequestForPayment.periodFrom).getFullYear()
            },
            services: selectedRequestForPayment.appointments || []
          }}
          pendingAmountOverride={selectedRequestForPayment.totalAmount}
          loading={paymentLoading}
        />
      )}
    </div>
  );
};

export default CommissionsTab;
