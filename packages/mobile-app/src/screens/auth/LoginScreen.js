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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../../../shared/src/store/slices/authSlice';

const ROLE_CONFIG = {
  business: {
    title: 'Business / Propietario',
    icon: 'business',
    gradient: ['#8b5cf6', '#7c3aed'],
  },
  specialist: {
    title: 'Especialista',
    icon: 'cut',
    gradient: ['#ec4899', '#db2777'],
  },
  receptionist: {
    title: 'Recepcionista',
    icon: 'desktop',
    gradient: ['#06b6d4', '#0891b2'],
  },
};

export default function LoginScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  
  const selectedRole = route?.params?.role;
  const roleConfig = selectedRole ? ROLE_CONFIG[selectedRole.id] : ROLE_CONFIG.business;

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
        subdomain: formData.subdomain,
        role: selectedRole?.id || 'business'
      };

      const result = await dispatch(loginUser({ 
        credentials, 
        rememberMe: false 
      })).unwrap();

      if (result) {
        // Navegación exitosa basada en el rol
        const dashboardRoute = `Dashboard${selectedRole?.id === 'business' ? 'Business' : 
                               selectedRole?.id === 'specialist' ? 'Specialist' : 'Receptionist'}`;
        navigation.navigate(dashboardRoute);
      }
    } catch (error) {
      Alert.alert('Error de Login', error || 'Ha ocurrido un error al iniciar sesión');
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient 
        colors={['#f8fafc', '#e2e8f0']} 
        className="flex-1"
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-black/5">
            <TouchableOpacity 
              onPress={handleGoBack} 
              className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
            >
              <Ionicons name="chevron-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-800">
              Iniciar Sesión
            </Text>
            <View className="w-10" />
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="px-5 pb-10">
              {/* Role Header */}
              {selectedRole && (
                <View className="mt-5 mb-8">
                  <LinearGradient
                    colors={roleConfig.gradient}
                    className="flex-row items-center p-5 rounded-2xl shadow-lg"
                  >
                    <View className="w-15 h-15 rounded-full bg-white/20 items-center justify-center mr-4">
                      <Ionicons name={roleConfig.icon} size={32} color="#ffffff" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-white mb-1">
                        {roleConfig.title}
                      </Text>
                      <Text className="text-sm text-white/80">
                        Acceso especializado
                      </Text>
                    </View>
                  </LinearGradient>
                </View>
              )}

              {/* Welcome Text */}
              <View className="items-center mb-10">
                <Text className="text-3xl font-bold text-gray-800 text-center mb-2">
                  ¡Bienvenido de nuevo!
                </Text>
                <Text className="text-base text-gray-600 text-center leading-6">
                  Ingresa tus credenciales para acceder a tu cuenta
                </Text>
              </View>

              {/* Login Form */}
              <View className="bg-white rounded-3xl p-6 shadow-lg">
                {/* Subdomain Input */}
                <View className="mb-5">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Subdominio de tu salón
                  </Text>
                  <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 h-14">
                    <Ionicons name="business" size={20} color="#6b7280" style={{ marginRight: 12 }} />
                    <TextInput
                      className="flex-1 text-base text-gray-800"
                      placeholder="mi-salon"
                      value={formData.subdomain}
                      onChangeText={(text) => setFormData({ ...formData, subdomain: text.toLowerCase() })}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholderTextColor="#9ca3af"
                    />
                    <Text className="text-sm text-gray-600" style={{ marginLeft: 8 }}>
                      .beautycontrol.app
                    </Text>
                  </View>
                </View>

                {/* Email Input */}
                <View className="mb-5">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Correo electrónico
                  </Text>
                  <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 h-14">
                    <Ionicons name="mail" size={20} color="#6b7280" style={{ marginRight: 12 }} />
                    <TextInput
                      className="flex-1 text-base text-gray-800"
                      placeholder="tucorreo@example.com"
                      value={formData.email}
                      onChangeText={(text) => setFormData({ ...formData, email: text })}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View className="mb-6">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Contraseña
                  </Text>
                  <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 h-14">
                    <Ionicons name="lock-closed" size={20} color="#6b7280" style={{ marginRight: 12 }} />
                    <TextInput
                      className="flex-1 text-base text-gray-800"
                      placeholder="Tu contraseña"
                      value={formData.password}
                      onChangeText={(text) => setFormData({ ...formData, password: text })}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      placeholderTextColor="#9ca3af"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={{ padding: 8, marginLeft: 8 }}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off" : "eye"} 
                        size={20} 
                        color="#6b7280" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Error Message */}
                {error && (
                  <View className="mb-4 p-3 bg-red-50 rounded-xl border border-red-200">
                    <Text className="text-sm text-red-600 text-center">
                      {error}
                    </Text>
                  </View>
                )}

                {/* Login Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                  className="rounded-xl overflow-hidden shadow-lg mb-4"
                >
                  <LinearGradient
                    colors={roleConfig.gradient}
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 }}
                  >
                    {loading ? (
                      <Text className="text-base font-semibold text-white">
                        Iniciando sesión...
                      </Text>
                    ) : (
                      <>
                        <Text className="text-base font-semibold text-white" style={{ marginRight: 8 }}>
                          Iniciar Sesión
                        </Text>
                        <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Forgot Password */}
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text className="text-sm text-pink-500 font-medium text-center">
                    ¿Olvidaste tu contraseña?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}