import React from 'react';
import { StatusBar } from 'expo-status-bar';
import StoreProvider from './src/store/StoreProvider';
import MainNavigator from './src/navigation/MainNavigator';

export default function App() {
  return (
    <StoreProvider>
      <StatusBar style="auto" />
      <MainNavigator />
    </StoreProvider>
  );
}
