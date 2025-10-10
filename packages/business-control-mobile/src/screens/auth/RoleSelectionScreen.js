import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const ROLES = [
  {
    id: 'business',
    title: 'Business / Propietario',
    subtitle: 'Administra todo tu negocio',
    description: 'Acceso completo a todas las funcionalidades, reportes y configuraciones del sistema.',
    icon: 'business',
    color: '#8b5cf6',
    features: ['Reportes completos', 'Gestión de empleados', 'Configuración del negocio', 'Análisis de ventas'],
  },
  {
    id: 'specialist',
    title: 'Especialista',
    subtitle: 'Gestiona tus servicios y citas',
    description: 'Administra tu agenda, clientes y servicios de manera independiente.',
    icon: 'cut',
    color: '#ec4899',
    features: ['Agenda personal', 'Historial de clientes', 'Gestión de servicios', 'Comisiones'],
  },
  {
    id: 'receptionist_specialist',
    title: 'Recepcionista-Especialista',
    subtitle: 'Doble rol: Recepción y Servicios',
    description: 'Gestiona la recepción y también presta servicios como especialista.',
    icon: 'people-circle',
    color: '#10b981',
    features: ['Gestión de citas', 'Agenda personal', 'Atención al cliente', 'Servicios propios'],
  },
  {
    id: 'receptionist',
    title: 'Recepcionista',
    subtitle: 'Gestiona la recepción y citas',
    description: 'Controla las citas, pagos y atención al cliente en recepción.',
    icon: 'desktop',
    color: '#06b6d4',
    features: ['Agenda general', 'Gestión de pagos', 'Atención al cliente', 'Reportes básicos'],
  },
];

function RoleSelectionScreen({ navigation }) {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      navigation.navigate('Login', { role: selectedRole });
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Selecciona tu rol</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>¿Cuál es tu función?</Text>
              <Text style={styles.subtitle}>
                Selecciona el rol que mejor describa tu función en el salón
              </Text>
            </View>

            <View style={styles.rolesContainer}>
              {ROLES.map((role) => (
                <TouchableOpacity
                  key={role.id}
                  style={[
                    styles.roleCard,
                    selectedRole?.id === role.id && styles.selectedCard,
                  ]}
                  onPress={() => handleRoleSelect(role)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      selectedRole?.id === role.id
                        ? [role.color, `${role.color}dd`]
                        : ['#ffffff', '#ffffff']
                    }
                    style={styles.cardGradient}
                  >
                    {/* Header del card */}
                    <View style={styles.cardHeader}>
                      <View style={[
                        styles.iconContainer,
                        { backgroundColor: selectedRole?.id === role.id ? 'rgba(255,255,255,0.2)' : `${role.color}15` }
                      ]}>
                        <Ionicons 
                          name={role.icon} 
                          size={32} 
                          color={selectedRole?.id === role.id ? '#ffffff' : role.color} 
                        />
                      </View>
                      {selectedRole?.id === role.id && (
                        <View style={styles.checkContainer}>
                          <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
                        </View>
                      )}
                    </View>

                    {/* Contenido del card */}
                    <View style={styles.cardContent}>
                      <Text style={[
                        styles.roleTitle,
                        selectedRole?.id === role.id && styles.selectedText
                      ]}>
                        {role.title}
                      </Text>
                      <Text style={[
                        styles.roleSubtitle,
                        selectedRole?.id === role.id && styles.selectedSubtext
                      ]}>
                        {role.subtitle}
                      </Text>
                      <Text style={[
                        styles.roleDescription,
                        selectedRole?.id === role.id && styles.selectedSubtext
                      ]}>
                        {role.description}
                      </Text>

                      {/* Features */}
                      <View style={styles.featuresContainer}>
                        {role.features.map((feature, index) => (
                          <View key={index} style={styles.featureItem}>
                            <Ionicons 
                              name="checkmark" 
                              size={16} 
                              color={selectedRole?.id === role.id ? '#ffffff' : role.color} 
                            />
                            <Text style={[
                              styles.featureText,
                              selectedRole?.id === role.id && styles.selectedSubtext
                            ]}>
                              {feature}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer con botón de continuar */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedRole && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={!selectedRole}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.continueButtonText,
              !selectedRole && styles.disabledButtonText,
            ]}>
              Continuar
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={!selectedRole ? '#9ca3af' : '#ffffff'} 
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  titleContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  rolesContainer: {
    gap: 20,
  },
  roleCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedCard: {
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    gap: 8,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  selectedText: {
    color: '#ffffff',
  },
  roleSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  selectedSubtext: {
    color: 'rgba(255,255,255,0.9)',
  },
  roleDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  featuresContainer: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  continueButton: {
    backgroundColor: '#ec4899',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#e5e7eb',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  disabledButtonText: {
    color: '#9ca3af',
  },
});

export default RoleSelectionScreen;