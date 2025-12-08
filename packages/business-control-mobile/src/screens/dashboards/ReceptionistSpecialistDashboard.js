// =====================================================
// DASHBOARD RECEPCIONISTA-ESPECIALISTA
// =====================================================
// Componente dashboard para usuarios con rol 'receptionist_specialist'
// Funcionalidades:
// - Ver todas las citas (como recepcionista)  
// - Ver solo mis citas (como especialista)
// - Navegación por pestañas entre ambas vistas
// - Filtros por día/semana/mes en ambas vistas
// =====================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

// Redux Selectors y Actions
import {
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
  clearReceptionistError,
  logout
} from '@shared/store/reactNativeStore';

// Hooks y Componentes
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionButton, PermissionGuard } from '../../components/permissions';
import { AppointmentCreateModal, AppointmentDetailsModal } from '../../components/appointments';
import PaymentFlowManager from '../../components/payment/PaymentFlowManager';

const { width } = Dimensions.get('window');

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

const AppointmentCard = ({ 
  appointment, 
  onPress, 
  onActionPress, 
  onStartTurn,
  onCloseTurn,
  isOwnAppointment = false 
}) => {
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

  const formatTime = (timeString) => {
    if (!timeString) return 'Sin hora';
    return timeString.slice(0, 5);
  };

  const cardStyle = isOwnAppointment 
    ? [styles.appointmentCard, styles.ownAppointmentCard]
    : styles.appointmentCard;

  return (
    <TouchableOpacity style={cardStyle} onPress={onPress}>
      {/* Header con indicador de cita propia */}
      <View style={styles.appointmentHeader}>
        <View style={styles.appointmentTime}>
          <Ionicons name="time" size={16} color="#6b7280" />
          <Text style={styles.timeText}>{formatTime(appointment.time)}</Text>
        </View>
        <View style={styles.appointmentHeaderRight}>
          {isOwnAppointment && (
            <View style={styles.ownAppointmentBadge}>
              <Text style={styles.ownAppointmentText}>MI CITA</Text>
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
            <Text style={styles.statusText}>{getStatusText(appointment.status)}</Text>
          </View>
        </View>
      </View>

      {/* Información del cliente */}
      <View style={styles.appointmentInfo}>
        <Text style={styles.clientName}>{appointment.clientName}</Text>
        <Text style={styles.serviceName}>{appointment.serviceName || 'Servicio no especificado'}</Text>
        {appointment.specialistName && (
          <Text style={styles.specialistName}>Especialista: {appointment.specialistName}</Text>
        )}
      </View>

      {/* Botones de acción */}
      {appointment.status === 'PENDING' && (
        <View style={styles.actionButtons}>
          {/* Si es mi cita, mostrar botón de Iniciar Turno también */}
          {isOwnAppointment ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.startTurnButton]}
                onPress={() => onStartTurn(appointment)}
              >
                <Ionicons name="play" size={16} color="#ffffff" />
                <Text style={styles.actionButtonText}>Iniciar Turno</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => onActionPress(appointment.id, 'CANCELLED')}
              >
                <Ionicons name="close" size={16} color="#ffffff" />
                <Text style={styles.actionButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* Si NO es mi cita, mostrar botones de recepcionista */
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.confirmButton]}
                onPress={() => onActionPress(appointment.id, 'CONFIRMED')}
              >
                <Ionicons name="checkmark" size={16} color="#ffffff" />
                <Text style={styles.actionButtonText}>Confirmar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => onActionPress(appointment.id, 'CANCELLED')}
              >
                <Ionicons name="close" size={16} color="#ffffff" />
                <Text style={styles.actionButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* Botones de inicio de turno para citas CONFIRMADAS - SOLO para mis citas */}
      {isOwnAppointment && appointment.status === 'CONFIRMED' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.startTurnButton]}
            onPress={() => onStartTurn(appointment)}
          >
            <Ionicons name="play" size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>Iniciar Turno</Text>
          </TouchableOpacity>
        </View>
      )}

      {isOwnAppointment && appointment.status === 'IN_PROGRESS' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.closeTurnButton]}
            onPress={() => onCloseTurn(appointment)}
          >
            <Ionicons name="cash-outline" size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>Cerrar Turno y Cobrar</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const ReceptionistSpecialistDashboard = ({ navigation }) => {
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

  console.log('👩‍💼🔧 ReceptionistSpecialist Dashboard - User:', user);
  console.log('👩‍💼🔧 ReceptionistSpecialist Dashboard - BusinessId:', businessId);
  console.log('👩‍💼🔧 ReceptionistSpecialist Dashboard - Appointments:', appointments.length);

  // Estados locales
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('agenda');
  const [viewType, setViewType] = useState('all'); // 'all' | 'mine'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
  });
  const [createAppointmentDate, setCreateAppointmentDate] = useState(null);
  
  // Estados para flujo de pago
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [appointmentForPayment, setAppointmentForPayment] = useState(null);

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
      // Solo permitir acceso a receptionist_specialist
      if (userRole !== 'receptionist_specialist') {
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
                  'specialist': 'DashboardSpecialist',
                  'receptionist': 'ReceptionistDashboard'
                };
                const correctRoute = roleToRoute[userRole];
                if (correctRoute) {
                  navigation.replace(correctRoute);
                } else {
                  navigation.goBack();
                }
              }
            }
          ]
        );
        return;
      }
    }
  }, [user, navigation]);

  // =====================================================
  // CARGA DE DATOS
  // =====================================================

  const loadDashboardData = useCallback(async () => {
    if (!businessId || !user) {
      console.log('⚠️ No businessId or user, skipping load');
      return;
    }

    try {
      console.log('👩‍💼🔧 loadDashboardData - Parámetros:', {
        businessId,
        userId: user.id,
        filters,
        selectedDate,
        viewType
      });

      // Cargar citas (siempre todas para tener datos completos)
      await dispatch(fetchReceptionistAppointments({
        businessId,
        date: selectedDate,
        period: filters.period,
        specialistId: null // Siempre traer todas las citas
      })).unwrap();

      // Cargar estadísticas
      await dispatch(fetchReceptionistStats({
        businessId,
        date: selectedDate,
        period: filters.period
      })).unwrap();
      
      console.log('✅ loadDashboardData - Datos cargados exitosamente');
    } catch (error) {
      console.error('❌ Error loading receptionist specialist dashboard:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del dashboard');
    }
  }, [dispatch, businessId, filters, selectedDate, user, viewType]);

  // =====================================================
  // EFECTO PARA RECARGAR DATOS AL CAMBIAR FECHA
  // =====================================================
  useEffect(() => {
    if (businessId && user && selectedDate) {
      loadDashboardData();
    }
  }, [selectedDate, loadDashboardData, businessId, user]);

  // =====================================================
  // EFECTO INICIAL DE CARGA
  // =====================================================
  useEffect(() => {
    const initializeDashboard = async () => {
      await loadDashboardData();
    };
    
    initializeDashboard();
  }, [loadDashboardData]);

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

  // =====================================================
  // FUNCIONES DE INICIO Y CIERRE DE TURNO
  // =====================================================

  const handleStartTurn = useCallback(async (appointment) => {
    Alert.alert(
      'Iniciar Turno',
      `¿Deseas iniciar el turno para ${appointment.clientName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Iniciar',
          onPress: async () => {
            try {
              await dispatch(updateAppointmentStatus({
                appointmentId: appointment.id,
                status: 'IN_PROGRESS'
              })).unwrap();
              
              await loadDashboardData();
              
              Alert.alert('✓ Turno iniciado', 'El turno ha comenzado correctamente');
            } catch (error) {
              console.error('❌ Error starting turn:', error);
              Alert.alert('Error', 'No se pudo iniciar el turno');
            }
          }
        }
      ]
    );
  }, [dispatch, loadDashboardData]);

  const handleCloseTurn = useCallback((appointment) => {
    // Guardar la cita y abrir modal de pago
    setAppointmentForPayment(appointment);
    setShowPaymentModal(true);
  }, []);

  const handlePaymentSuccess = useCallback(async () => {
    // Cerrar modal de pago
    setShowPaymentModal(false);
    setAppointmentForPayment(null);
    
    // Actualizar estado de la cita a COMPLETED
    if (appointmentForPayment) {
      try {
        await dispatch(updateAppointmentStatus({
          appointmentId: appointmentForPayment.id,
          status: 'COMPLETED'
        })).unwrap();
        
        await loadDashboardData();
        
        Alert.alert(
          '✓ Turno cerrado',
          'El turno se ha cerrado correctamente y el pago fue registrado'
        );
      } catch (error) {
        console.error('❌ Error completing appointment:', error);
        Alert.alert('Error', 'El pago se registró pero hubo un problema al cerrar el turno');
      }
    }
  }, [dispatch, loadDashboardData, appointmentForPayment]);

  // Formatear appointments para mostrar
  const formattedAppointments = useMemo(() => {
    if (!appointments || !Array.isArray(appointments)) {
      console.log('⚠️ formattedAppointments - No appointments or not array:', appointments);
      return [];
    }

    console.log('🔍 formattedAppointments - Raw appointments:', appointments.length);
    console.log('🔍 formattedAppointments - Is array?', Array.isArray(appointments));

    let filteredAppointments = appointments;

    // Filtrar por vista (todas vs mis citas)
    if (viewType === 'mine' && user) {
      filteredAppointments = appointments.filter(appointment => 
        appointment.specialistId === user.id
      );
      console.log('🔍 Filtered to my appointments:', filteredAppointments.length);
    }

    return filteredAppointments.map(appointment => {
      console.log('✅ Processing appointment:', appointment.id);
      
      // Verificar si es mi cita
      const isOwnAppointment = appointment.specialistId === user?.id;
      
      return {
        id: appointment.id,
        time: appointment.time,
        date: appointment.date,
        status: appointment.status,
        clientName: appointment.client 
          ? `${appointment.client.firstName} ${appointment.client.lastName}`.trim()
          : appointment.clientName || 'Cliente no especificado',
        serviceName: appointment.service?.name || appointment.serviceName,
        specialistName: appointment.specialist 
          ? `${appointment.specialist.firstName} ${appointment.specialist.lastName}`.trim()
          : appointment.specialistName,
        specialistId: appointment.specialistId,
        isOwnAppointment
      };
    });
  }, [appointments, viewType, user]);

  const handleAppointmentPress = useCallback((appointment) => {
    dispatch(setReceptionistSelectedAppointment(appointment));
    setShowDetailsModal(true);
  }, [dispatch]);

  const handleCreateAppointment = useCallback((date = null) => {
    setCreateAppointmentDate(date);
    setShowCreateModal(true);
  }, []);

  // =====================================================
  // RENDER
  // =====================================================

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Error al cargar datos</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadDashboardData}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Recepcionista-Especialista</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* View Type Tabs */}
      <View style={styles.viewTypeContainer}>
        <TouchableOpacity
          style={[styles.viewTypeTab, viewType === 'all' && styles.activeViewTypeTab]}
          onPress={() => setViewType('all')}
        >
          <Ionicons 
            name="people" 
            size={20} 
            color={viewType === 'all' ? '#ffffff' : '#6b7280'} 
          />
          <Text style={[styles.viewTypeTabText, viewType === 'all' && styles.activeViewTypeTabText]}>
            Todas las Citas
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.viewTypeTab, viewType === 'mine' && styles.activeViewTypeTab]}
          onPress={() => setViewType('mine')}
        >
          <Ionicons 
            name="person" 
            size={20} 
            color={viewType === 'mine' ? '#ffffff' : '#6b7280'} 
          />
          <Text style={[styles.viewTypeTabText, viewType === 'mine' && styles.activeViewTypeTabText]}>
            Mis Citas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'agenda' && (
          <>
            {/* Controls */}
            <View style={styles.controlsContainer}>
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

            {/* Lista de Citas */}
            <FlatList
              data={formattedAppointments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <AppointmentCard
                  appointment={item}
                  onPress={() => handleAppointmentPress(item)}
                  onActionPress={handleAppointmentAction}
                  onStartTurn={handleStartTurn}
                  onCloseTurn={handleCloseTurn}
                  isOwnAppointment={item.isOwnAppointment}
                />
              )}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
                  <Text style={styles.emptyTitle}>
                    {viewType === 'all' ? 'No hay citas programadas' : 'No tienes citas programadas'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {viewType === 'all' 
                      ? 'Las citas aparecerán aquí cuando se programen'
                      : 'Tus citas como especialista aparecerán aquí'
                    }
                  </Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </>
        )}
      </View>

      {/* Modales */}
      <AppointmentCreateModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        initialDate={createAppointmentDate}
        onSuccess={() => {
          setShowCreateModal(false);
          loadDashboardData(); // Recargar datos después de crear
        }}
      />

      <AppointmentDetailsModal
        visible={showDetailsModal}
        appointment={selectedAppointment}
        onClose={() => setShowDetailsModal(false)}
        onSuccess={loadDashboardData}
      />

      {/* Modal de Pago - Cierre de Turno */}
      {appointmentForPayment && (
        <PaymentFlowManager
          visible={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setAppointmentForPayment(null);
          }}
          appointment={appointmentForPayment}
          paymentType="closure"
          onSuccess={handlePaymentSuccess}
        />
      )}
    </SafeAreaView>
  );
};

// =====================================================
// ESTILOS
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  headerLeft: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },

  logoutButton: {
    padding: 8,
  },

  // View Type Tabs
  viewTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  viewTypeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 8,
  },

  activeViewTypeTab: {
    backgroundColor: '#8b5cf6',
  },

  viewTypeTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },

  activeViewTypeTabText: {
    color: '#ffffff',
  },

  // Period Tabs
  periodTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    marginHorizontal: 20,
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

  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },

  createButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Appointment Cards
  appointmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#e5e7eb',
  },

  ownAppointmentCard: {
    borderLeftColor: '#8b5cf6',
    backgroundColor: '#faf5ff',
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

  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },

  appointmentHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  ownAppointmentBadge: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  ownAppointmentText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
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

  appointmentInfo: {
    marginBottom: 12,
  },

  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },

  serviceName: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },

  specialistName: {
    fontSize: 13,
    color: '#8b5cf6',
    fontWeight: '500',
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },

  confirmButton: {
    backgroundColor: '#10b981',
  },

  cancelButton: {
    backgroundColor: '#ef4444',
  },

  startTurnButton: {
    backgroundColor: '#3b82f6',
  },

  closeTurnButton: {
    backgroundColor: '#8b5cf6',
  },

  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  // List
  listContainer: {
    paddingBottom: 20,
  },

  // Error State
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 8,
  },

  errorMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },

  retryButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ReceptionistSpecialistDashboard;