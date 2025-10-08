import React from 'react';
import { StatusBar } from 'expo-status-bar';
import StoreProvider from './src/store/StoreProvider';
import { BrandingProvider } from './src/contexts/BrandingContext';
import MainNavigator from './src/navigation/MainNavigator';

export default function App() {
  return (
    <StoreProvider>
      <BrandingProvider>
        <StatusBar style="auto" />
        <MainNavigator />
      </BrandingProvider>
    </StoreProvider>
  );
}
