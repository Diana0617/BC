import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePaymentMethodsReadOnly } from '../../hooks/usePaymentMethodsReadOnly';
import { PaymentMethodSelector, PaymentProofUpload } from '../payment';

/**
 * Componente para el paso de pago en el cierre de turno
 * Integra selección de método de pago y subida de comprobante
 */
const PaymentStep = ({ 
  appointment,
  onPaymentDataChange,
  onValidationChange 
}) => {
  console.log('💰 PaymentStep - Renderizando con appointment:', appointment?.id);
  
  const { methods, loading: loadingMethods, error: methodsError } = usePaymentMethodsReadOnly();
  
  console.log('💰 PaymentStep - Métodos de pago:', {
    count: methods?.length || 0,
    loading: loadingMethods,
    error: methodsError
  });
  
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [amount, setAmount] = useState(appointment?.totalAmount?.toString() || '0');
  const [proofImage, setProofImage] = useState(null);
  const [notes, setNotes] = useState('');
  
  // Log cuando cambian los métodos
  useEffect(() => {
    console.log('💰 PaymentStep - useEffect métodos cambió:', {
      count: methods?.length,
      loading: loadingMethods,
      error: methodsError
    });
  }, [methods, loadingMethods, methodsError]);
  
  // Validar y notificar cambios
  useEffect(() => {
    const isValid = validatePaymentData();
    const paymentData = {
      methodId: selectedMethod?.id,
      method: selectedMethod,
      amount: parseFloat(amount) || 0,
      proofImage,
      notes: notes.trim(),
      isValid
    };
    
    if (onPaymentDataChange) {
      onPaymentDataChange(paymentData);
    }
    
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [selectedMethod, amount, proofImage, notes]);
  
  /**
   * Validar datos de pago
   */
  const validatePaymentData = () => {
    // 1. Debe tener método de pago seleccionado
    if (!selectedMethod) {
      return false;
    }
    
    // 2. Monto debe ser válido y mayor a 0
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return false;
    }
    
    // 3. Si el método requiere comprobante, debe tenerlo
    if (selectedMethod.requiresProof && !proofImage) {
      return false;
    }
    
    return true;
  };
  
  /**
   * Manejar selección de método de pago
   */
  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    
    // Si el método no requiere comprobante, limpiar imagen
    if (!method.requiresProof) {
      setProofImage(null);
    }
  };
  
  /**
   * Manejar cambio de monto
   */
  const handleAmountChange = (value) => {
    // Permitir solo números y punto decimal
    const cleaned = value.replace(/[^0-9.]/g, '');
    
    // Evitar múltiples puntos decimales
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return;
    }
    
    setAmount(cleaned);
  };
  
  /**
   * Sugerir monto total
   */
  const suggestTotalAmount = () => {
    if (appointment?.totalAmount) {
      setAmount(appointment.totalAmount.toString());
    }
  };
  
  /**
   * Sugerir monto pendiente
   */
  const suggestPendingAmount = () => {
    if (appointment?.totalAmount && appointment?.paidAmount) {
      const pending = appointment.totalAmount - appointment.paidAmount;
      if (pending > 0) {
        setAmount(pending.toString());
      }
    }
  };
  
  // Estados de carga y error con logs
  if (loadingMethods) {
    console.log('💰 PaymentStep - Mostrando loading...');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Cargando métodos de pago...</Text>
      </View>
    );
  }
  
  if (methodsError) {
    console.log('💰 PaymentStep - Mostrando error:', methodsError);
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Error cargando métodos de pago</Text>
        <Text style={styles.errorSubtext}>{methodsError}</Text>
      </View>
    );
  }
  
  if (methods.length === 0) {
    console.log('💰 PaymentStep - Mostrando empty state (sin métodos)');
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="card-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>No hay métodos de pago configurados</Text>
        <Text style={styles.emptySubtext}>
          El administrador debe configurar los métodos de pago desde la web
        </Text>
      </View>
    );
  }
  
  console.log('💰 PaymentStep - Renderizando formulario completo con', methods.length, 'métodos');
  
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Información del turno */}
      <View style={styles.appointmentInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cliente:</Text>
          <Text style={styles.infoValue}>{appointment?.client?.firstName} {appointment?.client?.lastName}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Servicio:</Text>
          <Text style={styles.infoValue}>{appointment?.service?.name}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total:</Text>
          <Text style={styles.totalAmount}>
            ${appointment?.totalAmount?.toLocaleString('es-CO') || '0'}
          </Text>
        </View>
        
        {appointment?.paidAmount > 0 && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pagado:</Text>
              <Text style={styles.paidAmount}>
                ${appointment.paidAmount.toLocaleString('es-CO')}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pendiente:</Text>
              <Text style={styles.pendingAmount}>
                ${(appointment.totalAmount - appointment.paidAmount).toLocaleString('es-CO')}
              </Text>
            </View>
          </>
        )}
      </View>
      
      {/* Selector de método de pago */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Método de Pago <Text style={styles.required}>*</Text>
        </Text>
        <PaymentMethodSelector
          methods={methods}
          selectedMethod={selectedMethod}
          onMethodSelect={handleMethodSelect}
          amount={amount}
          onAmountChange={handleAmountChange}
        />
      </View>
      
      {/* Input de monto */}
      <View style={styles.section}>
        <View style={styles.amountHeader}>
          <Text style={styles.sectionTitle}>
            Monto a Pagar <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.amountSuggestions}>
            {appointment?.totalAmount && (
              <TouchableOpacity
                style={styles.suggestionButton}
                onPress={suggestTotalAmount}
              >
                <Text style={styles.suggestionText}>Total</Text>
              </TouchableOpacity>
            )}
            {appointment?.paidAmount > 0 && appointment?.paidAmount < appointment?.totalAmount && (
              <TouchableOpacity
                style={styles.suggestionButton}
                onPress={suggestPendingAmount}
              >
                <Text style={styles.suggestionText}>Pendiente</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View style={styles.amountInputContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={handleAmountChange}
            placeholder="0"
            keyboardType="decimal-pad"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>
      
      {/* Comprobante de pago (si es requerido) */}
      {selectedMethod?.requiresProof && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Comprobante de Pago <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.sectionSubtitle}>
            Este método de pago requiere adjuntar un comprobante
          </Text>
          <PaymentProofUpload
            proofImage={proofImage}
            onImageSelected={setProofImage}
            required={true}
          />
        </View>
      )}
      
      {/* Notas adicionales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notas (Opcional)</Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Ej: Pago parcial, descuento aplicado, etc."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>
      
      {/* Indicador de validación */}
      {!validatePaymentData() && (selectedMethod || amount) && (
        <View style={styles.validationWarning}>
          <Ionicons name="information-circle-outline" size={20} color="#F59E0B" />
          <Text style={styles.validationWarningText}>
            {!selectedMethod && 'Selecciona un método de pago'}
            {selectedMethod && !parseFloat(amount) && 'Ingresa un monto válido'}
            {selectedMethod && parseFloat(amount) <= 0 && 'El monto debe ser mayor a 0'}
            {selectedMethod?.requiresProof && !proofImage && 'Adjunta el comprobante de pago'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  appointmentInfo: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  paidAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  pendingAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  required: {
    color: '#EF4444',
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountSuggestions: {
    flexDirection: 'row',
    gap: 8,
  },
  suggestionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 56,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  notesInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
    minHeight: 80,
  },
  validationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  validationWarningText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#92400E',
  },
  // Estados de carga y error
  loadingContainer: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorContainer: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    textAlign: 'center',
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  emptyContainer: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default PaymentStep;
