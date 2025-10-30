import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar } from 'react-native-calendars';

// Redux
import { 
  logout,
  selectReceptionistAppointments,
  selectReceptionistStats,
  selectReceptionistFilters,
  selectReceptionistDashboardLoading,
  selectReceptionistDashboardError,
  selectReceptionistActionLoading,
  selectReceptionistViewMode,
  selectReceptionistSelectedAppointment
} from '@shared/store/reactNativeStore';
import {
  fetchReceptionistAppointments,
  fetchReceptionistStats,
  createAppointmentForSpecialist,
  updateAppointmentStatus,
  setReceptionistFilters,
  setReceptionistDate,
  setReceptionistViewMode,
  setReceptionistSelectedAppointment,
  clearReceptionistError
} from '@shared/store/reactNativeStore';

// Hooks y Componentes
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionButton, PermissionGuard } from '../../components/permissions';
import { AppointmentCreateModal, AppointmentDetailsModal } from '../../components/appointments';

// Utilidades
import { 
  formatDateColombia, 
  isToday as isTodayColombia, 
  isTomorrow as isTomorrowColombia,
  formatTimeColombia 
} from '../../utils/timezone';

// =====================================================
// COMPONENTE: STATS CARD
// =====================================================

const StatsCard = ({ title, value, subtitle, icon, color }) => (
  <View style={[styles.statsCard, { borderLeftColor: color }]}>
    <View style={styles.statsContent}>
      <View style={styles.statsText}>
        <Text style={styles.statsTitle}>{title}</Text>
        <Text style={[styles.statsValue, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.statsSubtitle}>{subtitle}</Text>}
      </View>
      <View style={[styles.statsIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
    </View>
  </View>
);

// =====================================================
// COMPONENTE: APPOINTMENT CARD
// =====================================================

const AppointmentCard = ({ appointment, onPress, onActionPress }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#f59e0b';
      case 'CONFIRMED': return '#10b981';
      case 'IN_PROGRESS': return '#3b82f6';
      case 'COMPLETED': return '#8b5cf6';
      case 'CANCELLED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'CONFIRMED': return 'Confirmado';
      case 'IN_PROGRESS': return 'En Progreso';
      case 'COMPLETED': return 'Completado';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  const getOriginIcon = (origin) => {
    switch (origin) {
      case 'online': return 'globe-outline';
      case 'business': return 'business-outline';
      case 'specialist': return 'person-outline';
      default: return 'help-circle-outline';
    }
  };

  return (
    <TouchableOpacity style={styles.appointmentCard} onPress={() => onPress(appointment)}>
      {/* Header con estado y horario */}
      <View style={styles.appointmentHeader}>
        <View style={styles.appointmentTime}>
          <Ionicons name="time-outline" size={16} color="#6b7280" />
          <Text style={styles.appointmentTimeText}>
            {appointment.startTime} - {appointment.endTime}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
          <Text style={styles.statusText}>{getStatusText(appointment.status)}</Text>
        </View>
      </View>

      {/* Cliente */}
      <View style={styles.appointmentRow}>
        <Ionicons name="person" size={18} color="#6b7280" />
        <Text style={styles.appointmentClientName}>{appointment.clientName}</Text>
      </View>

      {/* Especialista */}
      <View style={styles.appointmentRow}>
        <Ionicons name="medical" size={18} color="#6b7280" />
        <Text style={styles.appointmentSpecialistName}>{appointment.specialistName}</Text>
      </View>

      {/* Servicio */}
      <View style={styles.appointmentRow}>
        <Ionicons name="cut" size={18} color="#6b7280" />
        <Text style={styles.appointmentServiceName}>{appointment.serviceName}</Text>
      </View>

      {/* Sucursal + Origen */}
      <View style={styles.appointmentFooter}>
        <View style={styles.branchContainer}>
          <View style={[styles.branchBadge, { backgroundColor: appointment.branchColor || '#8b5cf6' }]}>
            <Ionicons name="business" size={14} color="#ffffff" />
            <Text style={styles.branchText}>{appointment.branchName}</Text>
          </View>
          
          <View style={styles.originBadge}>
            <Ionicons name={getOriginIcon(appointment.origin)} size={14} color="#6b7280" />
            <Text style={styles.originText}>
              {appointment.origin === 'online' ? 'Online' :
               appointment.origin === 'business' ? 'Recepción' : 'Especialista'}
            </Text>
          </View>
        </View>

        {/* Precio */}
        <Text style={styles.appointmentPrice}>
          ${appointment.price?.toLocaleString() || '0'}
        </Text>
      </View>

      {/* Acciones rápidas para recepcionista */}
      {(appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') && (
        <View style={styles.quickActions}>
          {appointment.status === 'PENDING' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => onActionPress(appointment.id, 'CONFIRMED')}
            >
              <Ionicons name="checkmark" size={16} color="#ffffff" />
              <Text style={styles.actionButtonText}>Confirmar</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => onActionPress(appointment.id, 'CANCELLED')}
          >
            <Ionicons name="close" size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const ReceptionistDashboard = ({ navigation }) => {
  // Redux
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const businessId = useSelector((state) => state.auth.businessId);
  
  // Redux state receptionist dashboard
  const appointments = useSelector(selectReceptionistAppointments);
  const stats = useSelector(selectReceptionistStats);
  const filters = useSelector(selectReceptionistFilters);
  const loading = useSelector(selectReceptionistDashboardLoading);
  const error = useSelector(selectReceptionistDashboardError);
  const actionLoading = useSelector(selectReceptionistActionLoading);
  const viewMode = useSelector(selectReceptionistViewMode);
  const selectedAppointment = useSelector(selectReceptionistSelectedAppointment);

  console.log('👩‍💼 Receptionist Dashboard - User:', user);
  console.log('👩‍💼 Receptionist Dashboard - BusinessId:', businessId);
  console.log('👩‍💼 Receptionist Dashboard - Appointments:', appointments.length);
  console.log('👩‍💼 Receptionist Dashboard - Stats:', stats);

  // Estados locales
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('agenda');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
  });
  const [createAppointmentDate, setCreateAppointmentDate] = useState(null);

  // =====================================================
  // FUNCIONES DE NAVEGACIÓN POR PERÍODO
  // =====================================================

  const handlePrevPeriod = useCallback(() => {
    const currentDate = new Date(selectedDate);
    let newDate;
    
    switch (filters.period) {
      case 'day':
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 1);
        break;
      case 'week':
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        break;
      case 'month':
        newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() - 1);
        break;
      default:
        newDate = currentDate;
    }
    
    const newDateString = newDate.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
    setSelectedDate(newDateString);
    dispatch(setReceptionistDate(newDateString));
  }, [selectedDate, filters.period, dispatch]);

  const handleNextPeriod = useCallback(() => {
    const currentDate = new Date(selectedDate);
    let newDate;
    
    switch (filters.period) {
      case 'day':
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 1);
        break;
      case 'week':
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        break;
      case 'month':
        newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + 1);
        break;
      default:
        newDate = currentDate;
    }
    
    const newDateString = newDate.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
    setSelectedDate(newDateString);
    dispatch(setReceptionistDate(newDateString));
  }, [selectedDate, filters.period, dispatch]);

  const formatPeriodLabel = useCallback(() => {
    const date = new Date(selectedDate);
    
    switch (filters.period) {
      case 'day':
        return date.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'America/Bogota'
        });
      case 'week':
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return `${startOfWeek.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'America/Bogota' })} - ${endOfWeek.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Bogota' })}`;
      case 'month':
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          timeZone: 'America/Bogota'
        });
      default:
        return selectedDate;
    }
  }, [selectedDate, filters.period]);

  // =====================================================
  // FUNCIÓN PARA CAMBIAR PERÍODO
  // =====================================================

  const handlePeriodChange = useCallback((newPeriod) => {
    dispatch(setReceptionistFilters({ ...filters, period: newPeriod }));
  }, [dispatch, filters]);

  // 🛡️ VALIDACIÓN DE ACCESO POR ROL
  useEffect(() => {
    if (user && user.role) {
      const userRole = user.role.toLowerCase();
      // Solo permitir acceso a receptionist y receptionist_specialist
      if (userRole !== 'receptionist' && userRole !== 'receptionist_specialist') {
        Alert.alert(
          'Acceso Denegado',
          'No tienes permisos para acceder a esta sección. Serás redirigido a tu dashboard.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Redirigir al dashboard correcto según el rol
                const roleToRoute = {
                  'business': 'DashboardBusiness',
                  'specialist': 'DashboardSpecialist'
                };
                const correctRoute = roleToRoute[userRole];
                if (correctRoute) {
                  navigation.replace(correctRoute);
                } else {
                  navigation.navigate('Welcome');
                }
              }
            }
          ]
        );
        return;
      }
    }
  }, [user, navigation]);

  // Cargar datos iniciales
  useEffect(() => {
    if (user && businessId) {
      loadDashboardData();
    }
  }, [user, businessId, filters.date, filters.period, filters.branchId, filters.specialistId, filters.status]);

  const loadDashboardData = useCallback(async () => {
    try {
      console.log('👩‍💼 loadDashboardData - Parámetros:', {
        date: filters.date,
        period: filters.period,
        branchId: filters.branchId,
        specialistId: filters.specialistId,
        status: filters.status,
        businessId: businessId,
        user: user?.id,
        userRole: user?.role
      });
      
      await dispatch(fetchReceptionistAppointments({
        businessId: businessId,
        date: filters.date,
        period: filters.period,
        branchId: filters.branchId,
        specialistId: filters.specialistId,
        status: filters.status
      })).unwrap();
      
      console.log('✅ loadDashboardData - Datos cargados exitosamente');
    } catch (error) {
      console.error('❌ Error loading receptionist dashboard:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del dashboard');
    }
  }, [dispatch, businessId, filters]);

  // =====================================================
  // EFECTO PARA RECARGAR DATOS AL CAMBIAR FECHA
  // =====================================================
  useEffect(() => {
    if (businessId && user && selectedDate) {
      loadDashboardData();
    }
  }, [selectedDate, loadDashboardData, businessId, user]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: () => dispatch(logout())
        }
      ]
    );
  }, [dispatch]);

  const handleAppointmentPress = useCallback((appointment) => {
    dispatch(setReceptionistSelectedAppointment(appointment));
    setShowDetailsModal(true);
  }, [dispatch]);

  const handleCreateAppointment = useCallback((selectedDateForAppointment = null) => {
    if (selectedDateForAppointment) {
      console.log('📅 Creating appointment for date:', selectedDateForAppointment);
      setCreateAppointmentDate(selectedDateForAppointment);
    } else {
      setCreateAppointmentDate(selectedDate);
    }
    setShowCreateModal(true);
  }, [selectedDate]);

  const handleDayPress = useCallback((day) => {
    console.log('📅 Day pressed:', day.dateString);
    setSelectedDate(day.dateString);
    dispatch(setReceptionistDate(day.dateString));
    
    // Abrir modal de crear appointment para esta fecha
    handleCreateAppointment(day.dateString);
  }, [dispatch, handleCreateAppointment]);

  const handleAppointmentAction = useCallback(async (appointmentId, newStatus) => {
    try {
      await dispatch(updateAppointmentStatus({
        appointmentId,
        status: newStatus
      })).unwrap();
      
      // Recargar datos
      await loadDashboardData();
      
      Alert.alert(
        'Éxito',
        `Cita ${newStatus === 'CONFIRMED' ? 'confirmada' : 'cancelada'} correctamente`
      );
    } catch (error) {
      console.error('❌ Error updating appointment:', error);
      Alert.alert('Error', 'No se pudo actualizar la cita');
    }
  }, [dispatch, loadDashboardData]);

  // Formatear appointments para mostrar
  const formattedAppointments = useMemo(() => {
    if (!appointments || !Array.isArray(appointments)) {
      console.log('🔍 formattedAppointments - No appointments array:', appointments);
      return [];
    }

    console.log('🔍 formattedAppointments - Raw appointments:', appointments.length);
    console.log('🔍 formattedAppointments - Is array?', Array.isArray(appointments));

    return appointments.map(appointment => {
      // Validar campos requeridos básicos
      if (!appointment || !appointment.id) {
        console.log('❌ Invalid appointment: missing id', appointment?.id);
        return null;
      }

      console.log('✅ Processing appointment:', appointment.id);
      
      // Formatear los datos al formato esperado por el componente
      return {
        ...appointment,
        // Crear clientName a partir de client.firstName y client.lastName
        clientName: appointment.client 
          ? `${appointment.client.firstName || ''} ${appointment.client.lastName || ''}`.trim()
          : 'Cliente Desconocido',
        // Crear specialistName a partir de specialist.firstName y specialist.lastName  
        specialistName: appointment.specialist
          ? `${appointment.specialist.firstName || ''} ${appointment.specialist.lastName || ''}`.trim()
          : 'Especialista Desconocido',
        // Asegurar serviceName
        serviceName: appointment.service?.name || 'Servicio Desconocido',
        // Formatear fechas de forma segura
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        date: appointment.startTime // Para compatibilidad
      };
    }).filter(Boolean); // Remover elementos null
  }, [appointments]);

  // Filtrar appointments por fecha seleccionada para vista calendario
  const appointmentsForSelectedDate = useMemo(() => {
    if (viewMode !== 'calendar') return formattedAppointments;

    return formattedAppointments.filter(appointment => {
      try {
        const appointmentDate = new Date(appointment.date);
        const appointmentDateString = appointmentDate.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
        console.log('🗓️ Comparing dates:', { appointmentDateString, selectedDate });
        return appointmentDateString === selectedDate;
      } catch (error) {
        console.log('❌ Error filtering appointment by date:', appointment.id);
        return false;
      }
    });
  }, [formattedAppointments, selectedDate, viewMode]);

  // Dates marcadas en el calendario
  const markedDates = useMemo(() => {
    const marked = {};
    
    // Marcar fecha seleccionada
    marked[selectedDate] = {
      selected: true,
      selectedColor: '#8b5cf6',
      selectedTextColor: '#ffffff'
    };

    // Marcar fechas con appointments
    formattedAppointments.forEach(appointment => {
      try {
        const date = new Date(appointment.date);
        const dateString = date.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
        
        if (!marked[dateString]) {
          marked[dateString] = {};
        }
        
        if (dateString !== selectedDate) {
          marked[dateString].marked = true;
          marked[dateString].dotColor = '#8b5cf6';
        }
      } catch (error) {
        console.log('❌ Error marking date for appointment:', appointment.id);
      }
    });

    return marked;
  }, [formattedAppointments, selectedDate]);

  // Loading state
  if (!user || !businessId) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando datos de recepción...</Text>
      </SafeAreaView>
    );
  }

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando turnos...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con branding */}
      <LinearGradient
        colors={['#8b5cf6', '#7c3aed']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerUser}>
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>¡Hola! 👋</Text>
              <Text style={styles.userName}>{user?.firstName || 'Recepcionista'}</Text>
              <Text style={styles.userRole}>
                {user?.role === 'RECEPTIONIST_SPECIALIST' ? 'Recepcionista-Especialista' : 'Recepcionista'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsContent}
        >
          <StatsCard
            title="Turnos Hoy"
            value={`${stats?.total || 0}`}
            subtitle={`${stats?.pending || 0} pendientes`}
            icon="calendar"
            color="#10b981"
          />
          <StatsCard
            title="Confirmados"
            value={`${stats?.confirmed || 0}`}
            subtitle="Listas para atender"
            icon="checkmark-circle"
            color="#3b82f6"
          />
          <StatsCard
            title="En Progreso"
            value={`${stats?.inProgress || 0}`}
            subtitle="Atendiendo ahora"
            icon="time"
            color="#f59e0b"
          />
          <StatsCard
            title="Completados"
            value={`${stats?.completed || 0}`}
            subtitle="Finalizados hoy"
            icon="checkmark-done"
            color="#8b5cf6"
          />
        </ScrollView>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'agenda' && styles.activeTab]}
          onPress={() => setActiveTab('agenda')}
        >
          <Ionicons 
            name="calendar-outline" 
            size={20} 
            color={activeTab === 'agenda' ? '#8b5cf6' : '#6b7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'agenda' && styles.activeTabText]}>
            Agenda
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
          onPress={() => setActiveTab('reports')}
        >
          <Ionicons 
            name="bar-chart-outline" 
            size={20} 
            color={activeTab === 'reports' ? '#8b5cf6' : '#6b7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>
            Reportes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'agenda' && (
          <>
            {/* Controls */}
            <View style={styles.controlsContainer}>
              {/* View Mode Selector */}
              <View style={styles.viewModeContainer}>
                <TouchableOpacity
                  style={[styles.viewModeButton, viewMode === 'list' && styles.activeViewMode]}
                  onPress={() => dispatch(setReceptionistViewMode('list'))}
                >
                  <Ionicons 
                    name="list" 
                    size={18} 
                    color={viewMode === 'list' ? '#ffffff' : '#6b7280'} 
                  />
                  <Text style={[styles.viewModeText, viewMode === 'list' && styles.activeViewModeText]}>
                    Lista
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.viewModeButton, viewMode === 'calendar' && styles.activeViewMode]}
                  onPress={() => dispatch(setReceptionistViewMode('calendar'))}
                >
                  <Ionicons 
                    name="calendar" 
                    size={18} 
                    color={viewMode === 'calendar' ? '#ffffff' : '#6b7280'} 
                  />
                  <Text style={[styles.viewModeText, viewMode === 'calendar' && styles.activeViewModeText]}>
                    Calendario
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Create Button */}
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => handleCreateAppointment()}
              >
                <Ionicons name="add" size={20} color="#ffffff" />
                <Text style={styles.createButtonText}>Crear Turno</Text>
              </TouchableOpacity>
            </View>

            {/* Period Filter Tabs */}
            <View style={styles.periodTabsContainer}>
              <TouchableOpacity
                style={[styles.periodTab, filters.period === 'day' && styles.activePeriodTab]}
                onPress={() => handlePeriodChange('day')}
              >
                <Text style={[styles.periodTabText, filters.period === 'day' && styles.activePeriodTabText]}>
                  Día
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.periodTab, filters.period === 'week' && styles.activePeriodTab]}
                onPress={() => handlePeriodChange('week')}
              >
                <Text style={[styles.periodTabText, filters.period === 'week' && styles.activePeriodTabText]}>
                  Semana
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.periodTab, filters.period === 'month' && styles.activePeriodTab]}
                onPress={() => handlePeriodChange('month')}
              >
                <Text style={[styles.periodTabText, filters.period === 'month' && styles.activePeriodTabText]}>
                  Mes
                </Text>
              </TouchableOpacity>
            </View>

            {/* Period Navigation */}
            <View style={styles.periodNavigationContainer}>
              <TouchableOpacity
                style={styles.periodNavButton}
                onPress={handlePrevPeriod}
              >
                <Ionicons name="chevron-back" size={20} color="#6b7280" />
              </TouchableOpacity>
              
              <View style={styles.periodInfoContainer}>
                <Text style={styles.periodInfoText}>
                  {formatPeriodLabel()}
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.periodNavButton}
                onPress={handleNextPeriod}
              >
                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Calendar View - Solo si está habilitado */}
            {viewMode === 'calendar' && (
              <View style={styles.calendarContainer}>
                <Calendar
                  current={selectedDate}
                  onDayPress={handleDayPress}
                  markedDates={markedDates}
                  theme={{
                    calendarBackground: '#ffffff',
                    textSectionTitleColor: '#6b7280',
                    selectedDayBackgroundColor: '#3b82f6',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#3b82f6',
                    dayTextColor: '#374151',
                    textDisabledColor: '#d1d5db',
                    dotColor: '#3b82f6',
                    selectedDotColor: '#ffffff',
                    arrowColor: '#3b82f6',
                    monthTextColor: '#374151',
                    indicatorColor: '#3b82f6',
                    textDayFontFamily: 'System',
                    textMonthFontFamily: 'System',
                    textDayHeaderFontFamily: 'System',
                    textDayFontSize: 16,
                    textMonthFontSize: 18,
                    textDayHeaderFontSize: 14
                  }}
                  monthFormat={'MMMM yyyy'}
                  firstDay={1}
                  enableSwipeMonths={true}
                />
              </View>
            )}

            {/* Appointments Header */}
            <View style={styles.agendaHeader}>
              <Text style={styles.agendaTitle}>
                {viewMode === 'calendar' ? `Turnos del ${selectedDate}` : 'Todos los Turnos'}
              </Text>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => console.log('TODO: Abrir filtros')}
              >
                <Ionicons name="filter-outline" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Appointments List */}
            {(viewMode === 'calendar' ? appointmentsForSelectedDate : formattedAppointments).length > 0 ? (
              <FlatList
                data={viewMode === 'calendar' ? appointmentsForSelectedDate : formattedAppointments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <AppointmentCard
                    appointment={item}
                    onPress={handleAppointmentPress}
                    onActionPress={handleAppointmentAction}
                  />
                )}
                contentContainerStyle={styles.appointmentsList}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={['#8b5cf6']}
                    tintColor="#8b5cf6"
                  />
                }
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
                <Text style={styles.emptyStateTitle}>
                  {viewMode === 'calendar' ? 'Sin turnos para esta fecha' : 'Sin turnos registrados'}
                </Text>
                <Text style={styles.emptyStateSubtitle}>
                  {viewMode === 'calendar' 
                    ? 'Selecciona otra fecha o crea un nuevo turno'
                    : 'Crea el primer turno para empezar'
                  }
                </Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => handleCreateAppointment()}
                >
                  <Text style={styles.emptyStateButtonText}>Crear Turno</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {activeTab === 'reports' && (
          <View style={styles.reportsContainer}>
            <Text style={styles.reportsTitle}>Reportes y Estadísticas</Text>
            <Text style={styles.reportsSubtitle}>Próximamente...</Text>
          </View>
        )}
      </View>

      {/* Modals */}
      <AppointmentCreateModal
        visible={showCreateModal}
        preselectedDate={createAppointmentDate}
        isReceptionist={true}
        onClose={() => {
          setShowCreateModal(false);
          setCreateAppointmentDate(null);
        }}
        onSuccess={() => {
          setShowCreateModal(false);
          setCreateAppointmentDate(null);
          loadDashboardData(); // Recargar datos después de crear
        }}
      />

      <AppointmentDetailsModal
        visible={showDetailsModal}
        appointment={selectedAppointment}
        isReceptionist={true}
        onClose={() => {
          setShowDetailsModal(false);
          dispatch(setReceptionistSelectedAppointment(null));
        }}
        onEdit={() => {
          // TODO: Navegar a edición
        }}
        onCancel={() => handleAppointmentAction(selectedAppointment?.id, 'CANCELLED')}
        onConfirm={() => handleAppointmentAction(selectedAppointment?.id, 'CONFIRMED')}
      />
    </SafeAreaView>
  );
};

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },

  // Header
  header: {
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  userInfo: {
    flex: 1,
  },
  
  greeting: {
    fontSize: 14,
    color: '#e0e7ff',
    marginBottom: 2,
  },
  
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  
  userRole: {
    fontSize: 14,
    color: '#c7d2fe',
  },
  
  logoutButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },

  // Stats
  statsWrapper: {
    paddingVertical: 16,
  },
  
  statsContent: {
    paddingHorizontal: 20,
  },
  
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    width: 160,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statsText: {
    flex: 1,
  },
  
  statsTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  
  statsSubtitle: {
    fontSize: 11,
    color: '#9ca3af',
  },
  
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  
  activeTab: {
    backgroundColor: '#f3f4f6',
  },
  
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 8,
  },
  
  activeTabText: {
    color: '#8b5cf6',
    fontWeight: '600',
  },

  // Period Tabs
  periodTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    marginHorizontal: 0,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  
  periodTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  
  activePeriodTab: {
    backgroundColor: '#8b5cf6',
  },
  
  periodTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  
  activePeriodTabText: {
    color: '#ffffff',
    fontWeight: '600',
  },

  // Period Navigation
  periodNavigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  periodNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  periodInfoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  periodInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Controls
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 2,
  },
  
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  
  activeViewMode: {
    backgroundColor: '#8b5cf6',
  },
  
  viewModeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 4,
  },
  
  activeViewModeText: {
    color: '#ffffff',
  },
  
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  
  createButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },

  // Calendar
  calendarContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },

  // Agenda
  agendaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  
  agendaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  
  filterButton: {
    padding: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  // Appointments
  appointmentsList: {
    paddingBottom: 20,
  },
  
  appointmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  appointmentTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  appointmentClientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
    flex: 1,
  },
  
  appointmentSpecialistName: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
  
  appointmentServiceName: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
  
  appointmentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  
  branchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  branchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  
  branchText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 4,
  },
  
  originBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  
  originText: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 2,
  },
  
  appointmentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  
  confirmButton: {
    backgroundColor: '#10b981',
  },
  
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 4,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  
  emptyStateButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  
  emptyStateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Reports
  reportsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  reportsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  
  reportsSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },

  // =====================================================
  // PERIOD NAVIGATION STYLES
  // =====================================================
  periodNavigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  periodNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },

  periodInfoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  periodInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
});

export default ReceptionistDashboard;