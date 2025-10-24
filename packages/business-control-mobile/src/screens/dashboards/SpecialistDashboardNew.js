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

// Permisos
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionButton, PermissionGuard } from '../../components/permissions';

// Hook de turnos
import { useAppointments } from '../../hooks/useAppointments';

// Componentes
import { AppointmentCreateModal, AppointmentDetailsModal } from '../../components/appointments';

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
          <Text style={styles.priceText}>${appointment.price.toLocaleString()}</Text>
          <Text style={styles.commissionText}>💰 {appointment.commissionPercentage}%</Text>
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

  console.log('📱 Specialist Dashboard - User:', user);
  console.log('📱 Specialist Dashboard - BusinessId:', businessId);
  console.log('📱 Specialist Dashboard - appointmentsFromHook type:', typeof appointmentsFromHook, 'isArray:', Array.isArray(appointmentsFromHook), 'value:', appointmentsFromHook);
  console.log('📱 Specialist Dashboard - Appointments:', appointmentsFromHook?.length || 0);

  // Estados locales
  const [activeTab, setActiveTab] = useState('agenda'); // agenda | commissions
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // 📊 Calcular estadísticas a partir de los turnos
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

  // Cargar datos iniciales
  useEffect(() => {
    if (user && businessId) {
      loadDashboardData();
    }
  }, [user, businessId, filters.date, filters.period]);

  const loadDashboardData = async () => {
    try {
      console.log('📱 loadDashboardData - Usando useAppointments hook:', {
        date: filters.date,
        period: filters.period,
        branchId: filters.branchId,
        status: filters.status,
        businessId: businessId,
        user: user?.id,
        userRole: user?.role
      });
      
      // Usar el hook en lugar del Redux slice
      await fetchAppointments({
        date: filters.date,
        period: filters.period,
        branchId: filters.branchId,
        status: filters.status
      });
      
      console.log('✅ loadDashboardData - Datos cargados con useAppointments hook');
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    }
  };

  const onRefresh = async () => {
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
  };

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

              <View style={styles.agendaHeader}>
                <Text style={styles.agendaTitle}>
                  {filters.period === 'day' && 'Turnos de Hoy'}
                  {filters.period === 'week' && 'Turnos de esta Semana'}
                  {filters.period === 'month' && 'Turnos de este Mes'}
                </Text>
                
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

              {appointmentsLoading ? (
                <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20 }} />
              ) : (!appointmentsFromHook || appointmentsFromHook.length === 0) ? (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
                  <Text style={styles.emptyStateText}>No hay turnos para hoy</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Presiona el botón "Agendar" para crear uno
                  </Text>
                </View>
              ) : (
                <View style={styles.appointmentsList}>
                  {(appointmentsFromHook || []).map((appointment) => (
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
});
