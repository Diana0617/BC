import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@shared/store/reactNativeStore';
import { useBranding } from '../../contexts/BrandingContext';
import BrandedButton from '../../components/BrandedButton';
import BrandedHeader from '../../components/BrandedHeader';
import ENV from '../../config/env';

// Componentes de métricas
const MetricCard = ({ title, value, subtitle, icon, color, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.metricCard}>
    <LinearGradient
      colors={[color, `${color}DD`]}
      style={styles.metricGradient}
    >
      <View style={styles.metricContent}>
        <View style={styles.metricTextContainer}>
          <Text style={styles.metricTitle}>{title}</Text>
          <Text style={styles.metricValue}>{value}</Text>
          {subtitle && (
            <Text style={styles.metricSubtitle}>{subtitle}</Text>
          )}
        </View>
        <View style={styles.metricIconContainer}>
          <Ionicons name={icon} size={24} color="#ffffff" />
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

export default function BusinessDashboard({ navigation }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { branding, colors, isLoading: brandingLoading } = useBranding();
  
  console.log('📱 Business Dashboard - User:', user);
  console.log('📱 Business Dashboard - User.businessId:', user?.businessId);
  console.log('📱 Business Dashboard - Branding:', branding);
  console.log('📱 Business Dashboard - Colors:', colors);
  console.log('📱 Business Dashboard - Logo:', branding?.logo);
  
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
  
  // Estado de métricas (temporal - luego conectar con Redux)
  const [metrics, setMetrics] = useState({
    sales: { value: '$1,250,000', subtitle: '+15% vs ayer' },
    income: { value: '$980,000', subtitle: 'Ingresos netos' },
    appointments: { value: '24', subtitle: '8 completados hoy' },
    cancelled: { value: '3', subtitle: '12% cancelación' },
    expenses: { value: '$270,000', subtitle: 'Gastos del día' }
  });

  useEffect(() => {
    loadMetrics();
  }, []);

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

  const openWebApp = async () => {
    const subdomain = user?.business?.subdomain || 'demo-salon';
    const baseUrl = ENV.webUrl; // https://bc-nine-alpha.vercel.app (sin /subscribe)
    const url = `${baseUrl}`;
    
    console.log('🌐 Abriendo URL en navegador:', url);
    
    try {
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `No se puede abrir la URL: ${url}`);
      }
    } catch (error) {
      console.error('Error abriendo navegador:', error);
      Alert.alert('Error', 'No se pudo abrir el navegador web');
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con branding */}
      <BrandedHeader 
        title={branding?.businessName || user?.business?.name || 'Beauty Control'}
        subtitle={`¡Hola, ${user?.firstName || 'Propietario'}!`}
        rightComponent={
          <TouchableOpacity onPress={handleLogout} style={styles.logoutIconButton}>
            <Ionicons name="log-out-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Card de Bienvenida con Logo */}
          <View style={styles.welcomeCard}>
            <LinearGradient
              colors={[colors.primary + '15', colors.secondary + '15']}
              style={styles.welcomeGradient}
            >
              {branding?.logo && (
                <View style={styles.logoContainer}>
                  <Image 
                    source={{ uri: branding.logo }}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
              )}
              
              <Text style={[styles.welcomeTitle, { color: colors.primary }]}>
                Panel de Control
              </Text>
              
              <Text style={styles.welcomeSubtitle}>
                Resumen de tu negocio
              </Text>
            </LinearGradient>
          </View>

          {/* Métricas Principales */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Métricas de Ventas</Text>
            
            <MetricCard
              title="Ventas Totales"
              value={metrics.sales.value}
              subtitle={metrics.sales.subtitle}
              icon="trending-up"
              color={colors.primary}
            />
            
            <MetricCard
              title="Ingresos Netos"
              value={metrics.income.value}
              subtitle={metrics.income.subtitle}
              icon="wallet"
              color={colors.secondary}
            />
          </View>

          {/* Métricas de Turnos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gestión de Turnos</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statHalf}>
                <MetricCard
                  title="Turnos del Día"
                  value={metrics.appointments.value}
                  subtitle={metrics.appointments.subtitle}
                  icon="calendar"
                  color={colors.accent}
                />
              </View>
              <View style={styles.statHalf}>
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

          {/* Botones de Acción */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
            
            <BrandedButton
              variant="primary"
              onPress={openWebApp}
              style={styles.actionButton}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="desktop" size={20} color="#fff" />
                <Text style={styles.buttonText}>Panel Completo Web</Text>
              </View>
            </BrandedButton>
            
            <BrandedButton
              variant="outline"
              onPress={handleLogout}
              style={styles.actionButton}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="log-out-outline" size={20} color={colors.primary} />
                <Text style={[styles.buttonText, { color: colors.primary }]}>Cerrar Sesión</Text>
              </View>
            </BrandedButton>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  logoutIconButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  welcomeCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeGradient: {
    padding: 24,
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statHalf: {
    flex: 1,
  },
  metricCard: {
    marginBottom: 16,
  },
  metricGradient: {
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  metricContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricTextContainer: {
    flex: 1,
  },
  metricTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  metricValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    marginBottom: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});