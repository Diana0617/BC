import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { loginUserRN } from '@shared/store/reactNativeStore';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    subdomain: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!formData.email || !formData.password || !formData.subdomain) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      const credentials = {
        email: formData.email,
        password: formData.password,
        subdomain: formData.subdomain
      };

      await dispatch(loginUserRN({ 
        credentials, 
        rememberMe: false 
      })).unwrap();

      // ✅ El sistema detecta automáticamente el rol del usuario
      // ✅ El AuthenticatedStack muestra el dashboard correcto según el rol
      // No se requiere navegación manual - Redux maneja el estado de autenticación
    } catch (error) {
      Alert.alert('Error de Login', error || 'Ha ocurrido un error al iniciar sesión');
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
      <LinearGradient 
        colors={['#1e293b', '#334155', '#475569']} 
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            paddingHorizontal: 24, 
            paddingVertical: 24, 
            paddingTop: 40 
          }}>
            <TouchableOpacity 
              onPress={handleGoBack} 
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#ffffff' }}>
              Iniciar Sesión
            </Text>
            <View style={{ width: 48 }} />
          </View>

          <ScrollView 
            style={{ flex: 1 }} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View style={{ paddingHorizontal: 24 }}>
              {/* Control de Negocios Logo */}
              <View style={{ alignItems: 'center', marginTop: 32, marginBottom: 32 }}>
                <LinearGradient
                  colors={['#ec4899', '#8b5cf6']}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                    elevation: 16,
                  }}
                >
                  <Image 
                    source={require('../../../assets/logo.png')} 
                    style={{ width: 50, height: 50 }}
                    resizeMode="contain"
                  />
                </LinearGradient>
                <Text style={{ 
                  fontSize: 32, 
                  fontWeight: 'bold', 
                  color: '#ffffff', 
                  marginBottom: 8,
                  textAlign: 'center'
                }}>
                  Control de Negocios
                </Text>
                <Text style={{ 
                  fontSize: 18, 
                  color: '#cbd5e1', 
                  textAlign: 'center' 
                }}>
                  Gestiona tu negocio profesionalmente
                </Text>
              </View>

              {/* Login Form Card */}
              <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 24,
                padding: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.3,
                shadowRadius: 30,
                elevation: 20,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}>
                <Text style={{ 
                  fontSize: 24, 
                  fontWeight: 'bold', 
                  color: '#1e293b', 
                  textAlign: 'center', 
                  marginBottom: 8 
                }}>
                  ¡Bienvenido de nuevo!
                </Text>
                <Text style={{ 
                  fontSize: 14, 
                  color: '#64748b', 
                  textAlign: 'center', 
                  marginBottom: 8,
                  fontWeight: '500'
                }}>
                  Accede a tu cuenta de Control de Negocios
                </Text>
                <Text style={{ 
                  fontSize: 12, 
                  color: '#94a3b8', 
                  textAlign: 'center', 
                  marginBottom: 24,
                  paddingHorizontal: 16
                }}>
                  Necesitas 3 datos: código de tu negocio, correo y contraseña
                </Text>

                {/* Subdomain Input - MEJORADO CON INSTRUCCIONES CLARAS */}
                <View style={{ marginBottom: 24, marginTop: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginLeft: 4 }}>
                    <Ionicons name="business" size={16} color="#ec4899" style={{ marginRight: 6 }} />
                    <Text style={{ 
                      fontSize: 14, 
                      fontWeight: '600', 
                      color: '#374151'
                    }}>
                      Código de tu negocio
                    </Text>
                  </View>
                  
                  {/* Instrucción explicativa */}
                  <View style={{
                    backgroundColor: '#fef3c7',
                    borderLeftWidth: 3,
                    borderLeftColor: '#f59e0b',
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 8,
                    marginBottom: 12,
                    marginHorizontal: 4
                  }}>
                    <Text style={{ fontSize: 12, color: '#92400e', fontWeight: '500' }}>
                      💡 Ingresa el identificador único de tu salón
                    </Text>
                    <Text style={{ fontSize: 11, color: '#78350f', marginTop: 4 }}>
                      Ejemplo: Si tu salón se llama "Bella Vista", ingresa: bella-vista
                    </Text>
                  </View>

                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#f8fafc',
                    borderWidth: 2,
                    borderColor: '#e2e8f0',
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    height: 64
                  }}>
                    <LinearGradient
                      colors={['#ec4899', '#8b5cf6']}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16
                      }}
                    >
                      <Ionicons name="business" size={18} color="#ffffff" />
                    </LinearGradient>
                    <TextInput
                      style={{
                        flex: 1,
                        fontSize: 18,
                        fontWeight: '600',
                        color: '#1e293b'
                      }}
                      placeholder="bella-vista"
                      value={formData.subdomain}
                      onChangeText={(text) => setFormData({ ...formData, subdomain: text.toLowerCase() })}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                  
                  {/* Hint del dominio completo */}
                  <Text style={{ 
                    fontSize: 12, 
                    color: '#64748b', 
                    marginTop: 8,
                    marginLeft: 4
                  }}>
                    Tu dominio completo: {formData.subdomain || 'tu-salon'}.controldenegocios.com
                  </Text>
                </View>

                {/* Error Message */}
                {error && (
                  <View style={{
                    marginBottom: 24,
                    padding: 16,
                    backgroundColor: '#fef2f2',
                    borderRadius: 16,
                    borderLeftWidth: 4,
                    borderLeftColor: '#ef4444'
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="alert-circle" size={20} color="#ef4444" />
                      <Text style={{ 
                        fontSize: 14, 
                        color: '#dc2626', 
                        marginLeft: 12, 
                        flex: 1 
                      }}>
                        {error}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Email Input */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ 
                    fontSize: 14, 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: 12, 
                    marginLeft: 4 
                  }}>
                    Correo electrónico
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#f8fafc',
                    borderWidth: 2,
                    borderColor: '#e2e8f0',
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    height: 64
                  }}>
                    <LinearGradient
                      colors={['#3b82f6', '#06b6d4']}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16
                      }}
                    >
                      <Ionicons name="mail" size={18} color="#ffffff" />
                    </LinearGradient>
                    <TextInput
                      style={{
                        flex: 1,
                        fontSize: 16,
                        fontWeight: '500',
                        color: '#1e293b'
                      }}
                      placeholder="tucorreo@example.com"
                      value={formData.email}
                      onChangeText={(text) => setFormData({ ...formData, email: text })}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={{ marginBottom: 32 }}>
                  <Text style={{ 
                    fontSize: 14, 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: 12, 
                    marginLeft: 4 
                  }}>
                    Contraseña
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#f8fafc',
                    borderWidth: 2,
                    borderColor: '#e2e8f0',
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    height: 64
                  }}>
                    <LinearGradient
                      colors={['#10b981', '#14b8a6']}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16
                      }}
                    >
                      <Ionicons name="lock-closed" size={18} color="#ffffff" />
                    </LinearGradient>
                    <TextInput
                      style={{
                        flex: 1,
                        fontSize: 16,
                        fontWeight: '500',
                        color: '#1e293b'
                      }}
                      placeholder="Tu contraseña"
                      value={formData.password}
                      onChangeText={(text) => setFormData({ ...formData, password: text })}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      placeholderTextColor="#94a3b8"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: 8
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off" : "eye"} 
                        size={20} 
                        color="#64748b" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                  style={{
                    borderRadius: 16,
                    overflow: 'hidden',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                    elevation: 8,
                    marginBottom: 24
                  }}
                >
                  <LinearGradient
                    colors={loading ? ['#94a3b8', '#64748b'] : ['#ec4899', '#8b5cf6']}
                    style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      paddingVertical: 18,
                      minHeight: 64
                    }}
                  >
                    {loading ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ 
                          fontSize: 18, 
                          fontWeight: 'bold', 
                          color: '#ffffff', 
                          marginRight: 8 
                        }}>
                          Iniciando sesión...
                        </Text>
                        <Ionicons name="reload" size={22} color="#ffffff" />
                      </View>
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ 
                          fontSize: 18, 
                          fontWeight: 'bold', 
                          color: '#ffffff', 
                          marginRight: 12 
                        }}>
                          Iniciar Sesión
                        </Text>
                        <Ionicons name="arrow-forward-circle" size={24} color="#ffffff" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Forgot Password */}
                <TouchableOpacity 
                  onPress={() => navigation.navigate('ForgotPassword')}
                  style={{ alignItems: 'center', paddingVertical: 12 }}
                  activeOpacity={0.7}
                >
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: '#ec4899' 
                  }}>
                    ¿Olvidaste tu contraseña?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Additional Space */}
              <View style={{ height: 32 }} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}