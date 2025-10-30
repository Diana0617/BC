import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Selector de método de pago para cierre de turno
 * Muestra los métodos configurados por el negocio y permite seleccionar uno
 * ACTUALIZADO: Enfocado en cierre de turno (no advance payment)
 */
const PaymentMethodSelector = ({
  methods = [],
  onMethodSelect, // Cambié de onSelectMethod a onMethodSelect para consistency
  paymentType = 'closure'
}) => {

  const getMethodIcon = (type) => {
    const icons = {
      'CASH': 'cash-outline',
      'CARD': 'card-outline',
      'TRANSFER': 'send-outline',
      'QR': 'qr-code-outline',
      'ONLINE': 'globe-outline',
      'OTHER': 'ellipsis-horizontal-circle-outline'
    };
    
    return icons[type] || 'ellipsis-horizontal-circle-outline';
  };

  const getMethodDescription = (method) => {
    switch (method.type) {
      case 'CASH':
        return 'Pago en efectivo';
      case 'CARD':
        return 'Tarjeta de crédito/débito';
      case 'TRANSFER':
        return method.bankInfo?.bankName 
          ? `Transferencia - ${method.bankInfo.bankName}`
          : 'Transferencia bancaria';
      case 'QR':
        return method.qrInfo?.phoneNumber 
          ? `${method.name} - ${method.qrInfo.phoneNumber}`
          : `Pago QR - ${method.name}`;
      case 'ONLINE':
        return 'Pago en línea';
      default:
        return method.name || 'Método de pago';
    }
  };

  const handleMethodPress = (method) => {
    console.log('💳 Method selected for closure:', method);
    onMethodSelect?.(method);
  };

  if (!methods || methods.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="card-outline" size={48} color="#9ca3af" />
        <Text style={styles.emptyTitle}>Sin métodos de pago</Text>
        <Text style={styles.emptyMessage}>
          No hay métodos de pago configurados para este negocio
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona método de pago</Text>
      
      <ScrollView style={styles.methodsList} showsVerticalScrollIndicator={false}>
        {methods.map((method, index) => (
          <TouchableOpacity
            key={method.id || index}
            style={styles.methodCard}
            onPress={() => handleMethodPress(method)}
            activeOpacity={0.7}
          >
            <View style={styles.methodIcon}>
              <Ionicons 
                name={getMethodIcon(method.type)} 
                size={24} 
                color="#3b82f6" 
              />
            </View>
            
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>{method.name}</Text>
              <Text style={styles.methodDescription}>
                {getMethodDescription(method)}
              </Text>
              
              {/* Información adicional según el tipo */}
              {method.type === 'TRANSFER' && method.bankInfo?.accountNumber && (
                <Text style={styles.methodDetails}>
                  Cuenta: ***{method.bankInfo.accountNumber.slice(-4)}
                </Text>
              )}
              
              {method.requiresProof && (
                <View style={styles.requiresBadge}>
                  <Ionicons name="document-text-outline" size={12} color="#f59e0b" />
                  <Text style={styles.requiresText}>Requiere comprobante</Text>
                </View>
              )}
            </View>
            
            <View style={styles.methodAction}>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Nota informativa */}
      <View style={styles.noteContainer}>
        <Ionicons name="information-circle-outline" size={16} color="#6b7280" />
        <Text style={styles.noteText}>
          {paymentType === 'closure' 
            ? 'Se registrará el pago final del turno'
            : 'Métodos disponibles para pago anticipado'
          }
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },

  methodsList: {
    maxHeight: 400,
  },

  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  methodInfo: {
    flex: 1,
  },

  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },

  methodDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },

  methodDetails: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },

  requiresBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },

  requiresText: {
    fontSize: 10,
    color: '#92400e',
    marginLeft: 4,
    fontWeight: '500',
  },

  methodAction: {
    marginLeft: 8,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },

  emptyMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
  },

  noteText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
});

export default PaymentMethodSelector;
