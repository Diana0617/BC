import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../../shared/src/store/reactNativeStore.js';
import WebView from 'react-native-webview';

// Componentes de métricas
const MetricCard = ({ title, value, subtitle, icon, color, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
    <LinearGradient
      colors={[color, `${color}DD`]}
      className="p-4 rounded-2xl shadow-lg mb-4"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-white/80 text-sm font-medium mb-1">{title}</Text>
          <Text className="text-white text-2xl font-bold mb-1">{value}</Text>
          {subtitle && (
            <Text className="text-white/70 text-xs">{subtitle}</Text>
          )}
        </View>
        <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
          <Ionicons name={icon} size={24} color="#ffffff" />
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const FilterButton = ({ title, isActive, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`px-4 py-2 rounded-full mr-3 ${
      isActive ? 'bg-purple-600' : 'bg-gray-100'
    }`}
  >
    <Text className={`text-sm font-medium ${
      isActive ? 'text-white' : 'text-gray-600'
    }`}>
      {title}
    </Text>
  </TouchableOpacity>
);

export default function BusinessDashboard({ navigation }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  // 🛡️ VALIDACIÓN DE ACCESO POR ROL
  useEffect(() => {
    if (user && user.role) {
      const userRole = user.role.toLowerCase();
      // Solo permitir acceso a business (propietario del negocio)
      if (userRole !== 'business') {
        Alert.alert(
          'Acceso Denegado',
          'No tienes permisos para acceder a esta sección. Serás redirigido a tu dashboard.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Redirigir al dashboard correcto según el rol
                const roleToRoute = {
                  'specialist': 'DashboardSpecialist',
                  'receptionist': 'DashboardReceptionist'
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
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedSpecialist, setSelectedSpecialist] = useState('all');
  const [showWebView, setShowWebView] = useState(false);
  
  // Estado de métricas (temporal - luego conectar con Redux)
  const [metrics, setMetrics] = useState({
    sales: { value: '$1,250,000', subtitle: '+15% vs ayer' },
    income: { value: '$980,000', subtitle: 'Ingresos netos' },
    appointments: { value: '24', subtitle: '8 completados hoy' },
    cancelled: { value: '3', subtitle: '12% cancelación' },
    expenses: { value: '$270,000', subtitle: 'Gastos del día' }
  });

  const periods = [
    { id: 'today', title: 'Hoy' },
    { id: 'yesterday', title: 'Ayer' },
    { id: 'week', title: 'Esta Semana' },
    { id: 'month', title: 'Este Mes' },
  ];

  const specialists = [
    { id: 'all', title: 'Todos' },
    { id: 'maria', title: 'María' },
    { id: 'lucia', title: 'Lucía' },
    { id: 'ana', title: 'Ana' },
  ];

  useEffect(() => {
    loadMetrics();
  }, [selectedPeriod, selectedSpecialist]);

  const loadMetrics = async () => {
    // Aquí irá la llamada a la API para cargar métricas
    // Simulamos carga
    try {
      // dispatch(fetchBusinessMetrics({ period: selectedPeriod, specialist: selectedSpecialist }));
    } catch (error) {
      console.log('Error loading metrics:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMetrics();
    setRefreshing(false);
  };

  const openWebApp = () => {
    setShowWebView(true);
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

  const getWebViewUrl = () => {
    const subdomain = user?.business?.subdomain || 'demo';
    const baseUrl = 'http://localhost:3000'; // FRONTEND_URL del .env
    const token = user?.token || '';
    
    // URL con autenticación automática
    return `${baseUrl}/${subdomain}/dashboard?token=${token}&mobile=true`;
  };

  if (showWebView) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <TouchableOpacity
            onPress={() => setShowWebView(false)}
            className="flex-row items-center"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
            <Text className="ml-2 text-lg font-semibold text-gray-800">
              Panel Completo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowWebView(false)}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
        
        <WebView
          source={{ uri: getWebViewUrl() }}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            Alert.alert('Error', 'No se pudo cargar la página web');
            setShowWebView(false);
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-800">
              ¡Hola, {user?.firstName || 'Propietario'}!
            </Text>
            <Text className="text-sm text-gray-600">
              Resumen de tu negocio
            </Text>
          </View>
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity
              onPress={openWebApp}
              className="bg-purple-600 px-4 py-2 rounded-xl flex-row items-center"
            >
              <Ionicons name="desktop" size={16} color="#ffffff" />
              <Text className="text-white text-sm font-medium ml-2">
                Panel Completo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-red-500 px-3 py-2 rounded-xl flex-row items-center"
            >
              <Ionicons name="log-out-outline" size={16} color="#ffffff" />
              <Text className="text-white text-sm font-medium ml-1">
                Salir
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="p-5">
          {/* Filtros de Período */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Período
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {periods.map((period) => (
                <FilterButton
                  key={period.id}
                  title={period.title}
                  isActive={selectedPeriod === period.id}
                  onPress={() => setSelectedPeriod(period.id)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Filtros de Especialista */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Especialista
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {specialists.map((specialist) => (
                <FilterButton
                  key={specialist.id}
                  title={specialist.title}
                  isActive={selectedSpecialist === specialist.id}
                  onPress={() => setSelectedSpecialist(specialist.id)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Métricas Principales */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Métricas de Ventas
            </Text>
            
            <MetricCard
              title="Ventas Totales"
              value={metrics.sales.value}
              subtitle={metrics.sales.subtitle}
              icon="trending-up"
              color="#8b5cf6"
            />
            
            <MetricCard
              title="Ingresos Netos"
              value={metrics.income.value}
              subtitle={metrics.income.subtitle}
              icon="wallet"
              color="#10b981"
            />
          </View>

          {/* Métricas de Turnos */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Gestión de Turnos
            </Text>
            
            <View className="flex-row justify-between mb-4">
              <View className="flex-1 mr-2">
                <MetricCard
                  title="Turnos del Día"
                  value={metrics.appointments.value}
                  subtitle={metrics.appointments.subtitle}
                  icon="calendar"
                  color="#3b82f6"
                />
              </View>
              <View className="flex-1 ml-2">
                <MetricCard
                  title="Cancelados"
                  value={metrics.cancelled.value}
                  subtitle={metrics.cancelled.subtitle}
                  icon="close-circle"
                  color="#ef4444"
                />
              </View>
            </View>
          </View>

          {/* Análisis Financiero */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Análisis Financiero
            </Text>
            
            <MetricCard
              title="Gastos del Período"
              value={metrics.expenses.value}
              subtitle={metrics.expenses.subtitle}
              icon="receipt"
              color="#f59e0b"
            />
            
            {/* Balance Resumen */}
            <View className="bg-white rounded-2xl p-4 shadow-sm">
              <Text className="text-base font-semibold text-gray-800 mb-2">
                Balance Resumen
              </Text>
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-sm text-gray-600">Ingresos - Gastos</Text>
                  <Text className="text-xl font-bold text-green-600">
                    $710,000
                  </Text>
                </View>
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-sm font-medium text-green-700">
                    +72% ganancia
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Acceso Rápido */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Acceso Rápido
            </Text>
            
            <TouchableOpacity
              onPress={openWebApp}
              className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-purple-600"
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-base font-semibold text-gray-800">
                    Gestión Completa
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    Accede a todas las funcionalidades avanzadas
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8b5cf6" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}