import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  FlatList,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../../shared/src/store/reactNativeStore.js';

// Hooks personalizados para el flujo del especialista
import { useAppointmentValidation } from '../../hooks/useAppointmentValidation';
import { useBusinessRules } from '../../hooks/useBusinessRules';
import { useCommissionManager } from '../../hooks/useCommissionManager';

// Componentes específicos del flujo de cierre
import AppointmentClosureValidator from '../../components/AppointmentClosureValidator';
import ConsentCaptureModal from '../../components/ConsentCaptureModal';
import EvidenceUploader from '../../components/EvidenceUploader';
import PaymentProcessor from '../../components/PaymentProcessor';
import CommissionManager from '../../components/CommissionManager';
// import PaymentRequestGenerator from '../../components/PaymentRequestGenerator';

const { width } = Dimensions.get('window');

// =====================================================
// COMPONENTE PRINCIPAL: SPECIALIST DASHBOARD
// =====================================================

const SpecialistDashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  
  // Redux selectors
  const { user, businessId } = useSelector(state => state.auth);
  const businessRules = useSelector(state => state.businessRule.assignedRules);
  
  // Hooks personalizados
  const { validateAppointment, validationResult, isValidating } = useAppointmentValidation();
  const { checkBusinessRules, rulesLoaded, ruleChecks } = useBusinessRules(businessId);
  const { 
    pendingCommissions, 
    paymentRequests, 
    commissionStats, 
    generatePaymentRequest,
    isGenerating 
  } = useCommissionManager(user.id, businessId);

  // Estados locales
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('agenda'); // agenda, commissions, stats
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [showClosureModal, setShowClosureModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [currentStep, setCurrentStep] = useState('overview'); // overview, consent, evidence, payment, inventory, commission

  // Mock data - En producción vendría de APIs
  const [mockData] = useState({
    todayStats: {
      appointmentsCount: 8,
      completedCount: 5,
      pendingPayments: 2,
      pendingCommissions: 125000,
      todayEarnings: 450000
    },
    appointments: [
      {
        id: '1',
        clientName: 'María García',
        clientId: 'client-1',
        service: 'Tratamiento Facial Completo',
        serviceId: 'service-1',
        price: 150000,
        time: '09:00',
        duration: 90,
        status: 'in_progress',
        requiresConsent: true,
        consentStatus: 'pending',
        evidenceStatus: 'pending',
        paymentStatus: 'pending',
        commissionPercentage: 40
      },
      {
        id: '2',
        clientName: 'Ana López',
        clientId: 'client-2',
        service: 'Manicure + Esmaltado',
        serviceId: 'service-2',
        price: 85000,
        time: '11:00',
        duration: 60,
        status: 'confirmed',
        requiresConsent: false,
        consentStatus: 'not_required',
        evidenceStatus: 'pending',
        paymentStatus: 'pending',
        commissionPercentage: 35
      },
      {
        id: '3',
        clientName: 'Carmen Ruiz',
        clientId: 'client-3',
        service: 'Corte + Tintura',
        serviceId: 'service-3',
        price: 120000,
        time: '14:00',
        duration: 120,
        status: 'confirmed',
        requiresConsent: true,
        consentStatus: 'pending',
        evidenceStatus: 'pending',
        paymentStatus: 'pending',
        commissionPercentage: 45
      },
      {
        id: '4',
        clientName: 'Sandra Martín',
        clientId: 'client-4',
        service: 'Depilación Láser',
        serviceId: 'service-4',
        price: 200000,
        time: '16:00',
        duration: 75,
        status: 'completed',
        requiresConsent: true,
        consentStatus: 'completed',
        evidenceStatus: 'completed',
        paymentStatus: 'completed',
        commissionPercentage: 50,
        commissionGenerated: true
      }
    ]
  });

  // =====================================================
  // EFFECTS Y FUNCIONES DE CARGA
  // =====================================================

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (rulesLoaded && businessRules.length > 0) {
      console.log('Business Rules loaded:', businessRules);
    }
  }, [rulesLoaded, businessRules]);

  const loadInitialData = async () => {
    try {
      // Cargar reglas de negocio
      await checkBusinessRules();
      
      // Cargar agenda del día
      setTodayAppointments(mockData.appointments);
      
      // En producción, estas serían llamadas a APIs reales:
      // await dispatch(getSpecialistAgenda({ specialistId: user.id, date: today }));
      // await dispatch(getPendingCommissions(user.id));
      // await dispatch(getBusinessAssignedRules());
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'No se pudo cargar la información del dashboard');
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          onPress: () => dispatch(logout()),
          style: 'destructive',
        },
      ]
    );
  };

  // =====================================================
  // FUNCIONES DE MANEJO DE CITAS
  // =====================================================

  const handleAppointmentPress = (appointment) => {
    setSelectedAppointment(appointment);
    
    if (appointment.status === 'in_progress') {
      // Si está en progreso, abrir modal de cierre
      setShowClosureModal(true);
      setCurrentStep('overview');
    } else if (appointment.status === 'confirmed') {
      // Si está confirmada, mostrar opciones
      showAppointmentOptions(appointment);
    } else if (appointment.status === 'completed') {
      // Si está completada, mostrar detalles
      showCompletedAppointmentDetails(appointment);
    }
  };

  const showAppointmentOptions = (appointment) => {
    Alert.alert(
      'Opciones de Cita',
      `${appointment.clientName} - ${appointment.service}`,
      [
        { text: 'Iniciar Procedimiento', onPress: () => startAppointment(appointment) },
        { text: 'Ver Detalles', onPress: () => showAppointmentDetails(appointment) },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const startAppointment = async (appointment) => {
    try {
      // Validar reglas antes de iniciar
      const validation = await validateAppointment(appointment.id);
      
      if (validation.canStart) {
        // Actualizar estado de la cita
        const updatedAppointments = todayAppointments.map(apt => 
          apt.id === appointment.id 
            ? { ...apt, status: 'in_progress' }
            : apt
        );
        setTodayAppointments(updatedAppointments);
        
        // Abrir modal de cierre
        setSelectedAppointment({ ...appointment, status: 'in_progress' });
        setShowClosureModal(true);
        setCurrentStep('overview');
      } else {
        Alert.alert('No se puede iniciar', validation.reason || 'La cita no cumple los requisitos para iniciarse');
      }
    } catch (error) {
      console.error('Error starting appointment:', error);
      Alert.alert('Error', 'No se pudo iniciar la cita');
    }
  };

  const showAppointmentDetails = (appointment) => {
    // Implementar vista de detalles
    navigation.navigate('AppointmentDetails', { appointmentId: appointment.id });
  };

  const showCompletedAppointmentDetails = (appointment) => {
    // Mostrar detalles de cita completada con opción de ver comisión generada
    Alert.alert(
      'Cita Completada',
      `${appointment.clientName} - ${appointment.service}\n\nComisión: $${(appointment.price * appointment.commissionPercentage / 100).toLocaleString()}`,
      [
        { text: 'Ver Comisiones', onPress: () => setActiveTab('commissions') },
        { text: 'Cerrar', style: 'cancel' }
      ]
    );
  };

  // =====================================================
  // FUNCIONES DE MANEJO DE COMISIONES
  // =====================================================

  const handleGeneratePaymentRequest = async () => {
    try {
      const selectedCommissions = pendingCommissions.filter(comm => comm.selected);
      
      if (selectedCommissions.length === 0) {
        Alert.alert('Error', 'Selecciona al menos una comisión para generar la solicitud');
        return;
      }

      const result = await generatePaymentRequest(selectedCommissions);
      
      if (result.success) {
        Alert.alert(
          'Solicitud Generada',
          `Solicitud #${result.requestId} generada exitosamente.\n\nTotal: $${result.totalAmount.toLocaleString()}`,
          [
            { text: 'Ver PDF', onPress: () => openPaymentRequestPDF(result.pdfUrl) },
            { text: 'Cerrar', style: 'cancel' }
          ]
        );
        setShowCommissionModal(false);
      }
    } catch (error) {
      console.error('Error generating payment request:', error);
      Alert.alert('Error', 'No se pudo generar la solicitud de pago');
    }
  };

  const openPaymentRequestPDF = (pdfUrl) => {
    // Abrir PDF en visor nativo o navegador
    navigation.navigate('PDFViewer', { url: pdfUrl });
  };

  // =====================================================
  // COMPONENTES DE RENDERIZADO
  // =====================================================

  const renderHeader = () => (
    <View className="px-6 pt-4 pb-2">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-2xl font-bold text-white">
            ¡Hola, {user?.firstName}! 👋
          </Text>
          <Text className="text-blue-100 opacity-90">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        
        <View className="flex-row items-center space-x-3">
          <TouchableOpacity 
            onPress={() => navigation.navigate('SpecialistProfile')}
            className="w-12 h-12 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons name="person" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleLogout}
            className="w-12 h-12 bg-red-500/20 rounded-full items-center justify-center"
          >
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        <View className="flex-row space-x-4">
          <StatsCard
            title="Citas Hoy"
            value={`${mockData.todayStats.completedCount}/${mockData.todayStats.appointmentsCount}`}
            icon="calendar"
            color="bg-green-500"
          />
          <StatsCard
            title="Ingresos Hoy"
            value={`$${(mockData.todayStats.todayEarnings / 1000).toFixed(0)}K`}
            icon="cash"
            color="bg-purple-500"
          />
          <StatsCard
            title="Comisiones"
            value={`$${(mockData.todayStats.pendingCommissions / 1000).toFixed(0)}K`}
            icon="wallet"
            color="bg-orange-500"
          />
          <StatsCard
            title="Pagos Pend."
            value={mockData.todayStats.pendingPayments}
            icon="card"
            color="bg-red-500"
          />
        </View>
      </ScrollView>
    </View>
  );

  const StatsCard = ({ title, value, icon, color }) => (
    <View className={`${color} rounded-2xl p-4 min-w-[120px] items-center`}>
      <Ionicons name={icon} size={24} color="white" className="mb-2" />
      <Text className="text-white text-2xl font-bold">{value}</Text>
      <Text className="text-white/80 text-xs text-center">{title}</Text>
    </View>
  );

  const renderTabBar = () => (
    <View className="flex-row bg-white mx-6 rounded-2xl p-2 mb-4 shadow-sm">
      {[
        { key: 'agenda', label: 'Agenda', icon: 'calendar' },
        { key: 'commissions', label: 'Comisiones', icon: 'wallet' },
        { key: 'stats', label: 'Estadísticas', icon: 'analytics' }
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => setActiveTab(tab.key)}
          className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl ${
            activeTab === tab.key ? 'bg-blue-500' : 'bg-transparent'
          }`}
        >
          <Ionicons 
            name={tab.icon} 
            size={18} 
            color={activeTab === tab.key ? 'white' : '#6b7280'} 
          />
          <Text className={`ml-2 text-sm font-medium ${
            activeTab === tab.key ? 'text-white' : 'text-gray-500'
          }`}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderAgendaTab = () => (
    <View className="px-6">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold text-gray-800">Agenda de Hoy</Text>
        <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg">
          <Text className="text-white font-medium">Agregar Cita</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={todayAppointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AppointmentCard appointment={item} onPress={() => handleAppointmentPress(item)} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );

  const AppointmentCard = ({ appointment, onPress }) => {
    const statusColors = {
      confirmed: '#10b981',
      in_progress: '#f59e0b', 
      completed: '#8b5cf6',
      cancelled: '#ef4444'
    };

    const statusText = {
      confirmed: 'Confirmada',
      in_progress: 'En Progreso',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };

    const getValidationIcon = () => {
      if (appointment.status === 'completed') return 'checkmark-circle';
      if (appointment.status === 'in_progress') return 'play-circle';
      return 'time';
    };

    const getCompletionProgress = () => {
      if (appointment.status !== 'in_progress') return null;
      
      let completed = 0;
      let total = 4; // consent, evidence, payment, commission
      
      if (!appointment.requiresConsent || appointment.consentStatus === 'completed') completed++;
      if (appointment.evidenceStatus === 'completed') completed++;
      if (appointment.paymentStatus === 'completed') completed++;
      if (appointment.commissionGenerated) completed++;
      
      return { completed, total, percentage: (completed / total) * 100 };
    };

    const progress = getCompletionProgress();

    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border-l-4" style={{ borderLeftColor: statusColors[appointment.status] }}>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-semibold text-gray-800">
              {appointment.clientName}
            </Text>
            <View className="flex-row items-center space-x-2">
              <View className="px-3 py-1 rounded-full" style={{ backgroundColor: `${statusColors[appointment.status]}20` }}>
                <Text className="text-xs font-medium" style={{ color: statusColors[appointment.status] }}>
                  {statusText[appointment.status]}
                </Text>
              </View>
              <Ionicons name={getValidationIcon()} size={20} color={statusColors[appointment.status]} />
            </View>
          </View>
          
          <Text className="text-sm text-gray-600 mb-2">
            {appointment.service} • ${appointment.price.toLocaleString()}
          </Text>
          
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Ionicons name="time" size={16} color="#6b7280" />
              <Text className="text-sm text-gray-500 ml-1">
                {appointment.time} ({appointment.duration} min)
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="wallet" size={16} color="#6b7280" />
              <Text className="text-sm text-gray-500 ml-1">
                {appointment.commissionPercentage}% = ${((appointment.price * appointment.commissionPercentage) / 100).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Progress Bar para citas en progreso */}
          {progress && (
            <View className="mt-2">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs text-gray-500">Progreso de cierre</Text>
                <Text className="text-xs text-gray-500">{progress.completed}/{progress.total}</Text>
              </View>
              <View className="w-full bg-gray-200 rounded-full h-2">
                <View 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${progress.percentage}%` }}
                />
              </View>
            </View>
          )}

          {/* Indicadores de requisitos */}
          <View className="flex-row items-center mt-2 space-x-4">
            {appointment.requiresConsent && (
              <View className="flex-row items-center">
                <Ionicons 
                  name={appointment.consentStatus === 'completed' ? 'document-text' : 'document-text-outline'} 
                  size={14} 
                  color={appointment.consentStatus === 'completed' ? '#10b981' : '#6b7280'} 
                />
                <Text className={`text-xs ml-1 ${appointment.consentStatus === 'completed' ? 'text-green-600' : 'text-gray-500'}`}>
                  Consentimiento
                </Text>
              </View>
            )}
            
            <View className="flex-row items-center">
              <Ionicons 
                name={appointment.evidenceStatus === 'completed' ? 'camera' : 'camera-outline'} 
                size={14} 
                color={appointment.evidenceStatus === 'completed' ? '#10b981' : '#6b7280'} 
              />
              <Text className={`text-xs ml-1 ${appointment.evidenceStatus === 'completed' ? 'text-green-600' : 'text-gray-500'}`}>
                Evidencia
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons 
                name={appointment.paymentStatus === 'completed' ? 'card' : 'card-outline'} 
                size={14} 
                color={appointment.paymentStatus === 'completed' ? '#10b981' : '#6b7280'} 
              />
              <Text className={`text-xs ml-1 ${appointment.paymentStatus === 'completed' ? 'text-green-600' : 'text-gray-500'}`}>
                Pago
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCommissionsTab = () => (
    <View className="px-6">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold text-gray-800">Mis Comisiones</Text>
        <TouchableOpacity 
          onPress={() => setShowCommissionModal(true)}
          className="bg-green-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">Solicitar Pago</Text>
        </TouchableOpacity>
      </View>

      <CommissionManager 
        pendingCommissions={pendingCommissions}
        paymentRequests={paymentRequests}
        stats={commissionStats}
        onGenerateRequest={() => setShowCommissionModal(true)}
      />
    </View>
  );

  const renderStatsTab = () => (
    <View className="px-6">
      <Text className="text-xl font-bold text-gray-800 mb-4">Estadísticas</Text>
      
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-800 mb-3">Rendimiento del Mes</Text>
        
        <View className="space-y-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600">Citas Completadas</Text>
            <Text className="font-semibold text-gray-800">47</Text>
          </View>
          
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600">Ingresos Generados</Text>
            <Text className="font-semibold text-gray-800">$2,850,000</Text>
          </View>
          
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600">Comisiones Ganadas</Text>
            <Text className="font-semibold text-green-600">$1,235,000</Text>
          </View>
          
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600">Promedio por Cita</Text>
            <Text className="font-semibold text-gray-800">$60,638</Text>
          </View>
        </View>
      </View>

      <View className="bg-white rounded-2xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-800 mb-3">Servicios Más Realizados</Text>
        
        {[
          { service: 'Tratamiento Facial', count: 15, earnings: 875000 },
          { service: 'Manicure + Esmaltado', count: 12, earnings: 425000 },
          { service: 'Corte + Tintura', count: 10, earnings: 650000 },
          { service: 'Depilación Láser', count: 8, earnings: 780000 },
          { service: 'Masaje Relajante', count: 6, earnings: 320000 }
        ].map((item, index) => (
          <View key={index} className="flex-row justify-between items-center py-2">
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">{item.service}</Text>
              <Text className="text-gray-500 text-sm">{item.count} servicios</Text>
            </View>
            <Text className="font-semibold text-gray-800">${(item.earnings / 1000).toFixed(0)}K</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // =====================================================
  // RENDER PRINCIPAL
  // =====================================================

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <LinearGradient
        colors={['#3b82f6', '#1e40af']}
        className="flex-1"
      >
        {renderHeader()}
        
        <View className="flex-1 bg-gray-50 rounded-t-3xl">
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            showsVerticalScrollIndicator={false}
            className="flex-1"
          >
            <View className="pt-6">
              {renderTabBar()}
              
              {activeTab === 'agenda' && renderAgendaTab()}
              {activeTab === 'commissions' && renderCommissionsTab()}
              {activeTab === 'stats' && renderStatsTab()}
            </View>
          </ScrollView>
        </View>

        {/* Modal de Cierre de Cita */}
        <AppointmentClosureValidator
          isVisible={showClosureModal}
          appointment={selectedAppointment}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          onClose={() => {
            setShowClosureModal(false);
            setSelectedAppointment(null);
            setCurrentStep('overview');
          }}
          onComplete={(completedAppointment) => {
            // Actualizar la cita en la lista
            const updatedAppointments = todayAppointments.map(apt => 
              apt.id === completedAppointment.id 
                ? { ...completedAppointment, status: 'completed', commissionGenerated: true }
                : apt
            );
            setTodayAppointments(updatedAppointments);
            setShowClosureModal(false);
            setSelectedAppointment(null);
            
            Alert.alert(
              'Cita Completada ✅',
              `Cita de ${completedAppointment.clientName} completada exitosamente.\n\nComisión generada: $${((completedAppointment.price * completedAppointment.commissionPercentage) / 100).toLocaleString()}`,
              [
                { text: 'Ver Comisiones', onPress: () => setActiveTab('commissions') },
                { text: 'Cerrar', style: 'cancel' }
              ]
            );
          }}
          businessRules={ruleChecks}
        />

        {/* Modal de Solicitud de Pago de Comisiones */}
        {/* <PaymentRequestGenerator
          isVisible={showCommissionModal}
          pendingCommissions={pendingCommissions}
          onClose={() => setShowCommissionModal(false)}
          onGenerate={handleGeneratePaymentRequest}
          isGenerating={isGenerating}
        /> */}
      </LinearGradient>
    </SafeAreaView>
  );
};

export default SpecialistDashboard;