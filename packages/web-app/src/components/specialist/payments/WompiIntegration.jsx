import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCardIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

/**
 * Integración con Wompi para pagos con tarjeta y Nequi
 * Maneja el flujo completo de pago en línea
 */
export default function WompiIntegration({ 
  config, 
  amount, 
  appointment, 
  onSuccess, 
  onCancel 
}) {
  const [loading, setLoading] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('PENDING'); // 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR'
  const [errorMessage, setErrorMessage] = useState('');
  const iframeRef = useRef(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  useEffect(() => {
    if (config && amount > 0) {
      initiatePayment();
    }
  }, [config, amount]);

  const initiatePayment = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      // Crear transacción en el backend
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payments/wompi/create`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            appointmentId: appointment.id,
            amount: amount * 100, // Wompi usa centavos
            currency: 'COP',
            reference: `APT-${appointment.id}-${Date.now()}`,
            customerEmail: appointment.client?.email || 'sin-email@beautycontrol.com',
            redirectUrl: `${window.location.origin}/payment-result`
          })
        }
      );

      if (!response.ok) {
        throw new Error('Error al crear transacción en Wompi');
      }

      const data = await response.json();
      
      setTransactionId(data.transactionId);
      setPaymentLink(data.paymentLink);
      
      // El iframe cargará automáticamente el link de Wompi
    } catch (error) {
      console.error('Error initiating Wompi payment:', error);
      setErrorMessage('No se pudo iniciar el proceso de pago. Intenta nuevamente.');
      setPaymentStatus('ERROR');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payments/wompi/status/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) throw new Error('Error verificando estado');

      const data = await response.json();
      
      setPaymentStatus(data.status);

      if (data.status === 'APPROVED') {
        onSuccess({
          id: transactionId,
          amount: amount,
          reference: data.reference,
          method: 'WOMPI',
          status: 'APPROVED'
        });
      } else if (data.status === 'DECLINED') {
        setErrorMessage(data.message || 'El pago fue rechazado');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setErrorMessage('Error al verificar el estado del pago');
    }
  };

  // Escuchar mensajes del iframe
  useEffect(() => {
    const handleMessage = (event) => {
      // Verificar que el mensaje viene de Wompi
      if (event.origin.includes('wompi.co')) {
        const data = event.data;
        
        if (data.event === 'transaction.updated') {
          if (data.status === 'APPROVED') {
            setPaymentStatus('APPROVED');
            checkPaymentStatus();
          } else if (data.status === 'DECLINED' || data.status === 'ERROR') {
            setPaymentStatus('DECLINED');
            setErrorMessage(data.message || 'Pago rechazado');
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [transactionId]);

  // Verificar estado periódicamente
  useEffect(() => {
    if (transactionId && paymentStatus === 'PENDING') {
      const interval = setInterval(() => {
        checkPaymentStatus();
      }, 5000); // Verificar cada 5 segundos

      return () => clearInterval(interval);
    }
  }, [transactionId, paymentStatus]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <CreditCardIcon className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Pago Seguro con Wompi
        </h3>
        <p className="text-gray-600">
          Paga con tarjeta de crédito, débito o Nequi
        </p>
      </div>

      {/* Monto */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
        <p className="text-sm text-gray-600 text-center mb-1">Monto a Pagar</p>
        <p className="text-4xl font-bold text-gray-900 text-center">
          {formatCurrency(amount)}
        </p>
      </div>

      {/* Estados */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Iniciando proceso de pago...</p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">Error en el Pago</p>
              <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {paymentStatus === 'APPROVED' && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-800">¡Pago Exitoso!</p>
              <p className="text-sm text-green-700 mt-1">
                Tu pago ha sido procesado correctamente
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Iframe de Wompi */}
      {paymentLink && paymentStatus === 'PENDING' && !loading && (
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden" style={{ height: '600px' }}>
          <iframe
            ref={iframeRef}
            src={paymentLink}
            className="w-full h-full"
            title="Pago Wompi"
            allow="payment"
            sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation"
          />
        </div>
      )}

      {/* Información de Seguridad */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="flex-1">
            <h5 className="font-medium text-gray-900 mb-1">Pago 100% Seguro</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Transacción protegida por Wompi</li>
              <li>• Tus datos bancarios están seguros</li>
              <li>• Certificado SSL de seguridad</li>
              <li>• No guardamos información de tarjetas</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Botón Cancelar */}
      {paymentStatus !== 'APPROVED' && (
        <button
          onClick={onCancel}
          className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      )}

      {/* Logos de Métodos de Pago */}
      <div className="flex items-center justify-center gap-4 pt-4 opacity-50">
        <img src="/visa-logo.svg" alt="Visa" className="h-8" onError={(e) => e.target.style.display = 'none'} />
        <img src="/mastercard-logo.svg" alt="Mastercard" className="h-8" onError={(e) => e.target.style.display = 'none'} />
        <img src="/nequi-logo.svg" alt="Nequi" className="h-8" onError={(e) => e.target.style.display = 'none'} />
      </div>
    </div>
  );
}
