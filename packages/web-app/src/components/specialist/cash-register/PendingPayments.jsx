import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  UserIcon,
  CalendarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PaymentModal from './PaymentModal';

/**
 * Lista de turnos pendientes de pago
 * Filtrados según el rol del usuario
 */
export default function PendingPayments({ shiftId }) {
  const { user, token } = useSelector(state => state.auth);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all', // 'all', 'IN_PROGRESS', 'COMPLETED'
    searchTerm: ''
  });

  useEffect(() => {
    loadPendingPayments();
  }, [shiftId, filters]);

  const loadPendingPayments = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        businessId: user.businessId,
        paymentStatus: 'PENDING',
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.searchTerm && { search: filters.searchTerm })
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/appointments?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Error loading appointments');

      const data = await response.json();
      
      // Determinar qué estructura tiene la respuesta
      let appointmentsList = [];
      if (Array.isArray(data)) {
        appointmentsList = data;
      } else if (data.data?.appointments && Array.isArray(data.data.appointments)) {
        appointmentsList = data.data.appointments;
      } else if (data.data && Array.isArray(data.data)) {
        appointmentsList = data.data;
      } else if (data.appointments && Array.isArray(data.appointments)) {
        appointmentsList = data.appointments;
      }
      
      console.log('📋 Turnos pendientes cargados:', appointmentsList.length);
      
      // Filtrar solo IN_PROGRESS y COMPLETED
      const filteredAppointments = appointmentsList.filter(
        apt => apt.status === 'IN_PROGRESS' || apt.status === 'COMPLETED'
      );
      
      console.log('✅ Turnos filtrados (IN_PROGRESS/COMPLETED):', filteredAppointments.length);
      
      setAppointments(filteredAppointments);
    } catch (error) {
      console.error('Error loading pending payments:', error);
      alert('Error al cargar los turnos pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedAppointment(null);
    loadPendingPayments();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
      const dateTime = new Date(dateTimeString);
      return format(dateTime, "d MMM yyyy, HH:mm", { locale: es });
    } catch {
      return 'N/A';
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      IN_PROGRESS: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          En Progreso
        </span>
      ),
      COMPLETED: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Completado
        </span>
      )
    };
    return badges[status] || null;
  };

  const getClientName = (appointment) => {
    const client = appointment.Client || appointment.client;
    if (!client) return 'Cliente no disponible';
    return `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Sin nombre';
  };

  const getServiceName = (appointment) => {
    const service = appointment.Service || appointment.service;
    return service?.name || 'Servicio no disponible';
  };

  const getSpecialistName = (appointment) => {
    const specialist = appointment.specialist;
    if (!specialist) return 'N/A';
    return `${specialist.firstName || ''} ${specialist.lastName || ''}`.trim() || 'Sin nombre';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Turnos Pendientes de Pago</h3>
          <p className="text-sm text-gray-600">Turnos en progreso o completados sin pagar</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
          <BanknotesIcon className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-semibold text-blue-900">
            {appointments.length} pendientes
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Búsqueda */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            placeholder="Buscar por cliente, servicio..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtro por estado */}
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos los Estados</option>
          <option value="IN_PROGRESS">En Progreso</option>
          <option value="COMPLETED">Completados</option>
        </select>
      </div>

      {/* Lista de Turnos */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircleIcon className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-center">
              No hay turnos pendientes de pago
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Servicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especialista
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="w-5 h-5 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          {getClientName(appointment)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {getServiceName(appointment)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {getSpecialistName(appointment)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {formatDateTime(appointment.startTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(appointment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(appointment.totalAmount)}
                      </div>
                      {appointment.discountAmount > 0 && (
                        <div className="text-xs text-gray-500">
                          Desc: {formatCurrency(appointment.discountAmount)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowPaymentModal(true);
                        }}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <BanknotesIcon className="w-4 h-4 mr-1" />
                        Cobrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Pago */}
      {showPaymentModal && selectedAppointment && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          shiftId={shiftId}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
