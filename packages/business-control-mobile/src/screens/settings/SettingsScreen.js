import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente de opción de configuración
 */
const SettingOption = ({ icon, title, subtitle, onPress, color = '#3b82f6' }) => (
  <TouchableOpacity onPress={onPress} style={styles.settingOption}>
    <View style={[styles.settingIconContainer, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={styles.settingTextContainer}>
      <Text style={styles.settingTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
  </TouchableOpacity>
);

export default function SettingsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configuración</Text>
        <Text style={styles.headerSubtitle}>Gestiona tu negocio</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sección: Pagos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pagos y Facturación</Text>

          <SettingOption
            icon="wallet-outline"
            title="Métodos de Pago"
            subtitle="Configura los métodos de pago disponibles"
            onPress={() => navigation.navigate('PaymentMethods')}
            color="#10b981"
          />

          <SettingOption
            icon="receipt-outline"
            title="Recibos y Facturas"
            subtitle="Próximamente"
            onPress={() => {}}
            color="#8b5cf6"
          />
        </View>

        {/* Sección: Negocio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Negocio</Text>

          <SettingOption
            icon="business-outline"
            title="Información del Negocio"
            subtitle="Próximamente"
            onPress={() => {}}
            color="#3b82f6"
          />

          <SettingOption
            icon="people-outline"
            title="Personal"
            subtitle="Próximamente"
            onPress={() => {}}
            color="#f59e0b"
          />

          <SettingOption
            icon="color-palette-outline"
            title="Personalización"
            subtitle="Próximamente"
            onPress={() => {}}
            color="#ec4899"
          />
        </View>

        {/* Sección: Servicios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Servicios</Text>

          <SettingOption
            icon="cut-outline"
            title="Servicios"
            subtitle="Próximamente"
            onPress={() => {}}
            color="#06b6d4"
          />

          <SettingOption
            icon="time-outline"
            title="Horarios"
            subtitle="Próximamente"
            onPress={() => {}}
            color="#8b5cf6"
          />
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
});