// =====================================================
// WOMPI INTEGRATION - Integración de pagos Wompi
// =====================================================
// Componente placeholder para integración futura con Wompi
// =====================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const WompiIntegration = ({
  config,
  amount,
  appointment,
  onSuccess,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleWompiPayment = async () => {
    setLoading(true);
    
    try {
      // Placeholder para integración real con Wompi
      Alert.alert(
        'Integración Wompi',
        'Esta funcionalidad estará disponible próximamente.\n\nPor ahora, usa los otros métodos de pago disponibles.',
        [
          { text: 'Entendido', onPress: onCancel }
        ]
      );
      
      // Cuando se implemente la integración real:
      /*
      const wompiData = {
        amount: amount * 100, // Wompi maneja centavos
        currency: 'COP',
        reference: appointment.id,
        description: `Pago cita ${appointment.service?.name}`,
        customer: {
          phone_number: appointment.client?.phone,
          full_name: appointment.client?.name
        }
      };
      
      const result = await initializeWompiPayment(wompiData);
      onSuccess?.(result);
      */
      
    } catch (error) {
      console.error('Error with Wompi payment:', error);
      Alert.alert('Error', 'No se pudo procesar el pago con Wompi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pago con Wompi</Text>
        <Text style={styles.subtitle}>Pago seguro en línea</Text>
      </View>

      {/* Monto */}
      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>Monto a pagar</Text>
        <Text style={styles.amountValue}>{formatCurrency(amount)}</Text>
      </View>

      {/* Información */}
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#10b981" />
          <Text style={styles.infoTitle}>Pago seguro</Text>
        </View>
        <Text style={styles.infoText}>
          Tu pago será procesado de forma segura a través de Wompi, 
          una plataforma de pagos certificada en Colombia.
        </Text>
      </View>

      {/* Estado de desarrollo */}
      <View style={styles.developmentCard}>
        <View style={styles.developmentHeader}>
          <Ionicons name="construct-outline" size={24} color="#f59e0b" />
          <Text style={styles.developmentTitle}>En desarrollo</Text>
        </View>
        <Text style={styles.developmentText}>
          La integración completa con Wompi estará disponible próximamente. 
          Por ahora puedes usar los otros métodos de pago disponibles.
        </Text>
      </View>

      {/* Botones */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Volver</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.payButton, styles.disabledButton]}
          onPress={handleWompiPayment}
          disabled={true} // Deshabilitado hasta implementar
        >
          <Text style={styles.payButtonText}>
            {loading ? 'Procesando...' : 'Pagar con Wompi'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Métodos de pago soportados */}
      <View style={styles.methodsCard}>
        <Text style={styles.methodsTitle}>Métodos disponibles con Wompi:</Text>
        <View style={styles.methodsList}>
          <View style={styles.methodItem}>
            <Ionicons name="card-outline" size={20} color="#6b7280" />
            <Text style={styles.methodText}>Tarjetas de crédito/débito</Text>
          </View>
          <View style={styles.methodItem}>
            <Ionicons name="phone-portrait-outline" size={20} color="#6b7280" />
            <Text style={styles.methodText}>Nequi</Text>
          </View>
          <View style={styles.methodItem}>
            <Ionicons name="cash-outline" size={20} color="#6b7280" />
            <Text style={styles.methodText}>Efecty</Text>
          </View>
          <View style={styles.methodItem}>
            <Ionicons name="business-outline" size={20} color="#6b7280" />
            <Text style={styles.methodText}>PSE</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  header: {
    alignItems: 'center',
    marginBottom: 24,
  },

  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },

  amountCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },

  amountLabel: {
    fontSize: 14,
    color: '#3b82f6',
    marginBottom: 4,
  },

  amountValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },

  infoCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },

  infoText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },

  developmentCard: {
    backgroundColor: '#fefbeb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fde68a',
  },

  developmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  developmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },

  developmentText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },

  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },

  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },

  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },

  payButton: {
    backgroundColor: '#3b82f6',
  },

  disabledButton: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },

  payButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },

  methodsCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },

  methodsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },

  methodsList: {
    gap: 8,
  },

  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  methodText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
});

export default WompiIntegration;