import React, { useState, useEffect, useCallback } from 'react'
import { use3DSPayments } from '../../../../shared/src/hooks/use3DSPayments'

const WompiWidgetMinimal = ({ 
  planName = "Premium", 
  amount = 1200000,
  businessData = null,
  selectedPlan = null,
  billingCycle = 'MONTHLY',
  isRenewal = false,
  onSuccess, 
  onError,
  onPaymentSuccess, // Alias para compatibilidad
  onPaymentError    // Alias para compatibilidad
}) => {
  // Normalizar callbacks para compatibilidad
  const handleSuccess = onSuccess || onPaymentSuccess;
  const handleError = onError || onPaymentError;
  // Hook para manejar pagos 3DS v2 (incluye configuración Wompi)
  const {
    // Estado 3DS autenticado
    isProcessing: processing3DS,
    error: threeds_error,
    transactionData,
    hasChallenge,
    hasTransaction,
    isCompleted,
    isDeclined,
    isPending,
    
    // Configuración
    config,
    configLoading: loading,
    configError,
    hasConfig,
    
    // Funciones 3DS autenticado
    loadWompiConfig,
    createPayment,
    processChallenge,
    pollTransactionStatus,
    
    // Funciones 3DS público
    createPublicPayment,
    pollPublicTransactionStatus,
    
    // Utilidades
    getBrowserInfo
  } = use3DSPayments()
  
  const [error, setError] = useState(null)
  const [use3DS, setUse3DS] = useState(true) // Toggle para habilitar/deshabilitar 3DS
  const [isPolling, setIsPolling] = useState(false) // Estado para polling
  
  // Estados para tokens de Wompi
  const [cardToken, setCardToken] = useState(null)
  const [acceptanceToken, setAcceptanceToken] = useState(null)
  const [showCardForm, setShowCardForm] = useState(false)
  const [isTokenizing, setIsTokenizing] = useState(false)

  // Calcular el monto según el plan y ciclo de facturación
  const calculateAmount = () => {
    if (!selectedPlan) return amount;
    
    if (billingCycle === 'YEARLY' && selectedPlan.yearlyPrice) {
      return selectedPlan.yearlyPrice;
    }
    
    return selectedPlan.price || amount;
  };

  const finalAmount = calculateAmount();

  // DEBUG: Log inicial del componente
  useEffect(() => {
    console.log('🎬 WompiWidgetMinimal montado - Props:', {
      planName,
      amount,
      billingCycle,
      isRenewal,
      finalAmount,
      businessData: businessData ? {
        businessId: businessData.businessId,
        businessCode: businessData.businessCode,
        email: businessData.email
      } : null,
      selectedPlan: selectedPlan ? {
        id: selectedPlan.id,
        name: selectedPlan.name
      } : null
    })
  }, [])

  // Función para cargar el acceptance token
  const loadAcceptanceToken = useCallback(async () => {
    try {
      // Usar sandbox para desarrollo
      const baseUrl = config?.environment === 'production' ? 'https://production.wompi.co' : 'https://sandbox.wompi.co'
      const response = await fetch(`${baseUrl}/v1/merchants/${config.publicKey}`)
      const data = await response.json()
      console.log('🔍 Respuesta acceptance token:', data)
      if (data.data?.presigned_acceptance) {
        setAcceptanceToken(data.data.presigned_acceptance.acceptance_token)
        console.log('✅ Acceptance token cargado desde:', baseUrl)
      } else {
        console.warn('⚠️ No se encontró presigned_acceptance en:', data)
      }
    } catch (error) {
      console.error('Error cargando acceptance token:', error)
    }
  }, [config])

  // Cargar configuración usando el hook
  useEffect(() => {
    console.log('🔧 DEBUG - useEffect config:', {
      hasConfig,
      loading,
      configError,
      config: !!config
    })
    
    if (!hasConfig && !loading && !configError) {
      console.log('🔧 Cargando configuración Wompi con hook...')
      loadWompiConfig().catch(err => {
        console.error('Error cargando config:', err)
        setError('Error cargando configuración: ' + err.message)
      })
    }
  }, [hasConfig, loading, configError, loadWompiConfig])

  // Cargar acceptance token cuando la configuración esté disponible
  useEffect(() => {
    if (config && !acceptanceToken) {
      loadAcceptanceToken()
    }
  }, [config, acceptanceToken, loadAcceptanceToken])

  const handlePayment = async () => {
    if (!config) {
      setError('Configuración no disponible')
      return
    }

    setError(null)

    try {
      console.log('🚀 Iniciando proceso de pago...')
      
      // DEBUG: Verificar condiciones para 3DS v2
      console.log('🔍 DEBUG - Condiciones 3DS v2:', {
        use3DS: use3DS,
        hasBusinessId: !!businessData?.businessId,
        businessId: businessData?.businessId,
        hasBusinessCode: !!businessData?.businessCode,
        businessCode: businessData?.businessCode,
        hasPlanId: !!selectedPlan?.id,
        planId: selectedPlan?.id,
        hasToken: !!localStorage.getItem('token'),
        token: localStorage.getItem('token') ? 'TOKEN_EXISTS' : 'NO_TOKEN',
        isRegistrationFlow: !businessData?.businessId && !!businessData?.businessCode
      })
      
      // Verificar si usar 3DS v2 o método simple
      // 3DS v2 puede usarse en dos casos:
      // 1. Owner autenticado: businessId + token
      // 2. Registro público: businessCode + plan (sin token)
      const hasAuthenticatedData = businessData?.businessId && localStorage.getItem('token')
      const hasRegistrationData = businessData?.businessCode && selectedPlan?.id
      const canUse3DS = use3DS && (hasAuthenticatedData || hasRegistrationData)
      
      if (canUse3DS) {
        // Para 3DS v2 necesitamos cardToken y acceptanceToken
        if (!cardToken || !acceptanceToken) {
          console.log('🔑 Necesitamos tokens para 3DS v2 - mostrando formulario de tarjeta')
          setShowCardForm(true)
          return
        }
        
        console.log('🔐 Usando 3DS v2 con tokens...', {
          type: hasAuthenticatedData ? 'OWNER_AUTHENTICATED' : 'PUBLIC_REGISTRATION',
          hasCardToken: !!cardToken,
          hasAcceptanceToken: !!acceptanceToken
        })
        await handle3DSPayment()
      } else {
        console.log('💳 Usando método simple...')
        console.log('💡 Razón del fallback:', {
          toggleDisabled: !use3DS,
          missingBusinessData: !businessData?.businessId && !businessData?.businessCode,
          missingPlanId: !selectedPlan?.id,
          hasToken: !!localStorage.getItem('token'),
          note: 'Faltan datos necesarios para 3DS v2'
        })
        await handleSimplePayment()
      }

    } catch (err) {
      console.error('❌ Error en pago:', err)
      setError('Error: ' + err.message)
      if (handleError) handleError(err)
    }
  }

  // Método 3DS v2 usando el hook (autenticado o público)
  const handle3DSPayment = async () => {
    const hasToken = !!localStorage.getItem('token')
    const isAuthenticated = hasToken && businessData?.businessId
    const isRegistration = !hasToken && businessData?.businessCode
    
    console.log('🎯 INICIANDO MÉTODO 3DS V2:', {
      type: isAuthenticated ? 'AUTHENTICATED' : 'PUBLIC_REGISTRATION',
      hasToken,
      businessId: businessData?.businessId,
      businessCode: businessData?.businessCode
    })
    
    if (isAuthenticated) {
      // Flujo para owners autenticados
      await handle3DSAuthenticatedPayment()
    } else if (isRegistration) {
      // Flujo para registro público
      await handle3DSPublicPayment()
    } else {
      throw new Error('Configuración inválida para 3DS v2')
    }
  }

  // Método 3DS v2 para owners autenticados
  const handle3DSAuthenticatedPayment = async () => {
    console.log('🔐 3DS v2 AUTENTICADO para owner')
    
    try {
      // Si es renovación, usar endpoint directo de renovación
      if (isRenewal) {
        console.log('🔄 Procesando RENOVACIÓN de suscripción con 3DS')
        
        // Obtener token de autenticación
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No hay token de autenticación')
        }

        // Llamar al endpoint de renovación
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
        const response = await fetch(`${API_BASE_URL}/api/wompi/renew-subscription`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            businessId: businessData.businessId,
            planId: selectedPlan.id,
            amount: finalAmount,
            billingCycle: billingCycle
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `HTTP ${response.status}`)
        }

        const result = await response.json()
        console.log('✅ Renovación completada:', result)

        if (handleSuccess) {
          handleSuccess({
            success: true,
            transaction: result.data,
            method: 'RENEWAL_3DS'
          })
        }
        return
      }

      // Flujo normal de pago para suscripciones nuevas
      // Crear transacción 3DS v2 usando el hook
      const paymentData = {
          businessId: businessData.businessId,
          subscriptionId: selectedPlan.id,
          amount: finalAmount,
          currency: 'COP',
          description: `Pago de suscripción - ${planName} - ${billingCycle === 'YEARLY' ? 'Anual' : 'Mensual'}`,
        customerEmail: businessData.email || 'test@beautycontrol.com',
        paymentMethod: {
          type: 'CARD',
          installments: 1,
          card: {
            number: '4242424242424242', // Tarjeta Visa para 3DS testing
            cvc: '123',
            exp_month: '12',
            exp_year: '2025',
            card_holder: businessData.firstName || 'Test User'
          }
        }
      }

      console.log('� Creando pago 3DS v2...')
      const result = await createPayment(paymentData)
      console.log('📥 Respuesta 3DS v2:', result)

      const { transactionId, status, threeDsData } = result

      if (status === 'APPROVED') {
        // Pago aprobado directamente (sin challenge)
        console.log('✅ Pago 3DS aprobado directamente')
        if (handleSuccess) {
          handleSuccess({
            id: transactionId,
            reference: result.reference,
            status: 'APPROVED',
            method: '3DS_SUCCESS'
          })
        }
      } else if (status === 'PENDING_3DS' && threeDsData?.methodData) {
        // Requiere challenge 3DS
        console.log('🔐 Challenge 3DS requerido')
        await processChallenge(transactionId, threeDsData.methodData)
        
        // Iniciar polling del estado
        await pollTransactionStatus(transactionId, {
          onComplete: (finalResult) => {
            if (finalResult.status === 'APPROVED' && handleSuccess) {
              handleSuccess({
                id: transactionId,
                status: 'APPROVED',
                method: '3DS_CHALLENGE'
              })
            }
          },
          onError: (pollError) => {
            console.error('❌ Error en polling 3DS:', pollError)
            if (handleError) handleError(pollError)
          }
        })
      } else {
        throw new Error('Estado de transacción 3DS no manejado: ' + status)
      }
    } catch (error) {
      console.error('❌ Error en 3DS autenticado:', error)
      throw error
    }
  }

  // Método 3DS v2 para registro público
  const handle3DSPublicPayment = async () => {
    console.log('🌐 3DS v2 PÚBLICO para registro')
    
    try {
      // Obtener información del navegador para 3DS
      const browserInfo = getBrowserInfo()
      
      // Preparar datos completos del registro
      const registrationData = {
        businessData: {
          name: businessData.name,
          businessCode: businessData.businessCode,
          type: businessData.type,
          phone: businessData.phone,
          email: businessData.email,
          address: businessData.address,
          city: businessData.city,
          country: businessData.country || 'Colombia'
        },
        userData: {
          firstName: businessData.firstName || 'Test',
          lastName: businessData.lastName || 'User',
          email: businessData.email,
          password: businessData.password || 'TempPass123'
        }
      }
      
      // Datos para crear transacción 3DS pública
      const paymentData = {
        businessCode: businessData.businessCode,
        subscriptionPlanId: selectedPlan.id,
        customerEmail: businessData.email,
        amount: Math.round(finalAmount * 100), // Convertir a centavos
        currency: 'COP',
        description: `${isRenewal ? 'Renovación' : 'Registro'} suscripción - ${planName} - ${billingCycle === 'YEARLY' ? 'Anual' : 'Mensual'}`,
        cardToken: cardToken, // Token de la tarjeta
        acceptanceToken: acceptanceToken, // Token de aceptación
        browserInfo: browserInfo,
        threeDsAuthType: 'challenge_v2', // Para testing - valor correcto según documentación Wompi
        registrationData: registrationData
      }

      console.log('📤 Creando pago 3DS público:', paymentData)
      const result = await createPublicPayment(paymentData)
      console.log('📥 Respuesta 3DS público:', result)

      if (result.threeds?.challenge_required) {
        // Hay challenge 3DS - redirigir al usuario
        console.log('🔐 Challenge 3DS requerido - redirigiendo')
        if (result.next_steps?.url) {
          window.location.href = result.next_steps.url
        } else if (result.threeds?.iframe_url) {
          // Mostrar iframe de challenge
          console.log('📱 Mostrando iframe de challenge')
          // Aquí podrías mostrar el iframe en el UI
        }
      } else {
        // Sin challenge - iniciar polling
        console.log('⏳ Sin challenge - iniciando polling')
        setIsPolling(true) // Activar estado de polling
        try {
          const pollingResult = await pollPublicTransactionStatus(result.transaction.id)
          console.log('📊 Resultado del polling:', pollingResult)
          
          // Manejar resultado del polling
          if (pollingResult && pollingResult.transaction.status === 'APPROVED') {
            console.log('✅ Pago 3DS público aprobado - ejecutando handleSuccess')
            console.log('🔍 DEBUG pollingResult completo:', pollingResult)
            console.log('🔍 DEBUG business_creation:', pollingResult.business_creation)
            console.log('🔍 DEBUG business_creation.completed:', pollingResult.business_creation?.completed)
            
            if (handleSuccess) {
              handleSuccess({
                id: pollingResult.transaction.id,
                reference: pollingResult.transaction.reference,
                status: 'APPROVED',
                method: '3DS_PUBLIC_SUCCESS',
                businessCreated: pollingResult.business_creation?.completed || false,
                // Datos para autenticación automática
                business: pollingResult.business_creation?.business || null,
                user: pollingResult.business_creation?.user || null,
                token: pollingResult.business_creation?.token || null
              })
            }
          } else if (pollingResult && pollingResult.transaction.status === 'DECLINED') {
            console.log('❌ Pago 3DS público rechazado')
            throw new Error('Pago rechazado por el banco')
          }
        } finally {
          setIsPolling(false) // Desactivar estado de polling
        }
      }

    } catch (error) {
      console.error('❌ Error en 3DS público:', error)
      setIsPolling(false) // Asegurar que se desactive en caso de error
      throw error
    }
  }



  // Método simple fallback (para casos sin 3DS)
  const handleSimplePayment = async () => {
    try {
      // Paso 2: Generar referencia única
      const reference = `BC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const amountInCents = Math.round(finalAmount * 100)

      console.log('🎯 Datos del pago:', {
        reference,
        amountInCents,
        currency: config.currency,
        publicKey: config.publicKey
      })

      // Paso 2.5: Guardar datos del negocio en localStorage para payment-success
      if (businessData && selectedPlan) {
        const paymentData = {
          businessData,
          selectedPlan,
          reference,
          timestamp: Date.now()
        }
        localStorage.setItem('pendingBusinessCreation', JSON.stringify(paymentData))
        console.log('💾 Datos del negocio guardados en localStorage:', paymentData)
      }

      // Paso 3: Generar firma de integridad
      const signatureResponse = await fetch('http://localhost:3001/api/wompi/generate-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          amountInCents,
          currency: config.currency
        })
      })

      const signatureData = await signatureResponse.json()
      console.log('🔐 Firma generada:', signatureData)

      if (!signatureData.success) {
        throw new Error('Error generando firma')
      }

      // Crear el formulario HTML dinámicamente (método más simple)
      createWompiForm({
        publicKey: config.publicKey,
        currency: config.currency,
        amountInCents: amountInCents,
        reference: reference,
        signature: signatureData.signature,
        redirectUrl: `http://localhost:3000/payment-success?reference=${reference}`
      })

    } catch (err) {
      console.error('❌ Error:', err)
      setError('Error: ' + err.message)
    }
  }

  // Método más simple: crear formulario HTML y enviarlo
  const createWompiForm = (params) => {
    console.log('📝 Creando formulario con parámetros:', params)
    
    // Remover formulario anterior si existe
    const existingForm = document.getElementById('wompi-form')
    if (existingForm) {
      existingForm.remove()
    }

    // Crear nuevo formulario
    const form = document.createElement('form')
    form.id = 'wompi-form'
    form.action = 'https://checkout.wompi.co/p/'
    form.method = 'GET'
    form.target = '_blank' // Abrir en nueva ventana
    form.style.display = 'none'

    // Agregar campos obligatorios y opcionales
    const fields = {
      // Campos obligatorios según documentación oficial
      'public-key': params.publicKey,
      'currency': params.currency,
      'amount-in-cents': params.amountInCents,
      'reference': params.reference,
      'signature:integrity': params.signature,
      'redirect-url': params.redirectUrl
    }

    // Información básica del customer (opcional pero recomendada)
    fields['customer-data:email'] = 'test@beautycontrol.com'
    fields['customer-data:full-name'] = 'Usuario Prueba'
    fields['customer-data:phone-number'] = '3001234567'
    fields['customer-data:legal-id'] = '12345678'
    fields['customer-data:legal-id-type'] = 'CC'

    // Crear inputs
    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = name
      input.value = value
      form.appendChild(input)
    })

    // Agregar al DOM y enviar
    document.body.appendChild(form)
    console.log('🚀 Enviando formulario a Wompi...')
    form.submit()
    
    // Limpiar estado después de un momento
    setTimeout(() => {
      form.remove()
    }, 2000)
  }

  // Función para tokenizar tarjeta usando Wompi API
  const tokenizeCard = async (cardData) => {
    try {
      setIsTokenizing(true)
      console.log('🔑 Tokenizando tarjeta...')
      console.log('🔍 Datos de tarjeta a enviar:', {
        number: cardData.number ? '****' + cardData.number.slice(-4) : 'FALTANTE',
        cvc: cardData.cvc ? '***' : 'FALTANTE',
        exp_month: cardData.expMonth || 'FALTANTE',
        exp_year: cardData.expYear ? `${cardData.expYear} → ${String(cardData.expYear).slice(-2)}` : 'FALTANTE',
        card_holder: cardData.cardHolder || 'FALTANTE'
      })

      // Validar campos obligatorios
      if (!cardData.number || !cardData.cvc || !cardData.expMonth || !cardData.expYear || !cardData.cardHolder) {
        throw new Error('Todos los campos de la tarjeta son obligatorios')
      }

      // Usar sandbox para desarrollo
      const baseUrl = config?.environment === 'production' ? 'https://production.wompi.co' : 'https://sandbox.wompi.co'
      
      const tokenizationData = {
        number: cardData.number.replace(/\s/g, ''), // Remover espacios
        cvc: cardData.cvc,
        exp_month: cardData.expMonth.padStart(2, '0'), // Asegurar formato 2 dígitos
        exp_year: String(cardData.expYear).slice(-2), // Convertir a 2 dígitos (2025 → "25")
        card_holder: cardData.cardHolder.trim()
      }

      console.log('📤 Enviando a tokenización:', {
        url: `${baseUrl}/v1/tokens/cards`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.publicKey}`
        },
        body: {
          ...tokenizationData,
          number: '****' + tokenizationData.number.slice(-4), // Log solo últimos 4 dígitos
          exp_year: tokenizationData.exp_year + ' (2 dígitos)'
        }
      })

      const response = await fetch(`${baseUrl}/v1/tokens/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.publicKey}`
        },
        body: JSON.stringify(tokenizationData)
      })

      const result = await response.json()
      
      console.log('📥 Respuesta tokenización:', {
        status: response.status,
        statusText: response.statusText,
        result: result
      })
      
      if (!response.ok) {
        // Mostrar detalles específicos del error 422
        if (response.status === 422 && result.error?.messages) {
          const errorMessages = []
          Object.entries(result.error.messages).forEach(([field, messages]) => {
            errorMessages.push(`${field}: ${messages.join(', ')}`)
          })
          throw new Error(`Error de validación: ${errorMessages.join('; ')}`)
        }
        throw new Error(result.error?.message || `Error ${response.status}: ${response.statusText}`)
      }

      if (result.status === 'CREATED' && result.data?.id) {
        setCardToken(result.data.id)
        console.log('✅ Card token generado:', result.data.id)
        return result.data.id
      } else {
        throw new Error(result.error?.reason || 'Error al tokenizar tarjeta')
      }
    } catch (error) {
      console.error('❌ Error tokenizando tarjeta:', error)
      throw error
    } finally {
      setIsTokenizing(false)
    }
  }

  // Manejar envío del formulario de tarjeta
  const handleCardSubmit = async (event) => {
    event.preventDefault()
    
    try {
      const formData = new FormData(event.target)
      const cardData = {
        number: formData.get('cardNumber'),
        cvc: formData.get('cvc'),
        expMonth: formData.get('expMonth'),
        expYear: formData.get('expYear'),
        cardHolder: formData.get('cardHolder')
      }

      await tokenizeCard(cardData)
      setShowCardForm(false)
      
      // Intentar el pago nuevamente ahora que tenemos los tokens
      handlePayment()
    } catch (error) {
      setError('Error procesando tarjeta: ' + error.message)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">💳 Wompi - 3DS v2 & Simple</h3>
      
      <div className="space-y-4">
        <div>
          <strong>Estado:</strong>
          <div className="text-sm">
            <div className={`${config ? 'text-green-600' : loading ? 'text-yellow-600' : 'text-red-600'}`}>
              🔧 Config: {config ? 'Cargada' : loading ? 'Cargando...' : 'Error'}
            </div>
            <div className="text-gray-600">
              🌐 Método: {use3DS ? '3DS v2 + Fallback' : 'Solo Simple'}
            </div>
          </div>
        </div>

        {/* Toggle para habilitar/deshabilitar 3DS */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={use3DS}
              onChange={(e) => setUse3DS(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm font-medium">Usar 3D Secure v2</span>
          </label>
          <p className="text-xs text-blue-600 mt-1">
            {use3DS ? 'Pagos recurrentes seguros con autenticación 3DS' : 'Método tradicional de checkout'}
          </p>
        </div>

        {/* Formulario de tarjeta para 3DS v2 */}
        {showCardForm && (
          <div className="bg-white border border-gray-300 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-3">💳 Datos de la Tarjeta (Sandbox)</h4>
            <div className="text-xs text-blue-600 mb-3 p-2 bg-blue-50 rounded">
              💡 <strong>Tarjeta de prueba precargada:</strong> 4242424242424242 (recomendada para 3DS v2)
            </div>
            <form onSubmit={handleCardSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Número de tarjeta
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  defaultValue="4242424242424242"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  onChange={(e) => {
                    let value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
                    if (value.length <= 19) e.target.value = value
                  }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Mes
                  </label>
                  <select name="expMonth" defaultValue="12" required className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                    <option value="">MM</option>
                    {Array.from({length: 12}, (_, i) => (
                      <option key={i+1} value={String(i+1).padStart(2, '0')}>
                        {String(i+1).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Año
                  </label>
                  <select name="expYear" defaultValue="25" required className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                    <option value="">YY</option>
                    {Array.from({length: 10}, (_, i) => {
                      const year = new Date().getFullYear() + i
                      const shortYear = String(year).slice(-2)
                      return <option key={year} value={shortYear}>{shortYear} ({year})</option>
                    })}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    name="cvc"
                    defaultValue="123"
                    placeholder="123"
                    maxLength="4"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Titular
                  </label>
                  <input
                    type="text"
                    name="cardHolder"
                    defaultValue="Test User"
                    placeholder="Nombre completo"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isTokenizing}
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm font-medium disabled:bg-gray-400"
                >
                  {isTokenizing ? '🔄 Procesando...' : '✅ Confirmar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCardForm(false)}
                  className="flex-1 bg-gray-500 text-white py-2 px-3 rounded text-sm font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {config && (
          <div className="text-xs bg-gray-100 p-2 rounded">
            <strong>Configuración:</strong>
            <div>PublicKey: {config.publicKey}</div>
            <div>Currency: {config.currency}</div>
            <div>Environment: {config.environment}</div>
          </div>
        )}

        {/* Mostrar estado de tokens 3DS */}
        {use3DS && (
          <div className="text-xs bg-blue-50 p-2 rounded border border-blue-200">
            <strong>Estado 3DS v2:</strong>
            <div className={`${acceptanceToken ? 'text-green-600' : 'text-red-600'}`}>
              🔐 Acceptance Token: {acceptanceToken ? 'Disponible' : 'Cargando...'}
            </div>
            <div className={`${cardToken ? 'text-green-600' : 'text-red-600'}`}>
              💳 Card Token: {cardToken ? 'Disponible' : 'Requerido'}
            </div>
            {cardToken && acceptanceToken && (
              <div className="text-green-600 font-medium">✅ Listo para 3DS v2</div>
            )}
          </div>
        )}

        {/* Mostrar iframe de challenge si está disponible */}
        {hasChallenge && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">
              🔐 Challenge 3DS Activo
            </h4>
            <div id="challenge-container" className="bg-white rounded border">
              {/* El iframe se insertará aquí */}
            </div>
            <p className="text-xs text-yellow-600 mt-2">
              Completar la autenticación 3DS en el frame de arriba
            </p>
          </div>
        )}

        {hasTransaction && (
          <div className="text-xs bg-green-50 p-2 rounded border border-green-200">
            <strong>Transacción 3DS:</strong>
            <div>ID: {transactionData.transactionId}</div>
            <div>Estado: {transactionData.status}</div>
            <div className={`font-semibold ${
              isCompleted ? 'text-green-600' : 
              isDeclined ? 'text-red-600' : 
              isPending ? 'text-yellow-600' : 'text-gray-600'
            }`}>
              {isCompleted ? '✅ Aprobado' : 
               isDeclined ? '❌ Denegado' : 
               isPending ? '⏳ Pendiente' : '🔄 Procesando'}
            </div>
          </div>
        )}

        {(threeds_error || error || configError) && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
            <strong>Error:</strong> {threeds_error?.message || error || configError}
          </div>
        )}

        <div>
          <strong>Pago:</strong>
          <div className="text-sm text-gray-600 mb-2">
            Plan: {planName} - Monto: ${finalAmount.toLocaleString('es-CO')} COP
            {billingCycle === 'YEARLY' && (
              <span className="text-xs text-green-600 ml-2">
                (~${(finalAmount / 12).toLocaleString('es-CO')}/mes)
              </span>
            )}
          </div>
          
          {(loading || processing3DS) && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-blue-800 font-medium">
                  {processing3DS ? 'Procesando 3DS v2...' : loading ? 'Cargando configuración...' : use3DS ? 'Iniciando 3DS v2...' : 'Redirigiendo a Wompi...'}
                </span>
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {processing3DS ? 'Autenticación 3DS en progreso' : loading ? 'Obteniendo configuración Wompi' : use3DS ? 'Preparando pago seguro' : 'Se abrirá una nueva ventana con el checkout'}
              </div>
            </div>
          )}
          
          {/* DEBUG: Estado del botón */}
          <div className="text-xs bg-yellow-50 p-2 rounded mb-2 border border-yellow-200">
            <strong>🔍 DEBUG - Estado del botón:</strong>
            <div>Config: {config ? '✅ Disponible' : '❌ No disponible'}</div>
            <div>Loading: {loading ? '⏳ Cargando' : '✅ Listo'}</div>
            <div>Processing3DS: {processing3DS ? '🔄 Procesando' : '✅ Listo'}</div>
            <div>Botón habilitado: {(!config || loading || processing3DS || isPolling) ? '❌ NO' : '✅ SÍ'}</div>
          </div>

          <button
            onClick={() => {
              console.log('🎯 CLICK EN BOTÓN - Estado:', {
                config: !!config,
                loading,
                processing3DS,
                isPolling,
                disabled: !config || loading || processing3DS || isPolling
              })
              handlePayment()
            }}
            disabled={!config || loading || processing3DS || isPolling}
            className={`w-full py-3 px-4 rounded font-semibold transition-colors ${
              config && !loading && !processing3DS && !isPolling
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {(loading || processing3DS || isPolling) ? 
              (isPolling ? '⏳ Esperando aprobación...' : '🔄 Procesando...') 
              : `Pagar con Wompi (${use3DS ? '3DS v2' : 'Simple'})`
            }
          </button>
        </div>

        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <strong>📋 {use3DS ? 'Método 3DS v2' : 'Método Simple'}:</strong>
          {use3DS ? (
            <div>
              <div>• Pagos recurrentes con 3D Secure</div>
              <div>• Autenticación bancaria mejorada</div>
              <div>• Soporte para challenge iframe</div>
              <div>• Fallback automático a método simple</div>
            </div>
          ) : (
            <div>
              <div>• Usa formulario HTML estándar</div>
              <div>• Se abre en nueva ventana</div>
              <div>• Evita problemas de iframe</div>
              <div>• Más compatible con políticas de seguridad</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WompiWidgetMinimal