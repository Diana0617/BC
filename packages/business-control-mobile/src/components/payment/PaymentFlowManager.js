  // =====================================================
// PAYMENT FLOW MANAGER - Orquestador de Pagos
// =====================================================
// Maneja todo el flujo de pagos: anticipado + cierre
// Integra Wompi, métodos personalizados, productos
// =====================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

// APIs
import advancePaymentApi from '@shared/api/advancePaymentApi';
import appointmentApi from '@shared/api/appointmentApi';

// Componentes
import PaymentMethodSelector from './PaymentMethodSelector';
import WompiIntegration from './WompiIntegration';
import TransferPayment from './TransferPayment';
import ProductSelector from './ProductSelector';
import PaymentSummary from './PaymentSummary';

const PaymentFlowManager = ({
  visible,
  onClose,
  appointment,
  paymentType = 'closure', // SOLO 'closure' - advance se hace en web
  onSuccess
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const businessId = useSelector(state => state.auth.businessId);

  // Estados
  const [currentStep, setCurrentStep] = useState('method-selection');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [businessConfig, setBusinessConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Datos de pago
  const [paymentData, setPaymentData] = useState({
    appointmentId: appointment?.id,
    amount: 0,
    baseAmount: 0,
    products: [],
    existingPayments: [],
    notes: ''
  });

  // Estados específicos
  const [wompiConfig, setWompiConfig] = useState(null);
  const [transferData, setTransferData] = useState(null);
  const [showProductSelector, setShowProductSelector] = useState(false);

  console.log('💳 PaymentFlowManager - Type:', paymentType);
  console.log('💳 PaymentFlowManager - Appointment:', appointment?.id);

  // =====================================================
  // INICIALIZACIÓN
  // =====================================================

  useEffect(() => {
    if (visible && appointment) {
      initializePaymentFlow();
    }
  }, [visible, appointment]);

  const initializePaymentFlow = useCallback(async () => {
    setLoading(true);
    
    try {
      console.log('🔄 Initializing payment flow for CLOSURE...');
      
      // 1. Obtener métodos de pago del negocio
      const methods = await fetchPaymentMethods();
      
      // 2. Obtener configuración del negocio
      const config = await fetchBusinessPaymentConfig();
      
      // 3. Verificar pagos existentes (anticipados desde web)
      const existingPayments = await fetchExistingPayments();
      
      // 4. Solo inicializar para cierre de turno
      await initializeClosurePayment(config, existingPayments);
      
    } catch (error) {
      console.error('❌ Error initializing payment flow:', error);
      Alert.alert('Error', 'No se pudo cargar la configuración de pagos');
    } finally {
      setLoading(false);
    }
  }, [appointment, businessId]);

  // =====================================================
  // FUNCIONES DE INICIALIZACIÓN - SOLO CLOSURE
  // =====================================================

  const fetchPaymentMethods = async () => {
    try {
      // Usar API existente - adaptarla según lo que tengas
      const response = await fetch(`/api/business/${businessId}/payment-methods`);
      const data = await response.json();
      
      const activeMethods = data.paymentMethods?.filter(method => method.isActive) || [];
      setPaymentMethods(activeMethods);
      
      return activeMethods;
    } catch (error) {
      console.error('❌ Error fetching payment methods:', error);
      return [];
    }
  };

  const fetchBusinessPaymentConfig = async () => {
    try {
      const response = await fetch(`/api/business/${businessId}/payment-config`);
      const config = await response.json();
      
      setBusinessConfig(config);
      
      // Verificar si Wompi está disponible
      if (config.wompiEnabled) {
        const wompiData = await advancePaymentApi.getWompiConfig(businessId);
        setWompiConfig(wompiData);
      }
      
      return config;
    } catch (error) {
      console.error('❌ Error fetching business config:', error);
      return null;
    }
  };

  const fetchExistingPayments = async () => {
    try {
      const response = await appointmentApi.getAppointmentPayments?.(appointment.id);
      return response?.payments || [];
    } catch (error) {
      console.error('❌ Error fetching existing payments:', error);
      return [];
    }
  };

  const initializeClosurePayment = async (config, existingPayments) => {
    console.log('🔄 Initializing closure payment...');
    console.log('💰 Existing payments:', existingPayments);
    
    // Calcular monto pendiente
    const servicePrice = parseFloat(appointment.service?.price || 0);
    const paidAmount = existingPayments.reduce((sum, payment) => 
      sum + parseFloat(payment.amount || 0), 0
    );
    
    const pendingAmount = Math.max(0, servicePrice - paidAmount);
    
    console.log('📊 Payment calculation:', {
      servicePrice,
      paidAmount,
      pendingAmount
    });
    
    setPaymentData(prev => ({
      ...prev,
      amount: pendingAmount,
      baseAmount: pendingAmount,
      existingPayments
    }));
    
    // Verificar si puede vender productos
    if (config?.allowProductSales) {
      setShowProductSelector(true);
    }
    
    // Si ya está completamente pagado
    if (pendingAmount === 0 && !config?.allowProductSales) {
      Alert.alert(
        'Información',
        'Esta cita ya tiene el pago completo',
        [
          {
            text: 'Solo Productos',
            onPress: () => setShowProductSelector(true),
            style: 'default'
          },
          {
            text: 'Cerrar',
            onPress: onClose,
            style: 'cancel'
          }
        ]
      );
    }
  };

  // =====================================================
  // CÁLCULOS - ENFOCADO EN CLOSURE
  // =====================================================

  const calculateTotalAmount = () => {
    const productTotal = paymentData.products.reduce(
      (sum, product) => sum + (product.price * product.quantity), 0
    );
    
    return paymentData.baseAmount + productTotal;
  };

  // =====================================================
  // NAVEGACIÓN ENTRE PASOS
  // =====================================================

  const handleMethodSelection = (method) => {
    console.log('💳 Method selected:', method.type);
    setSelectedMethod(method);
    
    switch (method.type) {
      case 'WOMPI':
        setCurrentStep('wompi-payment');
        break;
      case 'TRANSFER':
        setCurrentStep('transfer-payment');
        break;
      case 'CASH':
        setCurrentStep('cash-confirmation');
        break;
      default:
        setCurrentStep('generic-payment');
    }
  };

  const handleProductsUpdate = (products) => {
    setPaymentData(prev => ({
      ...prev,
      products,
      amount: prev.baseAmount + products.reduce(
        (sum, p) => sum + (p.price * p.quantity), 0
      )
    }));
  };

  // =====================================================
  // PROCESAMIENTO DE PAGOS
  // =====================================================

  const processWompiPayment = async (wompiData) => {
    setLoading(true);
    
    try {
      console.log('🔄 Processing Wompi payment...');
      
      const paymentRequest = {
        appointmentId: appointment.id,
        amount: calculateTotalAmount(),
        paymentMethodId: selectedMethod.id,
        wompiData,
        products: paymentData.products,
        type: paymentType
      };
      
      const result = await advancePaymentApi.initiateAdvancePayment(paymentRequest);
      
      if (result.success) {
        Alert.alert(
          'Éxito',
          'Pago procesado correctamente',
          [{ text: 'OK', onPress: () => onSuccess?.(result.data) }]
        );
      } else {
        throw new Error(result.message || 'Error en el pago');
      }
      
    } catch (error) {
      console.error('❌ Error processing Wompi payment:', error);
      Alert.alert('Error', error.message || 'No se pudo procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const processTransferPayment = async (transferData) => {
    setLoading(true);
    
    try {
      console.log('🔄 Processing transfer payment...');
      
      const paymentRequest = {
        appointmentId: appointment.id,
        amount: calculateTotalAmount(),
        paymentMethodId: selectedMethod.id,
        reference: transferData.reference,
        proofUrl: transferData.proofUrl,
        products: paymentData.products,
        type: paymentType
      };
      
      // Usar API V2 para pagos generales
      const result = await appointmentApi.registerPayment?.(paymentRequest);
      
      if (result.success) {
        Alert.alert(
          'Éxito',
          'Comprobante registrado correctamente',
          [{ text: 'OK', onPress: () => onSuccess?.(result.data) }]
        );
      } else {
        throw new Error(result.message || 'Error registrando el pago');
      }
      
    } catch (error) {
      console.error('❌ Error processing transfer payment:', error);
      Alert.alert('Error', error.message || 'No se pudo registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  const processCashPayment = async () => {
    setLoading(true);
    
    try {
      console.log('🔄 Processing cash payment...');
      
      const paymentRequest = {
        appointmentId: appointment.id,
        amount: calculateTotalAmount(),
        paymentMethodId: selectedMethod.id,
        products: paymentData.products,
        notes: paymentData.notes,
        type: paymentType,
        registeredBy: user.id
      };
      
      const result = await appointmentApi.registerPayment?.(paymentRequest);
      
      if (result.success) {
        Alert.alert(
          'Éxito',
          'Pago en efectivo registrado',
          [{ text: 'OK', onPress: () => onSuccess?.(result.data) }]
        );
      } else {
        throw new Error(result.message || 'Error registrando el pago');
      }
      
    } catch (error) {
      console.error('❌ Error processing cash payment:', error);
      Alert.alert('Error', error.message || 'No se pudo registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RENDER STEPS
  // =====================================================

  const renderMethodSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Procesar Pago Final</Text>
      
      <PaymentMethodSelector
        methods={paymentMethods}
        onMethodSelect={handleMethodSelection}
        paymentType="closure"
      />
      
      <PaymentSummary
        baseAmount={paymentData.baseAmount}
        products={paymentData.products}
        existingPayments={paymentData.existingPayments}
        total={calculateTotalAmount()}
        showExistingPayments={true}
      />
    </View>
  );

  const renderWompiPayment = () => (
    <View style={styles.stepContainer}>
      <WompiIntegration
        config={wompiConfig}
        amount={calculateTotalAmount()}
        appointment={appointment}
        onSuccess={processWompiPayment}
        onCancel={() => setCurrentStep('method-selection')}
      />
    </View>
  );

  const renderTransferPayment = () => (
    <View style={styles.stepContainer}>
      <TransferPayment
        method={selectedMethod}
        amount={calculateTotalAmount()}
        appointment={appointment}
        onSuccess={processTransferPayment}
        onCancel={() => setCurrentStep('method-selection')}
      />
    </View>
  );

  const renderCashConfirmation = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Confirmar Pago en Efectivo</Text>
      
      <PaymentSummary
        baseAmount={paymentData.baseAmount}
        products={paymentData.products}
        total={calculateTotalAmount()}
        showDetails
      />
      
      <View style={styles.cashActions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => setCurrentStep('method-selection')}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.confirmButton]}
          onPress={processCashPayment}
          disabled={loading}
        >
          <Text style={styles.confirmButtonText}>
            {loading ? 'Procesando...' : 'Confirmar Pago'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // =====================================================
  // RENDER PRINCIPAL
  // =====================================================

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'method-selection':
        return renderMethodSelection();
      case 'wompi-payment':
        return renderWompiPayment();
      case 'transfer-payment':
        return renderTransferPayment();
      case 'cash-confirmation':
        return renderCashConfirmation();
      default:
        return renderMethodSelection();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            Gestión de Pago Final
          </Text>
          
          <View style={styles.headerRight} />
        </View>
        
        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Cargando...</Text>
            </View>
          ) : (
            renderCurrentStep()
          )}
        </ScrollView>
        
        {/* Product Selector Modal */}
        {showProductSelector && (
          <ProductSelector
            visible={showProductSelector}
            appointment={appointment}
            onProductsUpdate={handleProductsUpdate}
            onClose={() => setShowProductSelector(false)}
          />
        )}
      </View>
    </Modal>
  );
};

// =====================================================
// ESTILOS
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  
  closeButton: {
    padding: 8,
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  
  headerRight: {
    width: 40,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  stepContainer: {
    paddingVertical: 20,
  },
  
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  
  cashActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
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
  
  confirmButton: {
    backgroundColor: '#10b981',
  },
  
  confirmButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default PaymentFlowManager;