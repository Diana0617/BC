import React, { useState, useEffect, useCallback } from 'react';
import { 
  XMarkIcon,
  CreditCardIcon,
  BanknotesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Componentes
import PaymentMethodSelector from './PaymentMethodSelector';
import PaymentSummary from './PaymentSummary';
import WompiIntegration from './WompiIntegration';
import TransferPayment from './TransferPayment';
import ProductSelector from './ProductSelector';

/**
 * Gestor principal del flujo de pagos
 * Maneja cierre de citas con múltiples métodos de pago
 * Integra Wompi, efectivo, transferencia y venta de productos
 */
export default function PaymentFlowManager({
  isOpen,
  onClose,
  appointment,
  onSuccess
}) {
  // Estados del flujo
  const [currentStep, setCurrentStep] = useState('method-selection'); // 'method-selection' | 'wompi' | 'transfer' | 'products' | 'summary'
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
    notes: '',
    payments: [] // Array de pagos múltiples
  });

  // Configuraciones específicas
  const [wompiConfig, setWompiConfig] = useState(null);

  useEffect(() => {
    if (isOpen && appointment) {
      initializePaymentFlow();
    }
  }, [isOpen, appointment]);

  const initializePaymentFlow = async () => {
    setLoading(true);
    
    try {
      // 1. Obtener métodos de pago activos
      const methods = await fetchPaymentMethods();
      
      // 2. Obtener configuración del negocio
      const config = await fetchBusinessPaymentConfig();
      
      // 3. Verificar pagos existentes (anticipados)
      const existingPayments = await fetchExistingPayments();
      
      // 4. Calcular monto pendiente
      const servicePrice = parseFloat(appointment.service?.price || appointment.totalAmount || 0);
      const paidAmount = existingPayments.reduce((sum, payment) => 
        sum + parseFloat(payment.amount || 0), 0
      );
      
      const pendingAmount = Math.max(0, servicePrice - paidAmount);
      
      setPaymentData({
        appointmentId: appointment.id,
        amount: pendingAmount,
        baseAmount: pendingAmount,
        products: [],
        existingPayments,
        notes: '',
        payments: []
      });

      // Si ya está pagado completamente
      if (pendingAmount === 0) {
        if (config?.allowProductSales) {
          setCurrentStep('products');
        } else {
          alert('Esta cita ya tiene el pago completo');
          onClose();
        }
      }
      
    } catch (error) {
      console.error('Error initializing payment flow:', error);
      alert('No se pudo cargar la configuración de pagos');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payment-methods/business/${appointment.businessId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Error cargando métodos de pago');
      
      const data = await response.json();
      const activeMethods = data.paymentMethods?.filter(m => m.isActive) || [];
      setPaymentMethods(activeMethods);
      
      return activeMethods;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  };

  const fetchBusinessPaymentConfig = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/business/${appointment.businessId}/payment-config`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Error cargando configuración');
      
      const config = await response.json();
      setBusinessConfig(config);

      // Verificar si Wompi está disponible
      if (config.wompiEnabled) {
        const wompiResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/payments/wompi-config/${appointment.businessId}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (wompiResponse.ok) {
          const wompiData = await wompiResponse.json();
          setWompiConfig(wompiData);
        }
      }
      
      return config;
    } catch (error) {
      console.error('Error fetching business config:', error);
      return null;
    }
  };

  const fetchExistingPayments = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/appointments/${appointment.id}/payments`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.payments || [];
    } catch (error) {
      console.error('Error fetching existing payments:', error);
      return [];
    }
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    
    // Navegar según el método
    if (method.code === 'WOMPI_CARD' || method.code === 'WOMPI_NEQUI') {
      setCurrentStep('wompi');
    } else if (method.code === 'TRANSFER') {
      setCurrentStep('transfer');
    } else if (method.code === 'CASH') {
      // Pago en efectivo directo
      handleCashPayment();
    } else {
      // Otros métodos personalizados
      handleCustomPayment(method);
    }
  };

  const handleCashPayment = () => {
    // Registrar pago en efectivo directamente
    const cashPayment = {
      method: 'CASH',
      amount: paymentData.amount,
      status: 'COMPLETED',
      transactionId: `CASH-${Date.now()}`
    };
    
    setPaymentData(prev => ({
      ...prev,
      payments: [...prev.payments, cashPayment]
    }));
    
    setCurrentStep('summary');
  };

  const handleCustomPayment = (method) => {
    const customPayment = {
      method: method.code,
      amount: paymentData.amount,
      status: 'COMPLETED',
      transactionId: `${method.code}-${Date.now()}`
    };
    
    setPaymentData(prev => ({
      ...prev,
      payments: [...prev.payments, customPayment]
    }));
    
    setCurrentStep('summary');
  };

  const handleWompiSuccess = (transaction) => {
    const wompiPayment = {
      method: 'WOMPI',
      amount: transaction.amount,
      status: 'COMPLETED',
      transactionId: transaction.id,
      reference: transaction.reference
    };
    
    setPaymentData(prev => ({
      ...prev,
      payments: [...prev.payments, wompiPayment]
    }));
    
    setCurrentStep('summary');
  };

  const handleTransferComplete = (transferInfo) => {
    const transferPayment = {
      method: 'TRANSFER',
      amount: transferInfo.amount,
      status: 'PENDING_VERIFICATION',
      transactionId: `TRANSFER-${Date.now()}`,
      proofUrl: transferInfo.proofUrl
    };
    
    setPaymentData(prev => ({
      ...prev,
      payments: [...prev.payments, transferPayment]
    }));
    
    setCurrentStep('summary');
  };

  const handleProductsSelected = (products) => {
    const productsTotal = products.reduce((sum, p) => 
      sum + (p.price * p.quantity), 0
    );
    
    setPaymentData(prev => ({
      ...prev,
      products,
      amount: prev.baseAmount + productsTotal
    }));
    
    setCurrentStep('method-selection');
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/appointments/${appointment.id}/process-payment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            payments: paymentData.payments,
            products: paymentData.products,
            notes: paymentData.notes
          })
        }
      );

      if (!response.ok) throw new Error('Error procesando pago');

      const data = await response.json();
      
      alert('Pago procesado exitosamente');
      
      if (onSuccess) {
        onSuccess(data);
      }
      
      onClose();
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'method-selection':
        return (
          <PaymentMethodSelector
            methods={paymentMethods}
            onSelect={handleMethodSelect}
            currentAmount={paymentData.amount}
            existingPayments={paymentData.existingPayments}
          />
        );
      
      case 'wompi':
        return (
          <WompiIntegration
            config={wompiConfig}
            amount={paymentData.amount}
            appointment={appointment}
            onSuccess={handleWompiSuccess}
            onCancel={() => setCurrentStep('method-selection')}
          />
        );
      
      case 'transfer':
        return (
          <TransferPayment
            amount={paymentData.amount}
            businessInfo={businessConfig}
            onComplete={handleTransferComplete}
            onCancel={() => setCurrentStep('method-selection')}
          />
        );
      
      case 'products':
        return (
          <ProductSelector
            businessId={appointment.businessId}
            onConfirm={handleProductsSelected}
            onCancel={() => setCurrentStep('method-selection')}
          />
        );
      
      case 'summary':
        return (
          <PaymentSummary
            paymentData={paymentData}
            appointment={appointment}
            onConfirm={handleConfirmPayment}
            onBack={() => setCurrentStep('method-selection')}
            loading={loading}
          />
        );
      
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCardIcon className="w-8 h-8 text-white" />
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Procesar Pago
                  </h3>
                  <p className="text-sm text-blue-100">
                    {appointment.client?.firstName} {appointment.client?.lastName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentStep === 'method-selection' 
                  ? 'bg-white text-blue-600' 
                  : 'bg-blue-500/30 text-white'
              }`}>
                1. Método
              </div>
              <ArrowPathIcon className="w-4 h-4 text-white" />
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                ['wompi', 'transfer'].includes(currentStep)
                  ? 'bg-white text-blue-600' 
                  : 'bg-blue-500/30 text-white'
              }`}>
                2. Detalles
              </div>
              <ArrowPathIcon className="w-4 h-4 text-white" />
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentStep === 'summary'
                  ? 'bg-white text-blue-600' 
                  : 'bg-blue-500/30 text-white'
              }`}>
                3. Confirmar
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-4 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              renderStepContent()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
