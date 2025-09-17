import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchPublicPlans } from '../../../../shared/src/store/slices/plansSlice'
import { createSubscription } from '../../../../shared/src/store/slices/subscriptionSlice'
import PlanSelection from '../../components/subscription/PlanSelection'
import BusinessRegistration from '../../components/subscription/BusinessRegistration'
import PaymentFlow from '../../components/subscription/PaymentFlowWompi'

const SubscriptionPage = () => {
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [registrationData, setRegistrationData] = useState(null)
  const [invitationToken, setInvitationToken] = useState(null)

  // Redux state
  const { plans, loading } = useSelector(state => state.plans)
  const { loading: subscriptionLoading, error: subscriptionError } = useSelector(state => state.subscription)

  // Debug: Ver el estado de los planes
  console.log('SubscriptionPage - Plans from Redux:', plans)
  console.log('SubscriptionPage - Loading state:', loading)
  console.log('SubscriptionPage - Plans array:', Array.isArray(plans) ? plans : 'Not an array')

  useEffect(() => {
    console.log('SubscriptionPage - useEffect triggered, dispatching fetchPublicPlans')
    // Cargar planes disponibles
    dispatch(fetchPublicPlans())

    // Verificar si viene de una invitación
    const token = searchParams.get('token')
    const invitation = searchParams.get('invitation')
    
    if (token || invitation) {
      setInvitationToken(token || invitation)
      // TODO: Validar token y pre-llenar datos de invitación
    }
  }, [dispatch, searchParams])

  const handlePlanSelection = (plan) => {
    setSelectedPlan(plan)
    setCurrentStep(2)
  }

  const handleRegistrationComplete = (data) => {
    setRegistrationData(data)
    setCurrentStep(3)
  }

  const handlePaymentComplete = async (paymentData) => {
    console.log('Suscripción completada:', {
      plan: selectedPlan,
      business: registrationData,
      payment: paymentData,
      invitation: invitationToken
    })

    // Preparar datos para envío al backend usando Redux
    const subscriptionData = {
      // Plan seleccionado
      planId: selectedPlan.id,
      
      // Datos del negocio (incluyendo businessCode que es el subdominio)
      businessData: {
        name: registrationData.businessName,
        businessCode: registrationData.businessCode, // <- El subdominio
        type: registrationData.businessType,
        phone: registrationData.businessPhone,
        email: registrationData.businessEmail,
        address: registrationData.address,
        city: registrationData.city,
        country: registrationData.country
      },
      
      // Datos del usuario administrador
      userData: {
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        email: registrationData.email,
        phone: registrationData.phone,
        password: registrationData.password
      },
      
      // Datos del pago
      paymentData: {
        transactionId: paymentData.transactionId,
        method: paymentData.method,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: paymentData.status || 'APPROVED'
      },
      
      // Token de invitación si existe
      invitationToken: invitationToken,
      
      // Aceptación de términos
      acceptedTerms: {
        terms: registrationData.acceptTerms,
        privacy: registrationData.acceptPrivacy,
        marketing: registrationData.acceptMarketing
      }
    }

    console.log('Enviando al backend via Redux:', subscriptionData)

    try {
      // Usar Redux action en lugar de fetch directo
      const result = await dispatch(createSubscription(subscriptionData))
      
      if (createSubscription.fulfilled.match(result)) {
        console.log('Suscripción creada exitosamente:', result.payload)
        alert('¡Suscripción creada exitosamente!')
        // TODO: Redirigir al dashboard del nuevo negocio o página de éxito
      } else if (createSubscription.rejected.match(result)) {
        console.error('Error en la suscripción:', result.payload)
        alert('Error al crear la suscripción: ' + result.payload)
      }
    } catch (error) {
      console.error('Error al crear suscripción via Redux:', error)
      alert('Error de conexión al crear la suscripción')
    }
  }

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Beauty Control
              </h1>
              <span className="ml-2 px-2 py-1 text-xs bg-pink-100 text-pink-600 rounded-full">
                Business
              </span>
            </div>
            <div className="text-sm text-gray-500">
              ¿Ya tienes cuenta? 
              <a href="/login" className="ml-1 text-pink-600 hover:text-pink-500">
                Inicia sesión
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className={`flex items-center ${currentStep >= 1 ? 'text-pink-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= 1 ? 'border-pink-600 bg-pink-600 text-white' : 'border-gray-300'
                  }`}>
                    1
                  </div>
                  <span className="ml-2 font-medium">Seleccionar Plan</span>
                </div>
                
                <div className={`flex items-center ${currentStep >= 2 ? 'text-pink-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= 2 ? 'border-pink-600 bg-pink-600 text-white' : 'border-gray-300'
                  }`}>
                    2
                  </div>
                  <span className="ml-2 font-medium">Registro</span>
                </div>
                
                <div className={`flex items-center ${currentStep >= 3 ? 'text-pink-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= 3 ? 'border-pink-600 bg-pink-600 text-white' : 'border-gray-300'
                  }`}>
                    3
                  </div>
                  <span className="ml-2 font-medium">Pago</span>
                </div>
              </div>
              
              {currentStep > 1 && (
                <button
                  onClick={handleBackStep}
                  className="text-gray-600 hover:text-gray-900 flex items-center"
                >
                  ← Volver
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Show subscription error if any */}
        {subscriptionError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error al crear la suscripción
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {subscriptionError}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <PlanSelection
            plans={plans}
            loading={loading}
            onPlanSelect={handlePlanSelection}
            invitationToken={invitationToken}
          />
        )}

        {currentStep === 2 && (
          <BusinessRegistration
            selectedPlan={selectedPlan}
            invitationToken={invitationToken}
            onComplete={handleRegistrationComplete}
            onBack={handleBackStep}
          />
        )}

        {currentStep === 3 && (
          <PaymentFlow
            selectedPlan={selectedPlan}
            businessData={registrationData}
            invitationToken={invitationToken}
            onComplete={handlePaymentComplete}
            onBack={handleBackStep}
            loading={subscriptionLoading}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>Beauty Control © 2025. Sistema de gestión para salones de belleza.</p>
            <div className="mt-2">
              <a href="/terms" className="text-pink-600 hover:text-pink-500 mr-4">
                Términos y Condiciones
              </a>
              <a href="/privacy" className="text-pink-600 hover:text-pink-500">
                Política de Privacidad
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default SubscriptionPage