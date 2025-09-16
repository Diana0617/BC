import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../../shared/src/store/reactNativeStore.js';

// Importar screens
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import BusinessDashboard from '../screens/dashboards/BusinessDashboard';
import SpecialistDashboard from '../screens/dashboards/SpecialistDashboard';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

// Iconos
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack de autenticación
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

// Stack principal autenticado con dashboards específicos
function AuthenticatedStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      {/* Dashboards específicos por rol */}
      <Stack.Screen name="DashboardBusiness" component={BusinessDashboard} />
      <Stack.Screen name="DashboardSpecialist" component={SpecialistDashboard} />
      <Stack.Screen name="DashboardReceptionist" component={DashboardScreen} />
      {/* Otras pantallas principales */}
      <Stack.Screen name="Tabs" component={MainTabs} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

// Tabs principales (cuando está autenticado)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ec4899', // business.pink
        tabBarInactiveTintColor: '#6b7280', // gray.500
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb', // gray.200
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: '#ffffff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
          color: '#1f2937', // gray.800
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Perfil' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Configuración' }}
      />
    </Tab.Navigator>
  );
}

// Navegador principal
export default function MainNavigator() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen name="Authenticated" component={AuthenticatedStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}