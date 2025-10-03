import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import {
  store,
  loginUserRN,
  logout as logoutAction,
  clearError,
  selectIsAuthenticated,
  selectIsLoggingIn,
  selectLoginError,
  selectUser
} from '@bc/shared/store/reactNativeStore';
import { StorageHelper } from '@bc/shared/utils/storage';
import { STORAGE_KEYS } from '@bc/shared/constants/api';

const DEFAULT_SUBDOMAIN = 'salon-prueba';

const ROLE_CONFIG = {
  BUSINESS: {
    label: 'Propietario del negocio',
    description: 'Gestión completa del negocio',
    email: 'owner@salon-prueba.com',
    password: 'Owner123!',
    accentColor: '#3B82F6',
    emoji: '💼'
  },
  SPECIALIST: {
    label: 'Especialista',
    description: 'Agenda personal, clientes y servicios',
    email: 'specialist@salon-prueba.com',
    password: 'Specialist123!',
    accentColor: '#10B981',
    emoji: '✨'
  },
  RECEPTIONIST: {
    label: 'Recepcionista',
    description: 'Atención al cliente y programación',
    email: 'receptionist@salon-prueba.com',
    password: 'Reception123!',
    accentColor: '#F59E0B',
    emoji: '📞'
  }
};

const ROLE_FEATURES = {
  BUSINESS: [
    { title: '📊 Panel general', description: 'Resumen completo del negocio', color: '#3B82F6' },
    { title: '👥 Equipo y roles', description: 'Gestiona especialistas y recepcionistas', color: '#8B5CF6' },
    { title: '📅 Agenda del negocio', description: 'Todas las citas del día', color: '#10B981' },
    { title: '📈 Reportes y métricas', description: 'Analiza el rendimiento financiero', color: '#F59E0B' },
    { title: '⚙️ Configuración avanzada', description: 'Personaliza planes y módulos', color: '#6B7280' }
  ],
  SPECIALIST: [
    { title: '📅 Mi agenda', description: 'Citas asignadas para hoy', color: '#10B981' },
    { title: '👤 Mis clientes', description: 'Historial y notas rápidas', color: '#3B82F6' },
    { title: '💇‍♀️ Servicios asignados', description: 'Gestiona tus servicios y precios', color: '#8B5CF6' },
    { title: '📊 Rendimiento personal', description: 'Seguimiento de comisiones y ventas', color: '#F59E0B' }
  ],
  RECEPTIONIST: [
    { title: '➕ Nueva cita', description: 'Agenda clientes en segundos', color: '#10B981' },
    { title: '📅 Agenda del día', description: 'Controla el flujo del salón', color: '#3B82F6' },
    { title: '👥 Gestión de clientes', description: 'Actualiza datos de contacto', color: '#8B5CF6' },
    { title: '💰 Caja rápida', description: 'Pagos y recibos desde recepción', color: '#F59E0B' }
  ]
};

const AuthenticatedDashboard = ({ user, onLogout }) => {
  const role = user?.role;
  const features = ROLE_FEATURES[role] ?? [];
  const fullName = useMemo(() => {
    if (!user) return '';
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
    return name.length > 0 ? name : user.email;
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>¡Bienvenido a Business Control!</Text>
        <Text style={styles.userName}>{fullName}</Text>
        <Text style={styles.roleBadge}>{ROLE_CONFIG[role]?.label || role}</Text>
        {user?.business?.name ? (
          <Text style={styles.businessName}>Negocio: {user.business.name}</Text>
        ) : null}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.dashboardContainer} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.dashboardTitle}>Tu espacio de trabajo</Text>
        {features.map((feature, index) => (
          <View key={`${feature.title}-${index}`} style={[styles.featureCard, { borderLeftColor: feature.color }]}>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </View>
        ))}
        {features.length === 0 && (
          <Text style={styles.emptyState}>Tu rol aún no tiene secciones configuradas.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const LoginScreen = ({
  email,
  password,
  subdomain,
  rememberMe,
  selectedRole,
  isLoading,
  error,
  onRoleSelect,
  onEmailChange,
  onPasswordChange,
  onSubdomainChange,
  onRememberChange,
  onSubmit
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.loginScrollContent}>
        <Text style={styles.title}>Business Control</Text>
        <Text style={styles.subtitle}>Autenticación conectada al backend</Text>

        <View style={styles.loginContainer}>
          <Text style={styles.loginTitle}>Selecciona un rol de prueba</Text>
          {Object.entries(ROLE_CONFIG).map(([roleKey, roleData]) => {
            const isActive = selectedRole === roleKey;
            return (
              <TouchableOpacity
                key={roleKey}
                style={[styles.roleButton, { borderLeftColor: roleData.accentColor }, isActive && styles.roleButtonActive]}
                onPress={() => onRoleSelect(roleKey)}
                disabled={isLoading}
              >
                <Text style={styles.roleButtonText}>
                  {roleData.emoji} {roleData.label.toUpperCase()}
                </Text>
                <Text style={styles.roleDescription}>{roleData.description}</Text>
                <Text style={styles.roleHint}>Email de prueba: {roleData.email}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.form}>
          <Text style={styles.formLabel}>Subdominio del negocio</Text>
          <TextInput
            style={styles.input}
            value={subdomain}
            onChangeText={onSubdomainChange}
            placeholder="salon-prueba"
            autoCapitalize="none"
            editable={!isLoading}
          />

          <Text style={styles.formLabel}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={onEmailChange}
            placeholder="usuario@salon-prueba.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!isLoading}
          />

          <Text style={styles.formLabel}>Contraseña</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={onPasswordChange}
            placeholder="••••••••"
            secureTextEntry
            editable={!isLoading}
          />

          <View style={styles.rememberMeRow}>
            <Text style={styles.rememberMeLabel}>Recordar correo</Text>
            <Switch value={rememberMe} onValueChange={onRememberChange} disabled={isLoading} />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submitButton, (isLoading || !email || !password) && styles.submitButtonDisabled]}
            onPress={onSubmit}
            disabled={isLoading || !email || !password}
          >
            {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitButtonText}>Iniciar sesión</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const MainApp = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoggingIn);
  const loginError = useSelector(selectLoginError);
  const user = useSelector(selectUser);

  const [selectedRole, setSelectedRole] = useState('BUSINESS');
  const [email, setEmail] = useState(ROLE_CONFIG.BUSINESS.email);
  const [password, setPassword] = useState(ROLE_CONFIG.BUSINESS.password);
  const [subdomain, setSubdomain] = useState(DEFAULT_SUBDOMAIN);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const remembered = await StorageHelper.getItemAsync(STORAGE_KEYS.REMEMBER_EMAIL);
        if (remembered && mounted) {
          setEmail(remembered);
        }
      } catch (storageError) {
        console.warn('No se pudo leer el correo recordado:', storageError);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRoleSelect = useCallback((roleKey) => {
    setSelectedRole(roleKey);
    const roleData = ROLE_CONFIG[roleKey];
    if (roleData) {
      setEmail(roleData.email);
      setPassword(roleData.password);
    }
  }, []);

  const handleLogin = useCallback(async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const payload = {
      credentials: {
        email: trimmedEmail,
        password: password.trim(),
        businessCode: subdomain.trim()
      },
      rememberMe
    };

    dispatch(clearError());

    try {
      await dispatch(loginUserRN(payload)).unwrap();

      if (rememberMe) {
        await StorageHelper.setItemAsync(STORAGE_KEYS.REMEMBER_EMAIL, trimmedEmail);
      } else {
        await StorageHelper.removeItemAsync(STORAGE_KEYS.REMEMBER_EMAIL);
      }
    } catch (error) {
      console.log('Error iniciando sesión:', error);
    }
  }, [dispatch, email, password, subdomain, rememberMe]);

  const handleLogout = useCallback(async () => {
    try {
      await Promise.all([
        StorageHelper.removeItemAsync(STORAGE_KEYS.AUTH_TOKEN),
        StorageHelper.removeItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        StorageHelper.removeItemAsync(STORAGE_KEYS.USER_DATA)
      ]);
    } catch (storageError) {
      console.warn('Error limpiando las credenciales:', storageError);
    }
    dispatch(logoutAction());
  }, [dispatch]);

  if (isAuthenticated && user) {
    return <AuthenticatedDashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <LoginScreen
      email={email}
      password={password}
      subdomain={subdomain}
      rememberMe={rememberMe}
      selectedRole={selectedRole}
      isLoading={isLoading}
      error={loginError}
      onRoleSelect={handleRoleSelect}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubdomainChange={setSubdomain}
      onRememberChange={setRememberMe}
      onSubmit={handleLogin}
    />
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <MainApp />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  loginScrollContent: {
    paddingTop: 48,
    paddingBottom: 60
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1E293B',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#64748B',
    marginBottom: 24,
    paddingHorizontal: 20
  },
  loginContainer: {
    paddingHorizontal: 20
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#374151',
    marginBottom: 16
  },
  roleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  roleButtonActive: {
    borderWidth: 1,
    borderColor: '#0EA5E9'
  },
  roleButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4
  },
  roleDescription: {
    fontSize: 14,
    color: '#6B7280'
  },
  roleHint: {
    marginTop: 8,
    fontSize: 13,
    color: '#0EA5E9'
  },
  form: {
    marginTop: 24,
    paddingHorizontal: 20
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  rememberMeLabel: {
    fontSize: 15,
    color: '#334155'
  },
  errorText: {
    color: '#DC2626',
    marginBottom: 16,
    textAlign: 'center'
  },
  submitButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center'
  },
  submitButtonDisabled: {
    backgroundColor: '#94A3B8'
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748B'
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 4
  },
  roleBadge: {
    marginTop: 4,
    fontSize: 14,
    color: '#0EA5E9',
    fontWeight: '600'
  },
  businessName: {
    marginTop: 4,
    fontSize: 14,
    color: '#475569'
  },
  logoutButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  dashboardContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24
  },
  dashboardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'center'
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4
  },
  featureDescription: {
    fontSize: 14,
    color: '#475569'
  },
  emptyState: {
    textAlign: 'center',
    padding: 16,
    color: '#94A3B8'
  }
});