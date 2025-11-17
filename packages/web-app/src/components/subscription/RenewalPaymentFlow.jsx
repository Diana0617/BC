import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Loader2, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

const RenewalPaymentFlow = ({ 
  selectedPlan, 
  billingCycle,
  businessData,
  onSuccess,
  onError 
}) => {
  const { token } = useSelector(state => state.auth);
  const [step, setStep] = useState('ready'); // ready, processing, success, error
  const [error, setError] = useState(null);
  const [transactionData, setTransactionData] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price);
  };

  const getAmount = () => {
    if (billingCycle === 'YEARLY' && selectedPlan.yearlyPrice) {
      return selectedPlan.yearlyPrice;
    }
    return selectedPlan.price;
  };

  const handleProcessPayment = async () => {
    setStep('processing');
    setError(null);

    try {
      // Verificar que tenemos token de autenticación
      const authToken = token || localStorage.getItem('token');
      
      console.log('🔐 Iniciando renovación:', {
        businessId: businessData.businessId,
        planId: selectedPlan.id,
        amount: getAmount(),
        billingCycle,
        hasToken: !!authToken,
        tokenSource: token ? 'Redux' : 'localStorage'
      });

      if (!authToken) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      }

      // Usar endpoint específico de renovación
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${API_BASE_URL}/api/wompi/renew-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          businessId: businessData.businessId,
          planId: selectedPlan.id,
          amount: getAmount(),
          billingCycle: billingCycle
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      
      console.log('✅ Renovación completada:', result);
      
      setTransactionData(result.data);
      setStep('success');

      // Notificar éxito después de un breve delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess({
            success: true,
            transaction: result,
            method: '3DS_RENEWAL'
          });
        }
      }, 1500);

    } catch (err) {
      console.error('❌ Error en pago 3DS:', err);
      setError(err.message || 'Error procesando el pago');
      setStep('error');
      
      if (onError) {
        onError(err);
      }
    }
  };

  const handleRetry = () => {
    setStep('ready');
    setError(null);
    setTransactionData(null);
  };

  // Estado: Listo para procesar
  if (step === 'ready') {
    return (
      <div className="space-y-4">
        {/* Resumen */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Renovación</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Plan:</span>
              <span className="font-medium text-gray-900">{selectedPlan.name}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ciclo:</span>
              <span className="font-medium text-gray-900">
                {billingCycle === 'YEARLY' ? 'Anual' : 'Mensual'}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Monto:</span>
              <span className="font-medium text-gray-900">{formatPrice(getAmount())}</span>
            </div>

            {billingCycle === 'YEARLY' && (
              <div className="flex justify-between text-xs">
                <span className="text-green-600">Ahorro mensual:</span>
                <span className="font-medium text-green-600">
                  ~{formatPrice(getAmount() / 12)}/mes
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-blue-200">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-bold text-xl text-blue-600">{formatPrice(getAmount())}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Información de pago simulado */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-1">
                Modo de Prueba
              </h4>
              <p className="text-xs text-yellow-700">
                Este pago se procesará automáticamente con tarjeta simulada (4242).
                En producción se solicitará tu tarjeta real.
              </p>
            </div>
          </div>
        </div>

        {/* Botón de procesar pago */}
        <button
          onClick={handleProcessPayment}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          <CreditCard className="h-5 w-5" />
          Procesar Renovación
        </button>

        {/* Info de seguridad */}
        <p className="text-xs text-center text-gray-500">
          🔒 Pago seguro procesado con autenticación 3DS v2
        </p>
      </div>
    );
  }

  // Estado: Procesando
  if (step === 'processing') {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Procesando Pago
        </h3>
        <p className="text-gray-600 mb-4">
          Estamos verificando tu pago de forma segura...
        </p>
        <div className="max-w-md mx-auto bg-blue-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
            <div className="text-left">
              <p className="text-sm text-blue-800 font-medium">Autenticación 3DS v2</p>
              <p className="text-xs text-blue-600 mt-1">
                Verificando con el banco emisor...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado: Éxito
  if (step === 'success') {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          ¡Renovación Exitosa!
        </h3>
        <p className="text-gray-600 mb-2">
          Tu suscripción ha sido renovada correctamente
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Tus datos han sido restaurados y tienes acceso completo
        </p>

        {transactionData && (
          <div className="max-w-md mx-auto bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monto:</span>
                <span className="font-medium">{formatPrice(getAmount())}</span>
              </div>
              {transactionData.transactionId && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">ID Transacción:</p>
                  <p className="text-xs font-mono text-gray-700 break-all">
                    {transactionData.transactionId}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>Redirigiendo...</span>
        </div>
      </div>
    );
  }

  // Estado: Error
  if (step === 'error') {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <AlertCircle className="h-20 w-20 text-red-500 mx-auto" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Error en el Pago
        </h3>
        <p className="text-gray-600 mb-6">
          {error || 'Hubo un problema al procesar tu pago'}
        </p>

        <div className="max-w-md mx-auto space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Intentar Nuevamente
          </button>
          
          <p className="text-xs text-gray-500">
            Si el problema persiste, contacta a soporte
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default RenewalPaymentFlow;
