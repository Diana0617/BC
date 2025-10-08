import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import logo from '../../../public/logo.png';
import { useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch} from 'react-redux'
import { fetchPublicPlans } from '@shared/store/slices/plansSlice'
import { createSubscription } from '@shared/store/slices/subscriptionSlice'
import { createBusinessManually } from '@shared/store/slices/ownerBusinessSlice'
import { selectIsOwner, selectCanCreateCashSubscriptions } from '@shared/store/selectors/authSelectors'
import PlanSelection from '../../components/subscription/PlanSelection'
import BusinessRegistration from '../../components/subscription/BusinessRegistration'
import PaymentFlow from '../../components/subscription/PaymentFlowWompi'
import LoginModal from '../auth/LoginModal';

const SubscriptionPage = () => {
  // Estado de autenticación y navegación

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [billingCycle, setBillingCycle] = useState('MONTHLY')
  const [registrationData, setRegistrationData] = useState(null)
  const [invitationToken, setInvitationToken] = useState(null)

  // Redux state
  const { plans, loading } = useSelector(state => state.plans)
  const { loading: subscriptionLoading, error: subscriptionError } = useSelector(state => state.subscription)
  
  // Owner permissions
  const isOwner = useSelector(selectIsOwner)
  const canCreateCashSubscriptions = useSelector(selectCanCreateCashSubscriptions)

  const { isAuthenticated, user } = useSelector(state => state.auth);
 

  // Handler para ir al dashboard según rol
  const handleGoDashboard = () => {
    if (user?.role === 'OWNER') {
      navigate('/owner/dashboard');
    } else if (user?.role === 'BUSINESS_OWNER') {
      navigate('/dashboard');
    }
  };

  // Handler para logout
  const handleLogout = () => {
    dispatch({ type: 'auth/logout' });
    window.location.reload();
  };

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

  const handlePlanSelection = (plan, selectedCycle) => {
    setSelectedPlan(plan)
    // Actualizar el ciclo de facturación seleccionado desde la card
    if (selectedCycle) {
      setBillingCycle(selectedCycle)
    }
    // Avanzar automáticamente al siguiente paso
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

    // 🔍 DEBUG: Verificar contenido exacto de paymentData
    console.log('🔍 DEBUG paymentData completo:', paymentData)
    console.log('🔍 DEBUG paymentData.businessCreated:', paymentData.businessCreated)
    console.log('🔍 DEBUG paymentData.transaction.businessCreated:', paymentData.transaction?.businessCreated)
    console.log('🔍 DEBUG typeof businessCreated:', typeof paymentData.transaction?.businessCreated)

    // ✅ VERIFICAR SI EL NEGOCIO YA FUE CREADO DURANTE 3DS
    if (paymentData.transaction?.businessCreated === true) {
      console.log('✅ Negocio ya creado durante 3DS - saltando creación adicional')
      alert('¡Suscripción completada exitosamente! El negocio ya está listo.')
      // TODO: Redirigir al dashboard del negocio creado
      return
    }

    console.log('⚠️ businessCreated no es true, continuando con creación tradicional...')

    // Si es pago efectivo (Owner), usar action de Redux para crear negocio
    if (paymentData.method === 'CASH' && isOwner && canCreateCashSubscriptions) {
      try {
        console.log('Procesando pago efectivo para Owner...')
        
        // Crear negocio usando Redux action
        const businessData = {
          businessName: registrationData.businessName,
          businessEmail: registrationData.businessEmail,
          businessPhone: registrationData.businessPhone,
          address: registrationData.address,
          city: registrationData.city,
          country: registrationData.country,
          ownerEmail: registrationData.email,
          ownerFirstName: registrationData.firstName,
          ownerLastName: registrationData.lastName,
          ownerPhone: registrationData.phone,
          ownerPassword: registrationData.password,
          subscriptionPlanId: selectedPlan.id
        }
        
        const result = await dispatch(createBusinessManually(businessData))
        
        if (createBusinessManually.fulfilled.match(result)) {
          console.log('✅ Negocio y suscripción creados exitosamente:', result.payload)
          alert('¡Suscripción con pago efectivo creada exitosamente!')
          // TODO: Redirigir al dashboard o página de éxito
          return
        } else if (createBusinessManually.rejected.match(result)) {
          throw new Error(result.payload || result.error.message || 'Error creando negocio')
        }
        
      } catch (error) {
        console.error('❌ Error con pago efectivo:', error)
        alert('Error al crear suscripción efectivo: ' + error.message)
        return
      }
    }

    // Preparar datos para envío al backend usando Redux (flujo normal Wompi)
    const subscriptionData = {
      // Plan seleccionado
      planId: selectedPlan.id,
      
      // Ciclo de facturación elegido por el usuario
      billingCycle: billingCycle,
      
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

  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
  <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-nunito overflow-x-hidden">
      {/* Header estilo landing */}
      <header className="bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 shadow-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-20 py-4 sm:py-0">
            <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto">
              <div className="bg-cyan-400 rounded-full p-2 sm:mr-3 mb-2 sm:mb-0 flex items-center justify-center">
                <img src={logo} alt="Logo" className="h-10 w-auto sm:h-8" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-white tracking-wide text-center sm:text-left">
                Business Control
              </h1>
              <span className="ml-0 sm:ml-2 mt-2 sm:mt-0 px-2 py-1 text-xs bg-yellow-400 text-gray-900 rounded-full font-semibold shadow text-center sm:text-left">
                Business
              </span>
            </div>
            <div className="text-xs sm:text-sm text-gray-200 mt-4 sm:mt-0 w-full sm:w-auto text-center sm:text-right">
              {isAuthenticated && user?.role ? (
                <>
                  <button
                    type="button"
                    className="ml-1 text-cyan-400 hover:text-cyan-300 font-bold bg-transparent border-none cursor-pointer"
                    onClick={handleGoDashboard}
                  >
                    Ir al dashboard
                  </button>
                  <button
                    type="button"
                    className="ml-3 text-red-400 hover:text-red-300 font-bold bg-transparent border-none cursor-pointer"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?
                  <button
                    type="button"
                    className="ml-1 text-cyan-400 hover:text-cyan-300 font-bold bg-transparent border-none cursor-pointer"
                    onClick={() => setShowLoginModal(true)}
                  >
                    Inicia sesión
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      )}

      {/* Progress indicator estilo landing */}
      <div className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-8 w-full sm:w-auto">
                <div className={`flex items-center ${currentStep >= 1 ? 'text-cyan-400' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg ${
                    currentStep >= 1 ? 'border-cyan-400 bg-cyan-400 text-white' : 'border-gray-300 bg-gray-900 text-gray-400'
                  }`}>
                    1
                  </div>
                  <span className="ml-2 font-semibold">Seleccionar Plan</span>
                </div>
                <div className={`flex items-center ${currentStep >= 2 ? 'text-yellow-400' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg ${
                    currentStep >= 2 ? 'border-yellow-400 bg-yellow-400 text-gray-900' : 'border-gray-300 bg-gray-900 text-gray-400'
                  }`}>
                    2
                  </div>
                  <span className="ml-2 font-semibold">Registro</span>
                </div>
                <div className={`flex items-center ${currentStep >= 3 ? 'text-red-400' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg ${
                    currentStep >= 3 ? 'border-red-400 bg-red-400 text-white' : 'border-gray-300 bg-gray-900 text-gray-400'
                  }`}>
                    3
                  </div>
                  <span className="ml-2 font-semibold">Pago</span>
                </div>
              </div>
              {currentStep > 1 && (
                <button
                  onClick={handleBackStep}
                  className="text-gray-300 hover:text-white flex items-center font-semibold"
                >
                  ← Volver
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
  <main className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 py-6 sm:py-8">
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

        {/* Main content steps remain unchanged */}
        {currentStep === 1 && (
          <PlanSelection
            plans={plans}
            loading={loading}
            onPlanSelect={handlePlanSelection}
            invitationToken={invitationToken}
            billingCycle={billingCycle}
            onCycleChange={setBillingCycle}
          />
        )}

        {currentStep === 2 && (
          <BusinessRegistration
            selectedPlan={selectedPlan}
            billingCycle={billingCycle}
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
            isOwner={isOwner}
            canCreateCashSubscriptions={canCreateCashSubscriptions}
          />
        )}

        {/* Darker lower texts and styled footer */}
        {/* Solo la versión oscura y fuerte, sin repetición */}

        {/* Footer con estilo oscuro */}
        <footer className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 border-t mt-10 sm:mt-16">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="text-center">
              <p className="text-xs sm:text-base text-gray-200 font-semibold">Business Control © 2025. Sistema de gestión para tu negocio.</p>
              <div className="mt-2">
                <a href="/terms" className="text-red-400 hover:text-red-300 mr-4 font-semibold text-xs sm:text-base">
                  Términos y Condiciones
                </a>
                <a href="/privacy" className="text-red-400 hover:text-red-300 font-semibold text-xs sm:text-base">
                  Política de Privacidad
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default SubscriptionPage