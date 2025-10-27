import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Selector de método de pago para cierre de turno
 * Muestra los métodos configurados por el negocio y permite seleccionar uno
 */
const PaymentMethodSelector = ({
  methods = [],
  selectedMethod = null,
  onSelectMethod,
  amount = 0,
  onAmountChange,
  loading = false,
  disabled = false
}) => {
  const [expanded, setExpanded] = useState(false);

  // Iconos según tipo de método
  const getMethodIcon = (type) => {
    switch (type) {
      case 'CASH':
        return 'cash-outline';
      case 'CARD':
        return 'card-outline';
      case 'TRANSFER':
        return 'swap-horizontal-outline';
      case 'QR':
        return 'qr-code-outline';
      case 'ONLINE':
        return 'globe-outline';
      default:
        return 'wallet-outline';
    }
  };

  // Color según tipo
  const getMethodColor = (type) => {
    switch (type) {
      case 'CASH':
        return '#10B981'; // Verde
      case 'CARD':
        return '#3B82F6'; // Azul
      case 'TRANSFER':
        return '#8B5CF6'; // Púrpura
      case 'QR':
        return '#F59E0B'; // Naranja
      case 'ONLINE':
        return '#EC4899'; // Rosa
      default:
        return '#6B7280'; // Gris
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#8B5CF6" />
        <Text style={styles.loadingText}>Cargando métodos de pago...</Text>
      </View>
    );
  }

  if (!methods || methods.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={32} color="#F59E0B" />
        <Text style={styles.emptyText}>
          No hay métodos de pago configurados
        </Text>
        <Text style={styles.emptySubtext}>
          Contacta al administrador del negocio
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Campo de monto */}
      <View style={styles.amountSection}>
        <Text style={styles.label}>Monto a cobrar *</Text>
        <View style={styles.amountInputContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            value={amount?.toString() || ''}
            onChangeText={onAmountChange}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor="#9CA3AF"
            editable={!disabled}
          />
        </View>
      </View>

      {/* Selector de método */}
      <View style={styles.methodSection}>
        <Text style={styles.label}>Método de pago *</Text>
        
        {/* Botón para expandir/colapsar */}
        <TouchableOpacity
          style={[
            styles.selectedMethodButton,
            disabled && styles.disabledButton
          ]}
          onPress={() => !disabled && setExpanded(!expanded)}
          disabled={disabled}
        >
          {selectedMethod ? (
            <View style={styles.selectedMethodContent}>
              <View
                style={[
                  styles.methodIconContainer,
                  { backgroundColor: getMethodColor(selectedMethod.type) }
                ]}
              >
                <Ionicons
                  name={getMethodIcon(selectedMethod.type)}
                  size={20}
                  color="#FFFFFF"
                />
              </View>
              <View style={styles.selectedMethodInfo}>
                <Text style={styles.selectedMethodName}>
                  {selectedMethod.name}
                </Text>
                <Text style={styles.selectedMethodType}>
                  {selectedMethod.type}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.placeholderContent}>
              <Ionicons name="wallet-outline" size={20} color="#9CA3AF" />
              <Text style={styles.placeholderText}>
                Selecciona un método de pago
              </Text>
            </View>
          )}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>

        {/* Lista de métodos (expandible) */}
        {expanded && (
          <View style={styles.methodsList}>
            <ScrollView style={styles.methodsScrollView}>
              {methods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodItem,
                    selectedMethod?.id === method.id && styles.methodItemSelected
                  ]}
                  onPress={() => {
                    onSelectMethod(method);
                    setExpanded(false);
                  }}
                >
                  <View
                    style={[
                      styles.methodIconContainer,
                      { backgroundColor: getMethodColor(method.type) }
                    ]}
                  >
                    <Ionicons
                      name={getMethodIcon(method.type)}
                      size={20}
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodName}>{method.name}</Text>
                    <Text style={styles.methodType}>{method.type}</Text>
                  </View>
                  {selectedMethod?.id === method.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#10B981"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Información adicional del método seleccionado */}
      {selectedMethod && (
        <View style={styles.methodDetailsSection}>
          {/* Información bancaria para TRANSFER */}
          {selectedMethod.type === 'TRANSFER' && selectedMethod.bankInfo && (
            <View style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>
                Información de transferencia
              </Text>
              {selectedMethod.bankInfo.bankName && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Banco:</Text>
                  <Text style={styles.detailValue}>
                    {selectedMethod.bankInfo.bankName}
                  </Text>
                </View>
              )}
              {selectedMethod.bankInfo.accountNumber && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cuenta:</Text>
                  <Text style={styles.detailValue}>
                    {selectedMethod.bankInfo.accountNumber}
                  </Text>
                </View>
              )}
              {selectedMethod.bankInfo.accountType && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tipo:</Text>
                  <Text style={styles.detailValue}>
                    {selectedMethod.bankInfo.accountType}
                  </Text>
                </View>
              )}
              {selectedMethod.bankInfo.holderName && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Titular:</Text>
                  <Text style={styles.detailValue}>
                    {selectedMethod.bankInfo.holderName}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Información QR */}
          {selectedMethod.type === 'QR' && selectedMethod.qrInfo && (
            <View style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>Información de pago QR</Text>
              {selectedMethod.qrInfo.phoneNumber && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Teléfono:</Text>
                  <Text style={styles.detailValue}>
                    {selectedMethod.qrInfo.phoneNumber}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Indicador de comprobante requerido */}
          {selectedMethod.requiresProof && (
            <View style={styles.proofRequiredBanner}>
              <Ionicons name="camera-outline" size={20} color="#F59E0B" />
              <Text style={styles.proofRequiredText}>
                Este método requiere comprobante de pago
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280'
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    gap: 8
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center'
  },
  amountSection: {
    gap: 8
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937'
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 4
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    paddingVertical: 12
  },
  methodSection: {
    gap: 8
  },
  selectedMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12
  },
  disabledButton: {
    opacity: 0.5
  },
  selectedMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12
  },
  methodIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedMethodInfo: {
    flex: 1
  },
  selectedMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937'
  },
  selectedMethodType: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  placeholderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12
  },
  placeholderText: {
    fontSize: 14,
    color: '#9CA3AF'
  },
  methodsList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 240
  },
  methodsScrollView: {
    maxHeight: 240
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  methodItemSelected: {
    backgroundColor: '#F0FDF4'
  },
  methodInfo: {
    flex: 1
  },
  methodName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937'
  },
  methodType: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  methodDetailsSection: {
    gap: 12
  },
  detailsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    gap: 8
  },
  detailsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280'
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937'
  },
  proofRequiredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    padding: 12,
    gap: 8
  },
  proofRequiredText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500'
  }
});

export default PaymentMethodSelector;
