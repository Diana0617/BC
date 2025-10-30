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
  selectSpecialistAppointments,
  selectSpecialistStats,
  selectSpecialistFilters,
  selectSpecialistDashboardLoading,
  selectSpecialistDashboardError,
  selectSpecialistActionLoading
} from '@shared/store/reactNativeStore';
import {
  fetchSpecialistAppointments,
  confirmAppointment,
  startAppointment,
  completeAppointment,
  cancelAppointment,
  setFilters,
  clearError
} from '@shared/store/slices/specialistDashboardSlice';
import { fetchUserPermissions } from '@shared/store/slices/permissionsSlice';

// Hooks y Componentes
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionButton, PermissionGuard } from '../../components/permissions';
import { AppointmentCreateModal, AppointmentDetailsModal } from '../../components/appointments';
import PaymentFlowManager from '../../components/payment/PaymentFlowManager';

// Utilidades
import { 
  formatDateColombia, 
  isToday as isTodayColombia, 
  isTomorrow as isTomorrowColombia,
  formatTimeColombia,
  toColombiaTime,
  getTodayColombia
} from '../../utils/timezone';

const { width: screenWidth } = Dimensions.get('window');

// =====================================================
// COMPONENTES AUXILIARES
// =====================================================

// Card de Estadística Mejorada
const StatsCard = ({ title, value, subtitle, icon, color = '#8b5cf6' }) => (
  <View style={[styles.statsCard, { borderLeftColor: color }]}>
    <View style={styles.statsCardContent}>
      <View style={styles.statsCardHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statsCardTitle}>{title}</Text>
      </View>
      <Text style={styles.statsCardValue}>{value}</Text>
      {subtitle && <Text style={styles.statsCardSubtitle}>{subtitle}</Text>}
    </View>
  </View>
);

// Card de Cita Mejorada
const AppointmentCard = ({ appointment, onPress, onAction, hasCompletePermission, hasCloseWithPaymentPermission }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: '#9ca3af',
      confirmed: '#3b82f6',
      in_progress: '#f59e0b',
      completed: '#10b981',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      in_progress: 'En Progreso',
      completed: 'Completado',
      cancelled: 'Cancelado',
    };
    return texts[status] || status;
  };

  const getOriginIcon = (origin) => {
    const icons = {
      online: 'globe-outline',
      business: 'business-outline',
      specialist: 'person-outline',
    };
    return icons[origin] || 'help-circle-outline';
  };

  return (
    <TouchableOpacity 
      style={styles.appointmentCard}
      onPress={() => onPress(appointment)}
      activeOpacity={0.8}
    >
      {/* Header del turno */}
      <View style={styles.appointmentHeader}>
        <View style={styles.appointmentTime}>
          <Ionicons name="time-outline" size={20} color="#3b82f6" />
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
              {appointment.origin === 'online' ? 'Online' : appointment.origin === 'business' ? 'Business' : 'Auto'}
            </Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>${appointment.price?.toLocaleString() || '0'}</Text>
          <Text style={styles.commissionText}>💰 {appointment.commissionPercentage || 0}%</Text>
        </View>
      </View>

      {/* Acciones según estado y permisos */}
      {hasCompletePermission && (appointment.status === 'pending' || appointment.status === 'confirmed') && (
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onAction(appointment, 'start')}
        >
          <Ionicons name="play" size={16} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.actionButtonText}>Iniciar Turno</Text>
        </TouchableOpacity>
      )}

      {hasCloseWithPaymentPermission && appointment.status === 'in_progress' && (
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#8b5cf6' }]}
          onPress={() => onAction(appointment, 'complete')}
        >
          <Ionicons name="cash-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.actionButtonText}>Cerrar y Cobrar</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const SpecialistDashboardV2 = ({ navigation }) => {
  // Redux
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const businessId = useSelector((state) => state.auth.businessId);
  
  // Redux state specialist dashboard
  const appointments = useSelector(selectSpecialistAppointments);
  const stats = useSelector(selectSpecialistStats);
  const filters = useSelector(selectSpecialistFilters);
  const loading = useSelector(selectSpecialistDashboardLoading);
  const error = useSelector(selectSpecialistDashboardError);
  const actionLoading = useSelector(selectSpecialistActionLoading);

  // 🔐 Hook de permisos
  const { hasPermission } = usePermissions();

  console.log('📱 Specialist Dashboard V2 - User:', user);
  console.log('📱 Specialist Dashboard V2 - BusinessId:', businessId);
  console.log('📱 Specialist Dashboard V2 - Appointments:', appointments?.length || 0);
  console.log('📱 Specialist Dashboard V2 - Stats:', stats);
  
  // Estados locales
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('agenda');
  const [viewMode, setViewMode] = useState('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    return getTodayColombia(); // Usar fecha actual de Colombia
  });
  const [createAppointmentDate, setCreateAppointmentDate] = useState(null);
  
  // Estados para flujo de pago
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [appointmentForPayment, setAppointmentForPayment] = useState(null);

  // 🛡️ VALIDACIÓN DE ACCESO POR ROL
  useEffect(() => {
    if (user && user.role) {
      const userRole = user.role.toLowerCase();
      if (userRole !== 'specialist') {
        Alert.alert(
          'Acceso Denegado',
          'No tienes permisos para acceder a esta sección.',
          [
            {
              text: 'OK',
              onPress: () => {
                const roleToRoute = {
                  'business': 'DashboardBusiness',
                  'receptionist': 'DashboardReceptionist',
                };
                const correctRoute = roleToRoute[userRole];
                if (correctRoute) {
                  navigation.replace(correctRoute);
                } else {
                  navigation.navigate('Welcome');
                }
              },
            },
          ]
        );
        return;
      }
    }
  }, [user, navigation]);

  // 🔑 CARGAR PERMISOS DEL USUARIO
  useEffect(() => {
    if (user?.id && businessId) {
      console.log('🔑 SpecialistDashboardV2 - Cargando permisos para usuario:', user.id, 'businessId:', businessId);
      dispatch(fetchUserPermissions({ userId: user.id, businessId }));
    }
  }, [user?.id, businessId, dispatch]);

  // Cargar datos iniciales
  useEffect(() => {
    if (user && businessId) {
      loadDashboardData();
    }
  }, [user, businessId, filters.date, filters.period]);

  const loadDashboardData = async () => {
    try {
      console.log('📱 loadDashboardData - Parámetros:', {
        date: filters.date,
        period: filters.period,
        branchId: filters.branchId,
        status: filters.status,
        businessId: businessId,
        user: user?.id,
        userRole: user?.role
      });
      
      await dispatch(fetchSpecialistAppointments({
        date: filters.date,
        period: filters.period,
        branchId: filters.branchId,
        status: filters.status,
        businessId: businessId
      })).unwrap();
      
      console.log('✅ loadDashboardData - Datos cargados exitosamente');
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Formatear appointments de forma segura
  const formattedAppointments = useMemo(() => {
    console.log('🔍 formattedAppointments - Raw appointments:', appointments);
    console.log('🔍 formattedAppointments - Is array?', Array.isArray(appointments));
    
    if (!appointments || !Array.isArray(appointments)) {
      console.log('❌ formattedAppointments - No appointments or not array');
      return [];
    }

    const filtered = appointments.filter(appointment => {
      console.log('🔍 Checking appointment:', appointment.id, {
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        clientName: appointment.clientName,
        serviceName: appointment.serviceName
      });
      
      // Los datos del specialist dashboard ya vienen procesados
      // Validar que tenga los campos necesarios
      if (!appointment?.date || !appointment?.startTime || !appointment?.endTime) {
        console.log('❌ Missing date, startTime or endTime for:', appointment.id);
        return false;
      }
      
      // Validar que la fecha principal (date) sea válida
      const appointmentDate = new Date(appointment.date);
      if (isNaN(appointmentDate.getTime())) {
        console.log('❌ Invalid date for:', appointment.id);
        return false;
      }

      console.log('✅ Appointment valid:', appointment.id);
      return true;
    });
    
    console.log('✅ formattedAppointments - Filtered count:', filtered.length);
    return filtered;
  }, [appointments]);

  const todaysAppointments = useMemo(() => {
    if (viewMode !== 'calendar') return formattedAppointments;
    
    return formattedAppointments.filter(appointment => {
      try {
        // Usar el campo 'date' que tiene la fecha ISO completa
        const appointmentDate = new Date(appointment.date);
        const appointmentDateString = appointmentDate.toLocaleDateString('en-CA', { 
          timeZone: 'America/Bogota' 
        });
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
        // Usar el campo 'date' que tiene la fecha ISO completa
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
        // Ignorar fechas inválidas
        console.log('❌ Error marking date for appointment:', appointment.id);
      }
    });

    return marked;
  }, [formattedAppointments, selectedDate]);

  // Handlers
  const handleAppointmentPress = useCallback((appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  }, []);

  const handleAppointmentAction = useCallback(async (appointment, action) => {
    try {
      if (action === 'confirm') {
        Alert.alert(
          'Confirmar Turno',
          `¿Deseas confirmar el turno de ${appointment.clientName}?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Confirmar', 
              onPress: async () => {
                try {
                  await dispatch(confirmAppointment(appointment.id)).unwrap();
                  Alert.alert('Éxito', 'Turno confirmado correctamente');
                } catch (error) {
                  Alert.alert('Error', error || 'No se pudo confirmar el turno');
                }
              }
            },
          ]
        );
      } else if (action === 'start') {
        // Validar permiso para completar citas
        if (!hasPermission('appointments.complete')) {
          Alert.alert('Sin Permiso', 'No tienes permiso para iniciar turnos');
          return;
        }

        Alert.alert(
          'Iniciar Turno',
          `¿Deseas iniciar el turno de ${appointment.clientName}?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Iniciar', 
              onPress: async () => {
                try {
                  await dispatch(startAppointment(appointment.id)).unwrap();
                  Alert.alert('Éxito', 'Turno iniciado');
                } catch (error) {
                  Alert.alert('Error', error || 'No se pudo iniciar el turno');
                }
              }
            },
          ]
        );
      } else if (action === 'complete') {
        // Validar permiso para cerrar con pago
        if (!hasPermission('appointments.close_with_payment')) {
          Alert.alert('Sin Permiso', 'No tienes permiso para cerrar turnos y cobrar');
          return;
        }

        // Abrir modal de pago
        setAppointmentForPayment(appointment);
        setShowPaymentModal(true);
      } else if (action === 'cancel') {
        Alert.prompt(
          'Cancelar Turno',
          `Indica el motivo de cancelación para ${appointment.clientName}:`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Confirmar Cancelación', 
              style: 'destructive',
              onPress: async (reason) => {
                try {
                  await dispatch(cancelAppointment({ 
                    appointmentId: appointment.id, 
                    reason: reason || 'Sin motivo especificado' 
                  })).unwrap();
                  Alert.alert('Éxito', 'Turno cancelado correctamente');
                  await loadDashboardData(); // Refrescar stats
                } catch (error) {
                  Alert.alert('Error', error || 'No se pudo cancelar el turno');
                }
              }
            },
          ],
          'plain-text'
        );
      }
    } catch (error) {
      console.error('Error handling appointment action:', error);
    }
  }, [dispatch, loadDashboardData, hasPermission, setAppointmentForPayment, setShowPaymentModal]);

  // Handler para pago exitoso
  const handlePaymentSuccess = useCallback(async (paymentData) => {
    console.log('💰 Pago exitoso:', paymentData);

    try {
      // Completar el turno
      if (appointmentForPayment) {
        await dispatch(completeAppointment(appointmentForPayment.id)).unwrap();
        Alert.alert('✅ Turno Cerrado', 'El turno ha sido completado y el pago registrado exitosamente');
        await loadDashboardData(); // Refrescar stats
      }
    } catch (error) {
      console.error('Error al completar turno:', error);
      Alert.alert('Error', 'Hubo un problema al completar el turno');
    } finally {
      // Cerrar modal
      setShowPaymentModal(false);
      setAppointmentForPayment(null);
    }
  }, [appointmentForPayment, dispatch, loadDashboardData]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: () => dispatch(logout()) }
      ]
    );
  }, [dispatch]);

  const handleCreateAppointment = useCallback((selectedDateForAppointment = null) => {
    // Si se pasa una fecha específica (del calendario), usarla
    if (selectedDateForAppointment) {
      console.log('📅 Creating appointment for date:', selectedDateForAppointment);
      setCreateAppointmentDate(selectedDateForAppointment);
    } else {
      // Si no se pasa fecha, usar la fecha actualmente seleccionada
      setCreateAppointmentDate(selectedDate);
    }
    setShowCreateModal(true);
  }, [selectedDate]);

  const handleDayPress = useCallback((day) => {
    console.log('📅 Day pressed:', day.dateString);
    setSelectedDate(day.dateString);
    
    // Abrir modal de crear appointment para esta fecha
    handleCreateAppointment(day.dateString);
  }, [handleCreateAppointment]);

  // Loading state
  if (!user || !businessId) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando datos del especialista...</Text>
      </SafeAreaView>
    );
  }

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Cargando dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#3b82f6', '#1e40af']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>¡Hola, {user?.firstName}! 👋</Text>
            <Text style={styles.headerSubtitle}>
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'America/Bogota'
              })}
            </Text>
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
            value={`${stats?.completed || 0}/${stats?.total || 0}`}
            subtitle={`${stats?.inProgress || 0} en progreso`}
            icon="calendar"
            color="#10b981"
          />
          <StatsCard
            title="Ingresos Hoy"
            value={`$${((stats?.totalEarnings || 0) / 1000).toFixed(0)}K`}
            subtitle="Total facturado"
            icon="cash"
            color="#8b5cf6"
          />
          <StatsCard
            title="Comisiones"
            value={`$${((stats?.totalCommissions || 0) / 1000).toFixed(0)}K`}
            subtitle={`$${((stats?.pendingCommissions || 0) / 1000).toFixed(0)}K pendientes`}
            icon="wallet"
            color="#f59e0b"
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
          style={[styles.tab, activeTab === 'commissions' && styles.activeTab]}
          onPress={() => setActiveTab('commissions')}
        >
          <Ionicons 
            name="wallet-outline" 
            size={20} 
            color={activeTab === 'commissions' ? '#8b5cf6' : '#6b7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'commissions' && styles.activeTabText]}>
            Comisiones
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'agenda' && (
          <>
            {/* SELECTOR DE PERÍODO */}
            <View style={styles.periodSelector}>
              <TouchableOpacity
                style={[styles.periodButton, filters.period === 'day' && styles.periodButtonActive]}
                onPress={() => {
                  dispatch(setFilters({ ...filters, period: 'day' }));
                }}
              >
                <Ionicons 
                  name="today" 
                  size={16} 
                  color={filters.period === 'day' ? '#ffffff' : '#6b7280'} 
                />
                <Text style={[styles.periodButtonText, filters.period === 'day' && styles.periodButtonTextActive]}>
                  Día
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.periodButton, filters.period === 'week' && styles.periodButtonActive]}
                onPress={() => {
                  dispatch(setFilters({ ...filters, period: 'week' }));
                }}
              >
                <Ionicons 
                  name="calendar" 
                  size={16} 
                  color={filters.period === 'week' ? '#ffffff' : '#6b7280'} 
                />
                <Text style={[styles.periodButtonText, filters.period === 'week' && styles.periodButtonTextActive]}>
                  Semana
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.periodButton, filters.period === 'month' && styles.periodButtonActive]}
                onPress={() => {
                  dispatch(setFilters({ ...filters, period: 'month' }));
                }}
              >
                <Ionicons 
                  name="calendar-outline" 
                  size={16} 
                  color={filters.period === 'month' ? '#ffffff' : '#6b7280'} 
                />
                <Text style={[styles.periodButtonText, filters.period === 'month' && styles.periodButtonTextActive]}>
                  Mes
                </Text>
              </TouchableOpacity>
            </View>

            {/* View Mode Toggle */}
            <View style={styles.viewModeContainer}>
              <TouchableOpacity
                style={[styles.viewModeButton, viewMode === 'calendar' && styles.activeViewMode]}
                onPress={() => setViewMode('calendar')}
              >
                <Ionicons 
                  name="calendar" 
                  size={16} 
                  color={viewMode === 'calendar' ? '#ffffff' : '#6b7280'} 
                />
                <Text style={[styles.viewModeText, viewMode === 'calendar' && styles.activeViewModeText]}>
                  Calendario
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.viewModeButton, viewMode === 'list' && styles.activeViewMode]}
                onPress={() => setViewMode('list')}
              >
                <Ionicons 
                  name="list" 
                  size={16} 
                  color={viewMode === 'list' ? '#ffffff' : '#6b7280'} 
                />
                <Text style={[styles.viewModeText, viewMode === 'list' && styles.activeViewModeText]}>
                  Lista
                </Text>
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
                {filters.period === 'day' && 'Turnos de Hoy'}
                {filters.period === 'week' && 'Turnos de esta Semana'}
                {filters.period === 'month' && 'Turnos de este Mes'}
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateAppointment}
              >
                <Ionicons name="add" size={20} color="#ffffff" />
                <Text style={styles.createButtonText}>Agendar</Text>
              </TouchableOpacity>
            </View>

            {/* Appointments List */}
            {loading ? (
              <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20 }} />
            ) : formattedAppointments.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
                <Text style={styles.emptyStateText}>No hay turnos programados</Text>
                <Text style={styles.emptyStateSubtext}>
                  Presiona el botón "Agendar" para crear uno
                </Text>
              </View>
            ) : (
              <View style={styles.appointmentsList}>
                {(viewMode === 'calendar' ? todaysAppointments : formattedAppointments).map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onPress={handleAppointmentPress}
                    onAction={handleAppointmentAction}
                    hasCompletePermission={hasPermission('appointments.complete')}
                    hasCloseWithPaymentPermission={hasPermission('appointments.close_with_payment')}
                  />
                ))}
              </View>
            )}
          </>
        )}

        {activeTab === 'commissions' && (
          <View style={styles.commissionsContainer}>
            <Text style={styles.commissionsTitle}>Mis Comisiones</Text>
            <Text style={styles.commissionsSubtitle}>
              Aquí podrás ver el detalle de tus comisiones
            </Text>
            {/* TODO: Implementar vista de comisiones */}
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyStateText}>Vista de comisiones</Text>
              <Text style={styles.emptyStateSubtext}>
                Funcionalidad en desarrollo
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateAppointment}
      >
        <Ionicons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* Modals */}
      <AppointmentCreateModal
        visible={showCreateModal}
        preselectedDate={createAppointmentDate}
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
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedAppointment(null);
        }}
        onEdit={() => {
          // TODO: Navegar a edición
        }}
        onCancel={handleAppointmentAction}
        onComplete={handleAppointmentAction}
      />

      {/* Modal de Flujo de Pago - DESHABILITADO temporalmente, usando PaymentStep en AppointmentDetailsModal */}
      {/* <PaymentFlowManager
        visible={showPaymentModal}
        appointment={appointmentForPayment}
        onClose={() => {
          setShowPaymentModal(false);
          setAppointmentForPayment(null);
        }}
        onSuccess={handlePaymentSuccess}
      /> */}
    </SafeAreaView>
  );
};// =====================================================
// ESTILOS
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
    paddingHorizontal: 20,
    paddingVertical: 8,
    paddingTop: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  // Stats
  statsWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statsContent: {
    gap: 8,
    paddingHorizontal: 4,
  },
  statsCard: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    minWidth: 110,
    maxWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginVertical: 4,
  },
  statsTitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 2,
  },
  statsSubtitle: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
    textAlign: 'center',
  },
  // Content
  content: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
  },
  // Period Selector
  periodSelector: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  periodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  periodButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#ffffff',
  },
  // Agenda
  agendaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  agendaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  viewModeContainer: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 4,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  activeViewMode: {
    backgroundColor: '#3b82f6',
  },
  viewModeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  activeViewModeText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  calendarContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  appointmentsList: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  // Appointment Card
  appointmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    gap: 6,
  },
  appointmentTimeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
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
    gap: 8,
    marginBottom: 8,
  },
  appointmentClientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  appointmentServiceName: {
    fontSize: 14,
    color: '#6b7280',
  },
  appointmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  branchContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  branchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  branchText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  originBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  originText: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  commissionText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Commissions
  commissionsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  commissionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  commissionsSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalBody: {
    padding: 24,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  detailSubvalue: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  modalFooter: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  modalButtonSecondary: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default SpecialistDashboardV2;