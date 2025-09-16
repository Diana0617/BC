import React from 'react';
import './global.css'; // Importar estilos de NativeWind
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Redux store provider
import StoreProvider from './src/store/StoreProvider';

// Navegación principal
import MainNavigator from './src/navigation/MainNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoreProvider>
          <MainNavigator />
          <StatusBar style="auto" />
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
