import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Linking,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ENV from '../../config/env';

const { width, height } = Dimensions.get('window');

function WelcomeScreen({ navigation }) {
  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleSignUp = async () => {
    const subscribeUrl = ENV.subscribeUrl; // URL específica para registro/suscripción
    try {
      await Linking.openURL(subscribeUrl);
    } catch (error) {
      console.error('Error al abrir la URL:', error);
    }
  };

  const handleTerms = async () => {
    const termsUrl = 'https://controldenegocios.com/terminos';
    try {
      await Linking.openURL(termsUrl);
    } catch (error) {
      console.error('Error al abrir términos:', error);
    }
  };

  const handlePrivacy = async () => {
    const privacyUrl = 'https://controldenegocios.com/privacidad';
    try {
      await Linking.openURL(privacyUrl);
    } catch (error) {
      console.error('Error al abrir privacidad:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0']}
        style={styles.gradient}
      >
        {/* Header con logo - fijo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="cut" size={40} color="#ec4899" />
            </View>
            <Text style={styles.logoText}>Control de Negocios</Text>
            <Text style={styles.tagline}>Tu salón en la palma de tu mano</Text>
          </View>
        </View>

        {/* Contenido scrolleable */}
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Contenido principal */}
          <View style={styles.content}>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>¡Bienvenido!</Text>
              <Text style={styles.welcomeSubtitle}>
                Gestiona tu salón de belleza de manera profesional y eficiente
              </Text>
            </View>

            {/* Opciones principales */}
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[styles.optionButton, styles.primaryButton]}
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionIconContainer}>
                    <Ionicons name="log-in" size={32} color="#ffffff" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Iniciar Sesión</Text>
                    <Text style={styles.optionSubtitle}>
                      Accede con tu cuenta existente
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#ffffff" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionButton, styles.secondaryButton]}
                onPress={handleSignUp}
                activeOpacity={0.8}
              >
                <View style={styles.optionContent}>
                  <View style={[styles.optionIconContainer, styles.secondaryIconContainer]}>
                    <Ionicons name="storefront" size={32} color="#ec4899" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionTitle, styles.secondaryOptionTitle]}>
                      Crear Cuenta
                    </Text>
                    <Text style={[styles.optionSubtitle, styles.secondaryOptionSubtitle]}>
                      Registra tu negocio y comienza a gestionar
                    </Text>
                  </View>
                  <Ionicons name="open-outline" size={24} color="#ec4899" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Features destacados */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>¿Qué puedes hacer?</Text>
              <View style={styles.featuresGrid}>
                <View style={styles.featureItem}>
                  <Ionicons name="calendar" size={24} color="#ec4899" />
                  <Text style={styles.featureText}>Agenda digital</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="people" size={24} color="#ec4899" />
                  <Text style={styles.featureText}>Base de clientes</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="receipt" size={24} color="#ec4899" />
                  <Text style={styles.featureText}>Ventas y pagos</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="bar-chart" size={24} color="#ec4899" />
                  <Text style={styles.featureText}>Estadísticas</Text>
                </View>
              </View>
            </View>

            {/* Enlaces legales - REQUERIDO POR APP STORES */}
            <View style={styles.legalContainer}>
              <Text style={styles.legalText}>
                Al continuar, aceptas nuestros{' '}
              </Text>
              <View style={styles.legalLinks}>
                <TouchableOpacity onPress={handleTerms}>
                  <Text style={styles.legalLink}>Términos de Servicio</Text>
                </TouchableOpacity>
                <Text style={styles.legalText}> y </Text>
                <TouchableOpacity onPress={handlePrivacy}>
                  <Text style={styles.legalLink}>Política de Privacidad</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
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
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 40,
  },
  optionButton: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: '#ec4899',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#ec4899',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  secondaryIconContainer: {
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  secondaryOptionTitle: {
    color: '#1f2937',
  },
  optionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  secondaryOptionSubtitle: {
    color: '#6b7280',
  },
  featuresContainer: {
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
  legalContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  legalText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  legalLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 4,
  },
  legalLink: {
    fontSize: 12,
    color: '#ec4899',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default WelcomeScreen;