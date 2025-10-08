import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '@shared/store/reactNativeStore';
import { useBranding } from '../../contexts/BrandingContext';
import BrandedButton from '../../components/BrandedButton';
import BrandedHeader from '../../components/BrandedHeader';

export default function DashboardScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { branding, colors, isLoading: brandingLoading } = useBranding();

  console.log('📱 Dashboard - Branding:', branding);
  console.log('📱 Dashboard - Colors:', colors);

  // 🛡️ VALIDACIÓN DE ACCESO POR ROL
  useEffect(() => {
    if (user && user.role) {
      const userRole = user.role.toLowerCase();
      // Solo permitir acceso a receptionists
      if (userRole !== 'receptionist') {
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

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', onPress: () => dispatch(logout()), style: 'destructive' }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con branding */}
      <BrandedHeader 
        title={branding?.businessName || 'Beauty Control'}
        subtitle={`Bienvenido, ${user?.firstName || 'Usuario'}`}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Card de Bienvenida con Logo */}
        <View style={styles.welcomeCard}>
          <LinearGradient
            colors={[colors.primary + '15', colors.secondary + '15']}
            style={styles.gradientBackground}
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
              ¡Bienvenido de nuevo!
            </Text>
            
            <Text style={styles.welcomeSubtitle}>
              {user?.firstName} {user?.lastName}
            </Text>
            
            {user?.role && (
              <View style={[styles.roleBadge, { backgroundColor: colors.secondary + '20', borderColor: colors.secondary }]}>
                <Ionicons name="person-circle-outline" size={16} color={colors.secondary} />
                <Text style={[styles.roleText, { color: colors.secondary }]}>
                  {user.role === 'receptionist' ? 'Recepcionista' : user.role}
                </Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Sección de Estadísticas Rápidas */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Resumen del Día</Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderLeftColor: colors.primary }]}>
              <Ionicons name="calendar-outline" size={32} color={colors.primary} />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Citas Hoy</Text>
            </View>
            
            <View style={[styles.statCard, { borderLeftColor: colors.secondary }]}>
              <Ionicons name="people-outline" size={32} color={colors.secondary} />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Clientes</Text>
            </View>
          </View>
        </View>

        {/* Acciones Rápidas */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          
          <BrandedButton 
            variant="primary" 
            onPress={() => Alert.alert('Nueva Cita', 'Funcionalidad en desarrollo')}
            style={styles.actionButton}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Nueva Cita</Text>
            </View>
          </BrandedButton>
          
          <BrandedButton 
            variant="secondary" 
            onPress={() => Alert.alert('Ver Agenda', 'Funcionalidad en desarrollo')}
            style={styles.actionButton}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="calendar-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Ver Agenda</Text>
            </View>
          </BrandedButton>
          
          <BrandedButton 
            variant="accent" 
            onPress={() => Alert.alert('Buscar Cliente', 'Funcionalidad en desarrollo')}
            style={styles.actionButton}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="search-outline" size={20} color="#1F2937" />
              <Text style={[styles.buttonText, { color: '#1F2937' }]}>Buscar Cliente</Text>
            </View>
          </BrandedButton>
        </View>

        {/* Botón de Cerrar Sesión */}
        <View style={styles.logoutSection}>
          <BrandedButton 
            variant="outline" 
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="log-out-outline" size={20} color={colors.primary} />
              <Text style={[styles.buttonText, { color: colors.primary }]}>Cerrar Sesión</Text>
            </View>
          </BrandedButton>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
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
  gradientBackground: {
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
    fontSize: 18,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 8,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  statsSection: {
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
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutSection: {
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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