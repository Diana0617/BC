/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClockIcon,
  UserIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  BanknotesIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { format, addDays, subDays, startOfWeek, endOfWeek, addWeeks, subWeeks, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

// Components
import AppointmentCard from '../../components/specialist/appointments/AppointmentCard';
import AppointmentCalendarView from '../../components/specialist/appointments/AppointmentCalendarView';
import CreateAppointmentModal from '../../components/calendar/CreateAppointmentModal';
import AppointmentDetailsModal from '../../components/specialist/appointments/AppointmentDetailsModal';
import CommissionSummary from '../../components/specialist/commissions/CommissionSummary';
import CashRegisterCard from '../../components/specialist/cash-register/CashRegisterCard';

/**
 * Dashboard principal para especialistas
 * Funcionalidades:
 * - Agenda personal del especialista
 * - Vista calendario interactiva (día/semana/mes)
 * - Gestión de citas (crear/ver detalles/cambiar estado)
 * - Métricas de comisiones
 * - Integración con caja registradora
 */
export default function SpecialistDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector(state => state.auth);
  const business = useSelector(state => state.business?.currentBusiness);
  
  // Estados locales
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [period, setPeriod] = useState('day'); // 'day' | 'week' | 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Datos para el modal de crear cita
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  
  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Cargar citas
  const loadAppointments = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Calcular fechas de inicio y fin según el período
      let startDate, endDate;
      
      if (period === 'day') {
        startDate = format(currentDate, 'yyyy-MM-dd');
        endDate = format(currentDate, 'yyyy-MM-dd');
      } else if (period === 'week') {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        startDate = format(weekStart, 'yyyy-MM-dd');
        endDate = format(weekEnd, 'yyyy-MM-dd');
      } else if (period === 'month') {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        startDate = format(monthStart, 'yyyy-MM-dd');
        endDate = format(monthEnd, 'yyyy-MM-dd');
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/calendar/specialist/${user.id}?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Error cargando citas');
      
      const result = await response.json();
      
      // El backend devuelve { success: true, data: { events, appointments, total, byBranch } }
      if (result.success && result.data) {
        // Usar appointments (raw) en lugar de events (para FullCalendar)
        setAppointments(result.data.appointments || []);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [currentDate, period, user?.id, token]);

  useEffect(() => {
    if (user?.id) {
      loadAppointments();
    }
  }, [user?.id, loadAppointments]);

  // Cargar datos para el modal (servicios, sucursales, especialistas)
  useEffect(() => {
    const loadModalData = async () => {
      const effectiveBusinessId = user?.businessId || business?.id;
      if (!effectiveBusinessId || !token || !user?.id) return;
      
      try {
        // Cargar servicios
        const servicesResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/business/${effectiveBusinessId}/config/services`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          setServices(servicesData.data || servicesData || []);
        }
        
        // Cargar sucursales del especialista (donde atiende)
        const branchesResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/specialists/${user.id}/branches?businessId=${effectiveBusinessId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (branchesResponse.ok) {
          const branchesData = await branchesResponse.json();
          const specialistBranches = branchesData.data || [];
          
          // Si no tiene sucursales asignadas, cargar todas las del negocio
          if (specialistBranches.length === 0) {
            const allBranchesResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/api/business/${effectiveBusinessId}/branches`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            
            if (allBranchesResponse.ok) {
              const allBranchesData = await allBranchesResponse.json();
              setBranches(allBranchesData.data || allBranchesData || []);
            }
          } else {
            setBranches(specialistBranches);
          }
        }
        
        // Cargar especialistas (solo para roles con permisos)
        if (user?.role === 'BUSINESS_SPECIALIST' || user?.role === 'BUSINESS') {
          const specialistsResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/api/business/${effectiveBusinessId}/config/specialists`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          if (specialistsResponse.ok) {
            const specialistsData = await specialistsResponse.json();
            setSpecialists(specialistsData.data || specialistsData || []);
          }
        } else {
          // Para SPECIALIST, solo él mismo
          setSpecialists([{
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName
          }]);
        }
      } catch (error) {
        console.error('Error loading modal data:', error);
      }
    };
    
    loadModalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user?.businessId || '', 
    user?.id || '', 
    user?.role || '', 
    business?.id || '', 
    token || ''
  ]);

  // Refresh manual
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  // Navegación de fechas
  const navigateDate = useCallback((direction) => {
    const isNext = direction === 'next';
    
    if (period === 'day') {
      setCurrentDate(date => isNext ? addDays(date, 1) : subDays(date, 1));
    } else if (period === 'week') {
      setCurrentDate(date => isNext ? addWeeks(date, 1) : subWeeks(date, 1));
    } else if (period === 'month') {
      setCurrentDate(date => isNext ? addMonths(date, 1) : subMonths(date, 1));
    }
  }, [period]);

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter(a => a.status === 'COMPLETED').length;
    const inProgress = appointments.filter(a => a.status === 'IN_PROGRESS').length;
    const confirmed = appointments.filter(a => a.status === 'CONFIRMED').length;
    const pending = appointments.filter(a => a.status === 'PENDING').length;
    const canceled = appointments.filter(a => a.status === 'CANCELED').length;
    
    const totalEarnings = appointments
      .filter(a => a.status === 'COMPLETED')
      .reduce((sum, a) => sum + (a.totalAmount || 0), 0);
    
    const totalCommissions = appointments
      .filter(a => a.status === 'COMPLETED')
      .reduce((sum, a) => sum + (a.specialistCommission || 0), 0);

    return {
      total,
      completed,
      inProgress,
      confirmed,
      pending,
      canceled,
      totalEarnings,
      totalCommissions
    };
  }, [appointments]);

  // Formatear título de fecha
  const dateTitle = useMemo(() => {
    if (period === 'day') {
      return format(currentDate, "EEEE, d 'de' MMMM", { locale: es });
    } else if (period === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, 'd MMM', { locale: es })} - ${format(end, 'd MMM yyyy', { locale: es })}`;
    } else {
      return format(currentDate, "MMMM yyyy", { locale: es });
    }
  }, [currentDate, period]);

  // Handlers
  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedAppointment(null);
    loadAppointments(); // Recargar por si hubo cambios
  };

  const handleCreateSuccess = async (formData) => {
    try {
      console.log('📝 Creating appointment with data:', formData);
      console.log('📋 FormData specialistId:', formData.specialistId);
      console.log('👤 User specialistProfile:', user?.specialistProfile);
      
      const effectiveBusinessId = user?.businessId || business?.id;
      
      // Determinar el specialistId correcto
      // Para SPECIALIST y RECEPTIONIST_SPECIALIST, usar specialistProfile.id
      // Para otros roles, usar el specialistId del formulario o user.id
      let specialistId = formData.specialistId;
      
      if (!specialistId) {
        if (['SPECIALIST', 'RECEPTIONIST_SPECIALIST'].includes(user?.role) && user?.specialistProfile?.id) {
          specialistId = user.specialistProfile.id;
          console.log('✅ Using specialistProfile.id for SPECIALIST/RECEPTIONIST_SPECIALIST:', specialistId);
        } else {
          specialistId = user?.id;
          console.log('⚠️ Using user.id as fallback:', specialistId);
        }
      }
      
      if (!specialistId) {
        console.error('❌ No specialistId available');
        throw new Error('No se pudo determinar el especialista');
      }
      
      console.log('✅ Final specialistId:', specialistId);
      
      // Construir payload según lo que espera el backend
      // Convertir a ISO string sin forzar UTC para mantener la hora local
      const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`)
      const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`)
      
      const payload = {
        businessId: effectiveBusinessId,
        branchId: formData.branchId,
        specialistId: specialistId,
        serviceId: formData.serviceId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        notes: formData.notes || '',
        status: 'CONFIRMED'
      };

      // Si es cliente existente
      if (formData.clientId) {
        payload.clientId = formData.clientId;
      } else if (formData.clientEmail) {
        // Cliente nuevo con email
        payload.clientEmail = formData.clientEmail;
        payload.clientName = formData.clientName;
        payload.clientPhone = formData.clientPhone;
      } else {
        // Cliente nuevo sin email (solo nombre y teléfono)
        // Generar un email temporal
        const tempEmail = `temp_${Date.now()}@temp.com`;
        payload.clientEmail = tempEmail;
        payload.clientName = formData.clientName;
        payload.clientPhone = formData.clientPhone;
      }

      console.log('📤 Sending payload:', payload);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/specialists/appointments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error response:', result);
        throw new Error(result.error || 'Error al crear la cita');
      }

      console.log('✅ Appointment created:', result);
      setShowCreateModal(false);
      await loadAppointments();
      
    } catch (error) {
      console.error('❌ Error creating appointment:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">¡Hola, {user?.firstName}! 👋</h1>
              <p className="text-blue-100 opacity-90">
                {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold shadow-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Nueva Cita
              </button>
              {/* Botón Configuración para BUSINESS_SPECIALIST */}
              {user?.role === 'BUSINESS_SPECIALIST' && (
                <button
                  onClick={() => navigate('/business/profile')}
                  className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors flex items-center gap-2 border border-white/30"
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                  Configuración
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Main Content - CALENDARIO PRIMERO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column Principal - Agenda */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Toolbar */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  {/* Navegación de fechas */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigateDate('prev')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    
                    <button
                      onClick={goToToday}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Hoy
                    </button>
                    
                    <button
                      onClick={() => navigateDate('next')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    
                    <h2 className="text-lg font-semibold text-gray-900 ml-2 capitalize">
                      {dateTitle}
                    </h2>
                  </div>

                  {/* Toggle vista */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'list'
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('calendar')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'calendar'
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <CalendarIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Filtros de período */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setPeriod('day')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      period === 'day'
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Día
                  </button>
                  <button
                    onClick={() => setPeriod('week')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      period === 'week'
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Semana
                  </button>
                  <button
                    onClick={() => setPeriod('month')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      period === 'month'
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Mes
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : viewMode === 'list' ? (
                  /* Vista de Lista */
                  appointments.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No hay turnos programados</p>
                      <p className="text-gray-400 text-sm">Presiona "Nueva Cita" para crear uno</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {appointments.map(appointment => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          onClick={handleAppointmentClick}
                        />
                      ))}
                    </div>
                  )
                ) : (
                  /* Vista de Calendario */
                  <AppointmentCalendarView
                    appointments={appointments}
                    currentDate={currentDate}
                    period={period}
                    onAppointmentClick={handleAppointmentClick}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Caja Registradora */}
            <CashRegisterCard businessId={user?.businessId} />

            {/* Resumen de Comisiones */}
            <CommissionSummary specialistId={user?.id} businessId={user?.businessId} />
          </div>
        </div>

        {/* Stats Cards - Debajo del Calendario */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-medium text-gray-600">Total</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">turnos</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-gray-600">Completados</p>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-gray-500">turnos</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ClockIcon className="w-5 h-5 text-yellow-600" />
              <p className="text-sm font-medium text-gray-600">En Progreso</p>
            </div>
            <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
            <p className="text-xs text-gray-500">turnos</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-medium text-gray-600">Comisiones</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              ${stats.totalCommissions.toLocaleString('es-CO')}
            </p>
            <p className="text-xs text-gray-500">ganadas</p>
          </div>
        </div>

        {/* Quick Actions - Debajo de Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <button
            onClick={() => navigate('/specialist/commissions')}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all text-left"
          >
            <ChartBarIcon className="w-6 h-6 text-blue-600 mb-2" />
            <p className="text-sm font-semibold text-gray-900">Comisiones</p>
            <p className="text-xs text-gray-500">Gestionar pagos</p>
          </button>
          
          <button
            onClick={() => navigate('/specialist/cash-register')}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all text-left"
          >
            <BanknotesIcon className="w-6 h-6 text-green-600 mb-2" />
            <p className="text-sm font-semibold text-gray-900">Caja</p>
            <p className="text-xs text-gray-500">Abrir/cerrar turno</p>
          </button>
          
          <button
            onClick={() => navigate('/specialist/consents')}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all text-left"
          >
            <DocumentTextIcon className="w-6 h-6 text-purple-600 mb-2" />
            <p className="text-sm font-semibold text-gray-900">Consentimientos</p>
            <p className="text-xs text-gray-500">Formularios</p>
          </button>
          
          <button
            onClick={() => navigate('/clients')}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all text-left"
          >
            <UserGroupIcon className="w-6 h-6 text-pink-600 mb-2" />
            <p className="text-sm font-semibold text-gray-900">Clientes</p>
            <p className="text-xs text-gray-500">Ver lista</p>
          </button>
        </div>
      </div>

      {/* Modales */}
      {showCreateModal && (
        <CreateAppointmentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateSuccess}
          preselectedSpecialist={user?.id}
          services={services}
          branches={branches}
          specialists={specialists}
        />
      )}

      {showDetailsModal && selectedAppointment && (
        <AppointmentDetailsModal
          isOpen={showDetailsModal}
          appointment={selectedAppointment}
          businessId={user?.businessId}
          onClose={handleCloseDetails}
          onUpdate={loadAppointments}
        />
      )}
    </div>
  );
}
