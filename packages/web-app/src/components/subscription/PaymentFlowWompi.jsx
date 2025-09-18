import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import WompiWidgetMinimal from './WompiWidgetMinimal'
import { resetSubscriptionFlow } from '@shared/store/slices/subscriptionSlice'

const PaymentFlowWompi = ({ 
  selectedPlan, 
  businessData, 
  onComplete, 
  onBack,
  isOwner = false,
  canCreateCashSubscriptions = false
}) => {
  const dispatch = useDispatch()
  const { paymentError } = useSelector(state => state.subscription)
  const [paymentStep, setPaymentStep] = useState('payment') // payment, processing, success, error
  const [paymentResult, setPaymentResult] = useState(null)

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency || 'COP'
    }).format(price)
  }

  const handlePaymentSuccess = (transaction) => {
    console.log('✅ Pago completado:', transaction)
    setPaymentResult(transaction)
    setPaymentStep('success')
    
    // Completar el flujo después de un breve delay
    setTimeout(() => {
      onComplete({
        success: true,
        transaction,
        businessData,
        selectedPlan,
        paymentMethod: 'wompi'
      })
    }, 2000)
  }

  const handlePaymentError = (error) => {
    console.error('❌ Error en el pago:', error)
    setPaymentStep('error')
    setPaymentResult({ error })
  }

  const handleRetry = () => {
    setPaymentStep('payment')
    setPaymentResult(null)
    dispatch(resetSubscriptionFlow())
  }

  const handleGoBack = () => {
    dispatch(resetSubscriptionFlow())
    onBack()
  }

  // Handler para pago en efectivo (Solo Owner)
  const handleCashPayment = () => {
    setPaymentStep('processing')
    
    // Simular una pequeña demora para UX
    setTimeout(() => {
      setPaymentStep('success')
      setPaymentResult({
        id: `CASH-${Date.now()}`,
        reference: `CASH-${businessData?.businessName || 'BUSINESS'}-${Date.now()}`,
        method: 'CASH'
      })
      
      // Llamar onComplete con método CASH para que SubscriptionPage maneje la creación
      onComplete({
        method: 'CASH',
        planId: selectedPlan.id,
        businessId: businessData?.businessId
      })
      
      // Redirigir después de mostrar el éxito
      setTimeout(() => {
        onComplete({
          method: 'CASH',
          planId: selectedPlan.id,
          businessId: businessData?.businessId,
          redirect: true
        })
      }, 3000)
    }, 1500)
  }

  // Render del paso de procesamiento
  if (paymentStep === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-plan-lg rounded-3xl sm:px-10 border-2 border-yellow-400">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                <svg className="animate-spin h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Procesando Pago
              </h2>
              <p className="text-gray-600 mb-4">
                Tu pago está siendo procesado. Te notificaremos cuando se complete.
              </p>
              {paymentResult && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700">
                    <strong>Referencia:</strong> {paymentResult.reference}
                  </p>
                </div>
              )}
              <button
                onClick={handleGoBack}
                className="text-purple-600 hover:text-purple-500 text-sm font-medium"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render del paso de éxito
  if (paymentStep === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-plan-lg rounded-3xl sm:px-10 border-2 border-green-400">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                ¡{paymentResult?.method === 'CASH' ? 'Suscripción Creada' : 'Pago Completado'}!
              </h2>
              <p className="text-gray-600 mb-4">
                Tu suscripción al plan <strong>{selectedPlan.name}</strong> ha sido activada exitosamente{paymentResult?.method === 'CASH' ? ' (Pago en Efectivo)' : ''}.
              </p>
              {paymentResult && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700">
                    <strong>ID de transacción:</strong> {paymentResult.id}
                  </p>
                  {paymentResult.method && (
                    <p className="text-sm text-gray-700">
                      <strong>Método:</strong> {paymentResult.method === 'CASH' ? 'Pago en Efectivo' : 'Wompi'}
                    </p>
                  )}
                  <p className="text-sm text-gray-700">
                    <strong>Monto:</strong> {formatPrice(selectedPlan.price, selectedPlan.currency)}
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Redirigiendo automáticamente...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render del paso de error
  if (paymentStep === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-plan-lg rounded-3xl sm:px-10 border-2 border-red-400">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Error en el Pago
              </h2>
              <p className="text-gray-600 mb-4">
                {paymentResult?.error || paymentError || 'Hubo un problema al procesar tu pago.'}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Intentar de Nuevo
                </button>
                <button
                  onClick={handleGoBack}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Volver al Inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render principal del paso de pago
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-center py-6 sm:py-12 px-2 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md sm:max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 mb-2 bg-gradient-to-r from-cyan-400 via-yellow-400 to-red-400 bg-clip-text text-transparent drop-shadow-lg">
            Finalizar Suscripción
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-700">
            Plan seleccionado: <strong>{selectedPlan.name}</strong>
          </p>
        </div>

        <div className="bg-white py-4 sm:py-8 px-2 sm:px-4 shadow-plan-lg rounded-2xl sm:rounded-3xl border-2 border-cyan-400">
          {/* Botón de volver */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={handleGoBack}
              className="flex items-center text-xs sm:text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver a selección de plan
            </button>
          </div>

          {/* Resumen del plan */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">
              Resumen del Plan
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-600">Plan:</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-600">Duración:</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900">
                  {selectedPlan.duration} {selectedPlan.durationType === 'monthly' ? 'mes' : 'año'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-600">Negocio:</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900">{businessData?.businessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-600">Email:</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900">{businessData?.email}</span>
              </div>
              <div className="border-t pt-2 sm:pt-3">
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base font-semibold text-gray-900">Total:</span>
                  <span className="text-sm sm:text-base font-bold text-purple-600">
                    {formatPrice(selectedPlan.price, selectedPlan.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Widget de Wompi */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4 flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2 text-green-500" />
              Método de Pago
            </h3>
            
            {/* Opciones de pago para Owner */}
            {isOwner && canCreateCashSubscriptions && (
              <div className="mb-4 sm:mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Modo de Desarrollo</h4>
                      <p className="text-xs text-yellow-700 mt-1">Como Owner, puedes crear suscripciones sin procesar pago</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleCashPayment}
                  className="w-full flex justify-center items-center py-3 px-4 border-2 border-green-500 rounded-lg shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mb-4 transition-colors duration-200"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                  Crear Suscripción (Pago en Efectivo)
                </button>
                
                <div className="text-center text-xs text-gray-500 mb-4">
                  <span>o</span>
                </div>
              </div>
            )}
            
            <WompiWidgetMinimal
              planName={selectedPlan.name}
              amount={selectedPlan.price}
              businessData={businessData}
              selectedPlan={selectedPlan}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-4">
            <div className="flex flex-col sm:flex-row">
              <div className="flex-shrink-0 flex items-center justify-center">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-0 sm:ml-3 mt-2 sm:mt-0">
                <h3 className="text-xs sm:text-sm font-medium text-blue-800">
                  Información importante
                </h3>
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Tu suscripción se activará inmediatamente después del pago</li>
                    <li>Recibirás un email de confirmación con los detalles</li>
                    <li>Puedes cancelar tu suscripción en cualquier momento</li>
                    <li>El pago es procesado de forma segura por Wompi</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentFlowWompi