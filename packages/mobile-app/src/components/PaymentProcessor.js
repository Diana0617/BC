import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  Modal,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import WhatsAppHelper from '../utils/WhatsAppHelper';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PaymentProcessor = ({ 
  visible,
  appointment,
  businessId,
  onClose,
  onPaymentComplete,
  onPaymentError
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('PENDING');
  const [businessSettings, setBusinessSettings] = useState(null);

  useEffect(() => {
    if (visible && appointment) {
      checkPaymentRequired();
    }
  }, [visible, appointment]);

  useEffect(() => {
    // Cargar configuraciones del negocio al montar el componente
    fetchBusinessSettings();
  }, []);

  /**
   * Cargar configuraciones del negocio
   */
  const fetchBusinessSettings = async () => {
    try {
      const response = await fetch(`/api/business/${businessId}`);
      const business = await response.json();
      
      if (business.success) {
        setBusinessSettings(business.data.settings || {});
      }
    } catch (error) {
      console.warn('Error cargando configuraciones del negocio:', error);
    }
  };

  /**
   * Verificar si se requiere pago y obtener configuración
   */
  const checkPaymentRequired = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/appointments/${appointment.id}/payment/check?businessId=${businessId}`, 
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data.required) {
          setPaymentData(result.data);
          setPaymentStatus(result.data.status || 'PENDING');
        } else {
          // Si no requiere pago, marcar como completado automáticamente
          setPaymentStatus('COMPLETED');
          if (onPaymentComplete) {
            onPaymentComplete({
              status: 'NOT_REQUIRED',
              message: 'No se requiere pago para esta cita'
            });
          }
        }
      } else {
        throw new Error('Failed to check payment requirements');
      }
    } catch (error) {
      console.error('Error checking payment requirements:', error);
      Alert.alert('Error', 'No se pudo verificar los requisitos de pago');
      if (onPaymentError) {
        onPaymentError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Iniciar proceso de pago con Wompi
   */
  const initiatePayment = async () => {
    if (!paymentData || paymentStatus === 'PAID') return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/appointments/${appointment.id}/payment/initiate`, 
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            businessId,
            appointmentId: appointment.id,
            paymentType: 'FULL_PAYMENT' // Para el pago final del servicio
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data.paymentUrl) {
          // Actualizar datos de pago
          setPaymentData({
            ...paymentData,
            ...result.data
          });
          
          // Abrir WebView para procesar pago
          setWebViewVisible(true);
        } else {
          throw new Error(result.error || 'Failed to initiate payment');
        }
      } else {
        throw new Error('Failed to initiate payment');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      Alert.alert('Error', 'No se pudo iniciar el proceso de pago');
      if (onPaymentError) {
        onPaymentError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Procesar mensaje de WebView para detectar éxito/error de pago
   */
  const handleWebViewMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'PAYMENT_SUCCESS') {
        handlePaymentSuccess(message.data);
      } else if (message.type === 'PAYMENT_ERROR') {
        handlePaymentError(message.data);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  /**
   * Manejar navegación de WebView para detectar URLs de éxito/error
   */
  const handleWebViewNavigationStateChange = (navState) => {
    const { url } = navState;
    
    // Detectar URLs de éxito de Wompi
    if (url.includes('payment-success') || url.includes('successful')) {
      setTimeout(() => {
        verifyPaymentStatus();
      }, 2000);
    }
    
    // Detectar URLs de error de Wompi
    if (url.includes('payment-error') || url.includes('declined') || url.includes('failed')) {
      handlePaymentError({ message: 'Pago rechazado o fallido' });
    }
  };

  /**
   * Verificar estado final del pago
   */
  const verifyPaymentStatus = async () => {
    try {
      const response = await fetch(
        `/api/appointments/${appointment.id}/payment/verify?reference=${paymentData.paymentReference}`, 
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data.status === 'APPROVED') {
          handlePaymentSuccess(result.data);
        } else {
          // Seguir verificando por un tiempo
          setTimeout(() => {
            verifyPaymentStatus();
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error verifying payment status:', error);
    }
  };

  /**
   * Manejar pago exitoso
   */
  const handlePaymentSuccess = async (data) => {
    setWebViewVisible(false);
    setPaymentStatus('PAID');
    
    // Enviar recibo por email y WhatsApp si está configurado
    await sendPaymentReceipt(data, appointment);
    
    Alert.alert(
      'Pago Exitoso',
      `El pago de $${formatCurrency(paymentData.amount)} ha sido procesado correctamente.`,
      [
        {
          text: 'Continuar',
          onPress: () => {
            if (onPaymentComplete) {
              onPaymentComplete({
                status: 'PAID',
                amount: paymentData.amount,
                reference: paymentData.paymentReference,
                data
              });
            }
          }
        }
      ]
    );
  };

  /**
   * Manejar error de pago
   */
  const handlePaymentError = (error) => {
    setWebViewVisible(false);
    
    Alert.alert(
      'Error en el Pago',
      error.message || 'Ocurrió un error procesando el pago. Intenta nuevamente.',
      [
        { text: 'Reintentar', onPress: () => initiatePayment() },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
    
    if (onPaymentError) {
      onPaymentError(error);
    }
  };

  /**
   * Formatear cantidad como moneda colombiana
   */
  /**
   * Enviar recibo de pago por email y WhatsApp
   */
  const sendPaymentReceipt = async (paymentData, appointmentData) => {
    try {
      // Primero crear el recibo en la base de datos
      const receipt = await createReceipt(paymentData, appointmentData);
      
      if (!receipt) {
        console.error('No se pudo crear el recibo');
        return;
      }

      const receiptData = {
        receipt: receipt,
        appointment: appointmentData,
        payment: {
          transactionId: paymentData.transactionId || paymentData.reference,
          amount: paymentData.amount || appointmentData.finalAmount,
          paymentMethod: 'Wompi',
          date: new Date().toISOString()
        },
        business: businessSettings
      };

      // Enviar por email (método existente)
      await sendEmailReceipt(receiptData);

      // Marcar como enviado por email
      await markReceiptSentViaEmail(receipt.id);

      // Enviar por WhatsApp si está configurado
      if (WhatsAppHelper.isWhatsAppConfigured(businessSettings)) {
        const phoneNumber = appointmentData.user?.phone || appointmentData.phone;
        
        if (phoneNumber) {
          WhatsAppHelper.sendReceiptMessage(
            phoneNumber,
            receiptData,
            businessSettings.whatsappNumber
          );
          
          // Marcar como enviado por WhatsApp
          await markReceiptSentViaWhatsApp(receipt.id);
        }
      }
    } catch (error) {
      console.error('Error enviando recibo:', error);
    }
  };

  /**
   * Crear recibo en la base de datos
   */
  const createReceipt = async (paymentData, appointmentData) => {
    try {
      const response = await fetch(`/api/receipts/from-appointment/${appointmentData.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentData: {
            transactionId: paymentData.transactionId || paymentData.reference,
            amount: paymentData.amount || appointmentData.finalAmount,
            method: 'WOMPI',
            reference: paymentData.reference
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.success ? result.data : null;
      }
      
      return null;
    } catch (error) {
      console.error('Error creando recibo:', error);
      return null;
    }
  };

  /**
   * Marcar recibo como enviado por email
   */
  const markReceiptSentViaEmail = async (receiptId) => {
    try {
      await fetch(`/api/receipts/${receiptId}/sent-email`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error marcando recibo como enviado por email:', error);
    }
  };

  /**
   * Marcar recibo como enviado por WhatsApp
   */
  const markReceiptSentViaWhatsApp = async (receiptId) => {
    try {
      await fetch(`/api/receipts/${receiptId}/sent-whatsapp`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error marcando recibo como enviado por WhatsApp:', error);
    }
  };

  /**
   * Enviar recibo por email (método existente)
   */
  const sendEmailReceipt = async (receiptData) => {
    try {
      const response = await fetch('/api/send-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(receiptData)
      });

      if (!response.ok) {
        throw new Error('Error enviando recibo por email');
      }
    } catch (error) {
      console.error('Error enviando recibo por email:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  /**
   * Cerrar WebView de pago
   */
  const closeWebView = () => {
    Alert.alert(
      'Cancelar Pago',
      '¿Estás seguro de que quieres cancelar el proceso de pago?',
      [
        { text: 'Continuar Pagando', style: 'cancel' },
        { 
          text: 'Cancelar Pago', 
          style: 'destructive',
          onPress: () => setWebViewVisible(false)
        }
      ]
    );
  };

  const renderPaymentInfo = () => {
    if (!paymentData) return null;

    return (
      <View className="bg-gray-50 rounded-lg p-4 mb-6">
        <Text className="font-medium text-gray-900 mb-3">Información del Pago</Text>
        
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Servicio:</Text>
            <Text className="text-gray-900 font-medium">{appointment.service?.name}</Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Precio del servicio:</Text>
            <Text className="text-gray-900">{formatCurrency(paymentData.servicePrice)}</Text>
          </View>
          
          {paymentData.discountAmount > 0 && (
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Descuento:</Text>
              <Text className="text-green-600">-{formatCurrency(paymentData.discountAmount)}</Text>
            </View>
          )}
          
          <View className="border-t border-gray-200 pt-2 mt-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-900 font-medium">Total a pagar:</Text>
              <Text className="text-blue-600 font-bold text-lg">
                {formatCurrency(paymentData.amount)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderPaymentStatus = () => {
    switch (paymentStatus) {
      case 'PAID':
        return (
          <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text className="text-green-800 font-medium ml-2">Pago Completado</Text>
            </View>
            <Text className="text-green-700 text-sm mt-1">
              El pago ha sido procesado exitosamente
            </Text>
          </View>
        );
      
      case 'PENDING':
        return (
          <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <View className="flex-row items-center">
              <Ionicons name="time" size={24} color="#F59E0B" />
              <Text className="text-yellow-800 font-medium ml-2">Pago Pendiente</Text>
            </View>
            <Text className="text-yellow-700 text-sm mt-1">
              El pago está pendiente de procesamiento
            </Text>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <Text className="text-lg font-bold text-gray-900">
            Procesar Pago
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Loading */}
        {loading && (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-600 mt-2">Cargando información de pago...</Text>
          </View>
        )}

        {/* Content */}
        {!loading && paymentData && (
          <View className="flex-1 p-4">
            {/* Información de la cita */}
            <View className="bg-gray-50 rounded-lg p-4 mb-6">
              <Text className="font-medium text-gray-900 mb-1">
                {appointment.client?.name}
              </Text>
              <Text className="text-gray-600 mb-1">
                {appointment.service?.name}
              </Text>
              <Text className="text-sm text-gray-500">
                {new Date(appointment.scheduledDate).toLocaleString()}
              </Text>
            </View>

            {/* Estado del pago */}
            {renderPaymentStatus()}

            {/* Información del pago */}
            {renderPaymentInfo()}

            {/* Métodos de pago disponibles */}
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <View className="flex-row items-center mb-2">
                <Ionicons name="card" size={20} color="#3B82F6" />
                <Text className="text-blue-800 font-medium ml-2">Métodos de Pago</Text>
              </View>
              <Text className="text-blue-700 text-sm">
                • Tarjetas de crédito y débito{'\n'}
                • PSE (Débito desde cuenta bancaria){'\n'}
                • Efectivo en puntos autorizados{'\n'}
                • Nequi, Daviplata y más
              </Text>
            </View>
          </View>
        )}

        {/* Botones de acción */}
        {!loading && paymentData && paymentStatus !== 'PAID' && (
          <View className="p-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={initiatePayment}
              disabled={loading}
              className="rounded-lg overflow-hidden"
            >
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                className="px-6 py-4 flex-row items-center justify-center"
              >
                <Ionicons name="card-outline" size={20} color="white" />
                <Text className="text-white font-medium ml-2">
                  Pagar {formatCurrency(paymentData.amount)}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* WebView para procesamiento de pago */}
        <Modal
          visible={webViewVisible}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <View className="flex-1 bg-white">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-gray-900">Pago Seguro</Text>
              <TouchableOpacity onPress={closeWebView}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            {paymentData?.paymentUrl && (
              <WebView
                source={{ uri: paymentData.paymentUrl }}
                style={{ flex: 1 }}
                onMessage={handleWebViewMessage}
                onNavigationStateChange={handleWebViewNavigationStateChange}
                startInLoadingState={true}
                renderLoading={() => (
                  <View className="flex-1 items-center justify-center bg-white">
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text className="text-gray-600 mt-2">Cargando pasarela de pago...</Text>
                  </View>
                )}
              />
            )}
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

export default PaymentProcessor;