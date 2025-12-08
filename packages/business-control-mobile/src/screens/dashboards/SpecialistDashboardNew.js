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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { 
  logout,
  selectSpecialistFilters,
  fetchUserPermissions
} from '@shared/store/reactNativeStore';
import { setFilters } from '@shared/store/slices/specialistDashboardSlice';
import { Calendar } from 'react-native-big-calendar';

// Permisos
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionButton, PermissionGuard } from '../../components/permissions';

// Hook de turnos
import { useAppointments } from '../../hooks/useAppointments';

// Componentes
import { AppointmentCreateModal, AppointmentDetailsModal } from '../../components/appointments';

// Utilidades de timezone
import { 
  formatDateColombia, 
  isToday as isTodayColombia, 
  isTomorrow as isTomorrowColombia,
  formatTimeColombia,
  toColombiaTime
} from '../../utils/timezone';

// =====================================================
// COMPONENTES AUXILIARES
// =====================================================

// Card de Estadística (Versión Compacta)
const StatsCard = ({ title, value, subtitle, icon, color }) => (
  <View style={[styles.statsCard, { backgroundColor: color }]}>
    <Ionicons name={icon} size={16} color="#ffffff" style={{ marginBottom: 4 }} />
    <Text style={styles.statsValue}>{value}</Text>
    <Text style={styles.statsTitle}>{title}</Text>
    {subtitle && (
      <Text style={styles.statsSubtitle}>{subtitle}</Text>
    )}
  </View>
);

// Card de Turno
const AppointmentCard = ({ appointment, onPress, onAction }) => {
  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#9ca3af',
      CONFIRMED: '#3b82f6',
      IN_PROGRESS: '#f59e0b',
      COMPLETED: '#10b981',
      CANCELED: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const texts = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmado',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completado',
      CANCELED: 'Cancelado',
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
  
  // Formatear fecha y hora del appointment en hora de Colombia
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    
    let dayLabel = '';
    if (isTodayColombia(date)) {
      dayLabel = 'Hoy';
    } else if (isTomorrowColombia(date)) {
      dayLabel = 'Mañana';
    } else {
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      
      // Convertir a hora de Colombia
      const colombiaDate = toColombiaTime(date);
      dayLabel = `${days[colombiaDate.getUTCDay()]}, ${colombiaDate.getUTCDate()} ${months[colombiaDate.getUTCMonth()]}`;
    }
    
    return {
      dayLabel,
      time: formatTimeColombia(date)
    };
  };
  
  const startDateTime = formatDateTime(appointment.startTimeISO);
  const endTimeStr = formatTimeColombia(appointment.endTimeISO);
  
  // Obtener nombre del cliente
  const clientName = appointment.client 
    ? `${appointment.client.firstName} ${appointment.client.lastName}`
    : appointment.clientName || 'Sin información';
    
  // Obtener nombre del servicio
  const serviceName = appointment.service?.name || appointment.serviceName || 'Sin información';

  return (
    <TouchableOpacity 
      style={styles.appointmentCard}
      onPress={() => onPress(appointment)}
      activeOpacity={0.8}
    >
      {/* Día del appointment */}
      <View style={styles.appointmentDateBanner}>
        <Ionicons name="calendar-outline" size={14} color="#6b7280" />
        <Text style={styles.appointmentDateText}>{startDateTime.dayLabel}</Text>
      </View>
      
      {/* Header del turno */}
      <View style={styles.appointmentHeader}>
        <View style={styles.appointmentTime}>
          <Ionicons name="time-outline" size={20} color="#3b82f6" />
          <Text style={styles.appointmentTimeText}>
            {startDateTime.time} - {endTimeStr}
          </Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
          <Text style={styles.statusText}>{getStatusText(appointment.status)}</Text>
        </View>
      </View>

      {/* Cliente */}
      <View style={styles.appointmentRow}>
        <Ionicons name="person" size={18} color="#6b7280" />
        <Text style={styles.appointmentClientName}>{clientName}</Text>
      </View>

      {/* Servicio */}
      <View style={styles.appointmentRow}>
        <Ionicons name="cut" size={18} color="#6b7280" />
        <Text style={styles.appointmentServiceName}>{serviceName}</Text>
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
          <Text style={styles.priceText}>
            ${appointment.totalAmount ? parseFloat(appointment.totalAmount).toLocaleString() : '0'}
          </Text>
          <Text style={styles.commissionText}>
            💰 {appointment.commissionPercentage || 0}%
          </Text>
        </View>
      </View>

      {/* Acciones según estado */}
      {appointment.status === 'confirmed' && (
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onAction(appointment, 'start')}
        >
          <Text style={styles.actionButtonText}>Iniciar Procedimiento</Text>
        </TouchableOpacity>
      )}

      {appointment.status === 'in_progress' && (
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#10b981' }]}
          onPress={() => onAction(appointment, 'complete')}
        >
          <Text style={styles.actionButtonText}>Completar Turno</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function SpecialistDashboard({ navigation }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const businessId = useSelector((state) => state.auth.businessId);
  
  // Redux state (solo filtros)
  const filters = useSelector(selectSpecialistFilters);

  // Hook de permisos
  const { 
    hasPermission, 
    hasAnyPermission,
    permissionsCount 
  } = usePermissions();

  // Hook de turnos (Fase 2)
  const {
    appointments: appointmentsFromHook,
    loading: appointmentsLoading,
    refreshing: appointmentsRefreshing,
    error: appointmentsError,
    fetchAppointments,
    refresh: refreshAppointments,
    createAppointment,
    confirmAppointment: confirmAppointmentHook,
    startAppointment: startAppointmentHook,
    completeAppointment: completeAppointmentHook,
    cancelAppointment: cancelAppointmentHook,
    canCreate,
    canEdit,
    canCancel,
    canComplete
  } = useAppointments();

  // Helper: Formatear appointments para las vistas
  const formatAppointment = (appointment) => {
    if (!appointment) return null;
    
    // Convertir fechas UTC del backend a hora de Colombia (UTC-5)
    const startDate = new Date(appointment.startTime);
    const endDate = new Date(appointment.endTime);
    
    // Colombia está en UTC-5, ajustar para mostrar hora local correcta
    const colombiaOffset = -5 * 60; // -5 horas en minutos
    const localOffset = startDate.getTimezoneOffset(); // offset local en minutos
    const colombiaStartDate = new Date(startDate.getTime() + (localOffset + colombiaOffset) * 60000);
    const colombiaEndDate = new Date(endDate.getTime() + (localOffset + colombiaOffset) * 60000);
    
    return {
      ...appointment,
      // Formato de tiempos para visualización en hora de Colombia
      startTime: colombiaStartDate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' }),
      endTime: colombiaEndDate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' }),
      startTimeISO: appointment.startTime, // Mantener original UTC para lógica
      endTimeISO: appointment.endTime,
      startTimeColombia: colombiaStartDate.toISOString(), // Fecha ajustada a Colombia
      endTimeColombia: colombiaEndDate.toISOString(),
      // Extraer datos del cliente
      clientName: appointment.client 
        ? `${appointment.client.firstName || ''} ${appointment.client.lastName || ''}`.trim()
        : 'Cliente sin nombre',
      clientPhone: appointment.client?.phone || '',
      clientEmail: appointment.client?.email || '',
      // Extraer datos del servicio
      serviceName: appointment.service?.name || 'Servicio no especificado',
      serviceCategory: appointment.service?.category || '',
      serviceDuration: appointment.service?.duration || 0,
      servicePrice: appointment.service?.price || '0',
      // Extraer datos de la sucursal
      branchName: appointment.branch?.name || 'Sin sucursal',
      branchColor: appointment.branch?.color || '#8b5cf6',
      // Datos adicionales
      origin: appointment.isOnline ? 'online' : 'business',
      totalAmount: appointment.totalAmount || '0',
      commissionPercentage: appointment.specialistCommissionPercentage || 0,
    };
  };

  // Estados locales
  const [activeTab, setActiveTab] = useState('agenda'); // agenda | commissions
  const [viewMode, setViewMode] = useState('list'); // list | calendar
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [calendarDate, setCalendarDate] = useState(() => {
    // Inicializar con la fecha de los filtros si existe, sino con hoy en hora de Colombia
    if (filters.date) {
      const [year, month, day] = filters.date.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    // Fecha actual en Colombia (UTC-5)
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  });

  // 📅 Navegación de calendario (hora de Colombia)
  const navigateCalendar = useCallback((direction) => {
    const newDate = new Date(calendarDate);
    
    if (filters.period === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (filters.period === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (filters.period === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    // Asegurar que la fecha esté en contexto de Colombia
    const colombiaDate = new Date(newDate.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
    const newDateString = colombiaDate.toISOString().split('T')[0];
    
    console.log('📅 navigateCalendar (Colombia):', {
      direction,
      oldDate: calendarDate.toISOString().split('T')[0],
      newDate: newDateString,
      period: filters.period,
      colombiaDate: colombiaDate.toISOString()
    });
    
    setCalendarDate(colombiaDate);
    
    // Actualizar filtros con la nueva fecha para cargar appointments
    dispatch(setFilters({
      ...filters,
      date: newDateString // Format: YYYY-MM-DD
    }));
  }, [calendarDate, filters, dispatch]);

  const handlePeriodChange = useCallback((newPeriod) => {
    console.log('📅 Cambiando período:', newPeriod);
    dispatch(setFilters({ 
      ...filters, 
      period: newPeriod 
    }));
  }, [filters, dispatch]);

  const goToToday = useCallback(() => {
    // Obtener fecha actual en hora de Colombia
    const now = new Date();
    const colombiaToday = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
    const todayString = colombiaToday.toISOString().split('T')[0];
    
    console.log('📅 goToToday (Colombia):', {
      utcNow: now.toISOString(),
      colombiaToday: colombiaToday.toISOString(),
      todayString
    });
    
    setCalendarDate(colombiaToday);
    
    // Actualizar filtros a hoy
    dispatch(setFilters({
      ...filters,
      date: todayString
    }));
  }, [filters, dispatch]);

  // � Formatear appointments
  const formattedAppointments = useMemo(() => {
    if (!appointmentsFromHook || !Array.isArray(appointmentsFromHook)) {
      console.log('❌ formattedAppointments: appointmentsFromHook is not an array:', appointmentsFromHook);
      return [];
    }
    
    const formatted = appointmentsFromHook.map(formatAppointment).filter(Boolean);
    console.log('📋 formattedAppointments:', {
      raw: appointmentsFromHook.length,
      formatted: formatted.length,
      sample: formatted[0] ? {
        clientName: formatted[0].clientName,
        startTimeISO: formatted[0].startTimeISO,
        endTimeISO: formatted[0].endTimeISO
      } : null
    });
    return formatted;
  }, [appointmentsFromHook]);

  // �📊 Calcular estadísticas a partir de los turnos
  const stats = useMemo(() => {
    // Validación defensiva: asegurar que appointments es un array
    if (!appointmentsFromHook || !Array.isArray(appointmentsFromHook)) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        confirmed: 0,
        pending: 0,
        canceled: 0,
        totalEarnings: 0,
        totalCommissions: 0,
        pendingCommissions: 0
      };
    }
    
    const appointments = appointmentsFromHook;
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
    
    const pendingCommissions = appointments
      .filter(a => a.status === 'COMPLETED' && !a.commissionPaid)
      .reduce((sum, a) => sum + (a.specialistCommission || 0), 0);
    
    return {
      total,
      completed,
      inProgress,
      confirmed,
      pending,
      canceled,
      totalEarnings,
      totalCommissions,
      pendingCommissions
    };
  }, [appointmentsFromHook]);

  // � Convertir appointments a eventos de calendario
  const calendarEvents = useMemo(() => {
    if (!formattedAppointments || !Array.isArray(formattedAppointments)) {
      console.log('❌ calendarEvents: formattedAppointments is not an array:', formattedAppointments);
      return [];
    }
    
    const events = formattedAppointments.map(appointment => {
      // Usar las fechas UTC originales para el calendario
      // El componente Calendar manejará la conversión a hora local
      const startDate = new Date(appointment.startTimeISO);
      const endDate = new Date(appointment.endTimeISO);
      
      const event = {
        title: appointment.clientName,
        start: startDate,
        end: endDate,
        data: appointment,
      };
      
      // Validar fechas
      if (isNaN(event.start.getTime()) || isNaN(event.end.getTime())) {
        console.log('❌ Invalid date in event:', {
          startTimeISO: appointment.startTimeISO,
          endTimeISO: appointment.endTimeISO,
          parsedStart: event.start,
          parsedEnd: event.end
        });
        return null;
      }
      
      return event;
    }).filter(Boolean);
    
    console.log('📅 Eventos para calendario (Colombia UTC-5):', {
      total: events.length,
      sample: events[0] ? {
        title: events[0].title,
        startUTC: events[0].start.toISOString(),
        endUTC: events[0].end.toISOString(),
        startColombia: events[0].start.toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
        endColombia: events[0].end.toLocaleString('es-CO', { timeZone: 'America/Bogota' })
      } : null
    });
    
    return events;
  }, [formattedAppointments]);

  // �🛡️ VALIDACIÓN DE ACCESO POR ROL
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

  // 🔐 CARGAR PERMISOS AL MONTAR
  useEffect(() => {
    if (user?.id && businessId) {
      console.log('🔐 Cargando permisos del usuario:', user.id);
      dispatch(fetchUserPermissions({
        userId: user.id,
        businessId: businessId
      }));
    }
  }, [user?.id, businessId, dispatch]);

  const loadDashboardData = useCallback(async () => {
    try {
      console.log('📱 Cargando appointments con filtros:', {
        date: filters.date,
        period: filters.period,
      });
      
      await fetchAppointments({
        date: filters.date,
        period: filters.period,
        branchId: filters.branchId,
        status: filters.status
      });
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    }
  }, [filters.date, filters.period, filters.branchId, filters.status, fetchAppointments]);

  // Cargar datos iniciales
  useEffect(() => {
    if (user && businessId) {
      loadDashboardData();
    }
  }, [user, businessId, loadDashboardData]);

  // Sincronizar calendarDate con filters.date (hora de Colombia)
  useEffect(() => {
    if (filters.date) {
      // Crear fecha en zona horaria de Colombia (UTC-5)
      const [year, month, day] = filters.date.split('-');
      const filterDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      // Asegurar que la fecha esté en contexto de Colombia
      const colombiaDate = new Date(filterDate.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
      const currentDate = new Date(calendarDate);
      
      // Solo actualizar si las fechas son diferentes (sin comparar hora)
      const filterDateString = colombiaDate.toISOString().split('T')[0];
      const currentDateString = currentDate.toISOString().split('T')[0];
      
      if (filterDateString !== currentDateString) {
        console.log('📅 Sincronizando calendarDate con filters.date (Colombia):', {
          filterDate: filterDateString,
          currentDate: currentDateString,
          newCalendarDate: colombiaDate.toISOString()
        });
        setCalendarDate(colombiaDate);
      }
    }
  }, [filters.date]);

  const onRefresh = useCallback(async () => {
    try {
      await refreshAppointments({
        date: filters.date,
        period: filters.period,
        branchId: filters.branchId,
        status: filters.status
      });
    } catch (error) {
      console.error('❌ Error refrescando:', error);
    }
  }, [refreshAppointments, filters.date, filters.period, filters.branchId, filters.status]);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => dispatch(logout()),
        },
      ]
    );
  };

  const handleAppointmentPress = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleAppointmentAction = async (appointment, action) => {
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
                  await confirmAppointmentHook(appointment.id);
                  Alert.alert('Éxito', 'Turno confirmado correctamente');
                } catch (error) {
                  Alert.alert('Error', error.message || 'No se pudo confirmar el turno');
                }
              }
            },
          ]
        );
      } else if (action === 'start') {
        Alert.alert(
          'Iniciar Procedimiento',
          `¿Deseas iniciar el procedimiento para ${appointment.clientName}?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Iniciar', 
              onPress: async () => {
                try {
                  await startAppointmentHook(appointment.id);
                  Alert.alert('Éxito', 'Procedimiento iniciado');
                } catch (error) {
                  Alert.alert('Error', error.message || 'No se pudo iniciar el procedimiento');
                }
              }
            },
          ]
        );
      } else if (action === 'complete') {
        // Validar antes de mostrar el diálogo
        const validation = canComplete(appointment);
        if (!validation.allowed) {
          Alert.alert('No se puede completar', validation.reason);
          return;
        }
        
        Alert.alert(
          'Completar Turno',
          `¿Deseas completar el turno de ${appointment.clientName}?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Completar', 
              onPress: async () => {
                try {
                  await completeAppointmentHook(appointment.id);
                  Alert.alert('Éxito', 'Turno completado correctamente');
                  await loadDashboardData(); // Refrescar stats
                } catch (error) {
                  Alert.alert('Error', error.message || 'No se pudo completar el turno');
                }
              }
            },
          ]
        );
      } else if (action === 'cancel') {
        // Validar antes de mostrar el diálogo
        const validation = canCancel(appointment);
        if (!validation.allowed) {
          Alert.alert('No se puede cancelar', validation.reason);
          return;
        }
        
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
                  await cancelAppointmentHook(
                    appointment.id, 
                    reason || 'Sin motivo especificado'
                  );
                  Alert.alert('Éxito', 'Turno cancelado correctamente');
                  await loadDashboardData(); // Refrescar stats
                } catch (error) {
                  Alert.alert('Error', error.message || 'No se pudo cancelar el turno');
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
  };

  const handleCreateAppointment = () => {
    // Verificar permisos con validación completa
    const validation = canCreate();
    if (!validation.allowed) {
      Alert.alert(
        'Sin Permisos',
        validation.reason,
        [{ text: 'OK' }]
      );
      return;
    }
    
    setShowCreateModal(true);
  };

  // =====================================================
  // RENDERIZADO
  // =====================================================

  if (!user || !businessId) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando datos del especialista...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3b82f6', '#1e40af']}
        style={styles.gradient}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>¡Hola, {user.firstName}! 👋</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('SpecialistProfile')}
            >
              <Ionicons name="person" size={24} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* STATS CARDS */}
        <View style={styles.statsWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContent}
          >
            <StatsCard
              title="Turnos Hoy"
              value={`${stats.completed}/${stats.total}`}
              subtitle={`${stats.inProgress} en progreso`}
              icon="calendar"
              color="#10b981"
            />
            <StatsCard
              title="Ingresos Hoy"
              value={`$${(stats.totalEarnings / 1000).toFixed(0)}K`}
              subtitle="Total facturado"
              icon="cash"
              color="#8b5cf6"
            />
            <StatsCard
              title="Comisiones"
              value={`$${(stats.totalCommissions / 1000).toFixed(0)}K`}
              subtitle={`$${(stats.pendingCommissions / 1000).toFixed(0)}K pendientes`}
              icon="wallet"
              color="#f59e0b"
            />
          </ScrollView>
        </View>

        {/* CONTENIDO */}
        <View style={styles.content}>
          {/* TAB BAR */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'agenda' && styles.tabActive]}
              onPress={() => setActiveTab('agenda')}
            >
              <Ionicons 
                name="calendar" 
                size={18} 
                color={activeTab === 'agenda' ? '#ffffff' : '#6b7280'} 
              />
              <Text style={[styles.tabText, activeTab === 'agenda' && styles.tabTextActive]}>
                Agenda
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'commissions' && styles.tabActive]}
              onPress={() => setActiveTab('commissions')}
            >
              <Ionicons 
                name="wallet" 
                size={18} 
                color={activeTab === 'commissions' ? '#ffffff' : '#6b7280'} 
              />
              <Text style={[styles.tabText, activeTab === 'commissions' && styles.tabTextActive]}>
                Comisiones
              </Text>
            </TouchableOpacity>
          </View>

          {/* CONTENIDO SEGÚN TAB */}
          {activeTab === 'agenda' ? (
            <ScrollView
              style={styles.scrollView}
              refreshControl={
                <RefreshControl 
                  refreshing={appointmentsRefreshing} 
                  onRefresh={onRefresh} 
                />
              }
              showsVerticalScrollIndicator={false}
            >
              {/* SELECTOR DE PERÍODO */}
              <View style={styles.periodSelector}>
                <TouchableOpacity
                  style={[styles.periodButton, filters.period === 'day' && styles.periodButtonActive]}
                  onPress={() => handlePeriodChange('day')}
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
                  onPress={() => handlePeriodChange('week')}
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
                  onPress={() => handlePeriodChange('month')}
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

              <View style={styles.agendaHeader}>
                <View>
                  <Text style={styles.agendaTitle}>
                    {filters.period === 'day' && 'Turnos de Hoy'}
                    {filters.period === 'week' && 'Turnos de esta Semana'}
                    {filters.period === 'month' && 'Turnos de este Mes'}
                  </Text>
                </View>

                <View style={styles.agendaActions}>
                  {/* Toggle vista Lista/Calendario */}
                  <View style={styles.viewToggle}>
                    <TouchableOpacity
                      style={[styles.viewToggleButton, viewMode === 'list' && styles.viewToggleButtonActive]}
                      onPress={() => setViewMode('list')}
                    >
                      <Ionicons 
                        name="list" 
                        size={20} 
                        color={viewMode === 'list' ? '#ffffff' : '#6b7280'} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.viewToggleButton, viewMode === 'calendar' && styles.viewToggleButtonActive]}
                      onPress={() => setViewMode('calendar')}
                    >
                      <Ionicons 
                        name="calendar" 
                        size={20} 
                        color={viewMode === 'calendar' ? '#ffffff' : '#6b7280'} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.viewToggleButton}
                      onPress={() => navigation.navigate('SpecialistCalendar')}
                    >
                      <Ionicons 
                        name="calendar-outline" 
                        size={20} 
                        color="#3b82f6" 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Botón Agendar con validación de permisos */}
                  <PermissionButton
                    permission="appointments.create"
                    style={styles.createButton}
                    textStyle={styles.createButtonText}
                    onPress={handleCreateAppointment}
                    icon="add"
                    iconSize={20}
                    showDisabled={true}
                  >
                    Agendar
                  </PermissionButton>
                </View>
              </View>

              {appointmentsLoading ? (
                <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20 }} />
              ) : (!appointmentsFromHook || appointmentsFromHook.length === 0) ? (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
                  <Text style={styles.emptyStateText}>No hay turnos para este período</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Presiona el botón "Agendar" para crear uno
                  </Text>
                </View>
              ) : viewMode === 'calendar' ? (
                /* VISTA DE CALENDARIO */
                (() => {
                  console.log('📅 Calendar render:', {
                    calendarDate: calendarDate.toISOString(),
                    period: filters.period,
                    eventsCount: calendarEvents.length,
                    events: calendarEvents.map(e => ({
                      title: e.title,
                      start: e.start.toISOString(),
                      end: e.end.toISOString()
                    }))
                  });
                  return (
                    <View style={styles.calendarContainer}>
                  {/* Navegación de calendario */}
                  <View style={styles.calendarNavigation}>
                    <TouchableOpacity 
                      style={styles.calendarNavButton}
                      onPress={() => navigateCalendar('prev')}
                    >
                      <Ionicons name="chevron-back" size={24} color="#3b82f6" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.todayButton}
                      onPress={goToToday}
                    >
                      <Text style={styles.todayButtonText}>Hoy</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.calendarDateText}>
                      {filters.period === 'day' 
                        ? calendarDate.toLocaleDateString('es-CO', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long',
                            timeZone: 'America/Bogota'
                          })
                        : filters.period === 'week'
                        ? `Semana del ${calendarDate.toLocaleDateString('es-CO', { 
                            day: 'numeric', 
                            month: 'short',
                            timeZone: 'America/Bogota' 
                          })}`
                        : calendarDate.toLocaleDateString('es-CO', { 
                            month: 'long', 
                            year: 'numeric',
                            timeZone: 'America/Bogota'
                          })
                      }
                    </Text>
                    
                    <TouchableOpacity 
                      style={styles.calendarNavButton}
                      onPress={() => navigateCalendar('next')}
                    >
                      <Ionicons name="chevron-forward" size={24} color="#3b82f6" />
                    </TouchableOpacity>
                  </View>

                  <Calendar
                    events={calendarEvents}
                    height={600}
                    date={calendarDate}
                    mode={filters.period === 'day' ? 'day' : filters.period === 'week' ? 'week' : 'month'}
                    onPressEvent={(event) => {
                      console.log('📅 Event pressed:', {
                        title: event.title,
                        start: event.start,
                        data: event.data
                      });
                      handleAppointmentPress(event.data);
                    }}
                    onPressCell={(date) => {
                      console.log('📅 Cell pressed:', date);
                      setShowCreateModal(true);
                    }}
                    eventCellStyle={(event) => ({
                      backgroundColor: 
                        event.data.status === 'COMPLETED' ? '#10b981' :
                        event.data.status === 'IN_PROGRESS' ? '#f59e0b' :
                        event.data.status === 'CONFIRMED' ? '#3b82f6' :
                        event.data.status === 'CANCELED' ? '#ef4444' :
                        '#9ca3af',
                    })}
                    renderEvent={(event) => {
                      console.log('📅 Rendering event (Colombia):', {
                        title: event.title,
                        startUTC: event.start.toISOString(),
                        startColombia: event.start.toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
                        calendarDate: calendarDate.toISOString(),
                        eventDate: event.start.toISOString()
                      });
                      return (
                        <View style={styles.calendarEvent}>
                          <Text style={styles.calendarEventTime} numberOfLines={1}>
                            {event.start.toLocaleTimeString('es-CO', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              timeZone: 'America/Bogota'
                            })}
                          </Text>
                          <Text style={styles.calendarEventTitle} numberOfLines={1}>
                            {event.title}
                          </Text>
                          <Text style={styles.calendarEventService} numberOfLines={1}>
                            {event.data.serviceName}
                          </Text>
                        </View>
                      );
                    }}
                    locale="es-CO"
                    ampm={false}
                    swipeEnabled={true}
                    scrollOffsetMinutes={480} // Empezar a las 8:00 AM
                    showTime={true}
                  />
                </View>
                  );
                })()
              ) : (
                /* VISTA DE LISTA */
                <View style={styles.appointmentsList}>
                  {(formattedAppointments || []).map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onPress={handleAppointmentPress}
                      onAction={handleAppointmentAction}
                    />
                  ))}
                </View>
              )}
            </ScrollView>
          ) : (
            <ScrollView
              style={styles.scrollView}
              refreshControl={
                <RefreshControl 
                  refreshing={appointmentsRefreshing} 
                  onRefresh={onRefresh} 
                />
              }
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.commissionsContainer}>
                <Text style={styles.commissionsTitle}>Mis Comisiones</Text>
                <Text style={styles.commissionsSubtitle}>
                  Aquí podrás ver el detalle de tus comisiones
                </Text>
                {/* TODO: Implementar vista de comisiones */}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Modal de Detalles */}
        <AppointmentDetailsModal
          visible={showDetailsModal}
          appointment={selectedAppointment}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAppointment(null);
          }}
          onAppointmentUpdated={async (updatedAppointment) => {
            console.log('✅ Turno actualizado:', updatedAppointment);
            // Recargar la lista de turnos
            await loadDashboardData();
          }}
        />

        {/* Modal de Crear Turno */}
        <AppointmentCreateModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onAppointmentCreated={async (newAppointment) => {
            console.log('✅ Turno creado:', newAppointment);
            // Recargar la lista de turnos
            await loadDashboardData();
          }}
          preselectedSpecialistId={user?.id}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

// =====================================================
// ESTILOS
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  gradient: {
    flex: 1,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    paddingTop: 24,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
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
  tabBar: {
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
  tabActive: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentDateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  appointmentDateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
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
  // View Toggle (Lista/Calendario)
  agendaActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 2,
  },
  viewToggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewToggleButtonActive: {
    backgroundColor: '#3b82f6',
  },
  // Calendar Container
  calendarContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  calendarNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  calendarNavButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  todayButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  calendarDateText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginHorizontal: 12,
    textTransform: 'capitalize',
  },
  calendarEvent: {
    padding: 4,
    height: '100%',
    justifyContent: 'center',
  },
  calendarEventTime: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  calendarEventTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  calendarEventService: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
